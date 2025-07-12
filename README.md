# Drawing to Animation

This project converts a user-uploaded drawing into an animation. Users can upload an image, provide a prompt, and the application will enhance the image and generate a story to go along with it.

## Features

*   **User Authentication:** Users can register and log in to their accounts.
*   **Image Upload:** Upload a drawing to be animated.
*   **Image Enhancement:** The uploaded image is enhanced using AI.
*   **Story Generation:** An AI-powered story is generated based on the user's prompt.
*   **View Creations:** Users can view their past creations.

## Tech Stack

*   **Frontend:** Next.js, React, Tailwind CSS
*   **Backend:** Node.js, Express.js
*   **Database:** AWS DynamoDB
*   **Storage:** AWS S3
*   **AI:** OpenAI

## Project Structure

The project is a monorepo with a `frontend` and `backend` directory.

*   `frontend`: A Next.js application that provides the user interface.
*   `backend`: An Express.js application that handles the business logic, interacts with the database and AI services.

## Getting Started

### Prerequisites

*   Node.js and npm
*   AWS Account with IAM user credentials
*   OpenAI API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd drawing-to-animation
    ```

2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Install frontend dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

### Environment Variables

You will need to create a `.env` file in both the `frontend` and `backend` directories.

**`backend/.env`**

```
PORT=3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
AWS_REGION=<your-aws-region>
AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
S3_BUCKET_NAME=<your-s3-bucket-name>
CREATIONS_TABLE_NAME=creations
USERS_TABLE_NAME=users
JWT_SECRET=<a-very-secret-key>
OPENAI_API_KEY=<your-openai-api-key>
```

**`frontend/.env.local`**

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Running the Application

1.  **Start the backend server:**
    ```bash
    cd backend
    npm run dev
    ```

2.  **Start the frontend development server:**
    ```bash
    cd ../frontend
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Docker

You can also run the application using Docker.

1.  **Build and run the containers:**
    ```bash
    docker-compose up --build
    ```

This will start both the frontend and backend services.

## Future Improvements

*   **Refactor Authentication with React Context:** The current login flow forces a full page reload to update the application state. Before a full-scale launch, this should be refactored to use a React Context for global state management. This will provide a smoother user experience by avoiding a page reload and centralizing authentication logic.