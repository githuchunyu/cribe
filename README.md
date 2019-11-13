# Cribe
基于axios和mockjs的一个接口模块化封装库



## 目的

- 模块化，接口的集合不再是杂乱无章的大集合
- 配置化，以配置的形式存在，统一功能，清晰明了
- 丰富的请求钩子，可全局和局部地自由地掌控每个接口请求
- 更灵活的数据模拟，随时切换全部或单个接口为模拟数据或真实请求



## 安装

```sh
# npm
npm install --save cribe
# yarn
yarn add axios
```

 

## 使用

```js
// api.js
import cribe from 'cribe'

// 配置
const config = {
  // ...
  // api模块
  modules: {
    url: '',
    children: [
    	{
    		name: 'user',
    		url: '',
    		children: [
    			{
    				name: 'login',
            url: '/login',
            method: 'get',
            meta: {
              title: '登录'
            },
            mock: {
              on: true,
              template: { code: 0, msg: 'success' }
            }
    			}
    		]
    	}
    ]
  },
  // 跟路由
  baseUrl: '/'
}
// 生成api单例
const api = new cribe(config)
export default api

// use.js
import api from 'api.js'
// 调用接口
api.call('user.login', params).then(res => {
	// do something
}).catch(err => {
	// handle error
})
```



## 模块

支持无限层级
### name
接口方法名，会逐层和父级的name以.拼接
### url
接口地址，也会逐层和父级的url以/拼接，如果不希望如此，则此url需要以/开头
### method
请求方法，支持get，post，delete，put，patch，upload
### meta
额外的信息
### mock
数据模拟
**on**
开启数据模拟
**template**
数据模拟的数据模板
### hooks
此接口的独立请求钩子
### headers
请求头设置



## 全局配置

```js
const config = {
  // 是否遵循restful api，如果为false，则put等请求方式会转为post
  restful: true,
  hooks: {
    beforeRequest: options => {
      // 是否需要登录，或者其他类似的判断修正都可以在此操作
      return options
    },
    errorRequest: err => {
    	return err
    },
    afterResponse: res => {
      // 对返回结果统一处理
      return res
    },
    errorResponse: err => {
      // 对错误进行处理
      return err
    }
  },
  retry: {
  	// 重试条件
  	condition: false,
  	// 重试次数限制
  	limit: 3
  },
  // mock数据模拟
  mock: {
  	// 是否开启数据模拟，以接口内设置为准
    on: false,
    template: {
      code: 0,
      data: {}
    }
  },
  // api模块
  modules: {
    url: '',
    children: [user]
  },
  // 请求头设置
  headers: {},
  // 跟路由
  baseUrl: '/',
  withCredentials: true
}
```



## 待完善

- 接口调用时配置参数
- headers
- 接口自定义钩子
- 获取配置信息，以用在某些upload组件上
- 等等
