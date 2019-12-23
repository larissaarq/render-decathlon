APP.controller.Services = ClassAvanti.extend({
  init() {
    this.setup();
    this.start();
    this.bind();
  },

  setup() {
    if (typeof APP.i.Helpers === "undefined") {
      throw new TypeError("You need Helpers Component installed.");
    }

    this.$sidebarHeader = $(".services-sidebar__header");
  },

  start() {},

  bind() {
    this.$sidebarHeader.on("click", event => {
      const _this = $(event.currentTarget);
      _this.toggleClass("active");
    });
    this.bindCurrentLink();

    if($('body').hasClass('recall')){
      this.bindRecallMenu();
    }
  },

  bindCurrentLink() {
    const currentUrl = window.location.pathname;
    $(".services-sidebar__list-item").each((i, e) => {
      const _this = $(e);
      const currentLink = _this.attr("href");

      if (currentLink === currentUrl) {
        _this.addClass("current-link");
      }
    });
  },

  bindRecallMenu() {
    const _self = this;

    $("body").on("click", '.services-sidebar a[href^="#"]', function(event) {
      event.preventDefault();

      let scrollAnchor = $(this)
        .attr("href")
        .replace("#", "");
      let scrollPoint =
        $('.section-anchor[id="' + scrollAnchor + '"]').offset().top - 100;

      $("body,html").animate(
        {
          scrollTop: scrollPoint
        },
        500
      );

      _self.$sidebarHeader.toggleClass("active");
      return false;
    });

    $(window).on("scroll", () => {
      let window_top = $(window).scrollTop();

      if (APP.i.Helpers._isMobile()) {
        if (window_top > 200) {
          $(".services-sidebar").addClass("fixed");
          $(".services-content").addClass("fixed");
        } else {
          $(".services-sidebar").removeClass("fixed");
          $(".services-content").removeClass("fixed");
        }
      } else {
        let footer_top = $(".benefits-bar__wrapper--footer").offset().top;
        let div_top = $(".section-services__column").offset().top;
        let div_height = $(".services-sidebar").height();
        let padding = 100;

        if (window_top + div_height > footer_top - padding)
          $(".services-sidebar").css({
            top: (window_top + div_height - footer_top + padding) * -1
          });
        else if (window_top > div_top) {
          $(".services-sidebar").addClass("fixed");
          $(".services-sidebar").css({ top: 170 });
        } else {
          $(".services-sidebar").removeClass("fixed");
        }
      }
    });
  }
});
