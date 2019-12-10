APP.controller.LpAtorka = ClassAvanti.extend({
  init() {
    this.setup()
    this.start()
    this.bind()
  },

  setup() {},

  start() {
    this._landingPageAtorka()
  },

  bind() {},

  _landingPageAtorka() {
    const elmtToScroll = $('[data-scrollin]');

    let showText = function (target, message, index, interval) {
      if (index < message.length) {
        $(target).append(message[index++]);
        setTimeout(function () { showText(target, message, index, interval); }, interval);
      }
    }

    let counter1 = 0;
    let counter2 = 0;

    let triggerHeight = $(window).height() / 2 + $(window).height() / 4;

    elmtToScroll.addClass('element-out');

    $(window).scroll(function () {

      elmtToScroll.each(function () {
        let el = $(this);

        if ($(window).scrollTop() > el.offset().top - triggerHeight) {
          el.removeClass('element-out');
          el.addClass('element-in');

          if (counter1 == 0) {
            if (el.is($('#promesse'))) {
              showText(el, "FAZER O HANDBALL ACESSÍVEL AO MAIOR NÚMERO DE PRATICANTES!", 0, 25);
              counter1++;
            }
          }
          if (counter2 == 0) {
            if (el.is($('#mission'))) {
              showText(el, "FAZER O HANDBALL ACESSÍVEL AO MAIOR NÚMERO DE PRATICANTES", 0, 25);
              counter2++;
            }
          }

          setTimeout(function () {
            el.addClass('charged');
          }, 2100);
        }
      });
    });

    setTimeout(function () {
      $("[data-onload]").addClass('loaded');
    }, 1000);
  }

})
