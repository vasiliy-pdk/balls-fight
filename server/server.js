var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var cluster = require('./gamesCluster');
var port = (process.env.PORT || 3000);

function handler (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('it is running\n');
}

//io.origins('*');
//io.origins('localhost:* playcanvas.com:80 playcanv.as:80');

io.on('connection', function (socket) {
  socket.emit('greeting', { hello: 'world' });
  cluster.dispatchPlayer(socket);
});

app.listen(port, function() {
  console.log('Node app is running on port', port);
});
