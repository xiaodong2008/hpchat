import {FastjsAjax} from "fastjs-next";
import {message} from "ant-design-vue";

const resolve = (path, method = "get", data, config) => {
  return new Promise((resolve) => {
    config.callback = res => {
      resolve(res);
    }
    config.failed = ajax => {
      if (ajax.xml.status !== 0) {
        const result = ajax.xml.response;
        message.error(`接口异常: ${result}`);
        console.error(`接口异常: ${result}`);
      } else
        message.error(`接口异常，请稍后再试`);
      throw new Error(ajax);
    }
    new FastjsAjax(
      path,
      data,
      config
    ).send(method);
  })
}


export function isLogin() {
  return resolve("/api/user/userdata")
}