APP.controller.Kiprun = ClassAvanti.extend({
  init() {
    this.setup()
    this.start()
    this.bind()
  },

  setup() {
    this.options = {
    }

    const _this = this

    APP.i.Helpers = new APP.component.Helpers()
    APP.i.TabsControl = new APP.component.TabsControl({
      onChange() {
        _this.slickTypes()
      }
    })
  },

  start() {},

  bind() {},
  
  slickTypes() {
    if (!APP.i.Helpers._isMobile()) {
      return false
    }

    const tabNav = $('.kipun-content-mobile .av-tab__nav--type')

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: true,
      arrows: true,
      slidesToShow: 1,
      slidesToScroll: 1
    }

    if (tabNav.hasClass('slick-initialized')) {
      tabNav.slick('unslick')
    }

    setTimeout(() => {
      tabNav.slick(slickOptions)
    }, 300)
  }
})
