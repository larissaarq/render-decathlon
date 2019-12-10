APP.controller.UrmStore = ClassAvanti.extend({
  init() {
    this.setup();
    this.start();
  },

  setup() {},

  start() {
    this.successRegister();
  },

  successRegister(){
    this.tokenUser = null
    var url = window.location.href
    console.log('url: ', url);
    var hash_parts = window.location.hash.split('&', 2);
    console.log('hash_parts: ', hash_parts);

    if(url.indexOf("sucesso") > -1){
      if(hash_parts !== ""){
        for (i in hash_parts) {
          if(hash_parts[i].indexOf('access_token') !== 0){
            this.tokenUser = hash_parts[i].replace('#access_token=', '')
            var token = this.tokenUser

            setTimeout(function () {
              window.location.href = "https://api-eu.decathlon.net/connect/openid/logout?id_token_hint="+token+"&post_logout_redirect_uri=https://www.decathlon.com.br/dkt-urm-store&state=true";
            }, 1000);
            return true
          }
        }
      }
    }
  }

});
