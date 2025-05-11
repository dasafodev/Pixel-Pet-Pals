// FriendsList.js
import React, { useState } from 'react'; 
// import friendsData from './friendsData'; // Remove static data import
import SearchFriendModal from './SearchFriendModal'; 
import { useHistory } from 'react-router-dom';

// Accept friends list, refresh function, and unread counts as props
function FriendsList({ friends, refreshFriends, unreadCounts, onSelectFriend, onChatFriend }) { 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  // const [friends, setFriends] = useState(friendsData); // Remove local state for friends
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); 
  const history = useHistory(); // 新增

  // Filter friends prop based on search term
  const filteredFriends = (friends || []).filter(friend => 
    friend.username.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by username
    friend.petName.toLowerCase().includes(searchTerm.toLowerCase())    // Search by petName
  );

  // Handle friend selection with blue highlight effect
  const handleSelectFriend = (friend) => {
    setSelectedFriendId(friend._id); // Use _id from API data
    onSelectFriend(friend);
  };

  return (
    <div className="friends-list">
      <h2>Friends</h2>
      
      {/* Search and Add Friend Section */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        {/* Restore search input */}
        <input 
          type="text" 
          placeholder="Search current friends..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            border: '3px solid #000',
            fontFamily: "'Press Start 2P'",
            fontSize: '10px'
          }}
        />
        <button 
          onClick={() => setIsSearchModalOpen(true)} // Button ONLY opens the modal
          style={{
            backgroundColor: '#8ecae6',
            fontFamily: "'Press Start 2P'",
            fontSize: '10px',
            padding: '10px',
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
          Add Friend
        </button>
      </div>
      
      {/* Friends List */}
      <div style={{
        border: '3px solid #000',
        backgroundColor: '#fff',
        padding: '10px',
        // minHeight: '100px', // Remove minHeight
        maxHeight: '300px',
        overflowY: 'auto',
        // position: 'relative' // Remove relative positioning
      }}>
        {/* Use filteredFriends (from props) for rendering */}
        {filteredFriends.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', fontFamily: "'Press Start 2P'", fontSize: '10px' }}>
            {searchTerm ? 'No friends match your search.' : 'No friends yet. Click "Add Friend" to find some!'}
          </p>
        ) : (
          filteredFriends.map(friend => (
            <div 
              key={friend._id} // Use _id from API data
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '2px solid #000',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: selectedFriendId === friend._id ? '#d0ebff' : 'transparent' // Use _id
              }}
              onMouseOver={(e) => {
                if (selectedFriendId !== friend._id) { // Use _id
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }
              }}
              onMouseOut={(e) => {
                if (selectedFriendId !== friend._id) { // Use _id
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, position: 'relative' }}
                onClick={() => handleSelectFriend(friend)}
              >
                {/* Use avatar from API data, fallback to default */}
                <img 
                  src={friend.avatar ? `${process.env.PUBLIC_URL}${friend.avatar}` : `${process.env.PUBLIC_URL}/avatars/avatar_1.png`} 
                  alt={`${friend.username}'s avatar`}
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '2px solid #000', 
                    borderRadius: '4px', 
                    objectFit: 'cover',
                    backgroundColor: '#fefae0' // Add background color for consistency
                  }} 
                />
                {/* 未读消息数字badge */}
                {unreadCounts && unreadCounts[friend._id] > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    left: '30px',
                    backgroundColor: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    minWidth: '18px',
                    textAlign: 'center',
                    zIndex: 3
                  }}>{unreadCounts[friend._id]}</span>
                )}
                <div style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: "'Press Start 2P'" }}>
                  {friend.username} 
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent row selection when clicking chat
                  onChatFriend(friend); 
                }}
                title="Chat with friend"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px', // Add some padding for easier clicking
                  marginLeft: '10px',
                  display: 'flex', // For centering SVG if needed
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill="currentColor">
                  <path d="M5 3h14v2H5V3zm0 16H3V5h2v14zm14 0v2H5v-2h14zm0 0h2V5h-2v14zM10 8H8v2h2V8zm4 0h2v2h-2V8zm-5 6v-2H7v2h2zm6 0v2H9v-2h6zm0 0h2v-2h-2v2z"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Removed recommendation section based on static data */}

      {/* Render the SearchFriendModal */}
      <SearchFriendModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
        onChatFriend={onChatFriend}
      />
    </div>
  );
}

export default FriendsList;
