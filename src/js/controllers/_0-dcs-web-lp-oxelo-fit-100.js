APP.controller.LpOxeloFit100 = ClassAvanti.extend({
  init() {
    this.start();
    this.bind();
  },

  start() {
    if (window.innerWidth >= 768) {
      this.animations();
    }
    if (window.innerWidth <= 768) {
      this.sliderBenefits();
    }
  },

  bind(){
      function showMovie(){
      $(".tuto-bt").css({ display: "none" });
      $(".tuto-bg").css({ opacity: "0", transition: "0.3s ease-in", display: "none" });
      $(".tuto-title").css({ opacity: "0", transition: "0.3s ease-in", display: "none"});
      $(".tuto-video").css({ opacity: "1", transition: "0.3s ease-in" });
    }

    function openMovie(){
      var linkMovie = $("#tuto-video").attr("data-src");
      $("#tuto-video").attr("src", linkMovie); 
    }

    $('body').on('click', '.tuto-bt', function () {
      showMovie();
      openMovie();
    });
  },


  animations: function () {
    var controller = new ScrollMagic.Controller();

    var top_scene = new ScrollMagic.Scene({
        triggerElement: "#main-container"
      })
      .setClassToggle(".home", "animate")
      .reverse(false)
      .addTo(controller);

    var topItems_scene = new ScrollMagic.Scene({
        triggerElement: "#page"
      })
      .setClassToggle(".top", "visible")
      .reverse(false)
      .addTo(controller);

    var topBottom_scene = new ScrollMagic.Scene({
        triggerElement: "#topTitle-trigger"
      })
      .setClassToggle(".top-bottom", "visible")
      .reverse(false)
      .addTo(controller);

    var adv_scene = new ScrollMagic.Scene({
        triggerElement: "#adv"
      })
      .setClassToggle(".adv", "visible")
      .reverse(false)
      .addTo(controller);

    var chef_scene = new ScrollMagic.Scene({
        triggerElement: "#adv .adv-items .adv-item:last-of-type .adv-item-txt"
      })
      .setClassToggle(".chef", "visible")
      .reverse(false)
      .addTo(controller);

    var matosTitle_scene = new ScrollMagic.Scene({
        triggerElement: "#matos",
        triggerHook: 'onEnter',
        offset: 700
      })
      .setClassToggle(".matos-title", "visible")
      .reverse(false)
      .addTo(controller);

    var matosMan_scene = new ScrollMagic.Scene({
        triggerElement: "#matosMan",
      })
      .setClassToggle(".matos-cont-title", "visible")
      .reverse(false)
      .addTo(controller);

    var matosMan1_scene = new ScrollMagic.Scene({
        triggerElement: "#matosMan",
      })
      .setClassToggle("#itemMan-1", "visible")
      .reverse(false)
      .addTo(controller);

    var matosItemMan2_scene = new ScrollMagic.Scene({
        triggerElement: "#itemMan-1 .matos-item-img",
      })
      .setClassToggle("#itemMan-2", "visible")
      .reverse(false)
      .addTo(controller);

    var matosItemMan3_scene = new ScrollMagic.Scene({
        triggerElement: "#itemMan-2 .matos-item-img",
      })
      .setClassToggle("#itemMan-3", "visible")
      .reverse(false)
      .addTo(controller);

    var matosWoman_scene = new ScrollMagic.Scene({
        triggerElement: "#matosWoman",
        triggerHook: 'onEnter',
        offset: 203
      })
      .setClassToggle(".matos-cont-title", "visible")
      .reverse(false)
      .addTo(controller);

    var matosWoman_scene = new ScrollMagic.Scene({
        triggerElement: "#matosWoman",
        triggerHook: 'onEnter',
        offset: 213
      })
      .setClassToggle("#itemWoman-1", "visible")
      .reverse(false)
      .addTo(controller);

    var matosItemWoman2_scene = new ScrollMagic.Scene({
        triggerElement: "#itemWoman-1 .matos-item-img",
        triggerHook: 'onEnter',
        offset: 500
      })
      .setClassToggle("#itemWoman-2", "visible")
      .reverse(false)
      .addTo(controller);

    var matosItemWoman3_scene = new ScrollMagic.Scene({
        triggerElement: "#itemWoman-2 .matos-item-img",
      })
      .setClassToggle("#itemWoman-3", "visible")
      .reverse(false)
      .addTo(controller);

    var infos_scene = new ScrollMagic.Scene({
        triggerElement: "#infos"
      })
      .setClassToggle(".infos", "visible")
      .reverse(false)
      .addTo(controller);

    var tuto_scene = new ScrollMagic.Scene({
        triggerElement: ".tuto"
      })
      .setClassToggle(".tuto", "visible")
      .reverse(false)
      .addTo(controller);

    var cta_scene = new ScrollMagic.Scene({
        triggerElement: "section.hlg-cta",
        triggerHook: 'onEnter',
        offset: 250
      })
      .setClassToggle("section.hlg-cta", "visible")
      .reverse(false)
      .addTo(controller);
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
  },
});

