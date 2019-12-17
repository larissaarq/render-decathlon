import '../../sass/pages/_0-dcs-web-beneficios-clube-decathlon.scss'

APP.controller.BeneficiosClubeDecathlon = ClassAvanti.extend({
  init() {
    this.start()
    this.bind()
  },

  start() {
    if (window.innerWidth <= 768) {
      this.sliderBenefits();
    }
  },

  bind() {
    const listLinks = $(".clubeDKT-content-desktop-item");
    const boxDicas = $('.clubeDKT-content-desktop-box-dica-sport')
    const boxEmprestimo = $(".clubeDKT-content-desktop-box-emprestimo-produtos")
    const textEmprestimo = $(".textEmprestimo")
    const btnClosedTextEmprestimo = $('.clubeBtnClosedDesktop ')
    const btnTextEmprestimo = $(".btnEmprestimo")

    /*****************
    MOBILE
    ******************/

    const textEmprestimoMobile = $(".textEmprestimoMobile");
    const boxEmprestimoMobile = $(".clubeDKT-img-fade-emprestimo");
    const btnTextEmprestimoMobile = $(".btnTextEmprestimoMobile");
    const btnClosedTextMobile = $(".clubeBtnClosedMobile");

    btnTextEmprestimoMobile.on("click", function (e) {
      e.preventDefault();
      boxEmprestimoMobile.addClass('club-hide');
      textEmprestimoMobile.removeClass('club-hide');

    })

    btnClosedTextMobile.on("click", function (e) {
      textEmprestimoMobile.addClass('club-hide')
      boxEmprestimoMobile.removeClass('club-hide');
    })

    /*****************
    DESKTOP
    ******************/
    listLinks.on("click", function (e) {
      $('.clubeDKT-content-desktop > div:not(.clubeDKT-content-desktop-links):not(.club-hide)').addClass('club-hide');

      $(".clubeDKT-content-desktop-item").removeClass('active');

      $(this).addClass('active');

      const value = $(this).find('span').text();

      if (value == "dicas do seu esporte") {
        boxDicas.removeClass('club-hide');
        boxEmprestimo.addClass('club-hide');

      }
      false;
      if (value == "empréstimo de produtos") {
        boxDicas.addClass('club-hide')
        boxEmprestimo.removeClass('club-hide');
      }
      false;
    })

    btnTextEmprestimo.on("click", function (e) {
      e.preventDefault();
      boxEmprestimo.find('.box-text-emprestimo').addClass('club-hide')
      textEmprestimo.removeClass('club-hide');
    })

    btnClosedTextEmprestimo.on("click", function (e) {
      e.preventDefault();
      boxEmprestimo.find('.box-text-emprestimo').removeClass('club-hide');
      textEmprestimo.addClass('club-hide')
    })

    btnTextEmprestimoMobile.on("click", function (e) {
      e.preventDefault();
    })

    this.toggleInfos('eventos-esportivos');
    this.toggleInfos('troca-de-produtos');
    this.toggleInfos('beneficios-de-parceiros');
    this.toggleInfos('decathlon-play');
  },

  toggleInfos(_class){
    $('.link-' + _class).on("click", function (e) {
      e.preventDefault();
      $('.clubeDKT-content-desktop > div:not(.clubeDKT-content-desktop-links):not(.club-hide)').addClass('club-hide');
      $('.box-' + _class).removeClass('club-hide');
    })
  },

  sliderBenefits: function () {
    $(".benefits-bar").slick({
      infinite: !1,
      autoplay: !1,
      dots: !1,
      arrows: !0,
      slidesToShow: 1,
      slidesToScroll: 1
    });
  }
})