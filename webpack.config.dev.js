const merge = require('webpack-merge')
const common = require('./webpack.config.common')
const path = require('path')

const ROOT_PATH = path.resolve(__dirname, 'dist')

module.exports = merge(common, {
  mode: 'development',
  output: {
    path: ROOT_PATH,
    filename: `arquivos/0-dcs-web-[name]-script.js`,
    chunkFilename: `arquivos/0-dcs-web-[name]-script.js`,
    publicPath: '/'
  }
})
