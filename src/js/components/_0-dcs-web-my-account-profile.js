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
    new APP.component.MyAccountProfileAddress({
      email,
      endpoint,
      addresses: profile.shipping_address,
      name: profile.identity_individual.name,
      surname: profile.identity_individual.surname
    })

    new APP.component.MyAccountProfileIdentityIndividual({
      email,
      endpoint,
      identity_individual: profile.identity_individual,
    })

    new APP.component.MyAccountProfilePassword({
      email,
      endpoint
    })

    new APP.component.MyAccountProfileContact({
      email,
      endpoint,
      contact: profile.contact
    })
  }
})
