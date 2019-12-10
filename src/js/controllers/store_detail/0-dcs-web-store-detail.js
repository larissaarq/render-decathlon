APP.controller.StoreDetail = ClassAvanti.extend({
  init() {
    this.setup()
    this.start()
    this.bind()
  },

  setup() {
    this.header = {
      'Accept': 'application/json',
      'REST-range': 'resources=0-5000',
      'Content-Type': 'application/json; charset=utf-8'
    }
    this.$slugPage = $('meta[name=slug-page]').attr("content")
    
    if (this.$slugPage !== undefined) {
      APP.i.BlogEventsEntries.getEntries('', 'lojas/' + this.$slugPage, '')
    } else {
      $('.section-sportive-events').hide()
    }

    if($('.store-detail__parceiros .store-detail__parceiros--item').length > 0) {
      $('.store-detail__parceiros').slideDown()
    } else {
      $('.store-detail__parceiros').slideUp()
    }
  },

  getStore() {
    const _self = this
    let url = window.location.pathname;

    $.ajax({
      url: '/decathlonstore/dataentities/SL/search?_where=(pageLink="' + url + '")&_fields=address,name,openingHours,services_ids,embed_link,address_complement,phone,googleLink,specialHolidaySchedule',
      type: 'GET',
      headers: this.header,

      success: function (resp) {
        let dataStores = resp

        _self.includeInfoStores(dataStores)
        _self.urlVerification(dataStores)

        let urlVerification = _self.urlVerification(dataStores)
        _self.getServices(urlVerification);
      },
      error: function (e) {
        console.log(e);
      }
    });
  },

  getServices(urlVerification) {
    const _self = this;

    $.ajax({
      url: '/decathlonstore/dataentities/SS/search?_fields=description,image,title,' + urlVerification + '',
      type: 'GET',
      headers: _self.header,
      success: function (resp2) {
        let dataServices = resp2;

        if (_self.dataServices !== null) {
          _self.includeInfoServices(dataServices)
        }
      },
      error: function (e) {
        console.log(e);
      }
    });
  },

  urlVerification(stores) {
    let servicesMd = stores[0].services_ids;
    let whereUrl = '';

    if (servicesMd.indexOf(';') > -1) {
      let servicesSplit = '';
      servicesSplit = servicesMd.split(';')

      let i = 0
      servicesSplit.forEach(function (e) {
        if (i == 0) {
          whereUrl += '&_where=id_service=' + e + '';
        } else {
          whereUrl += ' OR id_service=' + e + '';
        }
        i++;
      })
    } else {
      whereUrl = '&_where=id_service=' + servicesMd + '';
    }
    return whereUrl
  },

  formatStorePhone(stores) {
    for (const store of stores) {

      if (store.phone !== null) {
        let phone = store.phone
        phone = phone.length === 10 ? phone.match(/(\d{2})(\d{4})(\d{4})/) : phone.match(/(\d{2})(\d{5})(\d*)/)
        store.phoneFormated = `(${phone[1]}) ${phone[2]}-${phone[3]}`
      }
    }

    return stores
  },

  formatStoreOpeningHours(stores) {
    for (const store of stores) {

      var infoOpeningHours = store.openingHours;

      store.formatOpeningHours = infoOpeningHours.replace(";", "<br />");
    }
  },

  includeInfoStores(stores) {
    const _self = this

    stores.forEach(function (c) {

      _self.formatStorePhone(stores)
      _self.formatStoreOpeningHours(stores)

      $('#name-store strong').text((c.name !== null) ? c.name : '')
      $('#address-store').text((c.address !== null) ? c.address : '')
      $('#addressComplement-store').text((c.address_complement !== null) ? c.address_complement : '')
      $('#openingHours').html((c.formatOpeningHours !== null) ? c.formatOpeningHours : '')
      $('#specialHolidaySchedule').html((c.specialHolidaySchedule !== null) ? c.specialHolidaySchedule : '')
      $('#telephone-number').text((c.phone !== null) ? c.phoneFormated : '')
      if (_self._isMobile()) {
        $('.store-detail__info-hour').prepend('<a href="' + c.googleLink + '" class="button button--small button--mobile-clean" tabindex="0">IR PARA A LOJA</a>')
      } else {
        $('#info-maps').html((c.embed_link !== null) ? '<iframe src="' + c.embed_link + '" frameborder="0" allowfullscreen="""></iframe>' : '')
      }
    })
  },

  includeInfoServices(services) {
    let html = ''
    services.forEach(function (e) {
      html += `<div class="store-detail__services-list--item">
                <span class="store-detail__services-list--item-img">
                  <img src="${e.image}" alt="${e.title}" />
                </span>
                <div class="store-detail__services-list--item-wrap">
                  <span class="store-detail__services-list--item-title">${(e.title !== null) ? e.title: ''}</span>
                  <span class="store-detail__services-list--item-desc">${(e.description !== null) ? e.description : ''}</span>
                </div>
              </div>`
    })

    $('.store-detail__services-list').html(html)
  },

  _isMobile() {
    return $(window).width() <= 991
  },

  start() {
    this.getStore()
  },

  bind() { }
})
