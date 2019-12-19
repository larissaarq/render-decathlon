APP.component.Modal = ClassAvanti.extend({
  init () {
    this.setup()
    this.bind()
  },

  setup () {
    this.options = {
      $body: $('body'),
      $scope: $('.av-modal'),

      bodyClass: 'scroll-lock',
      scopeClass: '.av-modal',
      openClass: '.av-modal-open',
      closeClass: 'av-modal.close-modal',
      closeBtnClass: '.av-modal-close, .btn-modal-close'
    }
  },

  openModal (target) {
    const {
      $body,
      bodyClass
    } = this.options

    target.show()
    $body.addClass(bodyClass)
  },

  closeModal () {
    const {
      $body,
      $scope,
      bodyClass
    } = this.options

    $scope.hide()
    $body.removeClass(bodyClass)
  },

  bind () {
    const {
      $body,
      $scope,
      openClass,
      closeBtnClass,
      closeClass
    } = this.options

    $body.on('click', openClass, e => {
      e.preventDefault()
      const _this = $(e.currentTarget)

      this.openModal($('.' + _this.data('target')))
    })

    $body.on('click', closeBtnClass, e => {
      e.preventDefault()
      const _this = $(e.currentTarget)

      const $avModal = _this.parents($scope)

      $avModal.trigger(closeClass, $avModal)

      this.closeModal()
    })

    const $scopeModal = $('.av-modal__modal')

    $(document).on('click', e => {
      if ($scope.is(e.target) && $scope.has(e.target).length === 0) {
        this.closeModal()
      }
    })
  }
})
