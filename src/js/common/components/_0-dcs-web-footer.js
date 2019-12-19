APP.component.Footer = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.slickBarra = $('.footer-barra-beneficios .slick-default')
  },

  start () {
    this._startSlicks()
    this.checkCookiePolicies()
  },

  checkCookiePolicies () {
    const txtCookie = `<!-- START: Politicas de Cookie -->
                      <div class="cookie-policies">
                          <p class="msg-cookie-policies">Se você clicar no botão aceito ou continuar navegando, consideramos que você aceita o uso de nossos cookies. Verifique nossa política de privacidade <a href="https://www.decathlon.com.br/servicos/politica-de-privacidade/" title="Politicas de Privacidade">aqui</a>.</p>
                          <button class="button-acept-cookie">Aceito</button>
                      </div>
                      <!-- END: Politicas de Cookie -->`
                      
    const cookiePolicies = Cookies.get('cookiePolicies')
    if(!cookiePolicies) {
      const checkCookiePolicies = Cookies.get('checkCookiePolicies')
      if(checkCookiePolicies) {
        this._cookiePolicies()
      }else{
        $('.footer').append(txtCookie);
        Cookies.set('checkCookiePolicies', true, { expires: 365 })
      }
    }
  },

  _cookiePolicies () {
    Cookies.set('cookiePolicies', 'Accept', { expires: 365 })
    Cookies.remove('checkCookiePolicies')
  },

  _startSlicks () {
    const intervalBarra = setInterval(() => {
      if ($._data(window, 'events').resize) {
        clearInterval(intervalBarra)

        this.slickBarra.slick({
          dots: true,
          arrows: false,
          slidesToShow: 4,
          slidesToScroll: 1,
          autoplay: false,
          cssEase: 'linear',
          speed: 500,
          infinite: false,
          responsive: [
            {
              breakpoint: 767,
              settings: {
                autoplay: false,
                slidesToShow: 2,
                slidesToScroll: 2
              }
            }
          ]
        })
      }
    }, 100)
  },

  bind () {
    this._bindButtonCookie()
  },

  _bindButtonCookie () {
    $('body').on('click', '.button-acept-cookie', () => {
        this._cookiePolicies()
        $('.cookie-policies').hide()
    })
  }
})
