// src/components/CommunityPage.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CommunityPage.css';
import AddPostModal from './AddPostModal';
import UserPostsModal from './UserPostsModal';
import CommentModal from './CommentModal';
import ConfirmationModal from './ConfirmationModal'; // Import ConfirmationModal
import { createPost, getAllPosts, toggleLikePost, addCommentToPost, getPostById, deletePost } from '../../api';

// Import backgrounds and pet assets
import bg1 from '../../assets/friends_bg/bg_1.png';
import bg2 from '../../assets/friends_bg/bg_2.png';
import bg3 from '../../assets/friends_bg/bg_3.png';
import bg4 from '../../assets/friends_bg/bg_4.png';
import bg5 from '../../assets/friends_bg/bg_5.png';

// SVG Icons
const LikeIcon = () => (
  <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
    <path d="M9 2H5v2H3v2H1v6h2v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v-2h2V6h-2V4h-2V2h-4v2h-2v2h-2V4H9V2zm0 2v2h2v2h2V6h2V4h4v2h2v6h-2v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2H3V6h2V4h4z"/>
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

// SVG Icons for Delete and Refresh
const DeleteIcon = () => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
    <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor"/>
  </svg>
);

const RefreshIcon = () => (
  <svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
    <path d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 10.874352 21.745922 9.8043041 21.298828 8.8300781 L 19.857422 9.3496094 C 20.189974 10.160091 20.378906 11.051801 20.378906 12 C 20.378906 16.601029 16.601029 20.378906 12 20.378906 C 7.3989709 20.378906 3.6210938 16.601029 3.6210938 12 C 3.6210938 7.3989709 7.3989709 3.6210938 12 3.6210938 C 13.694936 3.6210938 15.219221 4.1600942 16.480469 5.0507812 L 16.480469 2 L 20.480469 5.5 L 16.480469 9 L 16.480469 6.2792969 C 15.422791 5.5539058 14.078773 5.1367188 12.619141 5.1367188 C 12.410041 5.1367187 12.203125 5.1518555 12 5.15625 C 8.2480146 5.15625 5.15625 8.2480146 5.15625 12 C 5.15625 12.198596 5.1701076 12.393203 5.1855469 12.583984 L 3.7050781 12.183594 C 3.6583405 11.280311 3.6210938 10.451018 3.6210938 9.7011719 L 5.53125 9.7011719 C 5.53125 10.735172 5.7611136 11.583984 5.7617188 11.583984 L 7.2304688 11.173828 C 7.1854001 10.300806 7.1484375 9.2734375 7.1484375 8.5195312 L 9.0625 8.5195312 C 9.0625 9.5415313 9.2837839 10.380859 9.2890625 10.380859 L 10.761719 9.9726562 C 10.714699 9.0896563 10.671875 8.25 10.671875 7.5839844 L 12.585938 7.5839844 C 12.585938 8.1069844 12.532101 8.7578125 12.53125 8.7578125 L 12.53125 8.7597656 C 12.53125 8.7597656 12.53125 8.7597656 12.53125 8.7597656 C 13.30625 8.7597656 14.125 9.0625 14.125 9.0625 L 15.232422 8.28125 C 14.619422 7.90125 13.71875 7.5839844 12.585938 7.5839844 L 12.585938 7.5820312 C 12.585938 7.5820312 12.585938 7.5820312 12.585938 7.5820312 C 11.514937 7.5820312 10.714844 8.0625 10.714844 8.0625 L 9.6152344 7.2753906 C 10.281234 6.7833906 11.289062 6.15625 12.619141 6.15625 C 14.078773 6.15625 15.422791 6.5734375 16.480469 7.2988281 L 16.480469 9 L 20.480469 5.5 L 16.480469 2 L 12 2 z"/>
  </svg>
);

// Utility function to get the correct avatar image URL for user avatars in posts.
// Ensures avatars always load from the frontend's static assets (public/avatars),
// preventing 404 errors that occur if the backend domain is used.
const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return `${process.env.PUBLIC_URL}/avatars/avatar_1.png`;
  return avatarPath.startsWith('/')
    ? process.env.PUBLIC_URL + avatarPath
    : avatarPath;
};

