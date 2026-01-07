let rtmClient;
let channel;

const handleMessage = (message) => {
    const messagesContainer = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.textContent = message.text;
    messagesContainer.appendChild(messageElement);
};

const sendMessage = async (text) => {
    channel.sendMessage({ text }).then(() => {
        const messagesContainer = document.getElementById("messages");
        const messageElement = document.createElement("div");
        messageElement.textContent = text;
        messagesContainer.appendChild(messageElement);
    });
};

const sendSystemMessage = async (text) => {
    channel.sendMessage({ text: `[SYSTEM] ${text}` }).then(() => {
        const messagesContainer = document.getElementById("messages");
        const messageElement = document.createElement("div");
        messageElement.textContent = `[SYSTEM] ${text}`;
        messagesContainer.appendChild(messageElement);
    });
};

const initRtm = async (uid) => {
    rtmClient = AgoraRTM.createInstance(APP_ID);
    await rtmClient.login({ uid, token:null });
    channel = rtmClient.createChannel(CHANNEL);
    await channel.join();

    channel.on("ChannelMessage", handleMessage);

    document.getElementById("guess-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const text = event.target.value;
            if (text) {
                sendMessage(text);
                checkGuess(text);
                event.target.value = "";
            }
        }
    });
};

initRtm(UID);