// All imports must be at the top:
import React, { useState } from 'react';
import FriendsList from './Friends/FriendsList';
import FriendProfile from './Friends/FriendProfile';
import FriendChat from './Friends/FriendChat';

// Backgrounds
import bg1 from '../assets/friends_bg/bg_1.png';
import bg2 from '../assets/friends_bg/bg_2.png';
import bg3 from '../assets/friends_bg/bg_3.png';
import bg4 from '../assets/friends_bg/bg_4.png';
import bg5 from '../assets/friends_bg/bg_5.png';

// Pet images are now in public/pets, so we will reference them via PUBLIC_URL

const BACKGROUNDS = [bg1, bg2, bg3, bg4, bg5];
const PETS = [
  process.env.PUBLIC_URL + '/pets/pet_1.png',
  process.env.PUBLIC_URL + '/pets/pet_2.png',
  process.env.PUBLIC_URL + '/pets/pet_3.png',
  process.env.PUBLIC_URL + '/pets/pet_4.png',
  process.env.PUBLIC_URL + '/pets/pet_5.png',
];

function Friends({ friendsList, refreshFriends, unreadCounts, currentUser, clearUnread }) { // Accept unreadCounts prop and currentUser
  const [view, setView] = useState('list');
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Background index
  const [bgIndex, setBgIndex] = useState(0);
  const handleChangeBg = () => {
    setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
  };

  // Pet index
  const [petIndex, setPetIndex] = useState(0);
  const handleChangePet = () => {
    setPetIndex((prev) => (prev + 1) % PETS.length);
  };

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
    setView('profile');
  };

  const handleChatFriend = (friend) => {
    setSelectedFriend(friend);
    setView('chat');
    if (clearUnread) clearUnread(friend._id);
  };

  const handleBack = () => {
    setView('list');
  };

  if (view === 'chat' && selectedFriend) {
    return <FriendChat friend={selectedFriend} currentUser={currentUser} onBack={handleBack} />;
  }

  return (
    <div className="chat-page-container">
      <div className="left-panel">
        <div
          className="pet-area"
          style={{
            backgroundImage: `url(${BACKGROUNDS[bgIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <img src={PETS[petIndex]} className="cat" alt="pixel cat" />
        </div>
        <div className="buttons">

          <button className="action-btn" onClick={handleChangeBg}>
            Change BG
          </button>

          <button className="action-btn" onClick={handleChangePet}>
            Change Pet
          </button>
          {/* "Pet" button removed */}
        </div>
      </div>

      <div className="right-panel">
        {view === 'list' && (
          <FriendsList
            friends={friendsList} 
            refreshFriends={refreshFriends} 
            unreadCounts={unreadCounts} // Pass unread counts down
            onSelectFriend={handleSelectFriend}
            onChatFriend={handleChatFriend}
          />
        )}
        {view === 'profile' && selectedFriend && (
          <FriendProfile friend={selectedFriend} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}

export default Friends;
