const path = require('path')
const fs = require('fs')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally')
const CopyPlugin = require('copy-webpack-plugin')

const vendorPath = path.resolve(__dirname, 'src/vendor')

const componentsRootPath = path.join(__dirname, 'src/js/components')
const controllerRootPath = path.join(__dirname, 'src/js/controllers')

let filesToConcat = []

/**
 * 
 * @param {*} rootPath path of files
 * @returns array os path files
 */
const getPaths = (rootPath) => {
  const paths = []

  fs.readdirSync(rootPath).map(file => {
    const filePath = path.join(rootPath, file)
    paths.push(filePath)
  })

  return paths
}

filesToConcat = [
  ...getPaths(componentsRootPath),
  ...getPaths(controllerRootPath)
]

module.exports = {
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  entry: {
    polyfill: '@babel/polyfill',
    application: filesToConcat,
    components: path.join(__dirname, 'src/react', 'index')
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
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new WebpackCleanupPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'arquivos/0-dcs-web-[name]-style.css',
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
          `${vendorPath}/jquery/dist/jquery.min.js`,
          `${vendorPath}/bootstrap/dist/js/bootstrap.min.js`,
          `${vendorPath}/avanti-class/src/avanti-class.js`,
          `${vendorPath}/avanti-search/src/avanti-search.js`,
          `${vendorPath}/jquery-lazy/jquery-lazy.min.js`,
          `${vendorPath}/jquery-mask-plugin/dist/jquery.mask.min.js`,
          `${vendorPath}/bootstrap-select/dist/bootstrap-select.min.js`,
          `${vendorPath}/js-cookie/src/js.cookie.js`,
          `${vendorPath}/owl.carousel/dist/owl.carousel.min.js`,
          `${vendorPath}/nouislider/distribute/nouislider.min.js`,
          `${vendorPath}/slick-carousel/slick/slick.min.js`,
          `${vendorPath}/pointer_events_polyfill/pointer_events_polyfill.js`,
          `${vendorPath}/percircle/dist/percircle.js`,
        ]
      },
      transform: {
        'arquivos/0-dcs-web-vendors-script.js': code => require("uglify-js").minify(code).code,
      }
    })
  ]
}
