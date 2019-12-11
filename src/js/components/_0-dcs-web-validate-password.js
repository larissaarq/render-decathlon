APP.component.ValidatePassword = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      $form: $('.create-password-form, .register-form'),
      $passwordField: $('#password, #new_password'),
      $validatorList: $('.password-meter-list'),
      $passwordCondition: $('.password-meter-condition'),
      $sendBtn: $('form').find('.btn-send, .register-create-btn'),
      $showIcon: $('.input-password-icon'),

      validConditionClass: 'valid'
    }, options)
  },

  start () {
    this.passwordValidator()
  },

  passwordValidator () {
    const {
      $form,
      $passwordField,
      $sendBtn,
      validConditionClass
    } = this.options

    $passwordField.on('keyup', () => {
      const pswd = $passwordField.val()

      // check password length
      if (pswd.length < 8) {
        $('.password-condition1').removeClass(validConditionClass)
      } else {
        $('.password-condition1').addClass(validConditionClass)
      }

      // validate capital and lower letter
      if (pswd.match(/[A-Z]/) && pswd.match(/[a-z]/)) {
        $('.password-condition2').addClass(validConditionClass)
      } else {
        $('.password-condition2').removeClass(validConditionClass)
      }

      // validate letter
      if (pswd.match(/[A-z]/)) {
        $('.password-condition3').addClass(validConditionClass)
      } else {
        $('.password-condition3').removeClass(validConditionClass)
      }

      // validate number
      if (pswd.match(/\d/)) {
        $('.password-condition4').addClass(validConditionClass)
      } else {
        $('.password-condition4').removeClass(validConditionClass)
      }

      if ($(`.password-container .password-meter-condition.${validConditionClass}, .create-password-form .password-meter-condition.${validConditionClass}, .register-form .password-meter-condition.${validConditionClass}`).length === 4) {
        $sendBtn.removeAttr('disabled')
      } else {
        $sendBtn.attr('disabled', 'disabled')
      }
    })
  },

  bind () {
    this._showPassword()
  },

  _showPassword () {
    const {
      $showIcon,
      $passwordField
    } = this.options

    $showIcon.on('click', e => {
      const _this = $(e.currentTarget)
      _this.toggleClass('visible')

      if (_this.prev().attr('type') === 'password') {
        _this.prev().prop('type', 'text')
      } else {
        _this.prev().prop('type', 'password')
      }
    })
  }
})
