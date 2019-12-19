APP.component.Minicart = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },
  setup (options) {
    this.options = $.extend({
      thumbWidth: 100,
      thumbHeight: 100,
      attemptsError: 2,
      template: variables => {
        return `<li class="minicart-product__item">
                  <div class="minicart-product__info">
                    <h4 class="minicart-product__title">
                      <a href="${variables.link}" class="minicart-product__link">${variables.name}</a>
                    </h4>
                    <ul class="minicart-product__size-color">
                      <li class="minicart-product__size">Tamanho: ${variables.colorSize.size}</li>
                      <li class="minicart-product__color">Cor: ${variables.colorSize.color}</li>
                    </ul>
                    <div class="minicart-product__best-price">${variables.bestPrice}</div>
                    <div class="minicart-product__delete">
                      <a href="#" data-product-sku="${variables.sku}" data-product-name="${variables.name}" class="minicart-product__delete-link"><i class="dkti-delete"></i> Excluir</a>
                    </div>
                  </div>
                  <div class="minicart-product__image">
                    <a href="${variables.link}" class="minicart-product__link">
                      <img src="${variables.image}" alt="${variables.name}" />
                    </a>
                  </div>
                </li>`
      },
      $scope: $('.minicart'),
      $close: $('.minicart-close, .minicart-overlay, .minicart-resume__actions--buy'),
      $openHeader: $('.header__minicart'),
      $open: $('.header__minicart-button'),
      $list: $('.minicart-products'),
      $totalItems: $('.minicart-resume__total-counter, .header__minicart-amount'),
      $totalPrice: $('.minicart-resume__total-price-target'),
      classBody: 'body-lock',
      classOpenHeader: 'header__minicart--open',
      classOpen: 'minicart--open',
      classLoading: 'minicart--loading',
      classItem: 'minicart-product__item',
      classDelete: 'minicart-product__delete',
      classControlLess: 'minicart-control--less',
      classControlItems: 'minicart-control--items',
      classControlMore: 'minicart-control--more'
    }, options)
  },
  start () {
    this.populateCart()
  },
  populateCart () {
    this.getItemsCart(response => {
      this.setCart(response)
      this.populate()
      this.shipping(response);
    })
  },
  getItemsCart (callback) {
    this._showLoading()
    vtexjs.checkout.getOrderForm()
      .then(response => {
        callback(response)
        this._hideLoading()
      }, error => {
        throw new Error(error)
      })
  },
  getColorSize (item, callback) {
    $.ajax({
      url: `/api/catalog_system/pub/products/search?fq=skuId:${item.id}`,
      type: 'GET',
      data: {}
    }).done(function (response) {
      const result = response[0].items.find(sku => sku.itemId === item.id);
      const colorSize = {
        color: result.Cor ? result.Cor[0] : "",
        size: result.Tamanho ? result.Tamanho[0] : ""
      }
      callback(colorSize)
    })
  },
  populate () {
    this.options.$list.html('')
    this.totalItems = 0
    this.populateItems()
  },
  populateItems (skus) {
    let cart = this.cart.items
   /* if(this.cart.items.length > 0 ){
    }else {
      if(skus !== undefined) {
        const orderFormSkus = JSON.parse(skus)
        cart = orderFormSkus
      }
    }*/
    cart.map(item => {
      this.getColorSize(item, colorSize => {
        const $product = this.options.template({
          link: item.detailUrl,
          colorSize: colorSize,
          image: this._fixImage(item.imageUrl),
          name: item.name == item.skuName ? item.name : item.name.replace(item.skuName, ''),
          bestPrice: this._formatPrice(item.price, 'R$ '),
          listPrice: this._formatPrice(item.listPrice),
          quantity: item.quantity,
          sku: item.id
        })
        this.totalItems += item.quantity
        this.options.$list.append($product)
        return item
      })
    })
    $('.minicart').on('ajaxStop', () => {
      this.populateInformations()
    })
  },
  populateInformations () {
    this.options.$totalItems.html(this.totalItems)
    this.options.$totalPrice.html(this._formatPrice(this.cart.value, 'R$ '))
    if (this.totalItems < 1) {
      this.options.$scope.addClass('minicart-empty')
    } else {
      this.options.$scope.removeClass('minicart-empty')
    }
  },
  _showLoading () {
    this.options.$scope.addClass(this.options.classLoading)
  },
  _hideLoading () {
    this.options.$scope.removeClass(this.options.classLoading)
  },
  _fixImage (url) {
    const imageProtocol = this._fixImageProtocol(url)
    const imageResized = this._resizeImage(imageProtocol)
    return imageResized
  },
  _fixImageProtocol (url) {
    return url.replace('http:', '')
  },
  _resizeImage (url) {
    const pattern = /(-)(\d+)(-)(\d+)/gi
    const replace = `$1${this.options.thumbWidth}$3${this.options.thumbHeight}`
    return url.replace(pattern, replace)
  },
  _formatPrice (price, prefix) {
    let priceString = price.toString()
    if (priceString.length < 3) {
      priceString = `00${priceString}`
    }
    let temp = priceString.replace(/([0-9]{2})$/g, ',$1')
    if (temp.length > 6) {
      temp = temp.replace(/([0-9]{3}),([0-9]{2}$)/g, '.$1,$2')
    } else if (temp.length > 9) {
      temp = temp.replace(/([0-9]{3}).([0-9]{3}),([0-9]{2}$)/g, '.$1.$2,$3')
    }
    if (typeof prefix !== 'undefined') {
      temp = prefix + temp
    }
    return temp
  },
  _saveCart (callback) {
    const orderForm = vtexjs.checkout.orderForm
    const loggedIn =  orderForm.loggedIn
    if (loggedIn) {
      const emailClient = orderForm.clientProfileData.email
      // const emailMd5 = $.md5(emailClient);
      const emailMd5 = orderForm.userProfileId;
      let obj = {
        'id': emailMd5,
        'email': emailClient,
        'skus': JSON.stringify(orderForm.items)
      }
      $.ajax({
        url: `/decathlonstore/dataentities/MC/documents/${emailMd5}`,
        type: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.vtex.ds.v10+json'
        },
        data: JSON.stringify(obj),
        success: function (data) {
          if (callback){
            callback(data);
          }
        },
        error: function (error) {
          if (callback){
            callback(error);
          }
        }
      })
    }
  },
  bind () {
    this.bindOpenCart()
    this.bindClose()
    this.bindLess()
    this.bindMore()
    this.bindRemove()
    this.bindOrderUpdate()
    this.bindEmptyCart()
    this.bindCalculateShipping()
  },
  bindOpenCart () {
    this.options.$open.on('click', event => {
      event.preventDefault()
      this.toggleCart();
    })
  },
  bindClose () {
    this.options.$close.on('click', e => {
      e.preventDefault()
      this.closeCart()
    })
  },
  toggleCart() {
    this.options.$scope.toggleClass(this.options.classOpen)
    this.options.$openHeader.toggleClass(this.options.classOpenHeader)
    $('body').toggleClass('open-minicart')
  },
  openCart () {
    this.options.$scope.addClass(this.options.classOpen)
    this.options.$openHeader.addClass(this.options.classOpenHeader)
    $('body').addClass('open-minicart')
  },
  closeCart () {
    this.options.$scope.removeClass(this.options.classOpen)
    this.options.$openHeader.removeClass(this.options.classOpenHeader)
    $('body').removeClass('open-minicart')
  },
  bindLess () {
    this.options.$scope.on('click', `.${this.options.classControlLess}`, event =>
      this.bindControl(event, this._lessCalc))
  },
  _lessCalc (items) {
    if (items === 1) {
      return false
    }
    return items - 1
  },
  bindMore () {
    this.options.$scope.on('click', `.${this.options.classControlMore}`, e =>
      this.bindControl(e, this._moreCalc))
  },
  _moreCalc (items) {
    return items + 1
  },
  bindControl (event, calc) {
    event.preventDefault()
    const _this = $(event.currentTarget)
    const $controlItems = _this.parent().find(`.${this.options.classControlItems}`)
    const totalItems = Number($controlItems.text())
    const index = _this.parents(`.${this.options.classItem}`).index()
    const quantity = calc(totalItems)
    if (quantity === false) {
      return false
    }
    this.updateCart(index, quantity)
  },
  bindRemove () {
    $('body').on('click', `.${this.options.classDelete}`, event => {
      event.preventDefault()
      const _this = $(event.currentTarget)
      const index = _this.parents(`.${this.options.classItem}`).index()
      this.updateCart(index, 0, 'removeItems')
    })
  },
  updateCart (index, quantity, action = 'updateItems') {
    const item = this.cart.items[index]
    this._saveCart()
    let attempts = 0
    item.quantity = quantity
    item.index = index
    this._showLoading()
    vtexjs.checkout[action]([item])
      .then(response => {
        this.setCart(response)
        this.populate()
        this.shipping(response);
        this._hideLoading()
        attempts = 0
      }, error => {
        if (error.status === 500 && attempts < this.options.attempsError) {
          attempts++
          this._hideLoading()
          this.updateCart(index, quantity, action)
        }
        throw new Error(error)
      })
  },
  setCart (response) {
    this.cart = {
      value: response.value,
      items: response.items
    }
  },
  itemExists (sku) {
    const items = this.cart.items
    return items.filter(item => parseInt(item.id, 10) === sku)
  },
  addCart (url, callback) {
    const urlTrat = url.split('&')
    const skuProduct = urlTrat[0].split('=')[1]
    const quantity = urlTrat[1].split('=')[1]
    this.getItemsCart(response => {
      const skuSelected = response.items.filter(item => item.id === skuProduct)
      if(skuSelected.length > 0) {
        const newQuantity = skuSelected[0].quantity+1
        url = url.replace(/(qty=)(\d+)(?=&)/g, `$1${newQuantity}`)
      }
      $.ajax({
        url: this._changeUrlRedirect(url),
        type: 'GET'
      }).then(() => {
        this.populateCart()
        callback()
      }, error => {
        throw new Error(error)
      })
    })
    this._saveCart()
  },
  _changeUrlRedirect (url) {
    const pattern = /(redirect=)(true)/gi
    return url.replace(pattern, `$1false`)
  },
  bindOrderUpdate () {
    $(window).on('orderFormUpdated.vtex', (event, orderForm) => {
      this.setCart(orderForm)
    })
  },
  bindEmptyCart () {
    const contentEmptyCart = `<div class="empty-cart">` +
              `<div class="empty-cart-text">` +
                `<b>Seu carrinho está vazio!</b> ` +
                `Você ainda não adicionou nenhum produto ao seu carrinho!` +
              `</div>` +
            `</div>`
            this.options.$scope.find('.minicart-header').after(contentEmptyCart)
  },
  shipping (orderForm) {
    if(orderForm.shippingData) {
      if(orderForm.shippingData.address) {
        this.setShippingInformation(orderForm)
      }
    }
    if (orderForm.clientProfileData){
      if(orderForm.clientProfileData.phone) {
        if(orderForm.clientProfileData.phone.indexOf("**") != -1) {
          $('.minicart-shipping__form').addClass('hide')
        }
      }
    }
  },
  setShippingInformation(orderForm) {
    if(orderForm.shippingData.address.state === "SP") {
      this.shippingProgressBar(orderForm);
    } else { 
      $(".minicart-products").addClass("minicart-products--shipping")
      $(".minicart-products").removeClass("minicart-products--shipping-bar")
      $(".minicart-shipping__discount").removeClass("minicart-shipping__discount--enabled");
    }

    const logisticsInfo = orderForm.shippingData.logisticsInfo
    if(logisticsInfo.length){
      const slasPrice = logisticsInfo.map(item => item.slas.filter(item => item.id === "Normal")[0].price);
      const shippingValue = slasPrice.reduce((a, b) => a + b)

      if(shippingValue !== null && shippingValue !== undefined) {
        $(".minicart-resume__shipping-value").html(shippingValue == 0 ? 'Frete Grátis' : this._formatPrice(shippingValue, 'R$ '));
        $(".minicart-resume__table-line--shipping").addClass("minicart-resume__table-line--shipping--enabled");
      }
    }
  },
  bindCalculateShipping() {
    $(".minicart-shipping__form").on("submit", (element) => {
      element.preventDefault();
      vtexjs.checkout.getOrderForm().then((orderForm) => {
        const address = {
          "postalCode": $(".minicart-shipping__input").val(),
          "country": 'BRA'
        };
        
        return vtexjs.checkout.calculateShipping(address)
      }).done((orderForm) => {
        this.setShippingInformation(orderForm)
      });
    })
  },
  shippingProgressBar(orderForm) {
    const totalCartValue = orderForm.totalizers.length ? orderForm.totalizers.filter(item => item.id === "Items")[0].value : 0;
    const freeShippingValue = 24999;
    let percent = 0;
    if(totalCartValue >= freeShippingValue) {
      percent = 100;
      $(".minicart-shipping__text").html("Seu frete está grátis!");
    } else {
      percent = (totalCartValue * 100) / freeShippingValue;
      $(".minicart-shipping__text").html("FALTAM <b class=\"minicart-shipping__label--value\">" + this._formatPrice((freeShippingValue - totalCartValue), 'R$ ') + "</b> PARA GANHAR <br><b>FRETE GRÁTIS</b>!");
    }
    $(".minicart-products").addClass("minicart-products--shipping-bar")
    $(".minicart-shipping__bar span").css("width", percent.toFixed(2) + "%")
    $(".minicart-shipping__discount").addClass("minicart-shipping__discount--enabled");
  }
});