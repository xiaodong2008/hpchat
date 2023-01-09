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
  const query = (sql, params, handle_error = false) => {
    return new Promise(async (resolve, reject) => {
      connection.query(sql, params, (err, result) => {
        if (err) {
          if (!fs.existsSync('./error_log.txt')) {
            fs.writeFileSync('./error_log.txt', '');
          }
          const file = fs.readFileSync('error_log.txt');
          const path = res?.req?.url || 'unknown';
          const message = `[${new Date().toLocaleString()}] ${path} | ${sql} | ${err.message}\n`;
          fs.writeFileSync('error_log.txt', message + file);
          if (handle_error) {
            reject(result);
          } else if (res) response(500, {
            "message": {
              "zh": "数据库异常，请查看日志",
            }
          })
        } else {
          resolve(result);
        }
      })
    })
  }
  const now = () => {
    return Date.now() + new Date().getTimezoneOffset() * 60 * 1000;
  }
  return {
    query,
    // get now time (utc +0) in timestamp
    now,
    user: {
      isLogin(token = res?.req?.headers?.authorization) {
        return new Promise((resolve) => {
          if (!token) {
            resolve(false);
          } else {
            query(
              "select * from `userlogin` where `token` = ? and `expire_time` > ? limit 1",
              [token, now()]
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
      getData(userinfo) {
        return new Promise((resolve) => {
          let sql
          // if uid
          if (/^\d+$/.test(userinfo)) sql = "select * from `userdata` where `userid` = ? limit 1";
          // if email
          else if (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(userinfo)) sql = "select * from `userdata` where `email` = ? limit 1";
          query(
            sql,
            [userinfo]
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
            "select * from `friend` where (`from` = ? or `from` = ?) and (`to` = ? or `to` = ?) limit 1",
            [from, to, from, to]
          ).then(result => {
            resolve(result.length !== 0 && result[0].to_delete === '0' && result[0].from_delete === '0' && result[0].approved === '1');
          })
        })
      },
      getFriends(userid) {
        const friends = [];
        return new Promise((resolve) => {
          query(
            "select * from `friend` where `from` = ? or `to` = ?",
            [userid, userid]
          ).then(result => {
            for (let friend of result) {
              if (friend.to_delete === 0 && friend.from_delete === 0 && friend.approve === 1) {
                friends.push(friend);
              }
            }
            resolve(friends);
          })
        })
      }
    }
  }
}