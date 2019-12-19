APP.component.Header = ClassAvanti.extend({
  init() {
    this.setup();
    this.bind();
    this.start();
  },

  setup() {
    APP.i.Search = new APP.component.Search();
    APP.i.Minicart = new APP.component.Minicart();
    APP.i.MenuHeader = new APP.component.MenuHeader();

    this.options = {
      $headerItems: $("#header-alert .alert-item"),
      $classCloseNanoBarHeader: $(".before__header--close")
    };
  },

  start() {
    this.startNanoBarHeader();
  },

  startNanoBarHeader() {
    const { $classCloseNanoBarHeader } = this.options;

    if ($("#header-alert").length) {
      //condition to show counter
      if ($(".counter b").length) {
        this.counter();
      }

      //show alert
      $("#header-alert").removeClass("hide");
    }

    $classCloseNanoBarHeader.on("click", e => {
      $("#header-alert").slideToggle("fast");
      $("body").addClass("closed-nanobar")
    });
  },

  counter() {
    var countDownDate = new Date("Sep 27, 2019 23:45:00").getTime();
    var now = new Date().getTime();
    var distance = countDownDate - now;

    if (distance > 0) {
      setInterval(function() {
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        const counter = [days, hours, minutes];
        counter.map(
          (item, index) =>
            ($(".counter b")[index].innerHTML = item < 10 ? "0" + item : item)
        );
      }, 1000);
    }
  },

  bind() {
    this._bindMobileHelp();
    this._bindCheckUrl();
    this._dropHelpDesktop();
  },

  _bindMobileHelp() {
    $(".mobile-menubar-link--help").on("click", e => {
      e.preventDefault();
      const _this = $(e.currentTarget);

      _this
        .toggleClass("selected")
        .parent()
        .toggleClass("selected")
        .find(".mobile-menubar-box")
        .toggleClass("opened");
      $(".mobile-menubar-link--menubar")
        .parent()
        .removeClass("selected");
      $(
        ".mobile-menubar-first-level, .mobile-menubar-second-level"
      ).removeClass("opened");
    });

    $(".mobile-menubar-box--close").on("click", e => {
      e.preventDefault();
      const _this = $(e.currentTarget);

      _this
        .closest(".mobile-menubar-box")
        .removeClass("opened")
        .closest(".mobile-menubar-item")
        .removeClass("selected")
        .find(".mobile-menubar-link--help")
        .removeClass("selected");
    });
  },

  _bindCheckUrl() {
    const urlPath = window.location.pathname.toString();

    $(".mobile-menubar-item").each((i, e) => {
      const _this = $(e);

      const checkEl = _this
        .find('.mobile-menubar-link[href="' + urlPath + '"]')
        .attr("href");

      if (checkEl === urlPath) {
        _this
          .addClass("selected")
          .find(".mobile-menubar-link")
          .addClass("selected");
      }
    });
  },

  _dropHelpDesktop() {
    $(".header__content--help").on("mouseenter", e => {
      e.preventDefault();
      const _this = $(e.currentTarget);

      _this.find(".header__content--linkbox").addClass("box-opened");
    });

    $(".header__content--help").on("mouseleave", e => {
      e.preventDefault();
      const _this = $(e.currentTarget);

      _this.find(".header__content--linkbox").removeClass("box-opened");
    });
  }
});
