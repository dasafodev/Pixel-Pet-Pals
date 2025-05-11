import axios from 'axios';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
let socket;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Socket.io connection
export const connectSocket = (userId) => {
  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001');
  
  if (userId) {
    socket.emit('join', userId);
  }
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

// Auth API
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const login = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// User API
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// This function is specifically for updating pet details.
// It maps the frontend field names (name) to backend field names (petName).
export const updatePetDetails = async (petDetails) => {
  try {
    const payload = {
      petName: petDetails.name, // Map name to petName
      toys: petDetails.toys,
      bio: petDetails.bio,
      // petAvatar could be handled here too if the modal supported it
    };
    const response = await api.put('/users/profile', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error updating pet details' };
  }
};

export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/users/search?query=${query}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// Friend API
export const getFriends = async () => {
  try {
    const response = await api.get('/friends');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getFriendRequests = async () => {
  try {
    const response = await api.get('/friends/requests');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const sendFriendRequest = async (userId) => {
  try {
    const response = await api.post(`/friends/request/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const acceptFriendRequest = async (userId) => {
  try {
    const response = await api.put(`/friends/accept/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const rejectFriendRequest = async (userId) => {
  try {
    const response = await api.put(`/friends/reject/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const removeFriend = async (userId) => {
  try {
    const response = await api.delete(`/friends/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// Message API
export const getConversations = async () => {
  try {
    const response = await api.get('/messages/conversations');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await api.get('/messages/unread/count');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const getMessages = async (userId) => {
  try {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const sendMessage = async (userId, content) => {
  try {
    const response = await api.post(`/messages/${userId}`, { content });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error' };
  }
};

// Socket events
export const sendPrivateMessage = (data) => {
  if (socket) {
    socket.emit('private-message', data);
  }
};

export const startTyping = (data) => {
  if (socket) {
    socket.emit('typing', data);
  }
};

export const stopTyping = (data) => {
  if (socket) {
    socket.emit('stop-typing', data);
  }
};

// AI Chat API
export const sendAiChatMessage = async (message, history) => {
  try {
    // Include history if needed by the backend/AI model for context
    const response = await api.post('/ai/chat', { message, history });
    return response.data; // Expecting { response: "AI message" }
  } catch (error) {
    console.error("Error sending message to AI:", error);
    throw error.response?.data || { message: 'Server error communicating with AI' };
  }
};

// Post API
export const createPost = async (postData) => {
  // postData is expected to be FormData if an image is included
  try {
    let config = {}; // Initialize empty config

    if (postData instanceof FormData) {
      // For FormData, do not set 'Content-Type'.
      // Axios will automatically set it to 'multipart/form-data' with the correct boundary.
      // The Authorization header will be added by the interceptor.
      config = {
        headers: {
          // Explicitly set Content-Type to undefined to ensure axios default is not used
          // and axios sets multipart/form-data itself.
          'Content-Type': undefined,
        }
      };
    } else {
      // For regular JSON data, the default 'application/json' from the instance is fine,
      // or we can be explicit. The interceptor handles Authorization.
      config = {
        headers: {
          'Content-Type': 'application/json',
        }
      };
    }

    // The interceptor will add the Authorization header to config.headers
    const response = await api.post('/posts', postData, config);
    return response.data;
  } catch (error) {
    console.error("Error in createPost API call:", error.config, error.request, error.response);
    throw error.response?.data || { message: 'Server error creating post' };
  }
};

export const getAllPosts = async (page = 1, limit = 10, searchTerm = '') => { // Added searchTerm
  try {
    let url = `/posts?page=${page}&limit=${limit}`;
    if (searchTerm) {
      url += `&search=${encodeURIComponent(searchTerm)}`;
    }
    const response = await api.get(url);
    return response.data; // Expects { posts: [], totalPages, currentPage, totalPosts }
  } catch (error) {
    throw error.response?.data || { message: 'Server error fetching posts' };
  }
};

export const getUserPosts = async (userId, page = 1, limit = 10) => { // Added pagination
  try {
    const response = await api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error fetching user posts' };
  }
};

export const getPostById = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error fetching post' };
  }
};

export const updatePost = async (postId, postData) => {
  try {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error updating post' };
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error deleting post' };
  }
};

export const toggleLikePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error liking post' };
  }
};

export const addCommentToPost = async (postId, commentData) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error adding comment' };
  }
};

export const deleteComment = async (postId, commentId) => {
  try {
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error deleting comment' };
  }
};

// Event API
export const getPredefinedLocations = async () => {
  try {
    const response = await api.get('/events/locations/predefined');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error fetching predefined locations' };
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error creating event' };
  }
};

export const getAllEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error fetching events' };
  }
};

export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error fetching event' };
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error updating event' };
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error deleting event' };
  }
};

export const toggleEventParticipation = async (eventId) => {
  try {
    const response = await api.post(`/events/${eventId}/participate`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Server error toggling event participation' };
  }
};

export default api;
