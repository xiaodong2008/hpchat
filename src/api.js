import {FastjsAjax} from "fastjs-next";
import {message} from "ant-design-vue";
import langSetup from "./lang"
import cookie from "js-cookie";

const lang = cookie.get("language");
const error = langSetup("config").error.api

const resolve = (path, method = "get", data, config) => {
  return new Promise((resolve) => {
    config.callback = res => {
      resolve(res);
    }
    config.failed = ajax => {
      const status = ajax.xml.status;
      if (status !== 0) {
        const result = ajax.xml.response;
        const msg = result[`${lang}-message`]
        message.error(`[${status}] ${error.short}: ${msg}`);
        console.error(`[${status}] ${error.short}: ${msg}`);
      } else
        message.error(error.default);
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