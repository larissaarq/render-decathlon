APP.component.MyAccountStores = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      email: null,
      stores: null,
      endpoint: null,
      country_code: null,

      endpointMasterData: '/api/dataentities/SL/search?_fields=address,name,openingHours,pageLink,phone,store_id',

      storeInputName: '[name="stores[num_third_usual]"]',

      templateStore (store = {}) {
        return `<div class="av-row">
                  <div class="av-col-xs-24 av-col-md-8">
                    <div class="my-store__title">${store.name || 'Nenhuma loja selecionada'}</div>
                    <div class="my-store__address">${store.address || ''}</div>
                  </div>

                  <div class="av-col-xs-24 av-col-md-8 av-col-static">
                    <div class="my-store__phone">
                      <i class="my-store__phone-icon"></i>
                      ${store.phone || ''}
                    </div>
                  </div>

                  <div class="av-col-xs-24 av-col-md-8">
                    <div>
                      <a href="${store.pageLink || '#'}" class="button button--medium button--yellow my-store__button">Página da loja</a>
                    </div>

                    <div>
                      <a href="javascript:;" class="button button--medium button--blue my-store__button--list-stores" data-target=".my-account-page--preferences-store-list">Alterar minha loja</a>
                    </div>
                  </div>
                </div>`
      },

      storeListItemTemplate(variables, actual = {}) {
        return variables.map(item => `<li class="my-store__stores-item" data-id="${item.store_id}" data-name="store">
            <label>
              <span>${item.name}</span>
              <input type="radio" name="stores[num_third_usual]" class="register-checkbox" id="my-store__stores-${item.store_id}" value="${item.store_id}" ${((actual.store_id || '') === item.store_id ? 'checked="checked"' : '')}/>
            </label>
          </li>`).join('')
      }
    }, options)

    APP.i.flash_msg = new APP.component.FlashMsg()
  },

  start () {
    const {
      stores,
      templateStore,
      storeListItemTemplate,
      country_code
    } = this.options

    if (country_code !== 'BR') {
      $('.my-account-page__content--store').html('Sua conta foi criada em outro país. Para alterar sua loja favorita, entre em contato com a Decathlon no país de origem.')

      return false
    }

    this.getFromMasterData(response => {
      this.options.myStore = response.find(store => stores.num_third_usual == store.store_id)

      const $targetMyStore = $('.my-account-page--preferences-store .my-store__store')
      $targetMyStore.html(templateStore(this.options.myStore))

      const $targetStores = $('.my-account-page--preferences-store-list .my-store__stores')
      $targetStores.html(storeListItemTemplate(response, this.options.myStore))
    })
  },

  getFromMasterData (next) {
    const {
      endpointMasterData
    } = this.options

    $.ajax({
      url: endpointMasterData,
      type: 'GET',
      headers: {
        'Accept': 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json',
        'REST-Range': 'resources=0-99'
      }
    })
      .then(response => {
        next(response)
      })
  },

  bind () {
    this._bindSelectStore()
  },

  _bindSelectStore () {
    const {
      storeInputName
    } = this.options

    $(document).on('click', storeInputName, event => {
      const idStore = $(event.currentTarget).val()

      this.saveStore(idStore)
      this.getStore(idStore, store => {
        const [ myStore ] = store
        this.renderStore(myStore)
      })
    })
  },

  saveStore(idStore) {
    const query = JSON.stringify({
      query: `mutation {
        updateStores(
          email: "${this.options.email}",
          stores: {
            num_third_usual: ${parseInt(idStore)}
          }
        )
      }`
    })

    this.request(query, response => {
      if (response.data && response.data.updateStores == "success") {
        APP.i.flash_msg.showMsg('Loja preferida selecionada com sucesso!', 'success')
      } else {
        console.log('response >>> ', response)
        if (response.errors && response.errors.length > 0) {
          APP.i.flash_msg.showMsg('Erro ao selecionar loja preferida', 'error')
        }
      }
    })
  },

  getStore (idStore, next) {
    const {
      endpointMasterData
    } = this.options

    $.get(`${endpointMasterData}&store_id=${idStore}`, null, {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json',
        'REST-Range': 'resources=0-500'
    })
    .then(response => {
      next(response)
    })
  },

  renderStore (store) {
    const {
      templateStore
    } = this.options

    this.options.myStore = store

    const $targetMyStore = $('.my-account-page--preferences-store .my-store__store')
    $targetMyStore.html(templateStore(this.options.myStore))
  },

  /*
   * @name request
   * @description Faz a requisiçao na api Graphql.
   * @param <Object> query
   * @param <Function> next
  */
  request (query, next) {
    const { endpoint } = this.options

    $('body').append('<div class="loading"></div>')
    $('.loading').fadeIn(200)

    $.post(endpoint, query).then(response => {
      if (typeof next !== 'function') {
        return false
      }

      next(response)
    })
    .fail(error => {
      throw new Error(error)
    })
    .done(() => {
      $('.loading').fadeOut(200, () => {
        $('.loading').remove()
      })
    })
  }
})
