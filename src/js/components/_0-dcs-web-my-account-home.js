APP.component.MyAccountHome = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      completion: null
    }, options)
  },

  start () {
    const {
      completion: {
        percent
      }
    } = this.options

    $("#bluecircle").percircle({ percent: percent, text: '' })
    this.stuffCart()
  },

  stuffCart () {
    let orderform = vtexjs.checkout.orderForm
    if(orderform.items.length === 0) {
      const email = vtexjs.checkout.orderForm.clientProfileData.email
      $.ajax({
        url: `/api/dataentities/MC/search?_where=email=${email}&_fields=skus`,
        type: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.vtex.ds.v10+json',
          'cache-control': 'no-cache',
        },
        data: {}
      }).done(function (response) {
        const orderFormSkus = JSON.parse(response[0].skus)
        orderFormSkus.map(item => {
          const hrefBuyButton = `/checkout/cart/add?sku=${item.id}&qty=${item.quantity}&seller=${item.seller}&redirect=true&sc=3`
          APP.i.Minicart.addCart(hrefBuyButton, () => {
            APP.i.Minicart.openCart()
          })
        })
      })
    }
  },

  bind () {}
})
