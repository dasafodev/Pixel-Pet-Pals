// FriendProfile.js
import React from 'react';

function FriendProfile({ friend, onBack, isCurrentUser = false }) { // Added isCurrentUser prop
  if (!friend) return null;

  const profileTitle = isCurrentUser ? "Your Profile" : (friend.username ? `${friend.username}'s` : "Friend's") + " Profile";
  // For current user, display their main avatar. For friends, display their petAvatar as before.
  const avatarSrc = isCurrentUser ? friend.avatar : friend.petAvatar;
  const altText = `${friend.username || (isCurrentUser ? 'Your' : 'Friend')}'s avatar`;
  
  return (
    <div style={{ 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      // Removed fixed height to allow content to define height, especially for modal view
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <h2>{profileTitle}</h2>
        <button
          onClick={onBack} 
          style={{
            backgroundColor: '#8ecae6',
            fontFamily: "'Press Start 2P'",
            fontSize: '10px',
            padding: '8px',
            border: '3px solid #000',
            cursor: 'pointer',
            boxShadow: '2px 2px 0px #000',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#6db5d9';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#8ecae6';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Back
        </button>
      </div>
      
      <div style={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '20px',
        padding: '20px',
        border: '3px solid #000',
        backgroundColor: '#fff',
        flex: 1, 
        overflowY: 'auto' 
      }}>
        {avatarSrc ? (
          <img 
            src={`${process.env.PUBLIC_URL}${avatarSrc}`} 
            alt={altText} 
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'cover', // Ensures the image covers the area, might crop
              border: '3px solid #000',
              borderRadius: '8px',
              backgroundColor: '#fefae0', // Fallback background
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        ) : (
          <div style={{
            fontSize: '24px', // Adjusted for placeholder text
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fefae0',
            border: '3px solid #000',
            borderRadius: '8px',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >
            No Avatar
          </div>
        )}
        
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ 
            borderBottom: '2px dashed #000', 
            paddingBottom: '10px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          >
            <h3 style={{ fontSize: '12px', marginBottom: '5px' }}>Pet Name</h3>
            <p style={{ fontSize: '12px' }}>{friend.petName}</p>
          </div>
          
          {/* Pet Toys - Display for both friend and current user if available */}
          {(friend.petToys && friend.petToys.length > 0) || !isCurrentUser ? ( // Show if friend or if current user has toys
            <div style={{ borderBottom: '2px dashed #000', paddingBottom: '10px', transition: 'background-color 0.2s' }}
                 onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                 onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <h3 style={{ fontSize: '12px', marginBottom: '5px' }}>Pet Toys</h3>
              <p style={{ fontSize: '12px' }}>
                {/* For friends, show static emojis. For current user, show their actual petToys */}
                {isCurrentUser ? (friend.petToys && friend.petToys.join(', ')) : '🧶 🦴 🪀'}
              </p>
            </div>
          ) : null}
          
          {/* Bio - Display for both friend and current user if available */}
          {friend.bio || !isCurrentUser ? ( // Show if friend or if current user has bio
            <div style={{ borderBottom: '2px dashed #000', paddingBottom: '10px', transition: 'background-color 0.2s' }}
                 onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                 onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
              <h3 style={{ fontSize: '12px', marginBottom: '5px' }}>Bio</h3>
              <p style={{ fontSize: '12px', lineHeight: '1.5' }}>{friend.bio}</p>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
}

export default FriendProfile;
