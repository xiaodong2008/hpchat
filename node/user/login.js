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

  const userdata = await mysql.user.getData(uname);

  if (!userdata) {
    return response(400, {
      "message": {
        "zh": "用户名或密码错误",
      }
    })
  }

  // generate token
  let token = require('crypto').randomBytes(32).toString('hex');
  // for dev -> a fixed token
  // let token = "devtoken";
  let create_time = mysql.now();
  let expire_time = mysql.now() + 1000 * 60 * 60 * 24;
  let retry_time = 0;

  const try_login = () => {
    mysql.query(
      "insert into `userlogin` (`userid`, `token`, `create_time`, `expire_time`) values (?, ?, ?, ?)",
      [userdata.userid, token, create_time, expire_time],
      true
    ).then(
      () => {
        response(200, {
          "message": {
            "zh": "登录成功",
          },
          "token": token,
          "success": true
        })
      }).catch(() => {
        token = require('crypto').randomBytes(32).toString('hex');
        retry_time++;
        if (retry_time < 10) {
          response(508, {
            "message": {
              "zh": "我们暂时无法处理您的请求，请稍后再试"
            }
          })
        }
      }
    )
  }

  try_login()
}

module.exports = login;