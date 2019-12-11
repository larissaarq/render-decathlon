APP.component.BlogEntries = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
  },

  setup (options) {
    this.options = $.extend({
      $target: $('.blog-entries'),

      slick: true,

      url: 'https://souesportista.decathlon.com.br/wp-json/wp/v2/',
      maxEntries: 6,
      maxEntriesMobile: 4,

      /* eslint-disable-next-line no-unused-vars */
      template (variables) {
      },

      slickOptions: {
        autoplay: false,
        dots: true,
        arrows: false,
        slidesToShow: 3,
        slidesToScroll: 3,
        responsive: [
          {
            breakpoint: 991,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2
            }
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }
        ]
      }
    }, options)
  },

  start () {

  },

  getEntries (type, tag) {
    const { url } = this.options

    const urlFiltered = url + type + tag
    console.log(urlFiltered)
    this.setLinkPosts(tag)

    $.ajax({
      url: urlFiltered,
      type: 'GET',
      success: data => {
        this.buildEntries(data)
      }
    })
  },

  buildEntries (data) {
    const {
      $target,
      slick,
      maxEntries,
      maxEntriesMobile,
      template
    } = this.options

    const fields = []
    const entriesToGet = this._isMobile() ? maxEntriesMobile : maxEntries
    if (data === null) {
      fields.push(false)
    } else {
      for (let i = 0; i < entriesToGet; i++) {
        fields.push(data[i])
      }
    }
    const months = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    $target.append(template(fields))

    $('.blog-events__date').find('.blog-events__date-month').each((i, e) => {
      const _this = $(e)
      const index = parseInt(_this.text(), 10)
      _this.html(months[index])
    })

    // Se não houver dicas, esconde o div
    if ($target.parents('.section-sportive-tips').length > 0) {
      if ($target.find('.blog-tips').length == 0) $target.parents('.section-sportive-tips').hide()
      $('.dicas-blog-produto').show();
    }

    // Se não houver eventos, esconde o div
    if ($target.parents('.section-sportive-events').length > 0) {
      if ($target.find('.blog-events').length == 0) $target.parents('.section-sportive-events').hide()
    }

    if (slick) {
      this.slickBlog()
    }
  },

  setLinkPosts (type) {
    if (!$('body').hasClass('home')) {
      const infoPage = vtxctx
      const urlPad = 'https://souesportista.decathlon.com.br/?s='
      let typeCategory

      if (infoPage.searchTerm) {
        const typeCategoryTrash = type.split('filter[category_name]=')
        typeCategory = typeCategoryTrash[1]
      }

      if (infoPage.departmentName) {
        typeCategory = infoPage.departmentName
      }

      const intervalSetLink = setInterval(() => {
        if (typeCategory) {
          clearInterval(intervalSetLink)
          const urlFilteredTips = urlPad + typeCategory + '&custom=dicas'
          const urlFilteredEvent = urlPad + typeCategory + '&custom=eventos'
          $('.sportive-tips__button a').attr('href', urlFilteredTips)
          $('.sportive-events__button a').attr('href', urlFilteredEvent)
        }
      }, 10000)
    }
  },

  slickBlog () {
    const {
      $target,
      slickOptions
    } = this.options

    if($('body').hasClass('store-detail')){
      $target.slick(slickOptions)
    }else {
      APP.i.general._registerSlickIntervalBind(() => {
        $target.slick(slickOptions)
      })
    }
  },

  _isMobile () {
    return $(window).width() < 991
  }
})
