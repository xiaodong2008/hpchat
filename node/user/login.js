async function login(req, res) {
  const response = require('../response.js')(res);
  const mysql = await require('../database.js')(res);

  // check method
  if (req.method !== "POST") {
    return response(405, `405 Method Not Allowed: ${req.method}`, false);
  }

  const uname = req.body.uname;
  const password = req.body.password;

  if (!uname || !password) {
    return response(400, {
      "message": {
        "zh": "用户名或密码不能为空",
      }
    })
  }
  if (
    uname.length > 50 ||
    (!/^[0-9]+$/.test(uname) && !/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-]+)$/.test(uname))
  ) {
    return response(400, {
      "message": {
        "zh": "用户名格式错误",
      }
    })
  }
  if (password.length > 50 || /[^a-zA-Z0-9_\-]/.test(password)) {
    return response(400, {
      "message": {
        "zh": "密码格式错误",
      }
    })
  }

  mysql.query(
    "select * from `userdata` where (`userid` = ? or `email` = ?)  and `password` = ? and `available` = '1' limit 1",
    [uname, uname, password],
  ).then(
    result => {
      if (result.length === 0) {
        return response(400, {
          "message": {
            "zh": "用户名或密码错误",
          }
        })
      }
      result = result[0];

      // generate token
      const token = require('crypto').randomBytes(32).toString('hex');
      let create_time = new Date().getTime();
      let expire_time = new Date().getTime() + 1000 * 60 * 60 * 24;
      create_time = new Date(create_time).toISOString().replace('T', ' ').replace('Z', '');
      expire_time = new Date(expire_time).toISOString().replace('T', ' ').replace('Z', '');

      mysql.query(
        "insert into `userlogin` (`userid`, `token`, `create_time`, `expire_time`) values (?, ?, ?, ?)",
        [result.userid, token, create_time, expire_time],
      ).then(
        () => {
          response(200, {
            "message": {
              "zh": "登录成功",
            },
            "token": token,
            "success": true
          })
        })
    }
  )
}

module.exports = login;