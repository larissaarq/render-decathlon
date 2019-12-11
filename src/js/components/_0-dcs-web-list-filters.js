APP.component.ListFilters = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      $target: $('.search-multiple-navigator'),

      template: `<div class="list-selection">
                  <div class="list-selection__header">
                    <div class="list-selection__title">Sua seleção <span class="list-selection__total">(<span class="list-selection__count">0</span>)</span></div>

                    <a href="#" class="list-selection__clear">Limpar</a>
                  </div>

                  <div class="list-selection__content"></div>

                  <div class="list-selection__empty">Nenhum filtro selecionado</div>
                </div>`,

      classSelection: 'list-selection',
      classSelectionItems: 'list-selection--items',
      classTotal: 'list-selection__count, .filter-button__count',
      classContent: 'list-selection__content',
      classEmptyButton: 'list-selection__empty',
      classFilter: 'list-selection__item'
    }, options)
  },

  start () {
    this.createSelectionBox()
  },

  createSelectionBox () {
    const {
      $target,
      template
    } = this.options

    $target.before(template)
  },

  bind () {
    this.clear()
    this.remove()
  },

  clear () {
    const {
      classEmptyButton
    } = this.options

    $(`.${classEmptyButton}`).on('click', event => {
      event.preventDefault()

      /**
       * Clear all filters
       */
    })
  },

  remove () {
    const {
      classFilter
    } = this.options

    $('body').on('click', `.${classFilter}`, event => {
      event.preventDefault()

      const _this = $(event.currentTarget)
      const filter = _this.attr('data-filter')
      const $checkbox = $(`input[type="checkbox"][rel="${filter}"]`)

      $checkbox.parent().trigger('click')
    })
  },

  /**
   * updateFilter
   */
  updateFilter ($element) {
    const text = $element.text()
    const filter = $element.find('input').attr('rel')

    if ($element.hasClass('filter--active')) {
      this.addFilter(text, filter)

      return true
    }

    this.removeFilter(text)
  },

  addFilter (text, filter) {
    const {
      classSelection,
      classSelectionItems,
      classContent,
      classFilter
    } = this.options

    const spec = filter.match(/(=)(.+)(:)(.+)/)

    const [ , , specName, , specValue ] = spec

    const classSpec = `${classFilter}-content--${specName}`
    const classSpecValue = `${classSpec}-${specValue}`

    const filterLabel = `<a href="#" class="${classFilter}" data-filter="${filter}">
                          <span class="${classFilter}-content ${classSpec} ${classSpecValue}">${text}</span>

                          <span class="${classFilter}-remove"></span>
                        </a>`

    $(`.${classContent}`).append(filterLabel)
    $(`.${classSelection}`).addClass(classSelectionItems)

    this._updateTotal()
  },

  removeFilter (text) {
    const {
      classSelection,
      classSelectionItems,
      classFilter
    } = this.options

    const $selection = $(`.${classSelection}`)
    const $filters = $selection.find(`.${classFilter}`)
    const $filter = $selection.find(`.${classFilter}:contains('${text}')`)

    $filter.remove()

    if ($filters.length === 1) {
      $(`.${classSelection}`).removeClass(classSelectionItems)
    }

    this._updateTotal()
  },

  _updateTotal () {
    const {
      classTotal,
      classContent,
      classFilter
    } = this.options

    const total = $(`.${classContent}`).find(`.${classFilter}`).length

    $(`.${classTotal}`).text(total)
  }
})
