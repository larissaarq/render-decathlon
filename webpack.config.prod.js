const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.config.common')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CssnanoPlugin = require('cssnano-webpack-plugin')

const ROOT_PATH = path.resolve(__dirname, 'build')

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: ROOT_PATH,
    filename: `arquivos/js/0-dcs-web-[name]-script.js`,
    chunkFilename: `arquivos/js/0-dcs-web-[name]-script.js`,
    publicPath: '/'
  },
  plugins: [
    new UglifyJsPlugin()
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new CssnanoPlugin()
    ]
  }
})
