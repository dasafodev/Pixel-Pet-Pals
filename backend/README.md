# Pet Social Platform Backend API

This is the backend API for the Pet Social Platform, a social network for pet owners.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the `.env.example` file to a new file named `.env`.
   ```bash
   cp .env.example .env
   ```
   Then, update the values in the newly created `.env` file. The required variables are:
   ```
   PORT=5001                     # The port the backend server will run on
   MONGODB_URI=mongodb://localhost:27017/pet-social # Your MongoDB connection string
   JWT_SECRET=your_jwt_secret_key_here # A strong, unique secret for JWT signing
   CLIENT_URL=http://localhost:3000    # The URL of your frontend application (for CORS)
   GROQ_API_KEY=your_groq_api_key_here # Your API key from Groq for AI chat functionality
   ```
   **Important**: Ensure `GROQ_API_KEY` is set correctly to enable AI chat features.

3. Start the server:
   ```
   npm start
   ```

4. For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- **Register**: `POST /api/auth/register`
  - Request: `{ username, email, password, petName, petAvatar }`
  - Response: `{ success, token, user }`

- **Login**: `POST /api/auth/login`
  - Request: `{ username, password }`
  - Response: `{ success, token, user }`

- **Get Current User**: `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, user }`

### Users

- **Get All Users**: `GET /api/users`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, count, users }`

- **Get User by ID**: `GET /api/users/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, user }`

- **Update Profile**: `PUT /api/users/profile`
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ petName, petAvatar, bio }`
  - Response: `{ success, user }`

- **Search Users**: `GET /api/users/search?query=<search_term>`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, count, users }`

### Friends

- **Get Friends**: `GET /api/friends`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, count, friends }`

- **Get Friend Requests**: `GET /api/friends/requests`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, count, friendRequests }`

- **Send Friend Request**: `POST /api/friends/request/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, friendRequest }`

- **Accept Friend Request**: `PUT /api/friends/accept/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, message }`

- **Reject Friend Request**: `PUT /api/friends/reject/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, message }`

- **Remove Friend**: `DELETE /api/friends/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, message }`

### Messages

- **Get Conversations**: `GET /api/messages/conversations`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, count, conversations }`

- **Get Unread Message Count**: `GET /api/messages/unread/count`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, count }`

- **Get Messages with User**: `GET /api/messages/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, count, messages }`

- **Send Message**: `POST /api/messages/:id`
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ content }`
  - Response: `{ success, message }`

- **Delete Message**: `DELETE /api/messages/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, message }`

### AI Chat

- **Handle Chat Message**: `POST /api/ai/chat`
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ message: "Your message to the AI" }` (or similar, depending on `aiController.handleChat` implementation)
  - Response: `{ success, reply: "AI's response" }` (or similar)

## Real-time Features

The API uses Socket.IO for real-time communication. The following events are available:

- `join`: Join a room for private messaging
- `private-message`: Send a private message
- `typing`: Indicate that a user is typing
- `stop-typing`: Indicate that a user has stopped typing

## Models

### User
- `username`: String (required, unique)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `petName`: String (required)
- `petAvatar`: String (default: '😺')
- `bio`: String
- `friends`: Array of User IDs
- `friendRequests`: Array of User IDs

### Message
- `sender`: User ID (required)
- `recipient`: User ID (required)
- `content`: String (required)
- `read`: Boolean (default: false)
- `createdAt`: Date

### FriendRequest
- `sender`: User ID (required)
- `recipient`: User ID (required)
- `status`: String (enum: 'pending', 'accepted', 'rejected', default: 'pending')
- `createdAt`: Date
