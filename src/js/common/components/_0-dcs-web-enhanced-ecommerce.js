window.dataLayer = window.dataLayer || [];

APP.component.EnhancedEcommerce = ClassAvanti.extend({
  init: function() {
    this.options = {
      helpers: APP.i.Helpers,
      pageInfo: dataLayer.filter(e => e.pageCategory),
      idxList: 0,
      curPageList: 0
    };
  },

  /**
   * Picks selected fields from a source object
   */
  pick: (source, ...fields) =>
    fields.reduce((prev, field) => ((prev[field] = source[field]), prev), {}),

  /**
   * Handler for product impressions in product.
   * It will find for shelf-items and push information to dataLayer
   */
  handleProductImpressions: function() {
    const self = this;

    const { pageInfo } = this.options;

    let impressions = [];
    let nameList,
      nameCollection,
      queryString = "";
    let idx = 0;

    if (pageInfo[0].pageCategory === "buscavazia") {
      queryString = window.location.search.substr(1).replace("ft=", "");
    }

    $(".shelf-item").each(function() {
      if (
        nameList !==
        $(this)
          .closest(".main-shelf")
          .find("h2")
          .text()
      ) {
        idx = 0;
        nameList = $(this)
          .closest(".main-shelf")
          .find("h2")
          .text();
      }
      idx++;

      if (queryString !== "" && queryString !== undefined) {
        nameCollection =
          pageInfo[0].pageCategory +
          " " +
          decodeURIComponent(queryString) +
          " - " +
          nameList;
      } else {
        nameCollection = pageInfo[0].pageCategory + " - " + nameList;
      }

      impressions.push(
        self.getProductByShelfItem($(this), idx, nameCollection)
      );
    });

    this.handleDataLayerEventPush(
      "productImpression",
      "impressions",
      impressions
    );
  },

  /**
   * Handler for product impressions in List - Search, Categories and Department.
   * It will find for shelf-items and push information to dataLayer
   */
  handleProductImpressionsList: function(page) {
    const self = this;
    const { pageInfo } = this.options;

    let impressions = [];
    let nameList = "";

    let depName = pageInfo[0].pageDepartment;
    let catName = pageInfo[0].categoryName;
    let pageCateg = pageInfo[0].pageCategory;

    if (pageCateg === "InternalSiteSearch") {
      nameList = pageCateg + " - " + pageInfo[0].siteSearchTerm;
    } else if (depName == null || depName == "") {
      nameList = pageCateg;
    } else {
      nameList =
        depName === catName
          ? pageCateg + " - " + depName
          : pageCateg + " - " + depName + " > " + catName;
    }

    if (
      (this.options.curPageList == 0 && page == 1) ||
      this.options.curPageList !== page
    ) {
      setTimeout(function() {
        $(".shelf-item")
          .closest(`li[page="${page}"]`)
          .each(function() {
            self.options.idxList++;
            impressions.push(
              self.getProductByShelfItem(
                $(this).find(".shelf-item"),
                self.options.idxList,
                nameList
              )
            );
          });

        if (impressions.length > 0) {
          self.handleDataLayerEventPush(
            "productImpression",
            "impressions",
            impressions
          );
        }
      }, 2000);
      self.options.curPageList = page;
    }
  },

  /**
   * Handler for product click.
   * It will push to dataLayer when clicking on a product
   */
  handleProductClick: function() {
    const self = this;

    $("body").on(
      "click",
      ".shelf-item__img-link, .shelf-item__title-link",
      function(e) {
        e.preventDefault();

        const shelfItem = $(this).closest(".shelf-item");
        const nameList = $(this)
          .closest(".main-shelf")
          .find("h2")
          .text();
        const clickedProduct = self.getProductByShelfItem(
          shelfItem,
          shelfItem.parent("li").index() + 1,
          nameList
        );

        self.handleDataLayerEventPush(
          "productClick",
          "click",
          {
            actionField: {
              list: clickedProduct.list
            },
            products: [clickedProduct]
          },
          () => (document.location = $(this).attr("href"))
        );
      }
    );
  },

  /**
   * Handler for product view.
   * It will use skuJson to retrieve current product information and push it to dataLayer
   */
  handleProductDetailView: function() {
    let item, product, lastPrice;

    if ($("#calculoFrete").length === 0) {
      item = skuJson.skus[0];
    } else {
      item = skuJson.skus.filter(
        sku => sku.sku == $("#calculoFrete").attr("skucorrente")
      );
      item = item[0];
    }

    if (!item.available) {
      setTimeout(() => {
        lastPrice = $(".last-price--value")
          .first()
          .text()
          .replace(/[^,\d]/g, "")
          .replace(",", "");

        product = this.getProductBySkuJson(item, lastPrice);

        this.handleDataLayerEventPush("productDetailView", "detail", {
          products: [product]
        });
      }, 2000);
    } else {
      product = this.getProductBySkuJson(item);
      this.handleDataLayerEventPush("productDetailView", "detail", {
        products: [product]
      });
    }
  },

  /**
   * Handler for observing item changes on orderform.
   * It will check if the user has added or removed an item from cart and will push it to dataLayer
   */
  handleCartItemChange: function() {
    const self = this;

    $(window).on("orderFormUpdated.vtex", (e, orderForm) => {
      const { items } = orderForm;
      const currentQuantity = items.length;

      window.previousQuantity =
        typeof window.previousQuantity !== typeof undefined
          ? window.previousQuantity
          : currentQuantity;
      window.previousItems =
        typeof window.previousItems !== typeof undefined
          ? window.previousItems
          : items;

      const { previousQuantity, previousItems } = window;

      if (currentQuantity != previousQuantity) {
        const hasAddedItem = currentQuantity > previousQuantity ? true : false;
        const item = hasAddedItem
          ? items[items.length - 1]
          : items.length
          ? items.map(currentItem => {
              return previousItems.find(item => item.id != currentItem.id);
            })
          : previousItems;

        window.previousQuantity = currentQuantity;
        window.previousItems = items;

        return hasAddedItem
          ? self.onAddCartItem(item)
          : self.onRemoveCartItem(item);
      }

      return true;
    });
  },

  /**
   * Handler that looks for promotions on the page
   * It will push the promotionView with promotions to dataLayer
   */
  handlePromotionView: function() {
    const self = this;
    let internalPromotions = {
      promos: [],
      count: 0
    };
    const promo_name = "utmi_pc"; //change to your query parameter if needed
    const promo_id = "utmi_cp"; //change to your query parameter if needed

    Array.prototype.slice
      .call(document.getElementsByTagName("a"))
      .forEach(function(element) {
        const href = element.getAttribute("href");
        if (
          href &&
          href.match(new RegExp(promo_name, "ig")) &&
          href.match(new RegExp(promo_id, "ig")) &&
          href.indexOf("Banner") != -1
        ) {
          internalPromotions.promos.push({
            name: self.getParameterByName(promo_name, href),
            id: self.getParameterByName(promo_id, href)
          });
        }
      });

    internalPromotions.count = internalPromotions.promos.length;

    if (internalPromotions.count > 0) {
      this.handleDataLayerEventPush("promotionView", "promoView", {
        promotions: internalPromotions.promos
      });
    }
  },

  /**
   * Handler for promotion clicks.
   * It checks if promotion query strings are present on the current URL parameters, and pushes promotionClick to dataLayer
   */
  handlePromotionClick: function() {
    const promo_name = "utmi_pc"; // query string parameter of promotion name
    const promo_id = "utmi_cp"; // query string parameter of promotion id

    if (
      this.getUrlQueryStringExists(promo_name) &&
      this.getUrlQueryStringExists(promo_id)
    ) {
      const promoClickData = {
        name: this.getParameterByName(promo_name),
        id: this.getParameterByName(promo_id)
      };

      this.handleDataLayerEventPush("promotionClick", "promoClick", {
        promotions: [promoClickData]
      });
    }
  },

  /**
   * Handler for observing changes on SKU selector
   * It will push a productDetailView event to datalayer with the new selected SKU
   */
  handleProductSkuChange: function() {
    const self = this;
    const categories = this.getProductPageCategories();

    $(".sku-selector-container input, .sku-selector-container select").change(
      function() {
        const skuId = self.getParameterByName(
          "sku",
          $(".buy-button-ref").attr("href")
        );

        if (!skuId) return true;
        const item = skuJson.skus.filter(sku => sku.sku == skuId);
        
        const brandName =
          dataLayer[0] !== undefined ? dataLayer[0].productBrandName : [];
        const pageDepartment =
          dataLayer[0] !== undefined ? dataLayer[0].pageDepartment : [];

        if (!item.length) return true;
        const productFields = self.pick(
          item[0],
          "available",
          "sku",
          "skuname",
          "bestPrice",
          "skuname",
          "dimensions"
        );
        const { available, bestPrice: price, skuname: variant, dimensions } = item;
        
        let lastPrice;
        if(!available) {
          lastPrice = $(".last-price--value")
          .first()
          .text()
          .replace(/[^,\d]/g, "")
          .replace(",", "");
        }

        const product = {
          name: skuJson.name,
          id: productFields.sku,
          brand: brandName,
          price: (!available) ? lastPrice /100 : price / 100,
          category: pageDepartment,
          variant: productFields.dimensions.Cor,
          dimension6: available ? "Produto available" : "Product Unavailable",
          dimension7: categories
        };

        self.handleDataLayerEventPush("productDetailView", "detail", {
          products: [product]
        });
      }
    );
  },

  /**
   * Handler for getting full category path by bread crumbs
   *
   * @returns {String} The category path
   */
  getProductPageCategories: () => {
    let categories = "";
    $(".bread-crumb li:not(:first-child)").each(function(i, e) {
      const breadCrumbText = $(this).text();
      if (i + 1 !== $(".bread-crumb li:not(:first-child)").length) {
        categories += breadCrumbText + " > ";
        return true;
      }

      categories += breadCrumbText;
    });

    return categories;
  },

  /**
   * Handler for pushing global variables into datalayer
   */
  handleGlobalVariables: function() {
    let user = {};
    const visitor = dataLayer.filter(e => e.visitorContactInfo);

    if (visitor.length) {
      const {
        visitorId: user_id,
        visitorExistingCustomer: returning,
        visitorContactInfo
      } = visitor[0];

      user = {
        name: visitorContactInfo[1],
        user_id,
        email: visitorContactInfo[0],
        language: "pt-br",
        returning
      };
    }

    const breadcrumb = [];
    $(".bread-crumb li").each(function() {
      breadcrumb.push(
        $(this)
          .find("a")
          .html()
      );
    });

    const page = {
      type: document.title,
      breadcrumb,
      environment: "production"
    };

    dataLayer.push({
      user,
      page,
      event: "virtualPageview"
    });
  },

  /**
   * Receives an item, pick selected fields and pushes an addToCart event to dataLayer
   *
   * @param {Object} item Item that has been added to cart
   */
  onAddCartItem: function(item) {
    let product = this.getProductByOrderFormItem(item);
    product["category"] = item.productCategories
      ? item.productCategories[Object.keys(item.productCategories)[0]]
      : "";

    this.handleDataLayerEventPush("addToCart", "add", {
      products: [product]
    });
  },

  /**
   * Receives items, pick selected fields and pushes a removeFromCart event to dataLayer
   *
   * @param {Array} items Items that were removed from cart
   */
  onRemoveCartItem: function(items) {
    const products = items.map(item => {
      let product = this.getProductByOrderFormItem(item);

      product["category"] = item.productCategories
        ? item.productCategories[Object.keys(item.productCategories)[0]]
        : "";
      return product;
    });

    this.handleDataLayerEventPush("removeFromCart", "remove", {
      products
    });
  },

  /**
   * Applies handlers related to listing pages
   */
  onAccessListPage: function() {
    this.handleProductImpressionsList(1);
    this.handleProductClick();
  },

  /**
   * Applies handlers related to landing pages
   */
  onAccessLandingPage: function() {
    this.handleProductImpressions();
    this.handleProductClick();
  },

  /**
   * Applies handlers related to product pages
   */
  onAccessProductPage: function() {
    this.handleProductDetailView();
    this.handleCartItemChange();
    this.handleProductSkuChange();
    this.handleProductImpressions();
    this.handleProductClick();
  },

  /**
   * Applies handlers for general (according to controller meta tag) pages
   */
  onAccessGeneralPages: function() {
    // this.handleProductImpressions()
    // this.handleProductClick()
    // this.handlePromotionView()
    // this.handlePromotionClick()
    // this.handleGlobalVariables()
  },

  /**
   * Use skuJson from product's page to retrieve product information
   *
   * @returns {Object} The product information object
   */
  getProductBySkuJson: function(item, lastPrice) {
    const categories = this.getProductPageCategories();

    const brandName =
      dataLayer[0] !== undefined ? dataLayer[0].productBrandName : [];
    const pageDepartment =
      dataLayer[0] !== undefined ? dataLayer[0].pageDepartment : [];
    const { name, productId: id } = skuJson;
    const { available, bestPrice: price, skuname: variant, dimensions } = item;

    return {
      name,
      id,
      price: !available ? lastPrice / 100 : price / 100,
      brand: brandName,
      category: pageDepartment,
      variant: dimensions.Cor,
      dimension6: available ? "Produto available" : "Product Unavailable",
      dimension7: categories
    };
  },

  /**
   * Use a shelf-item element from listing page to retrieve product's information
   *
   * @param {Object} shelfItem The shelf-item element containing product's information
   * @param {Int} position The item index position
   * @returns {Object} The product information object
   */
  getProductByShelfItem: (shelfItem, position, nameColection) => {
    return {
      name: shelfItem.find(".shelf-item__title a").html(),
      id: shelfItem.data("product-id"),
      price: shelfItem
        .find(".shelf-item__best-price")
        .html()
        .replace(/[^,\d]/g, "")
        .replace(/,/g, "."),
      brand: shelfItem.data("product-brand"),
      category:
        shelfItem.data("product-department") +
        " > " +
        shelfItem.data("product-category"),
      list: nameColection !== undefined ? nameColection : document.title,
      position
    };
  },

  /**
   * Receives an item from orderForm and returns only necessary informations
   *
   * @param {Object} item The item from orderForm
   * @returns {Object} The item with just selected fields
   */
  getProductByOrderFormItem: function(item) {
    const product = this.pick(
      item,
      "id",
      "name",
      "price",
      "quantity",
      "skuName"
    );
    product.variant = product.skuName;
    product.price = product.price / 100;
    delete product.skuName;

    return product;
  },

  /**
   * Check if a field exists on the current URL
   *
   * @param {String} field The field to search for
   * @returns {Boolean}
   */
  getUrlQueryStringExists: field => {
    const { href } = window.location;
    return (
      href.indexOf("?" + field + "=") != -1 ||
      href.indexOf("&" + field + "=") != -1
    );
  },

  /**
   * Returns a query string value if it exists
   *
   * @param {String} name The name of the query string to search for
   * @param {String} url The current URL
   *
   * @returns {NULL|String} The value of the query string
   */
  getParameterByName: (name, url = window.location.href) => {
    const regex = new RegExp(
      "[?&]" + name.replace(/[\[\]]/gi, "\\$&") + "(=([^&#]*)|&|#|$)"
    );
    const results = regex.exec(url);
    return !results || !results[2]
      ? null
      : decodeURIComponent(results[2].replace(/\+/gi, " "));
  },

  /**
   * Push content to dataLayer according to params
   *
   * @param {String} event Name of the event to push
   * @param {String} action Action name to be sent (will create a key on the ecommerce object)
   * @param {Array|Object} content The content to be sent inside the action
   * @param {Function} eventCallback Function that will be the callback for the dataLayer push
   */
  handleDataLayerEventPush: (
    event = "gtm.dom",
    action,
    content,
    eventCallback = null
  ) => {
    dataLayer.push({
      event,
      ecommerce: {
        currencyCode: "BRL",
        [action]: content
      },
      eventCallback
    });
  }
});
