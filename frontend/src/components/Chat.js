import React, { useState, useEffect, useRef } from 'react'; // Removed useContext
import { useParams } from 'react-router-dom'; 
import { 
  sendAiChatMessage
  // getMessages,  // Removed unused
  // sendMessage as sendUserMessage, // Removed unused
  // getUserById, // Removed unused
  // connectSocket, // Removed unused
  // disconnectSocket // Removed unused
} from '../api'; 

// Import backgrounds and pets for the left panel customization
import bg1 from '../assets/friends_bg/bg_1.png';
import bg2 from '../assets/friends_bg/bg_2.png';
import bg3 from '../assets/friends_bg/bg_3.png';
import bg4 from '../assets/friends_bg/bg_4.png';
import bg5 from '../assets/friends_bg/bg_5.png';
// Pet images are now in public/pets, so we will reference them via PUBLIC_URL

const BACKGROUNDS = [bg1, bg2, bg3, bg4, bg5];
// TODO: Get available pets based on the logged-in user, not hardcoded
const PETS = [
  process.env.PUBLIC_URL + '/pets/pet_1.png',
  process.env.PUBLIC_URL + '/pets/pet_2.png',
  process.env.PUBLIC_URL + '/pets/pet_3.png',
  process.env.PUBLIC_URL + '/pets/pet_4.png',
  process.env.PUBLIC_URL + '/pets/pet_5.png',
];

function Chat({ currentUser, clearUnread }) { // Receive clearUnread prop
  
  const { userId: chatPartnerId } = useParams(); 
  const [chatPartner, setChatPartner] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Generic loading state
  const chatBoxRef = useRef(null); // Ref for scrolling
  
  // State for left panel customization (like in Friends.js)
  const [bgIndex, setBgIndex] = useState(0);
  const [petIndex, setPetIndex] = useState(0); // This should ideally reflect the current user's chosen pet index

  // Handlers for changing background and pet (similar to Friends.js)
  const handleChangeBg = () => {
    setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
  };
  const handleChangePet = () => {
    setPetIndex((prev) => (prev + 1) % PETS.length);
  };

  useEffect(() => {
    // 只处理 AI 聊天
    setChatPartner(null); // Ensure no chat partner for AI chat
    setMessages([{ sender: 'pet', text: "Hi there! Ask me anything 😺" }]);
    setIsLoading(false);
  }, []);

  // Auto-scroll to bottom
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
      // 只处理 AI 聊天
      const result = await sendAiChatMessage(userMessageText, []); // Pass empty array for history
      if (result && result.response) {
        setMessages(prev => [...prev, { sender: 'pet', text: result.response }]);
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        sender: 'system',
        text: "Sorry, I couldn't send your message. Please try again."
      }]);
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

  // Special action buttons - only for AI chat
  const handleSpecialAction = async (action) => {
    if (!chatPartnerId) { // Only allow special actions with AI pet
      const userActionMessage = { sender: 'you', text: `Let's ${action.toLowerCase()}!` };
      setMessages(prev => [...prev, userActionMessage]);
      setIsLoading(true);
      try {
        // Pass the action as a message to the AI
        // The message history should ideally be passed to maintain context
        const currentHistory = messages.map(msg => ({ role: msg.sender === 'you' ? 'user' : 'assistant', content: msg.text }));
        currentHistory.push({ role: 'user', content: userActionMessage.text });


        const result = await sendAiChatMessage(userActionMessage.text, currentHistory.slice(0, -1)); // Send history up to before this message
        if (result && result.response) {
          setMessages(prev => [...prev, { sender: 'pet', text: result.response }]);
        } else {
          throw new Error("Invalid response from AI for special action");
        }
      } catch (error) {
        console.error("Error during special action:", error);
        setMessages(prev => [...prev, {
          sender: 'system',
          text: `Sorry, I couldn't perform the action: ${action}. Please try again.`
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const getChatTitle = () => {
    // Display loading text more reliably
    if (chatPartnerId && !chatPartner) return "Loading Chat..."; 
    if (chatPartner && chatPartner.username) return `Chat with ${chatPartner.username}`;
    if (!chatPartnerId) return "Chat with Pet"; // AI Chat
    return "Chat"; // Fallback title
  }

  return (
    <div className="chat-page-container">
      {/* Left panel: Customizable Pet area */}
      <div className="left-panel">
         <div
          className="pet-area"
          style={{
            // Use selected background
            backgroundImage: `url(${BACKGROUNDS[bgIndex]})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Display current user's selected pet */}
          <img 
             src={PETS[petIndex]} 
             className="cat" 
             alt="Your Pet" 
           />
        </div>
        {/* Show customization buttons only in user-to-user chat */}
        {chatPartnerId ? ( 
            <div className="buttons">
              <button className="action-btn" onClick={handleChangeBg}>Change BG</button>
              <button className="action-btn" onClick={handleChangePet}>Change Pet</button>
              {/* Add other relevant buttons if needed */}
            </div>
        ) : ( // AI Chat buttons
             <div className="buttons">
               <button onClick={() => handleSpecialAction('Catch Fish')}>Fish</button>
               <button onClick={() => handleSpecialAction('Trivia Challenge')}>Trivia</button>
               <button onClick={() => handleSpecialAction('Give Gift')}>Gift</button>
            </div>
        )}
      </div>

      {/* Right panel: Chat content */}
      <div className="right-panel">
        <h2>{getChatTitle()}</h2>
        <div className="chat-box" ref={chatBoxRef}>
          {isLoading && messages.length === 0 && <p>Loading messages...</p>}
          {messages.map((msg, index) => (
            <div key={index} className={`bubble ${msg.sender === 'you' ? 'you' : 'other'}`}>
              <strong>
                 {/* Display sender name ('You' or the partner's name) */}
                 {msg.sender === 'you' ? 'You' : (chatPartner?.username || msg.sender || 'System')}: 
              </strong> {msg.text}
            </div>
          ))}
          {isLoading && messages.length > 0 && ( // Show thinking indicator if loading new messages
            <div className="bubble pet typing-indicator"> 
              <strong>{chatPartner ? chatPartner.username : 'Pet'}:</strong> is thinking...
            </div>
          )}
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <div className="status-bar"> {/* Status bar remains unchanged */}
          <div>
            <div className="bar-label">Mood</div>
            <div className="bar">
              <div className="mood-fill" style={{ width: '94%' }}></div>
            </div>
          </div>
          <div>
            <div className="bar-label">Bond</div>
            <div className="bar">
              <div className="bond-fill" style={{ width: '83%' }}></div>
            </div>
          </div>
          <div>
            <div className="bar-label">Memory</div>
            <div>Last fed: 2 days ago</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
