APP.component.MyAccountOptin = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      classCheckbox: 'my-account-page__input-optin',

      email: null,
      endpoint: null,
      response: null
    }, options)

    APP.i.flash_msg = new APP.component.FlashMsg()
  },

  start () {
    this.setInitialState()
  },

  setInitialState () {
    const {
      classCheckbox,
      response
    } = this.options

    if (response === null) {
      const classText = 'my-account-page__text'
      const message = `<p class="${classText}">Sua conta foi criada em outro país. Para alterar suas preferências de comunicação, entre em contato com a Decathlon no país de origem.</p>`

      const $optin = $('.my-account-page__content--optin')

      $optin.find('.my-account-page__checkbox').hide()
      $optin.find(`.${classText}`).remove()
      $optin.append(message)
      $(`.${classCheckbox}`).attr('disabled', 'disabled')

      return false
    }

    $(`.${classCheckbox}`).removeAttr('checked')

    if (response.value === true) {
      $(`.${classCheckbox}`).attr('checked', 'checked')
    }
  },

  bind () {
    this._bindChangeCheckbox()
  },

  _bindChangeCheckbox () {
    const {
      classCheckbox,
      email,
      endpoint
    } = this.options

    $(`.${classCheckbox}`).on('change', event => {
      event.preventDefault()

      const _this = $(event.currentTarget)
      const isChecked = _this.is(':checked')

      const query = JSON.stringify({
        query: `mutation {
          updateOptin(
            email: "${email}",
            optin: {
              id: "10",
              type: "SPORT",
              value: ${isChecked}
            }
          )
        }`
      })

      _this.attr('disabled', 'disabled')

      $.post(endpoint, query)
        .fail(error => {
          _this.removeAttr('disabled')

          _this.attr('checked', 'checked')
          if (isChecked) {
            _this.removeAttr('checked')
          }

          throw new Error(error)
        })
        .done((response) => {
          _this.removeAttr('disabled')

          if (response.data && response.data.updateOptin == "success") {
            APP.i.flash_msg.showMsg('Comunicação esportiva alterada com sucesso!', 'success')
          } else {
            console.log('response >>> ', response)
            if (response.errors && response.errors.length > 0) {
              APP.i.flash_msg.showMsg('Erro ao alterar comunicação esportiva', 'error')
            }
          }
        })
    })
  }
})
