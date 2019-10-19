const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8001 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    //写入文件
    var fs = require('fs');
    //console.log('准备写入文件');
    fs.writeFile('./test.js', message, function (err) {
      if (err) console.error(err);
      //console.log('数据写入的数据');

      //运行脚本
      var shell = require('shelljs');
      shell.exec('testcafe chrome ./test.js -e --speed 0.2', function(code, stdout, stderr) {
        console.log('Exit code:', code);
        ws.send(stdout);
        //console.log('Program output:', stdout);
        //console.log('Program stderr:', stderr);
      });
    });

  });

  ws.send('something');
});