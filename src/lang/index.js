import cookie from 'js-cookie'

export default function get(path, defaultValue) {
  let language = cookie.get("language")
  const langList = require(`./config.json`).langList
  if (!language || !langList.includes(language)) {
    language = "zh"
    cookie.set("language", "zh")
  }
  let index
  try {
    index = require(`./${path}.json`)
  } catch (e) {
    index = require(`./${path}/index.json`)
  }
  if (language !== "zh") {
    const defaultLangIndex = index.zh
    index = index[language]
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
  } else index = index.zh
  if (defaultValue)
    defaultValue.split(".").forEach((item) => {
      index = index[item]
    })
  return index
}