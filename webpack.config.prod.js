const merge = require('webpack-merge')
const common = require('./webpack.config.common')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: `arquivos/0-dcs-web-[name]-script.js`,
    chunkFilename: `arquivos/0-dcs-web-[name]-script.js`,
    publicPath: '/'
  },
  plugins: [
    new UglifyJsPlugin()
  ]
})