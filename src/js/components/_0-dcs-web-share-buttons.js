APP.component.ShareButtons = ClassAvanti.extend({
  init: function(buttons, options) {
    this.setup(options)
    this.start(buttons)
    this.bind()
  },

  setup(options) {
    if (typeof APP.i.Helpers === 'undefined') {
      throw new TypeError('You need Helpers Component installed.')
    }

    this.options = {
      $shareContent: $('.share-content'),
      helpers: APP.i.Helpers,
      shareConfigs: options
    }
  },
  
  start: function(buttons) {
    const { $shareContent } = this.options
    const self = this
  
    let template = '<p class="text-share">Compartilhe:</p>';
    $.each(buttons, function(i, btn) {
      template += self.btnTemplate(btn)
    });
        
    $shareContent.prepend(template)
  },

  btnTemplate: function (type) {
    const { shareConfigs } = this.options

    const action =  (type == 'whatsapp') ? 'share/whatsapp/share' : ''
    return `<a role="button" class="btn-share btn-share--${type} gaClick" data-event-category="${shareConfigs.eventCategory}${type}" data-event-action="Share" data-event-label="${shareConfigs.page}" data-image="${shareConfigs.image}" data-text="${shareConfigs.text}" data-action="${action}">${type}<span class="share-icon"></span></a>`
  },

  shareFacebook(page, text, image) {
    const {
      helpers
    } = this.options

    const url = encodeURIComponent(page);
    helpers._abreLinkPopUp(
      'https://www.facebook.com/sharer.php?u=' + url + '&p[images][0]=' + image + '&p[title]=' + text,
      'Decathlon',
      900,
      500
    );
  },

  shareTwitter(page, text) {
    const {
      helpers
    } = this.options

    const txt = (text != undefined) ? encodeURIComponent(text) : 'Decathlon';
    const hashtags = encodeURIComponent('decathlonbrasil,souesportista');
    const url = encodeURIComponent(page);
    const via = encodeURIComponent('');

    helpers._abreLinkPopUp(
      'http://twitter.com/share?url=' + url + '&text=' + txt + '&hashtags=' + hashtags,
      'Decathlon',
      900,
      500
    );
    return false;
  },

  shareWhatsapp(page) {
    const {
      helpers
    } = this.options
    const url = encodeURIComponent(page);

    helpers._abreLinkPopUp(
      'http://whatsapp://send?text=' + url,
      'Decathlon',
      900,
      500
    );
    return false;
  },
  
  sharePinterest(page, text, image) {
    const {
      helpers
    } = this.options
    const url = encodeURIComponent(page);
    const imageURI = encodeURIComponent(image);
    helpers._abreLinkPopUp(
      'http://pinterest.com/pin/create/bookmarklet/?url=' + url + '&media=' + imageURI + '&description=' + text,
      'Decathlon'
    );
    return false;
  },

  bind() {
    const _this = this

    $("body").on("click", ".btn-share", event => {
      event.preventDefault()

      const url = window.location.href,
        text = $(event.target).attr('data-text'),
        image = $(event.target).attr('data-image')

      if ($(event.target).hasClass('btn-share--facebook')) {
        _this.shareFacebook(url, text, image)
      }

      if ($(event.target).hasClass('btn-share--twitter')) {
        _this.shareTwitter(url, text)
      }

      if ($(event.target).hasClass('btn-share--whatsapp')) {
        _this.shareWhatsapp(url, text)
      }
      
      if ($(event.target).hasClass('btn-share--pinterest')) {
        _this.sharePinterest(url, text, image)
      }
      return false
    })
  }
})
