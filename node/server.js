const http = require('http');
const ws = require('ws');
const fs = require("fs");

const server = http.createServer((req, res) => {
  console.log(req.url);
  const response = require('./response.js')(res);

  const path = req.url.split('?')[0];

  let body = "";

  req.on('data', (chunk) => {
    body += chunk;
  })
  req.on('end', () => {
      const url = req.url.split('?')[0];
      try {
        req.body = body && JSON.parse(body);
      } catch (e) {
      }
      if (url === '/user/userdata') {
        require('./user/userdata.js')(req, res);
      } else if (url === '/user/login') {
        require('./user/login.js')(req, res);
      } else if (url === '/user/register') {
        require('./user/register.js')(req, res);
      } else if (url === '/user/add') {
        require('./user/add.js')(req, res);
      } else if (url === '/user/request') {
        require('./user/request.js')(req, res);
      } else if (url === '/user/friends') {
        require('./user/friend.js')(req, res);
      } else if (url === '/user/handleRequest') {
        require('./user/handleRequest.js')(req, res);
      } else if (url === '/user/edit') {
        require('./user/edit.js')(req, res);
      } else if (url === '/user/avatar') {
        require('./user/avatar.js')(req, res);
      } else if (/^\/avatar\/[a-z0-9_]+\.(jpg|png|jpeg)$/.test(url)) {
        // 返回文件
        fs.readFile(`./data/${url}`,
          (err, data) => {
            if (err) {
              response(404, `File not exist: ${path}`, false);
            } else {
              res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'max-age=31536000',
              });
              res.end(data);
            }
          })
      } else {
        response(404, `404 Not Found: ${path}`, false);
      }
    }
  )
})

const websocket = new ws.WebSocketServer({
  server,
  path: '/chat',
  // no timeout
  clientTracking: false,
});
// ws connection
const onlineUsers = {};
const unReadMessage = {};
websocket.on('connection', (user) => {
  console.log('connection');
  user.on('message', async (msg) => {
    msg = JSON.parse(msg);
    console.log(msg);

    const mysql = require('./database.js')();
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
          const time = mysql.now();

          // 等待5秒，如果对方不在线，就存入数据库
          unReadMessage[msg.data.to] = unReadMessage[msg.data.to] || [];
          unReadMessage[msg.data.to].push(hex);

          setTimeout(async () => {
            const index = unReadMessage[msg.data.to].indexOf(hex);
            if (index !== -1) {
              // 存入数据库
              await mysql.query(
                "insert into `message-temp` (`from`, `to`, `message`, `time`, `hex`) values (?, ?, ?, ?, ?)",
                [msg.data.from, msg.data.to, msg.data.message, time, hex]
              )
              // 加上timeout字符串
              unReadMessage[msg.data.to][index] += 'timeout';
            }
          }, 5000);

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
          // 检查是否超过5秒，因此需要从数据库中删除
          const index = unReadMessage[msg.data.to].indexOf(msg.data.hex + "timeout");
          if (index !== -1) {
            // 删除消息
            await mysql.query(
              "delete from `message-temp` where `hex` = ? and `to` = ? and `from` = ?",
              [msg.data.hex, msg.data.to, msg.data.from]
            )
            // 删除unReadMessage
            unReadMessage[msg.data.to].splice(index, 1);
          }
          // 如果没有超过5秒，就删除unReadMessage
          const index2 = unReadMessage[msg.data.to].indexOf(msg.data.hex);
          if (index2 !== -1) {
            unReadMessage[msg.data.to].splice(index2, 1);
          }
        }
      }
    }
  })
})

server.listen(1051, () => {
  console.log('Server is running at http://localhost:1051');
})

