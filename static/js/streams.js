const APP_ID = 'b6950c7e6a5b4404ab947390b3904bbd' 
const CHANNEL = sessionStorage.getItem('room_name')
const TOKEN = sessionStorage.getItem('token') || null
let UID = Number(sessionStorage.getItem('UID'))

//This initializes the client, allowing connection to the network
//rtc- Real Time Communication
//codec- compression format used for the video, VP8 is standard
const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
let channel;
let rtm;

const sendMessage = async (message) => {
    if (channel) {
        await channel.sendMessage({ text: JSON.stringify(message) });
    }
}


let localTracks = []
let remoteUsers = {}




// !!!!!THIS FUNCTION CONNECTS THE LOCAL USER TO THE SERVERS AND DISPLAYS THEIR OWN FEED!!!!!
let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    try {
        UID = await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch (error) {
        console.error("Error joining Agora channel:", error)
        window.location.href = '/'
        return 
    }

    // Login to RTM
    try {
        rtm = AgoraRTM.createInstance(APP_ID);
        await rtm.login({ uid: String(UID), token: TOKEN });
        channel = await rtm.createChannel(CHANNEL);
        await channel.join();
        rtm.on('ChannelMessage', ({ text }) => {
            const message = JSON.parse(text);
            if (message.type === 'game_mode_change') {
                const { mode } = message;
                const videoContainers = document.querySelectorAll('.video-container');
                const modes = Array.from(gameModes);
        
                videoContainers.forEach(container => {
                    modes.forEach(m => container.classList.remove(m));
                    container.classList.remove('normal');
                    if (mode !== 'normal') {
                        container.classList.add(mode);
                    }
                });
        
                const gameModeName = mode.replace(/-/g, ' ');
                // Find the h2 element and update its text
                const roomNameElement = document.querySelector('h2');
                if (roomNameElement) {
                    const originalText = roomNameElement.textContent.split('(')[0].trim();
                    roomNameElement.textContent = `${originalText} (${gameModeName})`;
                }
            }
        });
    } catch (error) {
        console.error("RTM login failed:", error);
    }

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    let player = `<div class="video-container" id="user-container-${UID}">
                     <div class="username-wrapper"><span class="user-name">My Stream</span></div>
                     <div class="video-player" id="user-${UID}"></div> 
                  </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    localTracks[1].play(`user-${UID}`)
    await client.publish([localTracks[0], localTracks[1]])
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove()
        }

        let response = await fetch(`/get_name/?uid=${user.uid}`)
        let data = await response.json()
        let firstName = data.name

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="username-wrapper"><span class="user-name">${firstName}</span></div>
                        <div class="video-player" id="user-${user.uid}"></div>
                 </div>`
        
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    let item = document.getElementById(`user-container-${user.uid}`)
    if(item){
        item.remove()
    }
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    if (rtm) {
        await rtm.logout();
    }
    window.location.href = '/'
}


let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera On'
        e.target.style.backgroundColor = '#fff' 
    }else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera Off'
        e.target.style.backgroundColor = '#ff5555' 
    }
}

let toggleMic = async (e) => {
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic On'
        e.target.style.backgroundColor = '#fff'
    }else{
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic Off'
        e.target.style.backgroundColor = '#ff5555'
    }
}

joinAndDisplayLocalStream()

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)

const gameModes = new Set(["blinking-screen", "black-and-white", "short-time", "on-and-off-cam", "reverse"]);

const activateGameMode = () => {
    const modes = Array.from(gameModes);
    const randomMode = Math.random() < 0.5 ? 'normal' : modes[Math.floor(Math.random() * modes.length)];
    
    // Send message to all clients
    sendMessage({ type: 'game_mode_change', mode: randomMode });
};

const hostId = sessionStorage.getItem('host_id');
if (String(UID) === hostId) {
    const gameModeButton = document.getElementById('game-mode-btn');
    if (gameModeButton) {
        gameModeButton.addEventListener('click', activateGameMode);
    }
};