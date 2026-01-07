const APP_ID = 'b6950c7e6a5b4404ab947390b3904bbd' 
const CHANNEL = sessionStorage.getItem('room_name')
const TOKEN = sessionStorage.getItem('token') || null
let UID = Number(sessionStorage.getItem('UID'))

//This initializes the client, allowing connection to the network
//rtc- Real Time Communication
//codec- compression format used for the video, VP8 is standard
const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}


// !!!!!THIS FUNCTION CONNECTS THE LOCAL USER TO THE SERVERS AND DISPLAYS THEIR OWN FEED!!!!!
let joinAndDisplayLocalStream = async () => {
    //These are event listeners, and theyre looking for when a user starts a stream, or leaves.
    //The functions can be found below
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)
    // this grabs the camera and mic inputs and puts them in an array
    //[0] is audio
    //[1] is video
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    let player = `<div class="video-container" id="user-container-${UID}">
                     <div class="username-wrapper"><span class="user-name">My Stream</span></div>
                     <div class="video-player" id="user-${UID}"></div> 
                  </div>`
    //inserts the HTML above into the 'video-streams' div in room.html
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    //this injects the video from the local user into the HTML element with the id "user-${UID}"
    //the HTML element can be found in the player above
    localTracks[1].play(`user-${UID}`)
    //This connecets our client to agora's servers
    //APP_ID identifies the agora project
    //CHANNEL identifies the specific room
    try {
        await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch (error) {
        console.error("Error joining Agora channel:", error)
        return 
    }
    //This uploads the user's camera and mic to the servers, letting other users see them
    await client.publish([localTracks[0], localTracks[1]])
}


// !!!!!THIS FUNCTION IS FOUND THE IN 'joinAndDisplayLocalStream' IN THE EVENT LISTNERS!!!!!
let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    //user - object representing other user
    //mediatype- agora sends audio and video seperate, and this function will run twice to check both.
    //.subscribe- this downloads that users data to the client
    await client.subscribe(user, mediaType)
    //creates the HTML <div>, adds it to the grid, and plays the video track
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
    //just plays the audio if the media type is the mic input
    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
}
//if a remote user leaves, this removes their video from the grid.
let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    let item = document.getElementById(`user-container-${user.uid}`)
    if(item){
        item.remove()
    }
}
//loops through both the mic and video, stopping and closing them
let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    let roomUUID = sessionStorage.getItem('room_uuid')
    if(roomUUID){
        // 'await' to make sure the server gets the message before we redirect
        await fetch(`/room/${roomUUID}/delete/`) 
    }

    //.leave() triggers 'user-left' for everyone else in the room
    await client.leave()
    //redirects back to the home page
    window.location.href = '/'
}

//!!!!!BOTH TOGGLE FUNCTIONS WORK VERY SIMILAR AND SELF-EXPLAINITORY!!!!!
let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        //actually stops sending data bits to the server. This saves bandwidth and ensures total privacy
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
    const videoContainers = document.querySelectorAll('.video-container');
    const modes = Array.from(gameModes);
    
    // 50% chance for normal mode
    const randomMode = Math.random() < 0.5 ? 'normal' : modes[Math.floor(Math.random() * modes.length)];

    videoContainers.forEach(container => {
        // Remove all previous game mode classes
        modes.forEach(mode => container.classList.remove(mode));
        container.classList.remove('normal');

        // Add the new game mode class
        if (randomMode !== 'normal') {
            container.classList.add(randomMode);
        }
    });
};

document.getElementById('game-mode-btn').addEventListener('click', activateGameMode);