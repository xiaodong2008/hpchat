const http = require('http');
const ws = require('ws');

const server = http.createServer((req, res) => {
  console.log(req.url);
  const response = require('./response.js')(res);

  const path = req.url.split('?')[0];

  let body = "";

  req.on('data', (chunk) => {
    body += chunk;
  })
  req.on('end', () => {
    req.body = body && JSON.parse(body) || {};
    if (req.url === '/user/userdata') {
      require('./user/userdata.js')(req, res);
    } else if (req.url === '/user/login') {
      require('./user/login.js')(req, res);
    } else if (req.url === '/user/friend') {
      require('./user/userdata.js')(req, res);
    } else {
      response(404, `404 Not Found: ${path}`, false);
    }
  })
})

const websocket = new ws.WebSocketServer({
  server,
  path: '/chat'
});
// ws connection
websocket.on('connection', (user) => {
  console.log('connection');
  user.on('message', async (msg) => {
    msg = JSON.parse(msg);
    console.log(msg);

    const mysql = await require('./database.js')();
    console.log(mysql)
    const userdata = await mysql.user.isLogin(msg.data.token);
    if (msg.type === 'login') {
      user.send(JSON.stringify({
        type: 'login',
        success: userdata !== false,
        handshake: 2
      }))
    }
  })
})

server.listen(1051, () => {
  console.log('Server is running at http://localhost:1051');
})

