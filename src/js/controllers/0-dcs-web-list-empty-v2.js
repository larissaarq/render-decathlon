import '../../sass/pages/_0-dcs-web-list-empty-v2.scss'

APP.controller.ListEmptyV2 = ClassAvanti.extend({
  init(options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup(options) {
    if (typeof APP.i.Helpers === 'undefined') {
      throw new TypeError('You need Helpers Component installed.')
    }
    
    this.header = {
      'Accept': 'application/json',
      'REST-range': 'resources=0-5000',
      'Content-Type': 'application/json; charset=utf-8'
    }

    this.options = $.extend({
      helpers: APP.i.Helpers,

      $scope: null,

      $rates: $('.shelf-item__rate ul li'),
      classShelfItem: 'shelf-item',
      classShelfItemInitialized: 'shelf-item--initialized',
      classBestPrice: 'shelf-item__best-price',
      classBuyButton: 'shelf-item__buy-link',

      classBindClick: 'shelf-colors__link',
      classImage: 'shelf-item__image',

      imageWidth: '220',
      imageHeight: '220',
      attrScopeProductId: 'data-product-id',
      attrImage: 'data-image',
      fieldName: 'Cor',

      target($scope, content) {
        $scope.find('.shelf-item__colors').html(content)
      },

      templateSkuList(variables) {
        return `<ul class="shelf-colors__list${(variables.length < 4 ? ' shelf-colors-no-slick' : '')}">
                  ${variables.map(item => `
                    <li class="shelf-colors__item">
                      <a href="javascript:;" class="shelf-colors__link" data-image="${item.image}" data-color="${item.name}">
                        <img src="${item.image}" class="shelf-colors__image" title="${item.name}" alt="${item.name}" />
                      </a>
                    </li>
                  `).join('')}
                </ul>`
      },

      templateSkuItemDesk(variables) {
        return `<li>
          <div class="shelf-item" data-product-id="${variables.productId}" data-product-department="${variables.productNameDepartment}" data-product-category="${variables.productNameCategory}" data-product-brand="${variables.productBrand}" data-loader="loadShelf">
            <div class="shelf-item__img">
            <a href="${variables.productLink}" class="shelf-item__img-link" title="${variables.productName}">
              <div class="shelf-item__image">
                <img src="${variables.producNewImageLink}" alt="produto - ${variables.productName}" class="d-block img-fluid product-image" />
              </div>
            </a>
          </div>
          <div class="shelf-item__info">
            <div class="shelf-item__colors"></div>
            <a href="${variables.productLink}" class="shelf-item__brand">${variables.productBrand}</a>
            <h3 class="shelf-item__title">
              <a title="${variables.productName}" href="${variables.productLink}" class="shelf-item__title-link">${variables.productName}</a>
            </h3>
            <div class="shelf-item__rate">
              <div class="product-field product_field_28 product-field-type_7">
                <ul>
                  <li class="${variables.productRating}"><div class="rate-stars rate-stars--${variables.productRating}">${variables.productRating}</div></li>
                </ul>
              </div>
            </div>
            <a href="${variables.productLink}" class="shelf-item__buy-info">
              <div class="shelf-item__price">
                <div class="shelf-item__list-price">${variables.afterPrice}</div>
                ${variables.beforePrice}
              </div>${variables.contentInstallment}
            </a>
          </div>
          <input type="hidden" name="hidden-link" class="shelf-item__hidden-link" value="${variables.productLink}" />
          </li>`
      },

      templateSkuItemMobile(variables) {
        return `<li>
                  <div class="shelf-item" data-product-id="${variables.productId}" data-product-department="${variables.productNameDepartment}" data-product-category="${variables.productNameCategory}" data-product-brand="${variables.productBrand}" data-loader="loadShelf">
                    <div class="shelf-item__titles">
                      <a href="${variables.productLink}" class="shelf-item__brand">${variables.productBrand}</a>
                      <h3 class="shelf-item__title">
                        <a title="${variables.productName}" href="${variables.productLink}" class="shelf-item__title-link">${variables.productName}</a>
                      </h3>
                    </div>
                    <div class="shelf-item__content">
                      <div class="shelf-item__img">
                        <a href="${variables.productLink}" class="shelf-item__img-link" title="${variables.productName}">
                          <div class="shelf-item__image">
                              <img src="${variables.producNewImageLink}" alt="produto - ${variables.productName}" />
                          </div>
                        </a>
                      </div>
                      <div class="shelf-item__info">
                        <div class="shelf-item__rate">
                          <div class="product-field product_field_28 product-field-type_7">
                              <ul>
                                <li class="${variables.productRating}"><div class="rate-stars rate-stars--${variables.productRating}">${variables.productRating}</div></li>
                              </ul>
                            </div>
                        </div>
                        <div class="shelf-item__colors"></div>
                        <a href="${variables.productLink}" class="shelf-item__buy-info">
                          <div class="shelf-item__price">
                              <div class="shelf-item__list-price">${variables.afterPrice}</div>
                              ${variables.beforePrice}
                          </div>${variables.contentInstallment}
                        </a>
                      </div>
                    </div>
                </div>
                <input type="hidden" name="hidden-link" class="shelf-item__hidden-link" value="${variables.productLink}" />
          </li>`
      }
    }, options)
  },

  start() {
    this.getSearchTerm()
    this.searchEmptyFunction()
  },

  bind() {},

  getSearchTerm() {
    const queryString = window.location.search.substr(1)
    const params = queryString.split('&')

    const term = params.reduce((current, item) => {
      const [key, value] = item.split('=')
      let string = ''
      if (key === 'ft') {
        string = value
      }

      return current.concat(string)
    }, '')

    $('.empty-search__terms').text(decodeURIComponent(term))
  },

  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  },

  searchEmptyFunction() {
    const _self = this;
    let bar = _self.getParameterByName('ft');

    window.urlCollection =
      {
        "nike": [
          {
            id: "186/216",
            name: "Todos os tênis para corrida",
            btn_link_category: "/corrida/calcados/tenis?PS=20"
          },
          {
            id: "186/203",
            name: "Todas as roupas para corrida",
            btn_link_category: "/corrida/roupas"
          }
        ],
        "tenis nike": [
          {
            id: "186/216",
            name: "Todos os tênis para corrida",
            btn_link_category: "/corrida/calcados/tenis?PS=20"
          }
        ],
        "timberland": [
          {
            id: "761/821/822",
            name: "Todas as botas para trilha",
            btn_link_category: "/trilha-e-trekking/calcados"
          }
        ],
        "patinete eletrico": [
          {
            id: "488/489/490",
            name: "Todos os patinetes",
            btn_link_category: "/patinetes/equipamentos/patinetes?PS=20"
          }
        ],
        "chuteira nike": [
          {
            id: "327/329/330",
            name: "Todas as chuteiras",
            btn_link_category: "/futebol/calcados/chuteiras?PS=20"
          }
        ],
        "mochila nike": [
          {
            id: "761/778/781",
            name: "Todas as mochilas",
            btn_link_category: "/trilha-e-trekking/equipamentos/mochilas-e-bolsas-duffel-bag"
          }
        ],
        "salomon": [
          {
            id: "761/790/793",
            name: "Todas as jaquetas",
            btn_link_category: "/trilha-e-trekking/roupas/jaquetas"
          },
          {
            id: "761/821/822",
            name: "Todas as botas",
            btn_link_category: "/trilha-e-trekking/calcados"
          },
          {
            id: "761/821/823",
            name: "Todos os tênis",
            btn_link_category: "/trilha-e-trekking/calcados"
          },
        ],
        "skate eletrico": [
          {
            id: "622/623/624",
            name: "Todos os skates",
            btn_link_category: "/skateboards/equipamentos/skates?PS=20"
          }
        ],
        "tenda articulada": [
          {
            id: "761/778/785",
            name: "Todas as barracas",
            btn_link_category: "/camping/equipamentos/barracas-e-abrigos"
          }
        ]
      }

    if (urlCollection[bar] === undefined) {
      $('.empty-search__populars').show()
      return false
    }

    for (let I = 0; I < urlCollection[bar].length; I++) {
      _self.generateShelfItems(urlCollection[bar][I], I);
    };

    let count = 0;
    let qtyShelf = urlCollection[bar].length;
    let intervalShelfSlick = setInterval(function () {
      $('.list-empty-shelf .main-shelf > ul').each(function (index, element) {
        //console.log("index >>", index, "count >>", count, "qtyShelf >>", qtyShelf);
        if ($(this).find('li').length) {

          count++;

          if (count >= qtyShelf) {
            _self.slickShelfEmptyPage();
            clearInterval(intervalShelfSlick);
          }
        }

      });
    }, 1000);
  },

  generateShelfItems(itemSearch, numberShelf) {
    const _self = this;

    let shelfList = '';
    const {
      templateSkuItemDesk,
      templateSkuItemMobile,
      $rates,
      classShelfItem,
      classShelfItemInitialized,
      classBestPrice,
      classBuyButton,
      $scope
    } = this.options

    let prod;

    if (numberShelf == 0) {
      numberShelf = ''
    } else {
      numberShelf++;
    }
    let collection = itemSearch.id;
    $.ajax({
      url: '/api/catalog_system/pub/products/search?fq=C:/' + collection + '',
      type: 'GET',
      headers: this.header,
      success: function (resp) {
        let products = resp;

        for (var I in products) {
          prod = products[I];

          let productsAvaiable = [];
          let colorsPicked = [];

          if (prod.items !== undefined) {

            for (let O in products[I].items) {
              if (products[I].items[O].Cor != undefined) {
                if (colorsPicked.indexOf(products[I].items[O].Cor[0]) > -1) {
                } else {
                  colorsPicked.push(products[I].items[O].Cor[0]);
                  for (var C in products[I].items[O].sellers) {
                    if (products[I].items[O].sellers[C].commertialOffer != undefined) {

                      if (products[I].items[O].sellers[C].commertialOffer.AvailableQuantity >= 1) {

                        productsAvaiable.push({
                          id: O,
                          img: products[I].items[O].images[0].imageUrl,
                          link: products[I].link,
                          name: products[I].productName,
                          productId: products[I].productId
                        });
                      }
                    }
                  }
                }
              }
            }

            if (productsAvaiable.length) {

              let categsFiltered = prod.categories[0].split('/').filter(function (el) {
                return el != null && el != "";
              });

              /* let categoryNameLink = prod.categories[0];
              categoryNameLink = categoryNameLink.split('/');
              let categoryNameSlice = categoryNameLink.slice(-2); */

              let principalSku = productsAvaiable[0].id;

              let productImage = prod.items[principalSku].images[0].imageUrl;
              productImage = productImage.split('/');

              let producNewImageLink = productImage[0] + '//' + productImage[2] + '/' + productImage[3] + '/' + productImage[4] + '/' + productImage[5] + '-203-203/' + productImage[6];

              let bestPrice = prod.items[principalSku].sellers[0].commertialOffer.Price;
              let listPrice = prod.items[principalSku].sellers[0].commertialOffer.ListPrice;
              let installmentQuantity = prod.items[principalSku].sellers[0].commertialOffer.Installments;
              let installmentPrice = prod.items[principalSku].sellers[0].commertialOffer.Installments;
              let maxNumber = [];
              let minNumber = [];
              let installmentMax = 0;
              let installmentMinPrice = 0;
              let contentInstallment;
              let beforePrice;
              let afterPrice;
              if (installmentQuantity != 0) {
                for (let B in installmentQuantity) {
                  maxNumber[B] = installmentQuantity[B].NumberOfInstallments;
                }
                installmentMax = Math.max(...maxNumber)
              }
              if (installmentPrice != 0) {
                for (let B in installmentPrice) {
                  minNumber[B] = installmentPrice[B].Value;
                }
                installmentMinPrice = Math.min(...minNumber)
              }

              if (installmentMax == 0) {
                contentInstallment = `<div class="shelf-item__installments"></div>`;
              } else if (installmentMax == 1) {
                contentInstallment = `<div class="shelf-item__installments"></div>`;
              } else {
                contentInstallment = `<div class="shelf-item__installments">Até ${installmentMax} x de R$${installmentMinPrice}</div>`
              }

              if (bestPrice == 0 && listPrice == 0) {
                beforePrice = `<div class="product-item__no-stock">
                                            <div class="product-item__no-stock-title">Produto indisponível</div>
                                            <div class="product-item__no-stock-link">Avise-me quando chegar</div>
                                            <div class="shelf-item__best-price hide"><span class="shelf-item__signal-price">R$</span>${bestPrice}</div>
                                          </div>`;
              } else if (bestPrice != listPrice) {
                afterPrice = `antes <span class="shelf-item__featured">R$ ${listPrice} </span>`;
                beforePrice = `<div class="shelf-item__best-price"><span class="shelf-item__signal-price">R$</span> ${bestPrice}</div>`;
              } else {
                afterPrice = ``;
                beforePrice = `<div class="shelf-item__best-price shelf-item__best-price--featured"><span class="shelf-item__signal-price">R$</span> ${bestPrice}</div>`;
              }

              const fields = {
                productId: prod.productId,
                productName: prod.productTitle,
                productNameDepartment: categsFiltered[0],
                productNameCategory: categsFiltered[categsFiltered.length - 1],
                productBrand: prod.brand,
                productLink: prod.link,
                producNewImageLink: producNewImageLink,
                productRating: prod.Avaliações,
                afterPrice: afterPrice,
                beforePrice: beforePrice,
                contentInstallment: contentInstallment
              }
              if (APP.i.Helpers._isMobile()) {
                shelfList += templateSkuItemMobile(fields)
              } else {
                shelfList += templateSkuItemDesk(fields)
              }
            }
          }
        }

        _self.mountShelf(shelfList, itemSearch, numberShelf);
        $(`.${classShelfItem}`).not(`.${classShelfItemInitialized}`).Lazy({
          loadShelf(element) {
            const _this = $(element)

            if (_this.hasClass(classShelfItemInitialized)) {
              return false
            }

            _this.addClass(classShelfItemInitialized);

            APP.i.ShelfSku = new APP.component.ShelfSku({
              $rates, classShelfItem,
              classShelfItemInitialized,
              classBestPrice,
              classBuyButton,
              $scope: _this
            });
          }
        })
      },
      error: function (e) {
        console.log(e);
      }
    });
  },

  mountShelf(shelfList, itemSearch, numberShelf) {
    var _self = this;
    var bar = _self.getParameterByName('ft');

    var containerShelf = '';

    for (let i = 0; i < urlCollection[bar].length; i++) {
      const element = urlCollection[bar][i];
      if (element.id == itemSearch.id) {

        let shelfTitle = element.name;
        let linkBtnViewProducts = '<a href="' + element.btn_link_category + '" class="button button--medium button--blue">Ver os produtos</a>';
        if (!APP.i.Helpers._isMobile()) {
          containerShelf = `<div class="shelf__content list-empty-shelf__content">
              <div class="main-shelf list-empty-shelf" id="content-shelf-list-empty-${i}">
                <h2 id="title-shelf-${i}">${shelfTitle}</h2>
                <ul>
                  ${shelfList}
                </ul>
              </div>
              <div class="home-shelf__button" id="btn-shelf${i}">
              ${linkBtnViewProducts}
              </div>
            </div>`

        } else {
          containerShelf = `<div class="shelf__content list-empty-shelf__content">
              <div class="main-shelf mob-shelf list-empty-shelf" id="content-shelf-list-empty-${i}">
                <h2 id="title-shelf-${i}">${shelfTitle}</h2>
                <ul>
                  ${shelfList}
                </ul>
              </div>
              <div class="home-shelf__button" id="btn-shelf${i}">
              ${linkBtnViewProducts}
              </div>
            </div>`
        }
      }
    };

    $(`#container-shelf-list-empty`).prepend(containerShelf);
  },
  
  slickShelfEmptyPage() {
    const intervalBanner = setTimeout(() => {
      if ($('.list-empty-shelf .main-shelf').find('.slick-slider.slick-initialized')) {
        clearInterval(intervalBanner)
        $('.list-empty-shelf .main-shelf').addClass('slick-started')
      }
    }, 100)

    APP.i.general._registerSlickIntervalBind(() => {
      $('.list-empty-shelf .main-shelf').find(`ul`).slick(slickOptions)
    })

    const slickOptions = {
      dots: true,
      infinite: false,
      speed: 300,
      slidesToShow: 4,
      slidesToScroll: 4,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: true,
            dots: true
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2,
            arrows: false
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false
          }
        }
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
      ]
    }

    $('.list-empty-shelf .main-shelf > ul').slick(slickOptions);
    APP.i.EnhancedEcommerce.onAccessLandingPage()
  }
})