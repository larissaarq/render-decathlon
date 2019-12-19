APP.component.ShelfSku = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start();
    this.bind();
  },
  
  setup (options) {
    if (typeof APP.i.Helpers === 'undefined') {
      throw new TypeError('You need Helpers Component installed.')
    }

    this.options = $.extend({
      helpers: APP.i.Helpers,

      $scope: null,
      type: null,

      classBindClick: 'shelf-colors__link',
      classImage: 'shelf-item__image',

      imageWidth: '220',
      imageHeight: '220',
      attrScopeProductId: 'data-product-id',
      attrImage: 'data-image',
      fieldName: 'Cor',

      targetColor ($scope, content) {
        $scope.find('.shelf-item__colors').html(content)
      },

      targetSize ($scope, content) {
        $scope.find('.shelf-item__colors').after(content)
      },
      templateSizeSelect (variables) {
        return `<div class="shelf-item__size">
                  <select>
                    <option disabled selected>Selecione o tamanho</option>
                    ${variables.map(item => `
                      <option class="shelf-size__item">${item}</option>
                    `).join('')}
                    </select>
                </div>
        `
      },
      templateSkuList (variables) {
        return `<ul class="shelf-colors__list${(variables.length < 4 ? ' shelf-colors-no-slick' : '')}">
                  ${variables.map(item => `
                    <li class="shelf-colors__item">
                      <a href="javascript:;" class="shelf-colors__link" data-image="${item.image}" data-color="${item.name}">
                        <img src="${item.image}" class="shelf-colors__image" title="${item.name}" alt="${item.name}" />
                      </a>
                    </li>
                  `).join('')}
                </ul>`
      }
    }, options)
  },

  start () {
    this.getProduct(product => {
      const { fieldName, $scope, type } = this.options

      if ($.isEmptyObject(product.dimensionsMap)) {
        return false
      }

      if (type === "selectSize") {
        window.productRecomendation.push(product);
      }
      
      const colorOptions = product.dimensionsMap[fieldName]
      const sizeOptions = (this._getSkuSizes($scope, product)).map(sku => sku.dimensions["Tamanho"])
      
      if (typeof colorOptions === 'undefined') {
        return false
      }

      if ((colorOptions.length <= 1 && type !== "selectSize") || product.available === false) {
        return false
      }

      const fields = colorOptions.map(option => this._getSkuColors(option, product.skus))

      this.createOptions(fields, sizeOptions, product)
    })
  },

  bind () {
    const { type } = this.options

    if (type == 'selectSize') {
      this.shelfAddToCart();
    }

    this.selectRemoveErrors();
  },

  shelfAddToCart(){
    $("body").on("click", ".shelf-item__buy-button", element => {
      element.preventDefault();
      
      const $scope = $(element.currentTarget).parents(".shelf-item");

      const size = $scope.find(".shelf-item__size select").val();
      const color = $scope.find(".shelf-colors__link").attr("data-color");

      const productId = $(element.currentTarget).attr("data-id");
      if (size == null) {
        this.selectShowErrors($scope);
        return;
      };

      const product = window.productRecomendation.find(item => item.productId == productId);
      const skuFiltered = product.skus.filter(sku => sku.dimensions["Cor"] === color).filter(sku => sku.dimensions["Tamanho"] === size);
     
      if(!window.toCart.length) {
        window.toCart.push(skuFiltered[0]);
        console.log(skuFiltered[0])

        APP.i.Minicart.addCart("/checkout/cart/add?sku="+ skuFiltered[0].sku +"&qty=1&seller=1&redirect=true&sc=3", () => {
          APP.i.flash_msg = new APP.component.FlashMsg()
          APP.i.flash_msg.showMsg('Seu produto foi adicionado ao carrinho!', 'success')
          window.toCart = [];
        });
      }
    });
  },

  selectShowErrors ($scope) {
    $scope.find(".shelf-item__size").addClass("error");

    if (!$scope.find(".label--error").length) {
      $scope.find(".shelf-item__size.error").append("<label class=\"label--error\">Selecione o tamanho</label>");
      $scope.find(".label--error").fadeIn();
    }
  },

  selectRemoveErrors () {
    const { $scope } = this.options

    $("body").on("change", ".shelf-item__size select", function (element) {
      element.preventDefault();
      $scope.find(".label--error").fadeOut().remove();
      $scope.removeClass("error");
    });
  },

  getSkusSelecteds() {
    const { allSkusFiltereds } = this.options;

    $("body").on("click", ".to__cart_buy-button", element => {
      element.preventDefault();
      let allSkuSelecteds = [];

      const size = $(".product__variations .filter-option-inner-inner").text();
      const color = $(".product__variations .shelf-colors__item.selected").attr(
        "data-color"
      );

      if (size == "Selecione o tamanho") {
        this.selectShowErrors();
        allSkuSelecteds = [];
        return;
      }

      let skuSelected = [];

      const currentProductId = $(".product__variations").attr("data-id");

      skuSelected = allSkusFiltereds
        .find(item => item.id == currentProductId)
        .skus.filter(sku => sku["Cor"][0] == color);
      skuSelected = skuSelected.find(sku => sku["Tamanho"][0] == size);

      if (skuSelected) {
        allSkuSelecteds.push(skuSelected);
      }

      this.addToCart(allSkuSelecteds);
    });
  },

  _getSkuSizes ($scope, product) {
    const imgShelf = this._formatUrl($scope.find(".shelf-item__image img").attr('src'));
    const color = product.skus.find(sku => this._formatUrl(sku.image) === imgShelf).dimensions["Cor"];
    return product.skus.filter(sku => sku.dimensions["Cor"] === color);
  },

  _formatUrl (url) {
    return url.replace("-150-150", "").replace("-220-220", "").replace("-500-500", "").split("?v=")[0]
  },

  getProduct (callback) {
    const {
      $scope,
      attrScopeProductId
    } = this.options

    const productId = $scope.attr(attrScopeProductId)

    vtexjs.catalog.getProductWithVariations(productId)
      .then(response => {
        if (typeof callback === 'function') {
          callback(response)
        }
      }, error => {
        console.error('Error on get product skus.')
        console.log(error)
      })
  },

  _getSkuColors (option, skus) {
    const { fieldName } = this.options

    const fields = skus.reduce((accumulator, currentValue) => {
      const field = currentValue.dimensions[fieldName]

      if (typeof field === 'undefined') {
        return accumulator
      }

      const fieldLower = field.toLowerCase()
      if (currentValue.dimensions[fieldName] === option && accumulator.name !== fieldLower) {
        accumulator = {
          name: fieldLower,
          image: currentValue.image,
          url: currentValue.url
        }
      }

      return accumulator
    }, {})

    return fields
  },

  createOptions (colorOptions, sizeOptions, product) {
    const {
      $scope,
      templateSkuList,
      templateSizeSelect,
      targetColor,
      targetSize,
      type
    } = this.options

    targetColor($scope, templateSkuList(colorOptions))
    if(type === "selectSize") targetSize($scope, templateSizeSelect(sizeOptions)), this.buyButton($scope, product), this.selectCurrentColor($scope, product);
    
    this.bindClickList()
    this.startSlickThumbs($scope)
  },

  selectCurrentColor ($scope) {
    const imgShelf = this._formatUrl($scope.find(".shelf-item__image img").attr('src'));

    $scope.find(".shelf-colors__image").each((index, item) => {
      if(this._formatUrl($(item).attr('src')) === imgShelf){
        $(item).parent().addClass("selected");
      }
    })
  },

  buyButton($scope, product) {
    $scope.find(".shelf-item__info").append(`
      <a class="shelf-item__buy-button button-circle button-circle--yellow gaClick" data-id="${product.productId}" data-event-category="Pop-up PDP" data-event-action="Click - Add To Cart" data-event-label="${product.productId} - ${product.productName}"><i class="dkti-cart"></i></a>
    `)
  },

  bindClickList () {
    const {
      helpers,
      $scope,
      attrImage,
      classBindClick,
      classImage,
      imageWidth,
      imageHeight
    } = this.options

    const _self = this;

    $(window.document).on('click', `.${classBindClick}`, event => {
      event.preventDefault()
      const _this = $(event.currentTarget)
      const image = _this.attr(attrImage)
      const imageShelf = helpers._changeImageSize(image, imageWidth, imageHeight)
      const colorSkuName = _this.data('color')
      const linkSku = `${_this.closest($scope).find('.shelf-item__hidden-link').val()}?aSku=Cor:${colorSkuName}`

      _this.closest($scope).find('a').not('.shelf-colors__link').each((i, e) => {
        const _this = $(e)
        _this.attr('href', linkSku)
      })

      _this.closest($scope).find(`.${classImage} img`).attr('src', imageShelf);

      if (type === "selectSize") {
        _self.refreshSelect(_this, colorSkuName)
      }
    })
  },

  refreshSelect($scopeLink, color) {
    const {
      targetSize,
      templateSizeSelect
    } = this.options

    const $scope = $scopeLink.parents(".shelf-item");

    const product = window.productRecomendation.find(item => item.productId == $scope.find(".shelf-item__buy-button").attr("data-id"));

    const sizeOptions = product.skus.filter(sku => sku.dimensions["Cor"] === color).map(sku => sku.dimensions["Tamanho"]);

    $scope.find('.shelf-colors__link').removeClass('selected');
    $scopeLink.addClass('selected');

    $scope.find('.shelf-item__size').remove();

    targetSize($scope, templateSizeSelect(sizeOptions))
  },

  startSlickThumbs ($scope) {
    let slidesToShow = 2,
        slidesToScroll = 2

    if ($scope.closest('.mob-shelf').length) {
      slidesToShow = 3
      slidesToScroll = 3
    }

    const slickOptions = {
      autoplay: false,
      dots: false,
      arrows: true,
      slidesToShow: 3,
      slidesToScroll: 3,
      responsive: [
        {
          breakpoint: 992,
          settings: {
            slidesToShow,
            slidesToScroll
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow,
            slidesToScroll
          }
        }
      ]
    }

    $scope.find('.shelf-colors__list').slick(slickOptions)
  }


})
