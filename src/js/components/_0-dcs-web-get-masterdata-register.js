APP.component.GetMasterDataRegister = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
  },

  setup (options) {
    if (typeof APP.i.Helpers === 'undefined') {
      throw new TypeError('You need Helpers Component installed.')
    }

    this.options = $.extend({
      helpers: APP.i.Helpers,
      $sportsBtn: $('.register-sports-add'),
      $storesBtn: $('.register-stores-add'),
      $privacyBtn: $('.register-privacy-btn'),
      $savesBtn: $('.selection-register-save-btn'),
      $targetSports: $('.selection-register-sports-list'),
      $targetStores: $('.selection-register-stores-list'),
      classSelectedItem: 'selected',
      $formRegister: $('.register-form'),

      mobileInitial: '',
      mobileFinal: '',
      classButtonSubmit: 'register-create-btn',

      urlSports: '/api/dataentities/ES/search?_fields=label,sport_id&_sort=label ASC',
      urlStores: '/api/dataentities/SL/search?_fields=name,store_id',

      sportTemplate (variables) {
        return variables.map(item => `
            <li class="register-sport-item register-item" data-id="${item.sport_id}" data-name="sport">
              <label class="${item.sport_id}">${item.label}
                <input type="checkbox" name="sports[list_sports][][id_sport]" class="register-checkbox" value="${item.sport_id}" />
              </label>
              <input type="hidden" name="sports[list_sports][][supprime]" value="false">
            </li>
          `).join('')
      },

      storeTemplate (variables) {
        return variables.map(item => `
            <li class="register-store-item register-item" data-id="${item.store_id}" data-name="store">
              <label>${item.name}
                <input type="radio" name="stores[num_third_usual]" class="register-checkbox" id="register-store-${item.store_id}" value="${item.store_id}"/>
              </label>
            </li>
          `).join('')
      }
    }, options)
  },

  start () {
    if ($('body').hasClass('register') || $('body').hasClass('edit-register')) {
      this.getSports()
      this.getStores()
      this.openPrivacyModal()
      this.selectItens()
      this.bindClearNull()
      this.bindSearchCEP()
      // this.validateFields()
      this.bindFieldMasks()
      this.sendForm()
      this.bindClickOptin()
      this.bindClickSexe()
    }

    if ($('body').hasClass('edit-register')) {
      this.checkMobileField()
    }

    if ($('body').hasClass('register')) {
      this.checkUserExist()
    }
  },

  getSports () {
    const {
      $sportsBtn,
      $targetSports,
      urlSports,
      sportTemplate
    } = this.options

    $.ajax({
      url: urlSports,
      type: 'GET',
      headers: {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json',
        'REST-Range': 'resources=0-500'
      },
      success: data => {
        $targetSports.html(sportTemplate(data))
      }
    })

    $sportsBtn.on('click', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)
      const target = $(`.${_this.attr('data-target')}`)
      APP.i.Modal.openModal(target)
    })
  },

  getStores () {
    const {
      $storesBtn,
      $targetStores,
      urlStores,
      storeTemplate
    } = this.options

    $.ajax({
      url: urlStores,
      type: 'GET',
      headers: {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json',
        'REST-Range': 'resources=0-500'
      },
      success: data => {
        $targetStores.html(storeTemplate(data))
      }
    })

    $storesBtn.on('click', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)
      const target = $(`.${_this.attr('data-target')}`)
      APP.i.Modal.openModal(target)
    })
  },

  selectItens () {
    const {
      $savesBtn
    } = this.options

    $('.selection-register-sports-list, .selection-register-stores-list').on('click', '.register-item > label', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)
      const checkBox = _this.find('.register-checkbox')

      const type = checkBox.attr('type')

      if (type === 'radio') {
        _this.parents('.av-modal').find('li').removeClass('register-item-selected')
        _this.parents('.register-item').addClass('register-item-selected')
        _this.parents('.selection-register-stores-list').find('label').removeClass('checked')
        _this.addClass('checked')
      } else {
        _this.parents('.register-item').toggleClass('register-item-selected')
        _this.toggleClass('checked')
      }

      if (checkBox.is(':checked')) {
        checkBox.removeAttr('checked')
      } else {
        checkBox.attr('checked', 'checked')
      }
    })

    $savesBtn.on('click', e => {
      const _this = $(e.currentTarget)
      const itemTarget = $(`.${_this.data('target')}`)

      const modal = _this.parents('.av-modal')
      const checked = modal.find('.register-item-selected').clone(true)
      itemTarget.find('.register-item-selected').remove()
      itemTarget.prepend(checked)

      this.removeSelectedItem()
      APP.i.Modal.closeModal()
      if ($('.register-sports-none').find('#sports-none').is(':checked')) {
        $('.register-sports-none').find('#sports-none').removeAttr('checked')
      }
    })
  },

  removeSelectedItem () {
    $('.register-sports-choice, .register-stores-choice').find('label.checked').on('click', e => {
      e.preventDefault()
    })

    $('.register-sports-choice, .register-stores-choice').find('.register-checkbox').on('click', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)
      const itemId = _this.val()

      $('.av-modal').find(`.register-checkbox[value="${itemId}"]`).parent('label').click()
      _this.parents('.register-item').remove()
    })
  },

  openPrivacyModal () {
    const {
      $privacyBtn
    } = this.options

    $privacyBtn.on('click', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)
      const target = $(`.${_this.attr('data-target')}`)
      APP.i.Modal.openModal(target)
    })
  },

  checkMobileField () {
    const {
      $formRegister
    } = this.options

    const intervalMobile = setInterval(() => {
      if ($formRegister.find('#mobile').val().length > 0) {
        clearInterval(intervalMobile)
        this.options.mobileInitial = $formRegister.find('#mobile').val()
      }
    })
  },

  sendForm (selfEl) {
    const {
      $formRegister
    } = this.options

    $formRegister.on('submit', e => {
      e.preventDefault()
      selfEl = $(e.currentTarget)
      console.log('disparou envio')

      setTimeout(function(){
        if ($formRegister.find('label.error').length > 0) {
          if ($('.input-group-gender').find('label.error')) $('.input-group-gender').addClass('input-fix-height')
          else $('.input-group-gender').removeClass('input-fix-height')

          if ($('.input-group-half-block').find('label.error')) $('.input-group-half-block').addClass('input-fix-height')
        } else {
          $('.input-group-gender,.input-group-half-block').removeClass('input-fix-height')
        }
      }, 500)

    }).validate({
      submitHandler: form => {
        console.log('passou do submit handler')
        if ($('body').hasClass('edit-register')) {
          const email = selfEl.find('[name="contact[email]"]').val()
          const oldPassword = selfEl.find('[name="old_password"]').val()
          const newPassword = selfEl.find('[name="new_password"]').val()
          if (oldPassword.length > 0 || newPassword.length > 0) {
            if (oldPassword.length > 0 && newPassword.length > 0) {
              this.checkPasswordChange(email, oldPassword, newPassword)
            } else {
              window.alert('POR FAVOR PREENCHA OU DEIXE VAZIO OS DOIS CAMPOS DE SENHA') // eslint-disable-line no-undef,no-alert
            }
          } else {
            this.sendRegister()
          }
        } else {
          this.sendRegister()
          console.log('enviou sem senha')
        }
      }
      })
  },

  checkPasswordChange (email, oldPassword, newPassword) {
    const mutation = {
      query: `mutation {
        changePassword(
          email: "${email}",

          old_password: "${oldPassword}",

          new_password: "${newPassword}"
        )
      }`
    }
    console.log(mutation)
    $.ajax({
      data: JSON.stringify(mutation),
      url: 'https://decathlonmyaccount--decathlonstore.myvtex.com/_v/graphql/private/v1',
      type: 'POST'
    }).then(response => {
      const data = $(response)[0].data
      console.log(data)
      if (data !== null) {
        console.log('alterado')
        window.alert('SENHA ALTERADA COM SUCESSO') // eslint-disable-line no-undef,no-alert
        this.sendRegister()
      } else {
        window.alert('SUA SENHA ATUAL ESTÁ ERRADA, POR FAVOR INSIRA A CORRETA') // eslint-disable-line no-undef,no-alert
      }
    }, error => {
      throw new Error(error)
      window.alert('Houve um erro, tente novamente') // eslint-disable-line no-undef,no-alert
    })
  },

  sendRegister (formAction, doNotPracticedSports, sports, billingId, shippingId, optin, additionalNumber, additionnalData, credential, shippingAddress, billingAddress, mobileCountryCode) {
    const {
      $formRegister
    } = this.options

    // console.log(sports)
    const objForm = $formRegister.serializeObject()
    const email = $formRegister.find('[name="contact[email]"]').val()
    const mobile = $formRegister.find('[name="contact[mobile]"]').val()
    if (this.options.mobileInitial !== mobile) {
      mobileCountryCode = 'BR'
    } else {
      mobileCountryCode = $formRegister.find('[name="contact[mobile_country_code]"]').val()
    }
    const landline = $formRegister.find('[name="contact[landline]"]').val()
    const landlineCountryCode = $formRegister.find('[name="contact[landline_country_code]"]').val()

    const idCountryCode = objForm.identity_individual.country_code
    console.log(idCountryCode)
    const language = $formRegister.find('[name="identity_individual[langue]"]').val()
    const name = $formRegister.find('[name="identity_individual[name]"]').val()
    const surname = $formRegister.find('[name="identity_individual[surname]"]').val()
    const nationalId = $formRegister.find('[name="identity_individual[national_id]"]').val()
    const sexe = $formRegister.find('[name="identity_individual[sexe]"]:checked').val()
    const name2 = $formRegister.find('[name="identity_individual[name2]"]').val()
    const birthdate = $formRegister.find('[name="identity_individual[birthdate]"]').val()
    const nationalIdType = $formRegister.find('[name="identity_individual[national_id_type]"]').val()
    // const policity = $formRegister.find('[name="identity_individual[policity]"]').is(':checked')
    // console.log(`${policity}`)
    // console.log(`${policity}`)

    const streetName = $formRegister.find('[name="billing_address[street_name]"]').val()
    if ($('body').hasClass('register')) {
      if (typeof objForm.billing_address.line2 !== 'undefined') {
        additionalNumber = objForm.billing_address.line2
      } else {
        additionalNumber = ''
      }

      if (typeof objForm.billing_address.additionnal_data !== 'undefined') {
        additionnalData = objForm.billing_address.additionnal_data
      } else {
        additionnalData = ''
      }
    }

    const title = $formRegister.find('[name="billing_address[title]"]').val()
    const streetNumber = $formRegister.find('[name="billing_address[street_number]"]').val()
    const district = $formRegister.find('[name="billing_address[district]"]').val()
    const postalCode = $formRegister.find('[name="billing_address[postal_code]"]').val()
    const city = $formRegister.find('[name="billing_address[city]"]').val()
    const province = $formRegister.find('[name="billing_address[province]"]').val()
    const countryCode = $formRegister.find('[name="billing_address[country_code]"]').val()

    if ($formRegister.find('[name="sports[do_not_practiced_sports]"]').is(':checked')) {
      console.log('checked')
      doNotPracticedSports = $formRegister.find('[name="sports[do_not_practiced_sports]"]').val()
      sports = null
    } else {
      if ($('.register-sports-choice').find('[name="sports[list_sports][][id_sport]"]').length > 0) {
        doNotPracticedSports = false
        objForm.sports.list_sports = objForm.sports.list_sports.map(item => {
          return {
            id_sport: parseInt(item.id_sport),
            supprime: false
          }
        })
        sports = objForm.sports.list_sports
      } else {
        doNotPracticedSports = true
        sports = null
      }
    }

    const store = $formRegister.find('[name="stores[num_third_usual]"]').val()

    // console.log(sports)
    // console.log('>>>>>')
    // console.log(JSON.stringify(sports))
    if (idCountryCode === 'BR') {
      if (typeof objForm.optin.value !== 'undefined') {
        objForm.optin.value = (objForm.optin.value == 'true')
      }

      if (typeof objForm.optin.decathlon !== 'undefined') {
        objForm.optin.decathlon = (objForm.optin.decathlon == 'true')
      }
    }

    if ($('body').hasClass('register')) {
      formAction = 'addUserFull'
      billingId = ''
      shippingId = ''
      objForm.shipping_address = null
      billingAddress = (typeof objForm.billing_address === 'undefined') ? null : JSON.stringify(objForm.billing_address).replace(/\"([^(\")"]+)\":/g,"$1:")
    } else {
      formAction = 'updateUser'
      billingId = $formRegister.find('[name="billing_address[id_address]"]').val()
      shippingId = $formRegister.find('[name="shipping_address[][id_address]"]').val()
      /* if (typeof objForm.shipping_address.is_prefered !== 'undefined') {
        objForm.shipping_address.is_prefered = (objForm.shipping_address.is_prefered == 'true')
      } */

      objForm.shipping_address = objForm.shipping_address.map(item => {
        item.is_prefered = (item.id_address === objForm.is_prefered)

        item.name = objForm.identity_individual.name
        item.surname = objForm.identity_individual.surname
        return item
      })

      shippingAddress = (typeof objForm.shipping_address === 'undefined') ? null : JSON.stringify(objForm.shipping_address, null, 2).replace(/\"([^(\")"]+)\":/g,'$1:')
    }

    optin = (typeof objForm.optin === 'undefined') ? null : JSON.stringify(objForm.optin).replace(/\"([^(\")"]+)\":/g, '$1:')
    credential = (typeof objForm.credential === 'undefined') ? null : JSON.stringify(objForm.credential).replace(/\"([^(\")"]+)\":/g, '$1:')

    // const password = $formRegister.find('[name="credential[password]"]').val()
    const mutation = {
      query: `mutation {
        ${formAction}(user: {
          contact: {
            email: "${email}",
            mobile: "${mobile}",
            mobile_country_code: "${mobileCountryCode}",
            landline: "${landline}",
            landline_country_code: "${landlineCountryCode}"
          }

          identity_individual: {
            name: "${name}",
            surname: "${surname}",
            national_id: "${nationalId}",
            sexe: ${sexe},
            name2: "${name2}",
            birthdate: "${birthdate}",
            national_id_type: "${nationalIdType}",
            country_code: "${idCountryCode}",
            language_code: "${language}"
          }

          ${(formAction === 'addUserFull' ? `billing_address: ${billingAddress}` : ``)}

          ${(formAction === 'updateUser' ? `shipping_address: ${shippingAddress}` : ``)}

          ${(idCountryCode === 'BR' ? `optin: ${optin}` : `optin: null`)}

          sports: {
            do_not_practiced_sports: ${doNotPracticedSports},
            list_sports: ${JSON.stringify(sports).replace(/(")/g, '')}
          }

          stores: {
            num_third_usual: ${store}
          }

          ${(formAction === 'addUserFull' ? `credential: ${credential}` : ``)}
        })
      }`
    }

    console.log(mutation)

    $.ajax({
      data: JSON.stringify(mutation),
      url: 'https://decathlonmyaccount--decathlonstore.myvtex.com/_v/graphql/private/v1',
      type: 'POST'
    }).then(() => {
      console.log('request ok')

      APP.i.flash_msg = new APP.component.FlashMsg()
      APP.i.flash_msg.showMsg('Suas alterações foram salvas', 'success')

      setTimeout(function(){
        if (formAction === 'addUserFull') {
          //window.alert('Cadastro efetuado com sucesso') // eslint-disable-line no-undef,no-alert
          window.location = '/'
        }

        if (formAction === 'updateUser') {
          //window.alert('Cadastro alterado com sucesso') // eslint-disable-line no-undef,no-alert
          window.location = '/minha-conta'
        }
      },5000)

    }, error => {
      throw new Error(error)
      //window.alert('Houve um erro, tente novamente') // eslint-disable-line no-undef,no-alert

      APP.i.flash_msg = new APP.component.FlashMsg()
      APP.i.flash_msg.showMsg('Erro ao salvar suas alterações', 'error')
    })
  },

  checkUserExist () {
    const {
      $formRegister,
      helpers
    } = this.options

    $formRegister.find('.input-text-email').on('blur', (e, fieldValue) => {
      const _this = $(e.currentTarget)
      const fieldName = _this.attr('id')
      const validateEmail = helpers._isValidEmailAddress(_this.val());

      if (validateEmail && _this.val().length > 0) {
        if (fieldName === 'email') {
          fieldValue = _this.val()
        } else {
          fieldValue = _this.cleanVal()
        }

        const query = {
          query: `query {
            userExist(field: "${fieldName}", value: "${fieldValue}")
          }`
        }

        console.log('query >>>', query)
        $.ajax({
          url: `https://resetpassword--decathlonstore.myvtex.com/_v/graphql/private/v1`,
          type: 'post',
          data: JSON.stringify(query)
        }).then(response => {
          console.log('response', response)
          const userExist = response.data.userExist

          _this.parents('.validate-group').find('.error-validation ul li span').text(fieldValue)

          if (userExist) {
            _this.removeClass('user-dont-exist')
            _this.addClass('user-already-exist')
            _this.parents('.validate-group').find('.error-validation').show()
          } else {
            _this.removeClass('user-already-exist')
            _this.addClass('user-dont-exist')
            _this.parents('.validate-group').find('.error-validation').hide()
          }
        }, error => {
          throw new Error(error)
        })
      }
    })
  },

  bindFieldMasks () {
    $('#postal_code').mask('00000-000')
    $('#landline').mask('(00) 0000-0000')
    $('#mobile').mask('(00) 0 0000-0000')
    $('#national_id').mask('000.000.000-00', { reverse: true })
    $('#birthdate').mask('00/00/0000', { placeholder: '  /  /    ' })
  },

  bindClearNull () {
    const {
      $targetSports,
      $targetStores
    } = this.options

    $('#sports-none').on('click', () => {
      $('.register-sports-choice').find('.register-item-selected').remove()
      $targetSports.find('label.checked').removeClass('checked').find('input:checked').removeAttr('checked').parents('.register-item').removeClass('register-item-selected')
    })

    $('#stores-none').on('click', () => {
      $('.register-stores-choice').find('.register-item-selected').remove()
      $targetStores.find('label.checked').removeClass('checked').find('input:checked').removeAttr('checked').parents('.register-item').removeClass('register-item-selected')
    })
  },

  bindSearchCEP () {
    const {
      $formRegister
    } = this.options

    $(document).on('keyup', '[name="billing_address[postal_code]"]', event => {
      let term = $(event.currentTarget).val()

      if (term.length < 8) {
        return false
      }

      term = term.replace(/\D/g, '')

      $.get(`https://viacep.com.br/ws/${term}/json/`, response => {
        if (response.erro) {
          console.log('Nao foi possivel encontrar o endereço do CEP informado.')
          return false
        }

        $formRegister.find('[name="billing_address[street_name]"]').val(response.logradouro)
        $formRegister.find('[name="billing_address[district]"]').val(response.bairro)
        $formRegister.find('[name="billing_address[city]"]').val(response.localidade)
        $formRegister.find('[name="billing_address[province]"]').val(response.uf)
        $formRegister.find('[name="billing_address[province]"]').selectpicker('refresh')
      })
    })
  },

  validateFields () {
    $('.register-form').validate({
      rules: {
        email: {
          required: true,
          email: true
        },

        password: {
          required: true
        }
      }
    })
  },

  bindClickOptin () {
    const {
      $formRegister
    } = this.options

    $formRegister.find('[name="optin[value]"]').on('click', e => {
      const _this = $(e.currentTarget)
      $formRegister.find('[name="optin[value]"]').removeAttr('checked')
      _this.attr('checked', 'checked')
    })

    $formRegister.find('[name="optin[decathlon]"]').on('click', e => {
      const _this = $(e.currentTarget)
      $formRegister.find('[name="optin[decathlon]"]').removeAttr('checked')
      _this.attr('checked', 'checked')
    })

  },

  bindClickSexe () {
    const {
      $formRegister
    } = this.options

    $formRegister.find('[name="identity_individual[sexe]"]').on('click', e => {
      const _this = $(e.currentTarget)
      $formRegister.find('[name="identity_individual[sexe]"]').removeAttr('checked')
      _this.attr('checked', 'checked')
    })
  }

})
