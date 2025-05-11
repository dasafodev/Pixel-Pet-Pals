import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getUserPosts } from '../../api';
import './UserPostsModal.css'; // We'll create this CSS file next
// Re-use PostCard and ImageModal from CommunityPage.js (or import if they were separate)

// Assuming PostCard and ImageModal are defined in CommunityPage.js or accessible globally.
// If not, they need to be imported or passed as props.
// For this example, let's assume they are passed or re-defined if necessary.
// To avoid circular dependencies or prop-drilling, it might be better to make PostCard a separate component.
// For now, we'll proceed as if PostCard is available.

// Placeholder for PostCard if not passed - ideally, import a shared PostCard component
const FallbackPostCard = ({ post }) => (
  <div className="post-card" style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
    <h4>{post.user?.name || 'Unknown User'}</h4>
    <p>{post.content}</p>
    {post.imageUrls && post.imageUrls.map((url, idx) => (
      <img key={idx} src={url} alt={`post ${idx}`} style={{ maxWidth: '100px', maxHeight: '100px', marginRight: '5px' }} />
    ))}
  </div>
);


const UserPostsModal = ({ isOpen, onClose, userId, userName, userAvatar, PostCardComponent, ImageModalComponent, onLikePostInModal, onOpenCommentsInModal, onDeletePostInModal }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const listRef = useRef(null);

  const ActualPostCard = PostCardComponent || FallbackPostCard;

  const fetchUserPosts = useCallback(async (userIdToFetch, pageToFetch) => {
    if (!userIdToFetch || isLoading) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getUserPosts(userIdToFetch, pageToFetch, 10); // API call
      if (data && data.length > 0) {
        setUserPosts(prev => pageToFetch === 1 ? data : [...prev, ...data]);
        setHasMore(data.length === 10);
        setPage(pageToFetch + 1);
      } else {
        setHasMore(false);
        if (pageToFetch === 1) setUserPosts([]);
      }
    } catch (err) {
      console.error("Error fetching user posts:", err);
      setError(err.message || 'Failed to fetch posts.');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // isLoading is intentionally omitted, guarded by the check inside.

  useEffect(() => {
    if (isOpen && userId) {
      // Reset state when modal opens for a new user
      setUserPosts([]);
      setPage(1);
      setHasMore(true);
      setSelectedImageUrl(null);
      fetchUserPosts(userId, 1);
    }
  }, [isOpen, userId, fetchUserPosts]);

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollHeight - scrollTop <= clientHeight + 50 && !isLoading && hasMore) { // 50px threshold
        fetchUserPosts(userId, page);
      }
    }
  };
  
  const handleImageClick = (url) => setSelectedImageUrl(url);
  const handleCloseImageModal = () => setSelectedImageUrl(null);

  if (!isOpen) return null;

  return (
    <div className="user-posts-modal-overlay" onClick={onClose}>
      <div className="user-posts-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="user-posts-modal-header">
          {userAvatar && <img src={userAvatar} alt={userName} className="header-avatar" />}
          <h2>{userName}'s Posts</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="user-posts-list" ref={listRef} onScroll={handleScroll}>
          {userPosts.length === 0 && !isLoading && <p className="empty-message">No posts found for this user.</p>}
          {userPosts.map(post => (
            <ActualPostCard 
              key={post._id || post.id} 
              post={post} 
              onImageClick={handleImageClick}
              onUserClick={() => {}} // Placeholder or pass down if needed for user profile clicks from modal
              onLikePost={onLikePostInModal}
              onOpenComments={onOpenCommentsInModal}
              onDeletePost={onDeletePostInModal}
            />
          ))}
          {isLoading && <p className="loading-message">Loading posts...</p>}
          {!isLoading && !hasMore && userPosts.length > 0 && <p className="end-message">No more posts.</p>}
        </div>
        {selectedImageUrl && ImageModalComponent && (
          <ImageModalComponent imageUrl={selectedImageUrl} onClose={handleCloseImageModal} />
        )}
      </div>
    </div>
  );
};

export default UserPostsModal;
