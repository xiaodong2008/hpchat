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

  const target = req.body.uname;

  const targetUser = await mysql.query(
    "select * from `userdata` WHERE `userid` = ? or `email` = ?",
    [target, target]
  )

  if (targetUser.length === 0) {
    return response(404, {
      "message": {
        "zh": "用户不存在"
      }
    })
  }

  const targetUserid = targetUser[0].userid;
  if (targetUserid === user.userid) {
    return response(400, {
      "message": {
        "zh": "不能添加自己为好友"
      }
    })
  }

  // check is friend or already sent request
  const isFriend = await mysql.query(
    "select * from `friend` WHERE (`from` = ? and `to` = ?) or (`from` = ? and `to` = ?)",
    [user.userid, targetUserid, targetUserid, user.userid]
  )
  if (isFriend.length !== 0) {
    return response(400, {
      "message": {
        "zh": "请勿重复发送好友请求"
      }
    })
  }

  // send friend request
  await mysql.query(
    "insert into `friend` (`from`, `to`, `create_time`, `approve`, `approve_time`, `from_delete`, `to_delete`) values (?, ?, ?, '0', null, '0', '0')",
    [user.userid, targetUserid, new Date().toISOString().slice(0, 19).replace('T', ' ')]
  )

  response(200, {
    "message": {
      "zh": "好友请求已发送"
    }
  })
}


module.exports = friend;