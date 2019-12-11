APP.component.PicShare = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
    this.bind()
  },

  setup () {
    this.options = {
      siteId: '1078',
      url: '//picshare.decathlon.com/js/picshare/external/getPicshare.js',
      local: 'pt_BR',
      galleryType: 'standard',
      miniGallerySize: 3
    }
  },

  start () {

  },

  getPictures (productCode) {
    const {
      siteId,
      url,
      local,
      galleryType
    } = this.options

    const urlScript = window.document.createElement('script')

    urlScript.src = `${url}#siteId=${siteId}#productCode=${productCode}#local=${local}#galleryType=${galleryType}`

    window.document.getElementsByTagName('body')[0].appendChild(urlScript)
  },

  startSlick () {
  },

  bind () {

  }
})
