APP.component.FixedBuyBar = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.options = {
      $scope: $('.product-fixed-bar'),
      $header: $('.header'),
      $productImg: $('#image-main'),
      $productName: $('.productName').first(),
      $productPrice: $('.descricao-preco'),
      $productBuyBtn: $('.product-buy'),

      $fixebBarInner: $('.product-fixed-bar--inner'),
      $fixedBarImg: $('.product-fixed--img'),
      $fixedBarInfo: $('.product-fixed--info'),
      $fixedBarName: $('.product-fixed--name'),
      $fixedBarRating: $('.product-fixed--rating'),
      $fixedBarPrice: $('.product-fixed--price'),
      $fixedBarButton: $('.product-fixed--btn'),
      $fixedBarButtonMobile: $('.product-fixed--btn'),

      $skuColorItem: $('.item-dimension-Cor'),
      $skuColorInput: $('.input-dimension-Cor'),
      $skuSizeItem: $('.item-dimension-Tamanho'),

      tplButtonAncor: `<div id="fixed-bar-notify" class="notifyme-form hidden"><a class="button-ancor" href="#" title="AVISE-ME QUANDO CHEGAR">AVISE-ME QUANDO CHEGAR</a></div>`
    }
  },

  start () {
    const { $fixebBarInner, tplButtonAncor } = this.options
    $fixebBarInner.append(tplButtonAncor)

    this.showBar()
    this.populateBarImg()
    this.populateBarInfo()
    this.populateBarButton()
  },

  showBar () {
    const {
      $scope,
      $header
    } = this.options

    let previousScroll = 0

    $(window).on('scroll', productOffset => {
      const currentScroll = $(window).scrollTop()

      if (this._isMobile()) {
        productOffset = $('.product-info').offset().top
      } else {
        productOffset = $('.product-info').height()
      }

      if (currentScroll > previousScroll) {
        $('.main__header--nav').slideUp()
        $scope.addClass('visible')
        if (this._isMobile()) {
          $('.back-to-top').addClass('back-to-top--up')
        }
      } else {
        $('.main__header--nav').slideDown()
        $scope.removeClass('visible')
        if (this._isMobile()) {
          $('.back-to-top').removeClass('back-to-top--up')
        }

        if (currentScroll < $('.product-info').height()) {
          $scope.removeClass('visible')
        }
      }
      previousScroll = currentScroll
    })
  },

  populateBarImg () {
    const {
      $productImg,
      $productName,
      $fixedBarImg
    } = this.options

    const fixedBarImg = $productImg.attr('src').replace('-500-500', '-40-40')
    const fixedBarName = $productName.text()
    $fixedBarImg.html(`<img src="${fixedBarImg}" alt="${fixedBarName}" title="${fixedBarName}">`)
  },

  populateBarInfo (bestPrice) {
    const {
      $productName,
      $productPrice,
      $fixedBarName,
      $fixedBarPrice
    } = this.options

    if ($productPrice.length > 0) {
      bestPrice = $productPrice.clone(true).html()//.replace('Por: ', '')
    }
    $productName.clone(true).appendTo($fixedBarName)
    $fixedBarPrice.html(bestPrice)
  },

  populateBarButton () {
    const {
      $productBuyBtn,
      $fixedBarButton,
      $fixebBarInner,
      tplButtonAncor
    } = this.options

    if ($(window).width() > 992) {
      if ($('.sku-notifyme').is(':visible')) {
        $('#fixed-bar-notify').removeClass('hidden')
      } else {
        $productBuyBtn.clone(true).appendTo($fixedBarButton)
      }
    }

    // this._buyButtonUrl()

    if (this._isMobile()) {
      if ($('.sku-notifyme').is(':visible')) {
        // $fixebBarInner.append(tplButtonAncor)
        $('#fixed-bar-notify').removeClass('hidden')
      } else {
        const intervalBtn = setInterval(() => {
          if ($('.product-images .buy-button-mobile--container')) {
            clearInterval(intervalBtn)
            $fixedBarButton.find('.buy-button-ref').on('click', e => {
              window.alert = () => {}
              const _this = $(e.currentTarget)
              this._addCart(e, _this)
            })
          }
        })
      }
    } else {
      $fixedBarButton.find('a.buy-button:first').append('<i class="buy-button--icon"></i>')

      $fixedBarButton.find('.buy-button-ref').on('click', e => {
        window.alert = () => {}
        const _this = $(e.currentTarget)
        this._addCart(e, _this)
      })
    }
  },

  _buyButtonUrl () {
    const {
      $productBuyBtn,
      $fixedBarButton,
      $skuSizeItem,
      $skuColorInput
    } = this.options

    $skuSizeItem.find('select').on('change', () => {
      if (this._isMobile()) {
        const intervalBtn = setInterval(() => {
          if ($('.product-images .buy-button-mobile--container')) {
            clearInterval(intervalBtn)
            const urlBtn = $('.product-images .buy-button-mobile--container').find('.buy-button-ref').attr('href')
            $fixedBarButton.find('.buy-button-ref').attr('href', urlBtn)
          }
        })
      } else {
        setTimeout(() => {
          const urlBtn = $productBuyBtn.find('.buy-button-ref').attr('href')
          $fixedBarButton.find('.buy-button-ref').attr('href', urlBtn)
          // console.log(urlBtn)
        }, 100)
      }
    })
    
    $skuColorInput.on('click', () => {
      if (this._isMobile()) {
        const intervalBtn = setInterval(() => {
          if ($('.product-images .buy-button-mobile--container')) {
            clearInterval(intervalBtn)
            const urlBtn = $('.product-images .buy-button-mobile--container').find('.buy-button-ref').attr('href')
            $fixedBarButton.find('.buy-button-ref').attr('href', urlBtn)
          }
        })
      } else {
        setTimeout(() => {
          const urlBtn = $productBuyBtn.find('.buy-button-ref').attr('href')
          $fixedBarButton.find('.buy-button-ref').attr('href', urlBtn)
          // console.log(urlBtn)
        }, 100)
      }
    })
  },

  _addCart (e, _this) {
    const {
      $skuColorItem,
      $skuSizeItem,
      $skuColorInput
    } = this.options
    // this._scrollToSkusNew()

    const $buttonSelect = $('.skuList.item-dimension-Tamanho button')
    const hrefBuyButton = _this.attr('href')
    if (hrefBuyButton.indexOf('/checkout') === 0) {
      e.preventDefault()
      const hrefBuyButton = _this.attr('href')
      if ($('ul.Tamanho:visible').length > 0 && $('ul.Tamanho li span.tamanho-unico').length === 0 && $buttonSelect.prop('title') === 'Selecione o Tamanho') {
        $skuSizeItem.addClass('sku-unchecked')
        // this._scrollToSkus()
      } else {
        APP.i.Minicart.addCart(hrefBuyButton, () => {
          APP.i.Minicart.openCart()
        })
      }
    } else {
      if ($skuColorInput.hasClass('checked')) {
        $skuColorItem.removeClass('sku-unchecked')
      } else {
        $skuColorItem.addClass('sku-unchecked')
        if ($(window).width() < 992) {
          this._scrollToSkus()
        } else {
          this._scrollToSkusNew()
        }
      }

      if ($('.input-dimension-Tamanho').find('select option:checked').length === 0) {
        $skuSizeItem.addClass('sku-unchecked')
        if ($(window).width() < 992) {
          this._scrollToSkus()
        } else {
          this._scrollToSkusNew()
        }
      } else {
        $skuSizeItem.removeClass('sku-unchecked')
      }
    }
  },

  _isMobile () {
    if ($(window).width() < 992) {
      return true
    }
  },

  refreshBar (imgBar, priceBar) {
    const {
      $fixedBarImg,
      $fixedBarPrice
    } = this.options


    $fixedBarImg.html(`<img src="${imgBar}" >`)
    $fixedBarPrice.html(priceBar)
    setTimeout(() => {
      const bestPrice = $('.price-best-price').find('strong').html()
      $('.price-best-price').html(bestPrice)

      const listPrice = $('.price-list-price').find('strong').html()
      $('.price-list-price').html('<span>antes</span> <strong>' + listPrice + '</strong>')

      if (listPrice && listPrice.length > 0) {
        $('.price-best-price').addClass('price-best-price--red')
      }
      $('.product-price').show()
    }, 100)
  },

  bind () {
    $('.notifyme-form .button-ancor').on('click', () => {
      this._scrollToTop()
      setTimeout(() => {
        $('#notifymeClientName').focus()
      }, 2000)
    })
  },

  _scrollToSkus () {
    $('html, body').animate({ scrollTop: $('.product-sku').offset().top - 100 }, '1000')
  },

  _scrollToSkusNew () {
    const aTag = $('.product-sku')
    $('html,body').animate({ scrollTop: aTag.offset().top }, 'slow')
  },

  _scrollToTop () {
    $('html, body').animate({ scrollTop: 0 }, '1000')
  }
})
