// src/components/CommunityPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CommunityPage.css';
import AddPostModal from './AddPostModal';
import UserPostsModal from './UserPostsModal';
import CommentModal from './CommentModal'; // Import CommentModal
import { createPost, getAllPosts, toggleLikePost, addCommentToPost, getPostById } from '../../api'; // Added more API functions

// Import backgrounds and pet assets
import bg1 from '../../assets/friends_bg/bg_1.png';
import bg2 from '../../assets/friends_bg/bg_2.png';
import bg3 from '../../assets/friends_bg/bg_3.png';
import bg4 from '../../assets/friends_bg/bg_4.png';
import bg5 from '../../assets/friends_bg/bg_5.png';

// SVG Icons
const LikeIcon = () => (
  <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
    <path d="M9 2H5v2H3v2H1v6h2v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v-2h2v-2h2V6h-2V4h-2V2h-4v2h-2v2h-2V4H9V2zm0 2v2h2v2h2V6h2V4h4v2h2v6h-2v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2H3V6h2V4h4z"/>
  </svg>
);

const CommentIcon = () => (
  <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
    <path d="M4 2h18v16H6v2H4v-2h2v-2h14V4H4v18H2V2h2zm5 7H7v2h2V9zm2 0h2v2h-2V9zm6 0h-2v2h2V9z"/>
  </svg>
);

const CloseIcon = () => <span>❌</span>; // Keeping this as is for the ImageModal

// Helper to generate placeholder image URLs
// const createPlaceholderImageUrl = (index, size = "150") => // No longer needed if dummyPosts is removed
//   `https://via.placeholder.com/${size}/${Math.floor(Math.random()*16777215).toString(16)}/000000?Text=Img${index + 1}`;

// Dummy data for posts - REMOVED as posts are fetched from API
// const dummyPosts = [ ... ];

// CommunityPetDisplay Component (only one pet)
const CommunityPetDisplay = () => {
  const BACKGROUNDS = [bg1, bg2, bg3, bg4, bg5];
  const PETS = [
    process.env.PUBLIC_URL + '/pets/pet_1.png',
    process.env.PUBLIC_URL + '/pets/pet_2.png',
    process.env.PUBLIC_URL + '/pets/pet_3.png',
    process.env.PUBLIC_URL + '/pets/pet_4.png',
    process.env.PUBLIC_URL + '/pets/pet_5.png'
  ];

  const [bgIndex, setBgIndex] = useState(0);
  const [petIndex, setPetIndex] = useState(0);

  const handleChangeBg = () => setBgIndex((i) => (i + 1) % BACKGROUNDS.length);
  const handleChangePet = () => setPetIndex((i) => (i + 1) % PETS.length);

  return (
    <div className="left-panel">
      <div
        className="pet-area"
        style={{
          backgroundImage: `url(${BACKGROUNDS[bgIndex]})`,
          position: 'relative'
        }}
      >
        <img
          src={PETS[petIndex]}
          alt="your pet"
          style={{
            position: 'absolute',
            bottom: '15px',
            left: '50%',            // 起点在父容器水平中点
            transform: 'translateX(-50%)', // 向左移自身宽度的一半，实现水平居中
            width: '40%',
            height: 'auto',
            zIndex: 2,
            imageRendering: 'pixelated'
          }}
        />
      </div>
      <div className="buttons">
        <button onClick={handleChangeBg}>Change BG</button>
        <button onClick={handleChangePet}>Change Pet</button>
      </div>
    </div>
  );
};

