APP.controller.CheckPoint = ClassAvanti.extend({
    init() {
        this.setup()
        this.start()
        this.bind()
    },

    setup() {
        this.options = {
            $eanCode: $("#encoder"),
            eanLimit: $("#encoder").attr("maxlength")
        }
    },

    start() {
        const _self = this;
        let $eanCode = this.options.$eanCode

        this.slickPhrases()

        $eanCode.focus();

        $('.numeric').on('input', function (event) {

            this.value = this.value.replace(/[^0-9]/g, '');
        });

        $eanCode.keydown(function (evt) {
            const val = $(evt.currentTarget).val();

            if (_self._isNumber(val) && val.length === 13 && evt.keyCode === 13) {
                _self.getProduct(val);
                $(evt.currentTarget).val("");

            } else if (_self._isNumber(val) && val.length === 30 && evt.keyCode === 13) {
                let eanFormated = val.substr(3, 13);
                _self.getProduct(eanFormated);
                $(evt.currentTarget).val("");
            }
            //console.log(evt);
        });
    },

    slickPhrases: function () {
        const slickOptions = {
            infinite: true,
            autoplay: true,
            dots: false,
            arrows: false,
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: true,
            cssEase: 'linear'
        }

        $('.slick-frame').slick(slickOptions);

        const intervalSlick = setTimeout(() => {
            if ($('.slick-frame.slick-initialized')) {
              clearInterval(intervalSlick)
              $('.slick-frame').addClass('slick-started')
            }
          }, 100)
    },

    getProduct: function (code) {
        console.log('getProduct >>>> ', code);
        var _self = this;
        //var code = '3583789259182';

        $.ajax({
            url: "https://wwv05y40s3.execute-api.sa-east-1.amazonaws.com/prod/decathlonpro/api/catalog_system/pvt/sku/stockkeepingunitbyean/" +
                code,
            type: "GET",
            success: function (data) {
                var url = data.DetailUrl
                if (url !== undefined) {

                    console.log(_self.verifyStoreLocation(window.location.search));
                    if (_self.verifyStoreLocation(window.location.search)) {
                        const storeLocation = _self.getStoreLocation(window.location.search)
                        window.location.href = `https://www.decathlon.com.br${url}?lid=88f884b8-e01d-4588-a516-779c3099bdf3&store_location=${storeLocation}`;
                    }
                } else {
                    alert("Produto indisponivel");
                }

            },
            error: function () {
                console.log("error");
            }
        })

    },

    _isNumber: function (value) {
        var pattern = /^\d+$/;
        return pattern.test(value);
    },

    verifyStoreLocation: (search) => {
        if (search.indexOf('?store_location') === 0) {
            return true;
        } else {
            return false;
        }
    },

    getStoreLocation: (search) => {
        return search.substr(1).split("=")[1]
    },
    bind: function () {
        var $eanCode = this.options.$eanCode
        $eanCode.focusout(function () {
            $eanCode.focus()
        })
    }
})
