'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (options) {
  var args = [];
  if (options.method !== 'get') {
    options.data = (0, _qs2.default)(options.params);
  }
  args[0] = options;
  return args;
};