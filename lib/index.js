'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _mockjs = require('mockjs');

var _mockjs2 = _interopRequireDefault(_mockjs);

var _url = require('./url');

var _merge = require('./merge');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultConfig = {
  criber: null,

  restful: true,

  modules: {},

  baseUrl: '/',

  withCredentials: true,

  serialize: function serialize(options) {
    return options;
  },

  hooks: {
    beforeRequest: function beforeRequest(options) {
      return options;
    },

    errorRequest: function errorRequest(err) {},

    afterResponse: function afterResponse(res) {
      return res;
    },

    errorResponse: function errorResponse() {}
  },

  retry: {
    limit: 3,

    contidion: false
  },

  mock: {
    on: false,

    template: ''
  }
};

var Cribe = function () {
  function Cribe(config) {
    (0, _classCallCheck3.default)(this, Cribe);

    if (!config || !config.criber) {
      throw new Error('需要有个criber');
    }
    this.config = (0, _extends3.default)({}, defaultConfig, config);
  }

  (0, _createClass3.default)(Cribe, [{
    key: 'call',
    value: function call(apiName, params) {
      var apiPaths = apiName.split('.');
      var apiConfig = this.config.modules;

      var urls = [];
      apiPaths.forEach(function (path) {
        apiConfig = apiConfig[path];
        urls.push(apiConfig.url);
      });

      var ac = (0, _extends3.default)({}, apiConfig);

      ac.url = (0, _url.getFinalUrl)(urls);
      ac.params = params;

      if (!apiConfig.__mocked) {
        if (apiConfig.mock.on) {
          _mockjs2.default.mock(ac.url, ac.mock.template || this.mock.template || '');
        } else if (this.config.mock.on) {
          _mockjs2.default.mock(ac.url, this.mock.template || '');
        }
        apiConfig.__mocked === true;
      }

      return this.request(ac);
    }
  }, {
    key: 'request',
    value: function request(apiConfig) {
      var config = (0, _merge.mergeConfig)(this.config, apiConfig);

      var req = new Request(config);

      req.excute().then(function (res) {
        res = req.emit('afterReponse', res);
        return res;
      }).catch(function (err) {
        req.emit('errorReponse');

        req.retry();
      });
    }
  }]);
  return Cribe;
}();

var Request = function () {
  function Request(config) {
    (0, _classCallCheck3.default)(this, Request);

    this.config = config;
    this.retryCount = 0;
  }

  (0, _createClass3.default)(Request, [{
    key: 'emit',
    value: function emit(hookName, params) {
      return this.config.hooks[hookName](params);
    }
  }, {
    key: 'excute',
    value: function excute() {
      var _config;

      var config = this.emit('beforeRequest', this.config);

      var args = this.config.serialize(config);
      return (_config = this.config).criber.apply(_config, (0, _toConsumableArray3.default)(args));
    }
  }, {
    key: 'retry',
    value: function retry() {
      if (!this.config.retry || typeof this.config.retry.condition !== 'function' && !this.config.retry.condition || typeof this.config.retry.condition === 'function' && !this.config.retry.condition(err) || this.retryCount >= this.config.retry.limit) {
        return;
      } else {
        this.retryCount += 1;
        return this.excute();
      }
    }
  }]);
  return Request;
}();

exports.default = Cribe;