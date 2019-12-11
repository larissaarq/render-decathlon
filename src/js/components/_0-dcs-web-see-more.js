APP.component.SeeMore = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      $scope: $('.search-multiple-navigator fieldset h5 + div:visible').add($('.search-single-navigator').children('h3 + ul:visible, h4 + ul:visible, h5 + ul:visible')),

      minItems: 6,

      classButtonSee: 'button-see',
      classButtonSeeMore: 'button-see-more',
      classButtonSeeLess: 'button-see-less',
      classSeeMore: 'see-more__content',
      classSeeLess: 'see-less__content'
    }, options)
  },

  start () {
    this.createButton()
  },

  createButton () {
    const {
      $scope,
      minItems,
      classButtonSeeMore,
      classSeeLess,
      classSeeMore
    } = this.options

    $scope.each((index, element) => {
      const _this = $(element)

      const count = _this.children('label, li').length

      if (count >= minItems) {
        _this.after(`<button class="button-see ${classButtonSeeMore}"></button>`)
        _this.removeClass(classSeeLess).addClass(classSeeMore)
      }
    })
  },

  bind () {
    this.bindClickButton()
  },

  bindClickButton () {
    const {
      classButtonSee,
      classButtonSeeMore,
      classButtonSeeLess,
      classSeeMore,
      classSeeLess
    } = this.options

    $('body').on('click', `.${classButtonSee}`, event => {
      event.preventDefault()

      const _this = $(event.currentTarget)
      const $prev = _this.prev()

      if (_this.hasClass(classButtonSeeMore)) {
        _this.removeClass(classButtonSeeMore).addClass(classButtonSeeLess)
        $prev.removeClass(classSeeMore).addClass(classSeeLess)

        return true
      }

      _this.removeClass(classButtonSeeLess).addClass(classButtonSeeMore)
      $prev.removeClass(classSeeLess).addClass(classSeeMore)
    })
  }
})
