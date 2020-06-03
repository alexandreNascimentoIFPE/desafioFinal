function getLVideo(callbacks) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    var constraints = {
        audio: true,
        video: { width: 500, height: 500 }
    }
    navigator.getUserMedia(constraints, callbacks.success, callbacks.error)

}

// diplay our stream if we have permission of the media
function recStream(stream, elemid) {
    var video = document.getElementById(elemid);

    video.srcObject = stream;

    window.peer_stream = stream;
}
// function takes in a obj for the promise of using the media or not
getLVideo({
    success: function (stream) {
        window.localstream = stream;
        recStream(stream, 'lVideo');
    },
    error: function (err) {
        alert("cannot access your camera");
        console.log(err);
    }
})

// global variables for assign local and remote
var conn;
var peer_id;
var url_string = window.location.href;
var url = new URL(url_string);
var r = url.searchParams.get("r");

// create a peer connection with peer obj or create you own using peer server docs
var peer = new Peer({
    config: {
        'iceServers': [
            { url: 'stun:stun.l.google.com:19302' },
            { url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
        ]
    }
});

// display the peer id on the DOM 
peer.on('open', function () {
    document.getElementById("displayId").innerHTML = peer.id
    console.log(peer.id);
    document.getElementById('link').innerHTML = url_string + '?r=' + peer.id;
    document.getElementById('link').href = url_string + '?r=' + peer.id;
    console.log(url_string + '?r=' + peer.id);
})

// when a client connects to another connected client
peer.on('connection', function (connection) {
    conn = connection;
    peer_id = connection.peer

    document.getElementById('connId').value = peer_id;
});

// 
peer.on('error', function (err) {
    alert("an error has happened:" + err);
    console.log(err);
})
// onclick connection button 
function conectar(peer_id) {
    if (peer_id) {
        conn = peer.connect(peer_id)
    } else {
        alert("enter an id");
        return false;
    }
}
if (r) {
    document.getElementById("connId").value = r;
    peer_id = document.getElementById("connId").value;
    // if there is a peer id, use global var to connect with current peerid
    conectar(peer_id);
}
// call when call button is clicked
peer.on('call', function (call) {

    // this prompt can act funny if the browser tab is not ACTIVE it can return false
    var acceptCall = confirm("Do you want to answer this call?");
    // if accpt, exchange across the browser
    if (acceptCall) {
        call.answer(window.localstream);

        call.on('stream', function (stream) {

            window.peer_stream = stream;

            recStream(stream, 'rVideo')
        });
        // display alert if call is denien
        call.on('close', function () {
            alert('The call has been denind');
        })
    } else {
        console.log("call denied")
    }
});

// fires to the call event to initiate a call 
document.getElementById('call_button').addEventListener('click', function () {
    console.log("calling a peer: " + peer_id);
    console.log(peer);

    // using our peer id to call the other then to display each others media
    var call = peer.call(peer_id, window.localstream);

    call.on('stream', function (stream) {
        window.peer_stream = stream;

        recStream(stream, 'rVideo');
    })
}); 
