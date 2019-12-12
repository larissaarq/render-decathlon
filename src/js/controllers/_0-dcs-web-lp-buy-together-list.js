import '../../sass/landings/_0-dcs-web-lp-buy-together-list.scss'

APP.controller.LpBuyTogetherList = ClassAvanti.extend({
  init(options) {
    this.setup(options)
    this.start();
    //this.bind();
  },

  setup(options) {
    this.options = $.extend({
      helpers: APP.i.Helpers,
      sets: window.productsBuyTogether,
      templateProduct(name, img, listPrice, bestPrice, bestInstallment, ids) {
        
        let installmentValue = "";
        if(bestInstallment != undefined) installmentValue = APP.i.Helpers._formatMoney(bestInstallment.value / 100, 2, ',', '.', 'R$')

        return `
            <li class="product">
              <a class="product__image gaClick" href="/conjunto-ideal/produto/?${ids}" data-event-category="Conjunto Ideal" data-event-action="Link Imagem" data-event-label="Ver produto - Conjunto ${name}">
                <img src="/arquivos/${img}" alt="Conjunto Ideal - ${name}" />
                <h3 class="product__image-name">${name}</h3>
              </a>
              <div class="product__info">
                <div class="product__price">
                  <h4 class="product__price-list">antes <b>${listPrice}</b></h4>
                  <h4 class="product__price-best">${bestPrice}</h4>
                  ${installmentValue != "" ? `<h4 class="product__price-installments">Ou ${bestInstallment.count}x de ${installmentValue}</h4>` : `<h4 class="product__price-installments"></h4>`}
                </div>
              </div>
              <div class="product__cta">
                <a href="/conjunto-ideal/produto/?${ids}" class="button button--medium button--yellow gaClick" data-event-category="Conjunto Ideal" data-event-action="Botão" data-event-label="Ver produto - Conjunto ${name}">Ver o conjunto</a>
              </div>
            </li>
            `;
      },
    }, options)
  },

  start() {
    let _self = this;

    const {sets} = this.options;

    sets.map(item => this._getProducts(item.products, products => {
      let bestPriceSku = [];

      products.forEach(product => {
        _self.getSkus(item.products, product, skusFiltered => {
          bestPriceSku.push(skusFiltered);
        });
      });


      _self.postPrice(item, bestPriceSku)
    }));
  },

  _getProducts(products, callback) {
    let param = "";

    products.forEach(element => {
      param += 'fq=productId:' + element.id + '&';
    });

    $.ajax({
      url: '/api/catalog_system/pub/products/search/?' + param,
      type: 'GET',
      dataType: 'json',
      success: function (result) {
        callback(result);
      }
    });
  },

  getSkus(productPage, productResponse, callback) {
    let items = productResponse.items;
    
    let skus = productPage.find(product => product.id == productResponse.productId).skus;

    let skusFiltered = skus.map((sku) => {
      return items.find((item) => {
        if(sku == item.itemId){
          return item
        }
      })
    });

    skusFiltered = skusFiltered.filter((item) => {
      return item != undefined
    });
    
    callback(skusFiltered.sort(function (a, b) { return a.sellers[0].commertialOffer.Price - b.sellers[0].commertialOffer.Price;})[skusFiltered.length - 1]);
  },

  postPrice(products, skus) {
    const {
      helpers,
      templateProduct
    } = this.options;

    let productsIds = products;
    let listItems = [];

    skus.forEach(item => {
      listItems.push({
        "id": item.itemId,
        "quantity": 1,
        "seller": "1"
      })
    });

    let items = {
      "items": listItems,
      "country": "BRA"
    }

    $.ajax({
      url: '/api/checkout/pub/orderforms/simulation?sc=3',
      headers: {
        "Content-Type": "application/json"
      },
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(items),
      success: function (data) {
        let ids = ''
        productsIds.products.forEach(element => {
          ids += '&id=' + element.id;
        });

        ids = ids.replace("&", "")

        let discount = data.totals.find(item => item.id === "Discounts");
        discount = discount != undefined ? discount.value : 0;

        let best = data.totals.find(item => item.id === "Items").value;

        let list = helpers._formatMoney(((discount * -1) + best) / 100, 2, ',', '.', 'R$');

        let installments = [];

        data.paymentData.installmentOptions.forEach(function (option) {
          if (option.installments.length > 1) {
            installments = installments.concat(option.installments.filter(function (a, b) {
              return !a.interestRate
            }));
          }
        });

        let bestInstallment = installments.sort(function (a, b) {
          return a.count - b.count;
        })[installments.length - 1];

        let imagem;

        if(products.image){
          imagem = products.image
        } else {
          imagem = "panoplie-ski-masc-quadrado.png"
        }

        $('.section__products-list').prepend(templateProduct(products.name, imagem, list, helpers._formatMoney(best / 100, 2, ',', '.', 'R$'), bestInstallment, ids))
      },
      error: function (error) {
        console.error('Error on get product skus.')
        console.error(error)
      }
    });

  },
})