APP.controller.Services = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.$sidebarHeader = $('.services-sidebar__header')
  },

  start () {},

  bind () {
    this.$sidebarHeader.on('click', event => {
      const _this = $(event.currentTarget)
      _this.toggleClass('active')
    })
    this.bindCurrentLink()
  },

  bindCurrentLink () {
    const currentUrl = window.location.pathname
    $('.services-sidebar__list-item').each((i, e) => {
      const _this = $(e)
      const currentLink = _this.attr('href')
      if (currentLink === currentUrl) {
        _this.addClass('current-link')
      }
    })
  }
})