// PostCard Component
const PostCard = ({ post, onImageClick, onUserClick, onLikePost, onOpenComments, onDeletePost }) => { // Added onDeletePost
  const imagesToDisplay = post.imageUrls ? post.imageUrls.slice(0, 9) : [];
  const user = post.user || {};
  const currentUserId = localStorage.getItem('userId');
  // Ensure user and user._id exist and compare as strings
  const isCurrentUserPost = user && user._id && String(user._id) === currentUserId;

  const handleUserClick = () => {
    if (user._id) {
      // Prioritize user.avatar, fallback to petAvatar only if avatar is missing, then to default.
      const avatarToUse = user.avatar || user.petAvatar; 
      onUserClick(user._id, user.username, avatarToUse);
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

  const isLikedByCurrentUser = post.likes && Array.isArray(post.likes) ? post.likes.some(likeId => String(likeId) === currentUserId) : false;

  return (
    <div className="post-card">
      <img
        // Always use getAvatarUrl to ensure avatars load from the correct location
        src={getAvatarUrl(user.avatar)}
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
            {isCurrentUserPost && onDeletePost && (
              <button onClick={() => onDeletePost(post._id)} className="interaction-button delete-button">
                <DeleteIcon />
              </button>
            )}
          </div>
          <div className="post-timestamp">{post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now'}</div>
        </div>
      </div>
    </div>
  );
};

// CommunityFeedPanel Component
const CommunityFeedPanel = ({ openAddPostModal, posts, isLoading, hasMorePosts, loadMorePosts, handleImageClick, handleUserClick, handleLikePostInFeed, handleOpenCommentsInFeed, handleDeletePostInFeed, handleSearchInputChange, searchTerm, handleSearchSubmit, handleClearSearch, isSearchActive, onRefreshPosts }) => { // Added onRefreshPosts
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
        <button className="action-btn refresh-btn" onClick={onRefreshPosts} title="Refresh Posts">
          <RefreshIcon />
        </button>
      </div>
      <div className="post-list" ref={postListRef}>
        {posts.map((p) => (
          <PostCard 
            key={p._id || p.id} 
            post={p} 
            onImageClick={handleImageClick} 
            onUserClick={handleUserClick}
            onLikePost={handleLikePostInFeed}
            onOpenComments={handleOpenCommentsInFeed}
            onDeletePost={handleDeletePostInFeed} // Pass delete handler
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
  const [isSearchActive, setIsSearchActive] = useState(false); 
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);

  const fetchPosts = useCallback(async (pageToFetch, termToSearch = '', isRefresh = false) => {
    // If it's a new search (termToSearch is provided explicitly) or a refresh, reset page to 1
    const actualPageToFetch = (termToSearch && termToSearch !== '' && pageToFetch !== 1) || isRefresh ? 1 : pageToFetch;
    
    if (isLoadingFeed && actualPageToFetch !== 1 && termToSearch === searchTerm && !isRefresh) return; // Avoid refetch if loading more of same search unless it's a refresh
    setIsLoadingFeed(true);
    try {
      const data = await getAllPosts(actualPageToFetch, 10, termToSearch);
      
      if (data && data.posts) {
        setPosts(prev => (actualPageToFetch === 1 || isRefresh) ? data.posts : [...prev, ...data.posts]);
        setHasMoreFeedPosts(data.currentPage < data.totalPages);
        setCurrentPage(actualPageToFetch + 1); // Always set current page based on what was fetched
        setIsSearchActive(!!termToSearch); // Set search active if term is present
      } else {
        setHasMoreFeedPosts(false);
        if (actualPageToFetch === 1 || isRefresh) setPosts([]);
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
    fetchPosts(1, '', true); // Fetch all posts initially, isRefresh = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleRefreshPosts = () => {
    fetchPosts(1, searchTerm, true); // Refresh current view (search or all)
  };

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

  const handleDeletePostInFeed = async (postId) => {
    setPostIdToDelete(postId);
    setIsConfirmModalOpen(true);
  };

  const confirmDeletePost = async () => {
    if (postIdToDelete) {
      try {
        await deletePost(postIdToDelete);
        setPosts(prevPosts => prevPosts.filter(p => p._id !== postIdToDelete));
      } catch (error) {
        console.error("Error deleting post:", error);
        alert(error.message || "Failed to delete post.");
      } finally {
        setIsConfirmModalOpen(false);
        setPostIdToDelete(null);
      }
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
        handleDeletePostInFeed={handleDeletePostInFeed}
        handleSearchInputChange={handleSearchInputChange}
        searchTerm={searchTerm}
        handleSearchSubmit={handleSearchSubmit}
        handleClearSearch={handleClearSearch}
        isSearchActive={isSearchActive}
        onRefreshPosts={handleRefreshPosts} // Pass refresh handler
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
        onOpenCommentsInModal={handleOpenCommentsInFeed}
        onDeletePostInModal={handleDeletePostInFeed} 
      />
      {isCommentModalOpen && commentModalPostId && (
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={() => handleCloseCommentModal(commentModalPostId)}
          postId={commentModalPostId}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setPostIdToDelete(null);
        }}
        onConfirm={confirmDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </div>
  );
};

export default CommunityPage;
