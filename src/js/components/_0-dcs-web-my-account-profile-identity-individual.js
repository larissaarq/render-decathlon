APP.component.MyAccountProfileIdentityIndividual = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      $loaderContainer: $('.identity-individual-container'),
      //genderSelect: 'select-sexe',
      $formIdentityIndividual: $('.my-account-page--profile__personal-informations'),
      $sexeInput: $('[name="identity_individual[sexe]"]'),
      $nameInput: $('[name="identity_individual[name]"]'),
      $surnameInput: $('[name="identity_individual[surname]"]'),
      $birthdateInput: $('[name="identity_individual[birthdate]"]'),
    }, options)
  },

  start () {
    //const { genderSelect } = this.options

    this._fillIdentityIndividualForm()

    //$(`.${genderSelect}`).selectpicker()
  },

  _fillIdentityIndividualForm () {
    const {
      //genderSelect,
      //$sexeInput,
      $nameInput,
      $surnameInput,
      $birthdateInput,
    } = this.options

    const {
      sexe,
      name,
      surname,
      birthdate,
    } = this.options.identity_individual

    //$(`.${genderSelect} option[value="${sexe}"]`).attr('selected','selected')

    $(`[name="identity_individual[sexe]"][value="${sexe}"]`).attr('checked','checked')
    $nameInput.val(name)
    $surnameInput.val(surname)
    $birthdateInput.val(birthdate === null ? '' : this.parseDateTimeToBrazilian(birthdate))
  },

  parseDateTimeToBrazilian (date) {
    return date.replace(/(\d{4})-(\d{2})-(\d{2})/g, '$3/$2/$1')
  },

  saveIdentityIndividual (data, next) {
    const query = JSON.stringify({
      query: `mutation {
        updateUserIdentity(
          email: "${this.options.email}",
          cookie: "${Cookies.get('1id')}",
          identity_individual: {
            name: "${data.name}",
            surname: "${data.surname}",
            national_id: "${this.options.identity_individual.national_id}",
            sexe: ${data.sexe},
            name2: "${this.options.identity_individual.name2}",
            birthdate: "${data.birthdate}",
            national_id_type: "CPF",
            country_code: "BR",
            language_code: "pt"
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

  bind () {
    this._bindFieldMasks()
    this._bindChangeGender()
    this._bindFormSubmitIdentityIndividual()
  },

  _bindChangeGender () {
    $(`[name="identity_individual[sexe]"]`).on('change', event => {
      event.preventDefault()

      const _this = $(event.currentTarget)      

      $(`[name="identity_individual[sexe]"]`).removeAttr('checked')
      _this.attr('checked', 'checked')
      _this.attr('checked', true)

      return true
    })
  },

  /**
   * @name _bindFormSubmitIdentityIndividual
   * @description Cancela o submit e executa uma funçao específica.
  */
  _bindFormSubmitIdentityIndividual () {
    const {
      $formIdentityIndividual,
      //genderSelect,
      $nameInput,
      $surnameInput,
      $birthdateInput,
    } = this.options

    $formIdentityIndividual.on('submit', event => {
      event.preventDefault()

      const data = {
        //sexe: $(`.${genderSelect} :selected`).val(),
        sexe: $(`[name="identity_individual[sexe]"][checked="checked"]`).val(),
        name: $nameInput.val(),
        surname: $surnameInput.val(),
        birthdate: $birthdateInput.val(),
      }

      this.saveIdentityIndividual(data, response => {
        console.log('saveIdentityIndividual Form Response:', response)

        if (response.data && response.data.updateUserIdentity == "success") {
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
   * @name _bindFieldMasks
   * @description Registra as máscaras dos campos de entrada de texto.
  */
  _bindFieldMasks () {
    const {
      $birthdateInput
    } = this.options

    $birthdateInput.mask('00/00/0000', { placeholder: '  /  /    ' })
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

    $.post(endpoint, query).then(response => {
      $loading.fadeOut(100)

      if (typeof next !== 'function') {
        return false
      }

      next(response)
    })
    .fail(error => {
      throw new Error(error)
    })
  }
})
