import {FastjsAjax} from "fastjs-next";
import {message} from "ant-design-vue";
import cookie from "js-cookie";

const lang = cookie.get("language");

const resolve = (path, method = "get", data, config = {}) => {
  if (cookie.get("token")) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = cookie.get("token");
  }
  console.log(config);
  return new Promise((resolve, reject) => {
      new FastjsAjax(
        path,
        data,
        config
      ).send(method)
        .then(res => {
          if (res.message) {
            if (res.success)
              message.success(res.message[`${lang}`]);
            else
              message.info(res.message[`${lang}`]);
          }
          resolve(res)
        }).catch(
        err => {
          if (err instanceof Error) {
            console.log("msg",err.message)
            // 保留第一行
            err = err.message.split("\n")[0];
            err = err.replace(/\[.*] /, "");
            message.error(err);
          } else {
            message.error(err.message[`${lang}`]);
          }
          reject(err)
        }
      )
    }
  )
}


export function isLogin() {
  return resolve("/api/user/userdata");
}

export function login(uname, password) {
  return resolve("/api/user/login", "post", {uname, password});
}