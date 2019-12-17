const merge = require('webpack-merge')
const common = require('./webpack.config.common')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')
const RemovePlugin = require('remove-files-webpack-plugin')

const ROOT_PATH = path.resolve(__dirname, 'build')

module.exports = merge(common, {
  mode: 'production',
  output: {
    path: ROOT_PATH,
    filename: `arquivos/0-dcs-web-[name]-script.js`,
    chunkFilename: `arquivos/0-dcs-web-[name]-script.js`,
    publicPath: '/'
  },
  plugins: [
    new UglifyJsPlugin(),
    new RemovePlugin({
      after: {
        include: [
          `${ROOT_PATH}/arquivos/0-dcs-web-theme-script.js`,
          `${ROOT_PATH}/arquivos/0-dcs-web-all-style.css`
        ],
        log: false
      },
    })
  ]
})
