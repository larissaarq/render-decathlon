APP.controller.MyAccount = ClassAvanti.extend({
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

  /*
   * @name start
   * @description Busca o perfil do usuário logado pela VTEX e em seguida,
   *              busca os dados da API Graphql.
  */
  start () {
    if (!$('body').hasClass('my-account')) {
      return false
    }

    $('#bluecircle').percircle()

    this.getProfile(profile => {
      const email = profile.Email
      this.options.email = email

      this.getUser(email, response => {
        if (typeof response.error !== 'undefined') {
          console.log('### Error: reload page')
        }

        this.user = response.data.userDecathlon
        this.checkAccountMemberType(this.user)

        if (this.user === null) {
          return false
        }

        APP.i.MyAccountMenu.setUserNumber(this.user.identity_individual.national_id)
        APP.i.MyAccountMenu.setUserName(this.user.identity_individual.name, this.user.identity_individual.surname)

        APP.i.ValidatePassword = new APP.component.ValidatePassword({
          $form: $('.my-account-page--profile__access-password'),
          $passwordField: $('input[name="identity_individual[new_password]"]'),
          $validatorList: $('.password-meter-list'),
          $passwordCondition: $('.password-meter-condition'),
          $sendBtn: $('.my-account-page--profile__access-password').find('.my-account-button-save'),
          $showIcon: $('.password-meter-condition i'),
        })

        const {
          sports,
          contact,
          stores,
          shipping_address,
          identity_individual,
          optin,
          completion
        } = this.user

        APP.i.MyAccountHome = new APP.component.MyAccountHome({ completion })
        APP.i.MyAccountProfile = new APP.component.MyAccountProfile({
          email,
          endpoint: this.options.endpoint,
          profile: { contact, shipping_address, identity_individual },
        })
        APP.i.MyAccountSports = new APP.component.MyAccountSports({ email, sports, endpoint: this.options.endpoint })
        APP.i.MyAccountStores = new APP.component.MyAccountStores({ email, stores, endpoint: this.options.endpoint, country_code: identity_individual.country_code })
        APP.i.MyAccountOptin = new APP.component.MyAccountOptin({
          email,
          endpoint: this.options.endpoint,
          response: optin
        })
      })
    })
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
      this.checkHashUrl()

      next(response)
    })
  },

  checkHashUrl () {
    const pathName = window.location.pathname.replace('_secure/', '')
    const hash = window.location.hash

    if (hash.length) {
      const $link = $('.my-account-menu').find(`[href$="${hash}"]`)
      const target = $link.data('target')

      $('.my-account-page').addClass('hidden')
      $('.attached-content').addClass('open')

      $('main *').animate({ scrollTop: 0 }, 'fast')
      $(target).removeClass('hidden')
    }
  },

  /**
   * @name checkAccountMemberType
   * @description Verifica se o cadastro do usuário está incompleto de acordo com o `member_type`
   * @param <Object> user
   */
  checkAccountMemberType (user) {
    const $modalRecoveryPassword = $('.av-modal--recovery-password')
    const $modalUncompleteAccount = $('.av-modal--uncomplete-account')

    if (user === null) {
      this.showModal($modalUncompleteAccount)

      return false
    }

    if (user.identity_individual.member_type === 2) {
      this.showModal($modalRecoveryPassword)
    }
  },

  /**
   * @name showModalRecoveryPassword
   * @description Exibe a modal de acordo com o elemento passado no parametro
   * @param <JQuery Object> $modal
   */
  showModal ($modal) {
    $modal.fadeIn('fast')
  },

  /*
   * @name bind
   * @description Executa os diversos registros de eventos de entrada.
  */
  bind () {
    this.bindEnableFormEditOrSave()
    this.bindPasswordRequest()
  },

  /*
   * @name enableInputsForm
   * @description Remove a propriedade de apenas leitura de um form especifico.
   * @param <JQuery Object> form
  */
  enableInputsForm (form) {
    form.find('input').prop('readonly', false)
  },

  /*
   * @name disableInputsForm
   * @description Adiciona a propriedade de apenas leitura de um form especifico.
   * @param <JQuery Object> form
  */
  disableInputsForm (form) {
    form.find('input').prop('readonly', true)
    form.addClass('readonly')
    form.removeClass('edit')
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
      $('.loading').fadeOut(200)
      $('.loading').remove()

      alert('Ocorreu um erro. Tente novamente.')

      throw new Error(error)
    })
    .done(() => {
      $('.loading').fadeOut(200)
      $('.loading').remove()
    })
  },

  /*
   * @name bindEnableFormEditOrSave
   * @description Registra os eventos que tratam se a açao é uma ediçao ou uma alteraçao.
  */
  bindEnableFormEditOrSave () {
    $('.my-account-button-edit').on('click', event => {
      const _this = $(event.currentTarget)
      const form = _this.closest('form')

      if (_this.hasClass('account-password-button-required')) {
        const cookie = Cookies.get('1id')
        if (typeof cookie === 'undefined') {
          event.preventDefault()

          const $modalPassword = $('.av-modal--password-request')
          this.options.$targetForm = form
          $modalPassword.show()

          return false;
        }
      }

      this.enableInputsForm(form)
      form.removeClass('readonly')
      form.addClass('edit')
    })

    $('.my-account-button-save').on('click', event => {
        event.preventDefault()

        const form = $(event.currentTarget).closest('form')

        if (form.valid() === false) {
            return false
        }

        form.trigger('submit')
        // this.disableInputsForm(form)
    })

    $('.my-account-button-cancel').on('click', event => {
      const _this = $(event.currentTarget)
      const form = _this.closest('form')

      this.disableInputsForm(form)
    })
  },

  bindPasswordRequest () {
    $('.my-account__modal-password__form').on('submit', event => {
      event.preventDefault()

      const { $targetForm } = this.options
      const _this = $(event.currentTarget)
      const serialize = _this.serializeObject()
      
      if(serialize.password.length < 5) {
        if(!_this.find('input[name="password"]').hasClass('input--error')){
          _this.find('input[name="password"]').addClass('input--error')
          _this.find('.label--error').show()
        }
        
        return false
      } else {
        _this.find('.label--error').hide()
        _this.find('input[name="password"]').removeClass('input--error')
      }

      const query = {
        query: `query {
          auth(email: "${this.options.email}", password: "${serialize.password}") {
            code,
            cookie
          }
        }`
      }

      const payload = JSON.stringify(query)

      this.request(payload, response => {
        const $errors = $('.my-account__modal-password__errors')

        if (typeof response.errors !== 'undefined') {
          $errors.find('.my-account__modal-password__error').empty()
          response.errors.map(error => {
            $errors.append(`<div class="my-account__modal-password__error">${error.message}</div>`)
          })

          return false
        }

        Cookies.set('1id', response.data.auth.cookie)

        _this.find('input[type="password"]').val('')

        $('.av-modal--password-request').hide()

        this.enableInputsForm($targetForm)
        $targetForm.addClass('edit')
        $targetForm.removeClass('readonly')
      })
    })
  }
})