APP.controller.Home = ClassAvanti.extend({
  init() {
    this.setup();
    this.start();
    this.bind();
  },

  setup() {
    this.options = {
      $bannerFull: $(".home-banner-full"),
      $sectionInformative: $(".section-informative"),
      $sectionSportiveTips: $(".blog-entries"),

      classBannerVideo: "banner-video",
      classSlickFrame: "slick-frame",
      timerStart: Date.now()
    };

    APP.i.Helpers = new APP.component.Helpers();
    APP.i.EnhancedEcommerce = new APP.component.EnhancedEcommerce();
  },

  start() {
    this.checkBannerVideo();

    APP.i.EnhancedEcommerce.onAccessLandingPage();
  },

  startSlick() {
    this.slickBannerFull()
    //this.slickFeaturedSports()
    //this.slickFeaturedCategories()
    this.slickSelectionOffers()
    this.slickInformative();
    if (!APP.i.Helpers._isMobile()) {
      this.slickSportiveTips();
    }
  },

  checkBannerVideo() {
    const { $bannerFull, classBannerVideo } = this.options;

    if ($(`.${classBannerVideo} iframe`).length > 0) {
      $bannerFull.addClass("banner-video--open");
    }
  },

  slickBannerFull() {
    const { $bannerFull, classSlickFrame } = this.options;

    if ($bannerFull.find(".home-banner-full__wrapper").length < 1) {
      return false;
    }

    const slickOptionsFullBanner = {
      infinite: false,
      autoplay: true,
      dots: true,
      speed: 500,
      arrows: true
    };

  
    APP.i.general._registerSlickIntervalBind(() => {
      $bannerFull.find(`.${classSlickFrame}`).slick(slickOptionsFullBanner);
    });

    const intervalBanner = setTimeout(() => {
      if ($bannerFull.find(".slick-frame.slick-initialized")) {
        clearInterval(intervalBanner);
        $bannerFull.addClass("slick-started");
      }
    }, 100);
  },

  slickFeaturedSports() {
    if (!APP.i.Helpers._isMobile()) {
      return false;
    }

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: false,
      arrows: false,
      slidesToShow: 2,
      slidesToScroll: 2
    };

    APP.i.general._registerSlickIntervalBind(() => {
      $(".featured-sports").slick(slickOptions);
    });
  },

  slickFeaturedCategories() {
    if (!APP.i.Helpers._isMobile()) {
      return false;
    }

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: false,
      arrows: false,
      slidesToShow: 2,
      slidesToScroll: 2
    };

    APP.i.general._registerSlickIntervalBind(() => {
      $(".featured-categories").slick(slickOptions);
    });
  },

  slickSelectionOffers() {
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

    APP.i.general._registerSlickIntervalBind(() => {
      $(".selection-offers").slick(slickOptions);
    });
  },

  slickInformative() {
    const { $sectionInformative, classSlickFrame } = this.options;

    let enableArrows = false;

    if (!APP.i.Helpers._isMobile()) {
      enableArrows = true;
    }

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: true,
      arrows: enableArrows,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    APP.i.general._registerSlickIntervalBind(() => {
      $sectionInformative.find(`.${classSlickFrame}`).slick(slickOptions);
    });
  },

  slickSportiveTips() {
    const { $sectionSportiveTips , classSlickFrame } = this.options;

    let enableArrows = true;

    const slickOptions = {
      infinite: false,
      autoplay: false,
      dots: true,
      arrows: enableArrows,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    APP.i.general._registerSlickIntervalBind(() => {
      $sectionSportiveTips.find(`.${classSlickFrame}`).slick(slickOptions);
    });
  },

  bind() {
    this.handleScroll();
    this.startSlick();
  },

  handleScroll() {
    if (APP.i.Helpers._isMobile()) {
      this.getInstagramMedia()
      return false;
    }

    var loaded = false;

    $(window).on("scroll", event => {
      // const el = $('.home-banner-middle').last()
      const el = $(".shelf-carousel.home-shelf").last();
      const hT = el.offset().top;
      const hH = el.outerHeight();
      const wH = $(window).height();
      const wS = $(event.currentTarget).scrollTop();

      if (wS > hT + hH - wH && !loaded) {
        loaded = true;

        APP.i.BlogTipsEntries.getEntries(
          "posts",
          "?filter[destaque]=sim&per_page=6"
        );
        // APP.i.BlogEventsEntries.getEntries('', '')

        this.getInstagramMedia()
      }
    });
  },

  /* 
  START section instagram
  */
  getInstagramMedia() {

    const query = JSON.stringify({
      query: `query {
        instagramPhotos {
            images
        }
      }`
    })

    $.ajax({
      url: `https://instagram--decathlonstore.myvtex.com/_v/graphql/private/v1`,
      type: 'post',
      dataType: 'json',
      data: query
    }).then(response => {

      let images = response.data.instagramPhotos[0].images
      images = JSON.parse(images);
      this.creatPostInstagram(images.data);
    }, error => {
      throw new Error(error)
    })
  },

  creatPostInstagram(res) {
    const data = res;
    const list = $(".insta-image-list")[0];

    var totalPost = '';
    APP.i.Helpers._isMobile() ? totalPost = "4" : totalPost = "8"; 

    $.each(data, function(index) {
      if (index < totalPost) {
        list.innerHTML += `
        <li class="insta-image-item insta-image-item--${data[index].type}">
          <a href="${data[index].link}" target="_blank" class="gaClick" data-event-category="HP - Instagram" data-event-action="Click Post" data-event-label="${data[index].type} - ${data[index].link}">
            <img src="${data[index].images.low_resolution.url}" alt="${data[index].caption.text}" />
          </a>
        </li>`;
      }
    });

    this.showPostInstagram();
  },

  showPostInstagram() {
    setTimeout(() => {
      $(".section-instagram").addClass("done");
    }, 500);
  }
  /* 
  END section instagram
  */
});
