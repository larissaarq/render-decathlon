import '../../sass/pages/_0-dcs-web-product.scss'

APP.controller.Produto = ClassAvanti.extend({
  init() {
    console.log(window.checkoutCrossSelling)
    this.setup();
    this.start();
    this.bind();
  },

  setup() {
    if (typeof APP.i.Helpers === "undefined") {
      throw new TypeError("You need Helpers Component installed.");
    }
    this.options = {
      $video: $(".product-details .product-details-video ul li"),
      $slickThumbs: $(".product-images .thumbs"),
      $slickShelf: $(".slick-default .main-shelf > ul"),
      $skuContainer: $(".sku-selector-container"),
      $skuColor: $(".topic.Cor"),
      $skuColorItem: $(".item-dimension-Cor"),
      $skuColorInput: $(".input-dimension-Cor"),
      $skuSize: $(".topic.Tamanho"),
      $skuSizeItem: $(".item-dimension-Tamanho"),
      $listPrice: $(".price-list-price"),
      $bestPrice: $(".price-best-price"),
      $modalPayments: $(".av-modal--payment .av-modal__content"),
      // $currentSku: skuJson.skus[0].sku,
      $currentSku:
        $("#calculoFrete").length === 0
          ? skuJson.skus[0].sku
          : $("#calculoFrete").attr("skucorrente"),
      $skuList: [],
      $productId: skuJson.productId,
      $salesChannel: skuJson.salesChannel,
      $buyButton: $(".product-buy .buy-button"),
      $accordionItem: $(".accordion-item"),
      $productPrice: $(".product-price"),
      $flagOffer: "Oferta",

      $buttonBuy: $('.buy-button.buy-button-ref'),
      $btnBuy: $('.buy-button-ref'),
      $elBuyFixed: $('.product-fixed-bar .product-fixed--btn'),

      currentSkuName: "",
      productDetails:
        "beneficiosDoProduto,informacoesTecnicas,conceitoTecnologia,Video",
      skuColorClass: "color-image",
      skuColorClassSelected: "color-image--picked",
      skuColorInputClass: "input-dimension-Cor",
      helpers: APP.i.Helpers,
      nameSku: $(".productName").text(),
      currentImage: $("#image-main").attr("src"),
      productVideo: null,
      productReview: null,
      lastPrice: null,
      loadReviews: false,
      loadBlog: false,
      firstMini: null,
      initFirstProduct: false,
      classShelfItem: "shelf-item",
      classShelfItemInitialized: "shelf-item--initialized",
      $cloneShelfElm: "",
      $recomendationProducts: $("#recomendation-products")
    };

    this.departament = vtxctx.departmentName;
    this.departamentSlug = this.departament.replace(/\s+/g, "-").toLowerCase();

    this.productCode = null;

    APP.i.ProductColorThumbs = new APP.component.ProductColorThumbs();
    APP.i.FilterPriceRange = new APP.component.FilterPriceRange();
    APP.i.FixedBuyBar = new APP.component.FixedBuyBar();

    // $('.product-images').append('<div class="share-content"></div>');
  },

  start() {
    this.unavailableBuyButton();
    this.duplicateProductName();
    this.insertDepartamentNameTips();
    this.productDetails();
    this.startSlick();
    this._isMobile();
    this.firstSelectSku(this.options.$currentSku);
    this.showFlagOffer(this.options.$currentSku);
    this.setBrandLogo();
    this.newPageSizeGuide();
    this.insertTextShare();
    this.selectSkuByUrl();
    this.skuTamanhoUnico();
    //   this.setSizeZoom()
    //   this.getSpecifications();


    APP.i.EnhancedEcommerce.onAccessProductPage();

    // const DecathlonSkuDataReceived = new Vtex.JSEvents.Listener('skuDataReceivedEventName', function(e){console.log('skuDataReceived', e)});
    // skuEventDispatcher.addListener(skuDataReceivedEventName, DecathlonSkuDataReceived);

    $(".dicas-blog-produto").hide();
  },

  unavailableBuyButton() {
    if (!skuJson.skus.filter(sku => sku.available).length) {
      $('.product-buy a.buy-button, .product-fixed--btn .sku-notifyme > form > fieldset > p').hide();
    }
  },

  bind() {
    const _this = this;

    // Adiciona listener no evento skuSelectionChanged
    const AvantiskuDataFetcherListener = new Vtex.JSEvents.Listener(
      "skuDataFetcher",
      _this.AvantiOnSkuSelectionChanged
    );
    skuEventDispatcher.addListener(
      skuSelectionChangedEventName,
      AvantiskuDataFetcherListener
    );

    this._bindThumbVideo();
    this._bindShipping();
    this._bindChangeSku();
    this._bindOpenPaymentModal();
    this._bindOpenCondicoesModal();
    this._bindBuyButton();
    this._bindDescriptionShowMore();
    this._bindClickAvaliationAncor();
    this._bindScrollGetApis();
    this._bindHiddenRecomendation();
    // this._bindTabPrice()

    $("#boxPriceStock li").on("click", "a", function (e) {
      const el = $(e.currentTarget);

      _this._bindTabPrice(el);

      e.preventDefault();
    });
  },

  AvantiOnSkuSelectionChanged: function (e) {
    const _self = APP.i.currentController;
    // console.log('AvantiOnSkuSelectionChanged', e)

    /**
     * Get product information only when the sku is different
     */
    if (e.newSkuId !== APP.i.currentController.currentSku) {
      _self.getRefCode(e.newSkuId);
      _self.showFlagOffer(e.newSkuId);
    }

    APP.i.currentController.currentSku = e.newSkuId;
    APP.i.currentController.currentSkuAvailable = false;
    APP.i.currentController.currentSkuAvailableQuantity = 0;

    // // Informações do sku ativo
    for (i = 0; i < skuJson.skus.length; i++) {
      if (skuJson.skus[i].sku == APP.i.currentController.currentSku) {
        APP.i.currentController.currentSkuAvailable = skuJson.skus[i].available;
        APP.i.currentController.currentSkuAvailableQuantity =
          skuJson.skus[i].availablequantity;
      }
    }
  },

  _bindTabPrice($el) {
    const selectedLink = $el.attr("href").replace("#", "");

    $("#boxPriceStock")
      .find("li, .tab-pane")
      .removeClass("active");

    $el.parent().addClass("active");
    $(`#boxPriceStock .tab-pane[id="${selectedLink}"]`).addClass("active");
  },

  startSlick() {
    this.slickShelf();
  },

  firstSelectSku: function (skuId) {
    const {
      $skuSize,
      $slickThumbs,
      skuColorClassSelected,
      $buttonBuy
    } = this.options;
    const _self = this;

    const item = skuJson.skus.filter(sku => sku.sku == skuId);

    this.skuColor = item[0].dimensions.Cor;
    this.skuSize = item[0].dimensions.Tamanho;

    // selected class SKU
    const $labelCor = $(
      ".input-dimension-Cor[value=" + `${this.skuColor}` + "] + label"
    );
    $labelCor.click();
    $labelCor.addClass(skuColorClassSelected);
    $(".product-sku .Cor .specification").html("Cor: " + this.skuColor);

    const intervalSlick = setInterval(function () {
      if ($slickThumbs.find("li").length > 0) {
        _self.slickThumbs();

        _self.options.firstMini = $(".product-images .thumbs li")
          .eq(0)
          .find("img")
          .attr("src");
        clearInterval(intervalSlick);
      }
    }, 100);

    $(".item-dimension-Tamanho select").selectpicker("val", "");
    $skuSize.append(
      '<li class="product-sizes"><a href="/guia-de-tamanhos" class="product-sizes--link"><i></i>Não sabe seu tamanho?</a></li>'
    );

    // $buttonBuy.attr('href', 'javascript:alert("Por favor, selecione o modelo desejado.");')

    this._bindPriceText();
    this.getRefCode(skuId);
    this.sizeItemsUnavaliable();
    this._bindNotifyMe();
  },

  // Hide select size when option is UNICO
  skuTamanhoUnico: function () {
    const { $skuSizeItem } = this.options;
    if (skuJson.dimensionsMap.Tamanho != null) {
      if (skuJson.dimensionsMap.Tamanho.length == 1) {
        if (
          skuJson.dimensionsMap.Tamanho[0] == "UNICO" ||
          skuJson.dimensionsMap.Tamanho[0] == "ÚNICO"
        ) {
          const tamanhoUnico = $(
            '<span id="unique-size" class="tamanho-unico">: ÚNICO</span>'
          );
          $(".product-sku .Tamanho .item-dimension-Tamanho").hide();
          tamanhoUnico.appendTo($(".product-sku .Tamanho .specification"));

          // const $sizeSelect = $skuSizeItem.find('select')
          // const textSize = $sizeSelect.eq(0).text();
          // $sizeSelect.selectpicker('val', textSize);
          $(".product-sizes").remove();
        } else {
        }
      }
    }
  },

  insertDepartamentNameTips() {
    $(".section-sportive-tips .section-title").append(
      `<h2 class="section-title__text opened">Dicas de ${this.departament}</h2>`
    );
  },

  duplicateProductName() {
    const $name = $(".productName");
    const title = this.removeSkuName(
      $name
        .first()
        .text()
        .trim()
    );
    const html = `<div class="product-name__title">${title}</div>`;

    $name.after(html);
  },

  getRefCode(id) {
    const _self = this;

    const skuId = id;

    $.ajax({
      type: "get",
      url: `https://skubyid--decathlonstore.myvtex.com/_v/product/sku/${skuId}`,
      dataType: "json"
    }).then((response) => {
      if (response.data == null || response.data == undefined) {
        return;
      }

      const data = response.data;

      data.ProductSpecifications.map(el => {
        if (el.FieldId === 28) {
          _self.options.productReview = el.FieldValues;
        }

        if (el.FieldId === 37) {
          _self.productVideo = el.FieldValues;
        }

        if (el.FieldId === 41) {
          _self.options.lastPrice = el.FieldValues;
        }
      });

      /*------- Flags Spscifications -------*/
      if (!$(".flag-offer").hasClass("visible")) {
        //Lista de prioridades das flags
        let idSpec = [55, 56, 54, 57, 58],
          spec = data.ProductSpecifications,
          $fieldName = "";

        for (let f = 0; f < idSpec.length; f++) {
          for (let i = 0; i < data.ProductSpecifications.length; i++) {
            if ($fieldName == "") {
              if (spec[i].FieldId == idSpec[f]) {
                let typeFlag = spec[i].FieldValues[0],
                  dateFlag = "",
                  dataToday = "",
                  daysDates = "",
                  dataTodayNum = "",
                  dateFlagNum = "";

                if (spec[i].FieldId == 55) {
                  dataToday = new Date();
                  let day = dataToday.getDate().toString(),
                    month = dataToday.getMonth() + 1,
                    year = dataToday.getFullYear().toString();

                  dateFlag = typeFlag
                    .split("/")
                    .reverse()
                    .join("-");
                  dataToday = `${year}-${month}-${day}`;
                  daysDates =
                    (Date.parse(dataToday) - Date.parse(dateFlag)) /
                    (24 * 60 * 60 * 1000);

                  dataTodayNum = parseInt(
                    dataToday.toString().replace(/\-/g, "")
                  );
                  dateFlagNum = parseInt(
                    dateFlag.toString().replace(/\-/g, "")
                  );
                }

                if (
                  typeFlag == "true" ||
                  (dataTodayNum > dateFlagNum && daysDates <= 30)
                ) {
                  $fieldName = spec[i].FieldName;
                  implementedFlag();
                  break;
                } else if (spec[i].FieldName == "Garantia") {
                  $fieldName = typeFlag + ' de garantia';
                  implementedFlag();
                  break;
                }
              }
            }

            function implementedFlag() {
              $(".flag-offer")
                .empty()
                .addClass("visible flags-spec")
                .html(`<span>${$fieldName}</span>`);
            }
          }
        }
      }

      if (_self.options.productReview !== null) {
        _self.setReview(_self.options.productReview);
      } else {
        _self.setReviewNull("");
      }

      if (_self.options.lastPrice !== null && $(".product-price .plugin-preco").length < 1) {
        _self.setLastPrice(_self.options.lastPrice);
        $('.product-buy a.buy-button, .product-fixed--btn .sku-notifyme > form > fieldset > p').hide();
        $(`.portal-notify-me-ref,
           .sku-notifyme,
           .notifyme-title-div,
           .sku-notifyme > form,
           .product-buy-box .sku-notifyme > form input:not(.sku-notifyme-skuid),
           .product-fixed--btn .sku-notifyme > form .notifyme-button-ok
          `).show();

        if (APP.i.Helpers._isMobile()) {
          $('.buy-button-mobile--container').hide();
          $('.notifyme-form').removeClass('hidden')
        }
      }


      const productCode = data.ManufacturerCode;
      _self.productCode = data.ManufacturerCode;

      const refId = data.AlternateIds.RefId;
      APP.i.currentController.RefId = refId;

      if (!_self.options.initFirstProduct) {
        APP.i.StockStores = new APP.component.StockStores({
          page: "product"
        })

        _self.options.initFirstProduct = true
      }

      $(".productReference").text(productCode)

    }, (error) => {
        throw new Error(error);
      }
    )
  },
  addThumbVideo: function () {
    const $video = $(".product-details .product-details-video ul li");
    const { $slickThumbs } = this.options;

    if ($slickThumbs.find(".thumb-video").length == 0 && $video.length) {
      $video.each((i, e) => {
        const videoURL = $(e).html();
        const $firstThumb = $slickThumbs
          .find("li")
          .eq(0)
          .clone()
          .addClass("thumb-video");

        $slickThumbs.prepend($firstThumb);
      });
    }
  },

  slickThumbs: function () {
    const { $slickThumbs, productVideo } = this.options;
    this.addThumbVideo();

    if (APP.i.Helpers._isMobile()) {
      APP.i.ProductImageSlider = new APP.component.ProductImageSlider(
        this.productVideo
      );
    } else {
      $slickThumbs.slick({
        autoplay: false,
        dots: false,
        arrows: true,
        slidesToShow: 5,
        slidesToScroll: 5,
        vertical: true,
        infinite: false
      });
    }
  },

  cloneShelfList() {
    const { helpers } = this.options;

    $(".produto .product-shelf").each((i, e) => {
      let title = $(e)
        .find(".section-title__text")
        .text();

      if (helpers._rewrite(title) == "quem-comprou-comprou-tambem") {
        this.options.$cloneShelfElm = $(e)
          .find(".shelf-default")
          .clone();
      }
    });
  },

  slickShelf() {
    const { $slickShelf, $cloneShelfElm } = this.options;

    if ($cloneShelfElm === "") {
      this.cloneShelfList();
    }

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: true,
      arrows: true,
      slidesToShow: 4,
      slidesToScroll: 4,
      responsive: [
        {
          breakpoint: 992,
          settings: {
            arrows: false,
            slidesToShow: 3,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 768,
          settings: {
            arrows: false,
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }
      ]
    };

    $slickShelf.slick(slickOptions);
  },

  productDetails() {
    const { $accordionItem, productDetails } = this.options;
    const productDetailsItem = productDetails.split(",");

    for (const productDetail of productDetailsItem) {
      const detailTarget = $accordionItem.find(
        '.product-details-content[data-name*="' + productDetail + '"]'
      );

      const detailContent = $(".specifications")
        .find("td." + productDetail)
        .html();

      if (productDetail === "conceitoTecnologia") {
        $(".produto-informacoes .informacoes").append(detailContent);
      } else if (productDetail === "Video") {
        if (detailContent) {
          if ($(".product-details .product-details-video").length == 0) {
            $(".product-details").append(
              '<div class="product-details-video" style="display:none !important;"><ul></ul></div>'
            );
          }

          $(".product-details .product-details-video ul").append(
            "<li>" + detailContent + "</li>"
          );
        }
      } else {
        detailTarget.html(detailContent);
      }
    }

    const intervalDetails = setInterval(() => {
      if ($(".product-details-content").html().length > 0) {
        clearInterval(intervalDetails);
        $("#caracteristicas").remove();
      }
    }, 100);
    const benefitsItems = $(".product-details-content .benefit-item").length;

    for (let i = 0; i < benefitsItems.length; i++) {
      const _this = $(benefitsItems[i]);

      _this.prepend('<div class="benefit-image-container"></div>');
      const imgCont = _this.find(".benefit-image-container");
      const imgItem = _this.find(".benefit-image");
      imgCont.html(imgItem);
    }
  },

  showFlagOffer(skuId) {
    const current = skuJson.skus.find(item => item.sku == skuId);
    if (current.listPrice > current.bestPrice) {
      $(".flag-offer:not(.visible)").addClass("visible");
    } else {
      $(".flag-offer.visible").removeClass("visible");
    }
  },

  sizeItemsUnavaliable() {
    const { $skuSizeItem } = this.options;
    const selectSku = $skuSizeItem.find("select.sku-selector");

    const intervalSetUnavailable = setInterval(() => {
      clearInterval(intervalSetUnavailable);

      $(".item-dimension-Tamanho select").selectpicker("refresh");
      $(".item-dimension-Tamanho .filter-option-inner-inner").html(
        "Selecione o tamanho"
      );

      const $listOptions = selectSku.find("option");
      const $listItens = $skuSizeItem.find(".dropdown-menu li a");

      for (let i = 0; i < $listOptions.length; i++) {
        const el = $listOptions[i];

        if ($(el).hasClass("item_unavailable")) {
          const optionValue = $(el).val();

          for (let x = 0; x < $listItens.length; x++) {
            const e = $listItens[x];
            if ($(e).text() === optionValue) {
              $(e).addClass("item_unavaliable");
            }
          }
        }
      }
    }, 200);
  },

  newPageSizeGuide() {
    const intervalLinkSize = setInterval(() => {
      if ($(".product-sizes a").hasClass("product-sizes--link")) {
        clearInterval(intervalLinkSize);
        $(".product-sizes--link").attr("target", "_blank");
      }
    }, 100);
  },

  setBrandLogo() {
    const brandName = $(".product-brand .brandName a")
      .text()
      .toLowerCase()
      .replace(/\s/g, "-");
    $(".product-brand .brandName a").html(
      '<img src="/arquivos/marca-' +
      brandName +
      '.png" alt="' +
      brandName +
      '" />'
    );
  },

  insertTextShare() {
    const textShare = '<p class="text-share">Compartilhe:</p>';
    const intervalText = setInterval(() => {
      if ($(".at-share-btn-elements").length > 0) {
        clearInterval(intervalText);
        $(".at-share-btn-elements").prepend(textShare);
      }
    }, 100);
  },

  consultInstallments(callback) {
    const currentSku = this.options.$buttonBuy
      .attr("href")
      .split("&")[0]
      .split("=")[1];
    $.ajax({
      url: "/api/checkout/pub/orderforms/simulation?sc=3",
      type: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      data: JSON.stringify({
        postalCode: "01310100",
        country: "BRA",
        items: [
          {
            id: currentSku,
            quantity: 1,
            seller: "1",
            isContingency: false
          }
        ]
      }),
      success: function (data) {
        $(".av-modal--payment").removeClass("av-modal--loading");
        callback(data.paymentData.installmentOptions[0].installments);
      },
      error: function (error) {
        console.log(error);
      }
    });
  },

  removeSkuName(name) {
    const { skus } = skuJson;
    const len = skus.length;
    const skuName = skus[0].skuname;

    if (len === 1) {
      return name.replace(` - ${skuName}`, "");
    }

    return name;
  },

  setLastPrice(price) {
    const templatePrice = `
      <div class="last-price">
        <p class="last-price--value"><strong>R$ ${price}</strong></p>
        <p class="last-price--title">Último preço praticado</p>
      </div>
    `;
    $(".last-price").remove();
    if ($(window).width() < 992) {
      $(".price-mobile, .product-fixed--price").remove();
      $(".price-mobile, .product-fixed--price").append(templatePrice);
    } else {
      $(".product-price, .product-fixed--price").append(templatePrice);
    }
  },

  setReview(note) {
    const templateStarProduct = `
      <div class="reviews-sidebar-rate ${
      $(window).width() < 992 ? "avaliation-ancor" : ""
      }">
        <span class="reviews-sidebar-rate--stars product-rating-stars--rate">
          <div class="rate-stars rate-stars--${parseInt(note)}">${note}</div>
        </span>
        <span class="reviews-sidebar-rate--note"><b>${note}</b>/5</span>
        <a class="avaliation-ancor" href="#">ver avaliações</a>
    </div>
    `;

    $(".reviews-sidebar-rate").remove();

    if ($(window).width() < 992) {
      $(".product-buy-info").prepend(templateStarProduct);
    } else {
      $(".product-sku-reviews").append(templateStarProduct);
    }
  },

  setReviewNull(note) {
    const templateStarNull = `
      <div class="reviews-sidebar-rate">
        <a class="avaliation-ancor" href="#">Seja o primeiro a avaliar</a>
      </div>
      `;
    $(".reviews-sidebar-rate").remove();

    if ($(window).width() < 992) {
      $(".product-buy-info").prepend(templateStarNull);
    } else {
      $(".product-sku-reviews").append(templateStarNull);
    }
  },

  _bindChangeSku() {
    const {
      $skuSizeItem,
      $skuColorItem,
      $slickThumbs,
      $buttonBuy,
      $elBuyFixed,
      skuColorClassSelected
    } = this.options;
    const _self = this;

    //color change
    $skuColorItem.on("click", "label", e => {
      const _this = $(e.currentTarget);
      const inputVal = _this.prev("input[type='radio']").val();

      $skuSizeItem.removeClass("sku-unchecked");

      if (_self.skuColor !== inputVal) {
        _self.skuColor = inputVal;
        $(".product-sku .Cor .specification").html("Cor: " + _self.skuColor);

        if (!_this.hasClass(skuColorClassSelected)) {
          $(".skuList")
            .find("." + skuColorClassSelected)
            .removeClass(skuColorClassSelected);
          _this.addClass(skuColorClassSelected);
        }

        const intervalListSize = setInterval(() => {
          if ($(".item-dimension-Tamanho .dropdown-toggle").length > 0) {
            clearInterval(intervalListSize);
            const select = $skuSizeItem.find("select");

            const firstOption = select
              .find('option[value!=""]')
              .not(".item_unavaliable")
              .not(":disabled")
              .eq(0)
              .text();

            select.val(firstOption).change();
            $(".item-dimension-Tamanho select").selectpicker("refresh");
            $(".item-dimension-Tamanho select").selectpicker("val", "");

            if ($skuSizeItem.find("select option").size() <= 2) {
              $("button").blur();
              $skuSizeItem
                .find(".bootstrap-select.sku-selector")
                .removeClass("open");
            }
          }
        }, 100);

        this.sizeItemsUnavaliable();
      } else {
        e.preventDefault();
      }
    });

    //size change
    $skuSizeItem.find("select").on("change", e => {
      const optionSelected = e.currentTarget.value;

      if (optionSelected !== "") {
        $skuSizeItem.removeClass("sku-unchecked");

        $slickThumbs.on("init reInit", () => {
          clickThumbs(); // eslint-disable-line no-undef
        });

        if ($slickThumbs.hasClass("slick-initialized")) {
          $slickThumbs.slick("unslick");
        }
        const intervalSlick = setInterval(() => {
          if ($slickThumbs.find(".slick-slide")) {
            clearInterval(intervalSlick);
            _self.slickThumbs();
          }
        }, 100);

        const imgBar = $(".skuList")
          .find(".color-image--picked > img")
          .attr("src");
        const priceBar = $(".descricao-preco").html();
        APP.i.FixedBuyBar.refreshBar(imgBar, priceBar);
      } else {
        if ($("ul.Tamanho li span.tamanho-unico").length > 0) {
          const imgBar = $(".skuList")
            .find(".color-image--picked > img")
            .attr("src");
          const priceBar = $(".descricao-preco").html();
          APP.i.FixedBuyBar.refreshBar(imgBar, priceBar);
        }
      }

      const hrefBuy = $buttonBuy.attr("href");
      $elBuyFixed.find(".buy-button-ref").attr("href", hrefBuy);

      this._bindPriceText();
      this._bindNotifyMe();
    });
  },

  _bindZoomMobile() {
    $("body").on("click", ".slick-product-img-item", e => {
      e.preventDefault();
      $(".product-images").addClass("zoomMobile");
      $(".zoomMobile").append(
        `<a class="product-main__image__close ">VOLTAR</a>`
      );
      this._bindCloseZoomMobile();
    });
  },

  _bindCloseZoomMobile() {
    const intervalCloseZoom = setInterval(() => {
      if ($(".product-main__image__close").length > 0) {
        clearInterval(intervalCloseZoom);
        $(".product-main__image__close").on("click", e => {
          $(".product-images").removeClass("zoomMobile");
          $(".zoomMobile").remove(".product-main__image__close");
        });
      }
    }, 100);
  },

  _bindScrollGetApis() {
    const _self = this;

    let $posScroll1, $posScroll2;

    if ($(window).width() < 992) {
      $posScroll1 = $(".product-images");
      $posScroll2 = $("#shelf-second");
    } else {
      $posScroll1 = $(".produto-beneficios");
      $posScroll2 = $("#section-reviews");
    }

    $(window).on("scroll", () => {
      let scrollW = $(window).scrollTop();
      if (scrollW >= 1200 && !_self.loadReviews) {
        if (_self.productCode) {
          APP.i.UserReviews = new APP.component.UserReviews(_self.productCode);
          _self.loadReviews = true;
        }
      } else if (scrollW > $posScroll2.offset().top && !_self.loadBlog) {
        APP.i.BlogTipsEntries.getEntries(
          "posts",
          "?filter[category_name]=" + _self.departamentSlug
        );
        _self.loadBlog = true;
      }
    });
  },

  _bindHiddenRecomendation() {
    /* $('body').on('click', '#recomendation-products', (event) => {
      if ($(event.target).is("#recomendation-products")) {
        $('.shelf-recomendation').fadeOut();
      }
    }); */
    $('body').on('click', '#recomendation-products .button--close', (event) => {
      $('.shelf-recomendation').fadeOut();
      setTimeout(() => {
        APP.i.Minicart.openCart();
      }, 1000);
    });
  },

  _bindClickAvaliationAncor() {
    $("body").on("click", ".avaliation-ancor", () => {
      $(".product-rating").addClass("opened");
      $(".section-title__text").addClass("opened");
      const aTag = $("#section-reviews");
      $("html,body").animate(
        {
          scrollTop: aTag.offset().top
        },
        "slow"
      );
    });
  },

  _bindThumbVideo: function () {
    $("body").on("click", ".thumb-video", event => {
      event.preventDefault();
      const _this = $(event.currentTarget);

      const $video = $(".product-details .product-details-video ul li");
      const videoUrl = $video.html();
      const url = videoUrl.split("v=");

      if (APP.i.Helpers._isMobile()) {
        $(".slick-product-img-list .slick-dots li:last").click();
      } else {
        $("#include .zoomPad").html(
          '<iframe src="https://www.youtube.com/embed/' +
          url[1] +
          '?rel=0&amp;modestbranding=1&amp;controls=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
        );
      }
    });
  },

  _bindPriceText() {
    const bestPrice = $(".price-best-price")
      .find("strong")
      .html();
    $(".price-best-price").html(bestPrice);

    const listPrice = $(".price-list-price")
      .find("strong")
      .html();
    $(".price-list-price").html(
      "<span>antes</span> <strong>" + listPrice + "</strong>"
    );

    if (listPrice) {
      $(".price-best-price").addClass("price-best-price--red");
    }
    $(".product-price").show();
  },

  // _bindPriceText() {
  //   const bestPrice = $(".price-best-price").find("strong").html()
  //   const listPrice = $(".price-list-price").find("strong").html()

  //   $(".price-best-price").html(bestPrice)
  //   $(".price-list-price").html("<span>antes</span> <strong>" + listPrice + "</strong>")

  //   setTimeout(function(){
  //     if (listPrice) {
  //       $('.price-best-price:contains("Por:")').each(function(){
  //         $(this).html($(this).html().split("Por:").join(""));
  //       });

  //       $(".price-best-price").addClass("price-best-price--red")
  //       $(".product-fixed--price").css("top", "-5px")
  //     } else {
  //       $(".product-fixed--price").removeAttr('style')
  //     }
  //   },400)
  //   $(".product-price").show()
  // },

  // _bindPriceText() {
  //   const bestPrice = $(".price-best-price")
  //     .find("strong")
  //     .html()
  //   $(".price-best-price").html(bestPrice)

  //   const listPrice = $(".price-list-price")
  //     .find("strong")
  //     .html()
  //   $(".price-list-price").html("<span>antes</span> <strong>" + listPrice + "</strong>")

  //   if (listPrice) {
  //     $(".price-best-price").addClass("price-best-price--red")
  //   }
  //   $(".product-price").show()
  // },

  _bindShipping() {
    const changeShippingText = setInterval(() => {
      if ($(".freight-zip-box").is(":visible")) {
        clearInterval(changeShippingText);

        const campoFrete = $(".freight-zip-box").clone();
        $(".product-shipping .prefixo").html(campoFrete);
        $(".freight-zip-box").attr("placeholder", "Digite seu cep");

        $("#txtCep").keypress(function (e) {
          if (e.which == 13) {
            //Enter key pressed
            $(".product-shipping .freight-btn")
              .val("CALCULAR FRETE")
              .click();
          }
        });

        $(".product-shipping .freight-btn")
          .val("CALCULAR FRETE")
          .on("click", e => {
            $(".freight-btn").attr("disabled", true);
            e.preventDefault();

            $(".freight-values").html("");
            const intervalShippingValue = setInterval(() => {
              if ($(".freight-values").html().length > 0) {
                clearInterval(intervalShippingValue);

                ga(
                  "send",
                  "event",
                  "Produto - Frete",
                  "Click Botão",
                  "Calcular Frete - " + $(".freight-zip-box").val()
                );

                const trHeads = $(".freight-values").find("table > thead > tr");
                const trBody = $(".freight-values").find("table > tbody > tr");
                trHeads
                  .find("th")
                  .first()
                  .html("Valor");
                trHeads
                  .find("th")
                  .last()
                  .html("Entrega")
                  .prependTo(trHeads);

                let free = false;
                trBody.each((i, e) => {
                  const _this = $(e);
                  _this.find("td:nth-child(2)").prependTo(_this);
                  _this.find("td:nth-child(3)").remove();

                  const $td = _this.find("td");
                  const $first = $td.first();
                  const $last = $td.last();

                  const textFirst = $first.text();
                  const [days] = textFirst.match(/(\d.+)(dias úteis)/g);
                  const [, type] = /Frete\s([a-zA-Z]+)/g.exec(textFirst);

                  if (i === 0 && type === "Loja") {
                    $first.text(`Retire na loja à partir de ${days}`);
                    _this.css("display", "table-row");
                  }

                  if (type !== "Loja" && type !== "Retirar") {
                    _this.css("display", "table-row");
                  }
                });

                if ($(".freight-values").find(".cep-invalido").length > 0) {
                  $(".freight-zip-box").addClass("freight-zip-box--error");
                } else {
                  $(".freight-zip-box").removeClass("freight-zip-box--error");
                }

                $(".freight-btn").attr("disabled", false);
              }
            }, 100);
          });
      }
    }, 100);
  },

  _bindOpenPaymentModal() {
    const { $buttonBuy } = this.options;
    const btnPayment = $(".product-payment--link");
    const target = $(".av-modal--payment");
    btnPayment.append('<i class="product-payment--icon"></i>');

    btnPayment.on("click", e => {
      e.preventDefault();

      $(".av-modal--payment").addClass("av-modal--loading");

      if ($buttonBuy.attr("href").indexOf("alert") === -1) {
        APP.i.Modal = new APP.component.Modal(target);
        APP.i.Modal.openModal(target);

        const intervalPayment = setInterval(() => {
          if (target.is(":visible")) {
            clearInterval(intervalPayment);
            $(".av-modal--payment .av-modal__content").html(`
                <ul class="installments-table"></ul>
              `);
            this.consultInstallments(response => {
              const numberInstallment = response.length;

              for (i = 0; i < numberInstallment; i++) {
                const endVal = APP.i.FilterPriceRange._formatPrice(
                  response[i].value
                );

                if (i === 10) {
                  $(".installments-flags").append(`<li class="paypal"></li>`);
                  $(".av-modal--payment .av-modal__content").addClass(
                    "paypal-bg"
                  );
                  $(".installments-table").append(
                    `<li class="installments-line eleven">${response[i].count}x sem juros de R$${endVal}</li>`
                  );
                } else {
                  $(".installments-table").append(
                    `<li class="installments-line">${response[i].count}x sem juros de R$${endVal}</li>`
                  );
                }
              }
            });
            const intevalFlagPayment = setInterval(() => {
              if ($(".installments-table").length > 0) {
                clearInterval(intevalFlagPayment);
                $(".av-modal--payment .av-modal__content").append(`
                    <ul class="installments-flags">
                      <li class="visa"></li>
                      <li class="master"></li>
                      <li class="elo"></li>
                      <li class="amex"></li>
                      <li class="diners"></li>
                    </ul>
                  `);
              }
            }, 100);
          }
        }, 100);
      } else {
        $(".buy-button.buy-button-ref").trigger("click");
      }
    });
  },

  _bindOpenCondicoesModal() {
    const btnCondicoes = $(".product-rj-rules--link");
    const target = $(".av-modal--condicoesrj");

    btnCondicoes.append('<i class="product-rj-rules--icon"></i>');

    btnCondicoes.on("click", e => {
      e.preventDefault();
      APP.i.Modal = new APP.component.Modal(target);
      APP.i.Modal.openModal(target);
    });
  },

  _bindSetPayments() {
    const { $modalPayments, $currentSku } = this.options;

    $.ajax({
      url:
        "//" +
        window.document.domain +
        "/productotherpaymentsystems/" +
        $currentSku,
      type: "GET"
    }).then(
      response => {
        const html = $(response);
        const content = html.find(".content");
        const contentReplaced = content.html().replace(/ vezes/g, "x");

        $modalPayments.html(contentReplaced);
      },
      error => {
        throw new Error(error);
      }
    );
  },

  _bindChangePaymentMethods() {
    const { $modalPayments } = this.options;

    const methodId = $modalPayments.find("select.mudaCartao").val();
    $modalPayments.find("#tbl" + methodId).show();

    $modalPayments.find("select.mudaCartao").on("change", e => {
      e.preventDefault();
      const _this = $(e.currentTarget);
      const methodId = _this.val();

      _this
        .closest(".cartao")
        .find(".tbl-payment-system")
        .hide();
      _this
        .closest(".cartao")
        .find("#tbl" + methodId)
        .show();
    });
  },

  _bindBuyButtonMobile() {
    const { $buyButton } = this.options;

    $(".product-images").append(
      '<div class="buy-button-mobile--container"></div>'
    );

    $buyButton
      .appendTo(".buy-button-mobile--container")
      .removeClass("buy-button")
      .addClass("buy-button--mobile")
      .html('<i class="buy-button--icon"></i> COMPRAR')
      .show();

    // $(".product-rj-rules").prependTo(".product-buy-info")

    const intevalProcuctSize = setInterval(() => {
      if ($(".product-content-price").length > 0) {
        clearInterval(intevalProcuctSize);
        $(".product-content-price .product-buy").append($buyButton);
        $(".product-content-price .buy-button--mobile")
          .addClass("buy-button")
          .removeClass("buy-button--mobile")
          .attr("style", "display: block!important;")
          .html('<i class="buy-button--icon"></i> ADICIONAR AO CARRINHO');
      }
    });
  },

  _bindBuyButton() {
    const {
      $buyButton,
      $skuColorInput,
      $skuColorItem,
      $recomendationProducts,
      $skuSizeItem
    } = this.options;

    if ($buyButton.find("i").length == 0)
      $buyButton.append('<i class="buy-button--icon"></i>');

    $(".buy-button-ref").on("click", e => {
      const _this = $(e.currentTarget);

      const $buttonSelect = $(".skuList.item-dimension-Tamanho button");
      const hrefBuyButton = _this.attr("href");

      if ($("ul.Tamanho:visible").length > 0 && $("ul.Tamanho li span.tamanho-unico").length === 0 && ($buttonSelect.prop("title") === "Nothing selected" || $buttonSelect.prop("title") === "Selecione o tamanho")) {
        $skuSizeItem.addClass("sku-unchecked");
        return false;
      }

      if (hrefBuyButton.indexOf("/checkout") === -1) {
        return false;
      }

      e.preventDefault();

      APP.i.Minicart.addCart(hrefBuyButton, () => {
        if ($("#recomendation-products").length < 1) {
          this.shelfProductsRecomendation();
        } else {
          $("#recomendation-products").fadeIn();
        }
      });

      /*
      if (hrefBuyButton.indexOf("/checkout") === 0) {
        e.preventDefault()
        const hrefBuyButton = _this.attr("href")
        if ($("ul.Tamanho:visible").length > 0 && $("ul.Tamanho li span.tamanho-unico").length === 0 && $buttonSelect.prop("title") === "Selecione o Tamanho") {
          $skuSizeItem.addClass("sku-unchecked")
        } else {
          APP.i.Minicart.addCart(hrefBuyButton, () => {
            APP.i.Minicart.openCart()
          })
        }
      } else {
        if ($skuColorInput.hasClass("checked")) {
          $skuColorItem.removeClass("sku-unchecked")
        } else {
          $skuColorItem.addClass("sku-unchecked")
        }

        if ($(".input-dimension-Tamanho").find("select option:checked").length === 0) {
          $skuSizeItem.addClass("sku-unchecked")
        } else {
          $skuSizeItem.removeClass("sku-unchecked")
        }
      }

      */
    });
  },

  _bindAccordionMobile() {
    const { $accordionItem } = this.options;

    $accordionItem.find(".section-title").on("click", e => {
      e.preventDefault();
      const _this = $(e.currentTarget);

      _this
        .find(".section-title__text")
        .toggleClass("opened")
        .closest(".accordion-item")
        .toggleClass("opened");
    });
  },

  _bindPriceMobile() {
    const { $productPrice } = this.options;
    $(".product-name")
      .first()
      .after('<div class="price-mobile"></div>');
    // $productPrice.appendTo(".price-mobile")
  },

  _bindNotifyMe() {
    const { $elBuyFixed, $btnBuy, $skuSizeItem } = this.options;

    const $buttonSelect = $(".skuList.item-dimension-Tamanho button");

    $('.sku-notifyme-form .notifyme-button-ok').on('click', (element) => {
      if ($("ul.Tamanho:visible").length > 0 && $("ul.Tamanho li span.tamanho-unico").length === 0 && ($buttonSelect.prop("title") === "Nothing selected" || $buttonSelect.prop("title") === "Selecione o tamanho")) {
        $skuSizeItem.addClass("sku-unchecked");
      }
    });

    const notifyInterval = setInterval(() => {
      if ($(".portal-notify-me-ref").html().length > 0) {
        clearInterval(notifyInterval);

        if ($(".sku-notifyme").is(":visible") || (APP.i.currentController.currentSkuAvailable !== undefined && !APP.i.currentController.currentSkuAvailable)) {
          $(".buy-button-mobile--container").addClass("unavailable");
          $(".product-payment, .product-rj-rules").addClass("hidden");

          $("#fixed-bar-notify").removeClass("hidden");
          $elBuyFixed.hide();
          $btnBuy.hide();
        } else {
          $("#fixed-bar-notify").addClass("hidden");
          $btnBuy.show();
          $elBuyFixed.show();
          $(".buy-button-mobile--container").removeClass("unavailable");
          $(".product-payment, .product-rj-rules").removeClass("hidden");
        }
        $(".notifyme-button-ok").val("AVISE-ME QUANDO CHEGAR");
      }
    }, 100);
  },

  _bindDescriptionShowMore() {
    const descriptionText = $(".libelle-description:first");
    descriptionText.text(descriptionText.text());
  },

  selectSkuByUrl() {
    const url = window.location.search;
    const resultUrl = this.getQueryParams(url);

    if (resultUrl.aSku) {
      let split = resultUrl.aSku.split(":"),
        type = split[0],
        value = split[1],
        target = $(`.product-sku ul.${type}`);

      const _interval = setInterval(() => {
        if (target.length) {
          clearInterval(_interval);

          target.find(`input[data-value='${value}'] + label`).click();
        }
      }, 100);
    }

    if (resultUrl.bSku) {
      let split = resultUrl.bSku.split(":"),
        type = split[0],
        value = split[1],
        target = $(`.product-sku ul.${type}`);

      const _interval = setInterval(() => {
        if (target.find(".filter-option-inner-inner").text() == 'Selecione o tamanho') {
          clearInterval(_interval);
          target.find('select').selectpicker('val', value);
        }
      }, 100);
    }
  },

  getQueryParams(qs, tokens) {
    qs = qs.split("?");
    qs = qs[qs.length - 1];

    const params = {};
    const re = /[?&]?([^=]+)=([^&]*)/g;
    while ((tokens = re.exec(qs))) {
      if (params[decodeURIComponent(tokens[1])]) {
        params[decodeURIComponent(tokens[1])] +=
          "," + decodeURIComponent(tokens[2]);
      } else {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
      }
    }
    return params;
  },

  shelfProductsRecomendation() {
    console.log('shelfProductsRecomendation')
    const { $cloneShelfElm } = this.options;

    // $recomendationProducts.empty();
    // $("#recomendation-products .main-shelf > ul").slick('unslick');

    const slickOptionsClone = {
      infinite: false,
      autoplay: false,
      dots: true,
      arrows: true,
      slidesToShow: 4,
      slidesToScroll: 4,
      responsive: [
        {
          breakpoint: 992,
          settings: {
            arrows: false,
            slidesToShow: 3,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 768,
          settings: {
            arrows: false,
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
      ]
    };

    $("footer.footer").append(
      `<div id="recomendation-products" class="shelf-recomendation">
        <div class="shelf-recomendation__content">
          <div class="av-container">
            <h3 class="shelf-recomendation__title">Pra completar seu esporte</h3>
            <a class="av-modal-close button--close" data-event-category="Pop-up PDP" data-event-action="Click - Fechar" data-event-label="X canto superior direito"></a>
            <div class="shelf-recomendation__products product-shelf">${window.checkoutCrossSelling}</div>
            <div class="shelf-recomendation__buttons">
                <a href="/checkout/#/payment" class="button button--small button--blue gaClick" data-event-category="Pop-up PDP" data-event-action="Click - CTA" data-event-label="Finalizar compra">Finalizar compra</a>
                <a href="/checkout" class="button button--small button--yellow gaClick" data-event-category="Pop-up PDP" data-event-action="Click - CTA" data-event-label="Ir para o carrinho">Ir para o carrinho</a>
            </div>
          </div>
        </div>
      </div>`
    );

    this.setThumbsRecomendation();

    $('[id^="helperComplement_"]').remove()
    $("#recomendation-products .main-shelf > ul").slick(slickOptionsClone);
  },

  setThumbsRecomendation() {
    const { classShelfItem, classShelfItemInitialized } = this.options;

    window.productRecomendation = [];
    window.toCart = [];
    $(`.shelf-recomendation__products .${classShelfItem}`).not(`.${classShelfItemInitialized}`).Lazy({
      /* eslint-disable-line new-cap */
      loadShelf(element) {
        const _this = $(element);

        if (_this.hasClass(classShelfItemInitialized)) {
          return false;
        }

        _this.addClass(classShelfItemInitialized);
        APP.i.ShelfSku = new APP.component.ShelfSku({
          $scope: _this, type: 'selectSize'
        });
      }
    });
  },

  selectCurrentColor($scope) {

    this.mountSizesOptions(color["Cor"][0], false);
  },

  _isMobile() {
    if ($(window).width() < 992) {
      this._bindBuyButtonMobile();
      this._bindAccordionMobile();
      this._bindPriceMobile();
      this._bindZoomMobile();
    } else {
      $(".product-rating").hide();

      const shareOptions = {
        text: this.options.nameSku,
        image: this.options.currentImage,
        page: window.location.href,
        eventCategory: "Produto - "
      };
      APP.i.ShareButtons = new APP.component.ShareButtons(
        ["facebook", "twitter", "pinterest"],
        shareOptions
      );
    }
  }
});
