import Mock from 'mockjs'
import { getFinalUrl } from './url'
import { mergeConfig } from './merge'

const defaultConfig = {
  // 执行请求的对象，例如axios，fetch
  criber: null,
  // 是否遵循restful api
  restful: true,
  // api模块
  modules: {},
  // 基础路由
  baseUrl: '/',
  // 是否可携带验证
  withCredentials: true,
  // 请求参数序列化方法
  serialize: options => options,
  // 钩子
  hooks: {
    // 请求前的钩子
    beforeRequest: options => options,
    // 请求前错误
    errorRequest: err => {},
    // 请求成功后
    afterResponse: res => res,
    // 请求错误后
    errorResponse: () => {},
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
    // 基本校验
    if (!config || !config.criber) {
      throw new Error('需要有个criber')
    }
    this.config = { ...defaultConfig, ...config}
  }

  // 呼叫
  call (apiName, params) {
    const apiPaths = apiName.split('.')
    let apiConfig = this.config.modules
    // url路线
    let urls = []
    apiPaths.forEach(path => {
      apiConfig = apiConfig[path]
      urls.push(apiConfig.url)
    })

    // 处理过后的apiConfig
    const ac = { ...apiConfig }
    // url组装
    ac.url = this.config.baseUrl + getFinalUrl(urls)
    ac.params = params

    // 注册mock，按需注册
    if (!apiConfig.__mocked) {
      if (apiConfig.mock.on) {
        // 如果当前接口开启了mock，则使用当前接口mock模板
        Mock.mock(ac.url, ac.mock.template || this.mock.template || '')
      } else if (this.config.mock.on) {
        // 如果当前关闭，则看全局，全局开启，则使用全局模板
        Mock.mock(ac.url, this.mock.template || '')
      }
      apiConfig.__mocked === true
    }

    return this.request(ac)
  }

  // 请求
  request (apiConfig) {
    // 合并全局配置，接口独立配置和参数，然后传给req
    const config = mergeConfig(this.config, apiConfig)

    // 重试的时候需要用到这个req对象，避免重复操作
    const req = new Request(config)

    // 执行请求
    return req.excute().then(res => {
      // 请求成功的钩子
      res = req.emit('afterResponse', res)
      return res
    }).catch(err => {
      req.emit('errorResponse')
      // 重试
      req.retry()
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

  // 执行请求
  excute () {
    const config = this.emit('beforeRequest', this.config)
    // params
    // axios的请求参数是一个object，fetch的是url, config，有所区别，所以在这里序列化得到最终的请求参数数组
    // 内置axios和fetch和微信小程序的请求序列化方法，除此之外的需要自行设置
    const args = this.config.serialize(config)
    console.log(config)
    return this.config.criber(...args)
  }

  retry () {
    // 错误重试，包含全局和独立接口设置
    // 不需要重试的情况下直接进行错误处理
    if (!this.config.retry ||
      (typeof this.config.retry.condition !== 'function' && !this.config.retry.condition) ||
      (typeof this.config.retry.condition === 'function' && !this.config.retry.condition(err)) ||
      (this.retryCount >= this.config.retry.limit)
    ) {
      return
    } else {
      //重试次数自增
      this.retryCount += 1
      return this.excute()
    }
  }
}

export default Cribe
