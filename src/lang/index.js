import cookie from 'js-cookie'

export default function get(path, defaultValue) {
  let language = cookie.get("language")
  const langList = require(`./config.json`).langList
  if (!language || !langList.includes(language)) {
    language = "zh"
    cookie.set("language", "zh")
  }
  const index = require(`./${path}.json`)
  if (!defaultValue && language !== "zh") {
    const defaultLangIndex = require(`./${path}.json`).zh
    // 递归检查
    const check = (obj) => {
      // 比对默认语言和当前语言，如果当前语言没有翻译，就用默认语言
      for (let key in obj) {
        if (typeof obj[key] === "object") {
          check(obj[key])
        } else {
          if (!obj[key]) {
            obj[key] = defaultLangIndex[key]
          }
        }
      }
    }
  }
  return defaultValue ? index : index[language]
}