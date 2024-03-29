import store from '../store'
function processStackMsg (stack) {
  stack = stack
    .replace(/\n/gi, '') // 去掉换行，节省传输内容大小
    .replace(/\bat\b/gi, '@') // chrome中是at，ff中是@
    .split('@') // 以@分割信息
    .slice(1, 10) // 最大堆栈长度（Error.stackTraceLimit = 10），所以只取前10条
    .map(v => v.replace(/^\s*|\s*$/g, '')) // 去除多余空格
    .join('~') // 手动添加分隔符，便于后期展示
    .replace(/\?[^:]+/gi, '') // 去除js文件链接的多余参数(?x=1之类)
  return stack
}

export const HTTP_ERROR = 1
export const JS_ERROR = 2
export const AUTH_ERROR = 3
export function report (config) {
  try {
    if (process.env.NODE_ENV !== 'production' || process.env.company === 'staging') {
      return
    }
    let reportLog = ''
    const error = config.error
    const accountType = store.state.user.account_type
    switch (config.type) {
      case HTTP_ERROR:
        reportLog =
        `url=${error.config.url}&stack=${processStackMsg(error.stack)}&msg=${error.message}`
        if (error.response) {
          reportLog += `&status=${error.response.status}`
        }
        break
      case JS_ERROR:
        reportLog =
        `stack=${processStackMsg(error.stack)}&msg=${error.message}`
        break
      case AUTH_ERROR:
        if (!accountType) { // 只記錄登入狀態
          return
        }
        reportLog =
        `url=${config.url}&msg=${config.msg}`
        break
      default:
        return
    }
    if (store.state.route) {
      reportLog += `&path=${store.state.route.path}`
    }
    if (config.memo) {
      reportLog += `&memo=${config.memo}`
    }
    if (accountType === 1) {
      reportLog += `&username=${store.state.user.username}`
    } else if (accountType === 0) {
      reportLog += '&username=tryplay'
    }
    fetch('https://log.021toilet.com/f?' + reportLog, {mode: 'no-cors', method: 'GET'})
  } catch (e) {
    console.log(e)
  }
}
