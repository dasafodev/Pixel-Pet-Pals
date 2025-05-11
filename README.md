# Pet Social Platform

Hi!This is Marlon and welcome to the Pet Social Platform! This is a full-stack application designed as a social network for pet owners, allowing them to connect, share, and chat. The platform includes features like user profiles, pet profiles, a friend system, real-time messaging, and an AI-powered chat assistant.

## Project Structure

This project is organized into two main parts:

-   `backend/`: Contains the Node.js and Express.js API server that handles business logic, database interactions, and serves data to the frontend.
-   `frontend/`: Contains the client-side application (likely built with React) that provides the user interface.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

-   [Git](https://git-scm.com/): For cloning the repository.
-   [Node.js](https://nodejs.org/): (which includes npm, the Node Package Manager) for running both the backend and frontend.
-   [MongoDB](https://www.mongodb.com/try/download/community): A running MongoDB instance is required for the backend to store data. You can install it locally or use a cloud-based service like MongoDB Atlas.

## Getting Started

To get the Pet Social Platform up and running on your local machine, follow these steps in order:

### 1. Clone the Repository (If you haven't already)

If you don't have the project files yet, clone them from the source:
```bash
git clone <repository_url>
cd <project_directory_name>
```
(Replace `<repository_url>` and `<project_directory_name>` accordingly. If you already have the files, you can skip this step.)

### 2. Set Up and Run the Backend

The backend server must be running before you can use the frontend application.

-   Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
-   Follow the detailed instructions in the `backend/README.md` file to install dependencies, configure environment variables (including your MongoDB connection string and `GROQ_API_KEY`), and start the server.

    **Key file**: `backend/README.md`

### 3. Set Up and Run the Frontend

Once the backend server is running:

-   Navigate to the `frontend` directory (from the project root):
    ```bash
    cd frontend 
    ```
    (If you are in the `backend` directory, you can use `cd ../frontend`)
-   Follow the detailed instructions in the `frontend/README.md` file to install dependencies, configure environment variables (ensuring `REACT_APP_API_URL` points to your running backend), and start the frontend development server.

    **Key file**: `frontend/README.md`

## How It Works

1.  The **backend** server connects to a MongoDB database to store and retrieve user data, messages, friend relationships, etc. It exposes a RESTful API for these operations and also handles real-time communication via Socket.IO for messaging and AI chat interactions.
2.  The **frontend** application makes requests to the backend API to fetch and display data, and to send user actions. It provides an interactive user interface in the web browser.

By following the README files in each respective directory, you should be able to get both parts of the application running and explore all its features.
