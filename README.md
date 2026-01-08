# Video Chat with Drawing Game

This project is a Django-based web application that provides video chat functionality augmented with an interactive drawing game, similar to Pictionary.

## Features

*   **User Authentication**: Full user management including sign-up, log-in, and profile editing.
*   **Video Chat Rooms**: Create and join private rooms for video and audio communication.
*   **Real-time Drawing Game**: Play a Pictionary-style game within the video chat, with real-time canvas synchronization.
*   **Agora.io Integration**: Utilizes Agora.io for robust real-time communication.

## How It Works

### Backend (Django)

The backend is structured as a Django project with several applications:

*   **`config`**: Handles the main project settings, URL routing, and basic home page views.
*   **`users`**: Manages all user-related functionalities, including user registration, authentication, and profile management. It uses a custom user model.
*   **`videochats`**: This is the core application for the video chat and game features. It defines the `Room` model, which stores information about each chat room (name, passcode, game state like current word, actor, etc.). It also handles the view logic for creating, joining, and managing rooms, as well as the game flow.

### Frontend (HTML, CSS, JavaScript)

The frontend is built using standard web technologies. The most critical part of the frontend is the `static/js/streams.js` file, which is responsible for orchestrating the real-time communication.

### Real-time Communication (Agora.io)

The application leverages [Agora.io](https://www.agora.io/) SDKs for all real-time functionalities:

*   **Video and Audio Streaming**: When users join a room, the Agora WebRTC SDK establishes peer-to-peer or relayed connections through Agora's servers, allowing for live video and audio exchange.
*   **Real-time Messaging (RTM)**: The Agora RTM SDK is used to synchronize the drawing game. Drawing strokes, new words, and game events are sent as data messages through RTM channels, ensuring all participants see the same drawing and game state simultaneously.

### The Drawing Game

The integrated drawing game functions like Pictionary:

1.  One user in the room is designated as the "actor" for a round.
2.  The actor receives a secret word they need to draw.
3.  The actor draws on a shared canvas, and their strokes are broadcast to all other users in real-time.
4.  Other users (guessers) attempt to guess the word based on the drawing.
5.  Game state (current actor, word, scores, etc.) is managed by the backend and updated via AJAX requests and RTM messages.

## Installation

Follow these steps to set up the project locally.

### Prerequisites

*   Python 3.8+
*   Git
*   An [Agora.io](https://www.agora.io/) Developer Account (to obtain an App ID)

### Setup Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/video_chat.git
    cd video_chat
    ```
    (Note: Replace `https://github.com/your-username/video_chat.git` with the actual repository URL if different.)

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Database Migrations:**
    ```bash
    python manage.py migrate
    ```

5.  **Create a Superuser (Optional but Recommended):**
    ```bash
    python manage.py createsuperuser
    ```
    Follow the prompts to create an administrator user.

6.  **Configure Agora.io App ID:**
    *   Log in to your [Agora.io Dashboard](https://dashboard.agora.io/).
    *   Create a new project or use an existing one to obtain your App ID.
    *   Open `config/settings.py` and add your Agora App ID:
        ```python
        # config/settings.py
        AGORA_APP_ID = "YOUR_AGORA_APP_ID"
        ```
        Alternatively, you can set it as an environment variable: `export AGORA_APP_ID="YOUR_AGORA_APP_ID"`.

## Usage

1.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```

2.  **Access the application:**
    Open your web browser and navigate to `http://127.0.0.1:8000/`.

3.  **Basic Workflow:**
    *   **Register/Login**: Create a new account or log in with an existing one.
    *   **Create a Room**: Go to the home page or a designated link to create a new video chat room. You can set a passcode for private rooms.
    *   **Join a Room**: Enter a room name and passcode (if required) to join an existing room. You can also share the room link with others.
    *   **Video Chat**: Once in a room, you can enable/disable your camera and microphone.
    *   **Play the Game**: If the game mode is active, take turns drawing or guessing words.

## Project Structure

```
.
├── config/                  # Main project configuration
│   ├── settings.py          # Django settings (including AGORA_APP_ID)
│   ├── urls.py              # Main URL dispatcher
│   └── ...
├── static/                  # Static assets (CSS, JS)
│   ├── css/
│   ├── js/
│   │   └── streams.js       # Frontend WebRTC and RTM logic
│   └── ...
├── users/                   # User authentication and profile management app
│   ├── models.py            # Custom user model
│   ├── views.py             # User-related views
│   └── ...
├── videochats/              # Video chat and drawing game app
│   ├── models.py            # Room model (stores game state, etc.)
│   ├── views.py             # Room and game logic views
│   └── ...
├── manage.py                # Django's command-line utility
├── README.md                # This file
├── requirements.txt         # Python dependencies
└── venv/                    # Python virtual environment
```
