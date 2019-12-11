APP.controller.LpBuyTogether = ClassAvanti.extend({
	init(options) {
		this.setup(options)
		this.start();
		//this.bind();
	},

	setup(options) {
		this.options = $.extend({
			helpers: APP.i.Helpers,
			bestSkuPrice: [],
			skuSelecteds: [],
			target ($scope, content) {
				$scope.html(content)
			}
		}, options)
	},

	start() {
		let _self = this;

		_self.getProduct(location.search.split("id=").join("fq=productId:"), products => {
			products.forEach(product => {
				_self.getSkus(product)
			});
		});
	},

	bind(id, skus) {
		let _self = this;
		
		$('body').on("click", "#" + id + " .shelf-colors__image", function(e){
			e.preventDefault();

			if($(this).attr('src') != $(this).parents('.product').find('.product__image img').attr('src') || $(this).parents('.product').find(".shelf-colors__item.selected").length <= 0){
			  $(this).parents('.product').find('.shelf-colors__item').removeClass('selected');
			  $(this).parents('.shelf-colors__item').addClass('selected');
			  $(this).parents('.product').find('.product__image img').attr('src', $(this).attr('src'))
			};

			console.log(id, skus);

			let sizes = skus.filter(item => {
				return item.Cor[0] == $(this).parents('.shelf-colors__item').attr('id');
			});

			if(sizes.length){
				_self.mountSizesOptions(id, sizes, true);
			}
		});

		$('.totals__add-to-cart a').on('click', function(e){
			e.preventDefault();
			_self.selectedSkus(skus);
		});

		$('.shelf-colors__link').on('click', function(e){
			e.preventDefault();
			$(this).parents('.product__variations-color').removeClass('error')
		})

		$('.product__variations-size select').on('change', function(e){
			e.preventDefault();
			$('.label--error').fadeOut().remove();
			$(this).parents('.product__variations-size').removeClass('error')
		})

		$('#' + id + ' .shelf-colors__image').each(function(){;
			if($(this).parents('.shelf-colors__item').attr('id') == $(this).parents('.product__variations').find('.product__variations-color').attr('data-sku')){
				$(this).parents('.shelf-colors__item').addClass('selected');

				let sizes = skus.filter(item => {
					return item.Cor[0] == $(this).parents('.product__variations').find('.product__variations-color').attr('data-sku')
				});

				_self.mountSizesOptions(id, sizes, false);
			}
		})
	},

  	getProduct(id, callback) {
		$.ajax({
		url: '/api/catalog_system/pub/products/search/' + id,
		type: 'GET',
		dataType: 'json',
			success: function (response) {
				callback(response)
			}
		});
	},
	  
	getSkus(product){
		let _self = this;

		let skusFiltered = [];
		
		window.productsBuyTogether.forEach(items => {
			items.products.forEach(item => {
				if(item.id == product.productId){
					if(($('.section__images-slider img') && $('.section__intro h2')).length < 1){
						$('.section__images-slider').html('<img src="/arquivos/' + items.image + '" alt="' + items.name + '">');
						$('.section__intro').html('<h2>Conjunto ideal <span>para ' + items.name + ':</span></h2>');
					}

					item.skus.forEach(sku => {
						product.items.forEach( skus => {
							if(skus.itemId == sku){
								skusFiltered.push(skus)
							}
						})
					})
				}
			})
		});
		
		_self.sortByPrice(product, skusFiltered);
	},

	sortByPrice(product, skus){
		let _self = this;

		const { helpers, bestSkuPrice } = this.options

		let bestItemByPrice = skus.sort(function(a, b){ return a.sellers[0].commertialOffer.Price - b.sellers[0].commertialOffer.Price; })[skus.length - 1];

		let installments = [];
		
		bestItemByPrice.sellers[0].commertialOffer.Installments.forEach(function(option){ 
			if(option.NumberOfInstallments.length > 1){
				installments = installments.concat(option.filter(function(a, b){ return !a.InterestRate }));
			}
		});
		
		bestSkuPrice.push(bestItemByPrice.itemId);
		
		let bestInstallment = installments.sort(function(a, b){ return a.count - b.count; })[installments.length - 1];
	
		$('.section__products-inner').append(`
			<div class="product" id="${bestItemByPrice.itemId}">
				<div class="product__image">
					<img src="${bestItemByPrice.images[0].imageUrl}" title="${product.productName}" alt="${product.productName}" />
				</div>
				<div class="product__info">
					<h3 class="product__info-name">${product.productName}</h3>
					<div class="product__info-price">
					<h4 class="product__info-price__list">${helpers._formatMoney(bestItemByPrice.sellers[0].commertialOffer.Price, 2, ',', '.', 'R$')}</h4>
					${bestInstallment != undefined ? `<h4 class="product__info-price__installments">Ou ${bestInstallment.NumberOfInstallments}x de ${helpers._formatMoney(bestInstallment.Value, 2, ',', '.', 'R$')}</h4>` : `<h4 class="product__info-price__installments"></h4>`}
					</div>
				</div>
				<div class="product__variations" id="${product.productId}">
					<div class="product__variations-color" data-sku="${bestItemByPrice.Cor[0]}">
						<label>Selecione a Cor</label>
						<ul class="shelf-colors__list"></ul>
					</div>
					<div class="product__variations-size">
						<label>Selecione o tamanho</label>
						<select style="display: none"></select>
					</div>
				</div>
			</div>
		`);

		let skusSorted = skus.sort((a, b) => a.Tamanho[0] - b.Tamanho[0]);

		skusSorted.forEach(color => {
			if($("#" + product.productId + " #" + color.Cor[0]).length < 1){
				$("#" + product.productId + " .shelf-colors__list").append(`
					<li class="shelf-colors__item" id="${color.Cor[0]}">
						<a href="#" class="shelf-colors__link" data-image="${color.images[0].imageUrl}" data-color="${product.productName}">
							<img src="${color.images[0].imageUrl}" class="shelf-colors__image" title="${product.productName}" alt="${product.productName}" />
						</a>
					</li>
				`)
			}
		});

		_self.bind(product.productId, skusSorted);

		if(bestSkuPrice.length > 1) _self.getPrice();
	},
	mountSizesOptions(id, skus, refresh){
		let _self = this;

		$('#' + id + ' .product__variations-size select option').remove();
		$('#' + id + ' .product__variations-size select').append("<option disabled selected>Selecione o tamanho</option>");

		skus.forEach(size => {
			$("#" + id + " .product__variations-size select").append(`
				<option value="${_self.rewrite(size.Tamanho[0])}" ${size.sellers[0].commertialOffer.AvailableQuantity == 0 ? `class="item-unavailable" disabled` : ``} id="${_self.rewrite(size.Tamanho[0])}">${size.Tamanho[0]}</option>
			`);
		});

		if(refresh){
			$('#' + id + ' .product__variations-size select').selectpicker('refresh');
			$('#' + id + ' .product__variations-size select').selectpicker('val', '');
			$('#' + id + ' .product__variations-size .filter-option-inner-inner').html('Selecione o tamanho');
		} else {
			$('#' + id + ' .product__variations-size select').selectpicker();
			$('#' + id + ' .product__variations-size select').fadeIn();
		}
	},
	getPrice(){
		const { bestSkuPrice, helpers } = this.options;

		let _self = this;
		
		let listItems = [];

        bestSkuPrice.forEach(item => {
          listItems.push({
            "id": item,
            "quantity": 1,
            "seller": "1"
          })
        });

        let items = {
          "items": listItems,
          "country": "BRA"
        }

        $.ajax({
          url: '/api/checkout/pub/orderforms/simulation?sc=3',
          headers: {
            "Content-Type": "application/json"
          },
          type: 'POST',
          dataType: 'json',
          data: JSON.stringify(items),
          success: function (data) {

			let best = data.totals.find(item => item.id === "Items");
			best = best != undefined ? best.value : 0;

			let discount = data.totals.find(item => item.id === "Discounts");
			discount = discount != undefined ? discount.value : 0;

			let list = ((discount * -1) + best) / 100;

			var installments = [];

			data.paymentData.installmentOptions.forEach(function(option){ 
				if(option.installments.length > 1){
					installments = installments.concat(option.installments.filter(function(a, b){ return !a.interestRate }));
				}
			});

			let bestInstallment = installments.sort(function(a, b){ return a.count - b.count; })[installments.length - 1];

			  $('.totals__title').after(`
				<div class="totals__price">
					<h4 class="totals__price-list">antes <b>${helpers._formatMoney(list, 2, ',', '.', 'R$')}</b></h4>
					<h4 class="totals__price-best">${helpers._formatMoney(best / 100, 2, ',', '.', 'R$')}</h4>
					${bestInstallment != undefined ? `<h4 class="totals__price-installments">Ou ${bestInstallment.count}x de ${helpers._formatMoney(bestInstallment.value / 100, 2, ',', '.', 'R$')}</h4>` : `<h4 class="totals__price-installments"></h4>`}
					<h4 class="totals__price-discount">Você economizou ${helpers._formatMoney((discount * -1) / 100, 2, ',', '.', 'R$')}</h4>
				</div>
			  `);

			  $('.totals').fadeIn();
          },
          error: function (error) {
            console.error('Error on get product skus.')
            console.error(error)
          }
		});
		
	},
	
	selectedSkus(skus){
		let _self = this;

		$('.section__products .product').each(function () {
			let skuSelected = [];
			let color = $(this).find(".product__variations-color .shelf-colors__item.selected").attr("id");
			let size = $(this).find(".product__variations-size").find('.filter-option-inner-inner').text();

			if(color == undefined){
				$(this).find(".product__variations-color").addClass("error");
				_self.options.skuSelecteds = [];
				return;
			}

			if(size == "Selecione o tamanho"){
				$(this).find(".product__variations-size").addClass("error");
				if(!$('.label--error').length){
					$(this).find(".product__variations-size.error").append("<label class='label--error'>Selecione o tamanho</label>");
					$('.label--error').fadeIn();
				}
				_self.options.skuSelecteds = [];
				return;
			};

			skuSelected = skus.filter(sku => sku.Cor[0] == color)
			skuSelected = skuSelected.filter(sku => sku.Tamanho[0] == size);

			console.log(skuSelected);

			if(skuSelected.length > 0){
				_self.options.skuSelecteds.push(skuSelected[0]);
			}
		});


		if(_self.options.skuSelecteds.length > 1) {
			this.addToCart();
		}
	},
	addToCart() {
		let _self = this;

		if(!_self.options.skuSelecteds.length > 1){
			return;
		}

		let skusFiltered = _self.options.skuSelecteds;

		let ids = '';
		

		skusFiltered.forEach(element => {
			ids += 'sku=' + element.itemId + '&';
		});

		if(!$(this).parents(".product__item").find('.btn.input--error').length) {
			var hrefBuyButton = "/checkout/cart/add?"+ ids +"qty=1&qty=1&seller=1&seller=1&redirect=true&sc=3";

			APP.i.Minicart.addCart(hrefBuyButton, () => {
				APP.i.Minicart.openCart()
			});
		}
	},
	rewrite: function (str) {
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
		.replace(/[^a-z0-9]+/g, '-');
	},
});