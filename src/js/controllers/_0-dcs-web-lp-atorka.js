import '../../sass/landings/_0-dcs-web-landing-page-Atorka.scss'

APP.controller.LpAtorka = ClassAvanti.extend({
    init () {
      this.setup()
      this.start()
      this.bind()
    },
  
    setup () {
    },
  
    start () {
      this._landingPageAtorka()
    },
  
    bind () {
    },

    _landingPageAtorka(){
      (function($){
  
        var showText = function (target, message, index, interval) {   
          if (index < message.length) {
            $(target).append(message[index++]);
            setTimeout(function () { showText(target, message, index, interval); }, interval);
          }
        }
      
          var counter1 = 0; 
          var counter2 = 0;
      
          var triggerHeight = $(window).height()/2 + $(window).height()/4;
            var elmtToScroll = $('[data-scrollin]');
            elmtToScroll.addClass('element-out');
            elmtToScroll.each(function(){
              var el = $(this);
              if ($(window).scrollTop() > el.offset().top-triggerHeight){
                el.removeClass('element-out');
                el.addClass('element-in');
                if(counter1 == 0){
                  if(el.is($('#promesse'))){
                    console.log('promesse',counter1);
                    showText(el, "FAZER O HANDBALL ACESSÍVEL AO MAIOR NÚMERO DE PRATICANTES!", 0, 25);
                    counter1++;
                  }
                }
                if(counter2 == 0){
                  if(el.is($('#mission'))){
                    console.log('mission',counter2);
                    showText(el, "FAZER O HANDBALL ACESSÍVEL AO MAIOR NÚMERO DE PRATICANTES!", 0, 25);
                    counter2++;
                  }
                }
                setTimeout(function(){
                  el.addClass('charged');
                }, 2100);
              }
            });
            $(window).scroll(function(){
              elmtToScroll.each(function(){
                var el = $(this);
              if ($(window).scrollTop() > el.offset().top-triggerHeight){
                el.removeClass('element-out');
                el.addClass('element-in');
                if(counter1 == 0){
                  if(el.is($('#promesse'))){
                    console.log('promesse',counter1);
                    showText(el, "FAZER O HANDBALL ACESSÍVEL AO MAIOR NÚMERO DE PRATICANTES!", 0, 25);
                    counter1++;
                  }
                }
                if(counter2 == 0){
                  if(el.is($('#mission'))){
                    console.log('mission',counter2);
                    showText(el, "FAZER O HANDBALL ACESSÍVEL AO MAIOR NÚMERO DE PRATICANTES", 0, 25);
                    counter2++;
                  }
                }
                setTimeout(function(){
                  el.addClass('charged');
                }, 2100);
              }
            });
          });
      
          setTimeout(function(){
            $("[data-onload]").addClass('loaded');
          }, 1000);
      
      })(jQuery)
    }
  
  })
  