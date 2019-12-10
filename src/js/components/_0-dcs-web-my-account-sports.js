APP.component.MyAccountSports = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      endpointMasterData: '/api/dataentities/ES/search?_fields=label,sport_id,universe&_sort=label ASC',

      favorites: {
        $favoriteList: $('.my-account-page--preferences-sports__my-sports ul')
      },

      all: {
        $sportsPageListContainer: $('.my-account-page--sports-list-container'),
        $sportsPageList: $('.my-account-page--sports-list-container ul.my-sports-list'),
        $sportsList: $('.my-account-page--preferences-sports__sports-list .my-account-page-list'),
        $filterInput: $('.my-account-page--preferences-sports__filter input[name="sports_search"]')
      },

      favoriteSportItemTemplate (sport) {
        return `<li class="sports-list--item" data-id="${sport.sport_id}">
                  ${sport.label}
                  <span class="my-sport-remove-trigger" data-id="${sport.sport_id}"></span>
                </li>`
      },

      favoriteSportEmptyItemTemplate () {
        return `<li class="sports-list--item empty-item">
                  Você não possúi nenhum esporte preferido.
                </li>`
      },

      sportUniverseItemTemplate (sport, slug) {
        return `<li class="sports-list--item">
                  <a href="javascript:;" class="my-account-sports-list__link" data-universe="${sport}" data-target=".my-account-page--sports-list-container" >
                    <span class="my-account-sports-list__icon"><i class="universal-icon sprite-icon-my-account__${ slug.toUpperCase() }"></i></span> ${sport}
                  </a>
                </li>`
      },

      sportItemTemplate (sport, checked) {
        checked = checked ? 'checked' : ''

        return `<li class="sports-list--item">
                  <div class="sport-choice-input">
                    <input type="checkbox" data-id="${sport.sport_id}" id="list-item-${sport.sport_id}" ${checked} value="${sport.sport_id}" />
                    <label for="list-item-${sport.sport_id}">${sport.label}</label>
                    <span class="` + (checked == 'checked' ? 'is-favorite' : 'hidden') + `">Esporte adicionado aos favoritos</span>
                  </div>
                </li>`
      }
    }, options)
    // console.log(this)

    APP.i.flash_msg = new APP.component.FlashMsg()
  },

  start () {
    this.getFromMasterData(response => {
      this.allSports = response
      this.universes = this.filterArrayUniverses(this.allSports)

      this.renderUniverses(this.universes)
      this.renderMyFavoriteSports()
    })
  },

  getFromMasterData (next) {
    const {
      endpointMasterData
    } = this.options

    $.ajax({
      url: endpointMasterData,
      type: 'GET',
      headers: {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json',
        'REST-Range': 'resources=0-99'
      }
    })
    // $.get(endpointMasterData, null, {
    //     Accept: 'application/vnd.vtex.ds.v10+json',
    //     'Content-Type': 'application/json',
    //     'REST-Range': 'resources=0-9'
    // })
    .then(response => {
      next(response)
    })
  },

  filterArrayUniverses (sports) {
    const universes =  sports.reduce((categories, current) => {
      if (categories.indexOf(current.universe) === -1) {
        categories.push(current.universe)
      }

      return categories
    }, [])

    return universes
  },

  getSportById (idSport) {
    return this.allSports.find(sport => sport.sport_id == idSport)
  },

  getSportByUniverse (universe) {
    const result = this.allSports.reduce((arr, sport) => {
      if (sport.universe == universe) {
        arr.push(sport)
      }

      return arr
    }, [])

    return result
  },

  filter (term) {
    const result = this.allSports.reduce((arr, sport) => {
      if (sport.label.toLowerCase().indexOf(term.toLowerCase()) != -1 || sport.label.toUpperCase().indexOf(term.toUpperCase()) != -1 || sport.label.indexOf(term) != -1) {
        arr.push(sport)
      }

      return arr
    }, [])

    return result
  },

  renderFilter (result) {
    const {
      $sportsList,
    } = this.options.all

    $sportsList.html('')

    result.map(filtered => {
      const isChecked = this.isFavorite(filtered.sport_id)
      const template = this.options.sportItemTemplate(filtered, isChecked)

      $sportsList.append(template)
    })
  },

  renderUniverses (universes) {
    const {
      $sportsList,
    } = this.options.all

    universes.map(universe => {
      const template = this.options.sportUniverseItemTemplate(universe, this._slugify(universe))

      $sportsList.append(template)
    })
  },

  renderSportsByUniverse (sports, title) {
    const {
      $sportsPageListContainer,
      $sportsPageList,
    } = this.options.all

    if ($sportsPageListContainer.find('.my-account-page__content').length == 0) {
      $sportsPageListContainer.append('<div class="my-account-page__content"><div class="my-account-page--sports-by-universe"><h2 class="my-account-page-title">Seus esportes em ' + title + ':</h2><div class="av-row"><div class="av-col-xs-24"></div></div> </div></div>')
    } else {
      $sportsPageListContainer.find('.my-account-page-title').text('Seus esportes em ' + title + ':')
    }

    $sportsPageList.html('')
    sports.map(sport => {
      const isChecked = this.isFavorite(sport.sport_id)
      const template = this.options.sportItemTemplate(sport, isChecked)

      $sportsPageList.append(template)
    })

    $sportsPageListContainer.find('.my-account-page--sports-by-universe .av-col-xs-24').append($sportsPageList)
  },

  renderMyFavoriteSports () {
    const {
      $favoriteList
    } = this.options.favorites

    const mySports = this.options.sports

    if (mySports.list_sports.length === 0) {
      const template = this.options.favoriteSportEmptyItemTemplate()

      $favoriteList.html(template)
      return false
    }

    // console.log('favorite SPORT:', mySports.list_sports)

    mySports.list_sports.map(mySport => {
      const sport = this.getSportById(mySport.id_sport)

      if (typeof sport === 'undefined') {
        return true
      }

      const template = this.options.favoriteSportItemTemplate(sport)

      $favoriteList.append(template)
    })
  },

  isFavorite (idSport) {
    const mySports = this.options.sports.list_sports
    const mySportToCheckIndex = mySports.map(e => e.id_sport).indexOf(parseInt(idSport))

    if (mySportToCheckIndex !== -1) {
      return true
    }

    return false
  },

  removeSport (id, next) {
    const query = JSON.stringify({
      query: `mutation {
        updateSport(
          email: "${this.options.email}",
          sport: {
            do_not_practiced_sports: false,
            list_sports: [
              {
                id_sport: ${id},
                supprime: true
              }
            ]
          }
        )
      }`
    })

    this.request(query, response => {
      next(response)
    })
  },

  saveSport (id, next) {
    const query = JSON.stringify({
      query: `mutation {
        updateSport(
          email: "${this.options.email}",
          sport: {
            do_not_practiced_sports: false,
            list_sports: [
              {
                id_sport: ${id},
                supprime: false
              }
            ]
          }
        )
      }`
    })

    this.request(query, response => {
      next(response)
    })
  },

  bind () {
    this._bindSearchFunction()
    this._bindRemoveFunction()
    this._bindAddFunction()
    this._bindOpenSportsListByUniverse()
  },

  _bindSearchFunction () {
    const {
      $sportsList,
      $filterInput
    } = this.options.all

    $('.my-account-page--preferences-sports__filter').append('<i class="my-account-page--preferences-sports__filter-icon"></i>')

    $filterInput.on('keyup', event => {
      const $this = $(event.currentTarget)
      const term = $this.val()

      if (term.length < 2) {
        $sportsList.html('')
        this.renderUniverses(this.universes)

        return false
      }

      const result = this.filter(term)

      this.renderFilter(result)
    })
  },

  _bindRemoveFunction () {
    $(document).on('click', '.my-sport-remove-trigger, .sport-choice-input input:not(:checked)', event => {
      const $this = $(event.currentTarget),
            sportId = $this.data('id'),
            mySports = this.options.sports.list_sports,
            mySportToRemoveIndex = mySports.map(e => e.id_sport).indexOf(sportId)

      $this.parent().find('.is-favorite').addClass('hidden')    
      $this.parent().find('.is-favorite').removeClass('is-favorite')

      mySports.splice(mySportToRemoveIndex, 1)

      $(`.my-sports-list .sports-list--item[data-id="${sportId}"]`).remove()

      this.removeSport(sportId, response => {
        if (response.data && response.data.updateSport == "success") {
          APP.i.flash_msg.showMsg('Esporte removido com sucesso!', 'success')
        } else {
          console.log('response >>> ', response)
          if (response.errors && response.errors.length > 0) {
            APP.i.flash_msg.showMsg('Erro ao removidor o esporte', 'error')
          }
        }
      })
    })
  },

  _bindAddFunction () {
    $(document).on('click', '.sport-choice-input input:checked', event => {
      const {
        $favoriteList
      } = this.options.favorites
      const $this = $(event.currentTarget),
            sportId = $this.val(),
            mySports = this.options.sports

      $this.parent().find('span.hidden').addClass('is-favorite')    
      $this.parent().find('span.hidden').removeClass('hidden')      

      $favoriteList.html('')
      mySports.list_sports.push({ id_sport: sportId, supprime: false })
      this.renderMyFavoriteSports()

      this.saveSport(sportId, response => {
        if (response.data && response.data.updateSport == "success") {
          APP.i.flash_msg.showMsg('Esporte adicionado com sucesso!', 'success')
        } else {

          console.log('response >>> ', response)
          if (response.errors && response.errors.length > 0) {
            APP.i.flash_msg.showMsg('Erro ao adicionar o esporte', 'error')
          }
        }
      })
    })
  },

  _bindOpenSportsListByUniverse () {
    $(document).on('click', '.my-account-sports-list__link', event => {
      const $this = $(event.currentTarget),
            universe = $this.data('universe'),
            sports = this.getSportByUniverse(universe)

      $('.my-account-page--sports-list-container .my-account-title span').html('Meus esportes preferidos')

      this.renderSportsByUniverse(sports, universe)
    })
  },

  _slugify (str) {
    str = str.replace(/^\s+|\s+$/g, '')
    str = str.toLowerCase()

    const from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;'
    const to = 'aaaaeeeeiiiioooouuuunc------'

    for (let i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
    }

    str = str.replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    return str
  },

  /*
   * @name request
   * @description Faz a requisiçao na api Graphql.
   * @param <Object> query
   * @param <Function> next
  */
  request (query, next) {
    const { endpoint } = this.options

    $('body').append('<div class="loading"></div>')
    $('.loading').fadeIn(200)

    $.post(endpoint, query).then(response => {
      if (typeof next !== 'function') {
        return false
      }

      next(response)
    })
    .fail(error => {
      throw new Error(error)
    })
    .done(() => {
      $('.loading').fadeOut(200, () => {
        $('.loading').remove()
      })
    })
  }
})
