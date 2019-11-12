import axios from 'axios'
import QS from 'qs'
import Mock from 'mockjs'

// 解析动态路由
const getDynamicUrl = (url, params) => {
  let ret = url
  url.split('/').forEach(item => {
    if (item.startsWith(':')) {
      let key = item.replace(':', '')
      ret.replace(item, params[key])
    }
  })
  return ret
}

const use = (config1, config2, key) => {
  if (config1[key] !== undefined) {
    return config1[key]
  } else {
    return config2[key]
  }
}

const mergeConfig = (globalConfig, apiConfig) => {
  const config = {
    url: apiConfig.url,
    method: apiConfig.method,
    meta: apiConfig.meta || {},
    restful: use(apiConfig, globalConfig, 'restful'),
    baseUrl: use(apiConfig, globalConfig, 'baseUrl'),
    withCredentials: use(apiConfig, globalConfig, 'withCredentials'),
    retry: use(apiConfig, globalConfig, 'retry'),
    mock: use(apiConfig, globalConfig, 'mock'),
    hooks: use(apiConfig, globalConfig, 'hooks'),
    params: apiConfig.params,
    headers: apiConfig.headers
  }
  // url，支持动态路由
  config.url = getDynamicUrl(config.url, config.params)
  // method
  if (!config.restful) {
    config.method = config.method === 'get' ? 'get' : 'post'
  }
  return config
}

const defaultConfig = {
  // 是否遵循restful api
  restful: true,
  // api模块
  modules: {},
  // 基础路由
  baseUrl: '/',
  // 是否可携带验证
  withCredentials: true,
  // 超时时间
  timeout: 30000,
  // 钩子
  hooks: {
    // 请求前的钩子
    beforeRequest: config => config,
    // 请求前错误
    errorRequest: () => {},
    // 请求成功后
    afterResponse: res => res,
    // 请求错误后
    errorResponse: () => {}
  },
  // 错误重试相关
  retry: {
    // 重试次数限制
    limit: 3,
    // 重试条件
    contidion: false
  },
  // mock数据相关
  mock: {
    // 是否开启全局mock
    on: false,
    // mock数据模板
    template: ''
  }
}

class Cribe {
  constructor (config) {
    // 基本配置
    this.config = { ...defaultConfig, ...config }
    axios.defaults.headers.post.Accept = 'application/json'
    axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.baseUrl = this.config.baseUrl
    axios.defaults.timeout = this.config.timeout
    axios.defaults.withCredentials = this.config.withCredentials
    // 解析modules为想要的格式，一个递归的扁平化处理
    this.modules = this.createModules(this.config.modules)
  }

  // 初始化模块
  createModules (modules) {
    const ret = []
    modules.children && modules.children.forEach(item => {
      const newItem = { ...item }
      newItem.name =
        (modules.name ? modules.name + '.' : '') + (newItem.name || '')
      if (!newItem.url.startsWith('/')) {
        newItem.url =
          (modules.url === '' ? '' : modules.url + '/') + newItem.url
      }
      if (newItem.children) {
        ret.push(...this.createModules(newItem))
      } else {
        ret.push(newItem)
      }
    })
    return ret
  }

  // 呼叫
  call (apiName, params) {
    // 处理过后的apiConfig
    const ac = { ...this.modules.find(item => item.name === apiName) }
    ac.params = params
    ac.url = this.config.baseUrl + ac.url
    return this.request(ac)
  }

  // 请求
  request (apiConfig) {
    // 合并全局配置，接口独立配置和参数，然后传给req
    const config = mergeConfig(this.config, apiConfig)

    // 重试的时候需要用到这个req对象，避免重复操作
    const req = new Request(config)

    // 执行请求
    return req
      .excute()
      .then(res => {
        // 请求成功的钩子
        res = req.emit('afterResponse', res)
        return res
      })
      .catch(err => {
        req.emit('errorResponse', err)
        // 重试
        req.retry(err)
      })
  }
}

// 每一次请求都有相应的请求对象
class Request {
  constructor (config) {
    this.config = config
    this.retryCount = 0
  }

  // 钩子
  emit (hookName, params) {
    return this.config.hooks[hookName](params)
  }

  // 取消请求
  cancel () {}

  // 执行请求
  excute () {
    // 在这里支持设置axios额外信息，以兼容全功能的axios
    const config = this.emit('beforeRequest', this.config)
    // params
    if (config.method !== 'get') {
      config.data = QS.stringify(config.params)
    }
    if (this.config.mock && this.config.mock.on) {
      // 如果当前接口开启了mock，则使用当前接口mock模板
      return this.mockReturn(this.config.mock.template)
    }
    config.cancelToken = new axios.CancelToken(c => {
      this.cancel = c
    })
    return axios(config)
  }

  mockReturn (template) {
    return Promise.resolve({
      data: Mock.mock(template),
      headers: {},
      request: {},
      config: { ...this.config },
      status: 200,
      statusText: 'success'
    })
  }

  retry (err) {
    // 错误重试，包含全局和独立接口设置
    // 不需要重试的情况下直接进行错误处理
    if (
      !this.config.retry ||
      (typeof this.config.retry.condition !== 'function' &&
        !this.config.retry.condition) ||
      (typeof this.config.retry.condition === 'function' &&
        !this.config.retry.condition(err)) ||
      this.retryCount >= this.config.retry.limit
    ) {

    } else {
      // 重试次数自增
      this.retryCount += 1
      return this.excute()
    }
  }
}

export default Cribe
