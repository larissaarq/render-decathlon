APP.component.Helpers = ClassAvanti.extend({
  init(options) {
    this.setup(options)
  },

  setup(options) {
    this.options = $.extend({
      logeedInCookieName: 'VtexIdclientAutCookie_'
    }, options)
  },

  _isLoggedIn() {
    const { logeedInCookieName } = this.options

    return window.document.cookie.indexOf(logeedInCookieName) >= 0
  },

  _showLogin() {
    $('html, body').animate({
      scrollTop: 0
    }, 'fast')

    vtexid.start({
      returnUrl: window.document.location.href,
      userEmail: '',
      locale: 'pt-BR',
      forceReload: false
    })
  },

  _getUserId(callback) {
    $.ajax({
      url: '/no-cache/profileSystem/getProfile',
      type: 'get'
    }).then(response => {
      callback(response.UserId)
    }, error => {
      console.error('Error on get user profile.')

      throw new Error(error)
    })
  },

  _isMobile() {
    return $(window).width() <= 991
  },

  _changeImageSize(image, width, height) {
    const replace = `$1${width}$3${height}$5`

    return image.replace(/(-)(\d+)(-)(\d+)(\/)/g, replace)
  },

  _isValidEmailAddress(value) {
    const pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(value);
  },

  _isValidCPF(value) {
    const pattern = /(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/;
    return pattern.test(value);
  },

  _abreLinkPopUp(page, name, width, height) {
    const w = screen.width,
      h = screen.height

    height = (height == undefined) ? h : height,
      width = (width == undefined) ? w : width

    const left = (width == undefined) ? -50 : (w - width) / 2,
      top = (h - height) / 4,
      popup = window.open(page, name, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left)


    if (popup) {
      if (window.focus) {
        popup.focus()
      }
    }
    else {
      console.log('pop foi bloqueado tente novamente.');
    }
  },

  _getQueryParams(qs, tokens) {
    qs = qs.split("?")
    qs = qs[qs.length - 1]

    const params = {}
    const re = /[?&]?([^=]+)=([^&]*)/g
    while ((tokens = re.exec(qs))) {
      if (params[decodeURIComponent(tokens[1])]) {
        params[decodeURIComponent(tokens[1])] += "," + decodeURIComponent(tokens[2])
      } else {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2])
      }
    }
    return params
  },

  _formatMoney(number, decimals, dec_point, thousands_sep, symbol){
    if (number === undefined || !decimals || !dec_point || !thousands_sep || !symbol) return;

    number = (number + '').replace(',', '').replace(' ', '');

    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }

    return symbol + " " + s.join(dec);
  },

  _rewrite(str) {
		if (!str) return;

		return str.toLowerCase()
		.replace(/[áàãâä]/g, "a")
		.replace(/[éèẽêë]/g, "e")
		.replace(/[íìĩîï]/g, "i")
		.replace(/[óòõôö]/g, "o")
		.replace(/[úùũûü]/g, "u")
		.replace(/ç/g, "c")
		.replace(/(\ |_)+/, " ")
		.replace(/(^-+|-+$)/, "")
		.replace(/[^a-z0-9]+/g, "-");
	}
})