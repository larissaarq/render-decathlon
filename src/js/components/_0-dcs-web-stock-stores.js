APP.component.StockStores = ClassAvanti.extend({
  init() {
    this.setup()
    this.start()
    this.bind()
  },

  setup(options) {
    this.$selectState = $('#states-navigation')
    this.allStores = []

    this.stocksData = []
    
    this.options = $.extend({
      currentState: null,
      $buttonStock: $('#btn-stock-modal')
    }, options)
  },
  
  start() {
    this.allStores = this.getAllStoresMD()

    const tpl = `<div class="av-modal av-modal__stock">
      <div class="av-modal__modal">
        <div class="av-modal__header"><a href="javascript:;" class="av-modal-close"></a></div>
        <div class="av-modal__content">
          <h3 class="av-modal__title">Selecione um estado para conferir a disponibilidade</h3>
          <div class="modal-stock__select">
            <select class="custom-select custom-select--small states-navigation" data-dropup-auto="true" data-mobile="true" id="states-navigation" data-size="6">
              <option value="">Selecione um estado</option>
              <option value="851f6959-7582-11e8-81f2-8679c9df9bf9">Espírito Santo</option>
              <option value="8a35e344-7582-11e8-81f2-80dafa1d3a04">Goiás</option>
              <option value="a312d4a8-7582-11e8-81f2-80dafa1d3a04">Minas Gerais</option>
              <option value="5d18b597-7590-11e8-81f2-cddf7f1cf12b">Paraná</option>
              <option value="662ea390-7590-11e8-81f2-ffffd1f30602">Rio de Janeiro</option>
              <option value="7dddf9fa-7590-11e8-81f2-edfe8b510c72">Rio Grande do Sul</option>
              <option value="807b021d-7590-11e8-81f2-ffffd1f30602">Santa Catarina</option>
              <option value="8d21fc6c-7590-11e8-81f2-8679c9df9bf9">São Paulo</option>
            </select>
          </div>
          <div id="stock-list" class="av-modal__list"></div>  
        </div>
      </div>
    </div>`

    // $('.product-buy-box').append(`<button type="button" id="btn-open-stock" class="button button--small button--gray button--white">Disponibilidade na loja</button>`);

    $('.product-modals').append(tpl)
    $('#states-navigation').selectpicker({ noneSelectedText: 'UF' })
  },

  bind() {
    this.bindOpenStock()
    this.bindChangeState()
  },

  bindOpenStock() {
    const _self = this

    const { $buttonStock } = this.options
    let currentRefId = APP.i.currentController.RefId;
    let retStocks;
    
    $('#boxPriceStock').on('click', `#btn-stock-modal`, event => {
      event.preventDefault();

      const $buttonSelect = $(".skuList.item-dimension-Tamanho button")
      
      if ($("ul.Tamanho:visible").length > 0 && $("ul.Tamanho li span.tamanho-unico").length === 0 && ($buttonSelect.prop("title") === "Nothing selected" || $buttonSelect.prop("title") === "Selecione o tamanho")) {
        $(".item-dimension-Tamanho").addClass("sku-unchecked")
        
        return false
        
      } else {
        $buttonStock.attr('button--disabled');
        $buttonStock.addClass('button--disabled');
        $('.product-content-stock').append(`<span class="load-stores">Buscando lojas...</span>`);
                
        if ($("ul.Tamanho li span.tamanho-unico").length > 0) {
          currentRefId = APP.i.currentController.RefId;

          retStocks = _self.getStocks(APP.i.currentController.RefId)
          
        } else {
          
          if (currentRefId !== APP.i.currentController.RefId || _self.stocksData.length === 0){
            currentRefId = APP.i.currentController.RefId;
            
            if ($('.av-modal__stock').length > 0) {
              _self.changeCode(APP.i.currentController.RefId)
            } else {
              retStocks = _self.getStocks(APP.i.currentController.RefId)
            }
          }
        }
      }

      if(_self.stocksData.length > 0){
        _self.showModalMsg()
      }
    })
  },

  bindChangeState () {
    // let currentState = null
    
    $('body').on('change', `#states-navigation`, event => {
      const _this = $(event.currentTarget)
      const stateId = _this.val()

      if(this.options.currentState !== stateId && stateId !== ''){
        this.options.currentState = stateId

        this.filterStores(stateId)
      }
    })
  },

  getAllStoresMD () {    
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

  showModalMsg(){
    const { $buttonStock } = this.options

    APP.i.Modal = new APP.component.Modal($('.av-modal__stock'))
    APP.i.Modal.openModal($('.av-modal__stock'))

    setTimeout(function(){
      $('.product-content-stock .load-stores').remove()
      $buttonStock.removeClass('button--disabled');
      $buttonStock.removeAttr('disabled');
    }, 300)
  },

  getStocks (refId) {
    console.log('getStocks PROD >> ', refId);

    const _self = this
    let stockStores = []
    
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

      if(_self.stocksData.length > 0 ){
        $('.stock-content a').removeClass('block')
        _self.showModalMsg();
      }

    }, error => {
      $('.product-content-stock .load-stores').html(`Não foi possível encontrar estoque das lojas físicas`)
      console.log('error in get stock', error)
      throw new Error(error)
    })

    return stockStores
  },

  filterStores (stateId) {
    const _self = this

    // // all stores in MD vtex
    const dataStore = this.allStores
    let newData = [];

    if (_self.stocksData !== null) {
      for ( var i = 0, len = dataStore.length; i < len; i++ ) {
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

  createStockView (stockStores) {
    let templateGeneral = ''
    let lenStores = stockStores.length

    stockStores.sort(function(a, b) {
      let textA = a.name.toUpperCase();
      let textB = b.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });

    $(`#stock-list`).empty()
    
    if(lenStores > 0){
      for (var i = 0, len = lenStores; i < len; i++) {
        const el = stockStores[i];
        let stockClass = ''
        let stockName = ''
  
        switch (true) {
          case (el.qty < 1):
            stockClass = 'stock-small'
            stockName = 'INDISPONÍVEL'
            break;
          case (el.qty > 0 && el.qty < 5):
            stockClass = 'stock-medium'
            stockName = 'BAIXA DISPONIBILIDADE'
            break;
          case (el.qty >= 5):
            stockClass = 'stock-big'
            stockName = 'DISPONÍVEL'
            break;
          default:
            break;
        }
  
        templateGeneral += `
          <li>
            <a href="${el.pageLink}" class="store-selection__link" data-id="${el.storeId}">
              <i class="dkti-store stock-icon"></i>
              <span class="stock-list__content">
                <h4>${el.name}</h3>
                <span class="store__selection-stock ${stockClass}">${stockName}</span>
              </span>
            </a>
          </li>`
      }
      $(`#stock-list`).append(`<div class="store-selection"><ul class="store-selection__list">${templateGeneral} </ul></div>`)
    } else {
      $(`#stock-list`).append(`<div class="store-selection"><h4>No momento não temos o produto no Estado escolhido. :/</h4></div>`)
    }   
  },

  changeCode (refId){
    this.stocksData = this.getStocks(refId)

    if(this.stocksData.length > 0){
      this.showModalMsg()
    }

    $('#states-navigation').selectpicker('val', '');

    this.options.currentState = null

    $(`#stock-list`).empty()
  }
})
