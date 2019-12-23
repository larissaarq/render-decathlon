APP.controller.StoreDetail = ClassAvanti.extend({
  init() {
    this.setup();
    this.start();
    this.bind();
  },

  setup() {
    this.header = {
      Accept: "application/json",
      "REST-range": "resources=0-5000",
      "Content-Type": "application/json; charset=utf-8"
    };
    this.$slugPage = $("meta[name=slug-page]").attr("content");

    if (this.$slugPage !== undefined) {
      APP.i.BlogEventsEntries.getEntries("", "lojas/" + this.$slugPage, "");
    } else {
      $(".section-sportive-events").hide();
    }

    if (
      $(".store-detail__parceiros .store-detail__parceiros--item").length > 0
    ) {
      $(".store-detail__parceiros").slideDown();
    } else {
      $(".store-detail__parceiros").slideUp();
    }
  },

  getStore() {
    const _self = this;
    let url = window.location.pathname;

    $.ajax({
      // url:
      //   '/decathlonstore/dataentities/SL/search?_where=(pageLink="' +
      //   url +
      //   '")&_fields=address,name,openingHours,services_ids,embed_link,address_complement,phone,googleLink,specialHolidaySchedule,specialMonth',
      url:
        '/decathlonstore/dataentities/SL/search?_where=(pageLink="' +
        url +
        '")&_fields=address,name,services_ids,embed_link,address_complement,phone,specialMonth,googleLink',
      type: "GET",
      headers: this.header,

      success: function(resp) {
        let dataStores = resp;

        _self.includeInfoStores(dataStores);
        _self.urlVerification(dataStores);
        _self.scheduleCheckSpecials(dataStores);

        let urlVerification = _self.urlVerification(dataStores);
        _self.getServices(urlVerification);
      },
      error: function(e) {
        console.log(e);
      }
    });
  },

  getServices(urlVerification) {
    const _self = this;

    $.ajax({
      url:
        "/decathlonstore/dataentities/SS/search?_fields=description,image,title," +
        urlVerification +
        "",
      type: "GET",
      headers: _self.header,
      success: function(resp2) {
        let dataServices = resp2;

        if (_self.dataServices !== null) {
          _self.includeInfoServices(dataServices);
        }
      },
      error: function(e) {
        console.log(e);
      }
    });
  },

  urlVerification(stores) {
    let servicesMd = stores[0].services_ids;
    let whereUrl = "";

    if (servicesMd.indexOf(";") > -1) {
      let servicesSplit = "";
      servicesSplit = servicesMd.split(";");

      let i = 0;
      servicesSplit.forEach(function(e) {
        if (i == 0) {
          whereUrl += "&_where=id_service=" + e + "";
        } else {
          whereUrl += " OR id_service=" + e + "";
        }
        i++;
      });
    } else {
      whereUrl = "&_where=id_service=" + servicesMd + "";
    }
    return whereUrl;
  },

  formatStorePhone(stores) {
    for (const store of stores) {
      if (store.phone !== null) {
        let phone = store.phone;
        phone =
          phone.length === 10
            ? phone.match(/(\d{2})(\d{4})(\d{4})/)
            : phone.match(/(\d{2})(\d{5})(\d*)/);
        store.phoneFormated = `(${phone[1]}) ${phone[2]}-${phone[3]}`;
      }
    }

    return stores;
  },

  formatStoreOpeningHours(stores) {
    for (const store of stores) {
      var infoOpeningHours = store.openingHours;

      store.formatOpeningHours = infoOpeningHours.replace(";", "<br />");
    }
  },

  includeInfoStores(stores) {
    const _self = this;

    stores.forEach(function(c) {
      _self.formatStorePhone(stores);
      // _self.formatStoreOpeningHours(stores);

      $("#name-store strong").text(c.name !== null ? c.name : "");
      $("#address-store").text(c.address !== null ? c.address : "");
      $("#addressComplement-store").text(
        c.address_complement !== null ? c.address_complement : ""
      );
      //$('#openingHours').html((c.formatOpeningHours !== null) ? c.formatOpeningHours : '')
      //$('#specialHolidaySchedule').html((c.specialHolidaySchedule !== null) ? c.specialHolidaySchedule : '')
      $("#telephone-number").text(c.phone !== null ? c.phoneFormated : "");
      if (_self._isMobile()) {
        $(".store-detail__info-hour").prepend(
          '<a href="' +
            c.googleLink +
            '" class="button button--small button--mobile-clean" tabindex="0">IR PARA A LOJA</a>'
        );
      } else {
        $("#info-maps").html(
          c.embed_link !== null
            ? '<iframe src="' +
                c.embed_link +
                '" frameborder="0" allowfullscreen="""></iframe>'
            : ""
        );
      }
    });
  },

  includeInfoServices(services) {
    let html = "";
    services.forEach(function(e) {
      html += `<div class="store-detail__services-list--item">
                <span class="store-detail__services-list--item-img">
                  <img src="${e.image}" alt="${e.title}" />
                </span>
                <div class="store-detail__services-list--item-wrap">
                  <span class="store-detail__services-list--item-title">${
                    e.title !== null ? e.title : ""
                  }</span>
                  <span class="store-detail__services-list--item-desc">${
                    e.description !== null ? e.description : ""
                  }</span>
                </div>
              </div>`;
    });

    $(".store-detail__services-list").html(html);
  },

  scheduleCheckSpecials(info) {
    const _this = this;
    const newDays = JSON.parse(info[0].specialMonth);
    let calendar = `<div class="info">
    <h4>Escolha um dia e saiba os nossos horários.</h4>
  </div>
  <div class="calendar-christmas">
  <div class="calendar-uni">
      <h3>Dezembro 2019</h3>
      <table>
          <thead>
              <tr>
                  <th class="empty">Dom</th>
                  <th class="empty">Seg</th>
                  <th class="empty">Ter</th>
                  <th class="empty">Qua</th>
                  <th class="empty">Qui</th>
                  <th class="empty">Sex</th>
                  <th class="empty">Sáb</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td id="1-Dezembro">1</td>
                  <td id="2-Dezembro">2</td>
                  <td id="3-Dezembro">3</td>
                  <td id="4-Dezembro">4</td>
                  <td id="5-Dezembro">5</td>
                  <td id="6-Dezembro">6</td>
                  <td id="7-Dezembro">7</td>
              </tr>
              <tr>
                  <td id="8-Dezembro">8</td>
                  <td id="9-Dezembro">9</td>
                  <td id="10-Dezembro">10</td>
                  <td id="11-Dezembro">11</td>
                  <td id="12-Dezembro">12</td>
                  <td id="13-Dezembro">13</td>
                  <td id="14-Dezembro">14</td>
              </tr>
              <tr>
                  <td id="15-Dezembro">15</td>
                  <td id="16-Dezembro">16</td>
                  <td id="17-Dezembro">17</td>
                  <td id="18-Dezembro">18</td>
                  <td id="19-Dezembro">19</td>
                  <td id="20-Dezembro">20</td>
                  <td id="21-Dezembro">21</td>
              </tr>
              <tr>
                  <td id="22-Dezembro">22</td>
                  <td id="23-Dezembro">23</td>
                  <td id="24-Dezembro">24</td>
                  <td id="25-Dezembro">25</td>
                  <td id="26-Dezembro">23</td>
                  <td id="27-Dezembro">27</td>
                  <td id="28-Dezembro">28</td>
              </tr>
              <tr>
                  <td id="29-Dezembro">29</td>
                  <td id="30-Dezembro">30</td>
                  <td id="31-Dezembro">31</td>
                  <td class="empty"> </td>
                  <td class="empty"> </td>
                  <td class="empty"> </td>
                  <td class="empty"> </td>
              </tr>
          </tbody>
      </table>
  </div>
  <div class="calendar-uni">
      <h3>Janeiro 2020</h3>
      <table>
          <thead>
              <tr>
                  <th class="empty">Dom</th>
                  <th class="empty">Seg</th>
                  <th class="empty">Ter</th>
                  <th class="empty">Qua</th>
                  <th class="empty">Qui</th>
                  <th class="empty">Sex</th>
                  <th class="empty">Sáb</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td class="empty"> </td>
                  <td class="empty"> </td>
                  <td class="empty"> </td>
                  <td id="1-Janeiro">1</td>
                  <td id="2-Janeiro">2</td>
                  <td class="empty"> </td>
                  <td class="empty"> </td>
              </tr>
          </tbody>
      </table>
  </div>
</div>`;

    $(".store-detail__info-hour").append(calendar);

    $(".calendar-christmas .calendar-uni td").click(function() {
      let idClicked = $(this)
          .attr("id")
          .split("-"),
        day;

      if (idClicked[1] == "Janeiro") {
        day = 31 + parseInt(idClicked[0]);
      } else {
        day = idClicked[0];
      }

      let htmlHorario = `Dia ${idClicked[0]} de ${idClicked[1]} | ${newDays[day].horario}`;
      $("#openingHours")
        .empty()
        .html(htmlHorario)
        .addClass("active");
    });
  },

  _isMobile() {
    return $(window).width() <= 991;
  },

  start() {
    this.getStore();
  },

  bind() {}
});
