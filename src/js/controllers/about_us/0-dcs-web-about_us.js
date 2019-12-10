APP.controller.AboutUs = ClassAvanti.extend({
  init() {
    this.start();
  },

  start() {
    this.linkScroll();
  },

  linkScroll() {
    $('.section-banners a[href^="#"]').click(function(e) {
      e.preventDefault();
      var id = $(this).attr("href"),
        targetOffset = $(id).offset().top;
      $("html, body").animate(
        {
          scrollTop: targetOffset - 110
        },
        500
      );
    });
  }
});
