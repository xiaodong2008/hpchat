async function friend(req, res) {
  const response = require('../response.js')(res);
  const mysql = require('../database.js')(res);
  const user = await mysql.user.isLogin();

  if (user === false) {
    return response(401, {
      "message": {
        "zh": "请先登录"
      }
    })
  }

  const target = req.body.uname;

  const targetUser = await mysql.user.getData(target);

  if (!targetUser) {
    return response(404, {
      "message": {
        "zh": "用户不存在"
      }
    })
  }

  const targetUserid = targetUser.userid;
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
    if (isFriend[0].approve === 1) {
      return response(400, {
        "message": {
          "zh": "请勿重复添加好友"
        }
      })
    }
    return response(400, {
      "message": {
        "zh": "请勿重复发送好友请求"
      }
    })
  }

  console.log(targetUserid, user.userid);

  // send friend request
  await mysql.query(
    "insert into `friend` (`from`, `to`, `create_time`) values (?, ?, ?)",
    [user.userid, targetUserid, mysql.now()]
  )

  response(200, {
    "message": {
      "zh": "好友请求已发送"
    }
  })
}


module.exports = friend;