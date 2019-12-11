APP.component.Compare = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.bind()
  },

  setup (options) {
    if (typeof APP.i.Helpers === 'undefined') {
      throw new TypeError('You need Helpers Component installed.')
    }

    this.options = $.extend({
      classCompare: 'compare-bar',
      classCompareContent: 'compare-bar__content',
      classCompareRemove: 'compare-bar__remove',
      classCompareTotal: 'compare-bar__total',
      classCompareActive: 'compare-bar--active',
      classCompareToggle: 'compare-bar__toggle',
      classCompareShrink: 'compare-bar--shrink',
      classCompareButton: 'compare-bar__button',

      classShelfItem: 'shelf-item',
      classShelfImage: 'shelf-item__image',
      classShelfTitle: 'shelf-item__title-link',
      classShelfCompare: 'shelf-item__compare',
      classShelfCompareCheckbox: 'shelf-item__compare-checkbox',
      classShelfLabelActive: 'shelf-item__compare-label--active',

      attrProductId: 'data-product-id',

      templateProduct (products) {
        return `${products.map(item => `
                  <div class="compare-bar__product">
                    <a href="#" class="compare-bar__remove" data-product-id="${item.id}">
                      <span class="compare-bar__remove-icon"></span>
                    </a>

                    <div class="compare-bar__product-image">
                      <img src="${item.image}" alt="${item.title}" />
                    </div>

                    <div class="compare-bar__product-title">${item.title}</div>
                  </div>
                `).join('')}`
      }
    }, options)
  },

  bind () {
    this.bindRemoveProduct()
    this.bindCompare()
    this.bindHideShow()
  },

  bindCompare () {
    const {
      classShelfCompareCheckbox
    } = this.options

    $('body').on('change', `.${classShelfCompareCheckbox}`, event => this.checkBar(event))
  },

  checkBar (event) {
    const {
      classCompare,
      classShelfCompare,
      classCompareShrink,
      classShelfLabelActive
    } = this.options

    const _this = $(event.currentTarget)
    const $label = _this.parent('label')

    if (_this.is(':checked')) {
      $label.addClass(classShelfLabelActive)
    } else {
      $label.removeClass(classShelfLabelActive)
    }

    const $compare = $(`.${classShelfCompare} input:checked`)
    const total = $compare.length

    if (total > 4) {
      alert('Só é possível comparar 4 itens por vez.') // eslint-disable-line no-undef, no-alert

      const _this = $(event.currentTarget)
      _this.removeAttr('checked')
      $label.removeClass(classShelfLabelActive)

      return false
    }

    this.updateCounter(total)
    this.updateProducts($compare)

    if (total > 1) {
      this.enableBar()
    } else {
      this.disableBar()
      $(`.${classCompare}`).removeClass(classCompareShrink)
    }
  },

  enableBar () {
    this.toggleBar('addClass')
  },

  disableBar () {
    this.toggleBar('removeClass')
  },

  toggleBar (action) {
    const {
      classCompare,
      classCompareActive
    } = this.options

    $(`.${classCompare}`)[action](classCompareActive)
  },

  updateCounter (total) {
    const { classCompareTotal } = this.options

    $(`.${classCompareTotal}`).text(total)
  },

  updateProducts ($compare) {
    const products = this.iterateProducts($compare)

    const url = this.getCompareUrl(products)

    this.setButtonUrl(url)
    this.mountProducts(products)
  },

  iterateProducts ($compare) {
    const {
      classShelfItem,
      classShelfImage,
      classShelfTitle,
      attrProductId
    } = this.options

    const products = []

    $compare.each((index, element) => {
      const _this = $(element)

      const $shelfItem = _this.parents(`.${classShelfItem}`)
      const id = $shelfItem.attr(attrProductId)
      const image = $shelfItem.find(`.${classShelfImage} img`).attr('src')
      const title = $shelfItem.find(`.${classShelfTitle}`).text()

      products.push({
        id,
        image,
        title
      })
    })

    return products
  },

  getCompareUrl (products) {
    let url = '/compare?refp='

    url += products.reduce((accumulator, currentValue, currentIndex, array) => {
      const { id } = currentValue

      accumulator += id

      if (currentIndex !== array.length - 1) {
        accumulator += ';'
      }

      return accumulator
    }, '')

    return url
  },

  setButtonUrl (url) {
    const {
      classCompareButton
    } = this.options

    $(`.${classCompareButton}`).attr('href', url)
  },

  mountProducts (products) {
    const {
      classCompareContent,
      templateProduct
    } = this.options

    const content = templateProduct(products)

    $(`.${classCompareContent}`).html(content)
  },

  bindHideShow () {
    const {
      classCompare,
      classCompareToggle,
      classCompareShrink
    } = this.options

    $('body').on('click', `.${classCompareToggle}`, event => {
      event.preventDefault()

      const $compare = $(`.${classCompare}`)

      if ($compare.hasClass(classCompareShrink)) {
        $compare.removeClass(classCompareShrink)
      } else {
        $compare.addClass(classCompareShrink)
      }
    })
  },

  bindRemoveProduct () {
    const {
      classCompareRemove,
      classShelfItem,
      classShelfCompare,
      attrProductId
    } = this.options

    $('body').on('click', `.${classCompareRemove}`, event => {
      event.preventDefault()

      const _this = $(event.currentTarget)
      const productId = _this.attr(attrProductId)

      const $product = $(`.${classShelfItem}[${attrProductId}='${productId}']`)
      const $checkbox = $product.find(`.${classShelfCompare} input:checked`)

      $checkbox.removeAttr('checked')
      $checkbox.trigger('change')
    })
  }
})
