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
    } else if (req.url === '/user/register') {
      require('./user/register.js')(req, res);
    } else if (req.url === '/user/add') {
      require('./user/add.js')(req, res);
    } else if (req.url === '/user/request') {
      require('./user/request.js')(req, res);
    } else if (req.url === '/user/friends') {
      require('./user/friend.js')(req, res);
    } else if (req.url === '/user/handleRequest') {
      require('./user/handleRequest.js')(req, res);
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
const onlineUsers = {};
websocket.on('connection', (user) => {
  console.log('connection');
  user.on('message', async (msg) => {
    msg = JSON.parse(msg);
    console.log(msg);

    const mysql = await require('./database.js')();
    const userdata = await mysql.user.isLogin(msg.token);
    if (msg.type === 'login') {
      user.send(JSON.stringify({
        type: 'login',
        success: userdata !== false,
        handshake: 2
      }))
      if (userdata !== false) {
        if (!onlineUsers[userdata.userid]) {
          onlineUsers[userdata.userid] = [];
        }
        onlineUsers[userdata.userid].push(user);
      }
    } else if (msg.type === 'message') {
      // 鉴权
      // if from !== user.userid
      if (msg.token) {
        const userid = (await mysql.user.isLogin(msg.token)).userid;
        if (userid === msg.data.from) {
          // 是否为好友
          const friend = await mysql.query(
            "select * from `friend` WHERE (`from` = ? AND `to` = ?) OR (`from` = ? AND `to` = ?)",
            [userid, msg.data.to, msg.data.to, userid]
          )
          if (friend.length === 0 || friend[0].from_delete === '1' || friend[0].to_delete === '1' || friend[0].approve === '0') {
            return
          }

          // 发送消息
          const toUser = onlineUsers[msg.data.to];

          const hex = require('crypto').randomBytes(64).toString('hex');
          const time = new Date().toISOString().slice(0, 19).replace('T', ' ');
          // 保存消息
          await mysql.query(
            "insert into `message-temp` (`from`, `to`, `time`, `message`, `hex`) values (?, ?, ?, ?, ?)",
            [msg.data.from, msg.data.to, time, msg.data.message, hex]
          )
          if (toUser) {
            toUser.forEach(user => {
              user.send(JSON.stringify({
                type: 'message',
                data: {
                  from: msg.data.from,
                  to: msg.data.to,
                  message: msg.data.message,
                  time,
                  hex
                }
              }))
            })
          }
          user.send(JSON.stringify({
            type: 'success',
            id: msg.iwant,
            time
          }))
        }
      }
    } else if (msg.type === 'receive') {
      // 鉴权
      // if from !== user.userid
      if (msg.token) {
        const user = await mysql.user.isLogin(msg.token);
        if (user.userid === msg.data.to) {
          // 删除消息
          await mysql.query(
            "delete from `message-temp` where `hex` = ? and `to` = ? and `from` = ?",
            [msg.data.hex, msg.data.to, msg.data.from]
          )
        }
      }
    }
  })
})

server.listen(1051, () => {
  console.log('Server is running at http://localhost:1051');
})

