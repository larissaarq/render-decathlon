APP.component.MenuHeader = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.options = {
      $scope: $('.menu-content'),
      $menuOverlay: $('.menu-content--overlay'),
      $scopeNavigator: $('#vtexDepartmentNavigator .menu-departamento'),
      $menuBtn: $('.menu-bar__link'),
      $firstLevel: $('.menu-content-first-level'),
      $firstLevelLink: $('.menu-content-link'),
      $secondLevel: $('.menu-content-second-level'),
      $thirdLevel: $('.menu-content-third-level'),

      $slickFeatures: $('.mobile-menubar-featured--slick'),

      menuBtnOpenedClass: 'menu-bar__link--opened',
      menuOpenedClass: 'opened',
      secondLevelClass: 'menu-content-second-level',
    }

    APP.i.MenurFilter = new APP.component.MenuFilter()
  },

  start () {
    if ($(window).width() > 992) {
      this.openMenu()
      this.closeMenu()
    }
    this._isMobile()
  },

  slickFeatures () {
    const {
      $slickFeatures
    } = this.options

    const slickOptions = {
      autoplay: false,
      dots: true,
      arrows: false,
      slidesToShow: 4,
      slidesToScroll: 4
    }

    $slickFeatures.slick(slickOptions)
  },

  openMenu () {
    const {
      $scope,
      $menuBtn,
      $firstLevel,
      $menuOverlay,
      menuBtnOpenedClass,
      menuOpenedClass
    } = this.options

    $menuBtn.on('mouseover', event => {
      event.preventDefault()
      const _this = $(event.currentTarget)

      // $menuOverlay.addClass(`${menuOpenedClass}`)
      $scope.addClass(`${menuOpenedClass}`)
      _this.addClass(`${menuBtnOpenedClass}`)
      $firstLevel.addClass(`${menuOpenedClass}`)
    })

    this.openSecondLevel()
  },

  closeMenu () {
    const {
      $scope,
      $firstLevel,
      $menuOverlay,
      $secondLevel,
      $thirdLevel,
      menuBtnOpenedClass,
      menuOpenedClass
    } = this.options

    $menuOverlay.on('mouseover', event => {
      event.preventDefault()
      const _this = $(event.currentTarget)

      // $menuOverlay.removeClass(`${menuOpenedClass}`)
      $scope.removeClass(`${menuOpenedClass}`)
      _this.removeClass(`${menuBtnOpenedClass}`)
      $firstLevel.removeClass(`${menuOpenedClass}`)
      $secondLevel.removeClass(`${menuOpenedClass}`)
      $thirdLevel.removeClass(`${menuOpenedClass}`)
    })
  },

  openSecondLevel () {
    const {
      $firstLevelLink,
      menuOpenedClass,
      secondLevelClass
    } = this.options

    $firstLevelLink.on('mouseover', event => {
      event.preventDefault()
      const _this = $(event.currentTarget)
      const currentRel = _this.attr('rel')

      _this.parents('.menu-content').find(`.${secondLevelClass}`).removeClass(`${menuOpenedClass}`)
      $(`.${secondLevelClass}[rel="${currentRel}"]`).addClass(`${menuOpenedClass}`)
    })
  },

  _isMobile () {
    if ($(window).width() < 992) {
      this.menuMobile()
      this.mobileMenuFilter()
      this._closeMenuMobile()
      this.slickFeatures()
    }
  },

  menuMobile () {
    $('.mobile-menubar-link--menubar').on('click', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)
      
      $('html, body').toggleClass('body-lock-menu')

      $('.menu__mobile').addClass('menu__mobile--opened');
      this._openMobileSubs()
    })
  },

  _openMobileSubs () {
    $('.menu__first-level--link').on('click', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)
      const currentRel = _this.attr('rel')

      _this.addClass('selected');
      
      $('.menu__mobile-second-level--title').html(_this.text())
      $('.menu-content-second-level[rel="' + currentRel + '"]').addClass('opened')
      $('.menu__mobile-content-second-level').addClass('opened')
    })

    $('.link-arrow:not(.menu__first-level--link)').on('click', e => {
      const _this = $(e.currentTarget)
      
      const nextSubmenu = _this.next('.menu-content__submenu')
      let level = nextSubmenu.data('level')

      if(nextSubmenu.length > 0) {
        e.preventDefault()
        
        var clone = nextSubmenu.clone(true);
        const $menuAppend = $('#menu-append')
        
        let tplButtonBack = ''
        if (level === 3) {
          $menuAppend.empty()
          tplButtonBack = `<a href="" class="menu__mobile--button-back" data-level="3"><i></i><span>Todos os esportes</span></a>`
        } else if(level === 4) {
          $menuAppend.find(`.menu__mobile-level--${level}`).empty()
          tplButtonBack = `<a href="${_this.attr('href')}" class="menu__mobile--button-back" data-level="4"><i></i><span>${_this.text()}</span></a>`
        }
        
        $menuAppend.append(`<div class="menu__mobile-append__level menu__mobile-level--${level}"></div>`).addClass('menu__mobile-append--opened')
        let $appendLevel = $(`.menu__mobile-level--${level}`)
        $appendLevel.append(clone)
        $appendLevel.prepend(tplButtonBack).addClass('opened')
      }
    })    
  },

  _closeMenuMobile () {
    $("body").on("click", ".menu__mobile--button-back", e => {
      e.preventDefault()

      const _this = $(e.currentTarget)
      const level = _this.data('level')

      $(`.menu__mobile-level--${level}`).remove()

      if(level === 2) {
        $('.menu__mobile-content-second-level').removeClass('opened')
        $('.nav-departament-link').removeClass('selected');
        $('.menu-content-container').removeClass('opened');
      } else if(level === 3){
        $('#menu-append').empty().removeClass('menu__mobile-append--opened')
      }

      return false
    })

    $('#menu__mobile--close').on('click', e => {
      e.preventDefault();

      this.closeMenuMobileHiddenElements();
    });
  },

  closeMenuMobileHiddenElements () {
    $('html, body').removeClass('body-lock-menu');
      $('.menu__mobile').removeClass('menu__mobile--opened');
      $('.search__menu-input').val('');
      $('.menu-content-produtos-por-esporte > li').show()
      $('#menu-append').empty()
  },

  mobileMenuFilter () {
    $('.search__menu-button').on('click', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)

      _this.toggleClass('search__menu-button--opened')
      $('.search__menu').toggleClass('search__menu--opened')
      $('.mobile-menubar-second-level').toggleClass('mobile-menubar-search--opened')
    })
  },

  bind () {
    this._bindOpenMenu()
  //  this._bindCloseMenu()
  },

  _bindOpenMenu () {
    $('.nav-departament-link').on('mouseover', (e) => {
      const _this = $(e.currentTarget)
      const rel = _this.attr('rel')
      var left = 0;
            
      if (!_this.hasClass('last-child-dtp')){
        left = _this.offset().left + 30
      } else {
        left = _this.offset().left - 50
      }
      
      $('.menu-content').find('.menu-content-second-level').hide()
      $('.menu-content').find('.menu-content-second-level[rel='+rel+']').css({left, display: 'block'})
    })
  },

  _bindCloseMenu () {
    $menuOverlay.on('mouseover', (e) => {
      const _this = $(e.currentTarget)
      const rel = _this.attr('rel')
      $('.menu-content').find('.menu-content-second-level[rel='+rel+']').css('display', 'none')
    })
  }
})
