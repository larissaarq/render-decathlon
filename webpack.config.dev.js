const merge = require('webpack-merge')
const common = require('./webpack.config.common')
const path = require('path')

module.exports = merge(common, {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `arquivos/_0-dcs-web-[name].js`,
    chunkFilename: `arquivos/_0-dcs-web-[name].js`,
    publicPath: '/'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    hot: true,
    compress: true,
    port: 3000,
    open: true
  }
})