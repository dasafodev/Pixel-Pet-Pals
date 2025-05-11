# Pet Social Platform - Frontend

This is the frontend application for the Pet Social Platform, a social network for pet owners. It provides the user interface for interacting with the platform's features, including user registration, login, profile management, friend interactions, messaging, and AI chat.

This application is likely built with React (or a similar JavaScript framework).

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (which includes npm, the Node Package Manager)

## Setup Instructions

1.  **Navigate to the Frontend Directory**:
    Open your terminal and change to the `frontend` directory of the project.
    ```bash
    cd path/to/your/project/frontend
    ```

2.  **Install Dependencies**:
    Install all the necessary npm packages.
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    The frontend needs to know where the backend API is located.
    a.  Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    b.  Open the newly created `.env` file and ensure the `REACT_APP_API_URL` variable is set to the correct URL of your running backend server. By default, if the backend is running locally on port 5001, this should be:
        ```
        REACT_APP_API_URL=http://localhost:5001
        ```
        Adjust this if your backend is running on a different host or port.

## Running the Application

1.  **Ensure Backend is Running**:
    The frontend application communicates with the backend API. Make sure you have followed the setup instructions in the `backend/README.md` and that the backend server is running.

2.  **Start the Frontend Development Server**:
    Once dependencies are installed and environment variables are set, you can start the development server.
    ```bash
    npm start
    ```
    This command will typically open the application in your default web browser (usually at `http://localhost:3000`). The server will watch for file changes and automatically reload the application.

## Building for Production

If you want to create an optimized build of the application for deployment:
```bash
npm run build
```
This command will create a `build` folder in the `frontend` directory containing the static assets for your application. These files can then be deployed to any static site hosting service or served by a web server.

## Key Features

- User authentication (registration, login)
- Pet profile management
- Friend system (search, add, manage friends)
- Real-time private messaging
- AI-powered chat
