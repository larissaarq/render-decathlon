APP.component.Header = ClassAvanti.extend({
  init () {
    this.setup()
    this.bind()
    this.start()
  },

  setup () {
    APP.i.Search = new APP.component.Search()
    APP.i.Minicart = new APP.component.Minicart()
    APP.i.MenuHeader = new APP.component.MenuHeader()

    this.options = {
      $headerAlertContent: $('.before__header--content')
    }
    $("#header-alert").removeClass('hide')
  },

  start() {
    setTimeout(() => {
      this.counter()
    }, 2000);
  },
  
  counter() {
    const {
      $headerAlertContent,
    } = this.options

    var countDownDate = new Date("Aug 11, 2019 23:45:00").getTime();
    var now = new Date().getTime();
    var distance = countDownDate - now;

    if (distance > 0) {
      setInterval(function () {
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  
        const counter = [days, hours, minutes];
        counter.map((item, index) => $('.counter b')[index].innerHTML = item < 10 ? '0' + item : item);
      }, 1000);

      $headerAlertContent.addClass('active');
      $('body').addClass('header-counter')
    }
  },

  bind () {
    this._bindMobileHelp()
    this._bindCheckUrl()
    this._dropHelpDesktop()
    this._bindCloseAlert()
    // this._closeBeforeHeaderContent()
    // this._bindCheckAlertCookie()
  },

  _bindCloseAlert() {
    const {
      $headerAlertContent,
    } = this.options

    $('body').on('click', '.before__header--close', e => {
      $headerAlertContent.removeClass('active')
      $('body').removeClass('header-counter')
    })
  },

  _bindMobileHelp () {
    $('.mobile-menubar-link--help').on('click', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)

      _this.toggleClass('selected').parent().toggleClass('selected').find('.mobile-menubar-box').toggleClass('opened')
      $('.mobile-menubar-link--menubar').parent().removeClass('selected')
      $('.mobile-menubar-first-level, .mobile-menubar-second-level').removeClass('opened')
    })

    $('.mobile-menubar-box--close').on('click', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)

      _this.closest('.mobile-menubar-box').removeClass('opened').closest('.mobile-menubar-item').removeClass('selected').find('.mobile-menubar-link--help').removeClass('selected')
    })
  },

  _bindCheckUrl () {
    const urlPath = window.location.pathname.toString()

    $('.mobile-menubar-item').each((i, e) => {
      const _this = $(e)

      const checkEl = _this.find('.mobile-menubar-link[href="' + urlPath + '"]').attr('href')

      if (checkEl === urlPath) {
        _this.addClass('selected').find('.mobile-menubar-link').addClass('selected')
      }
    })
  },

  /* 
  _bindCheckAlertCookie () {
    const {
      $headerAlertContent,
    } = this.options

    const labelAlert = Cookies.get('dkt-headerAlert');
    $headerAlertContent.addClass('before__header--hidden')
    $('.main__top-header').addClass('main__top-header--opened')
    $('body').addClass('no-header-alert')
    $('main').addClass('main--up')
    
    if(labelAlert == true || labelAlert == undefined){
      $headerAlertContent.removeClass('before__header--hidden')
      $('body').removeClass('no-header-alert')
      $('main').removeClass('main--up')
    }
  },
  
  _closeBeforeHeaderContent () {
    const {
      $headerAlertContent,
    } = this.options

    $('.before__header--close').on('click', e => {
      e.preventDefault()
      $headerAlertContent.addClass('before__header--hidden')
      $('body').addClass('no-header-alert')
      $('main').addClass('main--up')
      $('.product-fixed-bar').addClass('product-fixed-bar--up')

      Cookies.set('dkt-headerAlert', false, { expires: 3 });
    })
  },
  */

  _dropHelpDesktop () {
    $('.header__content--help').on('mouseenter', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)

      _this.find('.header__content--linkbox').addClass('box-opened')
    })

    $('.header__content--help').on('mouseleave', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)

      _this.find('.header__content--linkbox').removeClass('box-opened')
    })
  }
})
