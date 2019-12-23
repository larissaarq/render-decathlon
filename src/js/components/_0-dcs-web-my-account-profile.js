APP.component.MyAccountProfile = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
  },

  setup (options) {
    this.options = $.extend({}, options)
  },

  start () {
    const { endpoint, profile } = this.options
    const { email } = profile.contact

    APP.i.MyAccountProfileAddress = new APP.component.MyAccountProfileAddress({
      email,
      endpoint,
      addresses: profile.shipping_address,
      name: profile.identity_individual.name,
      surname: profile.identity_individual.surname
    })

    APP.i.MyAccountProfileAddress = new APP.component.MyAccountProfileIdentityIndividual({
      email,
      endpoint,
      identity_individual: profile.identity_individual,
    })

    APP.i.MyAccountProfileAddress = new APP.component.MyAccountProfilePassword({
      email,
      endpoint
    })

    APP.i.MyAccountProfileAddress = new APP.component.MyAccountProfileContact({
      email,
      endpoint,
      contact: profile.contact
    })
  }
})
