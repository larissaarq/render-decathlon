/*
 * VTEX Buy List
 * Created By Rafael Cruz
 * Contact: rafaeldriveme@gmail.com
 * Version: 1.0.1
 * Release: 2018-30-04
 */

(function($) {
  window.memory_lists = [];
  window.has_error_lists = false;
  window.skuIdCurrent = "";
  window.skusSelectedsToCart = [];
  window.sku_seller = 1;

  var helpers = {
    getParams: function(name, href) {
      if (!name) return;
      href = href || window.location.href;
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(href);
      if (results === null) return "";
      else return decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    formatMoney: function(number, decimals, dec_point, thousands_sep, symbol) {
      if (
        number === undefined ||
        !decimals ||
        !dec_point ||
        !thousands_sep ||
        !symbol
      )
        return;

      number = (number + "").replace(",", "").replace(" ", "");

      var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = typeof thousands_sep === "undefined" ? "," : thousands_sep,
        dec = typeof dec_point === "undefined" ? "." : dec_point,
        s = "",
        toFixedFix = function(n, prec) {
          var k = Math.pow(10, prec);
          return "" + Math.round(n * k) / k;
        };
      // Fix for IE parseFloat(0.55).toFixed(0) = 0;
      s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
      if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
      }
      if ((s[1] || "").length < prec) {
        s[1] = s[1] || "";
        s[1] += new Array(prec - s[1].length + 1).join("0");
      }

      return symbol + " " + s.join(dec);
    },
    setCookie: function(name, value, times, path, domain) {
      if (!name || !value || !times) return;

      value = encodeURI(value);
      path = path || "/";

      var d = new Date();

      d.setTime(d.getTime() + times * 1000 * 60 * 60);

      var expires = "expires=" + d.toGMTString();
      path = domain ? "path=" + path : "";
      domain = domain ? "domain=" + domain : "";

      document.cookie =
        name + "=" + value + ";" + expires + ";" + path + ";" + domain;
      return true;
    },
    getCookie: function(name) {
      if (!name) return;
      name += "=";
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1);
        if (c.indexOf(name) != -1)
          return decodeURI(c.substring(name.length, c.length));
      }
      return "";
    },
    deleteCookie: function(sKey, sPath, sDomain) {
      if (!helpers.getCookie(sKey)) return;

      document.cookie =
        encodeURIComponent(sKey) +
        "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" +
        (sDomain ? "; domain=" + sDomain : "") +
        (sPath ? "; path=" + sPath : "");

      return true;
    }
  };

  var masterData = {
    select: function(storoname, idEnt, prefix, callback) {
      if (!storoname || !prefix || !idEnt) return;

      $.ajax({
        url: "/api/dataentities/LP/documents/" + idEnt + "?_fields=id,lists",
        type: "GET",
        headers: {
          Accept: "application/vnd.vtex.ds.v10+json",
          "Content-Type": "application/json"
        },
        success: function(data, textStatus, request) {
          if (callback) {
            if (data) {
              callback(JSON.parse(data.lists), textStatus, request);
            } else {
              callback([], textStatus, request);
            }
          }
        },
        error: function(error) {
          if (callback) {
            callback(false, error);
          }
        }
      });
    },

    save: function(storoname, prefix, data_obj, callback) {
      if (!storoname || !prefix || !data_obj) return;

      data_obj.lists = JSON.stringify(data_obj.lists);

      $.ajax({
        url: "/api/dataentities/LP/documents",
        type: "PATCH",
        data: JSON.stringify(data_obj),
        headers: {
          Accept: "application/vnd.vtex.ds.v10+json",
          "Content-Type": "application/json"
        },
        success: function(data, textStatus, request) {
          if (callback) {
            callback(
              data || textStatus == "notmodified",
              JSON.parse(data_obj.lists),
              textStatus,
              request
            );
          }
        },
        error: function(error, textStatus, request) {
          if (callback) {
            callback(false, error, textStatus, request);
          }
        }
      });
    }
  };

  var buylist = {
    el_modal_title: ".bl-modal-title",
    el_modal_body: ".bl-modal__body",
    el_modal_footer: ".bl-modal__footer",
    el_modal_list: ".bl-modal__list",
    el_total_items: ".bl-items__total-price span",
    el_product: ".bl-modal__product",
    id_ent_public_list: "555c43ff-c97c-43a8-8bfc-123456789",
    config: {},
    loadingShowModal: function() {
      this.loadingShow(".bl-modal__dialog");
    },
    loadingHideModal: function() {
      this.loadingHide(".bl-modal__dialog");
    },
    loadingShow: function(element) {
      if (!element) return;

      $(element).addClass("bl-loading");
    },
    loadingHide: function(element) {
      if (!element) return;

      $(element).removeClass("bl-loading");
    },
    getVisitorId: function() {
      var dataLayer = window.dataLayer;

      var visitor = dataLayer.filter(function(item) {
        if (item.visitorId) return item;
      });

      if (visitor.length) {
        return visitor[0].visitorId;
      }

      return null;
    },
    defineIdEnt: function() {
      if (
        (($("body").hasClass("listas") || $("body").hasClass("lista")) &&
          window.type == "public") ||
        window.mode == "admin"
      ) {
        return this.id_ent_public_list;
      } else {
        return (
          window.vtexjs.checkout.orderForm.userProfileId || this.getVisitorId()
        );
      }
    },
    formMessage: function(msg) {
      if (!msg) {
        $(".form-msg").html("");

        if ($(".bl-form").length) $(".bl-form")[0].reset();

        return;
      }

      $(".form-msg").html(msg);

      if ($(".bl-form").length) $(".bl-form")[0].reset();
    },
    spaceMessage: function(msg) {
      if (!msg) {
        $(".bl-space-msg").html("");

        return;
      }

      $(".bl-space-msg").html(msg);
    },
    managerListsHTML: function() {
      return (
        '<div class="bl-content__lists-manager">' +
        '<div class="bl-lists-manager__header"></div>' +
        '<div class="bl-lists-manager__body"></div>' +
        "</div>" +
        "<div/>"
      );
    },
    isWishlist: function() {
      return this.config.wishlist;
    },
    listItemManager: function(list, index) {
      if (!list) return;

      if (window.type == "public") {
        return (
          '<li name="teste" class="bl-list__item">' +
          '<div class="bl-item__title">' +
          list.namelist +
          "</div>" +
          '<div class="bl-item__items"><strong>(' +
          list.skus.length +
          ") produtos</strong></div>" +
          '<div class="bl-item__actions">' +
          '<a title="Ver items da lista" href="/_secure/account/wishlist/?listindex=' +
          index +
          '&type=public" class="bl-btn-view-items-list"><i class="fa fa-eye" aria-hidden="true"></i></a>' +
          "</div>" +
          "</li>"
        );
      } else {
        if (!this.isWishlist()) {
          return (
            '<li name="teste" class="bl-list__item">' +
            '<div class="bl-item__title">' +
            list.namelist +
            "</div>" +
            '<div class="bl-item__items"><strong>(' +
            list.skus.length +
            ") produtos</strong></div>" +
            '<div class="bl-item__actions">' +
            '<a title="Ver itens da lista" href="/_secure/account/wishlist/?listindex=' +
            index +
            '" class="bl-btn-view-items-list"><i class="fa fa-eye" aria-hidden="true"></i></a>' +
            '<a rel="' +
            index +
            '" title="Editar a lista" href="" class="bl-btn-edit-list"><i class="fa fa-pencil" aria-hidden="true"></i></a></div></li>"'
          );
        } else {
          return (
            '<li name="teste" class="bl-list__item">' +
            '<div class="bl-item__title">' +
            list.namelist +
            "</div>" +
            '<div class="bl-item__items"><strong>(' +
            list.skus.length +
            ") produtos</strong></div>" +
            '<div class="bl-item__actions">' +
            '<a title="Ver itens da lista" href="/_secure/account/wishlist/?listindex=' +
            index +
            '" class="bl-btn-view-items-list"><i class="fa fa-eye" aria-hidden="true"></i></a>' +
            "</div>" +
            "</li>"
          );
        }
      }
    },
    buildImage: function(image, w, h) {
      if (!image || !w || !h) return;

      return image
        .replace(/\#width#/g, w)
        .replace(/\#height#/g, h)
        .replace("~", "");
    },
    trItemManager: function(sku, index) {
      var sku_id = sku.items[0].itemId;
      var image = this.buildImage(sku.items[0].images[0].imageTag, 150, 150);
      var price =
        sku.items[0].sellers[0].commertialOffer.Price *
        sku.items[0].unitMultiplier;
      var stock = sku.items[0].sellers[0].commertialOffer.AvailableQuantity;
      var format_price = "";

      if (stock) {
        format_price = helpers.formatMoney(price, 2, ",", ".", "R$");
      } else {
        format_price = "Fora do estoque";
      }

      return `
      <li class="bl-item__product-item stock-${stock}" data-sku="${index}" data-skuid="${sku_id}" data-price="${price}">
        <div class="shelf-item shelf-item--initialized">
          <a rel="${index}" data-sku="${index}" class="bl-product-remove">
            <i class="fa fa-times" aria-hidden="true"></i>
          </a>
          <div class="shelf-item__img">
            <a href="${sku.link}" class="shelf-item__img-link" title="${sku.productName}">
              <div class="shelf-item__image">
                ${image}
              </div>
            </a>
          </div>
          <div class="shelf-item__info">
            <a href="${sku.link}" class="shelf-item__buy-info">
              <div class="shelf-item__price">
                  <div class="shelf-item__list-price"></div>
                  <div class="shelf-item__best-price shelf-item__best-price--featured">
                    ${format_price}
                  </div>
                </div>
            </a>
            <h3 class="shelf-item__title">
              <a title="${sku.productName}" href="${sku.link}" class="shelf-item__title-link">${sku.productName}</a>
            </h3>
          </div>
        </div>
      </li>`;

      // return `<tr class="bl-item__product-item stock-${stock}" data-sku="${index}" data-skuid="${sku_id}" data-price="${price}">
      //       <td>${image}</td>
      //       <td>
      //         <span class="bl-product-name">
      //           <a href="${sku.link}">${sku.productName}</a>
      //         </span>
      //         <span>${format_price}</span>
      //       </td>
      //       <td>
      //         <a rel="${index}" data-sku="92177" class="bl-product-remove">
      //           <i class="fa fa-trash-o" aria-hidden="true"></i>
      //         </a>
      //       </td>
      //     </tr>`;
    },

    insertFormCreateList: function() {
      var html =
        '<form class="bl-form" id="bl-form-create-list">' +
        '<input type="text" class="bl-form__namelist" placeholder="Digite o nome da sua lista" maxlength="30" required="required" />' +
        '<button class="bl-modal__btn">OK</button>' +
        '<div class="form-msg"></div>' +
        "</form>";

      $(this.el_modal_body).html(html);
    },
    insertFormCreateListSecondary: function() {
      var html =
        '<form class="bl-form" id="bl-form-create-list-secondary">' +
        '<input type="text" class="bl-form__namelist" placeholder="Crie uma nova lista" maxlength="30" required="required" />' +
        '<button class="bl-modal__btn">OK</button>' +
        '<div class="form-msg"></div>' +
        "</form>";

      $(this.el_modal_body).html(html);
    },
    insertFormEditList: function(list, index) {
      var html =
        '<form class="bl-form" id="bl-form-edit-list">' +
        '<input class="bl-form__index" type="hidden" value="' +
        index +
        '" />' +
        '<input type="text" class="bl-form__namelist" placeholder="Digite o nome da sua lista" maxlength="30" required="required" value="' +
        list.namelist +
        '" />' +
        '<button class="bl-modal__btn">OK</button>' +
        '<div class="form-msg"></div>' +
        "</form>";

      $(this.el_modal_body).html(html);
    },

    listItem: function(list, index) {
      if (!list) return;

      var sku = this.getSkuInsideList(index);
      var checked = sku.length ? 'checked="checked"' : "";
      var value_quantity = checked ? sku[0].quantity : 1;

      return (
        '<li rel="' +
        index +
        '" name="teste" class="bl-list__item">' +
        '<input name="bl-list__checkbox-' +
        index +
        '" value="' +
        index +
        '" id="bl-list__checkbox-' +
        index +
        '" type="checkbox" id="bl-list__checkbox" class="bl-list__checkbox" ' +
        checked +
        ">" +
        '<label for="bl-list__checkbox-' +
        index +
        '" class="bl-item__name">' +
        list.namelist +
        "<span>" +
        list.skus.length +
        " produto(s)</span></label>" +
        '<div class="bl-item__qty">' +
        '<a class="bl-item__plus">+</a>' +
        '<a class="bl-item__minus">-</a>' +
        '<input type="text" class="bl-item__add-qty" value="' +
        value_quantity +
        '" />' +
        "</div>" +
        "</li>"
      );
    },
    msgHTMLNotHaveLists: function() {
      return '<div class="bl-msg">Não foi encontrada nenhuma lista.</div>';
    },
    msgHTMLNotHaveProductsInList: function() {
      return '<div class="bl-msg">Não foram encontrados produtos nesta lista.</div>';
    },
    msgHTMLSaveList: function() {
      return '<div class="bl-msg bl-msg--success"><i class="fa fa-check-circle" aria-hidden="true"></i> Lista salva com sucesso</div>';
    },
    appendManagerListsHTML: function() {
      if ($("#bl-content, #bl-list-manager").length)
        $("#bl-content, #bl-list-manager").html(this.managerListsHTML());
    },
    titleManagerListsHTML: function(html) {
      if (!html) return;

      $(".bl-lists-manager__header").html(html);
    },
    ulManagerListsHtml: function() {
      $(".bl-lists-manager__body").html(this.listHtml());
    },

    tableManagerListsHtml: function() {
      $(".bl-lists-manager__body").html(this.tableHtml());
    },

    insertTitleCreateList: function(msg) {
      if (!msg) return;

      $(this.el_modal_title).html(msg);
    },
    insertTitleEditList: function() {
      $(this.el_modal_title).html("Editar lista");
    },

    createListControl: function() {
      this.insertTitleCreateList(
        '<i class="fa fa-plus-circle" aria-hidden="true"></i> Criar lista'
      );
      this.insertFormCreateList();
    },

    createListControlSecondary: function() {
      this.insertTitleCreateList(
        '<i class="fa fa-plus-circle" aria-hidden="true"></i> Adicionar produto a lista'
      );
      this.insertFormCreateListSecondary();
    },

    createListControlAddProductToList: function() {
      this.insertTitleCreateList(
        '<i class="fa fa-check-circle" aria-hidden="true"></i> Produto adicionado a lista'
      );

      $(this.el_modal_body).html("");
      $(this.el_modal_footer).html("");
      $(this.el_modal_list).html("");
    },

    openModalProductAddedToList: function() {
      this.createListControlAddProductToList();
    },

    editListControl: function(index) {
      this.insertTitleEditList();
      this.insertFormEditList(window.memory_lists[index], index);
    },

    listHtml: function() {
      return '<p>Adicione esse produto nas listas abaixo</p><ul class="bl-list"></ul>';
    },

    tableHtml: function() {
      if (window.type == "public") {
        return `
        <ul class="bl-table"></ul>
        <nav class="bl-items__footer">
          <a class="bl-item__copy-list bl-btn-default">
            <i class="fa fa-clipboard" aria-hidden="true"></i> Copiar lista
          </a>
        </nav>
        <div class="bl-space-msg"></div>
        <p>
          <center>
            <a href="javascript:history.back()" class="bl-btn-default">
              <i class="fa fa-chevron-circle-left" aria-hidden="true"></i> Voltar
            </a>
          </center>
        </p>`;
      } else {
        return `
        <ul class="bl-table"></ul>
        <nav class="bl-items__footer">
          <a class="bl-item__save bl-btn-default">
            <i class="fa fa-save" aria-hidden="true"></i> Salvar alterações
          </a>
        </nav>
        <div class="bl-space-msg"></div>
        <p>
          <center>
            <a href="javascript:history.back()" class="bl-btn-default">
              <i class="fa fa-chevron-circle-left" aria-hidden="true"></i> Voltar
            </a>
          </center>
        </p>`;
      }
    },

    btnSaveInMondal: function() {
      $(this.el_modal_footer).html(
        '<div><button id="bl-btn-save-product-in-list" class="bl-modal__btn bl-disabled bl-modal__btn--full"><i class="fa fa-floppy-o" aria-hidden="true"></i> Salvar produtro na lista</button></div><div class="bl-space-msg"></div>'
      );
    },

    getSkuInsideList: function(list_index) {
      var list = window.memory_lists[list_index];

      return list.skus.filter(function(sku) {
        if (sku.id == window.skuIdCurrent) return sku;
      });
    },

    controlItemList: function(lists) {
      lists = typeof lists == "object" ? lists : [];

      window.memory_lists = lists;

      $(this.el_modal_list).html(this.listHtml());

      var html = "";
      var _this = this;

      lists.forEach(function(list, index) {
        html += _this.listItem(list, index);
      });

      if (!html) {
        html = this.msgHTMLNotHaveLists();
        $(".bl-list").html(html);

        return false;
      }

      $(".bl-list").html(html);
      _this.btnSaveInMondal();

      return true;
    },

    controlItemListManager: function(lists, type) {
      lists = typeof lists == "object" ? lists : [];

      window.memory_lists = lists;

      this.ulManagerListsHtml();

      var html = "";
      var _this = this;

      lists.forEach(function(list, index) {
        html += _this.listItemManager(list, index);
      });

      if (!html) {
        html = this.msgHTMLNotHaveLists();
      }

      if (window.type != "public" && window.mode != "admin") {
        this.titleManagerListsHTML(
          "Minhas listas <span>Total de lista encontradas (" +
            lists.length +
            ")</span>"
        );
      } else {
        this.titleManagerListsHTML(
          "Listas prontas <span>Total de lista encontradas (" +
            lists.length +
            ")</span>"
        );
      }

      $(".bl-list").html(html);
    },

    quantityPagination: function(skus) {
      if (!skus) return;

      var products_per_page = 50;

      return parseInt(
        skus.length > products_per_page
          ? Math.ceil(skus.length / products_per_page)
          : 1
      );
    },

    defineSkuToSearchAndPagination: function(skus, index) {
      if (!skus) return;

      var fq = "";
      var TO_MAX = 49;
      var end_pagination = parseInt(
        index == 1 ? TO_MAX : TO_MAX * index + (index - 1)
      );
      var start_pagination = parseInt(index == 1 ? 0 : end_pagination - TO_MAX);
      index--;

      for (var c = start_pagination; c <= end_pagination; c++) {
        if (!skus[c]) {
          break;
        }

        fq += "&fq=skuId:" + skus[c].id;
      }

      return {
        fq: fq.substring(4)
      };
    },

    recursiveJoinSkus: function(
      skus,
      callback,
      index,
      product_concat,
      quantity_total_loop
    ) {
      if (index > quantity_total_loop) {
        callback(product_concat);
        return;
      }

      var pagination = this.defineSkuToSearchAndPagination(skus, index);
      var _self = this;

      index++;

      $.get(
        "/api/catalog_system/pub/products/search?fq=" +
          pagination.fq +
          "&_from=0&_to=49",
        function(response) {
          product_concat = product_concat.concat(response);
          _self.recursiveJoinSkus(
            skus,
            callback,
            index,
            product_concat,
            quantity_total_loop
          );
        }
      );
    },

    getProducts: function(skus, callback) {
      var quantity_total_loop = this.quantityPagination(skus);

      this.recursiveJoinSkus(
        skus,
        function(response) {
          if (response && response.length) {
            callback(response);
          } else {
            callback([]);
          }
        },
        1,
        [],
        quantity_total_loop
      );
    },

    controlProductsList: function(lists, listindex, callback) {
      lists = typeof lists == "object" ? lists : [];

      this.loadingShow(".bl-content__lists-manager");

      window.memory_lists = lists;

      var current_list = window.memory_lists[listindex];
      var cb = typeof callback == "function";

      if (!current_list) {
        window.location = "/listas";
      }

      var skus = current_list.skus;
      var html = "";

      if (skus.length) {
        var _this = this;

        this.getProducts(skus, function(response) {
          if (response && response.length) {
            _this.tableManagerListsHtml();

            response.forEach(function(sku, index) {
              html += _this.trItemManager(sku, index);
            });

            var diference = skus.length - response.length;
            var text_deference = diference
              ? " <b> e " + diference + " produto(s) inativo(s)</b>"
              : "";

            _this.titleManagerListsHTML(
              current_list.namelist +
                " <span>Produtos na sua lista (" +
                response.length +
                ")" +
                text_deference +
                "</span> "
            );

            $(".bl-table").html(html);
            $(".bl-table").removeClass("not-products");

            if (cb) callback(true);
          } else {
            if (!html) {
              html = _this.msgHTMLNotHaveProductsInList();
            }

            var text_deference =
              " <b> e " + skus.length + " produto(s) inativo(s)</b>";

            _this.titleManagerListsHTML(
              current_list.namelist +
                " <span>Produtos na sua lista (" +
                response.length +
                ")" +
                text_deference +
                "</span>"
            );

            $(".bl-lists-manager__body").html(html);
            $(".bl-lists-manager__body").addClass("not-products");

            if (cb) callback(true);
          }

          _this.loadingHide(".bl-content__lists-manager");
        });
      } else {
        if (!html) {
          html = this.msgHTMLNotHaveProductsInList();
        }

        this.titleManagerListsHTML(
          current_list.namelist +
            " <span>Produtos na sua lista (" +
            skus.length +
            ")</span>"
        );

        $(".bl-lists-manager__body").html(html);
        $(".bl-lists-manager__body").addClass("not-products");

        if (cb) callback(true);

        this.loadingHide(".bl-content__lists-manager");
      }
    },

    controlManagerItemsOfList: function() {
      var _this = this;

      if (window.listindex === "") {
        window.location = "/listas";

        return;
      }

      this.getLists(this.defineIdEnt(), function(resp) {
        _this.controlProductsList(resp, window.listindex);
      });
    },

    screenCreateNewList: function() {
      this.createListControl();
    },

    screenCreateNewListSecondary: function() {
      this.createListControlSecondary();
    },

    screenEditList: function(index) {
      this.editListControl(index);
    },

    screenListItems: function() {
      var _this = this;

      this.loadingShow(".bl-modal__list");

      this.getLists(this.defineIdEnt(), function(resp) {
        _this.controlItemList(resp);
        _this.loadingHide(".bl-modal__list");
      });
    },

    insertSkuInfo: function(data) {
      if (!data || !data.length) return;

      data = data[0];
      window.sku_seller = data.SkuSellersInformation[0].SellerId;

      var has_stock = data.SkuSellersInformation[0].AvailableQuantity;
      var price = "";

      if (has_stock) {
        price =
          String(helpers.formatMoney(data.Price, 2, ",", ".", "R$")) +
          " a unidade";
      } else {
        price = "Fora do estoque";
      }

      var html =
        '<div class="bl-product__inner">' +
        '<div class="bl-product__image"><img alt="' +
        data.Name +
        '" src="' +
        data.Images[0][2].Path +
        '" /></div>' +
        '<div class="bl-product__title">' +
        data.Name +
        "</div>" +
        '<div class="bl-product__price">' +
        price +
        "</div>" +
        "</div>";

      $(this.el_product).html(html);
    },

    getProductSkuInfos: function() {
      var _this = this;

      $.get("/produto/sku/" + window.skuIdCurrent, function(resp) {
        _this.insertSkuInfo(_this.insertSkuInfo(resp));
      });
    },

    screenProductInTheList: function() {
      this.screenCreateNewListSecondary();
      this.getProductSkuInfos();
      this.screenListItems();
    },

    screenManagerMyLists: function() {
      if (!$("body").hasClass("listas")) {
        this.getLists(this.defineIdEnt(), function(lists) {
          if (lists) {
            window.memory_lists = lists;
          } else {
            window.has_error_lists = true;
          }
        });

        return;
      }

      var _this = this;

      this.getLists(this.defineIdEnt(), function(resp) {
        _this.controlItemListManager(resp, "my-lists");
      });
    },

    screenManagerItemsOfList: function() {
      if (!$("body").hasClass("lista")) return;

      this.controlManagerItemsOfList();
    },

    createObjectList: function(namelist, is_public) {
      return {
        namelist: namelist,
        is_public: is_public,
        active: true,
        skus: []
      };
    },

    getLists: function(idEnt, callback) {
      if (!idEnt) return;

      var _this = this;

      this.loadingShow(".bl-content__lists-manager");

      masterData.select(
        this.config.storename,
        idEnt,
        this.config.prefix,
        function(resp) {
          _this.loadingHide(".bl-content__lists-manager");
          callback(resp);
        }
      );
    },

    getListsOfMemoryObject: function(idEnt, type, lists) {
      if (!idEnt || !type || !lists) return;

      this.controlItemListManager(lists, type);
    },

    screenListCreatedHTML: function() {
      this.insertTitleCreateList("&nbsp;");

      var html =
        '<div class="bl-list-created">' +
        '<div class="bl-box-icons"><i class="fa fa-check-circle" aria-hidden="true"></i></div>' +
        '<div class="bl-list-created__inner"><div class="bl-list-created__title">Lista criada com sucesso!</div></div>' +
        '<div class="bl-list-created__actions"><a class="bl-btn-secondary bl-btn-screen-create-list"><i class="fa fa-plus-circle" aria-hidden="true"></i> Criar nova lista</a></div>' +
        "</div>";

      $(this.el_modal_body).html(html);
    },

    createNewList: function(namelist, is_public) {
      if (window.has_error_lists) {
        APP.i.flash_msg = new APP.component.FlashMsg();
        APP.i.flash_msg.showMsg(
          "Houve um erro, por favor tende novamente.",
          "error"
        );
        window.location.reload();
        return;
      }

      if (window.memory_lists.length && this.isWishlist()) return;

      this.loadingShowModal();
      this.formMessage();

      var data = {
        lists: window.memory_lists,
        id: this.defineIdEnt()
      };

      var _this = this;

      data.lists.unshift(this.createObjectList(namelist, is_public));

      masterData.save(this.config.storename, this.config.prefix, data, function(
        response,
        update_lists
      ) {
        if (response) {
          _this.screenListCreatedHTML();
        } else {
          _this.formMessage(
            '<span class="bl-msg-error"><i class="fa fa-times-circle" aria-hidden="true"></i> Houve um erro, por favor tende novamente!</span>'
          );
        }

        _this.loadingHideModal();
        _this.getListsOfMemoryObject(data.id, "my-lists", update_lists);
      });
    },

    createNewListSecondary: function(namelist, is_public) {
      if (window.has_error_lists) {
        APP.i.flash_msg = new APP.component.FlashMsg();
        APP.i.flash_msg.showMsg(
          "Houve um erro, por favor tende novamente!",
          "error"
        );
        window.location.reload();
        return;
      }

      this.loadingShowModal();
      this.formMessage();

      var data = {
        lists: window.memory_lists,
        id: this.defineIdEnt()
      };

      var _this = this;

      data.lists.unshift(this.createObjectList(namelist, is_public));

      masterData.save(this.config.storename, this.config.prefix, data, function(
        response,
        update_lists
      ) {
        if (response) {
          _this.formMessage(
            '<span class="bl-msg-success"><i class="fa fa-check-circle" aria-hidden="true"></i> Lista criada com sucesso!</span>'
          );
        } else {
          _this.formMessage(
            '<span class="bl-msg-error"><i class="fa fa-times-circle" aria-hidden="true"></i> Houve um erro, por favor tende novamente!</span>'
          );
        }

        _this.loadingHideModal();
        _this.controlItemList(update_lists);
      });
    },

    editList: function(new_namelist, index, is_public) {
      this.loadingShowModal();
      this.formMessage();

      window.memory_lists[index].namelist = new_namelist;
      window.memory_lists[index].is_public = is_public;

      var data = {
        lists: window.memory_lists,
        id: this.defineIdEnt()
      };

      var _this = this;

      _this.screenEditList(index);

      masterData.save(this.config.storename, this.config.prefix, data, function(
        response,
        update_lists
      ) {
        if (response) {
          _this.formMessage(
            '<span class="bl-msg-success"><i class="fa fa-check-circle" aria-hidden="true"></i> Lista editada com sucesso!</span>'
          );
        } else {
          _this.formMessage(
            '<span class="bl-msg-error"><i class="fa fa-times-circle" aria-hidden="true"></i> Houve um erro, por favor tende novamente!</span>'
          );
        }

        _this.loadingHideModal();
        _this.getListsOfMemoryObject(data.id, "my-lists", update_lists);
      });
    },

    createObjectSku: function(skuId, quantity) {
      if (!skuId || !quantity) return;

      quantity = quantity ? parseInt(quantity) : 1;

      return {
        id: parseInt(skuId),
        quantity: quantity,
        seller: parseInt(window.sku_seller)
      };
    },

    createObjectSkuSecondary: function(skuId, quantity, price) {
      if (!skuId || !quantity || !price) return;

      quantity = quantity ? parseInt(quantity) : 1;

      return {
        id: skuId,
        quantity: quantity,
        price: price,
        seller: parseInt(window.sku_seller)
      };
    },

    getIndexSkusByIdSku: function(skus, skuId) {
      if (!skus || !skus.length) return;

      var index = 0;

      for (var key in skus) {
        if (skus[key].id == skuId) {
          index = key;
          break;
        }
      }

      return index;
    },

    showOrHideButtonSaveProductsInList: function(list_index, is_delete) {
      is_delete = is_delete || false;

      if ($(".bl-list__item input:checked").length || is_delete) {
        $("#bl-btn-save-product-in-list").removeClass("bl-disabled");
      } else {
        $("#bl-btn-save-product-in-list").addClass("bl-disabled");
      }
    },

    addSkuInList: function(list_index, quantity) {
      if (this.getSkuInsideList(list_index).length) return;

      window.memory_lists[list_index].skus.unshift(
        this.createObjectSku(window.skuIdCurrent, quantity)
      );

      this.controlItemList(window.memory_lists);
      this.showOrHideButtonSaveProductsInList(list_index);
    },

    removeSkuInList: function(list_index, quantity) {
      var index_sku = this.getIndexSkusByIdSku(
        window.memory_lists[list_index].skus,
        window.skuIdCurrent
      );

      window.memory_lists[list_index].skus.splice(index_sku, 1);

      this.controlItemList(window.memory_lists);
      this.showOrHideButtonSaveProductsInList(list_index, true);
    },

    updateSkuInList: function(list_index, quantity) {
      var index_sku = this.getIndexSkusByIdSku(
        window.memory_lists[list_index].skus,
        window.skuIdCurrent
      );

      window.memory_lists[list_index].skus[index_sku].quantity = parseInt(
        quantity
      );

      this.controlItemList(window.memory_lists);
      this.showOrHideButtonSaveProductsInList(list_index);
    },

    saveSkuInList: function(is_removed) {
      this.spaceMessage();

      var _this = this;

      this.loadingShowModal();

      var data = {
        lists: window.memory_lists,
        id: this.defineIdEnt()
      };

      masterData.save(this.config.storename, this.config.prefix, data, function(
        response,
        update_lists
      ) {
        if (!response) {
          if (!_this.isWishlist()) {
            _this.spaceMessage(
              '<span class="bl-msg-error"><i class="fa fa-times-circle" aria-hidden="true"></i> Houve um erro, por favor tende novamente!</span>'
            );
          } else {
            APP.i.flash_msg = new APP.component.FlashMsg();
            APP.i.flash_msg.showMsg(
              "Houve um erro, por favor tende novamente!",
              "error"
            );
          }
        } else {
          if (!_this.isWishlist()) {
            _this.spaceMessage(
              '<span class="bl-msg-success"><i class="fa fa-check-circle" aria-hidden="true"></i> Salvo com sucesso!</span>'
            );
          } else {
            if (is_removed) {
              APP.i.flash_msg = new APP.component.FlashMsg();
              APP.i.flash_msg.showMsg(
                "Produto removido de favoritos",
                "success"
              );
              _this.removeClassOnProductsAddedInWishlist(window.skuIdCurrent);
            } else {
              APP.i.flash_msg = new APP.component.FlashMsg();
              APP.i.flash_msg.showMsg("Produto favoritado", "success");
              _this.openModalProductAddedToList();
              _this.addClassOnProductsAddedInWishlist(window.skuIdCurrent);
            }
          }
        }

        _this.loadingHideModal();
      });
    },

    atualDate: function() {
      var dNow = new Date();
      var localdate =
        dNow.getDate() +
        "/" +
        (dNow.getMonth() + 1) +
        "/" +
        dNow.getFullYear() +
        " " +
        dNow.getHours() +
        ":" +
        dNow.getMinutes();

      return localdate;
    },

    getOrderForm: function(fn) {
      vtexjs.checkout.getOrderForm().done(fn);
    },

    getItemsOfOrderForm: function(orderForm) {
      var items = orderForm.items.map(function(item) {
        return {
          id: item.id,
          quantity: item.quantity,
          seller: item.seller
        };
      });

      return items;
    },

    updatedMemoryLists: function(orderForm, name_list) {
      window.memory_lists.push({
        namelist: name_list,
        is_public: false,
        active: true,
        skus: this.getItemsOfOrderForm(orderForm)
      });

      return window.memory_lists;
    },

    saveSkusCartInList: function() {
      var _this = this;

      this.spaceMessage();
      this.loadingShowModal();

      var name_list = "Carrinho em " + this.atualDate();

      this.getOrderForm(function(orderForm) {
        var data = {
          lists: _this.updatedMemoryLists(orderForm, name_list),
          id: _this.defineIdEnt()
        };

        masterData.save(
          _this.config.storename,
          _this.config.prefix,
          data,
          function(response) {
            if (!response) {
              APP.i.flash_msg = new APP.component.FlashMsg();
              APP.i.flash_msg.showMsg(
                "Houve um erro, por favor tende novamente",
                "error"
              );
            } else {
              APP.i.flash_msg = new APP.component.FlashMsg();
              APP.i.flash_msg.showMsg(
                'A lista "' +
                  name_list +
                  '" com seus items do carrinho, foi criada com sucesso!',
                "success"
              );
            }
          }
        );
      });
    },
    showOrHideButtonAddToCart: function() {
      if (window.skusSelectedsToCart.length) {
        $("a.bl-item__buy").removeClass("bl-disabled");
      } else {
        $("a.bl-item__buy").addClass("bl-disabled");
      }
    },
    setProductToInsideInCart: function(skuId, quantity, price) {
      if (!skuId || !quantity || !price) return;

      window.skusSelectedsToCart.push(
        this.createObjectSkuSecondary(skuId, quantity, price)
      );
      var index_memory_list = this.getIndexOfSkus(
        skuId,
        window.memory_lists[window.listindex].skus
      );
      window.memory_lists[window.listindex].skus[
        index_memory_list
      ].quantity = parseInt(quantity);

      this.showOrHideButtonAddToCart();
    },
    removeProductToInsideInCart: function(skuId) {
      if (!skuId) return;

      var sku_index = this.getIndexOfSkus(skuId, window.skusSelectedsToCart);
      window.skusSelectedsToCart.splice(sku_index, 1);
    },
    updateQuantityProductToMemoryLists: function(skuId, quantity) {
      if (!quantity || !skuId) return;

      var sku_index = this.getIndexOfSkus(
        skuId,
        window.memory_lists[window.listindex].skus
      );

      window.memory_lists[window.listindex].skus[sku_index].quantity = parseInt(
        quantity
      );
    },
    updateQuantityProductToInsideInCart: function(skuId, quantity) {
      if (!quantity || !skuId) return;

      var sku_index = this.getIndexOfSkus(skuId, window.skusSelectedsToCart);

      window.skusSelectedsToCart[sku_index].quantity = parseInt(quantity);
      this.updateQuantityProductToMemoryLists(skuId, quantity);
    },
    deleteProductToMemoryLists: function(skuId, fn) {
      if (!skuId) return;

      var sku_index = this.getIndexOfSkus(
        skuId,
        window.memory_lists[window.listindex].skus
      );

      var cb = typeof fn == "function";

      window.memory_lists[window.listindex].skus.splice(sku_index, 1);

      this.controlProductsList(
        window.memory_lists,
        window.listindex,
        function() {
          if (cb) fn(true);
        }
      );
    },
    getIndexOfSkus: function(skuId, skus) {
      if (!skuId || !skus || !skus.length) return;

      var index = 0;

      skus.forEach(function(sku, key) {
        if (sku.id == skuId) index = key;
      });

      return index;
    },
    deleteProductToInsideInCart: function(skuId) {
      if (!skuId) return;

      var sku_index = this.getIndexOfSkus(skuId, window.skusSelectedsToCart);

      window.skusSelectedsToCart.splice(sku_index, 1);

      var _this = this;

      this.deleteProductToMemoryLists(skuId, function() {
        _this.showOrHideButtonAddToCart();
      });
    },
    clearItemNulls: function(skus) {
      return skus.filter(function(sku) {
        if (skus) return sku;
      });
    },
    addProductsInCart: function() {
      if (!window.skusSelectedsToCart.length) return;

      this.loadingShow("#bl-list-manager");

      var skus_to_cart = this.clearItemNulls(window.skusSelectedsToCart);

      window.vtexjs.checkout
        .addToCart(skus_to_cart, null, window.jssalesChannel)
        .done(function(orderForm) {
          window.location.href = "/checkout/#/cart";
        })
        .fail(function() {
          APP.i.flash_msg = new APP.component.FlashMsg();
          APP.i.flash_msg.showMsg(
            "Houve um erro, por favor tende novamente",
            "error"
          );
          this.loadingHide(".bl-content__lists-manager");
        });
    },
    saveListUpdated: function() {
      this.spaceMessage();

      var _this = this;
      var data = {
        lists: window.memory_lists,
        id: this.defineIdEnt()
      };

      masterData.save(this.config.storename, this.config.prefix, data, function(
        response
      ) {
        if (!response) {
          _this.spaceMessage(
            '<span class="bl-msg-error"><i class="fa fa-times-circle" aria-hidden="true"></i> Houve um erro, por favor tende novamente!</span>'
          );
        } else {
          _this.spaceMessage(
            '<span class="bl-msg-success"><i class="fa fa-check-circle" aria-hidden="true"></i> Salvo com sucesso!</span>'
          );
        }
      });
    },
    saveCopyList: function(my_list) {
      var list_to_copy = window.memory_lists[window.listindex];

      if (!list_to_copy) {
        APP.i.flash_msg = new APP.component.FlashMsg();
        APP.i.flash_msg.showMsg("Lista não encontrada!", "error");

        return;
      }

      my_list.unshift(list_to_copy);

      this.loadingShow(".bl-content__lists-manager");

      var data = {
        lists: my_list,
        id: window.vtexjs.checkout.orderForm.userProfileId
      };

      var _this = this;

      masterData.save(this.config.storename, this.config.prefix, data, function(
        response,
        update_lists
      ) {
        if (response) {
          _this.spaceMessage(
            `<span class="bl-msg-success">
              <i class="fa fa-check-circle" aria-hidden="true"></i> Lista copiada com sucesso!
            </span>`
          );
        } else {
          _this.spaceMessage(
            `<span class="bl-msg-error">
              <i class="fa fa-times-circle" aria-hidden="true"></i> Houve um erro, por favor tende novamente!
            </span>`
          );
        }

        _this.loadingHide(".bl-content__lists-manager");
      });
    },
    copyList: function() {
      var _this = this;

      this.getLists(window.vtexjs.checkout.orderForm.userProfileId, function(
        resp
      ) {
        _this.saveCopyList(resp);
      });
    },

    events: function() {
      var _this = this;

      // Abrir o modal de criar nova lista
      $("body").on(
        "click",
        "#bl-btn-create-list, .bl-btn-create-list",
        function(e) {
          e.preventDefault();

          _this.screenCreateNewList();
        }
      );

      // Abrir modal de editar lista
      $("body").on("click", ".bl-btn-edit-list", function(e) {
        e.preventDefault();

        var index = $(this).attr("rel");

        _this.screenEditList(index);
      });

      // Criar uma nova lista (manager)
      $("body").on("submit", "#bl-form-create-list", function(e) {
        e.preventDefault();

        var namelist = $(this)
          .find(".bl-form__namelist")
          .val();
        var is_public = window.mode == "admin";

        _this.createNewList(namelist, is_public);
      });

      // Criar uma nova lista no modal de adicionar o produto a lista
      $("body").on("submit", "#bl-form-create-list-secondary", function(e) {
        e.preventDefault();

        var namelist = $(this)
          .find(".bl-form__namelist")
          .val();
        var is_public = window.mode == "admin";

        _this.createNewListSecondary(namelist, is_public);
      });

      // Editar uma nova lista
      $("body").on("submit", "#bl-form-edit-list", function(e) {
        e.preventDefault();

        var namelist = $(this)
          .find(".bl-form__namelist")
          .val();
        var index = $(this)
          .find(".bl-form__index")
          .val();
        var is_public = window.mode == "admin";

        _this.editList(namelist, index, is_public);
      });

      // Abre o modal para adicionar ou remover o produto na lista
      $("body").on("click", ".bl-product-trigger", function(e) {
        e.preventDefault();

        var skuId = $(this).attr("rel");

        if (skuId) window.skuIdCurrent = skuId;

        if (!_this.isWishlist()) {
          _this.screenProductInTheList();
        } else {
          var list_index = 0;
          var quantity_product_in_list = 1;

          if (!$(this).hasClass("actived")) {
            // Adiciona a sku na lista
            _this.addSkuInList(list_index, quantity_product_in_list);
            _this.saveSkuInList();
          } else {
            // Remove a sku da lista
            _this.removeSkuInList(list_index);
            _this.saveSkuInList(true);
          }
        }
      });

      // Abre o modal para adicionar ou remover o produto na lista
      $("body").on("change", ".bl-list__item input[type=checkbox]", function() {
        var list_index = $(this).val();
        var quantity = $(this)
          .parents("li")
          .find(".bl-item__add-qty")
          .val();

        if ($(this).is(":checked")) {
          // Adiciona a sku na lista
          _this.addSkuInList(list_index, parseInt(quantity));
        } else {
          // Remove a sku da lista
          _this.removeSkuInList(list_index);
        }
      });

      // Alterador de quantidade (add produto na lista)
      $("body").on("click", ".bl-list__item .bl-item__plus", function(e) {
        e.preventDefault();

        var $parent = $(this).parents(".bl-item__qty");
        var $item = $(this).parents(".bl-list__item");
        var quantity = $parent.find("input").val();
        var new_quantity = parseInt(quantity) + 1;

        $parent.find("input").val(new_quantity);

        if ($item.find("input[type=checkbox]").is(":checked")) {
          var list_index = $item.find("input[type=checkbox]").val();

          _this.updateSkuInList(list_index, parseInt(new_quantity));
        }
      });

      $("body").on("click", ".bl-list__item .bl-item__minus", function(e) {
        e.preventDefault();

        var $parent = $(this).parents(".bl-item__qty");
        var $item = $(this).parents(".bl-list__item");
        var quantity = $parent.find("input").val();
        var new_quantity = parseInt(quantity) - 1;

        $parent.find("input").val(new_quantity <= 1 ? 1 : new_quantity);

        if ($item.find("input[type=checkbox]").is(":checked")) {
          var list_index = $item.find("input[type=checkbox]").val();

          _this.updateSkuInList(list_index, parseInt(new_quantity));
        }
      });

      // Salvar no MD os produtos adicionados a lista
      $("body").on(
        "click",
        "#bl-btn-save-product-in-list:not(.bl-disabled)",
        function(e) {
          e.preventDefault();

          _this.saveSkuInList();
        }
      );

      // Salvar produtos do carrinho em uma lista
      $("body").on(
        "click",
        ".bl-btn-save-cart-in-list:not(.bl-disabled)",
        function(e) {
          e.preventDefault();

          _this.saveSkusCartInList();
        }
      );

      // Escolha do produto da lista
      $("body").on(
        "change",
        ".bl-item__product-item input[type=checkbox]",
        function() {
          var sku_index = $(this).val();
          var skuId = $(this)
            .parents("tr")
            .data("skuid");
          var quantity = $(this)
            .parents("tr")
            .find(".bl-item__add-qty")
            .val();
          var price = $(this)
            .parents("tr")
            .data("price");

          if ($(this).is(":checked")) {
            // Adiciona a sku na lista
            _this.setProductToInsideInCart(skuId, quantity, price);
          } else {
            // Remove a sku da lista
            _this.removeProductToInsideInCart(skuId);
          }
        }
      );

      // Alterador de quantidade (Produto na lista)
      $("body").on("click", ".bl-item__product-item .bl-item__plus", function(
        e
      ) {
        e.preventDefault();

        var $parent = $(this).parents(".bl-item__qty");
        var $item = $(this).parents(".bl-item__product-item");
        var quantity = $parent.find("input").val();
        var new_quantity = parseInt(quantity) + 1;
        var skuId = $(this)
          .parents("tr")
          .data("skuid");

        $parent.find("input").val(new_quantity);

        if ($item.find("input[type=checkbox]").is(":checked")) {
          _this.updateQuantityProductToInsideInCart(
            skuId,
            parseInt(new_quantity)
          );
        } else {
          _this.updateQuantityProductToMemoryLists(
            skuId,
            parseInt(new_quantity)
          );
        }
      });

      $("body").on("click", ".bl-item__product-item .bl-item__minus", function(
        e
      ) {
        e.preventDefault();

        var $parent = $(this).parents(".bl-item__qty");
        var $item = $(this).parents(".bl-item__product-item");
        var quantity = $parent.find("input").val();
        var new_quantity = parseInt(quantity) - 1;
        var skuId = $(this)
          .parents("tr")
          .data("skuid");

        $parent.find("input").val(new_quantity <= 1 ? 1 : new_quantity);

        if ($item.find("input[type=checkbox]").is(":checked")) {
          _this.updateQuantityProductToInsideInCart(
            skuId,
            parseInt(new_quantity)
          );
        } else {
          _this.updateQuantityProductToMemoryLists(
            skuId,
            parseInt(new_quantity)
          );
        }
      });

      // Ação de excluir o produto da lista
      $("body").on(
        "click",
        ".bl-item__product-item .bl-product-remove",
        function(e) {
          e.preventDefault();

          var confirm = window.confirm(
            "Quer mesmo excluir este produto da lista?"
          );

          if (!confirm) return;

          var $item = $(this).parents(".bl-item__product-item");
          var skuId = $(this)
            .parents("li")
            .data("skuid");

            console.log(skuId)

          if ($item.find("input[type=checkbox]").is(":checked")) {
            _this.deleteProductToInsideInCart(skuId);
          } else {
            _this.deleteProductToMemoryLists(skuId, function() {
              _this.saveSkuInList(true);
            });
          }
        }
      );

      // Adicionar produtos no carrinho
      $("body").on("click", "a.bl-item__buy:not(.bl-disabled)", function(e) {
        e.preventDefault();

        _this.addProductsInCart();
      });

      // Salvar produtos alterados na lista no MD
      $("body").on("click", "a.bl-item__save", function(e) {
        e.preventDefault();

        _this.saveListUpdated();
      });

      // Mensagem de confirmação da lista criada (Manager)
      $("body").on("click", ".bl-btn-screen-create-list", function(e) {
        e.preventDefault();

        _this.screenCreateNewList();
      });

      // Copiar uma lista publica
      $("body").on("click", ".bl-item__copy-list", function(e) {
        e.preventDefault();

        _this.copyList();
      });
    },

    isLogged: function(fn) {
      $.ajax({
        url: "/no-cache/profileSystem/getProfile",
        type: "GET",
        success: function(response, textStatus, request) {
          fn(response.IsUserDefined);
        },
        error: function(error) {
          fn(false, error);
        }
      });
    },

    destroyModeAdminCookie: function() {
      if (helpers.getCookie("adminmode") == "admin") {
        helpers.deleteCookie("adminmode", "/", window.location.host);

        window.location.href = "/listas";
      }
    },

    insertClassWishlistOnBody: function() {
      $("body").addClass("is_wishlist");
    },

    removeClassOnProductsAddedInWishlist: function(sku_id) {
      if (!sku_id) return;

      $(".prateleira.vitrine ul li div[item='" + sku_id + "']")
        .parents("li")
        .removeClass("in-wishlist");
      $(
        `.main-shelf ul li div.shelf-item div.shelf-item__hover a.bl-product-trigger[rel="${sku_id}"]`
      ).removeClass("shelf-item__favorite-button--active actived");
    },

    addClassOnProductsAddedInWishlist: function(sku_id) {
      if (
        !sku_id ||
        $(`.prateleira.vitrine ul li div[item="${sku_id}"]`)
          .parents("li")
          .hasClass("in-wishlist")
      ) {
        return;
      }

      $(`.prateleira.vitrine ul li div[item="${sku_id}"]`)
        .parents("li")
        .addClass("in-wishlist");

      $(
        `.main-shelf ul li div.shelf-item div.shelf-item__hover a.bl-product-trigger[rel="${sku_id}"]`
      ).addClass("shelf-item__favorite-button--active actived");
    },

    insertClassOnProductsAddedInWishlist: function() {
      var _this = this;

      window.memory_lists[0].skus.forEach(function(sku) {
        _this.addClassOnProductsAddedInWishlist(sku.id);
      });
    },

    initWishlist: function() {
      if (!this.isWishlist()) return;

      var _this = this;

      this.getLists(this.defineIdEnt(), function(lists) {
        if (lists) {
          window.memory_lists = lists;

          _this.insertClassWishlistOnBody();
          _this.createNewList("Favoritos", false);
          _this.insertClassOnProductsAddedInWishlist();
        }
      });
    },

    updatedWishlist: function() {
      if (!this.isWishlist()) {
        return;
      }

      var _this = this;

      this.getLists(this.defineIdEnt(), function(lists) {
        if (lists) {
          window.memory_lists = lists;
          _this.insertClassOnProductsAddedInWishlist();
        }
      });
    },

    eventTriggerWishlist: function() {
      var _this = this;

      $(document).on("updated_wishlist", function() {
        setTimeout(function() {
          _this.updatedWishlist();
        }, 500);
      });
    },

    _showLogin() {
      var _this = this;

      $("html, body").animate(
        {
          scrollTop: 0
        },
        "fast"
      );

      vtexid.start({
        returnUrl: window.document.location.href,
        userEmail: "",
        locale: "pt-BR",
        forceReload: false
      });

      _this.bindCheckBtnCreateAccount();
    },

    bindCheckBtnCreateAccount() {
      const intervalGetElement = setInterval(() => {
        let vtexUI = $("#vtexIdUI-decathlonstore");
        console.log("aquiiii");
        if (vtexUI.length > 0) {
          $("#vtexIdUI-decathlonstore").after(
            '<a href="/cadastro" id="btnDktLoginCreateAccount" class="btn btn-block gaClick" data-event-category="Login" data-event-action="Click Button" data-event-label="Criar minha conta">Criar minha conta</a>'
          );
          $(".login .vtexIdUI:not(.vtexid-icon-arrow-left)").height(
            $(".vtexIdUI-page-active").height() + 130
          );
          clearInterval(intervalGetElement);
        }
      }, 1000);
    },

    verificationLoggin() {
      $.ajax({
        url: "/no-cache/profileSystem/getProfile",
        type: "GET",
        success: function(response) {
          const fn = response.IsUserDefined;
          if (fn) {
            setTimeout(function() {
              window.location.reload();
            }, 500);
          }
        }
      });
    },

    init: function(parameters) {
      var _this = this;

      this.isLogged(function(isUserDefined) {
        if (isUserDefined) {
          _this.config = parameters;
          _this.events();
          _this.initWishlist();
          _this.appendManagerListsHTML();
          _this.screenManagerMyLists();
          _this.screenManagerItemsOfList();
        } else {
          $("body").on("click", ".bl-product-trigger", function() {
            _this._showLogin();

            let thisInterval = setInterval(() => {
              _this.verificationLoggin();
            }, 2500);

            $("body").on("click", ".vtexIdUI-close", function() {
              clearInterval(thisInterval);
            });
          });
        }
        _this.eventTriggerWishlist();
      });
    }
  };

  $.fn.buylist = function(parameters) {
    parameters = $.extend($.fn.buylist.parametersDefaults, parameters);

    // Index da lista
    window.listindex = helpers.getParams("listindex");

    // Tipo da lista (?type=public)
    window.type = helpers.getParams("type");

    setTimeout(function() {
      buylist.init(parameters);
    }, 500);
  };

  /* Propriedades default global */
  $.fn.buylist.parametersDefaults = {
    prefix: "LP",
    storename: "decathlonstore",
    wishlist: true
  };
})($);

var refProduct = {
  init: function() {
    $(".bl-product-trigger").attr("rel", skuJson.skus[0].sku);
  }
};

$(document).ready(function() {
  if ($("body").hasClass("produto")) {
    refProduct.init();
  }
});

$(window).load(function() {
  // Deixar a chamada dentro do getOrderForm(), para evitar erros de carregamento
  window.vtexjs.checkout.getOrderForm().done(function(orderForm) {
    $("body").buylist({
      prefix: "LP", // Entidade MasterData
      storename: "decathlonstore", // Host da loja,
      wishlist: true // Marque como "true" caso seja uma lista de produto favoritos, "false" caso seja uma lista de compras
    });
  });
});