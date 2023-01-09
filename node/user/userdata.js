async function userdata(req, res) {
  const response = require('../response.js')(res);
  const mysql = await require('../database.js')(res);

  // check method
  if (req.method !== "GET") {
    return response(405, `405 Method Not Allowed: ${req.method}`, false);
  }

  mysql.user.isLogin().then(
    async result => {
      if (result) {
        // update expire time
        let expire_time = mysql.now() + 1000 * 60 * 60 * 24;
        await mysql.query(
          "update `userlogin` set `expire_time` = ? where `token` = ?",
          [expire_time, req.headers.authorization]
        )
      }
      return response(200, {
        "login": !!result,
        "userid": result?.userid || null,
        "nickname": result?.nickname || null
      })
    })
}

module.exports = userdata