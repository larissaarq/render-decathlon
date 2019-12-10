APP.controller.LpDepartament = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.departamentSlug = window.location.pathname.split('/').pop().slice(0, -2)
    this.$sectionBannerFull = $('.banner-full--lp-departament')
    this.$sectionExperienceLevel = $('.section-experience-level')
    this.$sectionAssociatedSports = $('.section-associated-sports')
    this.$productCategories = $('.lp-departament-categories')
    this.$sectionExperiencePlacesSecond = $('.section-experience-places--second')

    this.classExperienceNavItem = 'experience-level-nav__list--item'
    this.classExperienceLevel = 'experience-level'
    this.classAssociatedSports = 'associated-sports'
    this.classCategoriesLink = 'product-categories__title-link'
    this.classSectionTitleText = 'section-title__text'
    this.classSlickFrame = 'slick-frame'
    this.departament = vtxctx.searchTerm.split('-d').shift()

    APP.i.BlogTipsEntries.getEntries('posts', '?filter[category_name]=' + this.departament)
    APP.i.BlogEventsEntries.getEntries('?' + this.departament, '')
  },

  start () {
    this.slickBannerFull()
    this.checkExperienceLevel()
    this.checkAssociatedSports()
    this.getProductCategories()
    this.checkExperiencePlaces()
    this.checkPlaceholderExist()
  },

  slickBannerFull () {
    const slickOptions = {
      autoplay: false,
      dots: true,
      arrows: false
    }

    const slickItems = this.$sectionBannerFull.find(`.banner-full__wrap`)

    if (slickItems.length > 1) {
      APP.i.general._registerSlickIntervalBind(() => {
        this.$sectionBannerFull.find(`.${this.classSlickFrame}`).slick(slickOptions)
      })
    }
  },

  getProductCategories () {
    const url = `/api/catalog_system/pub/facets/search/${this.departamentSlug}?map=c`

    $.ajax({
      url,
      type: 'GET',
      success: data => {
        for (const departament of data.CategoriesTrees) {
          if (departament.Link.substr(1).toLowerCase().indexOf(this.departamentSlug) > -1) {
            this.buildProductCategories(departament)
            break
          }
        }
      }
    })
  },

  buildProductCategories (departament) {
    const categories = departament.Children
    
    for (const category of categories) {
      const template = `<div class="product-categories">
                          <h2 class="product-categories__title">
                            <a href="${category.Link.toLowerCase()}" class="product-categories__title-link gaClick" title="${category.Name}" data-event-category="Lp Departament" data-event-action="Link Department" data-event-label="${category.Link.toLowerCase()}">${category.Name}</a>
                          </h2>

                          <ul class="product-categories__list">
                            ${category.Children.map(children => `
                              <li class="product-categories__item">
                                <h3 class="product-categories__item-title">
                                  <a href="${children.Link.toLowerCase()}" class="product-categories__link gaClick" title="${children.Name}" data-event-category="Lp Departament" data-event-action="Link Categs" data-event-label="${children.Link.toLowerCase()}">${children.Name}</a>
                                </h3>
                              </li>
                            `).join('')}
                          </ul>
                        </div>`

      this.$productCategories.append(template)
    }
  },

  checkExperienceLevel () {
    const experienceLevel = $(`.${this.classExperienceLevel}`)

    if (experienceLevel.length > 0) {
      if (experienceLevel.length === 1) {
        experienceLevel.eq(0).addClass('av-col-md-offset-8')
      } else if (experienceLevel.length === 2) {
        experienceLevel.eq(0).addClass('av-col-md-offset-4')
      }

      let experienceTitleMobile = ''
      const arrTitles = []
      arrTitles[0] = 'Iniciante'
      arrTitles[1] = 'Avançado'
      arrTitles[2] = 'Performance'

      for (let i = 0; i < experienceLevel.length; i++) {
        if (arrTitles[i]) {
          experienceTitleMobile += '<li class="experience-level-nav__list--item"><a href="#">' + arrTitles[i] + '</a></li>'
        }
      }

      if (experienceTitleMobile !== '') {
        const template = `<div class="experience-level-nav">
                            <ul class="experience-level-nav__list">${experienceTitleMobile}</ul>
                          </div>`
        this.$sectionExperienceLevel.append(template)

        const experienceNavItem = $(`.${this.classExperienceNavItem} a`)

        $(experienceNavItem).on('click', event => {
          event.preventDefault()
          const _this = $(event.currentTarget)
          const eq = _this.parents('li').index()

          $('html,body').animate({
            scrollTop: ($('.section-experience-level .experience-level:eq(' + eq + ')').offset().top - 100)
          }, 10, 'swing')

          return false
        })
      }

      this.$sectionExperienceLevel.show()
    }
  },

  checkAssociatedSports () {
    const associatedSports = $(`.${this.classAssociatedSports}`)

    if (associatedSports.length > 0) {
      this.slickAssociatedSports()
      this.$sectionAssociatedSports.show()
    }
  },

  slickAssociatedSports () {
    const slickOptions = {
      autoplay: false,
      dots: true,
      arrows: false,
      slidesToShow: 6,
      slidesToScroll: 6,
      responsive: [
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4
          }
        }
      ]
    }

    APP.i.general._registerSlickIntervalBind(() => {
      this.$sectionAssociatedSports.find(`.${this.classSlickFrame}`).slick(slickOptions)
    })
  },

  checkExperiencePlaces () {
    const sectionTitle = this.$sectionExperiencePlacesSecond.find(`.${this.classSectionTitleText}`)

    if (sectionTitle.html() !== '') {
      this.$sectionExperiencePlacesSecond.show()
    }
  },

  checkPlaceholderExist () {
    if ($('.shelf--banner-pub .slick-initialized .slick-list .slick-track .slick-slide').length < 1){
      $('.shelf--banner-pub').hide()
    }
  },

  bind () {
    if(this._isMobile()){
      this.bindProductCategories()
    } 
  },

  bindProductCategories () {
    this.$productCategories.on('click', `.${this.classCategoriesLink}`, event => {
      event.preventDefault()

      const _this = $(event.currentTarget)

      _this.parent().toggleClass('active')
    })
  },

  _isMobile () {
    return $(window).width() < 991
  }
})
