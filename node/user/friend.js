async function friend(req, res) {
  const response = require('../response.js')(res);
  const mysql = await require('../database.js')(res);
  const user = await mysql.user.isLogin();
  if (user === false) {
    response(401, {
      "message": {
        "zh": "请先登录"
      }
    })
    return;
  }
  console.log("userid", user.userid);
  const friends = await mysql.friend.getFriends(user.userid);
  const friendList = [];
  for (let friend of friends) {
    const friendData = await mysql.user.getData(friend.from === user.userid ? friend.to : friend.from);
    const messages = await mysql.query(
      "select * from `message-temp` WHERE `to` = ? order by `time`",
      [user.userid]
    )
    friendList.push({
      nickname: friendData.nickname,
      messages,
      userid: friendData.userid,
    })
  }
  response(200, friendList);
}

module.exports = friend;