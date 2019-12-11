APP.component.SearchResult = ClassAvanti.extend({
  init (options) {
    this.setup(options)
  },

  setup (options) {
    this.options = $.extend({
      $totalSearchResult: $('.resultado-busca-numero:first .value'),
      $termsSearchResult: $('.resultado-busca-termo:first .value')
    }, options)
  },

  getTotalSearchResult () {
    const {
      $totalSearchResult
    } = this.options

    return $totalSearchResult.text()
  },

  getTermsSearchResult () {
    const {
      $termsSearchResult
    } = this.options

    return $termsSearchResult.text()
  }
})
