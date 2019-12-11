APP.component.MyAccountProfileContact = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      $loaderContainer: $('.connection-container'),
      $formContact: $('.my-account-page--profile__connection'),
      $mobileInput: $('[name="contact[mobile]"]'),
      $emailInput: $('[name="contact[email]"]'),

      emailValidationText: {
        valid: 'Endereço de e-mail verificado',
        invalid: 'Endereço de e-mail ainda não verificado'
      },

      mobileValidationText: {
        valid: 'Número de telefone verificado',
        invalid: 'Número de telefone ainda não verificado'
      }
    }, options);
  },

  start () {
    const {
      mobile_valid,
      email_valid
    } = this.options

    this._fillContactForm();
    
    this.changeValidationContactFieldMessage(mobile_valid, email_valid)
  },

  _fillContactForm () {
    const {
      $mobileInput,
      $emailInput
    } = this.options

    const {
      email,
      mobile
    } = this.options.contact

    $emailInput.val(email)
    $mobileInput.val(mobile)
  },

  /**
   * @name saveContact
   * @description Envia o payload da seçao de contato para a api e retorna
   *              um objeto com a mensagem de feedback.
   * @param <Object> data
   */
  saveContact(data, next) {
    const query = JSON.stringify({
      query: `mutation {
        updateUserContact(
          email: "${this.options.email}",
          cookie: "${Cookies.get('1id')}",
          contact: {
            email: "${data.email}",
            mobile: "${data.mobile}",
            mobile_country_code: "BR",
            landline: "",
            landline_country_code: ""
          }
        )
      }`
    })

    this.request(query, response => {
      if (typeof response.errors !== 'undefined') {
        if (response.errors[0].message === 'Token expirado') {
          Cookies.remove('1id')

          window.location.href = '/no-cache/user/logout'

          return false
        }
      }

      next(response)
    })
  },

  changeValidationContactFieldMessage (mobileIsValid, emailIsValid) {

    const $mobileValidationContainer = $('[name="contact[mobile]"] + small')
    const $emailValidationContainer = $('[name="contact[email]"] + small')
    /* const $cpfValidationContainer = $('[name="contact[cpf]"] + small') */

    if (!mobileIsValid) {
      $mobileValidationContainer.removeClass('valid').addClass('invalid')
      $mobileValidationContainer.html(this.options.mobileValidationText.invalid)
    } else {
      $mobileValidationContainer.removeClass('invalid').addClass('valid')
      $mobileValidationContainer.html(this.options.mobileValidationText.valid)
    }

    /* if (!cpfIsValid) {
      $cpfValidationContainer.removeClass('valid').addClass('invalid')
      $cpfValidationContainer.html(this.options.cpfValidationText.invalid)
    } else {
      $cpfValidationContainer.removeClass('invalid').addClass('valid')
      $cpfValidationContainer.html(this.options.cpfValidationText.valid)
    } */

    if (!emailIsValid) {
      $emailValidationContainer.removeClass('valid').addClass('invalid')
      $emailValidationContainer.html(this.options.emailValidationText.invalid)
    } else {
      $emailValidationContainer.removeClass('invalid').addClass('valid')
      $emailValidationContainer.html(this.options.emailValidationText.valid)
    }
  },

  bind () {
    this._bindFieldMasks()
    this._bindFormSubmitContact()
  },

  /**
   * @name bindFieldMasks
   * @description Registra as máscaras dos campos de entrada de texto.
   */
  _bindFieldMasks () {
    const {
      $mobileInput
    } = this.options

    $mobileInput.mask('(00) 0 0000-0000'); 
  },

  /**
   * @name bindFormSubmitFunction
   * @description Cancela o submit e executa uma funçao específica.
   */
  _bindFormSubmitContact () {
    const {
      $emailInput,
      $formContact,
      $mobileInput
    } = this.options

    $formContact.on('submit', event => {
      event.preventDefault()
      
      const data = {
        email: $emailInput.val(),
        mobile: $mobileInput.val().replace(/[^0-9]/g, '')
      }

      this.saveContact(data, response => {
        console.log('saveContact Form Response:', response)

        if (response.data && response.data.updateUserContact == "success") {
          APP.i.flash_msg = new APP.component.FlashMsg()        
          APP.i.flash_msg.showMsg('Suas alterações foram salvas', 'success')
          
          APP.i.currentController.disableInputsForm($(event.currentTarget))
        } else {
          if (response.errors && response.errors.length > 0) {
            APP.i.flash_msg = new APP.component.FlashMsg()
            APP.i.flash_msg.showMsg('Erro ao salvar suas alterações', 'error')
          }
        }
      })
    })
  },

  /**
   * @name request
   * @description Faz a requisiçao na api Graphql.
   * @param <Object> query
   * @param <Function> next
   */
  request (query, next) {
    const { endpoint, $loaderContainer } = this.options

    if ($loaderContainer.find('.loading-absolute').length === 0) {
      $loaderContainer.append('<div class="loading-absolute"></div>')
    }

    const $loading = $loaderContainer.find('.loading-absolute')

    $loading.fadeIn(200)

    $.post("https://decathlonmyaccount--decathlonstore.myvtex.com/_v/graphql/private/v1", query).then(response => {
      $loading.fadeOut(100)

      if (typeof next !== 'function') {
        return false
      }

      next(response)
    })
    .fail(error => {
      throw new Error(error)
    })
    // $.post(endpoint, query).then(response => {
    //   $loading.fadeOut(100)

    //   if (typeof next !== 'function') {
    //     return false
    //   }

    //   next(response)
    // })
    // .fail(error => {
    //   throw new Error(error)
    // })
  }
})
