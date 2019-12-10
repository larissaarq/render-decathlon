APP.controller.StoreLocator = ClassAvanti.extend({
  init() {
    this.setup()
    this.start()
    this.bind()
  },

  setup() {
    this.$selectState = $('#states-navigation')
    this.classStoreItem = 'store-item'

    this.options = {
      $target: $('.store-locator__list'),
      $searchTarget: $('.store-locator__search'),
      $selectState: $('#states-navigation'),

      classStoreItem: 'store-item',
      classSearchBar: 'store-locator__search-bar',

      url: '/api/dataentities/SL/search?_where=(status_active=true)&_fields=name,address,phone,openingHours,latitude,longitude,state,pageLink,specialHolidaySchedule',

      storeTemplate(variables) {
        return variables.map(item =>
          `
            <div class="store-item" data-state="${item.state}">
              <div class="store-item__title-wrap">
                <h3 class="store-item__title">${item.name}</h3>
                <address class="store-item__address">${item.address}</address>
              </div>

              <div class="store-item__data">
              ` + ((item.phone !== null) ? `
                <a class="store-item__data-phone store-item__data-link" href="tel:+55${item.phone}">Telefone: ${item.phoneFormated}</a>
              ` : '<br />') + `
                <p class="store-item__data-text">${item.openingHours}</p>
                <p class="store-item__data-text">${(item.specialHolidaySchedule !== null) ? item.specialHolidaySchedule : ''}</p>
              </div>

              <div class="store-item__button">
                <a href="${item.pageLink}" class="button button--small" title="Saiba Mais">Saiba Mais</a>
              </div>
            </div>
          `).join('')
      },

      stateInit: this.$selectState.val()
    }
  },

  start() {
    this.getStores()
  },

  bind() {
    this.changeState()
    this.bindStoreItem()
  },

  changeState() {
    const _self = this;

    this.$selectState.on('change', event => {
      const _this = $(event.currentTarget)
      const state = _this.val()

      _self.filterStores(state)
    })
  },

  bindStoreItem() {
    $('body').on('click', `.${this.classStoreItem}`, event => {
      const _this = $(event.currentTarget)

      _this.toggleClass('active')
    })
  },

  getStores() {
    const {
      $target,
      url,
      storeTemplate,
      stateInit
    } = this.options

    $.ajax({
      url,
      type: 'GET',
      headers: {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json',
        'REST-Range': 'resources=0-1500'
      },
      success: data => {
        const dataFormated = this.formatStoreData(data)
        this.orderAlphabeticStores(dataFormated)

        $target.html(storeTemplate(dataFormated))

        if (stateInit !== 'all') {
          $('#states-navigation').selectpicker('val', stateInit);
        }
      }
    })
  },

  formatStoreData(data) {
    for (const store of data) {

      if (store.phone !== null) {
        let phone = store.phone
        phone = phone.length === 10 ? phone.match(/(\d{2})(\d{4})(\d{4})/) : phone.match(/(\d{2})(\d{5})(\d*)/)
        store.phoneFormated = `(${phone[1]}) ${phone[2]}-${phone[3]}`
      }

      const openingHours = store.openingHours.replace(/(\r\n)/g, '<br/>')
      store.openingHours = openingHours
    }

    return data
  },

  orderAlphabeticStores(data) {
    data.sort(function (a, b) {
      return a.name.localeCompare(b.name)
    });
  },

  searchResult(total, state) {
    const {
      $searchTarget,
      $selectState,
      classSearchBar
    } = this.options

    const stateText = $selectState.find(`option[value="${state}"]`).text()

    const $resultBar = `<div class="${classSearchBar}">
                          ${total > 0 ? `Foram encontradas <strong>${total} lojas no estado de ${stateText}</strong>` : `Nenhuma loja encontrada no estado de <strong>${stateText}</strong>`}
                        </div>`

    $searchTarget.html($resultBar)
  },

  filterStores(state) {
    const {
      classStoreItem,
      classSearchBar
    } = this.options

    if (state === 'all') {
      $(`.${classSearchBar}`).hide()
      $(`.${classStoreItem}`).fadeIn('fast')
      return
    }

    let total = 0

    $(`.${classStoreItem}`).each((index, element) => {
      const _this = $(element)

      if (_this.data('state') === state) {
        if (_this.is(':hidden')) {
          _this.fadeIn('fast')
        }

        total++
      } else {
        _this.fadeOut('fast')
      }
    })

    this.searchResult(total, state)
  }
})
