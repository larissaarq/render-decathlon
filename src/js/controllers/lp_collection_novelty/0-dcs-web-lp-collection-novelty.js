APP.controller.LpCollectionNovelty = ClassAvanti.extend({
  init(options) {
    this.setup(options);
    this.start();
    this.bind();
  },

  setup(options) {
    this.options = $.extend({
      helpers: APP.i.Helpers,
      allPageSets: window.productsBuyTogether,
      skusToPrice: [],
      allSkusFiltereds: [],
      readySimilars: 0,
      image(url, alt) {
        $(".section__images-slider").html(
          `<img src="/arquivos/${url}" alt="${alt}">`
        );
        $(".section__images-cta").show();
      },
      title(content) {
        $(".section__intro").html(`<h2>${content}:</h2>`);
      }
    }, options);
  },

  start() {
    if (window.innerWidth < 768) {
      this.navbarFixedScroll();
    }
    this.softScrollnav();
    this.accordionShelfs();
    this.addIdShelfTitle();
    
    const { allSkusFiltereds } = this.options;
    
    const productId = window.productId;

    this.getProduct(`fq=productId:${productId}`, products => {
      products.forEach(product => {
        if (
          product.items.some(
            item => item.sellers[0].commertialOffer.AvailableQuantity > 0
          )
        ) {
          allSkusFiltereds.push({
            id: product.productId,
            skus: product.items
          });

          this.mountProducts(product);
        }
      });
    });
  },

  accordionShelfs() {
    $('.shelf-collection-novelty').each((index, element) => {
      const $list = $(element).find('.shelf-collection-novelty > ul');
      const $items = $(element).find('.shelf-collection-novelty > ul > li');
      const $buttonShowMore = `
        <a class="button button--medium button--blue button_show-more" href="#" data-event-category="" data-event-action="" data-event-label="">
          Ver Mais
        </a>
      `
      if($items.length > 4) {
        $list.parent().addClass('show-more');
        $list.parent().append($buttonShowMore);
      }

    })
    $('.button_show-more').on('click', (element) => {
      element.preventDefault();
      $(element.currentTarget).parent().removeClass('show-more');
    })
  },
  
  softScrollnav(){
    $('.navbar-item a[href^="#"]').on('click', function(e) {
      e.preventDefault();
      var id = $(this).attr('href'),
          targetOffset = $(id).offset().top;
          
      $('html, body').animate({ 
        scrollTop: targetOffset - 130
      }, 500);
    });
  },

  addIdShelfTitle() {
    const { helpers } = this.options;
    let titles = $(
      ".shelf-carousel .shelf__content .shelf-collection-novelty h2"
    );
    titles.each(function(index, title) {
      let id = title.innerHTML;
      const textId = helpers._rewrite(id).replace("-", "");
      $(title).attr("id", textId);
    });
  },

  navbarFixedScroll() {
    const navFixed = $(".banner__navbar-fixed");
    $(window).scroll(function() {
      $(this).scrollTop() > 400 ? navFixed.addClass("fadeIn") : navFixed.removeClass("fadeIn");
    });
  },

  getProduct(ids, callback) {
    $.ajax({
      url: `/api/catalog_system/pub/products/search/?${ids}`,
      type: "GET",
      dataType: "json",
      success: response => {
        callback(response);
      },
      error: error => {
        alert("Não foi possível buscar os produtos");
        console.error("Não foi possível buscar os produtos", error);
      }
    });
  },

  mountProducts(product) {
    const { helpers } = this.options;

    const currentSkus = this.getCurrentSkus(product.productId);
    const skuColors = this.filterSkuColors(currentSkus);
    const skuDetails = this.findMainSkuByPrice(currentSkus);
    const installment = this.findBestInstallmentFromSku(skuDetails);

    $(".main-product").append(`
        <div class="banner__content" data-id="${skuDetails.itemId}">
            <h1 class="product-name">${product.productName}</h1>

            <div class="product__variations" data-id="${product.productId}">
              <div class="product__variations-color" data-color="${
                skuDetails["Cor"][0]
              }">
                <!--label>Selecione a Cor</label-->
                <ul class="shelf-colors__list">
                  ${skuColors
                    .map(
                      color =>
                        `<li class="shelf-colors__item" data-color="${
                          color["Cor"][0]
                        }">
                      <a href="#" class="shelf-colors__link" data-image="${
                        color.images[0].imageUrl
                      }" data-color="${product.productName}">
                        <img src="${
                          color.images[0].imageUrl
                        }" class="shelf-colors__image" title="${
                          color["Cor"][0]
                        }" alt="${product.productName} - ${color["Cor"][0]}" />
                      </a>
                    </li>`
                    )
                    .join("")}
                </ul>
              </div>
              <div class="product__variations-size">
                <!--label>Selecione o tamanho</label-->
                <select style="display: none" class="custom-select--small"></select>
              </div>
            </div>

            <!-- START: ADD TO CART -->
            <div class="to__cart">
              <div class="shelf-item__price">
                ${
                  skuDetails.sellers[0].commertialOffer.Price > 0
                    ? `<h4 class="shelf-item__best-price shelf-item__best-price--featured">${helpers._formatMoney(
                        skuDetails.sellers[0].commertialOffer.Price,
                        2,
                        ",",
                        ".",
                        "R$"
                      )}</h4>`
                    : `<h4 class="shelf-item__best-price--unavailable">Sem estoque no site</h4>`
                }
                
                ${
                  installment
                    ? `<h4 class="shelf-item__installments">Ou ${
                        installment.NumberOfInstallments
                      }x de ${helpers._formatMoney(
                        installment.Value,
                        2,
                        ",",
                        ".",
                        "R$"
                      )}</h4>`
                    : `<h4 class="shelf-item__installments"></h4>`
                }
              </div>

                <a class="to__cart_buy-button button ${window.innerWidth > 767 ? `button--medium` :  `button--small` } button--yellow gaClick" href="#" data-event-category="" data-event-action="" data-event-label="">
                  Adicionar ao carrinho
                </a>
            </div>
            <!-- END: ADD TO CART -->

        </div>

        <div class="banner__image">
         <a href="${product.link}"> 
          <img src="${skuDetails.images[0].imageUrl}" title="${
      product.productName
    }" alt="${product.productName}" />
          </a>
        </div>
      `);

    this.selectCurrentColor(product.productId);
  },

  getCurrentSkus(id) {
    const { allSkusFiltereds } = this.options;

    let skus = allSkusFiltereds.find(item => item.id == id).skus;

    return skus;
  },

  findMainSkuByPrice(skus) {
    const { skusToPrice } = this.options;

    const sku = skus.sort((a, b) => {
      return (
        a.sellers[0].commertialOffer.Price - b.sellers[0].commertialOffer.Price
      );
    })[skus.length - 1];

    skusToPrice.push(sku.itemId);

    return sku;
  },

  findBestInstallmentFromSku(sku) {
    let installments = [];

    sku.sellers[0].commertialOffer.Installments.forEach(options => {
      if (options.NumberOfInstallments > 1 && options.InterestRate <= 0) {
        installments.push(options);
      }
    });

    return installments.length
      ? installments.sort((a, b) => a.count - b.count)[installments.length - 1]
      : 0;
  },

  filterSkuColors(skus) {
    const unique = skus.reduce((accumulator, current) => {
      const field = accumulator.find(
        item => item["Cor"][0] === current["Cor"][0]
      );

      if (!field) {
        return accumulator.concat([current]);
      } else {
        return accumulator;
      }
    }, []);

    return unique;
  },

  selectCurrentColor(id) {
    const _self = this;

    $(`[data-id=${id}] .shelf-colors__item`).each((index, element) => {
      const mainColor = $(element)
        .parents(".product__variations-color")
        .attr("data-color");
      const color = $(element).attr("data-color");

      if (color == mainColor) {
        $(element).addClass("selected");

        _self.mountSizesOptions($(element), color, false);
      }
    });
  },

  mountSizesOptions($scope, color, refresh) {
    const { helpers } = this.options;

    const $select = $scope
      .parents(".product__variations")
      .find(".product__variations-size select");
    const productId = $scope.parents(".product__variations").attr("data-id");

    $select.find("option").remove();
    $select.append("<option disabled selected>Selecione o tamanho</option>");

    const sizes = this.getCurrentSkus(productId).filter(
      sku => sku["Cor"][0] == color
    );

    $select.append(`
        ${sizes
          .map(
            size =>
              `<option
            value="${helpers._rewrite(size["Tamanho"][0])}" 
            id="${helpers._rewrite(size["Tamanho"][0])}"
            ${
              size.sellers[0].commertialOffer.AvailableQuantity == 0
                ? `class="item-unavailable" disabled`
                : ``
            } 
          >
            ${size["Tamanho"][0]}
          </option>`
          )
          .join("")}		
      `);

    if (!refresh) {
      $select.selectpicker();
      $select.fadeIn();
    } else {
      $select.selectpicker("refresh");
      $select.selectpicker("val", "");
      $select
        .parents(".bootstrap-select")
        .find(".filter-option-inner-inner")
        .html("Selecione o tamanho");
    }
  },

  bind() {
    this.changeColor();
    this.getSkusSelecteds();
    this.selectRemoveErrors();
  },

  changeColor() {
    $("body").on("click", ".shelf-colors__item", element => {
      element.preventDefault();

      $(element.currentTarget)
        .siblings()
        .removeClass("selected");
      $(element.currentTarget).addClass("selected");
      $(element.currentTarget)
        .parents(".product")
        .find(".product__image img")
        .attr("src", element.target.src);

      this.mountSizesOptions(
        $(element.currentTarget),
        $(element.currentTarget).attr("data-color"),
        true
      );
    });
  },

  selectShowErrors() {
    $(".product__variations-size").addClass("error");

    if (!$(".label--error").length) {
      $(".product__variations-size.error").append(
        `<label class="label--error">Selecione o tamanho</label>`
      );
      $(".label--error").fadeIn();
    }

    if (window.innerWidth <= 768) {
      $("html, body").animate(
        {
          scrollTop:
            $(".label--error:eq(0)").offset().top -
            (window.innerHeight / 2 + $(".header").height() / 2)
        },
        1000
      );
    }
  },

  selectRemoveErrors() {
    $("body").on("change", ".product__variations-size select", element => {
      element.preventDefault();

      $(element.currentTarget)
        .parents(".product__variations-size")
        .find(".label--error")
        .fadeOut()
        .remove();
      $(element.currentTarget)
        .parents(".product__variations-size")
        .removeClass("error");
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

      console.log(size, color, allSkuSelecteds);
      this.addToCart(allSkuSelecteds);
    });
  },

  addToCart(skus) {
    if (
      !skus.length ||
      $("body").find(".product__variations .error").length > 0
    )
      return;

    let ids = "";
    let qtds = "";
    let sellers = "";

    for (let index = 0; index < skus.length; index++) {
      const element = skus[index];
      ids += `sku=${element.itemId}&`;
      qtds += `qty=1&`;
      sellers += `seller=1&`;
    }

    let hrefBuyButton = `/checkout/cart/add?${ids}${qtds}${sellers}redirect=true&sc=3`;

    APP.i.Minicart.addCart(hrefBuyButton, () => {
      APP.i.Minicart.openCart();
    });
  }
});
