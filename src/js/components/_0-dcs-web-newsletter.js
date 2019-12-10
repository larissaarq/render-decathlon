APP.component.Newsletter = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      $scope: $('.footer-newsletter'),
      $form: $('.newsletter__form'),

      classSuccess: 'footer-newsletter--success',
      classLoading: 'footer-newsletter--loading',
      classButtonSubmit: 'newsletter__submit',
      classError: 'newsletter__input--error',

      onSuccess () {},
      errorPlacement (error, $element) {
        console.log($element)
      }
    }, options)
  },

  start () { },

  bind () {
    this.bindSubmit()
  },

  bindSubmit () {
    this.options.$form
      .on('submit', event => {
        event.preventDefault()
      })
      .validate({
        errorClass: this.options.classError,
        submitHandler: () => {
          $(`.${this.options.classButtonSubmit}`).attr('disabled', 'disabled')

          this._submit()

          return false
        }
      })
  },

  _submit () {
    const url = this.options.$form.attr('action')
    const type = this.options.$form.attr('method')
    const data = JSON.stringify(this.options.$form.serializeObject())

    this.options.$form.addClass(this.options.classLoading)

    $.ajax({
      url,
      type,
      data,
      headers: {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json'
      }
    }).then(() => {
      this.options.$scope.toggleClass(this.options.classSuccess)
      this.options.$form.removeClass(this.options.classLoading)

      this.options.onSuccess()
    }, error => {
      this.options.$form.removeClass(this.options.classLoading)
      $(`.${this.options.classButtonSubmit}`).removeAttr('disabled')

      throw new Error(error)
    })
  }
})
