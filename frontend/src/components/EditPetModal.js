import React, { useState, useEffect } from 'react';
import { updatePetDetails } from '../api';

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#fefae0',
  padding: '30px',
  borderRadius: '10px',
  border: '3px solid #000',
  boxShadow: '5px 5px 0px #000',
  zIndex: 1000,
  width: '400px',
  fontFamily: "'Press Start 2P'",
  color: '#333',
  maxHeight: '90vh', // Prevent modal from being too tall
  overflowY: 'auto', // Add scroll for tall content
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  zIndex: 999,
};

const inputStyle = {
  width: 'calc(100% - 20px)',
  padding: '10px',
  marginBottom: '15px',
  border: '2px solid #000',
  borderRadius: '5px',
  fontFamily: "'Press Start 2P'",
  fontSize: '12px',
};

const textareaStyle = {
  ...inputStyle,
  height: '80px',
  resize: 'none',
};

const buttonStyle = {
  padding: '10px 15px',
  backgroundColor: '#8ecae6',
  border: '3px solid #000',
  borderRadius: '5px',
  fontFamily: "'Press Start 2P'",
  fontSize: '12px',
  cursor: 'pointer',
  boxShadow: '2px 2px 0px #000',
  marginRight: '10px',
  transition: 'background-color 0.2s, transform 0.2s',
};

const closeButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#f4978e',
  marginLeft: 0, // Remove marginRight for the last button
};

// Removed userId from props, it's not directly used by updatePetDetails call signature
function EditPetModal({ show, onClose, petData, onPetUpdate }) {
  const [name, setName] = useState('');
  const [toys, setToys] = useState(''); // Storing toys as a comma-separated string for now
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (petData) {
      setName(petData.name || '');
      // Assuming petData.toys is an array of strings. Join for input, split for submission.
      setToys(Array.isArray(petData.toys) ? petData.toys.join(', ') : '');
      setBio(petData.bio || '');
    }
  }, [petData]);

  if (!show) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const toysArray = toys.split(',').map(toy => toy.trim()).filter(toy => toy); // Convert string to array

    try {
      // Pass an object with name, toys, bio to updatePetDetails
      const response = await updatePetDetails({ name, toys: toysArray, bio }); 
      if (response.success) {
        if (onPetUpdate) onPetUpdate(); // Refresh user data on Home page
        onClose();     // Close modal
      } else {
        setError(response.message || 'Failed to update pet details.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h2 style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'center' }}>Edit Your Pet</h2>
        {error && <p style={{ color: 'red', fontSize: '10px', marginBottom: '10px' }}>Error: {error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="petName" style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Pet Name:</label>
            <input
              type="text"
              id="petName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label htmlFor="petToys" style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Pet Toys (comma-separated):</label>
            <input
              type="text"
              id="petToys"
              value={toys}
              onChange={(e) => setToys(e.target.value)}
              style={inputStyle}
              placeholder="e.g., yarn, bone, ball"
            />
          </div>
          <div>
            <label htmlFor="petBio" style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Pet Bio:</label>
            <textarea
              id="petBio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={textareaStyle}
            />
          </div>
          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={closeButtonStyle}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#d77a6e'; e.currentTarget.style.transform = 'translateY(-1px)';}}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f4978e'; e.currentTarget.style.transform = 'translateY(0)';}}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={buttonStyle}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#6db5d9'; e.currentTarget.style.transform = 'translateY(-1px)';}}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#8ecae6'; e.currentTarget.style.transform = 'translateY(0)';}}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditPetModal;
