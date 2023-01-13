const login = require("./login");

async function register(req, res) {
  const response = require('../response.js')(res);
  const mysql = require('../database.js')(res);

  // check method
  if (req.method !== "POST") {
    return response(405, `405 Method Not Allowed: ${req.method}`, false);
  }

  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return response(400, {
      "message": {
        "zh": "邮箱或密码不能为空",
      }
    })
  }

  if (email.length > 50 || !/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-]+)$/.test(email)) {
    return response(400, {
      "message": {
        "zh": "邮箱格式错误",
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

  let result = await mysql.query(
    "select * from `userdata` where `email` = ? limit 1",
    [email],
  )
  if (result.length !== 0) {
    return response(400, {
      "message": {
        "zh": "邮箱已被注册",
      }
    })
  }

  // nickname = email
  const userdata = await mysql.query(
    "insert into `userdata` (`nickname`, `password`, `email`, `createEmail`, `createTime`) values (?, ?, ?, ?, ?)",
    [email, password, email, email, mysql.now()],
  )

  if (req.body.login) {
    req.body.uname = userdata.insertId;
    return login(req, res);
  }

  response(200, {
    "message": {
      "zh": "注册成功",
    },
    "success": true,
    "userid": userdata.insertId
  })
}

module.exports = register