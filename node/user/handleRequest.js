async function friend(req, res) {
  const response = require('../response.js')(res);
  const mysql = await require('../database.js')(res);
  const user = await mysql.user.isLogin();
  if (user === false) {
    return response(401, {
      "message": {
        "zh": "请先登录"
      }
    })
  }

  const friend = req.body.userid;

  // is this exist
  const request = await mysql.query(
    "select * from `friend` WHERE `from` = ? and `to` = ? and `approve` = '0'",
    [friend, user.userid]
  )

  if (request.length === 0) {
    return response(400, {
      "message": {
        "zh": "请求不存在"
      }
    })
  }

  if (req.body.approve === true) {
    // approve
    await mysql.query(
      "update `friend` set `approve` = '1', `approve_time` = ? where `from` = ? and `to` = ?",
      [new Date().toISOString().slice(0, 19).replace('T', ' '), friend, user.userid]
    )
  } else {
    // reject
    await mysql.query(
      "delete from `friend` where `from` = ? and `to` = ?",
      [friend, user.userid]
    )
  }

  response(200, {
    "message": {
      "zh": "操作成功"
    }
  })
}

module.exports = friend;