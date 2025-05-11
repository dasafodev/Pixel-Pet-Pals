import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import Chat from './components/Chat';
import Friends from './components/Friends';
import Logout from './components/Logout';
import Login from './components/Login';
import CommunityPage from './components/Community/CommunityPage'; // Import CommunityPage
import { getCurrentUser, getFriends, connectSocket, disconnectSocket, getConversations } from './api'; // Import socket functions

function App() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]); 
  const [unreadCounts, setUnreadCounts] = useState({}); // { partnerId: count }
  const [loading, setLoading] = useState(true); 
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Function to fetch/refresh friends - wrapped in useCallback
  const fetchFriends = useCallback(async () => {
    // No need to check for user here, as the calling useEffect depends on user
    try {
      const response = await getFriends(); 
      if (response.success) {
        setFriends(response.friends || []);
      } else {
        console.error("Failed to fetch friends:", response.message);
        setFriends([]); // Clear friends on error
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]);
    }
  }, [user]); // Added user to dependency array, as fetchFriends is often tied to the current user context

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getCurrentUser(); // API call to verify token and get user
          if (response.success && response.user) {
            setUser(response.user);
          } else {
            localStorage.removeItem('token'); // Invalid token or user not found
          }
        } catch (error) {
          console.error("Error fetching current user:", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkLoggedInUser();
  }, []); // Run only on initial mount

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  // Update total unread count whenever unreadCounts changes
  useEffect(() => {
    const total = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    setTotalUnreadCount(total);
  }, [unreadCounts]);

  // Fetch friends when user logs in
  useEffect(() => {
    if (user) {
      fetchFriends();
      // Fetch initial unread counts
      fetchUnreadCounts();
    } else {
      setFriends([]);
      setUnreadCounts({});
    }

    // Global Socket Listener for App
    let socket;
    if (user) {
      socket = connectSocket(user._id);

      socket.on('private-message', (newMessage) => {
        // Update unread count if the message is not from the current user
        if (newMessage.sender !== user._id) {
          setUnreadCounts(prevCounts => ({
            ...prevCounts,
            [newMessage.sender]: (prevCounts[newMessage.sender] || 0) + 1
          }));

          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New Message', {
              body: `You have a new message from ${newMessage.sender}`,
              icon: '/logo192.png'
            });
          }
        }
      });
      // 监听好友通过事件，自动刷新好友列表
      socket.on('friend-accepted', () => {
        fetchFriends();
      });
    }
    
    return () => {
      if (socket) {
        disconnectSocket();
      }
    };
  }, [user, fetchFriends]); // Added fetchFriends to dependency array

  // Function to fetch unread counts for all conversations
  const fetchUnreadCounts = async () => {
    try {
      const response = await getConversations();
      if (response.success) {
        const counts = {};
        response.conversations.forEach(conv => {
          if (conv.unreadCount > 0) {
            counts[conv.partner._id] = conv.unreadCount;
          }
        });
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  // Function to clear unread count for a specific chat partner
  const clearUnreadCount = useCallback((partnerId) => {
    setUnreadCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      delete newCounts[partnerId];
      return newCounts;
    });
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    if (userData && userData.id) { // Use userData.id
      localStorage.setItem('userId', userData.id);
    }
    setUser(userData); // This will trigger the useEffect above to fetch friends
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); // Also remove userId on logout
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <Router>
      {!user ? (
        <Switch>
          {/* 登录页永远在根路径 */}
          <Route exact path="/">
            <Login onLogin={handleLogin} />
          </Route>
          {/* 默认跳转到登录页 */}
          <Redirect to="/" />
        </Switch>
      ) : (
        <div className="app-container">
          {/* Calculate total unread count */}
          <Sidebar totalUnreadCount={totalUnreadCount} /> 
          <div className="content-container">
            <Switch>
              {/* Pass fetchFriends function and unread counts to Home */}
              <Route exact path="/home" render={(props) => <Home {...props} refreshFriends={fetchFriends} unreadCounts={unreadCounts} />} /> 
              {/* Pass user prop and clearUnreadCount to Chat */}
              <Route exact path="/chat/:userId?" render={(props) => <Chat {...props} currentUser={user} clearUnread={clearUnreadCount} />} /> 
              {/* Pass friends list, refresh function, and unread counts to Friends */}
              <Route exact path="/friends" render={(props) => <Friends {...props} friendsList={friends} refreshFriends={fetchFriends} unreadCounts={unreadCounts} currentUser={user} clearUnread={clearUnreadCount} />} /> 
              <Route
                exact
                path="/logout"
                render={() => <Logout onLogout={handleLogout} />}
              />
              <Route exact path="/community" component={CommunityPage} />
              {/* 登录后访问未知路由默认回到首页 */}
              <Redirect to="/home" />
            </Switch>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
