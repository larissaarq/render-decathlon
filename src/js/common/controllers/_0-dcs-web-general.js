import '../components/_0-dcs-web-blog-entries'
import '../components/_0-dcs-web-buylist'
import '../components/_0-dcs-web-compare'
import '../components/_0-dcs-web-enhanced-ecommerce'
import '../components/_0-dcs-web-favorites'
import '../components/_0-dcs-web-flash-msg'
import '../components/_0-dcs-web-footer'
import '../components/_0-dcs-web-header'
import '../components/_0-dcs-web-helpers'
import '../components/_0-dcs-web-menu-filter'
import '../components/_0-dcs-web-menu-header'
import '../components/_0-dcs-web-minicart'
import '../components/_0-dcs-web-modal'
import '../components/_0-dcs-web-search'
import '../components/_0-dcs-web-split-price'
import '../components/_0-dcs-web-shelf-sku'
import '../components/_0-dcs-web-shelf'

import '../../../sass/0-dcs-web-style.scss'

APP.controller.General = ClassAvanti.extend({
  init() {
    this.setup();
    this.start();
    this.bind();
  },

  setup() {
    this.options = {
      nameUserLogged: "",
      $avalieFixed: $(".avalie-fixed"),
      $mainHeader: $(".main__medium--header"),
      $mainTopHeader: $(".main__top-header"),
      $headerAlert: $(".before__header--content")
    };

    this.$slugPageStore = $("meta[name=slug-page]").attr("content");
    this.$slickSlider = $(".slick-slider");
    this.$shelfCarousel = $(".shelf-carousel .main-shelf:not(.mob-shelf) > ul");
    this.$shelfCarouselMobile = $(".shelf-carousel .mob-shelf > ul");

    APP.i.Helpers = new APP.component.Helpers();
    APP.i.Header = new APP.component.Header();
    APP.i.Shelf = new APP.component.Shelf();
    APP.i.Compare = new APP.component.Compare();
    APP.i.Footer = new APP.component.Footer();
    APP.i.Modal = new APP.component.Modal();

    // Blog Tips
    APP.i.BlogTipsEntries = new APP.component.BlogEntries({
      $target: $(".section-sportive-tips .blog-entries"),
      template(variables) {
        return variables
          .map(item =>
            item
              ? `
                  <div class="blog-tips">
                    <div class="blog-tips__img">
                      <a href="${
                        item.link
                      }" class="blog-tips__img-link" title="${
                  item.title.rendered
                }">
                        <img src="${
                          item.better_featured_image === null
                            ? ""
                            : item.better_featured_image.media_details.sizes[
                                "post-thumbnail"
                              ].source_url
                        }" alt="${
                  item.better_featured_image === null
                    ? item.title.rendered
                    : item.better_featured_image.alt_text
                }" />
                      </a>
                    </div>

                    <div class="blog-tips__content">
                      <h3 class="blog-tips__title">
                        <a href="${
                          item.link
                        }" class="blog-tips__title-link" title="${
                  item.title.rendered
                }">${item.title.rendered}</a>
                      </h3>
                      <h4 class="blog-tips__subtitle">
                        <a href="${
                          item.link
                        }" class="blog-tips__subtitle-link" title="${
                  item.excerpt.rendered
                }">${item.excerpt.rendered}</a>
                      </h4>
                    </div>
                  </div>
                `
              : ""
          )
          .join("");
      }
    });

    // Blog Events
    let typeBlogCall = "new";

    if (this.$slugPageStore && this.$slugPageStore.includes("decathlon-")) {
      typeBlogCall = "";
    }

    APP.i.BlogEventsEntries = new APP.component.BlogEntries({
      url:
        "https://souesportista.decathlon.com.br/wp-json/eventos_order/v1/" +
        typeBlogCall +
        "?slug=",
      $target: $(".section-sportive-events .blog-entries"),
      template(variables) {
        if (variables === "false") {
          $(".section-sportive-events .blog-entries").css("display", "none");
        } else {
          const getEventDate = function(_item, _type) {
            let _pos = _type == "d" ? 0 : 1;

            return _item.controledata.split("/")[_pos];
          };

          return variables
            .map(item =>
              item
                ? `
                  <div class="blog-events">
                    <div class="blog-events__img">
                      <a href="${item.link}" class="blog-tips__img-link" title="${item.title}" target="_blank">
                        <img src="${item.thumbnail}" alt="${item.alt_text}" />
                      </a>
                    </div>

                    <div class="blog-events__content">

                      ` +
                  (getEventDate(item, "d")
                    ? `
                      <div class="blog-events__date">
                        <span class="blog-events__date-day">` +
                      getEventDate(item, "d") +
                      `</span>
                        <span class="blog-events__date-month">` +
                      getEventDate(item, "m") +
                      `</span>
                      </div> `
                    : "") +
                  `

                      <h3 class="blog-events__title">
                        <a href="${item.link}" class="blog-events__title-link" title="${item.title}" target="_blank">${item.title}</a>
                      </h3>

                      <a href="${item.link}" class="blog-events__local-link" title="${item.excerpt}" target="_blank">${item.excerpt}</a>
                    </div>
                  </div>
                `
                : ""
            )
            .join("");
        }
      }
    });

    APP.i.EnhancedEcommerce = new APP.component.EnhancedEcommerce();
  },

  start() {
    this.removeHelperComplement();
    this.startCustomSelect();
    this.slickBenefitsBar();
    this.startShelfCarousels();
    this.seeMoreSeo();
    //this.redirectTotem();

    // APP.i.EnhancedEcommerce.onAccessGeneralPages()
  },

  redirectTotem() {
    const nameTotem = localStorage.getItem("decathlon-nameTotem");
    //console.log(nameTotem)
    if (nameTotem != null && nameTotem != undefined && nameTotem != "") {
      location.href = location.origin + "/totem/?nameTotem=" + nameTotem;
    }
  },

  startShelfCarousels() {
    let _self = this;

    if (!APP.i.Helpers._isMobile()) {
      if (_self.$shelfCarousel.find("li").length > 0) {

        _self.$shelfCarousel
          .parents(".shelf-carousel")
          .addClass("shelf-carousel--visible");
        this.startShelfCarouselsDesktop();
      }
    } else {
      if (_self.$shelfCarouselMobile.find("li").length > 0) {
        _self.$shelfCarouselMobile
          .parents(".shelf-carousel")
          .addClass("shelf-carousel--visible");
        this.startShelfCarouselsMobile();
      }
    }
  },

  removeHelperComplement() {
    $('[id^="helperComplement_"]').remove();
  },

  startCustomSelect() {
    $(".custom-select").selectpicker();
  },

  slickBenefitsBar() {
    if (!APP.i.Helpers._isMobile()) {
      return false;
    }
    const $benefitsBar = $(".benefits-bar");

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: false,
      arrows: true,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    if ($benefitsBar.find(".benefits-bar__item").length < 1) {
      return false;
    }

    if ($benefitsBar.hasClass("slick-initialized")) {
      $benefitsBar.slick("unslick");
    }

    setTimeout(() => {
      $benefitsBar.slick(slickOptions);
    }, 100);
  },

  startShelfCarouselsDesktop() {
    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: true,
      arrows: true,
      slidesToShow: 4,
      slidesToScroll: 4,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        }
      ]
    };

    this._registerSlickIntervalBind(() => {
      this.$shelfCarousel.slick(slickOptions);
    });
  },

  startShelfCarouselsMobile() {
    if (!APP.i.Helpers._isMobile()) {
      return false;
    }

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: true,
      arrows: false,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    this._registerSlickIntervalBind(() => {
      this.$shelfCarouselMobile.slick(slickOptions);
    });
  },

  seeMoreSeo() {
    if (
      $(".wrap-seo").find("p").length &&
      $(".wrap-seo .wrap-seo__button").length < 1
    ) {
      $(".wrap-seo").parent().append(`
      <a href="#" class="wrap-seo__button"><span>Ver Mais</span><i class="dkti-arrow2-down"></i></a>
    `);
    }

    $(".wrap-seo__button").on("click", function(e) {
      e.preventDefault();
      $(".wrap-seo__button").toggleClass("active");
      $(".wrap-seo").toggleClass("active");
    });
  },

  bind() {
    this.bindWindowResize();
    this.bindPointerEvents();
    this.bindBackButton();
    this.bindScrollBackToTop();
    this.bindClickBackToTop();
    this.bindCloseAvalie();
    this.bindScrollOptions();
    this.bindBreadCrumb();
    this.bindAccount();
    this.bindLogoutButtons();
  },

  bindWindowResize() {
    this._registerSlickIntervalBind(() => {
      $(window).on("resize orientationchange", () => {
        this.$slickSlider.slick("setPosition");
        this.$shelfCarousel.slick("setPosition");
        this.$shelfCarouselMobile.slick("setPosition");
      });
    });
  },

  _registerSlickIntervalBind(callback) {
    const interval = setInterval(() => {
      const resize = $._data(window, "events").resize;

      if (typeof resize === "undefined") {
        return false;
      }

      if (resize[0].namespace === "") {
        clearInterval(interval);

        callback();
      }
    }, 100);
  },

  bindPointerEvents() {
    /* eslint-disable-next-line no-undef */
    PointerEventsPolyfill.initialize({});
  },

  bindBackButton() {
    $(".back-button,.back-button--link").on("click", event => {
      event.preventDefault();
      const _this = $(event.currentTarget);
      const href = _this.attr("href");

      if (!href || href === "#") {
        if (
          document.referrer == "" ||
          document.referrer.indexOf("www.decathlon.com.br") < 0
        ) {
          window.location.href = href;
        } else {
          window.location.href = document.referrer;
        }
      }

      return false;
    });
  },

  bindScrollBackToTop() {
    $(window).on("scroll", () => {
      if ($(".header").length && $(".header").offset().top > 420) {
        $(".back-to-top").fadeIn("fast");
      } else {
        $(".back-to-top").fadeOut("fast");
      }
    });
  },

  bindClickBackToTop() {
    $(".back-to-top__button").on("click", event => {
      event.preventDefault();

      $("html, body").animate({ scrollTop: 0 }, "fast");
    });
  },

  bindCloseAvalie() {
    $(".avalie-fixed--close").on("click", e => {
      e.preventDefault();

      const _this = $(e.currentTarget);

      _this.parent().addClass("avalie-fixed--hidden");

      Cookies.set("dkt-avalieHidden", true, { expires: 3 });
    });
  },

  bindScrollOptions() {
    const { $avalieFixed, $mainHeader, $mainTopHeader, $headerAlert } = this.options;
    let previousScroll = 0;

    const avalieCookie = Cookies.get("dkt-avalieHidden");
    if (avalieCookie === false || avalieCookie === undefined) {
      $avalieFixed.removeClass("avalie-fixed--hidden");
    } else {
      $avalieFixed.addClass("avalie-fixed--hidden");
    }

    $(window).on("scroll", () => {
      const currentScroll = $(window).scrollTop();

      if (currentScroll > previousScroll) {
        $avalieFixed.removeClass("avalie-fixed--opened");
        $headerAlert.addClass("closed");
        $mainTopHeader.addClass("main__top-header--closed");
        $mainHeader.addClass("main__medium--header--up");
      } else {
        $avalieFixed.addClass("avalie-fixed--opened");
        $headerAlert.removeClass("closed");
        $mainTopHeader.removeClass("main__top-header--closed");
        $mainHeader.removeClass("main__medium--header--up");
      }

      previousScroll = currentScroll;
    });
  },

  bindBreadCrumb() {
    const breadCrumb = $(".bread-crumb:first");

    if (
      breadCrumb.find("ul li:first").find("i.bread-crumb-icon--home").length ==
      0
    ) {
      breadCrumb
        .find("ul li:first")
        .prepend('<i class="bread-crumb-icon--home"></i>');
    }
  },

  bindAccount() {
    let { nameUserLogged } = this.options;

    $.ajax({
      type: "get",
      url: "/no-cache/profileSystem/getProfile"
    })
      .done(function(res) {
        nameUserLogged = res.FirstName;

        if (res.IsUserDefined == true) {
          nameUserLogged =
            nameUserLogged == null ? "Esportista" : nameUserLogged;

          $("#welcomeNameUserDtp").html(
            `Olá ` + nameUserLogged + `, seja bem-vindo`
          );
          $(".account-user-name").html(
            `Olá <span class="link-blue">` +
              nameUserLogged +
              `</span>!<a href="/minha-conta">Acesse sua conta</a>`
          );
          $(".header__content--user")
            .removeClass("not-logged")
            .addClass("logged");
          $(".header__content--account").addClass("logged");
        } else {
          Cookies.remove("1id_shared_id");
        }
        // return name;
      })
      .fail(function(e) {
        console.log("erro");
      });
  },

  bindLogoutButtons() {
    $(document).on(
      "click",
      'a[href="/no-cache/user/logout"], a[href="/logout"]',
      event => {
        event.preventDefault();

        Cookies.remove("1id");

        const _this = $(event.currentTarget);
        const href = _this.attr("href");

        window.location.href = href;
      }
    );
  }
});
