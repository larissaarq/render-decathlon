APP.controller.LuckyNumber = ClassAvanti.extend({
  init() {
    this.setup();
    this.start();
    this.bind();
  },

  setup() {
    this.options = {
      endpoint: "https://decathlonmyaccount--decathlonstore.myvtex.com/_v/graphql/private/v1",
      idUser: "",
      numSorte: "",
      emailUser: "",
      validandoNumero: ""
    };

    APP.i.MyAccountMenu = new APP.component.MyAccountMenu();
  },

  start() {
    $("body").append('<div class="loading"></div>');
    $(".loading").fadeIn(200);
    
    this.removeBoostrap();
    
    $(window).on("load", (e) => {
      setTimeout(() => {
        this.getProfile(profile => {
          const email = profile.Email;
    
          this.getUser(email, response => {
            this.user = response.data.userDecathlon;
    
            if (this.user === null) {
              return false;
            }
    
            APP.i.MyAccountMenu.setUserNumber(
              this.user.identity_individual.national_id
            );
            APP.i.MyAccountMenu.setUserName(
              this.user.identity_individual.name,
              this.user.identity_individual.surname
            );
          });
        });
      }, 500);
    })
  },

  bind() {
    this.bindMenuFunctions();
  },

  removeBoostrap() {
    $('link[href$="bootstrap.min.css"]').remove();
    $('link[href$="bootstrap-responsive.min.css"]').remove();
  },

  bindMenuFunctions() {
    $(document).off(
      "click",
      'a.my-account-menu__link:not([href="/account/orders"]):not([href="/no-cache/user/logout"]):not(.my-account-menu__link--sub), a.my-account-submenu__link, .my-account-sports-list__link, .my-account-stores-list__link, .my-store__button--list-stores, .my-account__home-link--profile'
    );
  },

  getProfile(next) {
    $.get("/no-cache/profileSystem/getProfile")
      .then(response => {
        if (typeof next !== "function") {
          return false;
        }

        next(response);
      })
      .fail(error => {
        throw new Error(error);
      });
  },

  request(query, next) {
    const { endpoint } = this.options;

    $.post(endpoint, query)
      .then(response => {
        if (typeof next !== "function") {
          return false;
        }

        next(response);
      })
      .fail(error => {
        throw new Error(error);
      })
      .done(() => {
        $(".loading").fadeOut(200);
        $(".loading").remove();
      });
  },

  getUser(email, next) {
    let _this = this;
    const query = JSON.stringify({
      query: `query {
        userDecathlon(email: "${email}") {
          contact {
            email
          }

          identity_individual {
            name
            surname
            national_id
          }
        }
      }`
    });

    this.request(query, response => {
      next(response);
      if(response.data.userDecathlon) {
        _this.idUser = response.data.userDecathlon.identity_individual.national_id;
        _this.emailUser = response.data.userDecathlon.contact.email;
        _this.initPromo();
      } else {
        location.href = "/_secure/minha-conta/#perfil"
      }
    });
  },

  initPromo() {
    let _this = this;

    $.ajax({
      url: `/api/dataentities/lnc/search?_schema=christmas&cpf=*${_this.idUser}*&_field=cpf,status,luckynumber`,
      type: "GET",
      headers: {
        "Accept": "application/vnd.vtex.ds.v10+json",
        "Content-Type": "application/json" 
      },
      success: response => {
        let cpf, status;
        if(_this.idUser != null) {
          if (response.length) {
            $('.my-account-menu__link--highlight').removeClass('hide')
            cpf = response[0].cpf;
            status = response[0].status;
            if (cpf == _this.idUser && status == false) {
              _this.numSorte = response[0].luckynumber;
              _this.seuNumerodaSorte();
            } else {
              location.href = "/minha-conta";
              //_this.queroParticipar();
            }
          } else {
            location.href = "/minha-conta";
            //_this.queroParticipar();
          }
        } else {
          _this.cadastroIncompleto();
        }
      }
    });
  },

  // queroParticipar() {
  //   const _this = this;
  //   const cookie = Cookies.get('lnc');

  //   let html = `
  //     <section id="promocao-numero-sorte">
        
  //       ${cookie == undefined ? `
  //       <div class="form-quero-participar">
  //         <input type="checkbox" id="aceite-termos" name="aceite-termos" checked>
  //         <label for="aceite-termos">Aceito o <a href="https://www.decathlon.com.br/api/dataentities/PR/documents/e85f6391-108b-11ea-82ee-0a8fdb4427ff/regulamento/attachments/Decathlon%20Sorteio%20de%20Natal%202019%20-%20Regulamento.pdf" target="_blank" class="gaClick" data-event-category="Sorteio de Natal 2019 - Minha Conta" data-event-action="Click Text" data-event-label="Regulamento do sorteio">regulamento do sorteio</a> de Natal Decathlon.</label>
  //       </div>

  //       <button id="quero-participar"  class="button button--small button--blue gaClick" target="_blank" data-event-category="Sorteio de Natal 2019 - Minha Conta" data-event-action="Click CTA" data-event-label="Quero Participar">Quero Participar</button>` 
  //       :
  //       `<h2>Ainda estamos gerando seu número, tente novamente em instantes...</h2>`}
        
  //       <p>
  //         <small>Os resultados serão divulgados no dia 10/12/2019 na <a href="/sorteio-de-natal">página do sorteio</a>.</small>
  //       </p>
  //     </section>
  //   `;

  //   $(".lucky-number-decathlon .sorteio-natal")
  //     .empty()
  //     .append(html);

  //   $("#aceite-termos").click(function() {
  //     if ($(this).is(":checked") && cookie == undefined) {
  //       $("#quero-participar").removeAttr("disabled");
  //     } else {
  //       $("#quero-participar").attr("disabled", true);
  //     }
  //   });

  //   $("#quero-participar.button:not(disabled)").click(function() {
  //     Cookies.set('lnc', 'ok')
  //     _this.gerandoNumeroSorte();
  //   });
  // },
  

  cadastroIncompleto() {
    let html = `
      <section id="promocao-numero-sorte">
        <p>O seu cadastro está incompleto, para participar da promoção, acesse a sua conta e complete o seu cadastro!</p>
        <a href="/_secure/minha-conta/#perfil" id="meu-perfil" class="button button--small button--blue">Completar o seu cadastro</a>
      </section>
    `;

    $(".lucky-number-decathlon .sorteio-natal")
      .empty()
      .append(html);
  },

  seuNumerodaSorte() {
    const _this = this;
    let html = `
      <section id="promocao-numero-sorte">
        <h2>Meu número da sorte: <span>${_this.numSorte}</span></h2>
        <p>
          <small>Os resultados serão divulgados no dia 10/12/2019 na <a href="/sorteio-de-natal">página do sorteio</a>.</small>
        </p>
      </section>
    `;

    $(".lucky-number-decathlon .sorteio-natal").empty().append(html);
  },
  // gerandoNumeroSorte() {
  //   const _this = this;
  //   let html = `
  //     <section id="promocao-numero-sorte">
  //       <h2>Estamos gerando seu número...</h2>
  //       <p>
  //         <small>Os resultados serão divulgados no dia 10/12/2019 na <a href="/sorteio-de-natal">página do sorteio</a>.</small>
  //       </p>
  //     </section>
  //   `;

  //   $(".lucky-number-decathlon .sorteio-natal").empty().append(html);

  //   //$("body").append('<div class="loading"></div>');

  //   _this.cpfLuckyNumber();
  // },

  // postUser() {
  //   const _this = this;

  //   let arr = {
  //     luckynumber: _this.numSorte,
  //     email: _this.emailUser
  //   };

  //   if (_this.numSorte && _this.emailUser) {
  //     $.ajax({
  //       url: `https://decathlonstore.myvtex.com/_v/client/register`,
  //       type: "POST",
  //       data: JSON.stringify(arr),
  //       success: i => {
  //         //$(".loading").remove();
  //         setTimeout(() => {
  //           _this.seuNumerodaSorte();
  //         }, 3000);
  //       },
  //       error: response => {
  //         //$(".loading").remove();
  //         if(response.status == 500) {
  //           APP.i.flash_msg = new APP.component.FlashMsg();
  //           APP.i.flash_msg.showMsg("Ocorreu um erro nos nossos servidores, por favor tente novamente mais tarde.","error");
  //         }
  //       }
  //     });
  //   }
  // },

  // shuffle(array) {
  //   var currentIndex = array.length,
  //     temporaryValue,
  //     randomIndex;

  //   // While there remain elements to shuffle...
  //   while (0 !== currentIndex) {
  //     // Pick a remaining element...
  //     randomIndex = Math.floor(Math.random() * currentIndex);
  //     currentIndex -= 1;

  //     // And swap it with the current element.
  //     temporaryValue = array[currentIndex];
  //     array[currentIndex] = array[randomIndex];
  //     array[randomIndex] = temporaryValue;
  //   }

  //   return array;
  // },

  // cpfLuckyNumber() {
  //   const _this = this;
  //   let i, serial, serialRandom;

  //   serial = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  //   serialRandom = serial[Math.floor(Math.random() * serial.length)];

  //   i = _this.idUser.split("");
  //   i = _this.shuffle(i);

  //   _this.validandoNumero = `${serialRandom}/${i[0]}${i[1]}.${i[2]}${i[3]}${i[4]}`;

  //   _this.verificationLuckyNumber();
  // },

  // verificationLuckyNumber() {
  //   const _this = this;

  //   $.ajax({
  //     url: `/api/dataentities/lnc/search?_schema=christmas&luckynumber=*${_this.validandoNumero}*&_field=luckynumber`,
  //     type: "GET",
  //     headers: {
  //       "Accept": "application/vnd.vtex.ds.v10+json",
  //       "Content-Type": "application/json",
  //     },
  //     success: response => {
  //       if (response.length > 0) {
  //         if (response[0].luckynumber == _this.validandoNumero) {
  //           _this.cpfLuckyNumberReturn();
  //         }
  //       } else {
  //         _this.numSorte = _this.validandoNumero;
  //         _this.postUser();
  //       }
  //     }
  //   });
  // },

  // cpfLuckyNumberReturn() {
  //   const _this = this;
  //   let i, serial, serialRandom;

  //   serial = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  //   serialRandom = serial[Math.floor(Math.random() * serial.length)];

  //   i = _this.idUser.toUpperCase().replace(/[^a-z0-9]+/g, "").split("");
  //   i = _this.shuffle(i);

  //   _this.validandoNumero = `${serialRandom}/${i[0]}${i[1]}.${i[2]}${i[3]}${i[4]}`;

  //   _this.verificationLuckyNumber();
  // }
});
