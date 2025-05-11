import React, { useState, useRef } from 'react';
import './AddPostModal.css'; // We'll create this CSS file next

const AddPostModal = ({ isOpen, onClose, onAddPost }) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + selectedFiles.length > 9) {
      setError('You can upload a maximum of 9 images.');
      // Clear the file input so the user can try again if they selected too many at once
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    setError('');

    const newFiles = files.slice(0, 9 - selectedFiles.length); // Ensure total doesn't exceed 9
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  const removeImage = (indexToRemove) => {
    // Revoke the specific Object URL before updating the state
    if (imagePreviews[indexToRemove]) {
      URL.revokeObjectURL(imagePreviews[indexToRemove]);
    }

    const newSelectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
    setSelectedFiles(newSelectedFiles);

    const newImagePreviews = imagePreviews.filter((_, index) => index !== indexToRemove);
    setImagePreviews(newImagePreviews);
    
    // If all files are removed, or if the input was used to select the removed file, clear it.
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    setError(''); // Clear any previous errors related to file count
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) {
      setError('Please add some content or at least one image.');
      return;
    }
    setError('');

    const formData = new FormData();
    formData.append('content', content);
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    await onAddPost(formData); // This function will be passed from CommunityPage
    // Reset form after submission (or if onAddPost handles closing)
    setContent('');
    setSelectedFiles([]);
    // Clean up object URLs after successful submission
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    setImagePreviews([]);
    setSelectedFiles([]);
    setContent('');
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    // Parent component (CommunityPage) will call onClose if submission is successful
  };

  const handleClose = () => {
    // Clean up object URLs when closing modal without submitting
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    setImagePreviews([]);
    setSelectedFiles([]);
    setContent('');
    setError('');
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-post-modal-overlay">
      <div className="add-post-modal-content">
        <h2>Create New Post</h2>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="4"
        />
        <div className="image-upload-section">
          <label htmlFor="post-images-input" className="action-btn upload-btn">
            Add Photos/Videos (Max 9)
          </label>
          <input
            id="post-images-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          {error && <p className="error-message">{error}</p>}
          <div className="image-previews">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="image-preview-item">
                <img src={preview} alt={`preview ${index}`} />
                <button onClick={() => removeImage(index)} className="remove-image-btn">×</button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={handleClose} className="action-btn cancel-btn">Cancel</button>
          <button onClick={handleSubmit} className="action-btn submit-btn">Post</button>
        </div>
      </div>
    </div>
  );
};

export default AddPostModal;
