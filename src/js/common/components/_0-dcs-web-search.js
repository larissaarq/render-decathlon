APP.component.Search = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      delay: 300,
      maxRows: 12,
      thumbSize: 50,
      $scope: $('.header__search, .header__search-mobile'),
      $input: $('.search__input'),
      $button: $('.search__submit'),
      $mobIsVisible: $('.header__menu-bar'),

      classOpen: 'header__search--open',
      classTarget: 'search__target',
      classTargetList: 'search__target__list',
      classTargetListItem: 'search__target__item',
      classTargetListItemImage: 'search__target__item--image',
      classTargetListItemCategory: 'search__target__item--category',
      classTargetListLink: 'search__target__link'
    }, options)
  },

  start () {
  },

  bind () {
    this.bindClickOutsideSearch()
    this.bindSearchSubmit()
    this.bindSearch()
  },

  bindClickOutsideSearch () {
    $(window).on('click', e => {
      const $closeBox = this.options.$scope

      if (!$closeBox.is(e.target) && $closeBox.has(e.target).length === 0) {
        $('body').removeClass(this.options.classOpen)

        this.options.$scope.find(`.${this.options.classTarget}`)
          .html('')
          .hide()
          .css({
            height: ''
          })
      }
    })
  },

  bindSearchSubmit () {
    this.options.$button.on('click', e => {
      e.preventDefault()
      
      const val = this.options.$input.val()

      if (val.length > 2) {
        this.submitSearch(val)
      } else {
        this.options.$input.focus()
      }
    })
  },

  bindSearch () {
    let delay = null
    
    this.options.$input.on('keyup', e => {
      e.preventDefault()

      const _this = $(e.currentTarget)
      const val = _this.val()

      const code = e.keyCode || e.which

      if (code === 13 && val.length > 2) {
        this.submitSearch(val)

        return
      }

      clearTimeout(delay)

      delay = setTimeout(() => {
        if (val === '') {
          this.options.$scope.find(`.${this.options.classTarget}`)
            .html('')
            .hide()
            .css('height', '')

          return
        }

        this.getSearchResult(val)
      }, this.options.delay)
    })
  },
  submitSearch: function (terms) {
    const urlTerms = encodeURI(this._removeCharacters(terms))

    window.location = `/${urlTerms}`
  },

  _removeCharacters: function (str) {
    str = str.toLowerCase().trim()

    // remove accents
    const from = "åàáãäâèéëêìíïîòóöôùúüûñç"
    const to = "aaaaaaeeeeiiiioooouuuunc"

    for (let i = 0; i < from.length; i++) {
      str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i))
    }

    str = str.replace(/[^a-z0-9 -]/g, "") // remove invalid chars

    return str
  },

  getSearchResult (terms) {
    $.ajax({
      url: '/buscaautocomplete',
      type: 'get',
      data: {
        maxRows: this.options.maxRows,
        productNameContains: terms
      }
    }).then(response => {
      const items = response.itemsReturned

      const $listResult = $(`<ul class="${this.options.classTargetList}" />`)

      items.map(item => {
        const { name, href, thumb } = item
        const $thumb = this._changeImageSize(thumb, this.options.thumbSize, 25)

        // const { name, href, items } = item
        // const $thumb = this._filterThumb(items)

        const $contentTitle = $('<span />').text(name)

        const $link = $(`<a />`, {
          class: this.options.classTargetListLink,
          href
        })

        $link.append($thumb)
        $link.append($contentTitle)

        const $item = $(`<li class="${this.options.classTargetListItem}" />`)
        if ($thumb) {
          $item.addClass(this.options.classTargetListItemImage)
        } else {
          $item.addClass(this.options.classTargetListItemCategory)
        }

        $item.append($link)
        $listResult.append($item)
        return item
      })

      this.options.$scope.find(`.${this.options.classTarget}`)
        .html($listResult)
        .show()
    })
  },

  _filterThumb (items){
    console.log(items)
  },

  _changeImageSize (image, newSize, actualSize) {
    return image
      .replace(`-${actualSize}-${actualSize}`, `-${newSize}-${newSize}`)
      .replace(`width="${actualSize}"`, `width="${newSize}"`)
      .replace(`height="${actualSize}"`, `height="${newSize}"`)
  },

  _isMob () {
    if (this.options.$mobIsVisible.is(':visible')) {
      return true
    }

    return false
  }
})
