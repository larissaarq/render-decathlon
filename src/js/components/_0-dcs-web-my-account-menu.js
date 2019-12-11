APP.component.MyAccountMenu = ClassAvanti.extend({
  init(options) {
    this.setup(options)
    this.bind()
  },

  setup(options) {
    this.options = $.extend(
      {
        name: '',
        surname: '',
        national_id: '',
      },
      options
    )
  },

  /*
   * @name setUserNumber
   * @description Altera o interior do elemento referente ao número de identificaçao do usuario.
   * @param <string> number
   */
  setUserNumber(number) {
    $('.my-account-menu__profile-id').html(number)
  },

  /*
   * @name setUserName
   * @description Altera o interior do elemento referente ao nome do usuario.
   * @param <string> name
   * @param <string> surname
   */
  setUserName(name, surname) {

    if(name && surname){
      $('.my-account-menu__profile-name').html(`${name} ${surname}`)
    }else{
      $('.my-account-menu__profile-name').html(`Esportista`)
     
    }

   
  },
  /*
   * @name bind
   * @description Executa os diversos registros de eventos de entrada.
   */
  bind() {
   

    this._bindSubMenuFunctions()
    this._bindMenuFunctions()
  },

  _isMobile() {
    return $(window).width() < 992
  },

  /*
   * @name bindMenuFunctions
   * @description Registra os eventos que serao disparados pelos links do menu mobile.
   */
  _bindMenuFunctions() {
    $(document).on(
      'click',
      'a.my-account-menu__link:not([href="/account/orders"]):not([href="/no-cache/user/logout"]):not(.my-account-menu__link--sub), a.my-account-submenu__link:not(.orders-link), .my-account-sports-list__link, .my-account-stores-list__link, .my-store__button--list-stores, .my-account__home-link--profile',
      event => {
        event.preventDefault()

        const _this = $(event.currentTarget)
        const target = _this.data('target')

        if (!target) {
          console.log('>>>')

          return true
        }

        const href = _this.attr('href')
        const match = href.match(/(#.+)/g)

        if (match !== null) {
          const [hash] = match

          window.location.hash = hash
        }

        if (this._isMobile()) $('.my-account-menu').hide()

        $('.my-account-page').addClass('hidden')
        $('.attached-content').addClass('open')

        $(target).removeClass('hidden')
        $('html, body').animate({ scrollTop: 0 }, 'fast')
      }
    )

    $(document).on('click', 'a.my-account-back', event => {
      const $this = $(event.currentTarget)

      $this.closest('.my-account-page').addClass('hidden')

      if ($this.hasClass('dont-close-parent')) {
        const dataParentTarget = $this.attr('data-parent-target')
        $(dataParentTarget).removeClass('hidden')

        if (this._isMobile()) $('.my-account-menu').hide()

        return true
      } else {
        $('.my-account-menu').show()
        $('.my-account-page--home').removeClass('hidden')
      }

      $('.attached-content').removeClass('open')
    })
  },

  /*
   * @name _bindSubMenuFunctions
   * @description Registra os eventos que serao disparados pelos items que possuem submenus.
   */
  _bindSubMenuFunctions() {
    $('.has-submenu-list a.my-account-menu__link').on('click', event => {
      event.preventDefault()

      const $this = $(event.currentTarget)
      const $submenu = $this.next()
      const $parent = $this.closest('.has-submenu-list')

      if ($submenu.is(':visible')) {
        $submenu.slideUp(200)
        $parent.removeClass('open')

        return true
      }

      $('.has-submenu-list ul').slideUp(200)
      $('.has-submenu-list').removeClass('open')

      $parent.addClass('open')
      $submenu.slideDown(200)
    })
  },
})
