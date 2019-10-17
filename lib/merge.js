'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeConfig = undefined;

var _url = require('./url');

var use = function use(config1, config2, key) {
  if (config1[key] !== undefined) {
    return config1[key];
  } else {
    return config2[key];
  }
};

var mergeConfig = exports.mergeConfig = function mergeConfig(globalConfig, apiConfig) {
  var config = {
    criber: globalConfig.criber,
    url: apiConfig.url,
    method: apiConfig.method,
    serializer: globalConfig.serializer,
    restful: use(apiConfig, globalConfig, 'restful'),
    baseUrl: use(apiConfig, globalConfig, 'baseUrl'),
    withCredentials: use(apiConfig, globalConfig, 'withCredentials'),
    useGlobalHook: apiConfig.useGlobalHook,
    retry: use(apiConfig, globalConfig, 'retry'),
    mock: use(apiConfig, globalConfig, 'mock'),
    hooks: use(apiConfig, globalConfig, 'hooks'),
    params: apiConfig.params,
    headers: apiConfig.headers
  };

  config.url = config.baseUrl + (0, _url.getDynamicUrl)(config.url, config.params);

  if (!config.restful) {
    config.method = config.method === 'get' ? 'get' : 'post';
  }
  return config;
};