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

  start() {
  },

  // slickTypes() {
  //   if (!APP.i.Helpers._isMobile()) {
  //     return false
  //   }

  //   const tabNav = $('.av-tab__nav--type')

  //   const slickOptions = {
  //     infinite: false,
  //     autoplay: false,
  //     dots: true,
  //     arrows: true,
  //     slidesToShow: 1,
  //     slidesToScroll: 1
  //   }

  //   if (tabNav.hasClass('slick-initialized')) {
  //     tabNav.slick('unslick')
  //   }

  //   setTimeout(() => {
  //     tabNav
  //       .slick(slickOptions)
  //       .on('beforeChange', (event, slick, currentSlide, nextSlide) => {
  //         const _this = $(event.currentTarget)
  //         const current = _this.find(`.slick-slide[data-slick-index='${currentSlide}']`)
  //         const next = _this.find(`.slick-slide[data-slick-index='${nextSlide}']`)
  //         const tabContent = $('.av-tab__content--type')

  //         current
  //           .find('.av-tab__nav-link--type')
  //           .removeClass('av-tab__nav-link--active')

  //         next
  //           .find('.av-tab__nav-link--type')
  //           .addClass('av-tab__nav-link--active')

  //         tabContent
  //           .find('.av-tab--active')
  //           .removeClass('av-tab--active')

  //         tabContent
  //           .find(`.av-tab[data-tab='${nextSlide}']`)
  //           .addClass('av-tab--active')
  //       })
  //   }, 300)
  // },

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
  },

  bind() {

  }
})
