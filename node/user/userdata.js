async function userdata(req, res) {
  const response = require('../response.js')(res);
  const mysql = require('../database.js')(res);

  // check method
  if (req.method !== "GET") {
    return response(405, `405 Method Not Allowed: ${req.method}`, false);
  }

  mysql.user.isLogin().then(
    async result => {
      let userdata
      if (result) {
        // update expire time
        let expire_time = mysql.now() + 1000 * 60 * 60 * 24;
        await mysql.query(
          "update `userlogin` set `expire_time` = ? where `token` = ?",
          [expire_time, req.headers.authorization]
        )
        userdata = await mysql.user.getData(result.userid);
      }
      return response(200, {
        "login": !!result,
        "userid": userdata?.userid || null,
        "nickname": userdata?.nickname || null,
        "email": userdata?.email || null,
        "avatar": userdata?.avatar || null,
      })
    })
}

module.exports = userdata