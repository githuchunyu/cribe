import Mock from 'mockjs'

const defaultConfig = {
  // 执行请求的对象，例如axios，fetch
  criber: null,
  // 是否遵循restful api
  restful: true,
  // 请求参数序列化方法
  serialize: options => options,
  beforeRequest: options => options,
  afterResponse: res => res,
  errorResponse: () => {},
  // 错误重试次数
  retry: 3,
  // 是否需要重试
  shouldRetry: false,
  // 启用mock
  enableMock: false,
  // api模块
  modules: {},
  baseUrl: '/',
  withCredentials: true
}

class Cribe {
  constructor (config) {
    // 基本校验
    if (!config || !config.criber) {
      throw new Error('需要有个criber')
      return
    }
    this.config = { ...defaultConfig, ...config }
    this.api = this.create()
  }

  // 创建api
  create () {
    const apiModules = {}
    const useGlobalHook = {
      beforeRequest: true,
      afterResponse: true,
      errorResponse: true
    }
    for (let m in this.config.modules) {
      const apiModule = {}
      modules[m].forEach(item => {
        apiModule[item.name] = params => {
          item.useGlobalHook = { ...useGlobalHook, ...item.useGlobalHook }
          item.params = params
          return this.request(item)
        }
      })
      apiModules[m] = apiModule
    }
    return apiModules
  }

  // 请求
  request (opts) {
    const options = {}
    // url，支持动态路由
    options.url = this.config.baseUrl + dynamicUrl(opts.url, opts.params)
    // method
    if (this.config.restful) {
      options.method = opts.method
    } else {
      options.method = opts.method === 'get' ? 'get' : 'post'
    }
    // headers
    options.headers = opts.headers

    // 请求前的钩子
    if (opts.useGlobalHook.beforeRequest) {
      options = this.config.beforeRequest(options)
    }
    options = opts.beforeRequest(options)

    // mock
    if (this.config.enableMock && opts.mockTemplate) {
      Mock.mock(options.url, opts.mockTemplate)
    }

    // params
    const arguments = this.config.serialize(options)

    // 发起请求
    return this.config.criber(...arguments).then(res => {
      // 请求成功的钩子
      if (opts.useGlobalHook.aftreResponse && this.config.afterResponse) {
        res = this.config.afterResponse(res)
      }
      res = opts.afterResponse(res)
      return res
    }).catch(err => {
      // 请求失败的钩子
      if (opts.useGlobalHook.errorResponse) {
        this.config.errorResponse(err)
      }
      opts.errorResponse(err)

      // 错误重试
      // 设置重置次数，默认为0
      opts.__retryCount = opts.__retryCount || 0
      // 不需要重试的情况下直接进行错误处理
      if (!this.retry ||
        (typeof this.config.shouldRetry !== 'function' && !this.config.shouldRetry) ||
        (typeof this.config.shouldRetry === 'function' && !this.config.shouldRetry(err)) ||
        (opts.__retryCount >= opts.retry)
      ) {
        return
      } else {
        //重试次数自增
        opts.__retryCount += 1
        return this.request(opts)
      }
    })
  }
}

// 解析动态路由
const dynamicUrl = (url, params) => {
  let ret = url
  url.split('/').forEach(item => {
    if (item.includes(':')) {
      let key = item.replace(':', '')
      ret.replace(item, params[key])
    }
  })
  return ret
}

export default Cribe
