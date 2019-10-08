import Cribe from '../../index.js'
import Axios from './axios'
import serialize from './serializer/axios'
import QS from 'qs'

import user from './modules/user'

const config = {
  // 执行请求的对象，例如axios，fetch
  criber: Axios,
  // 是否遵循restful api
  restful: true,
  // 请求参数序列化方法
  serialize,
  beforeRequest: options => {
    // 是否需要登录，或者其他类似的判断修正都可以在此操作
    return options
  },
  afterResponse: res => {
    // 对返回结果统一处理
    return res
  },
  errorResponse: err => {
    // 对错误进行处理
  },
  // 错误重试次数
  retry: 3,
  // 是否需要重试
  shouldRetry: false,
  // 启用mock
  enableMock: false,
  // api模块
  modules: {
    user
  },
  // 跟路由
  baseUrl: '/',
  withCredentials: true
}

const api = new Cribe(config).api

export default api