var path = require('path')
// let webpack = require('webpack')
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'cribe.js',
    library: 'Cribe',
    globalObject: 'this',
    libraryExport: 'default',
    libraryTarget: 'umd'
  },
  mode: "production",
  externals: {
    axios: 'axios',
    qs: 'qs',
    mockjs: 'mockjs'
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}