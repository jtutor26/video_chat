const APP_ID = 'b6950c7e6a5b4404ab947390b3904bbd' 
const CHANNEL = sessionStorage.getItem('room_name')
const TOKEN = sessionStorage.getItem('token') || null
let UID = Number(sessionStorage.getItem('UID'))

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}
let players = []
let currentActorIndex = 0;

let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    players.push(UID);

    let player = `<div class="video-container" id="user-container-${UID}">
                     <div class="username-wrapper"><span class="user-name">My Stream</span></div>
                     <div class="video-player" id="user-${UID}"></div> 
                  </div>`

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)
    localTracks[1].play(`user-${UID}`)

    try {
        await client.join(APP_ID, CHANNEL, TOKEN, UID)
    } catch (error) {
        console.error("Error joining Agora channel:", error)
        return 
    }

    await client.publish([localTracks[0], localTracks[1]])
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    players.push(user.uid);
    await client.subscribe(user, mediaType)

    setTimeout(() => {
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
    }, 1000);
    sendSystemMessage(`User ${user.uid} has joined the room.`);
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    players = players.filter(uid => uid !== user.uid);
    let item = document.getElementById(`user-container-${user.uid}`)
    if(item){
        item.remove()
    }
    sendSystemMessage(`User ${user.uid} has left the room.`);
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }
    await client.leave()
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

function getCurrentActor() {
    return players[currentActorIndex];
}

function nextActor() {
    currentActorIndex = (currentActorIndex + 1) % players.length;
}

joinAndDisplayLocalStream()

document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)