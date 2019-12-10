APP.controller.Orders = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.options = {
      endpoint: 'https://decathlonmyaccount--decathlonstore.myvtex.com/_v/graphql/private/v1',
    }

    APP.i.MyAccountMenu = new APP.component.MyAccountMenu()
  },

  start () {
    this.removeBoostrap()
    this.insertButtonRate()

    this.getProfile(profile => {
      const email = profile.Email

      this.getUser(email, response => {
        this.user = response.data.userDecathlon

        if (this.user === null) {
          return false
        }

        APP.i.MyAccountMenu.setUserNumber(this.user.identity_individual.national_id)
        APP.i.MyAccountMenu.setUserName(this.user.identity_individual.name, this.user.identity_individual.surname)
      })
    })
  },

  removeBoostrap () {
    $('link[href$="bootstrap.min.css"]').remove()
    $('link[href$="bootstrap-responsive.min.css"]').remove()
  },

  searchProduct (urlProduct, callback) {
    $.ajax({
      url: `/api/catalog_system/pub/products/search${urlProduct}`,
      type: 'GET',
      data: {}
    }).done(function (response) {
      callback(response[0].productId)
    })
  },

  insertButtonRate () {
    const $this = this
    const intervalOrderCard = setInterval( () => {
      if($('.myo-order-card').length > 0) {
        $('.myo-order-card').each(function(index, element) {
          const _this = $(element)
          if(_this.find($('.dib.br2.pv1.ph2.f7.fw5.black-70.tc.bg-green')).length > 0) {
            _this.find('.myo-order-product').each(function(index, e) {
              const _self = $(e)
              const linkProduct = _self.find('.heavier-blue').attr('href')
              if(_self.find('.button-rate').length === 0){
                console.log('entrou')
                $this.searchProduct(linkProduct, idSku => {
                  _self.find('.mid-gray').append('<a class="button-rate" href="https://www.decathlon.com.br/avalie-o-produto?code='+idSku+'" target="_blank" title="Avaliar produto">AVALIAR PRODUTO</a>')
                })
              }
            })
          }
        })
      }
    }, 300)
  },

  bind () {
    this._bindMenuFunctions()
    // this._bindRateButton()
  },

  // _bindRateButton () {
  //   $('body').on('click', '.button-rate', event => {
  //     const _this = $(event.currentTarget)
  //     const datafld = _this.attr('datafld')
  //     this.searchProduct(datafld, idSku => {
  //        _this.next().prop('href', ')
  //        _this.next().trigger('click')
  //        console.log('teste')
  //         //window.location.href = 'https://www.decathlon.com.br/avalie-o-produto?code='+idSku
  //     })
  //   })
  // },

  /*
   * @name bindMenuFunctions
   * @description Registra os eventos que serao disparados pelos links do menu mobile.
  */
  _bindMenuFunctions () {
    $(document).off('click', 'a.my-account-menu__link:not([href="/account/orders"]):not([href="/no-cache/user/logout"]):not(.my-account-menu__link--sub), a.my-account-submenu__link, .my-account-sports-list__link, .my-account-stores-list__link, .my-store__button--list-stores, .my-account__home-link--profile')
    // APP.i.MyAccountMenu._bindSubMenuFunctions()
  },

  /*
   * @name getProfile
   * @description Retorna a entidade do usuário logado na VTEX.
   * @param <Funcion> next
  */
  getProfile (next) {
    $.get('/no-cache/profileSystem/getProfile').then(response => {
      if (typeof next !== 'function') {
        return false
      }

      next(response)
    }).fail( error => {
      console.catch('Error on get user profile.')

      throw new Error(error)
    })
  },


  /*
   * @name getUser
   * @description Retorna a entidade do usuário buscando na API
   *              Graphql.
   * @param <string> email
   * @param <Funcion> next
  */
  getUser (email, next) {
    const query = JSON.stringify({
      query: `query {
        userDecathlon(email: "${email}") {
          contact {
            email
            email_valid
            mobile
            mobile_valid
            mobile_country_code
            landline
            landline_country_code
          }

          identity_individual {
            name
            surname
            national_id
            country_code
            langue
            sexe
            name2
            birthdate
            national_id_type
            member_type
          }

          shipping_address {
            id_address
            street_name
            line2
            street_number
            district
            postal_code
            city
            province
            additionnal_data
            country_code
            address_type
            title
            name
            surname
            is_prefered
          }

          sports {
            do_not_practiced_sports
            list_sports {
              id_sport
              supprime
            }
          }

          stores {
            num_third_usual
          }

          optin {
            id
            type
            value
          }

          completion {
            percent
          }
        }
      }`
    })

    this.request(query, response => {
      next(response)
    })
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
      $('.loading').fadeOut(200)
      $('.loading').remove()
    })
  },
})
