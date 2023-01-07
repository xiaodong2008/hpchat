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

  // get friend request
  const requests = await mysql.query(
    "select * from `friend` WHERE `to` = ? and `approve` = '0' order by `create_time`",
    [user.userid]
  )
  const requestList = [];
  for (let request of requests) {
    const userData = await mysql.user.getData(request.from);
    requestList.push({
      nickname: userData.nickname,
      userid: userData.userid,
      email: userData.email
    })
  }

  response(200, requestList);
}

module.exports = friend;