async function edit(req, res) {
  const response = require('../response.js')(res);

  // check method
  if (req.method !== "POST") {
    return response(405, `405 Method Not Allowed: ${req.method}`, false);
  }

  const key = req.body.key;
  const value = req.body.value;

  if (key === "email") {
    if (!value.match(/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/)) {
      return response(400, {
        "message": {
          "zh": "无效的邮箱地址"
        }
      })
    }
  }

  if (!value) {
    return response(400, {
      "message": {
        "zh": "值不能为空"
      }
    })
  }

  const mysql = require('../database.js')(res);
  const user = await mysql.user.isLogin();

  if (user === false) {
    return response(401, {
      "message": {
        "zh": "请先登录"
      }
    })
  }

  const editWhiteList = ["nickname", "email"];

  if (!editWhiteList.includes(key)) {
    return response(400, {
      "message": {
        "zh": "无效的修改参数"
      }
    })
  }

  mysql.query(
    "update `userdata` set ?? = ? where `userid` = ?",
    [key, value, user.userid],
    true
  )
    .then(() => {
      return response(200, {
        "message": {
          "zh": "修改成功"
        }
      })
    })
    .catch(() => {
      return response(500, {
        "message": {
          "zh": "修改失败，请检查你的格式"
        }
      })
    })
}

module.exports = edit