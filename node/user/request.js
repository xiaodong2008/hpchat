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

  // get friend request
  const requests = await mysql.query(
    "select * from `friend` WHERE `to` = ? and `approve` = false order by `create_time`",
    [user.userid]
  )
  const requestList = [];
  for (let request of requests) {
    console.log("from", request.from);
    const userData = await mysql.user.getData(request.from);
    console.log("userdata", userData);
    requestList.push({
      nickname: userData.nickname,
      userid: userData.userid,
      email: userData.email
    })
  }

  response(200, requestList);
}

module.exports = friend;