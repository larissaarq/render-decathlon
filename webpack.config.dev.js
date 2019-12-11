const merge = require('webpack-merge')
const common = require('./webpack.config.common')
const path = require('path')

module.exports = merge(common, {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `arquivos/0-dcs-web-[name]-script.js`,
    chunkFilename: `arquivos/0-dcs-web-[name]-script.js`,
    publicPath: '/'
  }
})
