async function register(req, res) {
  const response = require('../response.js')(res);
  const mysql = await require('../database.js')(res);

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

  // userid = userdata length + 1
  let userid = (await mysql.query("select COUNT(*) from `userdata`"))[0]['COUNT(*)'] + 1;
  let create_time = new Date().getTime();
  create_time = new Date(create_time).toISOString().replace('T', ' ').replace('Z', '');
  // nickname = email
  await mysql.query(
    "insert into `userdata` (`userid`, `nickname`, `password`, `email`, `createEmail`, `createTime`, `available`) values (?, ?, ?, ?, ?, ?, '1')",
    [userid, email, password, email, email, create_time],
  )

  response(200, {
    "message": {
      "zh": "注册成功",
    },
    "success": true,
    "userid": userid
  })
}

module.exports = register