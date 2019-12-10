APP.component.TabsControl = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      classTabWrap: 'av-tab-wrap',
      classTabNav: 'av-tab__nav',
      classNavLink: 'av-tab__nav-link',
      classNavLinkActive: 'av-tab__nav-link--active',
      classTabContent: 'av-tab__content',
      classTab: 'av-tab',
      classTabActive: 'av-tab--active',

      onChange() {}
    }, options)
  },

  start () {
    this.setFirstTab()
  },

  setFirstTab () {
    const {
      classTabWrap,
      classNavLink,
      classNavLinkActive,
      classTab,
      classTabActive,
      onChange
    } = this.options

    $(`.${classTabWrap}`).each((index, element) => {
      const _this = $(element)
      const mobile = _this.data('mobile')

      if (mobile === false && APP.i.Helpers._isMobile()) {
        return false
      }

      let firstTab = _this.data('first-tab')

      if (firstTab === 'hidden') {
        return false
      }

      if (typeof firstTab === 'undefined' || firstTab === null || firstTab < 0) {
        firstTab = 0
      }

      _this.find(`.${classNavLink}[data-tab-target='${firstTab}']`).addClass(classNavLinkActive)
      _this.find(`.${classTab}[data-tab='${firstTab}']`).addClass(classTabActive)

      onChange()
    })
  },

  bind () {
    this.changeTab()
  },

  changeTab () {
    const {
      classTabWrap,
      classNavLink,
      classNavLinkActive,
      classTab,
      classTabActive,
      onChange
    } = this.options

    $(`.${classNavLink}`).on('click', event => {
      const _self = $(event.currentTarget)
      const mobile = _self.closest(`.${classTabWrap}`).data('mobile')

      if (mobile === false && APP.i.Helpers._isMobile()) {
        return false
      }

      event.preventDefault()

      if (_self.hasClass(classNavLinkActive)) {
        return false
      }

      const tabTarget = _self.data('tab-target')

      // toggle title
      _self.closest(`.${classTabWrap}`).find(`.${classNavLinkActive}`).removeClass(classNavLinkActive)
      _self.addClass(classNavLinkActive)

      // toggle tab
      _self.closest(`.${classTabWrap}`).find(`.${classTab}.${classTabActive}`).removeClass(classTabActive)
      _self.closest(`.${classTabWrap}`).find(`.${classTab}[data-tab="${tabTarget}"]`).addClass(classTabActive)

      onChange()
    })
  }
})
