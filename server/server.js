var _ = require('underscore');
var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var port = (process.env.PORT || 3000);

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

var activityCheckDelay = 2000,
    slave,
    master,
    lastTick;

io.origins('localhost:* playcanvas.com:80 playcanv.as:80');

io.on('connection', function (socket) {
  socket.emit('greeting', { hello: 'world' });
  if (!master) {
    master = socket;
    console.log('Master connected');
    master.on('tick', function (data) {
      //var currentFramesCount = data.length;
      //totalFrames += currentFramesCount;
      //console.log('current frames received: ' + currentFramesCount);
      //console.log('last dt: ' + data[0].dt + ' last time: ' + data[0].time + ' frames total: ' + totalFrames);
      lastTick = _.now();

      if(slave)
        slave.emit('new_frame', {frames: data});
    });
  } else {
    console.log('Slave connected');
    slave = socket;
  }
});

setInterval(function() {
  if (master && slave && _.now() - lastTick >= activityCheckDelay) {

    console.log('Activity timed out');

    if (master) {
      master.disconnect();
      master = null;
      console.log('Master disconnected');
    }

    if (slave) {
      slave.disconnect();
      slave = null;
      console.log('Slave disconnected');
    }
  }
}, activityCheckDelay);

app.listen(port, function() {
  console.log('Node app is running on port', port);
});