// ImageModal Component
const ImageModal = ({ imageUrl, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Enlarged post content" />
        <button className="image-modal-close-btn" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

// PostCard Component
const PostCard = ({ post, onImageClick, onUserClick, onLikePost, onOpenComments }) => { // Added onOpenComments
  const imagesToDisplay = post.imageUrls ? post.imageUrls.slice(0, 9) : [];
  const user = post.user || {};
  const currentUserId = localStorage.getItem('userId');

  const handleUserClick = () => {
    if (user._id) {
      onUserClick(user._id, user.username, user.avatar || user.petAvatar);
    }
  };

  const handleLike = () => {
    if (post._id && onLikePost) {
      onLikePost(post._id);
    }
  };

  const handleOpenComments = () => {
    if (post._id && onOpenComments) {
      onOpenComments(post._id);
    }
  };

  const isLikedByCurrentUser = post.likes && Array.isArray(post.likes) ? post.likes.some(like => (typeof like === 'string' ? like === currentUserId : like._id === currentUserId)) : false;

  return (
    <div className="post-card">
      <img
        src={user.avatar || user.petAvatar || `${process.env.PUBLIC_URL}/avatars/avatar_1.png`}
        alt={user.username || 'Unknown User'}
        className="post-avatar"
        onClick={handleUserClick}
        style={{ cursor: 'pointer' }}
      />
      <div className="post-content-area">
        <div
          className="post-author-name"
          onClick={handleUserClick}
          style={{ cursor: 'pointer' }}
        >
          {user.username || 'Unknown User'}
        </div>
        <p className="post-text">{post.content}</p>
        {imagesToDisplay.length > 0 && (
          <div className={`post-images-container images-count-${imagesToDisplay.length}`}>
            {imagesToDisplay.map((url, idx) => {
              const imageUrl = url.startsWith('http') || url.startsWith('blob:') ? url : `${process.env.REACT_APP_API_URL_BASE || 'http://localhost:5001'}${url}`;
              return (
                <img
                  key={idx}
                  src={imageUrl}
                  alt={`Post thumbnail ${idx + 1}`}
                  className="post-image-item"
                  onClick={() => onImageClick(imageUrl)}
                />
              );
            })}
          </div>
        )}
        <div className="post-footer">
          <div className="interaction-group">
            <button onClick={handleLike} className={`interaction-button ${isLikedByCurrentUser ? 'liked' : ''}`}>
              <LikeIcon /> <span>{post.likes ? post.likes.length : 0}</span>
            </button>
            <button onClick={handleOpenComments} className="interaction-button">
              <CommentIcon /> <span>{post.comments ? post.comments.length : 0}</span>
            </button>
          </div>
          <div className="post-timestamp">{post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now'}</div>
        </div>
      </div>
    </div>
  );
};

// CommunityFeedPanel Component
const CommunityFeedPanel = ({ openAddPostModal, posts, isLoading, hasMorePosts, loadMorePosts, handleImageClick, handleUserClick, handleLikePostInFeed, handleOpenCommentsInFeed, handleSearchInputChange, searchTerm, handleSearchSubmit, handleClearSearch, isSearchActive }) => { // Added clear search and active status
  const postListRef = useRef(null);

   useEffect(() => {
    const el = postListRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100 && !isLoading && hasMorePosts) {
        loadMorePosts();
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [loadMorePosts, isLoading, hasMorePosts]);

  return (
    <div className="community-feed-panel">
      <div className="feed-header"><h2>Community Pub</h2></div>
      <div className="feed-toolbar">
        <input 
          type="text"
          placeholder="Search posts..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearchInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
        />
        <button className="action-btn search-btn" onClick={handleSearchSubmit}>Search</button>
        {isSearchActive && (
          <button className="action-btn clear-search-btn" onClick={handleClearSearch}>Clear</button>
        )}
        <button className="action-btn add-post-btn" onClick={openAddPostModal}>Post</button>
      </div>
      <div className="post-list" ref={postListRef}>
        {posts.map((p) => (
          <PostCard 
            key={p._id || p.id} 
            post={p} 
            onImageClick={handleImageClick} 
            onUserClick={handleUserClick}
            onLikePost={handleLikePostInFeed}
            onOpenComments={handleOpenCommentsInFeed} // Pass comment modal handler
          />
        ))}
        {posts.length === 0 && !isLoading && <div className="empty-state">No posts yet. Be the first to post!</div>}
        {isLoading && <div className="loading-indicator">Loading more posts...</div>}
        {!isLoading && !hasMorePosts && posts.length > 0 && <div className="end-of-feed">No more posts.</div>}
      </div>
    </div>
  );
};

// Main CommunityPage Component
const CommunityPage = () => {
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [hasMoreFeedPosts, setHasMoreFeedPosts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const [isUserPostsModalOpen, setIsUserPostsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [selectedUserAvatar, setSelectedUserAvatar] = useState('');

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentModalPostId, setCommentModalPostId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false); // To track if a search is currently applied

  const fetchPosts = useCallback(async (pageToFetch, termToSearch = '') => {
    // If it's a new search (termToSearch is provided explicitly), reset page to 1
    const actualPageToFetch = (termToSearch && termToSearch !== '' && pageToFetch !== 1) ? 1 : pageToFetch;
    
    if (isLoadingFeed && actualPageToFetch !== 1 && termToSearch === searchTerm) return; // Avoid refetch if loading more of same search
    setIsLoadingFeed(true);
    try {
      const data = await getAllPosts(actualPageToFetch, 10, termToSearch);
      
      if (data && data.posts) {
        setPosts(prev => (actualPageToFetch === 1) ? data.posts : [...prev, ...data.posts]);
        setHasMoreFeedPosts(data.currentPage < data.totalPages);
        setCurrentPage(actualPageToFetch + 1);
        setIsSearchActive(!!termToSearch); // Set search active if term is present
      } else {
        setHasMoreFeedPosts(false);
        if (actualPageToFetch === 1) setPosts([]);
        setIsSearchActive(!!termToSearch);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setHasMoreFeedPosts(false);
    } finally {
      setIsLoadingFeed(false);
    }
  }, [isLoadingFeed, searchTerm]); // Keep searchTerm to allow fetchPosts to use the latest if called without explicit term

  // Initial fetch
  useEffect(() => {
    fetchPosts(1, ''); // Fetch all posts initially
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1); 
    fetchPosts(1, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchPosts(1, ''); // Fetch all posts
  };

  const handleAddPost = async (formData) => {
    try {
      const newPost = await createPost(formData);
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setIsAddPostModalOpen(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert(error.message || 'Failed to create post.');
    }
  };

  const handleImageClickInFeed = (url) => setSelectedImageUrl(url);
  const handleCloseImageModal = () => setSelectedImageUrl(null);

  const openUserPostsView = (userId, userName, userAvatar) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedUserAvatar(userAvatar);
    setIsUserPostsModalOpen(true);
  };

  const handleLikePostInFeed = async (postId) => {
    try {
      const updatedPost = await toggleLikePost(postId);
      setPosts(prevPosts =>
        prevPosts.map(p => p._id === postId ? updatedPost : p)
      );
    } catch (error) {
      console.error("Error liking post:", error);
      alert(error.message || "Failed to like post.");
    }
  };

  const handleOpenCommentsInFeed = (postId) => {
    setCommentModalPostId(postId);
    setIsCommentModalOpen(true);
  };

  const handleCloseCommentModal = async (updatedPostId) => {
    setIsCommentModalOpen(false);
    setCommentModalPostId(null);
    // If a comment was added/deleted, the modal might pass back the updated post ID
    // or we might need to refetch the specific post to update its comment count in the feed.
    // For simplicity now, we'll just close. A more robust solution would update the specific post.
    if (updatedPostId) {
        try {
            const refreshedPost = await getPostById(updatedPostId);
            setPosts(prevPosts => 
                prevPosts.map(p => p._id === updatedPostId ? refreshedPost : p)
            );
        } catch (error) {
            console.error("Error refreshing post after comment modal close:", error);
        }
    }
  };

  return (
    <div className="community-page-main-content">
      <CommunityPetDisplay />
      <CommunityFeedPanel
        openAddPostModal={() => setIsAddPostModalOpen(true)}
        posts={posts}
        isLoading={isLoadingFeed}
        hasMorePosts={hasMoreFeedPosts}
        loadMorePosts={() => fetchPosts(currentPage, isSearchActive ? searchTerm : '')}
        handleImageClick={handleImageClickInFeed}
        handleUserClick={openUserPostsView}
        handleLikePostInFeed={handleLikePostInFeed}
        handleOpenCommentsInFeed={handleOpenCommentsInFeed}
        handleSearchInputChange={handleSearchInputChange}
        searchTerm={searchTerm}
        handleSearchSubmit={handleSearchSubmit}
        handleClearSearch={handleClearSearch} // Pass clear search handler
        isSearchActive={isSearchActive} // Pass search active status
      />
      <AddPostModal
        isOpen={isAddPostModalOpen}
        onClose={() => setIsAddPostModalOpen(false)}
        onAddPost={handleAddPost}
      />
      {selectedImageUrl && <ImageModal imageUrl={selectedImageUrl} onClose={handleCloseImageModal} />}
      
      <UserPostsModal
        isOpen={isUserPostsModalOpen}
        onClose={() => setIsUserPostsModalOpen(false)}
        userId={selectedUserId}
        userName={selectedUserName}
        userAvatar={selectedUserAvatar}
        PostCardComponent={PostCard}
        ImageModalComponent={ImageModal}
        onLikePostInModal={handleLikePostInFeed} 
        onOpenCommentsInModal={handleOpenCommentsInFeed} // Pass handler
      />
      {isCommentModalOpen && commentModalPostId && ( // Check commentModalPostId
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => handleCloseCommentModal(commentModalPostId)}
          postId={commentModalPostId}
        />
      )}
    </div>
  );
};

export default CommunityPage;
