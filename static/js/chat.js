// Declaring globally
rtmClient;
channel;
sendSystemMessage;

const handleMessage = (message) => {
    const messagesContainer = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.textContent = message.text;
    messagesContainer.appendChild(messageElement);

    // Try to parse as JSON for game state synchronization
    try {
        const data = JSON.parse(message.text);
        if (data.type === 'gameModeChange') {
            activeGameMode = data.gameMode;
            applyGameModeEffects();
            // Display system message in chat for game mode change
            sendSystemMessage(`New game mode: ${activeGameMode}`);
        }
    } catch (e) {
        // Not a JSON message, handle as regular chat or system message
        if (message.text.startsWith('[SYSTEM] New game mode: ')) {
            // This is a fallback if the JSON parsing fails or if old messages are received
            const newGameMode = message.text.substring('[SYSTEM] New game mode: '.length);
            activeGameMode = newGameMode;
            applyGameModeEffects();
        }
    }
};

const sendMessage = async (text) => {
    channel.sendMessage({ text }).then(() => {
        const messagesContainer = document.getElementById("messages");
        const messageElement = document.createElement("div");
        messageElement.textContent = `You: ${text}`; // Prepend "You:" for local user
        messagesContainer.appendChild(messageElement);
    });
};

sendSystemMessage = async (text) => { // Assign to global variable
    const systemMessage = `[SYSTEM] ${text}`;
    channel.sendMessage({ text: systemMessage }).then(() => {
        const messagesContainer = document.getElementById("messages");
        const messageElement = document.createElement("div");
        messageElement.textContent = systemMessage;
        messagesContainer.appendChild(messageElement);
    });
};

const initRtm = async (uid) => {
    rtmClient = AgoraRTM.createInstance(APP_ID);
    await rtmClient.login({ uid: String(uid), token:null }); // UID must be a string for RTM
    channel = rtmClient.createChannel(CHANNEL);
    await channel.join();

    channel.on("ChannelMessage", handleMessage);

    document.getElementById("guess-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const text = event.target.value;
            if (text) {
                sendMessage(text);
                // checkGuess(text); // checkGuess is now handled by game rules
                event.target.value = "";
            }
        }
    });
};

initRtm(UID);