APP.component.Favorites = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    if (typeof APP.i.Helpers === 'undefined') {
      throw new TypeError('You need Helpers Component installed.')
    }

    this.options = $.extend({
      helpers: APP.i.Helpers,

      masterdataEntity: 'FV',
      masterdataStore: 'decathlonstore',
      masterdataHeaders: {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json'
      },

      attrProductId: 'data-product-id',

      classShelf: 'shelf-item',
      classButton: 'shelf-item__favorite-button',//Aquiiiiii
      classButtonActive: 'shelf-item__favorite-button--active',
      classButtonBuyList: 'bl-product-trigger',
      classProductName: 'shelf-item__title-link',
      classProductImage: 'shelf-item__image',
      classProductLink: 'shelf-item__title-link',
      classFavoriteCounter: 'header-links__link--wishlist .header-links__counter',

      /* eslint-disable no-unused-vars */
      onInsert (response, $favoriteButton) {},

      onRemove (response, $favoriteButton) {}
      /* eslint-enable no-unused-vars */
    }, options)

    this.userId = null
  },

  start () {
    this.startFavorites()
  },

  startFavorites () {
    const {
      helpers
    } = this.options

    if (helpers._isLoggedIn() === false) {
      return false
    }

    if (this.userId === null) {
      helpers._getUserId(userId => {
        this.userId = userId

        this._getProducts(userId, response => {
          const [ data ] = response
          const { products } = data

          this._iterateProducts(products)
        })
      })

      return false
    }

    this.getProducts(this.userId, response => {
      this._iterateProducts(response)
    })
  },

  _iterateProducts (products) {
    const productsObj = typeof products === 'string' ? JSON.parse(products) : products

    for (const product in productsObj) {
      if (Object.prototype.hasOwnProperty.call(products, product)) {
        this._markProduct(product)
      }
    }
  },

  _markProduct (productId) {
    const {
      classShelf,
      classButton,
      classButtonActive,
      attrProductId
    } = this.options

    $(`.${classShelf}[${attrProductId}="${productId}"]`)
      .find(`.${classButton}`)
      .addClass(classButtonActive)
  },

  bind () {
    this.bindAddFavorite()
    this.bindRemoveFavorite()
  },

  bindAddFavorite () {
    const {
      classButton,
      classButtonActive,
      classButtonBuyList
    } = this.options

    $('body')
      .on('click', `.${classButton}:not(.${classButtonActive} .${classButtonBuyList})`, event => this._bindFn(event, 'add'))
  },

  bindRemoveFavorite () {
    const { classButtonActive } = this.options

    $('body').on('click', `.${classButtonActive}`, event => this._bindFn(event, 'remove'))
  },

  _bindFn (event, action = 'add') {
    const {
      helpers,
      classShelf,
      classButtonActive
    } = this.options

    event.preventDefault()

    const _this = $(event.currentTarget)
    const $shelf = _this.parents(`.${classShelf}`)
    const productInfo = this._getProductInfo($shelf)

    if (action === 'add') {
      _this.addClass(classButtonActive)
    } else {
      _this.removeClass(classButtonActive)
    }

    if (this.userId === null) {
      helpers._getUserId(userId => {
        this.userId = userId
        this._getProductsFn(action, userId, productInfo, _this)
      })
    } else {
      this._getProductsFn(action, this.userId, productInfo, _this)
    }
  },

  _getProductsFn (action = 'add', userId, productInfo, $favoriteButton) {
    this._getProducts(userId, productsResponse =>
      action === 'add' ?
        this._addFavorite(userId, productInfo, productsResponse, $favoriteButton) :
        this._patchFavorite(productInfo, productsResponse, $favoriteButton, false)
    )
  },

  _addFavorite (userId, productInfo, productsResponse, $favoriteButton) {
    if (productsResponse.length > 0) {
      this._patchFavorite(productInfo, productsResponse, $favoriteButton)
    } else {
      const productSave = {}
      productSave[productInfo.id] = productInfo

      const total = productSave ? Object.keys(productSave).length : 0
      this.setTotalFavorites(total)

      const productsObject = {
        products: JSON.stringify(productSave),
        user: userId
      }

      this.saveFavorite(productsObject, $favoriteButton)
    }
  },

  _patchFavorite (productInfo, productsResponse, $favoriteButton, add = true) {
    const [ favoriteResponse ] = productsResponse

    const products = favoriteResponse.products
    const productsObject = products === null ? {} : JSON.parse(products)

    if (add === true) {
      productsObject[productInfo.id] = productInfo
    } else {
      delete productsObject[productInfo.id]
    }

    const total = productsObject ? Object.keys(productsObject).length : 0

    favoriteResponse.products = productsObject
    delete favoriteResponse.user

    this.setTotalFavorites(total)

    this.saveFavorite(favoriteResponse, $favoriteButton, 'patch')
  },

  setTotalFavorites (total = '0') {
    const { classFavoriteCounter } = this.options

    $(`.${classFavoriteCounter}`)
      .text(total)
  },

  saveFavorite (productsObject, $favoriteButton, type = 'post') {
    const {
      masterdataStore,
      masterdataEntity,
      masterdataHeaders,
      classButtonActive,
      onInsert,
      onRemove
    } = this.options

    let url = ''
    url += `/${masterdataStore}/dataentities`
    url += `/${masterdataEntity}/documents`

    const data = JSON.stringify(productsObject)

    $.ajax({
      url,
      data,
      type,
      headers: masterdataHeaders
    }).then(response => {
      if (type === 'post') {
        onInsert(response, $favoriteButton)
      } else {
        onRemove(response, $favoriteButton)
      }
    }, error => {
      $favoriteButton.removeClass(classButtonActive)

      console.error('Error on insert product.')
      throw new Error(error)
    })
  },

  _getProducts (userId, callback) {
    const {
      masterdataStore,
      masterdataEntity,
      masterdataHeaders
    } = this.options

    let url = ''
    url += `/${masterdataStore}`
    url += `/dataentities/${masterdataEntity}/search`
    url += `?_where=user=${userId}`
    url += `&_fields=id,user,products`
    url += `&utm_source=${Math.random().toString(36).substring(2)}`

    $.ajax({
      url,
      type: 'get',
      headers: masterdataHeaders
    }).then(response => {
      if (typeof callback === 'function' && response.length > 0) {
        callback(response)
      }
    }, error => {
      console.error('Error on get list of favorites products.')

      throw new Error(error)
    })
  },

  _getProductInfo ($shelf) {
    const {
      attrProductId,
      classProductName,
      classProductImage,
      classProductLink
    } = this.options

    const id = parseInt($shelf.attr(attrProductId), 10)
    const name = $shelf.find(`.${classProductName}`).text().trim()
    const image = $shelf.find(`.${classProductImage} img`).attr('src')
    const link = $shelf.find(`.${classProductLink}`).attr('href')

    return {
      id,
      name,
      image,
      link
    }
  }
})
