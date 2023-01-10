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
    "select * from `friend` WHERE `from` = ? and `to` = ?",
    [friend, user.userid]
  )

  if (request.length === 0) {
    return response(400, {
      "message": {
        "zh": "请求不存在"
      }
    })
  } else if (request[0].approve === 1) {
    return response(400, {
      "message": {
        "zh": "请勿重复操作"
      }
    })
  }

  if (req.body.approve === true) {
    // approve
    await mysql.query(
      "update `friend` set `approve` = true, `approve_time` = ? where `from` = ? and `to` = ?",
      [mysql.now(), friend, user.userid]
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