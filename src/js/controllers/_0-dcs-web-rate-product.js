APP.controller.RateProduct = ClassAvanti.extend({
    init() {
        this.setup()
        this.start()
        this.bind()
    },

    setup() {
        if (typeof APP.i.Helpers === 'undefined') {
            throw new TypeError('You need Helpers Component installed.')
        }
    },

    start() {
        let params = APP.i.Helpers._getQueryParams(window.location.search);

        if (params.code !== undefined && params.code !== "") {
            $('#iframe-review-product').html('<div id="ovPostReview" width="100%" frameborder="0" scrolling="no"><iframe id="openvoice-iframe" scrolling="no" frameborder="0" src="https://reviews.decathlon.com/pt_BR/review/new/964/1/' + params.code + '#step1" width="100%" height="1600px">SEU NAVEGADOR NÃO SUPORTA IFRAMES</iframe></div>');
            $('#openvoice-iframe').find('#container-header').remove();
        } else {
            window.location.href = 'https://www.decathlon.com.br';
        }
    },

    bind() {}

})
