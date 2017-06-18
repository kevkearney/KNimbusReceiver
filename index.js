var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var radio = require('./radio.js');

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
 
    socket.on('weather message', function (msg) {
        socket.broadcast.emit('weather message', msg);
    });
    socket.on('lightning message', function (msg) {
	socket.broadcast.emit('lightning message', msg);
    });

});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
