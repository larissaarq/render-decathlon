APP.component.ShelfSku = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
  },
  
  setup (options) {
    if (typeof APP.i.Helpers === 'undefined') {
      throw new TypeError('You need Helpers Component installed.')
    }

    this.options = $.extend({
      helpers: APP.i.Helpers,

      $scope: null,

      classBindClick: 'shelf-colors__link',
      classImage: 'shelf-item__image',

      imageWidth: '220',
      imageHeight: '220',
      attrScopeProductId: 'data-product-id',
      attrImage: 'data-image',
      fieldName: 'Cor',

      target ($scope, content) {
        $scope.find('.shelf-item__colors').html(content)
      },

      templateSkuList (variables) {
        return `<ul class="shelf-colors__list${(variables.length < 4 ? ' shelf-colors-no-slick' : '')}">
                  ${variables.map(item => `
                    <li class="shelf-colors__item">
                      <a href="javascript:;" class="shelf-colors__link" data-image="${item.image}" data-color="${item.name}">
                        <img src="${item.image}" class="shelf-colors__image" title="${item.name}" alt="${item.name}" />
                      </a>
                    </li>
                  `).join('')}
                </ul>`
      }
    }, options)
  },

  start () {
    this.getProduct(product => {
      const { fieldName } = this.options

      if ($.isEmptyObject(product.dimensionsMap)) {
        return false
      }

      const options = product.dimensionsMap[fieldName]

      if (typeof options === 'undefined') {
        return false
      }

      if (options.length <= 1 || product.available === false) {
        return false
      }

      const fields = options.map(option => this._getSkus(option, product.skus))

      this.createOptions(fields)
    })
  },

  getProduct (callback) {
    const {
      $scope,
      attrScopeProductId
    } = this.options
    // console.log($scope)
    const productId = $scope.attr(attrScopeProductId)

    vtexjs.catalog.getProductWithVariations(productId)
      .then(response => {
        if (typeof callback === 'function') {
          callback(response)
        }
      }, error => {
        console.error('Error on get product skus.')
        console.log(error)
      })
  },

  _getSkus (option, skus) {
    const { fieldName } = this.options

    const fields = skus.reduce((accumulator, currentValue) => {
      const field = currentValue.dimensions[fieldName]

      if (typeof field === 'undefined') {
        return accumulator
      }

      const fieldLower = field.toLowerCase()
      if (currentValue.dimensions[fieldName] === option && accumulator.name !== fieldLower) {
        accumulator = {
          name: fieldLower,
          image: currentValue.image,
          url: currentValue.url
        }
      }

      return accumulator
    }, {})

    return fields
  },

  createOptions (fields) {
    const {
      $scope,
      templateSkuList,
      target
    } = this.options

    target($scope, templateSkuList(fields))

    this.bindClickList()

    this.startSlickThumbs($scope)
  },

  bindClickList () {
    const {
      helpers,
      $scope,
      attrImage,
      classBindClick,
      classImage,
      imageWidth,
      imageHeight
    } = this.options

    $(window.document).on('click', `.${classBindClick}`, event => {
      event.preventDefault()
      const _this = $(event.currentTarget)
      const image = _this.attr(attrImage)
      const imageShelf = helpers._changeImageSize(image, imageWidth, imageHeight)
      const colorSkuName = _this.data('color')
      const linkSku = `${_this.closest($scope).find('.shelf-item__hidden-link').val()}?aSku=Cor:${colorSkuName}`

      _this.closest($scope).find('a').not('.shelf-colors__link').each((i, e) => {
        const _this = $(e)
        _this.attr('href', linkSku)
      })

      _this.closest($scope).find(`.${classImage} img`).attr('src', imageShelf)
    })
  },

  startSlickThumbs ($scope) {
    let slidesToShow = 2,
        slidesToScroll = 2

    if ($scope.closest('.mob-shelf').length) {
      slidesToShow = 3
      slidesToScroll = 3
    }

    const slickOptions = {
      autoplay: false,
      dots: false,
      arrows: true,
      slidesToShow: 3,
      slidesToScroll: 3,
      responsive: [
        {
          breakpoint: 992,
          settings: {
            slidesToShow,
            slidesToScroll
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow,
            slidesToScroll
          }
        }
      ]
    }

    $scope.find('.shelf-colors__list').slick(slickOptions)
  }

})
