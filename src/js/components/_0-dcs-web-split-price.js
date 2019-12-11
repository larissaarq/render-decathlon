APP.component.SplitPrice = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
  },

  setup (options) {
    this.options = $.extend({
      $scope: null,

      classBestPrice: 'shelf-item__best-price',
      classSignalPrice: 'shelf-item__signal-price'
    }, options)
  },

  start () {
    this.splitPrice()
  },

  splitPrice () {
    const {
      $scope,
      classBestPrice,
      classSignalPrice
    } = this.options

    const $price = $scope.find(`.${classBestPrice}`)
    const text = $price.text()

    const [ signal, price ] = text.split(' ')

    const htmlPrice = `<span class="${classSignalPrice}">${signal}</span> ${price}`

    $price.html(htmlPrice)
  }
})
