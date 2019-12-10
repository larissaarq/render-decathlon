APP.controller.GarantiaVitalicia = ClassAvanti.extend({
  init() {
    this.setup()
    this.start()
    this.bind()
  },

  setup() {
    if (typeof APP.i.Helpers === 'undefined') {
      throw new TypeError('You need Helpers Component installed.')
    }

    this.options = {
      helpers: APP.i.Helpers,

      $scope: $('.garantia'),
      $form: $('#formBikeRegisterContact'),
      $btnSend: $('#btn-send-garantia'),

      classSuccess: 'footer-newsletter--success',
      classLoading: 'footer-newsletter--loading',
      classButtonSubmit: 'newsletter__submit',
      classError: 'error'
    }
    this.isFormValid = false
    APP.i.flash_msg = new APP.component.FlashMsg()
  },

  start() {
    const _self = this

    $('input[name="clOrderDate"]').mask('00/00/0000');
    $('input[name="clCPF"]').mask('000.000.000-00');

    var phoneMask = function (val) {
      return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
    },
      phoneMaskOptions = {
        onKeyPress: function (val, e, field, options) {
          field.mask(phoneMask.apply({}, arguments), options);
        }
      }
    $('input[name="clPhone"]').mask(phoneMask, phoneMaskOptions);

    $('.required').each(function (i, el) {

      $(this).on('blur', function () {
        _self._validateField(el);
      });
    });
  },

  bind() {
    this.bindFormSubmit();
  },

  bindFormSubmit() {
    const {
      $btnSend
    } = this.options

    const _self = this

    $btnSend.on('click', e => {
      e.preventDefault()

      _self._validateForm()

      if (this.isFormValid) {
        this.submitForm()
      } else {
        // APP.i.flash_msg.showMsg('Erro ao enviar', 'error')
      }
      return false

    })
  },

  submitForm() {
    const url = '/decathlonstore/dataentities/GV/documents'

    let clName = $("#clName").val();
    let clCPF = $("#clCPF").unmask().val();
    let clEmail = $("#clEmail").val();
    let clPhone = $("#clPhone").val();
    let clUF = $("#clUF").val();
    let clOrderDate = $("#clOrderDate").val();
    let clNF = $("#clNF").val();
    let clBikeModel = $("#clBikeModel").val();
    let clBikeFrame = $("#clBikeFrame").val();

    let data = {
      "name": clName,
      "cpf": clCPF,
      "email": clEmail,
      "phone": clPhone,
      "uf": clUF,
      "orderDate": clOrderDate,
      "nfNumber": clNF,
      "bikeModel": clBikeModel,
      "bikeFrameNumber": clBikeFrame,
      "isApproved": false
    }

    $.ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify(data),
      headers: {
        Accept: 'application/vnd.vtex.ds.v10+json',
        'Content-Type': 'application/json'
      }
    }).then((data, textStatus, xhr) => {
      if (xhr.status == "200" || xhr.status == "201") {
        APP.i.flash_msg.showMsg('Suas informações foram enviadas com sucesso. Você receberá um e-mail de confirmação!', 'success')

        this.options.$form.find('input, select').val("");
      } else if (xhr.status == "304") {
        console.log('success 304');
      } else {
        console.log('ERROR');
      }

    }, error => {
      console.log('ERROR >>> ', error);

      throw new Error(error)
    })
  },

  _validateForm() {
    const {
      $form
    } = this.options

    const _self = this
    this.isFormValid = true

    $form.find('.required').each(function (i, el) {
      _self._validateField(el);
    })
  },

  _validateField(el) {
    const {
      helpers
    } = this.options

    if ($(el).val().length < 5) {
      this.isFormValid = false;
      this.addClassError(el, 'Campo obrigatório');
    } else {
      this.removeClassError(el);

      if ($(el).attr('data-type-validate') === 'email') {
        const val_input = helpers._isValidEmailAddress($(el).val());
        if (!val_input) {
          this.isFormValid = false;
          this.addClassError(el, 'Digite um e-mail válido');
        }
      }

      if ($(el).attr('data-type-validate') === 'cpf') {
        const val_input = helpers._isValidCPF($(el).val());
        if (!val_input) {
          this.isFormValid = false;
          this.addClassError(el, 'Digite um cpf válido');
        }
      }

      if ($(el).attr('data-type-validate') === 'phone') {
        if ($(el).val().length < 14) {
          this.isFormValid = false;
          this.addClassError(el, 'Digite um telefone válido');
        }
      }

      if ($(el).attr('data-type-validate') === 'date') {
        if ($(el).val().length < 10) {
          this.isFormValid = false;
          this.addClassError(el, 'Formato de data inválido, digite dd/mm/aaaa');
        }
      }
    }
  },

  // add class error for input not valid
  addClassError(el, msg) {
    const $el = $(el)
    const $parent = $el.parent()
    let msgText = 'Campo obrigatório'
    const $labelError = $parent.find('label.error')

    $parent.addClass('line-error')
    $el.addClass('error')

    if (msg === "" || msg === undefined) {
      msgText = msgText;
    } else {
      msgText = msg;
    }

    if ($labelError.length > 0) {
      $labelError.html(msgText)
    } else {
      $parent.append(`<label class="error">` + msgText + `</label>`)
    }
    this.isFormValid = false
  },

  removeClassError(el) {
    $(el).parent().removeClass('line-error');
    $(el).removeClass('error');
  }
})
