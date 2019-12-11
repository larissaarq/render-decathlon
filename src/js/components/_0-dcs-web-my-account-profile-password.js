APP.component.MyAccountProfilePassword = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      $loaderContainer: $('.password-container'),
      $formPassword: $('.my-account-page--profile__access-password'),
      $oldPasswordInput: $('[name="identity_individual[old_password]"]'),
      $newPasswordInput: $('[name="identity_individual[new_password]"]')
    }, options)
  },

  start () {
    APP.i.ValidatePassword = new APP.component.ValidatePassword({
      form$: $('.my-account-page--profile__access-password'),
      $passwordField: $('[name="identity_individual[old_password]"], [name="identity_individual[new_password]"]'),
      $sendBtn: $('.password-container .my-account-button-save button')
    })

    // console.log('PASSWORD', APP.i.ValidatePassword)
  },

  savePassword (data, next) {
    const query = JSON.stringify({
      query: `mutation {
        changePassword(
          email: "${this.options.email}",
          old_password: "${data.old_password}",
          new_password: "${data.new_password}"
        )
      }`
    })

    this.request(query, response => {
      next(response)
    })
  },

  bind () {
    this._bindFormSubmitPassword()
    this._bindTogglePasswordForm()
  },

  _bindTogglePasswordForm () {
    const {
      $formPassword
    } = this.options

    $formPassword.find('.my-account-button-edit').on('click', event => {
      $('.new-password-item').show()
      $('.password-meter').show()
    })

    $formPassword.find('.my-account-button-cancel').on('click', event => {
      $formPassword.find('span.error').remove()

      $.each($('.input-password-icon'), function (i, el) {
        if ($(el).hasClass('visible')) {
          $(el).click()
        }
      })

      $('.new-password-item').hide()
      $('.password-meter').hide()
    })
  },

  /**
   * @name _bindFormSubmitPassword
   * @description Cancela o submit e executa uma funçao específica.
  */
  _bindFormSubmitPassword () {
    const {
      $formPassword,
      $oldPasswordInput,
      $newPasswordInput
    } = this.options

    $formPassword.on('submit', event => {
      // console.log('--- Submeteu ---')
      event.preventDefault()

      const oldPassword = $oldPasswordInput.val()
      const newPassword = $newPasswordInput.val()

      if (oldPassword.length === 0 || newPassword.length === 0) {
        $('.new-password-item').show()
        $('.password-meter').show()

        if (oldPassword.length === 0) {
          if ($oldPasswordInput.parents('li').find('.error').length == 0) {
            $oldPasswordInput.parents('li').append('<span class="error">Campo obrigatório.</span>')
          } else {
            $oldPasswordInput.parents('li').find('.error').show();
          }
        }

        if (newPassword.length === 0) {
          if ($newPasswordInput.parents('li').find('.error').length == 0) {
            $newPasswordInput.parents('li').append('<span class="error">Campo obrigatório.</span>')
          } else {
            $newPasswordInput.parents('li').find('.error').show();
          }
        }

        return false
      }

      $formPassword.find('input').prop('readonly', true)
      $formPassword.addClass('readonly')
      $formPassword.removeClass('edit')
      $('.new-password-item').hide()
      $('.password-meter').hide()

      const data = {
        old_password: oldPassword,
        new_password: newPassword
      }

      this.savePassword(data, response => {
        $formPassword[0].reset()
        // console.log('savePassword Form Response:', response)

        if (response.data && !response.errors) {
          APP.i.flash_msg = new APP.component.FlashMsg()
          APP.i.flash_msg.showMsg('Suas alterações foram salvas', 'success')
          APP.i.currentController.disableInputsForm($(event.currentTarget))
        } else {
          if (response.errors && response.errors.length > 0) {
            APP.i.flash_msg = new APP.component.FlashMsg()
            APP.i.flash_msg.showMsg('Erro ao salvar suas alterações', 'error')
          }
        }

        $('.new-password-item').hide()
        $('.password-meter').hide()
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
