APP.component.ForgotPassword = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
  },

  setup () {
    this.options = {
      $form: $('.forgot-password-form'),
      $sendBtn: $('.forgot-password-form').find('.btn-send'),
      $confirmDiv: $('.forgot-content-hidden')
    }
  },

  start () {
    this.submitEmailForm()
  },

  submitEmailForm () {
    const {
      $form
    } = this.options

    $form.on('submit', e => {
      e.preventDefault()

      const formEmail = $form.find('#email').val()
      this.forgotPassword(formEmail)
      this.showConfirmDiv()
    })
  },

  forgotPassword (formEmail) {
    const mutation = {
      query: `mutation {
        passwordForgotten(
          email: "${formEmail}"
        )
      }`
    }

    console.log(mutation)

    $.ajax({
      data: JSON.stringify(mutation),
      url: 'https://decathlonmyaccount--decathlonstore.myvtex.com/_v/graphql/private/v1',
      type: 'POST'
    }).then(() => {
      console.log('request ok')
    }, error => {
      throw new Error(error)
    })
  },

  showConfirmDiv () {
    const {
      $confirmDiv
    } = this.options

    $confirmDiv.addClass('forgot-content-hidden--visible')

    $confirmDiv.find('.back-button--link').on('click', e => {
      e.preventDefault()
      $confirmDiv.removeClass('forgot-content-hidden--visible')
    })
  }
})
