const path = require('path')
const fs = require('fs')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally')
const CopyPlugin = require('copy-webpack-plugin')
const SpritesmithPlugin = require('webpack-spritesmith')
const StylelintPlugin = require('stylelint-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default
const {
  VueLoaderPlugin
} = require('vue-loader')

const VENDOR_PATH = path.resolve(__dirname, 'src/vendor')
const env = process.env.NODE_ENV

const vendors = [
  `${VENDOR_PATH}/jquery/dist/jquery.min.js`,
  `${VENDOR_PATH}/pointer_events_polyfill/pointer_events_polyfill.js`,
  `${VENDOR_PATH}/bootstrap/dist/js/bootstrap.min.js`,
  `${VENDOR_PATH}/bootstrap-select/dist/bootstrap-select.min.js`,
  `${VENDOR_PATH}/avanti-class/src/avanti-class.js`,
  `${VENDOR_PATH}/avanti-search/src/avanti-search.js`,
  `${VENDOR_PATH}/jquery-lazy/jquery-lazy.min.js`,
  `${VENDOR_PATH}/jquery-mask-plugin/dist/jquery.mask.min.js`,
  `${VENDOR_PATH}/jquery-validation/dist/jquery.validate.min.js`,
  `${VENDOR_PATH}/js-cookie/src/js.cookie.js`,
  `${VENDOR_PATH}/nouislider/distribute/nouislider.min.js`,
  `${VENDOR_PATH}/slick-carousel/slick/slick.min.js`,
  `${VENDOR_PATH}/form.serializeObject/dist/form.serializeObject.min.js`,
  `${VENDOR_PATH}/percircle/dist/percircle.js`,
]

/**
 * @name getPaths
 * @description Return list of files path from root path
 * @param {string} rootPath Path of files
 * @param {function} cb Return callback with file
 * @return {array} Array of files path
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

/**
 * @name makeSprite
 * @description Make sprites from images
 * @param {string} spriteDir Images directory
 * @param {string} spriteOutputDir Output directory of sprites
 * @param {string} spriteOutputName Name of sprite output
 * @return {SpritesmithPlugin} SpritesmithPlugin object
 */

const makeSprite = (spriteDir, spriteOutputDir, spriteOutputName) => {
  return new SpritesmithPlugin({
    src: {
      cwd: spriteDir,
      glob: '*.png'
    },
    target: {
      image: path.resolve(__dirname, 'src/images', `sprite-${spriteOutputName}.png`),
      css: path.resolve(__dirname, spriteOutputDir, `sprite-${spriteOutputName}.scss`)
    },
    apiOptions: {
      cssImageRef: `${env === 'production' ? '/arquivos' : '.'}/sprite-${spriteOutputName}.png`
    }
  })
}

const controllersRootPath = path.join(__dirname, 'src/js/controllers')
const controllers = {}

getPaths(controllersRootPath, file => {
  let fileName = file.substring(0, file.length - 3)
  const filePath = path.join(controllersRootPath, fileName)
  fileName = fileName.replace('_0-dcs-web-', '')

  Object.assign(controllers, {
    [fileName]: filePath
  })
})

const sprites = []

const spritesDir = {
  'retire-na-loja': 'src/images/sprite-retire-na-loja',
  'store-detail': 'src/images/sprite-store-detail',
  'tamanhos': 'src/images/sprite-tamanhos',
  'sprite': 'src/images/sprite',
  'output': 'src/sass/sprites'
}

sprites.push(makeSprite(spritesDir['retire-na-loja'], spritesDir.output, 'retire-na-loja'))
sprites.push(makeSprite(spritesDir['store-detail'], spritesDir.output, 'store-detail'))
sprites.push(makeSprite(spritesDir['tamanhos'], spritesDir.output, 'tamanhos'))
sprites.push(makeSprite(spritesDir['sprite'], spritesDir.output, 'sprite'))

module.exports = {
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  stats: {
    warnings: false
  },
  entry: {
    'polyfill': '@babel/polyfill',
    'common': path.join(__dirname, 'src/js/common/controllers', '_0-dcs-web-general'),
    ...controllers,
    'checkout': path.join(__dirname, 'src/js', 'checkout5-custom'),
    'react-components': path.join(__dirname, 'src/react', 'index'),
    'vue-components': path.join(__dirname, 'src/vue', 'main')
  },
  module: {
    rules: [{
        test: /\.js$/,
        use: [{
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
          // {
          //   loader: 'eslint-loader'
          // }
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
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
            name: 'arquivos/[name].[ext]',
            useRelativePath: true
          }
        }]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader?url=false',
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
    ], {
      copyUnmodified: true
    }),
    new ImageminPlugin({
      pngquant: {
        quality: '65-90'
      }
    }),
    new MergeIntoSingleFilePlugin({
      files: {
        'arquivos/0-dcs-web-vendors-script.js': vendors
      },
      transform: {
        'arquivos/0-dcs-web-vendors-script.js': code =>
          require("uglify-js").minify(code).code
      }
    }),
    new VueLoaderPlugin(),
    // new StylelintPlugin({
    //   failOnError: false,
    //   configFile: path.resolve(__dirname, '.stylelintrc'),
    //   context: path.resolve(__dirname, './src/sass'),
    //   files: '**/*.scss',
    //   syntax: 'scss',
    //   failOnError: false,
    //   quiet: false
    // }),
    ...sprites
  ]
}
