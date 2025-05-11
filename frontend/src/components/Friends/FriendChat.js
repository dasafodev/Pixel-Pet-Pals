// FriendChat.js
import React, { useState, useEffect, useRef } from 'react';
// Removed unused getUserById
import { getMessages, sendMessage as sendUserMessage, connectSocket, disconnectSocket } from '../../api'; 
import bg1 from '../../assets/friends_bg/bg_1.png';
import bg2 from '../../assets/friends_bg/bg_2.png';
import bg3 from '../../assets/friends_bg/bg_3.png';
import bg4 from '../../assets/friends_bg/bg_4.png';
import bg5 from '../../assets/friends_bg/bg_5.png';

function FriendChat({ friend, currentUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  // Background and pet customization (可根据需要扩展)
  const [bgIndex, setBgIndex] = useState(0);
  const [petIndex, setPetIndex] = useState(0);
  const BACKGROUNDS = [bg1, bg2, bg3, bg4, bg5];
  const PETS = [
    process.env.PUBLIC_URL + '/pets/pet_1.png',
    process.env.PUBLIC_URL + '/pets/pet_2.png',
    process.env.PUBLIC_URL + '/pets/pet_3.png',
    process.env.PUBLIC_URL + '/pets/pet_4.png',
    process.env.PUBLIC_URL + '/pets/pet_5.png',
  ];

  const handleChangeBg = () => {
    setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
  };
  const handleChangePet = () => {
    setPetIndex((prev) => (prev + 1) % PETS.length);
  };

  // 获取当前用户和好友的头像和昵称
  const myAvatar = currentUser && currentUser.avatar ? `${process.env.PUBLIC_URL}${currentUser.avatar}` : `${process.env.PUBLIC_URL}/avatars/avatar_1.png`;
  const myName = currentUser && currentUser.username ? currentUser.username : 'You';
  const friendAvatar = friend && friend.avatar ? `${process.env.PUBLIC_URL}${friend.avatar}` : `${process.env.PUBLIC_URL}/avatars/avatar_1.png`;
  const friendName = friend && friend.username ? friend.username : 'Friend';

  useEffect(() => {
    // Fetch History
    const fetchHistory = async () => {
      if (friend && friend._id && currentUser && currentUser._id) {
        setIsLoading(true);
        try {
          const messageData = await getMessages(friend._id);
          if (messageData.success) {
            const formattedMessages = messageData.messages.map(msg => ({
              sender: msg.sender === currentUser._id ? 'you' : (friend.username || 'Unknown'),
              text: msg.content,
              timestamp: msg.createdAt
            }));
            setMessages(formattedMessages);
          } else {
            setMessages([{ sender: 'system', text: 'Error loading messages.' }]);
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
          setMessages([{ sender: 'system', text: 'Error loading chat history.' }]);
        }
        setIsLoading(false);
      } else {
        setMessages([]); // Clear messages if friend or user is not set
      }
    };
    fetchHistory();

    // Socket Connection and Listener
    let socket;
    let handleNewMessageFn; // Renamed to avoid conflict if a prop named handleNewMessage exists

    if (currentUser && currentUser._id && friend && friend._id) { // Ensure friend is also available for context
      socket = connectSocket(currentUser._id);

      handleNewMessageFn = (newMessage) => {
        // Check if the message is relevant to the current chat
        if (newMessage.sender === friend._id && newMessage.recipient === currentUser._id) {
          const formattedMessage = {
            sender: friend.username || 'Unknown', // Display friend's name
            text: newMessage.content,
            timestamp: newMessage.createdAt
          };
          setMessages(prevMessages => [...prevMessages, formattedMessage]);
        }
      };
      socket.on('private-message', handleNewMessageFn);
    }

    // Cleanup function
    return () => {
      if (socket) {
        if (handleNewMessageFn) {
          socket.off('private-message', handleNewMessageFn);
        }
        disconnectSocket();
      }
    };
  }, [currentUser, friend]); // Dependencies: currentUser, friend

  // Effect for auto-scrolling
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    const userMessageText = inputText.trim();
    if (!userMessageText) return;
    const userMessage = { sender: 'you', text: userMessageText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    try {
      const response = await sendUserMessage(friend._id, userMessageText);
      if (!response.success) {
        throw new Error(response.message || 'Failed to send message');
      }
      // Socket 会自动推送消息，无需重复添加
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'system', text: "Sorry, I couldn't send your message. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-page-container" style={{ height: '500px' }}>
      {/* Left panel: Customizable Pet area */}
      <div className="left-panel">
        <div className="pet-area" style={{
          backgroundImage: `url(${BACKGROUNDS[bgIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}>
          <img src={PETS[petIndex]} style={{ position: 'absolute', bottom: '10px', left: '30px', width: '40%', height: 'auto', zIndex: 2 }} alt="your pet" />
          <img src={PETS[(petIndex + 1) % PETS.length]} style={{ position: 'absolute', bottom: '10px', right: '30px', width: '40%', height: 'auto', zIndex: 2 }} alt="friend's pet" />
        </div>
        <div className="buttons">
          <button className="action-btn" onClick={handleChangeBg}>Change BG</button>
          <button className="action-btn" onClick={handleChangePet}>Change Pet</button>
        </div>
      </div>
      {/* Right panel: Chat content */}
      <div className="right-panel">
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h2 style={{ margin: 0 }}>Chat with {friend.username || friend.nickname}</h2>
        </div>
        <div ref={chatBoxRef} className="chat-box" style={{ paddingBottom: 0, minHeight: 320 }}>
          {isLoading && messages.length === 0 && <p>Loading messages...</p>}
          {messages.map((msg, index) => (
            <div key={index} className={`bubble-row ${msg.sender === 'you' ? 'you-row' : 'other-row'}`} style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '8px', flexDirection: msg.sender === 'you' ? 'row-reverse' : 'row' }}>
              {/* 头像 */}
              <img 
                src={msg.sender === 'you' ? myAvatar : friendAvatar} 
                alt="avatar" 
                style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  margin: msg.sender === 'you' ? '0 0 0 4px' : '0 4px 0 0',
                  border: '2px solid #000',
                  objectFit: 'cover'
                }} 
              />
              <div>
                {/* 昵称 */}
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#333', marginBottom: '2px', textAlign: msg.sender === 'you' ? 'right' : 'left' }}>
                  {msg.sender === 'you' ? myName : friendName}
                </div>
                {/* 气泡 */}
                <div className={`bubble ${msg.sender === 'you' ? 'you' : 'other'}`}
                  style={{ maxWidth: 320, wordBreak: 'break-all', background: msg.sender === 'you' ? '#d0ebff' : '#fff', border: '2px solid #000', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="input-area" style={{ display: 'flex', marginTop: '6px', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            style={{ flex: 1 }}
          />
          <button onClick={handleSendMessage} disabled={isLoading} className="action-btn">
            {isLoading ? 'Sending...' : 'Send'}
          </button>
          <button onClick={onBack} className="action-btn">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default FriendChat;
