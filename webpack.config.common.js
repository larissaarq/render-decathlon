const path = require('path')
const fs = require('fs')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally')
const CopyPlugin = require('copy-webpack-plugin')

const vendorPath = path.resolve(__dirname, 'src/vendor')

/**
 * @description Generate common components and controllers
 * @var commonComponentsPath string path to components
 * @var commonControllerPath string path to controllers
 * @var commonFilesToConcat array of files to concat
 */

const commonComponentsPath = path.join(__dirname, 'src/js/common/components')
const commonControllerPath = path.join(__dirname, 'src/js/common/controllers')
const commonFilesToConcat = []

fs.readdirSync(commonComponentsPath).map(file => {
  const filePath = path.join(commonComponentsPath, file)
  commonFilesToConcat.push(filePath)
})

fs.readdirSync(commonControllerPath).map(file => {
  const filePath = path.join(commonControllerPath, file)
  commonFilesToConcat.push(filePath)
})

/**
 * @description Generate components and controllers
 * @var componentsRootPath string path to components
 * @var controllerRootPath string path to controllers
 * @var filesToConcat array of files to concat
 */

const componentsRootPath = path.join(__dirname, 'src/js/components')
const controllerRootPath = path.join(__dirname, 'src/js/controllers')
const filesToConcat = []

fs.readdirSync(componentsRootPath).map(file => {
  const filePath = path.join(componentsRootPath, file)
  
  filesToConcat.push(filePath)
})

fs.readdirSync(controllerRootPath).map(folder => {
  const controllerPath = path.join(__dirname, 'src/js/controllers', folder)

  fs.readdirSync(controllerPath).map(file => {
    const fileName = file.substring(0, file.length - 3)
    const filePath = path.join(controllerPath, fileName)

    filesToConcat.push(filePath)
  })
})

module.exports = {
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  entry: {
    polyfill: '@babel/polyfill',
    common: commonFilesToConcat,
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
      filename: 'arquivos/0-dcs-web-[name].css',
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
        'arquivos/0-dcs-web-vendors.js': [
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
        'arquivos/0-dcs-web-vendors.js': code => require("uglify-js").minify(code).code,
      }
    })
  ]
}
