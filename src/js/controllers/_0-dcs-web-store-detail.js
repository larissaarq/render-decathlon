APP.controller.StoreDetail = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
    
  },

  setup () {
    this.header = {
        'Accept': 'application/json',
        'REST-range': 'resources=0-5000',
        'Content-Type': 'application/json; charset=utf-8'
    }
    this.$slugPage = $('meta[name=slug-page]').attr("content")
    if (this.$slugPage !== undefined) {
      APP.i.BlogEventsEntries.getEntries('', 'lojas/'+this.$slugPage, '')
    } else {
      $('.section-sportive-events').hide()
    }
    
  }, 
  
  getStore (){
    const _self = this
      var url = window.location.pathname;
      $.ajax({
        url: '/decathlonstore/dataentities/SL/search?_where=(pageLink="'+url+'")&_fields=address,name,openingHours,services_ids,embed_link,address_complement,phone,googleLink,specialHolidaySchedule',
        type: 'GET',
        headers: this.header,
        success: function(resp) {
          var lojas = resp
          console.log(lojas)

          _self.includeInfoLojas(lojas)
          _self.urlVerification(lojas)

          var urlVerification = _self.urlVerification(lojas)
          $.ajax({
          url: '/decathlonstore/dataentities/SS/search?_fields=description,image,title,'+urlVerification+'',
          type: 'GET',
          headers: _self.header,
          success: function(resp2) {
            var servicos = resp2;
            console.log(servicos)
            if(_self.servicos !== null){
              _self.includeInfoServices(servicos)
            }
          },
          error: function(e) {
            console.log(e);
          }
        });	
      },
      error: function(e) {
        console.log(e);
      }
    });
  },

  urlVerification(lojas){
    var servicosMd = lojas[0].services_ids;
    if(servicosMd.indexOf(';') > -1)
    {
      var whereUrl = '';
      var servicosSplit='';
      servicosSplit = servicosMd.split(';')

      var i = 0
      servicosSplit.forEach(function(e){
        if(i == 0)
        {
          whereUrl += '&_where=id_service='+e+'';
        }else{
          whereUrl += ' OR id_service='+e+'';
        }
        i++;
      })
    }else{
      var whereUrl = '&_where=id_service='+servicosMd+'';
    }
    return whereUrl
  },

  formatStorePhone(lojas) {
    for (const store of lojas) {
      
      if(store.phone !== null){
        let phone = store.phone
        phone = phone.length === 10 ? phone.match(/(\d{2})(\d{4})(\d{4})/) : phone.match(/(\d{2})(\d{5})(\d*)/)
        store.phoneFormated = `(${phone[1]}) ${phone[2]}-${phone[3]}`
      }
    }

    return lojas
  },

  formatStoreOpeningHours(lojas){
    for (const store of lojas) {
      
      var infoOpeningHours = store.openingHours;
    
      store.formatOpeningHours = infoOpeningHours.replace(";", "<br />");
    }
  },

  includeInfoLojas(lojas) {
    const _self = this
    
    
    lojas.forEach(function(c){

      _self.formatStorePhone(lojas)
      _self.formatStoreOpeningHours(lojas)

      $('#name-store strong').text((c.name !== null) ? c.name : '')
      $('#address-store').text((c.address !== null) ? c.address : '')
      $('#addressComplement-store').text((c.address_complement !== null) ? c.address_complement : '')
      $('#openingHours').html((c.formatOpeningHours !== null) ? c.formatOpeningHours : '')
      $('#specialHolidaySchedule').html((c.specialHolidaySchedule !== null) ? c.specialHolidaySchedule : '')
      $('#telephone-number').text((c.phone !== null) ? c.phoneFormated : '')
      if(_self._isMobile()){
        $('.store-detail__info-hour').prepend('<a href="'+c.googleLink+'" class="button button--small button--mobile-clean" tabindex="0">IR PARA A LOJA</a>')
      }else{
        $('#info-maps').html((c.embed_link !== null) ? '<iframe src="'+c.embed_link+'" frameborder="0" allowfullscreen="""></iframe>' : '')
      }
      
    })
  },
  
  includeInfoServices(servicos) {
    var html = ''
    servicos.forEach(function(e){
      html  += '<div class="store-detail__services-list--item">'+
      '<span class="store-detail__services-list--item-img">'+
      ' <img src="'+e.image+'" alt="'+e.title+'">'+
      '</span>'+
      '<div class="store-detail__services-list--item-wrap">'+
      ' <span class="store-detail__services-list--item-title">'+e.title+'</span>'+
      ' <span class="store-detail__services-list--item-desc">'+e.description+'.</span>'+
      ' </div>'+
      ' </div>'
    })

    $('.store-detail__services-list').html(html)
    
  },
  
  _isMobile () {
    return $(window).width() <= 991
  },
  start () {
    this.getStore()
  },

  bind () {}
})
