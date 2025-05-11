import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom'; // Import useHistory
import { searchUsers, sendFriendRequest } from '../../api'; // Adjust path as needed
import debounce from 'lodash.debounce'; // Using lodash debounce for search input

function SearchFriendModal({ isOpen, onClose, onChatFriend }) {
  const history = useHistory(); // Initialize useHistory
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState({}); // Track sent requests { userId: 'sent' | 'error' }

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchUsers(searchQuery);
        if (data.success) {
          setResults(data.users || []);
        } else {
          setError(data.message || 'Search failed.');
          setResults([]);
        }
      } catch (err) {
        console.error("Search error:", err);
        setError('An error occurred during search.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500), // 500ms debounce delay
    [] // Empty dependency array for useCallback
  );

  useEffect(() => {
    // Trigger search when query changes (debounced)
    debouncedSearch(query);
    // Cleanup debounce timer on unmount or query change
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  const handleSendRequest = async (userId) => {
    setRequestStatus(prev => ({ ...prev, [userId]: 'sending' }));
    try {
      const data = await sendFriendRequest(userId);
      if (data.success) {
        setRequestStatus(prev => ({ ...prev, [userId]: 'sent' }));
      } else {
        setRequestStatus(prev => ({ ...prev, [userId]: 'error' }));
        // Optionally show specific error message from data.message
        console.error("Send request error:", data.message);
      }
    } catch (err) {
      setRequestStatus(prev => ({ ...prev, [userId]: 'error' }));
      console.error("Send request error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ /* Basic Modal Styles */
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ /* Modal Content Styles */
        backgroundColor: '#fefae0', border: '4px solid #000',
        boxShadow: '8px 8px 0 #000', padding: '25px', width: '450px',
        maxWidth: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column'
      }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Find Friends</h2>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by username or pet name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%', padding: '12px', border: '3px solid #000',
            fontFamily: "'Press Start 2P'", fontSize: '10px', boxSizing: 'border-box',
            marginBottom: '15px'
          }}
        />

        {/* Results Area */}
        <div style={{ flex: 1, overflowY: 'auto', border: '3px solid #000', padding: '10px', backgroundColor: '#fff', minHeight: '150px' }}>
          {isLoading && <p style={{ textAlign: 'center' }}>Searching...</p>}
          {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>}
          {!isLoading && !error && results.length === 0 && query && (
            <p style={{ textAlign: 'center' }}>No users found matching "{query}".</p>
          )}
          {!isLoading && !error && results.length === 0 && !query && (
            <p style={{ textAlign: 'center' }}>Enter a name to search.</p>
          )}
          {!isLoading && !error && results.map(user => (
            <div key={user._id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px', borderBottom: '2px solid #ccc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={user.avatar ? `${process.env.PUBLIC_URL}${user.avatar}` : `${process.env.PUBLIC_URL}/avatars/avatar_1.png`} 
                  alt={`${user.username}'s avatar`}
                  style={{ width: '35px', height: '35px', border: '2px solid #000', borderRadius: '4px', objectFit: 'cover' }} 
                />
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{user.username} ({user.petName})</span>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  onClick={() => handleSendRequest(user._id)}
                  disabled={requestStatus[user._id] === 'sending' || requestStatus[user._id] === 'sent'}
                  style={{
                    backgroundColor: requestStatus[user._id] === 'sent' ? '#a0a0a0' : (requestStatus[user._id] === 'error' ? '#f4978e' : '#8ecae6'),
                    fontFamily: "'Press Start 2P'", fontSize: '9px', padding: '8px 10px', // Adjusted padding
                    border: '2px solid #000', cursor: 'pointer', boxShadow: '1px 1px 0px #000',
                    transition: 'all 0.1s ease',
                    opacity: requestStatus[user._id] === 'sent' ? 0.7 : 1
                  }}
                >
                  {requestStatus[user._id] === 'sending' ? '...' : 
                   requestStatus[user._id] === 'sent' ? 'Sent' : 
                   requestStatus[user._id] === 'error' ? 'Error' : 
                   'Add'}
                </button>
                <button
                  onClick={() => {
                    onChatFriend(user); // 直接进入user-to-user聊天
                    onClose(); // 关闭modal
                  }}
                  style={{
                    backgroundColor: '#a8dadc', // A different color for distinction
                    fontFamily: "'Press Start 2P'", fontSize: '9px', padding: '8px 10px', // Adjusted padding
                    border: '2px solid #000', cursor: 'pointer', boxShadow: '1px 1px 0px #000',
                    transition: 'all 0.1s ease'
                  }}
                >
                  Chat
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            marginTop: '20px', backgroundColor: '#f4978e', fontFamily: "'Press Start 2P'",
            fontSize: '10px', padding: '10px', border: '3px solid #000', cursor: 'pointer',
            boxShadow: '2px 2px 0px #000', alignSelf: 'center'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default SearchFriendModal;
