APP.component.Shelf = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
  },

  setup (options) {
    this.options = $.extend({
      $rates: $('.shelf-item__rate ul li'),
      classShelfItem: 'shelf-item',
      classShelfItemInitialized: 'shelf-item--initialized',
      classBestPrice: 'shelf-item__best-price',
      classBuyButton: 'shelf-item__buy-link'
    }, options)

    APP.i.Favorites = new APP.component.Favorites()
  },

  start () {
    this.eachShelf()
    this.setRateStars()
    this.setBuyButton()
  },

  eachShelf () {
    const {
      classShelfItem,
      classShelfItemInitialized
    } = this.options

    $(`.${classShelfItem}`)
      .not(`.${classShelfItemInitialized}`)
      .Lazy({ /* eslint-disable-line new-cap */
        loadShelf (element) {
          const _this = $(element)
          
          if (_this.hasClass(classShelfItemInitialized)) {
            return false
          }

          _this.addClass(classShelfItemInitialized)

          APP.i.SplitPrice = new APP.component.SplitPrice({
            
            $scope: _this
          })
          APP.i.ShelfSku = new APP.component.ShelfSku({
            $scope: _this
          })
        }
      })
  },

  setRateStars () {
    const {
      $rates
    } = this.options

    $rates.each((index, element) => {
      const _this = $(element)
      const rate = _this.attr('class')

      const stars = `<div class="rate-stars rate-stars--${rate}">${rate}</div>`

      _this
        .html('')
        .append(stars)
    })
  },

  setBuyButton () {
    const {
      classBuyButton
    } = this.options

    $(`.${classBuyButton}`).html('<i class="shelf-item__buy-icon"></i>Comprar')
  }

})
