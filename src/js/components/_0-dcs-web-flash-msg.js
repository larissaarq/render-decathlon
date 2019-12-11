APP.component.FlashMsg = ClassAvanti.extend({
  init () {
    this.setup()
    this.bind()
  },

  setup () {
    this.options = {
      msgTemplate (msg, type) {
        return `<div class="flash-msg flash-msg--${type}">
                  <span class="flash-msg__icon"><i></i></span>
                  <a class="flash-msg__close" href="#"><i></i></a>
                  <p class="flash-msg__text">${msg}</p>
                </div>`
      }
    }
  },

  _isMobile () {
    return $(window).width() <= 991
  },

  createMsg (msg, type) {
    const { msgTemplate } = this.options
    const template = msgTemplate(msg, type)

    if ($('.flash-msg').length > 0) {
      $('.flash-msg').remove()
    }

    $('header.header').prepend(template)
    $('.flash-msg').animate({ "top": (this._isMobile() ? '50px' : '0')}, "fast");

    setTimeout(function(){
      $('.flash-msg').animate({ "top": "-85px" }, "fast" );
    }, 7000)

    this.bind()
  },

  showMsg (msg, type) {
    this.createMsg(msg, type)

    $('html').animate({ scrollTop: 0 }, 'slow')
  },

  hideMsg () {
    $('.flash-msg').fadeOut(100, function() {
      $('.flash-msg').remove()
    })
  },

  bind () {
    $('.flash-msg .flash-msg__close').on('click', e => {
      e.preventDefault()

      this.hideMsg()

      return false
    })
  }
})
