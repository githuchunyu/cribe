import { getDynamicUrl } from './url'

const use = (config1, config2, key) => {
  if (config1[key] !== undefined) {
    return config1[key]
  } else {
    return config2[key]
  }
}

export const mergeConfig = (globalConfig, apiConfig) => {
  const config = {
    criber: globalConfig.criber,
    url: apiConfig.url,
    method: apiConfig.method,
    serialize: globalConfig.serialize,
    restful: use(apiConfig, globalConfig, 'restful'),
    baseUrl: use(apiConfig, globalConfig, 'baseUrl'),
    withCredentials: use(apiConfig, globalConfig, 'withCredentials'),
    useGlobalHook: apiConfig.useGlobalHook,
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