// 根据url路线，获取最终的url
export const getFinalUrl = urls => {
  let ret = ''
  for (let url of urls.reverse()) {
    ret = url.replace('~', '/') + ret
    if (!url.startsWith('~')) {
      break
    }
  }
  return ret
}

// 解析动态路由
export const getDynamicUrl = (url, params) => {
  let ret = url
  url.split('/').forEach(item => {
    if (item.includes(':')) {
      let key = item.replace(':', '')
      ret.replace(item, params[key])
    }
  })
  return ret
}