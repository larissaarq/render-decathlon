APP.controller.Institucional = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.institucionalMenuMobile = $('.institucional-menu-content-mobile')
    this.galerySlideshow = $('.slideshow.slick-default')
    this.galerySlideshowThumbs = $('.gallery-thumbs-list')
  },

  start () {
    // if ($('body').hasClass('fale-conosco')) {
      // APP.i.formContato = new APP.component.FormContato()
    // }
    this.institucionalSidebar()
    this._startGalerySlideshow()
    this._startGalerySlideshowThumbs()
  },

  institucionalSidebar () {
    if ($('body').hasClass('institucional')) {
      const urlHash = window.location.href
      const urlClean = urlHash.split('.com.br')[1]

      if (urlClean !== null) {
        $('.institucional-menu-content').find('li a').each(function () {
          $(this).removeClass('selected')
          if ($(this).attr('href') === urlClean) {
            $(this).addClass('selected')
          }
        })
      }
    }
  },

  _startGalerySlideshow () {
    this.galerySlideshow.slick({
      mobileFirst: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: true,
      fade: true,
      asNavFor: '.gallery-thumbs-list'
    })
  },

  _startGalerySlideshowThumbs () {
    this.galerySlideshowThumbs.slick({
      mobileFirst: true,
      slidesToShow: 5,
      slidesToScroll: 1,
      arrows: false,
      asNavFor: '.slideshow.slick-default',
      centerMode: true,
      focusOnSelect: true
    })
  },

  bind () {
    this.bindChangeSelect()
  },

  bindChangeSelect () {
    this.institucionalMenuMobile.on('click', function () {
      $(this).toggleClass('active')
    })
  }

})
