const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {}
let myVideoStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });
});

socket.on('user-disconnect', userId => {
    if (peers[userId]) peers[userId].close();
});


myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove();
    })

    peers[userId] = call
}

function addVideoStream( video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);

}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }
  
  const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }

  const leaveMeeting = () => {
      window.close();
  }

  const setMuteButton = () => {
    const html = `
      <span>Mute</span>
    `
    document.querySelector('.mute-button').innerHTML = html;
  }
  
  const setUnmuteButton = () => {
    const html = `
      <span>Unmute</span>
    `
    document.querySelector('.mute-button').innerHTML = html;
  }
  
  const setStopVideo = () => {
    const html = `
      <span>Stop Video</span>
    `
    document.querySelector('.video-button').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `
      <span>Play Video</span>
    `
    document.querySelector('.video-button').innerHTML = html;
  }
