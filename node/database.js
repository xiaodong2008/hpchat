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
    return new Promise(async (resolve) => {
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
        return new Promise((resolve) => {
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
            })
          }
        })
      },
      getData(userid) {
        return new Promise((resolve) => {
          query(
            "select * from `userdata` where `userid` = ? limit 1",
            [userid]
          ).then(result => {
            if (result.length === 0) {
              resolve(false);
            } else {
              resolve(result[0]);
            }
          })
        })
      }
    },
    friend: {
      isFriend(from, to) {
        return new Promise((resolve) => {
          query(
            "select * from `friend` where (`from` = '?' or `from` = '?') and (`to` = '?' or `to` = '?') limit 1",
            [from, to, from, to]
          ).then(result => {
            resolve(result.length !== 0 && result[0].to_delete === '0' && result[0].from_delete === '0' && result[0].approved === '1');
          })
        })
      },
      getFriends(userid) {
        let log = "select * from `friend` where (`from` = '?' and `approve` = '1' and `from_delete` = '0') or (`to` = '?' and `approve` = '1' and `to_delete` = '0')"
        log = log.replace(/\?/g, userid);
        console.log(log);
        return new Promise((resolve) => {
          query(
            "select * from `friend` where (`from` = ? and `approve` = '1' and `from_delete` = '0') or (`to` = ? and `approve` = '1' and `to_delete` = '0')",
            [userid, userid]
          ).then(result => {
            resolve(result);
          })
        })
      }
    }
  }
}