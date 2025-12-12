const APP_ID = 'b6950c7e6a5b4404ab947390b3904bbd' // <--- Double check your App ID is here!
const CHANNEL = sessionStorage.getItem('room_name')
// If the token is an empty string, this converts it to null
const TOKEN = sessionStorage.getItem('token') || null
let UID = Number(sessionStorage.getItem('UID'))

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () => {
    // Handle the event when a new user joins
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)
    
    // --- FIX: START CAMERA/MIC BEFORE JOINING ---
    // 1. Create our audio and video tracks
    // This ensures you see yourself even if the connection fails
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

    // 2. Create a player for our own video
    let player = `<div class="video-container" id="user-container-${UID}">
                     <div class="username-wrapper"><span class="user-name">My Stream</span></div>
                     <div class="video-player" id="user-${UID}"></div> 
                  </div>`
    
    // 3. Add the player to the DOM
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    // 4. Play the video track
    localTracks[1].play(`user-${UID}`)
    
    // --- NOW JOIN THE CHANNEL ---
    try {
        await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch (error) {
        console.error("Error joining Agora channel:", error)
        // Even if joining fails, you will still see your own video now.
        return 
    }

    // 5. Publish our tracks to the channel
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

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="username-wrapper"><span class="user-name">User ${user.uid}</span></div>
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
    window.location.href = '/'
}

// --- NEW: TOGGLE CAMERA/MIC FUNCTIONS ---

let toggleCamera = async (e) => {
    // Track 1 is the Video track
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera On'
        e.target.style.backgroundColor = '#fff' // White when active
    }else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera Off'
        e.target.style.backgroundColor = '#ff5555' // Red when disabled
    }
}

let toggleMic = async (e) => {
    // Track 0 is the Audio track
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