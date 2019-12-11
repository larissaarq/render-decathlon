APP.component.ResetPassword = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
  },

  setup () {
    console.log('RESET PASSWORD 2')
    this.options = {
      $form: $('.reset-password-form'),
      $sendBtn: $('.reset-password-form').find('.btn-send')
    }

    APP.i.flash_msg = new APP.component.FlashMsg()
  },

  start () {
    if ($('body').hasClass('reset-password')) {
      this.getUrlParams()
    }
  },

  getUrlParams () {
    const urlParams = decodeURIComponent(window.location.href)
    // const urlParams = window.location.href
    const tokenQuery = new RegExp('tokenId=(.*)&tokenAction=(.*?)(?=&)', 'gi')
    const [ , tokenId, tokenAction ] = urlParams.split(tokenQuery)
    
    if (tokenId.length > 0) {
      this.submitPasswordForm(tokenId, tokenAction)
    }
  },

  submitPasswordForm (tokenId, tokenAction) {
    const {
      $form,
      $sendBtn
    } = this.options

    $form.on('submit', e => {
      e.preventDefault()

      $sendBtn.attr('disabled', 'disabled')
      const formPassword = $form.find('#password').val()
      this.resetPassword(tokenId, tokenAction, formPassword)
    })
  },

  resetPassword (tokenId, tokenAction, formPassword) {
    const {
      $form,
      $sendBtn
    } = this.options

    
    const mutation = {
      query: `mutation {
        resetPassword(reset: {
          tokenId: "${tokenId}"
          tokenAction: "${tokenAction}"
          password: "${formPassword}"
        })
      }`
    }

    // console.log(mutation)

    $.ajax({
      data: JSON.stringify(mutation),
      url: 'https://decathlonmyaccount--decathlonstore.myvtex.com/_v/graphql/private/v1',
      type: 'POST'
    }).then(res => {
      const ret = JSON.parse(res.data.resetPassword)
      
      if(ret.code === 200) {
        this.redirectToLogin()
      } else {
        // console.log('nao fazer redirect, exibir mensagem', ret.message)
        $sendBtn.attr('disabled', 'disabled')
        $form.find('#password').val('')

        $form.find(`.password-meter-condition`).removeClass('valid')

        APP.i.flash_msg.showMsg(ret.message, 'error')
      }
    }, error => {
      throw new Error(error)
    })
  },

  redirectToLogin () {
    const {
      $form,
      $sendBtn
    } = this.options

    $form.on('ajaxStop', () => {
      // console.log('ajax terminado')
      $sendBtn.removeAttr('disabled')
      window.location = '/login'
    })
  }
})
