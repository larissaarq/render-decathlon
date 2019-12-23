APP.controller.Compare = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.options = {
      classBuyButton: 'shelf-item__buy-link'
    }
  },

  start () {
    this.changeBuyButtonClass()
  },

  changeBuyButtonClass () {
    const {
      classBuyButton
    } = this.options

    const $buyButton = $(`.${classBuyButton}`)
    $buyButton
      .removeClass(classBuyButton)
      .addClass(`${classBuyButton}--compare`)
  },

  bind () {}
})
