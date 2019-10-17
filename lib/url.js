'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getFinalUrl = exports.getFinalUrl = function getFinalUrl(urls) {
  var ret = '';
  for (var url in urls.reverse()) {
    ret += url.replace('~', '/');
    if (!url.startsWith('~')) {
      break;
    }
  }
  return ret;
};

var getDynamicUrl = exports.getDynamicUrl = function getDynamicUrl(url, params) {
  var ret = url;
  url.split('/').forEach(function (item) {
    if (item.includes(':')) {
      var key = item.replace(':', '');
      ret.replace(item, params[key]);
    }
  });
  return ret;
};