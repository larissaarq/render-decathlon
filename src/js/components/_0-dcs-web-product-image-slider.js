APP.component.ProductImageSlider = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      template: variables => {
        return `<li class="slick-product-img-item">
                  <img src="${variables.imgSrc}" rel="${variables.imgTypeId}" />
                </li>`
      },

      $imageContainer: $('#image'),
      $scope: $('.slick-product-img'),
      $list: $('.slick-product-img-list'),
      $item: $('.slick-product-img-list'),
      $thumbs: $('#show .thumbs'),
      $skuJson: skuJson,
      $currentSku: ($('#calculoFrete').length === 0) ? skuJson.skus[0].sku : $('#calculoFrete').attr('skucorrente'),

      classBodyMobile: 'slider-mobile-only',
      classBodyAll: 'slider-all'

    }, options)
  },

  start () {
    this._createSlick()
  },

  bind () {
    this._bindResizeSlick()
  },

  addVideoMobile ($slider) {
    var video = "" 
    const { $list } = this.options
    if ($('.product-details .product-details-video ul li').length > 0) {
      $('.product-info .product-images').append('<div class="thumb-video video-mobi"></div>')
      const $video = $('.product-details .product-details-video ul li')
      const videoUrl = $video.html()
      const url = videoUrl.split('v=')

      setTimeout(() => {
        $($slider).slick('slickAdd', `<li><iframe style="width: 90%; height: 300px;" src="https://www.youtube.com/embed/${url[1]}?rel=0&amp;modestbranding=1&amp;controls=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></li>`)
      }, 200)

    }
    return video
  },
  
  _createSlick () {
    const { template } = this.options

    $.ajax({
      url: '//' + window.location.hostname + '/produto/sku/' + this.options.$currentSku,
      type: 'GET',
      success: data => {
        const string = data
        const objImage = string[0].Images

        this.options.$list.html('')

        objImage.map(image => {
          const imageType = image.find(imageType => {
            if (imageType.ArchiveTypeId === 2) {
              return true
            }
            return false
          })

          const $image = template({
            imgSrc: imageType.Path,
            imgTypeId: imageType.ArchiveTypeId
          })

          this.options.$list.append($image)

          return false
        })

        this._startSlickMobileOnly()
      }
    })
  },

  _startSlickMobileOnly () {
    const {
      $list,
      classBodyMobile
    } = this.options

    if ($('body').addClass(classBodyMobile), $list.find('>li').length > 1) {

      $list.hasClass("slick-initialized")
      $list.removeClass("slick-initialized slick-slider")
      
      const slickOptions = {
        mobileFirst: true,
        autoplay: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        arrows: true,
        infinite: false,
        responsive: [
          {
            breakpoint: 992,
            settings: 'unslick'
          }
        ]
      }

      
      $list.on('init', (event, slick) => {
        this.addVideoMobile(slick.$slider)
      })
      $list.slick(slickOptions)
    } else {
      $list.addClass("slick-initialized")

    }
  },

  _bindResizeSlick () {
    const {
      $list
    } = this.options

    const intervalResize = setInterval(() => {
      if ($._data(window, 'events').resize[0].namespace === '') {
        clearInterval(intervalResize)

        $(window).on('resize orientationchange', () => {
          $list.slick('resize')
        })
      }
    }, 100)
  },

  _unBindSlick () {
    const {
      $list
    } = this.options

    if ($list.hasClass('slick-initialized')) {
      $list.slick('unslick')
    }
  }
})
