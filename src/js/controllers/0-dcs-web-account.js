import '../../sass/pages/_0-dcs-web-account.scss'
import '../components/_0-dcs-web-get-masterdata-register'
import '../components/_0-dcs-web-validate-password'
import '../components/_0-dcs-web-forgot-password'
import '../components/_0-dcs-web-reset-password'
import '../components/_0-dcs-web-account-data'

jQuery.validator.addMethod('cep', function (value, element) {
  return this.optional(element) || /^[0-9]{5}-[0-9]{3}$/.test(value);
}, 'Por favor, forneça um CEP válido.')

jQuery.validator.addMethod('birthdate', function (value, element) {
  return this.optional(element) || /^(\d{2})\/(\d{2})\/(\d{4})$/.test(value);
}, 'Por favor, forneça uma data de nascimento válida.')

jQuery.validator.addMethod('cellphone', function (value, element) {
  return this.optional(element) || /^\((\d{2})\)\s(?:\d\s)?(\d{4})-(\d{4})$/.test(value);
}, 'Por favor, forneça um celular válido.')

APP.controller.Account = ClassAvanti.extend({
  init() {
    this.setup()
    this.start()
    this.bind()
  },

  setup() {
    this.options = {
      $profileModal: $('.av-modal--profile .av-modal__content'),
      $profileContent: $('#editar-perfil-conteudo, #editar-perfil #response-message'),

      $addressEditModal: $('.av-modal--edit-address .av-modal__content'),
      $addressEditContent: $('#form-address'),

      $addressRemoveModal: $('.av-modal--remove-address .av-modal__content'),
      $addressRemoveContent: $('#address-remove #exclude'),

      $addressEditAttributes: $('.edit-address-link .address-update, .account-address .account-btn'),
      $addressRemoveAttributes: $('.account__content .delete')
    }

    APP.i.GetMasterDataRegister = new APP.component.GetMasterDataRegister()
    APP.i.ValidatePassword = new APP.component.ValidatePassword()
    APP.i.ForgotPassword = new APP.component.ForgotPassword()
    APP.i.ResetPassword = new APP.component.ResetPassword()
    APP.i.AccountData = new APP.component.AccountData()
  },

  start() {
    this.cloneForms()
    this.changeAttributes()
    this.setTabIndex()
  },

  cloneForms() {
    this._cloneForm('$profileModal', '$profileContent')
    this._cloneForm('$addressEditModal', '$addressEditContent')
    this._cloneForm('$addressRemoveModal', '$addressRemoveContent')
  },

  _cloneForm(modal, content) {
    const {
      [modal]: $modal,
      [content]: $content
    } = this.options

    $modal.html($content)
  },

  changeAttributes() {
    this.setEditAttributes()
    this.setRemoveAttributes()
  },

  setEditAttributes() {
    const {
      $addressEditAttributes
    } = this.options

    $addressEditAttributes.each((index, element) =>
      this._attributeFn(element, 'av-modal--edit-address'))
  },

  setRemoveAttributes() {
    const {
      $addressRemoveAttributes
    } = this.options

    $addressRemoveAttributes.each((index, element) =>
      this._attributeFn(element, 'av-modal--remove-address'))
  },

  _attributeFn(element, target) {
    const _this = $(element)

    _this
      .addClass('av-modal-open')
      .attr('data-target', target)
  },

  _isMobile() {
    return $(window).width() < 992
  },

  setTabIndex() {
    $('a').attr('tabindex', '-1')
    $('.footer-barra-beneficios .slick-slide a').attr('tabindex', '-1')
    $('.footer-countries__content .bootstrap-select .dropdown-toggle').attr('tabindex', '-1')

    let arrInputs = null

    if (!this._isMobile()) {
      arrInputs = [
        '#email', '#masculino', '#feminino', '#name', '#national_id', '#birthdate', '#surname', '#mobile', '#name2', '#title',
        '#postal_code', '#street_name', '#street_number', '#line2', '#district', '#city', '.input-province button', '#additionnal_data',
        '.register-sports-add', '#sports-none', '.register-stores-add', '#stores-none', '#password', '#agree-news', '#degree-news',
        '.register-back-btn', '.register-create-btn'
      ]
    } else {
      arrInputs = [
        '#email', '#masculino', '#feminino', '#name', '#surname', '#name2', '#national_id', '#birthdate', '#mobile', '#title',
        '#postal_code', '#street_name', '#street_number', '#line2', '#district', '#city', '.input-province button', '#additionnal_data',
        '.register-sports-add', '#sports-none', '.register-stores-add', '#stores-none', '#password', '#agree-news', '#degree-news',
        '.register-back-btn', '.register-create-btn'
      ]
    }

    for (let i = 0; i < arrInputs.length; i++) {
      $(arrInputs[i]).attr('tabindex', i + 1)
    }

    $('#email').focus()
  },

  bind() {
    this.bindClose()
    this.bindSelectPicker()
  },

  bindClose() {
    $('.av-modal .modal-footer button').on('click', event => {
      event.preventDefault()

      const _this = $(event.currentTarget)
      const $close = _this.parents('.av-modal').find('.av-modal-close')

      $close.trigger('click')
    })
  },

  bindSelectPicker() {
    $('body.register, body.edit-register').find('.select-uf').selectpicker({
      noneSelectedText: 'UF'
    })
    $('.input-province button').attr('tabindex', 17)
  }
})
