APP.controller.StoreLocator = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.$selectState = $('#states-navigation')
    this.classStoreItem = 'store-item'
    const stateInit = this.$selectState.val()

    APP.i.StoreLocator = new APP.component.StoreLocator(stateInit)
  },

  start () {},

  bind () {
    this.changeState()
    this.bindStoreItem()
  },

  changeState () {
    this.$selectState.on('change', event => {
      const _this = $(event.currentTarget)
      const state = _this.val()

      APP.i.StoreLocator.filterStores(state)
    })
  },

  bindStoreItem () {
    $('body').on('click', `.${this.classStoreItem}`, event => {
      const _this = $(event.currentTarget)

      _this.toggleClass('active')
    })
  }
})
