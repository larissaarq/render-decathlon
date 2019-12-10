APP.component.MenuFilter = ClassAvanti.extend({
  init () {
    const self = this

    self.start()
    self.bind()
  },

  start () {
    // this.createMenuFilter()
  },

  // createMenuFilter () {
  //   const htmlSearchMenu = $('<div class="search__menu" />')
  //   const htmlInputSearchMenu = $('<input class="search__menu-input" placeholder="Busque um esporte" /><span class="search__menu--icon"><i></i></span>', {
  //     type: 'search'
  //   })

  //   const $fieldsetMenuTitle = $('.menu-content-produtos-por-esporte')
  //   $fieldsetMenuTitle.before(htmlSearchMenu)

  //   const $searchMenu = $('.search__menu')
  //   $searchMenu.html(htmlInputSearchMenu)
  //   $searchMenu.before('<a href="javascript:;" class="search__menu-button"><i></i></a>')
  // },

  bind () {
    this.bindFilterMenu()
  },

  bindFilterMenu () {
    // const $searchMenuInput = $('.search__menu-input')
    // const $MenusList = $('.menu-content-produtos-por-esporte > li')

    $(document).on('keyup', '.search__menu-input', e => {
      const _this = $(e.currentTarget)
      const find = this._slugify(_this.val().toUpperCase())

      $('.menu-content-produtos-por-esporte > li').each((i, e) => {
        const _this = $(e)
        const $el = _this

        const text = this._slugify($el.text().toUpperCase())

        if (text.indexOf(find) > -1) {
          $el.show()
        } else {
          $el.hide()
        }
      })
    })
  },

  _slugify (str) {
    str = str.replace(/^\s+|\s+$/g, '')
    str = str.toLowerCase()

    const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;'
    const to = 'aaaaeeeeiiiioooouuuunc------'

    for (let i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
    }

    str = str.replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    return str
  }
})
