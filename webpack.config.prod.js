const path = require('path')
const merge = require('webpack-merge')
const common = require('./webpack.config.common')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CssnanoPlugin = require('cssnano-webpack-plugin')
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
        ],
        log: false
      },
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new CssnanoPlugin()
    ]
  }
})
