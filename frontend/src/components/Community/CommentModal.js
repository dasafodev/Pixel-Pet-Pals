import React, { useState, useEffect, useCallback } from 'react';
import { addCommentToPost, getPostById } from '../../api'; // Assuming getPostById fetches comments
import './CommentModal.css'; // We'll create this CSS file

const CommentModal = ({ isOpen, onClose, postId }) => {
  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const currentUserId = localStorage.getItem('userId');

  const fetchPostDetails = useCallback(async () => {
    if (!postId || !isOpen) return;
    setIsLoading(true);
    try {
      const fetchedPost = await getPostById(postId);
      setPost(fetchedPost);
      setError('');
    } catch (err) {
      console.error("Error fetching post details for comments:", err);
      setError('Failed to load comments.');
      setPost(null); // Clear previous post data on error
    } finally {
      setIsLoading(false);
    }
  }, [postId, isOpen]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    if (!postId) {
        setError('Post ID is missing.');
        return;
    }
    setError('');
    setIsLoading(true);
    try {
      const updatedPost = await addCommentToPost(postId, { text: newComment });
      setPost(updatedPost); // Update post with new comment list
      setNewComment(''); // Clear input
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(err.message || 'Failed to add comment.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="comment-modal-overlay" onClick={onClose}>
      <div className="comment-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Comments</h2>
        {isLoading && !post && <p>Loading comments...</p>}
        {error && <p className="error-message">{error}</p>}
        
        <div className="comments-list">
          {post && post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => (
              <div key={comment._id || comment.id} className="comment-item">
                <img 
                  src={comment.user?.avatar || `${process.env.PUBLIC_URL}/avatars/avatar_1.png`} // Prioritize user.avatar
                  alt={comment.user?.username || 'User'} 
                  className="comment-avatar"
                />
                <div className="comment-body">
                  <span className="comment-author">{comment.user?.username || 'Anonymous'}</span>
                  <p className="comment-text">{comment.text}</p>
                  <span className="comment-timestamp">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                {/* Add delete button if current user is comment author or post author */}
              </div>
            ))
          ) : (
            !isLoading && <p>Be the first to comment!</p>
          )}
        </div>

        <div className="add-comment-section">
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
            disabled={isLoading}
          />
          {/* Post Comment button moved to comment-modal-actions div below */}
        </div>
        <div className="comment-modal-actions">
          <button onClick={onClose} className="action-btn cancel-btn modal-close-btn">Close</button>
          <button onClick={handleAddComment} disabled={isLoading || !newComment.trim()} className="action-btn submit-comment-btn">
            {isLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
