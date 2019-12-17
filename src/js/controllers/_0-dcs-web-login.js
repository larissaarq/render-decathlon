import '../../sass/pages/_0-dcs-web-login.scss'

APP.controller.Login = ClassAvanti.extend({
  init() {
    this.setup()
    this.start()
    this.bind()
  },

  setup() { },

  start() { },
  
  bind() {
    this.bindCheckBtnCreateAccount();
  },

  bindCheckBtnCreateAccount() {
    const intervalGetElement = setInterval(() => {
      let vtexUI = $('#vtexIdUI-decathlonstore');
      if (vtexUI.length > 0) {
        $('#vtexIdUI-decathlonstore').after('<a href="/cadastro" id="btnDktLoginCreateAccount" class="btn btn-block gaClick" data-event-category="Login" data-event-action="Click Button" data-event-label="Criar minha conta">Criar minha conta</a>');
        // $('#vtexIdUI-auth-selector').before(Login.messageAlertLogin)
        $('.login .vtexIdUI:not(.vtexid-icon-arrow-left)').height($('.vtexIdUI-page-active').height() + 130);
                
        clearInterval(intervalGetElement)
      }
    }, 1000)
  }
})
