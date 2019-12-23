APP.controller.ListEmpty = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {},

  start () {
    this.getSearchTerm()
  },

  getSearchTerm () {
    const queryString = window.location.search.substr(1)
    const params = queryString.split('&')

    const term = params.reduce((current, item) => {
      const [key, value] = item.split('=')
      let string = ''
      if (key === 'ft') {
        string = value
      }

      return current.concat(string)
    }, '')

    $('.empty-search__terms').text(decodeURIComponent(term))
  },

  bind () {

  }
});