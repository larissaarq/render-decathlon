import '../../sass/pages/_0-dcs-web-beneficios-conta-decathlon.scss'

APP.controller.BeneficiosContaDecathlon = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.options = {
      $depoimentosFull: $('.section-urm-depoimentos'),
      classSlickFrame: 'slick-frame'
    }
  },

  start () {
    this.startSlick()
  },

  startSlick () {
    this.checkDepoimentos()
  },

  checkDepoimentos () {
    const {
      $depoimentosFull
    } = this.options

    if ($depoimentosFull.find('.section-urm-depoimentos__wrapper').length > 0) {
      this.slickDepoimentos()
    }
  },

  slickDepoimentos () {
    const {
      $depoimentosFull,
      classSlickFrame
    } = this.options

    const slickOptions = {
      autoplay: false,
      dots: true,
      arrows: false,
      slidesToShow: 3,
      slidesToScroll: 3,
      responsive: [
        {
          breakpoint: 729,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    }

    $depoimentosFull.find(`.${classSlickFrame}`).slick(slickOptions)

    $depoimentosFull.show()
  },

  bind () {}
})
