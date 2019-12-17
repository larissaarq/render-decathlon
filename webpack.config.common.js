const path = require('path')
const fs = require('fs')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally')
const CopyPlugin = require('copy-webpack-plugin')

const VENDOR_PATH = path.resolve(__dirname, 'src/vendor')

/**
 * @description Return list of files path from root path
 * @param {string} rootPath Path of files
 * @param {function} cb Return callback with file
 * @returns {array} Array of files path
 */

const getPaths = (rootPath, cb) => {
  const paths = []

  fs.readdirSync(rootPath).map(file => {
    const filePath = path.join(rootPath, file)

    paths.push(filePath)

    if (cb) cb(file)
  })

  return paths
}

const componentsRootPath = path.join(__dirname, 'src/js/components')
const controllersRootPath = path.join(__dirname, 'src/js/controllers')
const controllers = {}
let filesToConcat = []

getPaths(controllersRootPath, file => {
  let fileName = file.substring(0, file.length - 3)
  const filePath = path.join(controllersRootPath, fileName)
  fileName = fileName.replace('_0-dcs-web-', '')

  Object.assign(controllers, {
    [fileName]: filePath
  })
})

filesToConcat = [
  ...getPaths(componentsRootPath),
  ...getPaths(controllersRootPath)
]

module.exports = {
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  stats: {
    warnings: false
  },
  entry: {
    polyfill: '@babel/polyfill',
    theme: path.join(__dirname, 'src/js', 'theme'),
    app: path.join(__dirname, 'src/react', 'index'),
    all: filesToConcat,
    ...controllers,
  },
  module: {
    rules: [{
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react'
          ],
          plugins: [
            'syntax-dynamic-import'
          ]
        }
      },
      {
        test: /\.svg$/,
        use: [{
            loader: 'babel-loader'
          },
          {
            loader: 'react-svg-loader'
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'arquivos/[name].[ext]'
          }
        }]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: ['node_modules/compass-mixins/lib']
              }
            }
          },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: './src/sass/0-dcs-web-resources.scss'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new WebpackCleanupPlugin({
      cleanOnceBeforeBuildPatterns: ['dist', 'build'],
    }),
    new FriendlyErrorsWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'arquivos/0-dcs-web-[name]-style.css',
      chunkFilename: 'arquivos/0-dcs-web-[name]-style.css',
      ignoreOrder: true
    }),
    new CopyPlugin([{
        from: path.resolve(__dirname, 'src/html'),
        to: './html',
      },
      {
        from: path.resolve(__dirname, 'src/images', '*'),
        to: './arquivos',
        flatten: true
      },
      {
        from: path.resolve(__dirname, 'src/fonts/DecathlonFontIcon/fonts', '*'),
        to: './arquivos',
        flatten: true
      }
    ]),
    new MergeIntoSingleFilePlugin({
      files: {
        'arquivos/0-dcs-web-vendors-script.js': [
          `${VENDOR_PATH}/jquery/dist/jquery.min.js`,
          `${VENDOR_PATH}/bootstrap/dist/js/bootstrap.min.js`,
          `${VENDOR_PATH}/avanti-class/src/avanti-class.js`,
          `${VENDOR_PATH}/avanti-search/src/avanti-search.js`,
          `${VENDOR_PATH}/jquery-lazy/jquery-lazy.min.js`,
          `${VENDOR_PATH}/jquery-mask-plugin/dist/jquery.mask.min.js`,
          `${VENDOR_PATH}/bootstrap-select/dist/bootstrap-select.min.js`,
          `${VENDOR_PATH}/js-cookie/src/js.cookie.js`,
          `${VENDOR_PATH}/nouislider/distribute/nouislider.min.js`,
          `${VENDOR_PATH}/slick-carousel/slick/slick.min.js`,
          `${VENDOR_PATH}/pointer_events_polyfill/pointer_events_polyfill.js`,
          `${VENDOR_PATH}/percircle/dist/percircle.js`,
        ]
      },
      transform: {
        'arquivos/0-dcs-web-vendors-script.js': code =>
          require("uglify-js").minify(code).code
      }
    })
  ]
}
