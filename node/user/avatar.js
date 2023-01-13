async function avatar(req, res) {
  const response = require('../response.js')(res);
  const mysql = await require('../database.js')(res);

  // check method
  if (req.method !== "POST") {
    return response(405, `405 Method Not Allowed: ${req.method}`, false);
  }

  let file = req.body.file;
  // file = "data:image...."

  // is jpg or png
  if (!file.match(/^data:image\/(png|jpeg|jpg);base64,/)) {
    return response(400, {
      "message": {
        "zh": "无效的图片格式"
      }
    })
  }
  const fileType = file.split("data:image/")[1].split(";base64,")[0];
  // change to blob
  const base64 = file.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
  file = Buffer.from(base64, 'base64');

  // is too large
  if (file.size > 1024 * 1024) {
    return response(400, {
      "message": {
        "zh": "文件不得超过2MB"
      }
    })
  }

  // is login
  const user = await mysql.user.isLogin();

  if (!user) {
    return response(401, {
      "message": {
        "zh": "请先登录"
      }
    })
  }

  // save file -> ./data/avatar/{id}.png/jpg/jpeg
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, '../data/avatar');

  // 32 length
  const hex = require('crypto').randomBytes(15).toString('hex');

  const filename = `_${user.userid}_${hex}.${fileType}`

  // check is exist avatar, if is, delete
  const oldAvatar = await mysql.query(
    "select `avatar` from `userdata` where `userid` = ?",
    [user.userid]
  )
  if (oldAvatar[0].avatar) {
    const oldPath = path.join(dir, oldAvatar[0].avatar.substring(11));
    // delete old avatar
    if (fs.existsSync(oldPath))
      fs.unlinkSync(oldPath);
  }

  // data/avatar already exists
  fs.writeFile(path.join(dir, filename), file, (err) => {
    if (err) {
      return response(500, {
        "message": {
          "zh": "服务器错误"
        }
      })
    }

    // update avatar
    mysql.query(
      "update `userdata` set `avatar` = ? where `userid` = ?",
      [`/api/avatar/${filename}`, user.userid],
      true
    )
      .then(() => {
        return response(200, {
          "message": {
            "zh": "上传成功"
          }
        })
      })
  })
}

module.exports = avatar