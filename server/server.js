var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(3000);

function handler (req, res) {
  console.log('In handler');
  fs.readFile(__dirname + '/index.html',
      function (err, data) {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
      });
}

var totalFrames = 0, client = null;
io.on('connection', function (socket) {
  socket.emit('greeting', { hello: 'world' });
  if (!client) {
    client = socket;
  } else {
    socket.on('tick', function (data) {
      //var currentFramesCount = data.length;
      //totalFrames += currentFramesCount;
      //console.log('current frames received: ' + currentFramesCount);
      //console.log('last dt: ' + data[0].dt + ' last time: ' + data[0].time + ' frames total: ' + totalFrames);
      client.emit('new_frame', {frames: data});
    });
  }
});
