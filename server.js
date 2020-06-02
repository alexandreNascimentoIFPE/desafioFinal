const express = require('express');
const { ExpressPeerServer } = require('peer');

const app = express();


// serving our index.html 
    app.get('/', (req, res) => {
        res.sendFile(__dirname + "/index.html")
    })
    const server = app.listen(9000);
    const peerServer = ExpressPeerServer(server, {
        path: '/'
      });
      
      app.use('/peerjs', peerServer);
    // allows files in this folder to be served all the time
    app.use(express.static('public'));
