APP.component.MyAccountProfileAddress = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      form: 'address--form',
      $addressList: $('.address-list'),
      $loaderContainer: $('.address-container'),
      $formContainer: $('.my-account-profile__address--form-container'),

      listTemplate (address) {
        return `<li class="addresses--item" data-id="${address.id_address}">
          <div class="address-actions">
            <button class="update-address" data-id="${address.id_address}">Alterar</button>
            <button class="remove-address" ${(address.is_prefered !== true ? `` : 'hidden')} data-id="${address.id_address}">Excluir</button>
          </div>
          <div class="address-summary">
            <label>${(address.title != null ? `${address.title}` : '')}</label>
            <div class="address-text">
              ${address.street_name}, ${address.street_number}, ${address.district} - ${address.city} / ${address.province} CEP ${address.postal_code}
            </div>
            <div class="prefered-group ${(address.is_prefered === false ? '' : 'prefered')}">
              <input id="is_prefered-${address.id_address}" type="radio" name="is_prefered" value="${address.id_address}" ${(address.is_prefered === false ? '' : 'checked="checked"')}>
              <label for="is_prefered-${address.id_address}">Endereço padrão</label>
            </div>
          </div>
        </li>`
      },

      formTemplate (address) {
        return `<form class="address--form hidden">
                  <input type="hidden" name="id_address" value="" />
                  <input type="hidden" name="billing_address[is_prefered]" value="" />

                  <div class="input-group address-info">
                    <h3 class="address-form-subtitle">Endereço de Entrega</h3>
                    <div class="input-group-half-full">
                      <div class="input-title input-text-large">
                        <label for="title">Identificador do Endereço (Ex: Casa, Trabalho, etc...)</label>
                        <input type="text" name="billing_address[title]" id="title" class="input-text" aria-label="Identificador do Endereço" required="required" maxlength="25"/>
                      </div>
                    </div>
                    <div class="input-group-half-block">
                      <div class="input-cep input-text-small">
                        <label for="postal_code">CEP *</label>
                        <input type="text" name="billing_address[postal_code]" id="postal_code" class="input-text" aria-label="CEP" required="required"/>
                      </div>
                      <div class="input-street input-text-medium">
                        <input type="hidden" name="billing_address[country_code]" value="BR"/>
                        <label for="street_name">Rua / Avenida *</label>
                        <input type="text" name="billing_address[street_name]" id="street_name" class="input-text" aria-label="Rua / Avenida" required="required"/>
                      </div>
                    </div>
                    <div class="input-group-half-block">
                      <div class="input-number input-text-small">
                        <label for="street_number">Número *</label>
                        <input type="text" name="billing_address[street_number]" id="street_number" class="input-text" aria-label="Número" required="required"/>
                      </div>
                      <div class="input-address2 input-text-medium">
                        <label for="line2">Complemento</label>
                        <input type="text" name="billing_address[line2]" id="line2" class="input-text" aria-label="Complemento" maxlength="10"/>
                      </div>
                    </div>
                    <div class="input-group-half-block">
                      <div class="input-district input-text-large">
                        <label for="district">Bairro *</label>
                        <input type="text" name="billing_address[district]" id="district" class="input-text" aria-label="Bairro" required="required"/>
                      </div>
                    </div>

                    <div class="input-group-half-block">
                      <div class="input-city input-text-medium">
                        <label for="city">Cidade *</label>
                        <input type="text" name="billing_address[city]" id="city" class="input-text" aria-label="Cidade" required="required"/>
                      </div>
                      <div class="input-province input-text-small">
                        <label for="province">UF *</label>
                        <select type="text" name="billing_address[province]" id="province" class="select-uf show" aria-label="Estado" required="required">
                          <option value=""></option>
                          <option${(address.province === 'AC' ? ' selected' : '')} value="AC">AC</option>
                          <option${(address.province === 'AL' ? ' selected' : '')} value="AL">AL</option>
                          <option${(address.province === 'AM' ? ' selected' : '')} value="AM">AM</option>
                          <option${(address.province === 'AP' ? ' selected' : '')} value="AP">AP</option>
                          <option${(address.province === 'BA' ? ' selected' : '')} value="BA">BA</option>
                          <option${(address.province === 'CE' ? ' selected' : '')} value="CE">CE</option>
                          <option${(address.province === 'DF' ? ' selected' : '')} value="DF">DF</option>
                          <option${(address.province === 'ES' ? ' selected' : '')} value="ES">ES</option>
                          <option${(address.province === 'GO' ? ' selected' : '')} value="GO">GO</option>
                          <option${(address.province === 'MA' ? ' selected' : '')} value="MA">MA</option>
                          <option${(address.province === 'MG' ? ' selected' : '')} value="MG">MG</option>
                          <option${(address.province === 'MS' ? ' selected' : '')} value="MS">MS</option>
                          <option${(address.province === 'MT' ? ' selected' : '')} value="MT">MT</option>
                          <option${(address.province === 'PA' ? ' selected' : '')} value="PA">PA</option>
                          <option${(address.province === 'PB' ? ' selected' : '')} value="PB">PB</option>
                          <option${(address.province === 'PE' ? ' selected' : '')} value="PE">PE</option>
                          <option${(address.province === 'PI' ? ' selected' : '')} value="PI">PI</option>
                          <option${(address.province === 'PR' ? ' selected' : '')} value="PR">PR</option>
                          <option${(address.province === 'RJ' ? ' selected' : '')} value="RJ">RJ</option>
                          <option${(address.province === 'RN' ? ' selected' : '')} value="RN">RN</option>
                          <option${(address.province === 'RS' ? ' selected' : '')} value="RS">RS</option>
                          <option${(address.province === 'RO' ? ' selected' : '')} value="RO">RO</option>
                          <option${(address.province === 'RR' ? ' selected' : '')} value="RR">RR</option>
                          <option${(address.province === 'SC' ? ' selected' : '')} value="SC">SC</option>
                          <option${(address.province === 'SE' ? ' selected' : '')} value="SE">SE</option>
                          <option${(address.province === 'SP' ? ' selected' : '')} value="SP">SP</option>
                          <option${(address.province === 'TO' ? ' selected' : '')} value="TO">TO</option>
                        </select>
                      </div>
                    </div>
                    <div class="input-group-half-block">
                      <div class="input-reference input-text-large">
                        <label for="additionnal_data">Referência para Entrega</label>
                        <input type="text" name="billing_address[additionnal_data]" id="additionnal_data" class="input-text" aria-label="Referência para Entrega"/>
                      </div>
                    </div>
                  </div>
                  <p class="my-account__buttons">
                    <button type="button" class="my-account-button-cancel button button--gray">Cancelar</button>
                    <button type="submit" class="my-account-button-save button button--yellow">Salvar alterações</button>
                  </p>
                </form>`
      }
    }, options)
    // console.log(this)
  },

  start () {
    this.listAddresses(this.options.addresses)
  },

  listAddresses (addresses) {
    const {
      listTemplate,
      $addressList
    } = this.options

    $addressList.html('')

    if (addresses.length === 0) {
      return false
    }

    addresses.map((address) => {
      if (address.address_type === 1) {
        return true
      }

      const template = listTemplate(address)

      $addressList.append(template)
    })
  },

  saveAddress (data, next) {
    console.log('--- saveAddress ---')
    console.log('>>>', data.is_prefered)

    const query = {
      query: `mutation {
        addUserShippingAddress(
          email: "${this.options.email}",
          shipping_address: {
            title: "${data.title}",
            street_name: "${data.street_name}",
            line2: "${data.line2}",
            street_number: "${data.street_number}",
            district: "${data.district}",
            postal_code: "${data.postal_code}",
            city: "${data.city}",
            province: "${data.province}",
            name: "${this.options.name}",
            surname: "${this.options.surname}",
            additionnal_data: "${data.additionnal_data}",
            country_code: "BR"
            ${ (data.id_address ? `id_address: "${data.id_address}"` : '') }
            ${ ((data.is_prefered == 'true' || data.is_prefered === true) ? `is_prefered: ${data.is_prefered}` : 'is_prefered: false') }
          }
        )
      }`
    }

    const payload = JSON.stringify(query)

    this.request(payload, response => {
      next(response)
    })
  },

  removeAddress (idAddress, next) {
    const query = {
      query: `mutation {
        delUserShippingAddress(
          email: "${ this.options.email }",
          id_address: "${ idAddress }"
        )
      }`
    }

    const payload = JSON.stringify(query)

    this.request(payload, response => {
      next(response)
    })
  },

  find (idAddress, next) {
    const addressess = this.options.addresses

    return addressess.find(address => address.id_address === idAddress)
  },

  getAddressessByUser () {
    const query = {
      query: `query {
        getAllShippingAddresses(email: "${this.options.email}") {
          address_type,
          id_address,
          street_name,
          line2,
          street_number,
          district,
          postal_code,
          city,
          province,
          is_prefered,
          title,
          name,
          surname,
          additionnal_data,
          country_code
        }
      }`
    }

    const payload = JSON.stringify(query)

    this.request(payload, response => {
      this.options.addresses = response.data.getAllShippingAddresses
      this.listAddresses(response.data.getAllShippingAddresses)
    })
  },

  bind () {
    const {
      form,
      formTemplate,
      $formContainer
    } = this.options

    $formContainer.before(formTemplate({ province: '' }))

    $('.address--form').find('.select-uf').selectpicker({ noneSelectedText: 'UF' })

    $(document).on('submit', '.address--form', event => {
      event.preventDefault()
      const $form = $('.address--form')

      const data = {
        id_address: $form.find('[name="id_address"]').val() ? $form.find('[name="id_address"]').val() : null,
        title: $form.find('[name="billing_address[title]"]').val(),
        street_name: $form.find('[name="billing_address[street_name]"]').val(),
        line2: $form.find('[name="billing_address[line2]"]').val(),
        street_number: $form.find('[name="billing_address[street_number]"]').val(),
        province: $form.find('[name="billing_address[province]"] option:selected').val(),
        district: $form.find('[name="billing_address[country_code]"]').val(),
        postal_code: $form.find('[name="billing_address[postal_code]"]').val(),
        city: $form.find('[name="billing_address[city]"]').val(),
        additionnal_data: $form.find('[name="billing_address[additionnal_data]"]').val(),
        is_prefered: $form.find('[name="billing_address[is_prefered]"]').val()
      }

      this.saveAddress(data, (response) => {
        const $form = $(`.${form}`)

        this.getAddressessByUser()

        $form[0].reset()
        $form.toggleClass('hidden')
      })
    })

    this._bindRemoveAddress()
    this._bindToggleForm()
    this._bindSearchCEP()
    this._bindUpdateAddress()
    this._bindFavoriteAddress()
    this._bindCancelForm()
  },

  getUserAddressById (addressId) {
    let result = {}

    this.options.addresses.map(address => {
      if (address.id_address != addressId) {
        return true
      }

      result = address
    })

    return result
  },

  _bindCancelForm () {
    const $form = $('.address--form')

    $form.find('.my-account-button-cancel').on('click', event => {
      $form.toggleClass('hidden')
    })
  },

  _bindFavoriteAddress () {
    $(document).on('click', '[name="is_prefered"]', event => {
      const $this = $(event.currentTarget)

      const idAddress = $this.val()
      const addressFavorited = this.getUserAddressById(idAddress)

      addressFavorited.is_prefered = true
      $this.closest('.prefered-group').addClass('favorite')
      this.saveAddress(addressFavorited, response => {
        this.getAddressessByUser()
      })
    })
  },

  _bindRemoveAddress () {
    $(document).on('click', '.remove-address', event => {
      event.preventDefault()

      const $this = $(event.currentTarget)
      const idAddress = $this.data('id')

      this.removeAddress(idAddress, response => {
        this.getAddressessByUser()
      })
    })
  },

  _bindUpdateAddress () {
    $(document).on('click', '.update-address', event => {
      event.preventDefault()

      const $this = $(event.currentTarget)
      const idAddress = $this.data('id')
      const address = this.find(idAddress)
      const { form } = this.options

      this._fillUpdateAddressForm(address)

      $(`.${form}`).removeClass('hidden')

      setTimeout(() => {
        const addressPosition = $(`.${form}`).offset().top - 100
        $('html,body').animate({ scrollTop: addressPosition }, 'fast')
      }, 300);
    })
  },

  _bindToggleForm () {
    const {
      form
    } = this.options

    $(document).on('click', '.address-container .my-account-button-edit', event => {
      $(`.${form}`).toggleClass('hidden')
    })
  },

  _bindSearchCEP () {
    $(document).on('keyup', '#postal_code', event => {
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

        this._fillAddressCEPFields(response)
      })
    })
  },

  _fillUpdateAddressForm(address) {
    const {
      form
    } = this.options

    console.log('>>', address.is_prefered)

    $(`.${form}`).find('[name="id_address"]').val(address.id_address)
    $(`.${form}`).find('[name="billing_address[title]"]').val(address.title)
    $(`.${form}`).find('[name="billing_address[id_address]"]').val(address.id_address)
    $(`.${form}`).find('[name="billing_address[district]"]').val(address.district)
    $(`.${form}`).find('[name="billing_address[city]"]').val(address.city)
    $(`.${form}`).find('[name="billing_address[postal_code]"]').val(address.postal_code)
    $(`.${form}`).find('[name="billing_address[street_name]"]').val(address.street_name)
    $(`.${form}`).find('[name="billing_address[line2]"]').val(address.line2)
    $(`.${form}`).find('[name="billing_address[street_number]"]').val(address.street_number)
    $(`.${form}`).find('[name="billing_address[country_code]"]').val(address.country_code)
    $(`.${form}`).find('[name="billing_address[additionnal_data]"]').val(address.additionnal_data)
    $(`.${form}`).find(`[name="billing_address[province]"] option[value="${address.province}"]`).attr('selected','selected')
    $(`.${form}`).find('[name="billing_address[is_prefered]"]').val(address.is_prefered)

    $('.select-uf').selectpicker('refresh')
  },

  /*
   * @name _fillAddressCEPFields
   * @description Preenche os campos referentes ao CEP.
   * @param <Object> data
  */
  _fillAddressCEPFields (data) {
    const {
      form
    } = this.options

    $(`.${form}`).find('[name="billing_address[street_name]"]').val(data.logradouro)
    $(`.${form}`).find('[name="billing_address[district]"]').val(data.bairro)
    $(`.${form}`).find('[name="billing_address[city]"]').val(data.localidade)
    $(`.${form}`).find(`[name="billing_address[province]"] option[value="${data.uf}"]`).attr('selected','selected')
    $('.select-uf').selectpicker('refresh')
  },

  /*
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

      if (response.data && response.data.addUserShippingAddress == "success") {
        APP.i.flash_msg = new APP.component.FlashMsg()
        APP.i.flash_msg.showMsg('Suas alterações foram salvas', 'success')

        APP.i.currentController.disableInputsForm($(event.currentTarget))
      } else {
        if (response.errors && response.errors.length > 0) {
          APP.i.flash_msg = new APP.component.FlashMsg()
          APP.i.flash_msg.showMsg('Erro ao salvar suas alterações', 'error')
        }
      }

      next(response)
    })
    .fail(error => {
      throw new Error(error)
    })
  }
})
