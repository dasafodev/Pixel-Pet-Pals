import React, { useState, useEffect, useMemo } from 'react';
import { getCurrentUser, getFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../api'; // Removed updatePetDetails, updateProfile
import EditPetModal from './EditPetModal';
import EditUserProfileModal from './EditUserProfileModal';
import FriendProfile from './Friends/FriendProfile'; // To display user's own profile

// Import images from src/assets
import defaultMaleAvatar from '../assets/homepage/male_3.png'; // Renamed for clarity
// Removed import for homePetImage as cat_sleep.png will be referenced from public
import mailboxIcon from '../assets/homepage/mailbox_2.png';

const DEFAULT_AVATAR_PATH = '/avatars/avatar_1.png';
const BACKGROUND_PATH = '/backgrounds/homepage_bg_2.png';

const flameFrames = Array.from({ length: 9 }, (_, i) => `/backgrounds/flame/${i + 1}.png`);

function Home({ refreshFriends, unreadCounts }) {
  const [userData, setUserData] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [showEditPetModal, setShowEditPetModal] = useState(false);
  const [showEditUserProfileModal, setShowEditUserProfileModal] = useState(false);
  const [showMyProfileView, setShowMyProfileView] = useState(false); // State for showing own profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % 9);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userDataResponse, friendRequestsResponse] = await Promise.all([
          getCurrentUser(),
          getFriendRequests()
        ]);

        if (userDataResponse.success) {
          setUserData(userDataResponse.user);
        } else {
          throw new Error(userDataResponse.message || 'Failed to load user data.');
        }

        if (friendRequestsResponse.success) {
          setFriendRequests(friendRequestsResponse.friendRequests || []);
        } else {
          console.error("Failed to load friend requests:", friendRequestsResponse.message);
          setFriendRequests([]);
        }

      } catch (err) {
        console.error("Error fetching home page data:", err);
        setError(err.message || 'Failed to load page data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userDataResponse = await getCurrentUser();
      if (userDataResponse.success) {
        setUserData(userDataResponse.user);
      } else {
        console.error(userDataResponse.message || 'Failed to reload user data.');
      }
    } catch (err) {
      console.error("Error reloading user data:", err);
    }
  };

  const handleFriendRequestAction = async (requestId, action) => {
    try {
      const response = action === 'accept'
        ? await acceptFriendRequest(requestId)
        : await rejectFriendRequest(requestId);

      if (response.success) {
        const updatedRequestsResponse = await getFriendRequests();
        if (updatedRequestsResponse.success) {
          setFriendRequests(updatedRequestsResponse.friendRequests || []);
        }
        if (action === 'accept') refreshFriends();
      } else {
        alert(`Failed to ${action} friend request: ${response.message}`);
      }
    } catch (err) {
      alert(`Error processing friend request: ${err.message}`);
    }
  };

  const handleAvatarClick = () => setShowEditUserProfileModal(true);
  const handlePetImageClick = () => setShowEditPetModal(true);

  const petImagePath = process.env.PUBLIC_URL + '/pets/cat_sleep.png';
  const currentMailboxIcon = mailboxIcon; 
  const friendRequestCount = friendRequests.length;

  // Memoize petData to prevent unnecessary re-renders of EditPetModal's useEffect
  const memoizedPetData = useMemo(() => {
    if (!userData) return { name: '', toys: [], bio: '' };
    return {
      name: userData.petName || '',
      toys: userData.petToys || [],
      bio: userData.bio || ''
    };
  }, [userData]); // Added userData to dependencies

  return (
    <div 
      className="page" 
      id="page-home" 
      style={{
        backgroundImage: `url(${BACKGROUND_PATH})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        width: '100%', 
        paddingTop: '56.25%',
        position: 'relative',
        overflow: 'hidden',
        border: '3px solid #000'
      }}>
      {loading ? (
        <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px' }}>Loading...</p>
      ) : error ? (
        <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'red', backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px' }}>Error: {error}</p>
      ) : userData ? (
        <>
          <img 
            src={petImagePath} 
            alt="User's Pet"
            onClick={handlePetImageClick} // Added onClick handler
            style={{ position: 'absolute', bottom: '-2%', left: '30%', width: '18%', height: 'auto', transform: 'translateX(-50%)', cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }} // Added cursor and transition
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
          />

          <img
            src={defaultMaleAvatar}
            alt="User Avatar"
            onClick={handleAvatarClick}
            style={{ 
              position: 'absolute', 
              bottom: '0%', // Adjusted position slightly
              right: '25%',  // Adjusted position
              width: '250px', // Reduced width to a fixed pixel value
              height: 'auto', 
              cursor: 'pointer', 
              // transform: 'translateX(50%)', // May not be needed with fixed width and right positioning
              transition: 'transform 0.2s ease-in-out' 
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} // Adjusted scale
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />

          <img 
            src={flameFrames[currentFrame]} 
            alt="Fire Flame" 
            style={{ position: 'absolute', bottom: '70px', right: '140px', width: '100px', height: '100px', imageRendering: 'pixelated', zIndex: 5 }} 
          />

          <div style={{
            position: 'absolute',
            top: '106px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 15px',
            borderRadius: '5px',
            border: '4px solid rgb(55, 26, 5)',
            textAlign: 'center',
            fontFamily: "'Press Start 2P'",
            fontSize: '20px',
            color: 'rgb(40, 21, 6)'
          }}>
            Welcome back,<br /><br />{userData.username}!
          </div>

          {/* Display for User's Chosen Avatar */}
          {userData && (
            <img 
              src={`${process.env.PUBLIC_URL}${userData.avatar || DEFAULT_AVATAR_PATH}`}
              alt="Current User Avatar" 
              style={{
                position: 'absolute',
                top: '20px',
                right: '5px',
                width: '80px',
                height: '80px',
                cursor: 'pointer',
                zIndex: 10
              }}
              title="View your profile"
              onClick={() => setShowMyProfileView(true)}
            />
          )}

          <div 
            onClick={() => setShowRequests(prev => !prev)}
            style={{ position: 'absolute', top: '320px', right: '-35px', cursor: 'pointer', padding: '5px', transition: 'transform 0.2s ease-in-out' }} // Added transition to container
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img src={currentMailboxIcon} alt="Mailbox" style={{ width: '200px', height: 'auto' }} /> 
            {friendRequestCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '10px',
                fontFamily: "'Press Start 2P'"
              }}>{friendRequestCount}</span>
            )}
          </div>

          {showRequests && (
            <div style={{
              position: 'absolute',
              top: '180px',
              right: '20px',
              width: '300px',
              maxHeight: '400px',
              overflowY: 'auto',
              backgroundColor: '#fefae0',
              border: '3px solid #000',
              boxShadow: '4px 4px 0 #000',
              padding: '15px',
              zIndex: 10,
              fontFamily: "'Press Start 2P'"
            }}>
              <button 
                onClick={() => setShowRequests(false)} 
                style={{ position: 'absolute', top: '5px', right: '5px', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', padding: '5px' }}>
                ❌
              </button>
              <h3 style={{ marginTop: 0, marginBottom: '15px', fontSize: '12px', textAlign: 'center' }}>Friend Requests</h3>
              {friendRequests.length === 0 ? (
                <p style={{ fontSize: '10px', textAlign: 'center' }}>No new requests.</p>
              ) : (
                friendRequests.map(req => (
                  <div key={req._id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '2px solid #000', fontSize: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={`${process.env.PUBLIC_URL}${req.sender.avatar || req.sender.petAvatar || DEFAULT_AVATAR_PATH}`} alt="sender avatar" style={{ width: '30px', height: '30px', border: '2px solid #000', borderRadius: '3px', objectFit: 'cover' }} />
                      <span><strong>{req.sender.username}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => handleFriendRequestAction(req._id, 'accept')} 
                        style={{ fontFamily: "'Press Start 2P'", fontSize: '9px', padding: '5px 8px', backgroundColor: '#a8dadc', border: '2px solid #000', boxShadow: '1px 1px 0px #000', cursor: 'pointer' }}>
                        Accept
                      </button>
                      <button
                        onClick={() => handleFriendRequestAction(req._id, 'decline')}
                        style={{ fontFamily: "'Press Start 2P'", fontSize: '9px', padding: '5px 8px', backgroundColor: '#f4978e', border: '2px solid #000', boxShadow: '1px 1px 0px #000', cursor: 'pointer' }}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {showEditPetModal && userData && (
            <EditPetModal
              show={showEditPetModal}
              onClose={() => setShowEditPetModal(false)}
              petData={memoizedPetData}
              onPetUpdate={fetchUserData}
            />
          )}
          {showEditUserProfileModal && userData && (
            <EditUserProfileModal
              show={showEditUserProfileModal}
              onClose={() => setShowEditUserProfileModal(false)}
              currentUser={userData}
              onUserUpdate={fetchUserData}
            />
          )}
          {showMyProfileView && userData && (
            <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px', width: 'clamp(300px, 80%, 600px)', maxHeight: '80vh', overflowY: 'auto', border: '3px solid black'}}>
                <FriendProfile 
                  friend={userData} // Pass full userData as 'friend'
                  onBack={() => setShowMyProfileView(false)} 
                  isCurrentUser={true} // Add a prop to indicate it's the current user
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', backgroundColor: 'rgba(0,0,0,0.7)', padding: '10px' }}>Could not load user data.</p>
      )}
    </div>
  );
}

export default Home;
