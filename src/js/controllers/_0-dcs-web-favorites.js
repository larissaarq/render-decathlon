APP.controller.Favorites = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.Helpers = APP.i.Helpers
    this.Favorites = APP.i.Favorites

    this.$target = $('.favorites__target')

    this.template = variables => {
      return `<div class="favorites__item">
                <div class="shelf-item" data-product-id="${variables.id}">
                  <!-- START: Favorite -->
                  <div class="shelf-item__favorite shelf-item__hover">
                    <button class="shelf-item__favorite-button shelf-item__favorite-button--active">Favoritar</button>
                  </div>
                  <!-- END: Favorite -->

                  <!-- START: Image -->
                  <div class="shelf-item__img">
                    <a href="${variables.link}" class="shelf-item__img-link" title="${variables.name}">
                      <div class="shelf-item__image">
                        <img src="${variables.image}" alt="${variables.name}" />
                      </div>
                    </a>
                  </div>
                  <!-- END: Image -->

                  <!-- START: Info -->
                  <div class="shelf-item__info">
                    <!-- START: Name -->
                    <h3 class="shelf-item__title">
                      <a title="${variables.name}" href="${variables.link}" class="shelf-item__title-link">${variables.name}</a>
                    </h3>
                    <!-- END: Name -->
                  </div>
                  <!-- END: Info -->
                </div>
              </div>`
    }
  },

  start () {
    this.startFavorites()
  },

  startFavorites () {
    const {
      Helpers
    } = this

    if (Helpers._isLoggedIn() === false) {
      Helpers._showLogin()
    }

    this.getProducts()
  },

  getProducts () {
    const {
      Favorites,
      Helpers
    } = this

    Helpers._getUserId(userId => {
      Favorites._getProducts(userId, response => {
        const [ data ] = response
        const { products } = data

        this._iterateProducts(products)
      })
    })
  },

  _iterateProducts (products) {
    for (const product in products) {
      if (Object.prototype.hasOwnProperty.call(products, product)) {
        const html = this.template(products[product])

        this.$target.append(html)
      }
    }
  },

  bind () {}
})
