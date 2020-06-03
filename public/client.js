function getLVideo(callbacks) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    var constraints = {
        audio: true,
        video: true
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
var room = url.searchParams.get("r");
var urls = window.location.origin;
console.log(room)

if (room == null) {
    document.getElementById("crt_button").style.visibility = 'none';
    document.getElementById("conn_button").style.visibility = 'hidden';
    document.getElementById("call_button").style.visibility = 'hidden';
}
else if (room != null) {
    document.getElementById("crt_button").style.visibility = 'hidden';
    document.getElementById("conn_button").style.visibility = 'none';
    document.getElementById("call_button").style.visibility = 'hidden';
}


// create a peer connection with peer obj or create you own using peer server docs
var peer = new Peer();

// display the peer id on the DOM 
peer.on('open', function () {
    document.getElementById("displayId").value = peer.id
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
document.getElementById('crt_button').addEventListener('click', function () {
    document.getElementById('link').href = urls + '?r=' + document.getElementById('displayId').value;
    document.getElementById('link').innerHTML = urls + '?r=' + document.getElementById('displayId').value;
    document.getElementById('conn_button').style.visibility = 'hidden';
    document.getElementById('call_button').style.visibility = 'hidden';
    document.getElementById('crt_button').style.visibility = 'hidden';
})



document.getElementById('conn_button').addEventListener('click', function () {
    if (room) {
        document.getElementById('connId').value = room;
    }
    document.getElementById('conn_button').style.visibility = 'hidden';
    document.getElementById('call_button').style.visibility = 'none';
    var idCli = document.getElementById("connId").value;
    // if there is a peer id, use global var to connect with current peerid
    if (idCli) {
        conn = peer.connect(idCli)
    } else {
        alert("enter an id");
        return false;
    }
})
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
