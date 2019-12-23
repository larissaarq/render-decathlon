import '../../sass/pages/_0-dcs-web-list.scss'
import '../avanti-search'
import '../components/_0-dcs-web-search-result'
import '../components/_0-dcs-web-list-filters'

APP.controller.List = ClassAvanti.extend({
  init() {
    this.setup();
    this.start();
    this.bind();
  },

  setup() {
    APP.i.SearchResult = new APP.component.SearchResult();
    APP.i.ListFilters = new APP.component.ListFilters();

    this.options = {
      ComponentSearchResult: APP.i.SearchResult,
      ComponentListFilters: APP.i.ListFilters,

      $filterCounter: $(".menu-departamento label, .menu-departamento a"),
      $asideTitle: $(
        ".search-multiple-navigator fieldset h5, .search-single-navigator h3 a, .search-single-navigator h4 a, .search-single-navigator h5"
      ),
      $rates: $(
        ".menu-departamento fieldset h5:contains(Avaliações) + div label"
      ),
      $resultItems: $('.resultItemsWrapper div[id^="ResultItems"]'),
      $header: $(".header"),
      $mainShelf: $(".main-shelf"),
      $singleNavigator: $(".search-single-navigator"),
      $bannerFull: $(".banner-full__wrap"),
      $shelfCollectionList: $(".collection-shelf__list"),

      classCollectionShelf: "collection-shelf",
      classSearchBar: "search-bar",
      classToggleTitle: "list__toggle-title",
      classTotalproducts: "total-products",
      classClearFilters: "list-selection__clear, .clear-filter__button:first",
      classClearFilterButton: "clear-filter__button",
      classFilterButton: "filter-button",
      classResponsiveFilter: "responsive-filter",
      classResponsiveFilterOpen: "responsive-filter--open",
      classResponsiveFilterFixed: "responsive-filter--fixed",
      classBodySidebarOpen: "sidebar--open",
      classTotal: "list-selection__count, .filter-button__count",

      classSearchResultTotal: "list-result-info__total-products",
      classSearchResultTerm: "list-result-info__term",

      classShowSportFilter: "list--sports",
      classDepartament: "departament",
      classCategory: "category",

      searchOptions: {
        $selectOrder: $("#search-order"),
        textLoadLess: "Carregar produtos anteriores",
        textLoadMore: "Ver mais produtos",
        pagination: false
      },
      singleNavigatorUls: $('.search-single-navigator ul').clone()
    }

    APP.i.StockStores = new APP.component.StockStores({
      page: "list"
    })
    APP.i.FilterPriceRange = new APP.component.FilterPriceRange()
    APP.i.EnhancedEcommerce = new APP.component.EnhancedEcommerce()
  },

  start() {
    this.clearUTMCookies();

    this.changeFilterOrder();

    this.hideSportFilter();
    this.departmentHides();

    if ($("body").hasClass("list search")) {
      this.orderAlphabeticSports();
      this.searchTerm();
    }

    this.searchResult();
    this.seeMore();
    this.createClearSearchButton();
    this.setRateStars();
    this.startAvantiSearch();

    APP.i.EnhancedEcommerce.onAccessListPage();

    if ($("body").hasClass("collection-special")) {
      this.listOrderAlphabetic();
    }
  },

  clearUTMCookies() {
    const cookieName = "IPS";
    const pattern = /(Campanha=)(Avançado|Iniciante|Performance)/g;

    setInterval(() => {
      const cookie = decodeURIComponent(Cookies.get(cookieName));

      Cookies.set(cookieName, cookie.replace(pattern, ""), {
        expires: 3,
        domain: `.${window.document.location.hostname}`
      });
    }, 300);
  },

  changeFilterOrder() {
    $(".search-single-navigator").after($(".search-multiple-navigator"));
  },

  listOrderAlphabetic() {
    const {
      $shelfCollectionList,
      classCollectionShelf
    } = this.options;

    $(`.${classCollectionShelf} .av-row h2`).remove();
    $(`.${classCollectionShelf} .av-row li`)
      .unwrap()
      .unwrap()
      .wrapAll('<ul class="collection-shelf__list"></ul>');

    $(".collection-shelf__list").html(
      $(`.collection-shelf__list`)
      .children("li")
      .sort(function (a, b) {
        return $(a)
          .find(".shelf-item__name")
          .text()
          .toUpperCase()
          .localeCompare(
            $(b)
            .find(".shelf-item__name")
            .text()
            .toUpperCase()
          );
      })
    );

    $shelfCollectionList.addClass("list-show");
  },

  orderAlphabeticSports() {
    const _self = this;
    const {
      $singleNavigator
    } = this.options;

    let itmClass1 = "";
    let itmClass2 = "";

    const listItems = $("h3", $singleNavigator).get();

    listItems.sort(function (a, b) {
      var keyA = $(a)
        .find("a")
        .text()
        .toUpperCase();
      var keyB = $(b)
        .find("a")
        .text()
        .toUpperCase();

      return keyA < keyB ? -1 : 1;
    });

    $singleNavigator.empty();

    $.each(listItems, function (i, itm) {
      itmClass2 = $(itm)
        .attr("class")
        .replace(/^(\S*).*/, "$1");
      let el = "";
      if (itmClass1 !== itmClass2) {
        el = _self.getUlClass(itmClass2);
        itmClass1 = itmClass2;
      }
      $singleNavigator.append(itm);
      $singleNavigator.append(el);
    });
  },

  getUlClass(itmClass) {
    const {
      singleNavigatorUls
    } = this.options;
    let ret = false;

    singleNavigatorUls.map(function (i, el) {
      if ($(el).attr("class") == itmClass) {
        ret = el;
      }
    });
    return ret;
  },

  hideSportFilter() {
    const {
      classShowSportFilter
    } = this.options;

    if ($("body").hasClass(classShowSportFilter)) {
      return false;
    }

    $(".search-multiple-navigator fieldset h5:contains(Esporte)")
      .parent()
      .hide();
  },

  departmentHides() {
    const {
      classShowSportFilter,
      classDepartament
    } = this.options;

    if (
      $("body").hasClass(classDepartament) &&
      $("body").hasClass(classShowSportFilter) === false
    ) {
      $(
        ".search-multiple-navigator fieldset h5:contains(Tipo de Produto)"
      ).parent();
      // .hide()
    }
  },

  searchTerm() {
    const {
      ComponentSearchResult,
      classSearchResultTotal,
      classSearchResultTerm
    } = this.options;

    const terms = $(".resultado-busca-termo:first strong").text();
    const total = ComponentSearchResult.getTotalSearchResult();

    $(`.${classSearchResultTerm}`).text(terms);
    $(`.${classSearchResultTotal}`).text(total);

    const intervalSerachBar = setInterval(() => {
      if ($(".search-bar__total-products").length > 0) {
        clearInterval(intervalSerachBar);
        $(".search-bar__total-products").html(
          `<p class="search-text"> Encontramos ${total} produtos para: <span class="term-search">${terms}</span></p> `
        );
      }
    }, 100);
  },

  searchResult() {
    const {
      ComponentSearchResult,
      classSearchBar
    } = this.options;

    const total = ComponentSearchResult.getTotalSearchResult();

    const $resultBar = `<!-- START: Total products -->
                        <div class="search-bar__total-products">
                          <span class="total-products">${total}</span> produto${this._plural(
      total,
      "s"
    )} encontrado${this._plural(total, "s")}
                        </div>
                        <!-- END: Total products -->`;

    $(`.${classSearchBar}`).prepend($resultBar);
  },

  _plural(total, plural = "s") {
    if (total > 1) {
      return plural;
    }

    return "";
  },

  removeFilterCounter() {
    const {
      $filterCounter
    } = this.options;

    $filterCounter.each((index, element) => {
      const _this = $(element);

      const text = _this.text();
      const removeCounter = text.replace(/(\s)(\()([0-9]*)(\))/gi, "");

      if (typeof _this.contents()[1] === "undefined") {
        _this.text(removeCounter);
      } else {
        _this.contents()[1].nodeValue = removeCounter;
      }
    });
  },

  seeMore() {
    APP.i.SeeMore = new APP.component.SeeMore();
  },

  createClearSearchButton() {
    const {
      classClearFilterButton
    } = this.options;

    const htmlClearFilter = `<div class="clear-filter">
                              <button class="${classClearFilterButton}">Limpar filtros</button>
                              <button class="${classClearFilterButton}">Aplicar filtros</button>
                            </div>`;

    $(".menu-departamento > div").append(htmlClearFilter);
  },

  setRateStars() {
    const {
      $rates
    } = this.options;

    $rates.each((index, element) => {
      const _this = $(element);
      const $input = _this.find("input");
      const rate = parseInt(_this.contents()[1].nodeValue, 10);

      const stars = `<div class="rate-stars rate-stars--${rate}">${rate}</div>`;

      _this
        .html("")
        .append($input)
        .append(stars);
    });
  },

  startAvantiSearch() {
    const {
      ComponentListFilters,
      $resultItems,
      searchOptions,
      classTotalproducts
    } = this.options;

    const $loading = $(".search-default__loading");
    const $noResult = $(".search-default__no-result");

    $resultItems.on("avantisearch.initWithoutCookie", () => {
      this.filterLevels();
    });

    $resultItems.on("avantisearch.init", (event, options, request) => {
      const $checkbox = $(".search-multiple-navigator input:checked");

      $checkbox.each((index, element) => {
        const _this = $(element);
        const $parent = _this.parent();

        const text = $parent.text();
        const filter = $parent.find("input").attr("rel");

        ComponentListFilters.addFilter(text, filter);
      });
    });

    $resultItems.avantiSearch(searchOptions);

    $resultItems.on(
      "avantisearch.beforeFilter avantisearch.beforeChangeOrder",
      (event, options, request, $element) => {
        ComponentListFilters.updateFilter($element);
      }
    );

    $resultItems.on("avantisearch.beforeSearch", () => {
      // $loading.show()
      $noResult.hide();
    });

    $resultItems.on("avantisearch.afterSearch", (event, options, request) => {
      APP.i.Shelf = new APP.component.Shelf();

      $(`.${classTotalproducts}`).text(options.totalItems);

      if (options.totalItems === 0) {
        $noResult.show();
      }

      if (
        $(".search-multiple-navigator").length > 0 &&
        $("body").hasClass("list search")
      ) {
        $(".search-single-navigator .list__toggle-title").remove();
      }

      // TODO - Update EnhancedEcommerce list
      APP.i.EnhancedEcommerce.handleProductImpressionsList(
        request.query.PageNumber
      );

      this._flagSpacification();
    });
  },

  filterLevels() {
    const search = decodeURIComponent(window.document.location.search);
    const match = search.match(
      /(utm_campaign=)(Avançado|Iniciante|Performance)/
    );

    if (match === null) {
      return false;
    }

    const [level] = match.reverse();
    const arrayLevels = ["Iniciante", "Avançado", "Performance"];

    if (arrayLevels.contains(level) === false) {
      return false;
    }

    const $filter = $(`input[type='checkbox'][value='${level}']`);
    const $label = $filter.parent();

    $("body").addClass(`list--${level.toLocaleLowerCase()}`);

    const interval = setInterval(() => {
      if ($('.main-shelf li[page="2"]').length > 0) {
        clearInterval(interval);

        $label.trigger("click");
      }
    }, 100);
  },

  _setPriceBySelectSku(element) {
    const $shelfItemElement = element.closest(".shelf-item");
    const $shelfItemPriceElement = $shelfItemElement.find(".shelf-item__price");
    const productId = $shelfItemElement.data("productId");
    const color = element.data("color");

    this._getFirstSkuByProductIdAndColorName(productId, color, sku => {
      const listPrice = sku.listPrice;
      const bestPriceCentsToDollar = sku.bestPrice / 100;
      const bestPriceFormatedSplited = bestPriceCentsToDollar
        .toFixed(2)
        .split(".");
      const bestPricePrice = bestPriceFormatedSplited[0];
      const bestPriceDecimal = bestPriceFormatedSplited[1];
      const $newShelfItemListPrice = $(
        '<div class="shelf-item__list-price"></div>'
      );
      const installmentsToDollar = sku.installmentsValue / 100;
      const installments = installmentsToDollar.toFixed(2).split(".");

      $shelfItemPriceElement.html("");
      $shelfItemPriceElement.append($newShelfItemListPrice.html(""));

      if (listPrice > 0) {
        $shelfItemPriceElement.append(
          $newShelfItemListPrice.html(
            `antes <span class="shelf-item__featured">${sku.listPriceFormated}</span>`
          )
        );

        $shelfItemPriceElement.append(
          $('<div class="shelf-item__best-price"></div>').html(
            `<span class="shelf-item__signal-price">R$</span> ${bestPricePrice},${bestPriceDecimal}`
          )
        );

        $shelfItemPriceElement.append(
          $('<div class="shelf-item__installments"></div>').html(
            `até ${sku.installments}x de R$ ${installments}`
          )
        );

        return false;
      }

      $shelfItemPriceElement.append(
        $(
          '<div class="shelf-item__best-price shelf-item__best-price--featured"></div>'
        ).html(
          `<span class="shelf-item__signal-price">R$</span> ${bestPricePrice},${bestPriceDecimal}`
        )
      );

      $shelfItemPriceElement.append(
        $('<div class="shelf-item__installments"></div>').html(
          `até ${sku.installments}x de R$ ${installments}`
        )
      );
    });
  },

  _getFirstSkuByProductIdAndColorName: (id, color, callback) => {
    $.get(`/api/catalog_system/pub/products/variations/${id}`)
      .done(response => {
        const skus = response.skus;
        const filteredSkus = skus.filter(
          sku => sku.available && sku.dimensions.Cor === color
        );

        if (filteredSkus.length === 0) {
          console.warn(
            `Sku com a cor ${color} do produto de ID ${id} pode estar indisponivel ou nao existe.`
          );

          return false;
        }

        if (typeof callback === "function") {
          callback(filteredSkus[0]);
        }
      })
      .fail(error => {
        throw new Error(error);
      });
  },

  bind() {
    const {
      classSearchBar
    } = this.options;

    this.bindToggleTitle();
    this.bindClearFilter();
    this.bindOpenFilters();
    this.bindButtonFilters();
    this.bindSetPriceBySkuColor();
    this.bindApplyFilter();
    this.bindClickCategoryFilter();
    this.bindSlickBanners();

    if ($("body").hasClass("collection--menu")) {
      this.bindClickMenuCollection();
    }

    if ($(`.${classSearchBar}`).length) {
      this.bindFixedFilter();
    }
  },

  bindSlickBanners() {
    const {
      $bannerFull
    } = this.options;

    if ($bannerFull.find(".banner-full__item").length < 2) {
      $bannerFull.addClass("slick-started");
      return false;
    }
    const slickOptions = {
      infinite: false,
      autoplay: true,
      dots: true,
      speed: 300,
      arrows: true
    };

    APP.i.general._registerSlickIntervalBind(() => {
      $bannerFull.slick(slickOptions);
    });

    const intervalBanner = setTimeout(() => {
      if ($bannerFull.find(".slick-initialized")) {
        clearInterval(intervalBanner);
        $bannerFull.addClass("slick-started");
      }
    }, 100);
  },

  bindClickCategoryFilter() {
    $(".search-single-navigator ul li a").on("click", event => {
      let urlPath = event.target.pathname;

      if (urlPath !== undefined || urlPath !== null) {
        ga("send", "event", "Filtro Categoria", "Click Categoria", urlPath);
      }
    });
  },

  bindClickMenuCollection() {
    $(".collection--menu .menu-list").on("click", event => {
      const _this = $(event.currentTarget).parent("li");
      _this.toggleClass("active");
    });
    this.bindApplyCurrentLinkColletion();
  },

  bindApplyCurrentLinkColletion() {
    const currentUrl = window.location.pathname;
    $(".collection--menu .menu-list a").each((i, e) => {
      const _this = $(e);
      const currentLink = _this.attr("href");
      if (currentLink === currentUrl) {
        _this.parent("li").addClass("active");
      }
    });
  },

  bindApplyFilter() {
    $(".clear-filter__button").on("click", () => {
      this._closeFilter();
    });
  },

  bindSetPriceBySkuColor() {
    const _self = this;

    $(window.document).on("click", "a.shelf-colors__link", e => {
      const _this = $(e.currentTarget);

      _self._setPriceBySelectSku(_this);
    });
  },

  bindToggleTitle() {
    const {
      $asideTitle,
      classToggleTitle
    } = this.options;

    var genderFirstTime = true;

    $asideTitle.on("click", event => {
      event.preventDefault();

      const _this = $(event.currentTarget);

      let $next = _this.next();
      let $button = $next.next();

      if (_this.is("a")) {
        if (_this.parent().text() === "Gênero" && genderFirstTime) {
          genderFirstTime = false;
          return false;
        }

        _this.parent().toggleClass(classToggleTitle);
        $next = _this.parent().next();
        $button = $next.next();
      } else {
        if (_this.text() === "Gênero" && genderFirstTime) {
          genderFirstTime = false;
          return false;
        }

        _this.toggleClass(classToggleTitle);
      }

      $next.toggle();

      if ($button.is("button")) {
        $button.toggle();
      }
    });

    // Close all filters by default
    $asideTitle.click();
  },

  bindClearFilter() {
    const {
      classClearFilters,
      classTotal
    } = this.options;

    $("body").on("click", `.${classClearFilters}`, event => {
      event.preventDefault();

      const _this = $(event.currentTarget);

      const $menuDepartamento = $(".menu-departamento");
      const $checked = $menuDepartamento.find('input[type="checkbox"]:checked');

      $checked.removeAttr("checked");
      $menuDepartamento
        .find("label.filter--active")
        .removeClass("filter--active");

      const filters = [];
      $checked.each((index, element) => {
        const $element = $(element);

        const filter = $element.attr("rel");

        filters.push(filter);
      });

      $(".list-selection").removeClass("list-selection--items");
      $(".list-selection__content").html("");

      if (filters.length > 0) {
        AvantiSearch._refreshFilter(filters, false, _this);
        $(`.${classTotal}`).text("0");
      }

      if ($(".mobile-floating-menubar").is(":visible")) {
        this._closeFilter();
      }
    });
  },

  bindOpenFilters() {
    const {
      classFilterButton,
      classResponsiveFilter,
      classResponsiveFilterOpen,
      classBodySidebarOpen
    } = this.options;

    $(`.${classFilterButton}`).on("click", event => {
      event.preventDefault();

      $(`.${classResponsiveFilter}`).toggleClass(classResponsiveFilterOpen);
      $("body").toggleClass(`body-lock ${classBodySidebarOpen}`);
    });
  },

  bindButtonFilters() {
    $("body").on("click", ".clear-filter__button:last", event => {
      event.preventDefault();

      this._closeFilter();
    });
  },

  _closeFilter() {
    const {
      classResponsiveFilter,
      classResponsiveFilterOpen,
      classBodySidebarOpen
    } = this.options;

    $(`.${classResponsiveFilter}`).removeClass(classResponsiveFilterOpen);
    $("body").removeClass(`body-lock ${classBodySidebarOpen}`);
  },

  bindFixedFilter() {
    const {
      $header,
      classResponsiveFilter,
      classResponsiveFilterFixed,
      classSearchBar
    } = this.options;

    $(window).on("scroll", () => {
      if ($header.offset().top > $(`.${classSearchBar}`).offset().top - 100) {
        $(`.${classResponsiveFilter}`).addClass(classResponsiveFilterFixed);
      } else {
        $(`.${classResponsiveFilter}`).removeClass(classResponsiveFilterFixed);
      }
    });
  },

  _flagSpacification() {
    $(".main-shelf li:not(.skus-loaded)").each(function () {
      const _self = this;
      const shelf = $(this);
      const productId = shelf.find(".shelf-item").attr("data-product-id");
      let $fieldName = null;

      if (productId !== undefined) {
        $.get(
          "/api/catalog_system/pub/products/search?fq=productId:" + productId
        ).done(function (response) {
          const skuId = response[0].items[0].itemId;

          $.ajax({
            type: "get",
            url: `https://skubyid--decathlonstore.myvtex.com/_v/product/sku/${skuId}`,
            dataType: "json"
          }).then((response) => {
            if (response.data == null || response.data == undefined) {
              return;
            }

            const data = response.data;

            /*------- Flags Spscifications -------*/
            if (!$(".flag-offer").hasClass("visible")) {
              //Lista de prioridades das flags
              let idSpec = [55, 56, 54, 57],
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

                      if (typeFlag == "true" || (dataTodayNum > dateFlagNum && daysDates <= 30)) {
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
                    $(".shelf-item__flags", _self).html(
                      `<div class="flag-offer visible flags-spec"><span>${$fieldName}</span></div>`
                    );
                  }
                }
              }
            }
          }, (error) => {
            throw new Error(error);
          })
        });
      }
    });
  }
});
