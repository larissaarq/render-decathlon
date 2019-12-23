APP.controller.LpSummerProject = ClassAvanti.extend({
    init() {
        this.bind()
        this.start()
    },

    start() {
        this.release()
        this.highlightCollection();
    },

    bind() {
        this.tabs()
    },

    tabs() {
        $('.tabs a').on('click', function(e) {
            e.preventDefault();

            $('.tabs a').removeClass('active');
            $(this).addClass('active');

            if ($(this).text() == "Para Elas") {
                $('.item--masc').removeClass('active')
                $('.item--fem').addClass('active')
            } else {
                $('.item--fem').removeClass('active')
                $('.item--masc').addClass('active')
            }
        })
    },

    release() {
        if (new Date(2019, 10, 24) > new Date()) {
            $('.crush, .jungle').addClass('release')
        }
    },

    highlightCollection() {
        if (location.search.indexOf("release=true") != -1) {
            $('main').addClass('release');
        }
    }
})