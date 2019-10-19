const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8001 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    var fs = require('fs');
    fs.writeFile('./test.js', message, function (err) {
      if (err) console.error(err);
      var shell = require('shelljs');
      shell.exec('testcafe chrome ./test.js -e --speed 0.2', function(code, stdout, stderr) {
        console.log('Exit code:', code);
        ws.send(stdout);
      });
    });
  });

  ws.send('connected!');
});