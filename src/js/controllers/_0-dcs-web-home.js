import '../../sass/pages/_0-dcs-web-home.scss'

APP.controller.Home = ClassAvanti.extend({
  init() {
    this.setup()
    this.start()
    this.bind()
  },

  setup() {
    this.options = {
      $bannerFull: $('.home-banner-full'),
      $sectionInformative: $('.section-informative'),

      classBannerVideo: 'banner-video',
      classSlickFrame: 'slick-frame'
    }

    APP.i.Helpers = new APP.component.Helpers()
    // // APP.i.EnhancedEcommerce = new APP.component.EnhancedEcommerce()
  },

  start() {
    this.startSlick()
    this.checkBannerVideo()

    // APP.i.EnhancedEcommerce.onAccessLandingPage()
  },

  startSlick() {
    this.slickBannerFull()
    this.slickFeaturedSports()
    this.slickFeaturedCategories()
    this.slickSelectionOffers()
    this.slickInformative()
  },

  checkBannerVideo() {
    const {
      $bannerFull,
      classBannerVideo
    } = this.options

    if ($(`.${classBannerVideo} iframe`).length > 0) {
      $bannerFull.addClass('banner-video--open')
    }
  },

  slickBannerFull() {
    const {
      $bannerFull,
      classSlickFrame
    } = this.options

    if ($bannerFull.find('.home-banner-full__wrapper').length < 1) {
      return false
    }

    const slickOptions = {
      infinite: false,
      autoplay: true,
      dots: true,
      speed: 300,
      arrows: true
    }

    APP.i.general._registerSlickIntervalBind(() => {
      $bannerFull.find(`.${classSlickFrame}`).slick(slickOptions)
    })

    const intervalBanner = setTimeout(() => {
      if ($bannerFull.find('.slick-frame.slick-initialized')) {
        clearInterval(intervalBanner)
        $bannerFull.addClass('slick-started')
      }
    }, 100)
  },

  slickFeaturedSports () {
    if (!APP.i.Helpers._isMobile()) {
      return false
    }

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: false,
      arrows: false,
      slidesToShow: 2,
      slidesToScroll: 2
    }

    APP.i.general._registerSlickIntervalBind(() => {
      $('.featured-sports').slick(slickOptions)
    })
  },

  slickFeaturedCategories () {
    if (!APP.i.Helpers._isMobile()) {
      return false
    }

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: false,
      arrows: false,
      slidesToShow: 2,
      slidesToScroll: 2
    }

    APP.i.general._registerSlickIntervalBind(() => {
      $('.featured-categories').slick(slickOptions)
    })
  },

  slickSelectionOffers () {
    if (!APP.i.Helpers._isMobile()) {
      return false
    }

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: true,
      arrows: false,
      slidesToShow: 1,
      slidesToScroll: 1
    }

    APP.i.general._registerSlickIntervalBind(() => {
      $('.selection-offers').slick(slickOptions)
    })
  },

  slickInformative() {
    const {
      $sectionInformative,
      classSlickFrame
    } = this.options

    let enableArrows = false

    if (!APP.i.Helpers._isMobile()) {
      enableArrows = true
    }

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: true,
      arrows: enableArrows,
      slidesToShow: 1,
      slidesToScroll: 1
    }

    APP.i.general._registerSlickIntervalBind(() => {
      $sectionInformative.find(`.${classSlickFrame}`).slick(slickOptions)
    })
  },

  bind() {
    this.getBlogEntries()
  },

  getBlogEntries() {
    if (APP.i.Helpers._isMobile()) {
      return false
    }

    var loaded = false

    $(window).on('scroll', event => {
      // const el = $('.home-banner-middle').last()
      const el = $('.shelf-carousel.home-shelf').last()
      const hT = el.offset().top
      const hH = el.outerHeight()
      const wH = $(window).height()
      const wS = $(event.currentTarget).scrollTop()

      if (wS > (hT + hH - wH) && !loaded) {
        loaded = true

        APP.i.BlogTipsEntries.getEntries('posts', '?filter[destaque]=sim&per_page=6')
        APP.i.BlogEventsEntries.getEntries('', '')
      }
    });
  }
})
