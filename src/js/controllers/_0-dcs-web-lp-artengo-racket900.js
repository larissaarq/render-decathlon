APP.controller.LpArtengoRacket900 = ClassAvanti.extend({
    init () {
      this.setup()
      this.start()
      this.bind()
    },
  
    setup () {
        APP.i.Helpers = new APP.component.Helpers()
    },
  
    start () {
        if (APP.i.Helpers._isMobile()) {
            $('.artengo-shelf-container').addClass('mobile');
        }

        $('.artengo-products').slick({
            prevArrow: $('.prev'),
            nextArrow: $('.next'),
            slidesToShow: 4,
            arrows: true,
            dots: false,
            responsive: [{
                breakpoint: 740,
                settings: {
                    prevArrow: $('.prev'),
                    nextArrow: $('.next'),
                    arrows: true,
                    dots: false,
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    prevArrow: $('.prev'),
                    nextArrow: $('.next'),
                    arrows: true,
                    dots: false,
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
            ]
        });

        $('.artengo-shelf-container.mobile').slick({
            prevArrow: $('.anterior'),
            nextArrow: $('.proximo'),
            slidesToShow: 1,
            arrows: true,
            dots: false,

        });
    },
  
    bind () {
    },
  })
  