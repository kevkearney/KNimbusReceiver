var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var radio = require('./radio.js');

var weatherDB = require("./data/weatherDB").weatherStream(io);

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
 
    socket.on('weather message', function (msg) {
        socket.broadcast.emit('weather message', msg);
      //  console.log('message message: ' + msg.toString());
    });
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
