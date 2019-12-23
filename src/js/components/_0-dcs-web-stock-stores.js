APP.component.StockStores = ClassAvanti.extend({
  init(options) {
    this.setup(options)
    this.bind()
  },

  setup(options) {
    this.$selectState = $('#states-navigation')
    this.allStores = []
    this.stocksData = []
    this.productData = []

    this.options = $.extend({
      helpers: APP.i.Helpers,
      stateIdCookie: Cookies.get('stateIdCookie'),
      currentState: null,
      $buttonStock: $('#btn-stock-modal'),
      stateList: [{"id":"851f6959-7582-11e8-81f2-8679c9df9bf9","name":"Espírito Santo"},{"id":"8a35e344-7582-11e8-81f2-80dafa1d3a04","name":"Goiás"},{"id":"a312d4a8-7582-11e8-81f2-80dafa1d3a04","name":"Minas Gerais"},{"id":"5d18b597-7590-11e8-81f2-cddf7f1cf12b","name":"Paraná"},{"id":"662ea390-7590-11e8-81f2-ffffd1f30602","name":"Rio de Janeiro"},{"id":"7dddf9fa-7590-11e8-81f2-edfe8b510c72","name":"Rio Grande do Sul"},{"id":"807b021d-7590-11e8-81f2-ffffd1f30602","name":"Santa Catarina"},{"id":"8d21fc6c-7590-11e8-81f2-8679c9df9bf9","name":"São Paulo"}]
    }, options)
  },

  mountModal(product) {
    const { stateList, stateIdCookie, currentState } = this.options
    this.allStores = this.getAllStoresMD()
    const skuColors = this.filterSkuColors(product.items);
    const skuDetails = this.findMainSkuByPrice(product.items);

    const tpl = `<div class="av-modal av-modal__stock">
      <div class="av-modal__modal">
        <div class="av-modal__header">
          <h3 class="av-modal__title">Estoque das Lojas</h3>
          <a href="javascript:;" class="av-modal-close"></a>
        </div>
        <div class="av-modal__content">
          <div class="sku-selectors">
            <h4>${product.productName}</h4>
            <h5>Escolha a cor e o tamanho para visualizar as lojas</h5>
            <div class="product__variations">
              <div class="product__variations-color">
                <label>Cor: </label>
                <ul class="product__variations-color__list">
                  ${skuColors.map(color => 
                    `<li class="product__variations-color__item" data-color="${color["Cor"][0]}">
                      <a href="#" data-image="${color.images[0].imageUrl}" data-color="${product.productName}">
                        <img src="${color.images[0].imageUrl}" class="product__variations-color__image" title="${color["Cor"][0]}" alt="${product.productName} - ${color["Cor"][0]}" />
                      </a>
                    </li>`
                  ).join("")}
                </ul>
              </div>
              <div class="product__variations-size">
                <label>Tamanho</label>
                <select style="display: none" class="custom-select--small"></select>
              </div>
            </div>
          </div>
          <div class="store-finder hide">
            <h4>Selecione o estado:</h4>
            <div class="modal-stock__select">
              <select class="custom-select custom-select--small states-navigation" data-dropup-auto="true" data-mobile="true" id="states-navigation" data-size="6">
                <option value="">Selecione um estado</option>
                ${stateList.map(item => {
                  return `<option value="${item.id}">${item.name}</option>`
                }).join("")}
              </select>
            </div>
            <div id="stock-list" class="av-modal__list"></div>  
          </div>
        </div>
      </div>
    </div>`

    if (this.options.page == "product") {
      
      if ($(".av-modal__stock").length < 1) {
        $(".product-modals").append(tpl);
      }

    } else {

      if ($(".stock-modal").length < 1) {
        $("body").append("<div class='stock-modal'></div>");
      }

      $('.stock-modal').html(tpl);
    }

    if(currentState != null){
      $('#states-navigation').selectpicker('val', currentState);
    }
     else if(stateIdCookie != undefined){
      $('#states-navigation').selectpicker('val', stateIdCookie);
    } else {
      $('#states-navigation').selectpicker();
    }

    this.selectCurrentColor(product);
  },

  bind() {
    this.bindOpenStock()
    this.changeColor()
    this.select()
    this.eventState()
  },

  eventState() {
    $("body").on("click", ".modal-stock__select .dropdown-menu li", (element) => {
      ga("send", "event", "List - Estoque", "Select Estado", $(element.currentTarget).find(".text"))
    });
  },

  select() {
    $("body").on("click", ".product__variations-size li", (element) => {
      this.findSku(element)
    });
  },

  findSku(element) {
    if (!$(".store-finder.hide").length) {
      $(".store-finder").addClass("hide");
      $(`#stock-list`).empty();
      $('.av-modal__stock .av-modal__content').css('overflow','initial');
    }

    const size = $(".product__variations-size .filter-option-inner-inner").text();
    let color = $(".product__variations-color .product__variations-color__item.selected").attr("data-color"); 
    
    if(color == undefined) {
      if (this.options.page == "product") {
        color = $('.product-sku .Cor .specification').text().split("Cor: ")[1];
      } else {
        const img = $(`div[data-product-id=${this.productData[0].productId}] a > .shelf-item__image img`).attr('src').replace("-150-150", "").replace("-220-220", "").split("?v=")[0]
  
        let skuFiltered;
        
        product.items.forEach(element => {
          element.images.forEach(element2 => {
            if (element2.imageUrl.split("?v=")[0] == img) {
              skuFiltered = element
            }
          });
        });

        color = skuFiltered
      }
    }
    
    let skuSelected = [];

    skuSelected = this.productData[0].items.filter(sku => sku["Cor"][0] == color);
    skuSelected = skuSelected.find(sku => sku["Tamanho"][0] == size);

    console.log(size, color, skuSelected)
    this.changeCode(skuSelected.referenceId.find(item => item["Key"] == "RefId")["Value"]);
  },

  bindOpenStock() {
    const _self = this

    const {
      page
    } = this.options;

    let retStocks;

    $('body').on('click', `#btn-stock-modal`, event => {
      event.preventDefault();

      $('body').append('<div class="loading-stock"></div>')
      $('body').addClass('scroll-lock')
      let id = page === "product" ? skuJson.productId : $(event.target).parents(".shelf-item").attr("data-product-id");

      this.getProductInformation(id, response => {
        $('.loading-stock').remove()
        this.mountModal(response);
        this.showModalMsg()
      });

    })
  },

  onChangeState() {
    // let currentState = null

    $('body').on('change', `#states-navigation`, event => {
      const _this = $(event.currentTarget)
      const stateId = _this.val()

      if (this.options.currentState !== stateId && stateId !== '') {

        this.options.currentState = stateId;
        Cookies.set('stateIdCookie', stateId, { expires: 365 })

        $('.av-modal__stock .av-modal__content').css('overflow','auto');
        this.filterStores(stateId)
      }
    })
  },

  getAllStoresMD() {
    let stores
    $.ajax({
      url: '/api/dataentities/SL/search?_where=(status_active=true)&_fields=name,store_id,state,pageLink',
      type: 'GET',
      async: false,
      headers: {
        'Accept': 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json',
        'REST-Range': 'resources=0-99'
      }
    })
    .then(response => {
      stores = response

      }), error => {
        console.error('Error', error)
        throw new Error(error)
      }

    return stores
  },

  showModalMsg() {
    const {
      $buttonStock
    } = this.options

    APP.i.Modal = new APP.component.Modal($('.av-modal__stock'))
    APP.i.Modal.openModal($('.av-modal__stock'))

    setTimeout(function () {
      $('.product-content-stock .load-stores').remove()
      $buttonStock.removeClass('button--disabled');
      $buttonStock.removeAttr('disabled');
    }, 300)
  },

  getStocks(refId) {

    const _self = this
    let stockStores = []

    
    const { stateList, stateIdCookie, currentState } = this.options

    const query = JSON.stringify({
      query: `query {
        stockStores(refid: "${refId}") {
          model
          store
          qty
          item
        }
      }`
    })

    $.ajax({
        url: `https://decathlonstore.myvtex.com/_v/graphql/private/v1`,
        type: 'post',
        data: query,
        dataType: 'json',
        async: true,
      })
      .then(res => {
      
        stockStores = res.data.stockStores
        _self.stocksData = stockStores

        if (_self.stocksData != null && _self.stocksData.length > 0) {
          $('.stock-content a').removeClass('block')
          _self.showModalMsg();
        } else {
          $('.product-content-stock .load-stores').html(`Não foi possível encontrar estoque das lojas físicas`);
        }
        
        $(".store-finder").removeClass("hide");
        if(currentState != null){
          
          this.filterStores(currentState)
          $('.av-modal__stock .av-modal__content').css('overflow','auto');
          this.onChangeState();
          
        } else if(stateIdCookie != undefined){
          
          this.filterStores(stateIdCookie)
          $('.av-modal__stock .av-modal__content').css('overflow','auto');
          this.onChangeState();
          
        } else {
          this.onChangeState();          
        }

        $('.loading-stock').remove()
      }, error => {
        $('.product-content-stock .load-stores').html(`Não foi possível encontrar estoque das lojas físicas`)
        console.log('error in get stock', error)
        throw new Error(error)
      })
      
    return stockStores
  },

  filterStores(stateId) {
    const _self = this

    // // all stores in MD vtex
    const dataStore = this.allStores
    let newData = [];

    if (_self.stocksData !== null) {
      for (var i = 0, len = dataStore.length; i < len; i++) {
        const el = dataStore[i];

        if (el.state === stateId) {
          let item = _self.stocksData.find(item => item.store === parseInt(el.store_id))

          newData.push({
            pageLink: el.pageLink,
            name: el.name,
            storeId: el.store_id,
            qty: (item !== undefined) ? item.qty : 0
          })
        }
      }
    }

    this.createStockView(newData)
  },

  filterSkuColors(skus) {
    const unique = skus.reduce((accumulator, current) => {

      const field = accumulator.find(item => item["Cor"][0] === current["Cor"][0]);

      if (!field) {
        return accumulator.concat([current]);
      } else {
        return accumulator;
      }

    }, []);

    return unique
  },

  findMainSkuByPrice(skus) {
    const sku = skus.sort((a, b) => {
      return a.sellers[0].commertialOffer.Price - b.sellers[0].commertialOffer.Price;
    })[skus.length - 1];

    return sku
  },

  selectCurrentColor(product) {
     if (this.options.page == "product") {
      const colorProduct = $('.product-sku .Cor .specification').text().split("Cor: ")[1];
      this.mountSizesOptions(colorProduct, false);
      $(".product__variations-color .product__variations-color__item").removeClass("selected");
      $(`.product__variations-color [data-color=${colorProduct}]`).addClass("selected");
      $('.product__variations-color > label').html('Cor: ' + colorProduct);
    } else {
      const img = $(`div[data-product-id=${product.productId}] a > .shelf-item__image img`).attr('src').replace("-150-150", "").replace("-220-220", "").split("?v=")[0]

      var color;
      
      product.items.forEach(element => {
        element.images.forEach(element2 => {
          if (element2.imageUrl.split("?v=")[0] == img) {
            color = element
          }
        });
      });


      $(".product__variations-color .product__variations-color__item").removeClass("selected");
      $(`.product__variations-color [data-color=${color["Cor"][0]}]`).addClass("selected");
      $('.product__variations-color > label').html('Cor: ' + color["Cor"][0])
      this.mountSizesOptions(color["Cor"][0], false);
    }
  },

  mountSizesOptions(color, refresh) {
    const {
      helpers
    } = this.options;

    const $select = $(".product__variations .product__variations-size").find("select");

    $select.find("option").remove();
    $select.append("<option disabled selected>Selecione o tamanho</option>");

    const sizes = this.productData[0].items.filter(sku => sku["Cor"][0] == color);
    
    $select.append(`
			${sizes.map(size => 
				`<option
					value="${helpers._rewrite(size["Tamanho"][0])}" 
					id="${helpers._rewrite(size["Tamanho"][0])}"
				>
					${size["Tamanho"][0]}
				</option>`
			).join("")}		
		`);

    if (!refresh) {
      if(sizes.length === 1){

        $select.selectpicker("val", sizes[0]["Tamanho"][0]);
        this.findSku();

      } else if($('.product-sku .Tamanho select').val() != "" && $('.product-sku .Tamanho select').val() != undefined) {

        $select.selectpicker("val", $('.product-sku .Tamanho select').val());
        this.findSku();
        
      } else {

        $select.selectpicker();
      }

      $select.fadeIn();
    } else {
      if(sizes.length === 1){
        $select.selectpicker("val", sizes[0]["Tamanho"][0]);
        this.findSku()
      } else {
        $select.selectpicker("val", "Selecione o tamanho");
      }
    }
  },

  changeColor() {
    $("body").on("click", ".product__variations-color__item", (element) => {
      if (!$(".store-finder.hide").length) {
        $(".store-finder").addClass("hide");
        $(`#stock-list`).empty();
        $('.av-modal__stock .av-modal__content').css('overflow','initial');
      }

      element.preventDefault();

      $(element.currentTarget).siblings().removeClass("selected");
      $(element.currentTarget).addClass("selected");

      this.mountSizesOptions($(element.currentTarget).attr("data-color"), true);
    });
  },

  createStockView(stockStores) {
    let templateGeneral = ''
    let lenStores = stockStores.length

    stockStores.sort(function (a, b) {
      let textA = a.name.toUpperCase();
      let textB = b.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });

    $(`#stock-list`).empty()

    if (lenStores > 0) {
      for (var i = 0, len = lenStores; i < len; i++) {
        const el = stockStores[i];
        let stockClass = ''
        let stockName = ''

        switch (true) {
          case (el.qty < 1):
            stockClass = 'stock-small'
            stockName = 'Indisponível'
            break;
          case (el.qty > 0 && el.qty < 5):
            stockClass = 'stock-medium'
            stockName = 'Baixa Disponibilidade'
            break;
          case (el.qty >= 5):
            stockClass = 'stock-big'
            stockName = 'Disponível'
            break;
          default:
            break;
        }

        templateGeneral += `
          <li>
            <div class="store-selection__item" data-id="${el.storeId}">
              <span class="stock-list__content">
                <h4>${el.name}</h3>
                <span class="store__selection-stock ${stockClass}">${stockName}</span>
              </span>
              <a class="button button--small button--clean gaClick" href="${el.pageLink}" data-event-category="Estoque Lojas" data-event-action="Click Link" data-event-label="Loja - ${el.name}" target="_blank">Ver Endereço</a>
            </div>
          </li>`
      }
      $(`#stock-list`).append(`<div class="store-selection"><ul class="store-selection__list">${templateGeneral} </ul></div>`);
    } else {
      $(`#stock-list`).append(`<div class="store-selection"><h4>No momento não temos o produto no Estado escolhido. :/</h4></div>`)
    }
  },

  changeCode(refId) {
    const { stateIdCookie, currentState } = this.options;

    $('body .av-modal__stock').append('<div class="loading-stock"></div>')

    this.stocksData = this.getStocks(refId)

    if (this.stocksData.length > 0) {
      this.showModalMsg()
    }
    
    if(currentState != null){
      $('#states-navigation').selectpicker('val', currentState);
    } else if(stateIdCookie != undefined){
      $('#states-navigation').selectpicker('val', stateIdCookie);
    } else {
      $('#states-navigation').selectpicker('val', '');
    }

    $(`#stock-list`).empty()
  },

  getProductInformation(productId, callback) {
    $.ajax({
      url: `/api/catalog_system/pub/products/search/?fq=productId:${productId}`,
      type: "GET",
      dataType: "json",
      success: (response) => {
        this.productData = response;
        callback(response[0])
      },
      error: (error) => {
        alert('Não foi possível buscar os produtos');
        console.error('Não foi possível buscar os produtos', error)
      }
    });
  }
})