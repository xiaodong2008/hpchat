const mysql = require('mysql');
const fs = require('fs');
const secret = require('./secret.json');

const isDev = process.env.NODE_ENV === 'development';

const connection = mysql.createConnection({
  host: 'localhost',
  user: isDev ? secret.mysql.dev.username : secret.mysql.product.username,
  password: isDev ? secret.mysql.dev.password : secret.mysql.product.password,
  database: "hpchat",
  connectTimeout: 1000 * 60 * 10,
})


module.exports = async res => {
  let response
  if (res) response = require('./response.js')(res);
  const query = (sql, params, callback) => {
    return new Promise(async (resolve, reject) => {
      // check mysql connection is timeout
      if (connection.state === 'disconnected') {
        await connection.connect();
      }
      connection.query(sql, params, (err, result) => {
        if (err) {
          if (callback) callback(err);
          if (!fs.existsSync('./error_log.txt')) {
            fs.writeFileSync('./error_log.txt', '');
          }
          const file = fs.readFileSync('error_log.txt');
          const path = res.req.url;
          const message = `[${new Date().toLocaleString()}] ${path} | ${sql} | ${err.message}\n`;
          fs.writeFileSync('error_log.txt', message + file);
          if (res) response(500, {
            "message": {
              "zh": "数据库异常，请查看日志",
            }
          })
          reject();
        } else {
          resolve(result);
          if (callback) callback(null, result);
        }
      })
    })
  }
  return {
    query,
    user: {
      isLogin(token = res.req.headers.authorization) {
        return new Promise((resolve, reject) => {
          if (!token) {
            resolve(false);
          } else {
            query(
              "select * from `userlogin` where `token` = ? and `expire_time` > ? limit 1",
              [token, new Date().toISOString().replace('T', ' ').replace('Z', '')]
            ).then(result => {
              if (result.length === 0) {
                resolve(false);
              } else {
                resolve(result[0]);
              }
            }).catch(err => {
              void err;
              reject();
            })
          }
        })
      }
    },
    friend: {
      isFriend(from, to, userid) {
        return new Promise((resolve, reject) => {
          let target = "from"
          if (userid === to) {
            let temp = from;
            from = to;
            to = temp;
            target = "to";
          }
          query(
            "select * from `friend` where `from` = ? and `to` = ? " + `${target}_delete` + " = '0' limit 1",
            [from, to]
          ).then(result => {
            resolve(result.length !== 0);
          }).catch(err => {
            void err;
            reject();
          })
        })
      }
    }
  }
}