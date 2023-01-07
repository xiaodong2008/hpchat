async function userdata(req, res) {
  const response = require('../response.js')(res);
  const mysql = await require('../database.js')(res);

  // check method
  if (req.method !== "GET") {
    return response(405, `405 Method Not Allowed: ${req.method}`, false);
  }

  const token = req.headers.authorization;

  if (!token) {
    return response(200, {
      "login": false,
      "userid": null,
      "nickname": null
    })
  } else {
    mysql.query(
      "select * from `userlogin` where `token` = ? and `expire_time` > ? limit 1",
      [token, new Date().toISOString().replace('T', ' ').replace('Z', '')]
    ).then(
      result => {
        if (result.length === 0) {
          return response(200, {
            "login": false,
            "userid": null,
            "nickname": null
          })
        }
        result = result[0];
        mysql.user.getData(result.userid).then(
          result => {
            if (result.length === 0) {
              return response(200, {
                "login": false,
                "userid": null,
                "nickname": null
              })
            }
            // update expire time
            let expire_time = new Date().getTime() + 1000 * 60 * 60 * 24;
            expire_time = new Date(expire_time).toISOString().replace('T', ' ').replace('Z', '');
            mysql.query(
              "update `userlogin` set `expire_time` = ? where `token` = ?",
              [expire_time, token]
            ).then(() => {
              return response(200, {
                "login": true,
                "userid": result.userid,
                "nickname": result.nickname
              })
            })
          }
        )
      })
  }
}

module.exports = userdata