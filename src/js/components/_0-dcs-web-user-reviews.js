function goToTopPage() { }

APP.component.UserReviews = ClassAvanti.extend({
  init(productCode) {
    this.setup()
    this.productCode = productCode;
    this.start(productCode)
  },

  setup(options) {
    this.productCode = null;
    this.options = $.extend({
      $username: 'ecommerceapi_br',
      $password: 'DhYn67hDyrpMM',
      $url: 'https://reviews.decathlon.com/api/',
      $local: 'pt_BR',
      $sort: 'createdAt',
      $direction: 'desc',
      $page: '1',
      $nb: '3',
      $site: '1078',
      $locales: 'pt_BR,pt_PT,es_ES,en,fr_FR,it_IT',
      // $locales: 'pt_BR',
      $keepLocalesOrder: '1',
      $scope: $('.product-rating'),
      $firstSlide: '',

      target($scope, content) {
        $scope.find('.product-rating--comments_wrapper').html(content)
      },

      template(variables) {
        return `<ul class="product-rating-list">
                  ${variables.map(item => `
                    <li class="product-rating-item">

                      <div class="product-rating-stars">
                        <div class="product-rating-stars--title"><span>NOTA</span> GERAL:</div>
                        <div class="product-rating-stars--rate">${item.stars}</div>
                      </div>

                      <div class="product-rating-comment">
                        <p><b>Avaliação: </b> ${item.comment}</p>
                      </div>
                      <div class="product-rating-bottom">
                        <div class="product-rating-date">${item.date}</div>
                        <div class="product-rating-author">
                          <span class="product-rating-author--name">Cliente: ${item.author}</span>
                          <span class="product-rating-author--country">- ${item.country}</span>
                          <span class="product-rating-author--since">
                            - Utiliza desde: <span>${item.since}</span>
                          </span>
                        </div>

                        <div class="product-rating-vote">
                          <span class="product-rating-vote--text">
                            Você achou este comentário útil?
                          </span>
                          <span class="product-rating-vote--buttons">
                           <a href="https://reviews.decathlon.com/api/post/pt_BR/review/vote/${item.id}/0" class="product-rating-vote--no">NÃO</a>
                           <a href="https://reviews.decathlon.com/api/post/pt_BR/review/vote/${item.id}/0" class="product-rating-vote--yes">SIM</a>
                          </span>
                        </div>
                      </div>
                  </li>
                  `).join('')}
                </ul>`
      }
    }, options)
  },

  start(productCode) {
    // console.log(`Cod ${productCode}`);
    this.generateToken(productCode);
  },

  generateToken(productCode) {
    const {
      $username,
      $password,
      $local
    } = this.options
    let res = null
    const form = new FormData()

    form.append('_username', $username)
    form.append('_password', $password)

    $.ajax({
      type: 'POST',
      enctype: 'multipart/form-data',
      url: `https://reviews.decathlon.com/api/post/${$local}/login_check`,
      data: form,
      processData: false,
      contentType: false,
      cache: false,
      async: true,
      success: result => {
        res = result.token
        localStorage.setItem("jwtTokenDecathlon", JSON.stringify(result));
        this.getReviews(result.token, productCode)
       // this.start(this.productCode);

        //Cookies.set('dkt-reviewToken', res, { expires: 20 });
      },
      error: error => {
        $('.product-rating').hide()
        console.error(error)
      }
    })
    return res
  },

  getReviews(token, productCode) {
    const {
      $url,
      $local,
      $locales,
      $sort,
      $direction,
      $page,
      $nb,
      $site,
      $keepLocalesOrder
    } = this.options

    const _self = this

     const urlList = `${$url}${$local}/v2/review/list?sort=${$sort}&direction=${$direction}&page=${$page}&nb=${$nb}&site=${$site}&type=1&locales=${$locales}&keep_locales_order=${$keepLocalesOrder}&offer=` + productCode
    //const urlList = "https://reviews.decathlon.com/api/pt_BR/v2/review/list?sort=createdAt&direction=desc&page=1&nb=5&site=1078&type=1&locales=pt_BR,pt_PT,es_ES,en,fr_FR,it_IT&keep_locales_order=1&offer=8488660";
    $.ajax({
      type: 'GET',
      crossDomain: true,
      async: true,
      url: urlList,
      dataType: 'json',
      contentType: 'application/json;',
      headers: {
        Authorization: 'ovbearer ' + token
      },
      success: response => {
        const reviewsList = response.reviews
        const averageNote = response.total_ratings_average_note
        const reviewsCount = response.reviews_count
        const reviewsNotes = response.notes
        const reviews = reviewsList.map(review => this.populateReview(review))
        const totalPages = response.total_page_number
        if (totalPages < 3) {
          $('.pagination-list').addClass('less-three')
        } else {
          $('.pagination-list').removeClass('less-three')
        }
        if (reviews.length > 0) {
          this.createReviews(token, reviews)
          this.createGeneralReviews(averageNote, reviewsCount, reviewsNotes, productCode)
          if (this.options.$firstSlide.length === 0) {
            this.createPagination(totalPages, token, productCode, 1)
          }
          $('.product-details-content.rating').removeClass('without-reviews')
          $('.without-reviews-message').remove()
        } else {
          this.withoutReviews(productCode)
        }
      },
      complete: () => {
        $('.product-rating--comments_wrapper').removeClass('loading')
        $('.product-rating').show()
      },
      error: error => {
        console.error('Get reviews error >>> ', error)
        //this.generateToken();
        // $('.product-rating').hide()
      }
    })

    this.reviewsOrder(token, productCode)
  },

  populateReview(review, item, since) {
    const country = review.country
    if (review.range_used_since === undefined) {
      since = ''
    } else {
      since = JSON.stringify(review.range_used_since).split(':')[1].split('"')[1]
    }

    item = {
      stars: review.note,
      comment: review.body,
      date: review.created_at,
      author: review.firstname,
      country: review.country_label[country],
      id: review.id,
      since
    }
    return item
  },

  createReviews(token, reviews) {
    const {
      $scope,
      template,
      target
    } = this.options

    target($scope, template(reviews))
    $('.product-rating-date').each((i, e) => {
      const _this = $(e)
      let data = _this.text().slice(0, 10).split('-')
      data = `${data[2]}/${data[1]}/${data[0]}`
      _this.html(data)
    })

    this.setRateStars()
    this.sendVotes(token)
  },

  createGeneralReviews(averageNote, reviewsCount, reviewsNotes, productCode) {
    const templateGeneral = `
      <div class="reviews-sidebar-stars">
        <div class="reviews-sidebar-title"><span>Nota</span> Média</div>
        <div class="reviews-sidebar-rate">
          <span class="reviews-sidebar-rate--stars product-rating-stars--rate"></span>
          <span class="reviews-sidebar-rate--note"><b>${averageNote}</b>/5</span>
        </div>
      </div>
      <div class="reviews-sidebar-text">
        Avaliações que foram feitas <br>deste produto:
        <span class="reviews-sidebar-text--count">${reviewsCount}</span>
      </div>
      <div class="reviews-sidebar-notes av-hidden-xs av-hidden-sm">
        <ul class="reviews-sidebar-notes--list">
          <li class="reviews-sidebar-notes--item" data-rate="${reviewsNotes[5].count}">
            <b>5 Estrelas</b> <span class="reviews-sidebar-notes--bar"><i></i></span> <b>(${reviewsNotes[5].count})</b>
          </li>
          <li class="reviews-sidebar-notes--item" data-rate="${reviewsNotes[4].count}">
            <b>4 Estrelas</b> <span class="reviews-sidebar-notes--bar"><i></i></span> <b>(${reviewsNotes[4].count})</b>
          </li>
          <li class="reviews-sidebar-notes--item" data-rate="${reviewsNotes[3].count}">
            <b>3 Estrelas</b> <span class="reviews-sidebar-notes--bar"><i></i></span> <b>(${reviewsNotes[3].count})</b>
          </li>
          <li class="reviews-sidebar-notes--item" data-rate="${reviewsNotes[2].count}">
            <b>2 Estrelas</b> <span class="reviews-sidebar-notes--bar"><i></i></span> <b>(${reviewsNotes[2].count})</b>
          </li>
          <li class="reviews-sidebar-notes--item" data-rate="${reviewsNotes[1].count}">
            <b>1 Estrela</b> <span class="reviews-sidebar-notes--bar"><i></i></span> <b>(${reviewsNotes[1].count})</b>
          </li>
        </ul>
      </div>
      <div class="reviews-sidebar-bottom">
        <div class="reviews-sidebar-bottom--text">Avalie você também <br>este produto</div>
        <div class="reviews-sidebar-bottom--button">
          <a href="javascript:;" class="button button--large button--blue button-add-review" data-target="av-modal--reviews">AVALIAR</a>
        </div>
      </div>
    `

    $('.product-rating--general-rate').html(templateGeneral)

    $('.reviews-sidebar-notes--item').each((i, e) => {
      const _this = $(e)
      const pct = parseInt((_this.data('rate') * 100) / reviewsCount, 10).toFixed(2)
      _this.find('.reviews-sidebar-notes--bar > i').css('width', pct + '%')
    })

    $('.reviews-sidebar-rate').each((i, e) => {
      const _this = $(e)
      const rate = parseInt(_this.find('.reviews-sidebar-rate--note > b').text(), 10).toFixed(0)
      const stars = `<div class="rate-stars rate-stars--${rate}">${rate}</div>`
      _this.find('.reviews-sidebar-rate--stars').html('').html(stars)
    })

    this.openReviewModal(productCode)

    if ($(window).width() < 992) {
      $('.product-rating--general-rate').prependTo('.product-details-content.rating')
    }
  },

  setRateStars() {
    $('.product-rating-stars .product-rating-stars--rate').each((i, e) => {
      const _this = $(e)
      const rate = _this.text()

      const stars = `<div class="rate-stars rate-stars--${rate}">${rate}</div>`

      _this
        .prepend(stars)
    })
  },

  sendVotes(token) {
    $('.product-rating-vote--buttons').find('> a').on('click', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)
      const url = _this.attr('href')
      $.ajax({
        type: 'POST',
        crossDomain: true,
        async: false,
        url,
        dataType: 'json',
        contentType: 'application/json;',
        headers: {
          Authorization: 'ovbearer ' + token
        },
        success: response => {
          console.log(response)
        },
        error: error => {
          console.error(error)
        }
      })
    })
  },

  reviewsOrder(token, productCode) {
    $('select.order-reviews').selectpicker({ noneSelectedText: 'Ordenar por' })
    $('select.order-reviews').on('change', e => {
      $('.product-rating--comments_wrapper').addClass('loading')
      const _this = $(e.currentTarget)
      const orderValue = _this.val().split(',')
      this.options.$sort = orderValue[0]
      this.options.$direction = orderValue[1]
      this.getReviews(token, productCode)
    })
  },

  createPagination(totalPages, token, productCode, currentPage = 1) {
    const {
      $page
    } = this.options
    $('.pagination-list').html('')
    $('.pagination-list').pager({
      pagenumber: currentPage, pagecount: totalPages, buttonClickCallback: page => {
        $('.product-rating--comments_wrapper').addClass('loading')
        this.options.$page = page
        this.options.$firstSlide = parseInt(page) - 1
        this.getReviews(token, productCode)
        this.createPagination(totalPages, token, productCode, page)
        //  _this.parents('.pagination-list').find('.pagination-link').removeClass('pagination-link--current')
        //  _this.addClass('pagination-link--current')
      }
    })
    // for (let i = 1; i <= totalPages; i++) {
    //   const paginationItem = `<li class="pagination-item"><a href="#" class="pagination-link ${(i == 1 ? 'pagination-link--current' : '')}" data-page="${i}">${i}</a></li>`
    //   $('.pagination-list').append(paginationItem)
    //   if (i == 1) {
    //     console.log(i)
    //   }
    // }

    /* $('.pagination-link').each((i, e) => {
      const _this = $(e)
      if (_this.is(':nth-child(3n+0)')) {
        _this.addClass('next-row')
      }
    }) */
    //this.startSlickPagination()
    this.paginationResults(token, productCode)
  },

  startSlickPagination() {
    const slickThumbs = $('.pagination-list')
    const slickOptions = {
      autoplay: false,
      dots: false,
      arrows: true,
      slidesToShow: 3,
      slidesToScroll: 3,
      infinite: false
    }

    if (slickThumbs.hasClass('slick-initialized')) {
      slickThumbs.slick('unslick')
    }

    slickThumbs.slick(slickOptions)
  },

  paginationResults(token, productCode) {
    $('.pagination-link').on('click', e => {
      e.preventDefault()
      const _this = $(e.currentTarget)
      $('.product-rating--comments_wrapper').addClass('loading')
      this.options.$page = _this.data('page')
      this.options.$firstSlide = parseInt(_this.data('page')) - 1
      this.getReviews(token, productCode)
      _this.parents('.pagination-list').find('.pagination-link').removeClass('pagination-link--current')
      _this.addClass('pagination-link--current')
    })

    $('.pagination-prev').on('click', e => {
      e.preventDefault()
      $('.pagination-link--current').parent('.pagination-item').not(':first-child').prev('.pagination-item').find('.pagination-link').click()
      const marginEl = parseInt($('.pagination-list').css('margin-left').replace('px', ''), 10) + 30
      $('.pagination-list').not('.less-three').css('margin-left', `${marginEl}px`)
    })

    $('.pagination-next').on('click', e => {
      e.preventDefault()
      $('.pagination-link--current').parent('.pagination-item').not(':last-child').next('.pagination-item').find('.pagination-link').click()
      const marginEl = parseInt($('.pagination-list').css('margin-left').replace('px', ''), 10) - 30
      $('.pagination-list').not('.less-three').css('margin-left', `${marginEl}px`)
    })
  },

  openReviewModal(productCode) {
    const target = $('.av-modal--reviews')
    const btnReviews = $('.button-add-review')
    $('.av-modal--reviews').find('.av-modal__content')
      .html(`<iframe src="https://reviews.decathlon.com/pt_BR/review/new/dktbr/product/${productCode}">SEU NAVEGADOR NÃO SUPORTE IFRAMES</iframe>`)

    btnReviews.on('click', e => {
      e.preventDefault()
      APP.i.Modal = new APP.component.Modal(target)
      APP.i.Modal.openModal(target)
    })
  },

  withoutReviews(productCode) {
    $('.product-details-content.rating').addClass('without-reviews')
    if ($('.without-reviews-message').length === 0) {
      const templateWithout = `<div class="without-reviews-message">
                                <p class="without-reviews--text">Seja o primeiro a avaliar este produto</p>
                                <div class="without-reviews--button">
                                  <a href="javascript:;" class="button button--large button--blue button-add-review" data-target="av-modal--reviews">AVALIAR</a>
                                </div>
                              </div>`

      $('.without-reviews').append(templateWithout)
    }
    this.openReviewModal(productCode)
  }

})
