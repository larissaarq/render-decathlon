APP.component.AccountData = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.options = {
      $formRegister: $('.register-form'),
      $targetAddress: $('.shipping-addresses'),

      addressTemplate (variables) {
        return variables.map(item => `
                <div class="shipping-address-block" data-type="${item.address_type}">
                  <br>
                  <hr/>
                  ${(item.is_prefered === false ? '<div class="remove-address"><a href="javascript:;" class="btn-remove-address">Remover Endereço</a></div>' : '')}
                  <div class="prefered-group">
                    <input type="radio" name="is_prefered" id="is_prefered" value="${item.id_address}" ${(item.is_prefered === false ? '' : 'checked="checked"')}>
                    <label for="is_prefered">Este é meu endereço preferido</label>
                  </div>
                  <div class="input-group-full-block">
                    <div class="input-title input-text-large">
                      <label for="title">Identificador do Endereço (Ex: Casa, Trabalho, etc...)</label>
                      <input type="text" name="shipping_address[][title]" id="title" class="input-text" aria-label="Identificador do Endereço" value="${item.title}">
                    </div>
                  </div>
                  <div class="input-group-half-block">
                    <div class="input-cep input-text-small">
                      <label for="postal_code">CEP *</label>
                      <input type="text" name="shipping_address[][postal_code]" id="postal_code" class="input-text" aria-label="CEP" required="required" value="${item.postal_code}">
                    </div>                                                
                    <div class="input-street input-text-medium">
                      <input type="hidden" name="shipping_address[][id_address]" value="${item.id_address}">
                      <input type="hidden" name="shipping_address[][country_code]" value="${item.country_code}">
                      <input type="hidden" name="shipping_address[][name]" value="${item.name}">
                      <input type="hidden" name="shipping_address[][surname]" value="${item.surname}">
                      <label for="street_name">Rua / Avenida *</label>
                      <input type="text" name="shipping_address[][street_name]" id="street_name" class="input-text" aria-label="Rua / Avenida" required="required" value="${item.street_name}">
                    </div>
                    <div class="input-number input-text-small">
                      <label for="street_number">Número *</label>
                      <input type="text" name="shipping_address[][street_number]" id="street_number" class="input-text" aria-label="Número" required="required" value="${item.street_number}">
                    </div>                    
                    <div class="input-address2 input-text-medium">
                      <label for="line2">Complemento</label>
                      <input type="text" name="shipping_address[][line2]" id="line2" class="input-text" aria-label="Complemento" value="${(item.line2 === 'null' ? '' : item.line2)}" maxlength="50">
                    </div>
                    <div class="input-district input-text-large">
                      <label for="district">Bairro *</label>
                      <input type="text" name="shipping_address[][district]" id="district" class="input-text" aria-label="Bairro" required="required" value="${item.district}">
                    </div>
                  </div>
                  <div class="input-group-half-block">
                    <div class="input-city input-text-medium">
                      <label for="city">Cidade *</label>
                      <input type="text" name="shipping_address[][city]" id="city" class="input-text" aria-label="Cidade" required="required" value="${item.city}">
                    </div>
                    <div class="input-province input-text-small">
                      <label for="province">UF *</label>
                      <select type="text" name="shipping_address[][province]" id="province" class="select-uf" aria-label="Estado" required="required">
                        <option value=""></option>
                        <option${(item.province === 'AC' ? ' selected' : '')} value="AC">AC</option>
                        <option${(item.province === 'AL' ? ' selected' : '')} value="AL">AL</option>
                        <option${(item.province === 'AM' ? ' selected' : '')} value="AM">AM</option>
                        <option${(item.province === 'AP' ? ' selected' : '')} value="AP">AP</option>
                        <option${(item.province === 'BA' ? ' selected' : '')} value="BA">BA</option>
                        <option${(item.province === 'CE' ? ' selected' : '')} value="CE">CE</option>
                        <option${(item.province === 'DF' ? ' selected' : '')} value="DF">DF</option>
                        <option${(item.province === 'ES' ? ' selected' : '')} value="ES">ES</option>
                        <option${(item.province === 'GO' ? ' selected' : '')} value="GO">GO</option>
                        <option${(item.province === 'MA' ? ' selected' : '')} value="MA">MA</option>
                        <option${(item.province === 'MG' ? ' selected' : '')} value="MG">MG</option>
                        <option${(item.province === 'MS' ? ' selected' : '')} value="MS">MS</option>
                        <option${(item.province === 'MT' ? ' selected' : '')} value="MT">MT</option>
                        <option${(item.province === 'PA' ? ' selected' : '')} value="PA">PA</option>
                        <option${(item.province === 'PB' ? ' selected' : '')} value="PB">PB</option>
                        <option${(item.province === 'PE' ? ' selected' : '')} value="PE">PE</option>
                        <option${(item.province === 'PI' ? ' selected' : '')} value="PI">PI</option>
                        <option${(item.province === 'PR' ? ' selected' : '')} value="PR">PR</option>
                        <option${(item.province === 'RJ' ? ' selected' : '')} value="RJ">RJ</option>
                        <option${(item.province === 'RN' ? ' selected' : '')} value="RN">RN</option>
                        <option${(item.province === 'RS' ? ' selected' : '')} value="RS">RS</option>
                        <option${(item.province === 'RO' ? ' selected' : '')} value="RO">RO</option>
                        <option${(item.province === 'RR' ? ' selected' : '')} value="RR">RR</option>
                        <option${(item.province === 'SC' ? ' selected' : '')} value="SC">SC</option>
                        <option${(item.province === 'SE' ? ' selected' : '')} value="SE">SE</option>
                        <option${(item.province === 'SP' ? ' selected' : '')} value="SP">SP</option>
                        <option${(item.province === 'TO' ? ' selected' : '')} value="TO">TO</option>
                      </select>
                    </div>
                    <div class="input-reference input-text-large">
                      <label for="additionnal_data">Referência para Entrega</label>
                      <input type="text" name="shipping_address[][additionnal_data]" id="additionnal_data" class="input-text" aria-label="Referência para Entrega" value="${(item.additionnal_data === 'null' ? '' : item.additionnal_data)}">
                    </div>
                    <input type="hidden" name="shipping_address[][status]" value="">
                  </div>
                  <hr/>
                </div>
              `).join('')
      }
    }
  },
  start () {
    if ($('body').hasClass('edit-register')) {
      $.ajax({
        url: '/no-cache/profileSystem/getProfile',
        type: 'get'
      }).then(response => {
        const email = response.Email
        console.log(email)
        this.getUserData(email)
      }, error => {
        console.error('Error on get user profile.')

        throw new Error(error)
      })
    }
  },

  getUserData (email) {
    const query = JSON.stringify({
      query: `query {
        userDecathlon(email: "${email}") {
          contact {
            email
            mobile
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
        }
      }`
    })

    $.ajax({
      url: `https://decathlonmyaccount--decathlonstore.myvtex.com/_v/graphql/private/v1`,
      type: 'post',
      data: query
    }).then(response => {
      const userData = response.data.userDecathlon
      this.populateForm(userData)
    }, error => {
      throw new Error(error)
    })
  },

  populateForm (userData, streetName, streetNumber, district, postalCode, city, province) {
    console.log(userData)
    const {
      $formRegister
    } = this.options

    $formRegister.find('[name="contact[email]"]').val(userData.contact.email)
    $formRegister.find('[name="contact[mobile]"]').val(userData.contact.mobile)
    $formRegister.find('[name="contact[mobile_country_code]"]').val(userData.contact.mobile_country_code)
    $formRegister.find('[name="contact[landline]"]').val(userData.contact.landline)
    $formRegister.find('[name="contact[landline_country_code]"]').val(userData.contact.landline_country_code)

    $formRegister.find('[name="contact[landline]"]').val(userData.contact.landline)
    $formRegister.find('[name="identity_individual[country_code]"]').val(userData.identity_individual.country_code)
    $formRegister.find('[name="identity_individual[langue]"]').val(userData.identity_individual.langue)
    $formRegister.find('[name="identity_individual[name]"]').val(userData.identity_individual.name)
    $formRegister.find('[name="identity_individual[surname]"]').val(userData.identity_individual.surname)
    $formRegister.find('[name="identity_individual[national_id]"]').val(userData.identity_individual.national_id)
    $formRegister.find('[name="identity_individual[sexe]"][value="' + userData.identity_individual.sexe + '"]').click()
    $formRegister.find('[name="identity_individual[national_id]"]').val(userData.identity_individual.national_id)
    $formRegister.find('[name="identity_individual[name2]"]').val(userData.identity_individual.name2)
    $formRegister.find('[name="identity_individual[birthdate]"]').val(userData.identity_individual.birthdate)

    if (userData.shipping_address !== null) {
      if (userData.shipping_address.street_name) {
        streetName = userData.shipping_address.street_name
      }

      let line2 = JSON.stringify(userData.shipping_address.line2)
      if (line2 === 'null' || line2 === 'undefined') {
        line2 = ''
      } else {
        line2 = JSON.stringify(userData.shipping_address.line2)
      }

      if (userData.shipping_address.street_number) {
        streetNumber = userData.shipping_address.street_number
      }

      if (userData.shipping_address.district) {
        district = userData.shipping_address.district
      }

      if (userData.shipping_address.postal_code) {
        postalCode = userData.shipping_address.postal_code
      }

      if (userData.shipping_address.city) {
        city = userData.shipping_address.city
      }

      province = userData.shipping_address.province

      const addressList = userData.shipping_address

      this.populateAddress(addressList)

      /* let additionnalData = JSON.stringify(userData.shipping_address.additionnal_data)
      if (additionnalData === 'null' || additionnalData === 'undefined') {
        additionnalData = ''
      } else {
        additionnalData = JSON.stringify(userData.shipping_address.additionnal_data)
      } */
    }

    this.checkCountry(userData)

    const sports = userData.sports.list_sports

    const sportsApiArr = []

    for (const sport of sports) {
      const sportId = sport.id_sport
      $('.selection-register-sports-list .register-item').find(`label.${sportId}`).click()
      $('.av-modal-register--sports').find('.selection-register-save-btn').click()
      sportsApiArr.push(sportId)
    }

    const sportsMdArr = []
    $('.selection-register-sports-list .register-item').each((i, e) => {
      const _this = $(e)
      const sportId = _this.data('id')
      sportsMdArr.push(sportId)
    })

    if (userData.sports.do_not_practiced_sports === true) {
      $formRegister.find('[name="sports[do_not_practiced_sports]"]').click()
    }

    this.checkSports(sportsApiArr, sportsMdArr)

    this.bindFieldMasks()
  },

  populateAddress (addressList) {
    const {
      $formRegister,
      $targetAddress,
      addressTemplate
    } = this.options

    $targetAddress.html(addressTemplate(addressList))

    const intervalSelect = setInterval(() => {
      if ($formRegister.find('.select-uf').length > 0) {
        clearInterval(intervalSelect)
        $formRegister.find('.select-uf').selectpicker({ noneSelectedText: 'UF' })
        $formRegister.find('.shipping-address-block').each((i, e) => {
          const _this = $(e)
          const postalCode = _this.find('#postal_code')
          postalCode.mask('00000-000')
          postalCode.val(postalCode.masked())
        })
      }
    })

    this.addAddressBlock()
    this.removeAddressBlock()
  },

  addAddressBlock () {
    const {
      $formRegister,
      $targetAddress,
      addressTemplate
    } = this.options

    $('.btn-add-address').on('click', e => {
      e.preventDefault()
      const emptyList = [{
        street_name: '',
        street_number: '',
        line2: '',
        additionnal_data: '',
        district: '',
        city: '',
        province: '',
        postal_code: '',
        status: 'POST',
        country_code: 'BR',
        id_address: '',
        title: '',
        address_type: '2',
        is_prefered: false
      }]

      $targetAddress.append(addressTemplate(emptyList))
      const intervalSelect = setInterval(() => {
        if ($formRegister.find('.select-uf').length > 0) {
          clearInterval(intervalSelect)
          $formRegister.find('.select-uf').last().selectpicker({ noneSelectedText: 'UF' })
        }
      }, 100)

      $formRegister.find('.shipping-address-block').last().find('[name="shipping_address[][status]"]').val('POST')
      $formRegister.find('.shipping-address-block:last-child').find('#postal_code').mask('00000-000')
    })
  },

  removeAddressBlock () {
    $('body').on('click', '.remove-address', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)
      if (_this.parents('.shipping-address-block').find('[name="shipping_address[][status]"]').val() === 'POST') {
        _this.parents('.shipping-address-block').remove()
      } else {
        _this.parents('.shipping-address-block').find('[name="shipping_address[][status]"]').val('DELETE')
        _this.parents('.shipping-address-block').hide()
      }
    })
  },

  checkSports (sportsApiArr, sportsMdArr) {
    const result = sportsApiArr.filter(id => {
      return !sportsMdArr.includes(id)
    })

    for (const field of result) {
      $('.register-sports-choice').append(`
        <input type="hidden" class="hidden-id" name="sports[list_sports][][id_sport]" value="${field}"/>
        <input type="hidden" name="sports[list_sports][][supprime]" value="false"/>
      `)
    }
  },

  checkCountry (userData) {
    const {
      $formRegister
    } = this.options
    const storeId = userData.stores.num_third_usual
    if (userData.identity_individual.country_code === 'BR') {
      if (storeId === 811) {
        $('#stores-none').click()
      } else {
        $('.selection-register-stores-list .register-item').find('[value="' + storeId + '"]').click().parents('.av-modal-register--stores').find('.selection-register-save-btn').click()
      }
      $formRegister.find('[name="optin[id]"]').val(userData.optin.id)
      $formRegister.find('[name="optin[type]"]').val(userData.optin.type)
      $formRegister.find('[name="optin[value]"][value="' + userData.optin.value + '"]').click()
    } else {
      $formRegister.find('.register-stores-choice, .register-stores-none').hide()
      $formRegister.find('.register-stores-list').append('<p class="stores-message">Sua conta foi criada em outro país. Para alterar sua loja favorita, entre em contato com a Decathlon no país de origem.</p>')
      $formRegister.find('.register-stores-choice').append(`<input type="radio" name="stores[num_third_usual]" class="register-checkbox" value="${storeId}"/>`)
      $formRegister.find('.newsletter-group').remove()
      $formRegister.find('.register-newsletter').append('<p class="newsletter-message">Sua conta foi criada em outro país. Para alterar suas preferêncas, entre em contato com a Decathlon no país de origem.</p>')
    }
  },

  bind () {

  },

  bindFieldMasks () {
    const {
      $formRegister
    } = this.options
    if ($('.input-text').val().length > 0) {
      $('#birthdate').mask('0000/00/00')
      const splitDate = $formRegister.find('#birthdate').val().split('/')
      const birthdate = splitDate[2] + splitDate[1] + splitDate[0]
      $formRegister.find('#birthdate').val(birthdate)
      $('#birthdate').mask('00/00/0000')
      $('#postal_code').mask('00000-000')
      $('#landline').mask('(00) 0000-0000')
      $('#mobile').mask('(00) 0 0000-0000')
      $('#national_id').mask('000.000.000-00', { reverse: true })
      this.bindRemaskFields()
    }
  },

  bindRemaskFields () {
    $('#landline').val($('#landline').masked())
    $('#mobile').val($('#mobile').masked())
    $('#national_id').val($('#national_id').masked())
  }

})
