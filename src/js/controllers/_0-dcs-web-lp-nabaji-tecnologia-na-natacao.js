APP.controller.LpNabaiji = ClassAvanti.extend({
	init() {
		this.start()
		this.bind()
	},

	start() {
		this.mapProducts();
		if(window.innerWidth <= 768) {
			this.sliderBenefits();
		}
	},

	bind() {
		
	},

	helpers: {
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
	},

	mapProducts: function () {
		var productIds = "";

		$('.product__item').each(function (index, element) {
			productIds += "fq=productId:" + $(this).attr("data-productid") + "&";
		});
		
		this.getProducts(productIds)
	},
	getProducts: function (productIds) {
		$.ajax({
			url: '/api/catalog_system/pub/products/search/?' + productIds,
			dataType: 'json',
			success: (products) => {
				this.filterProducts(products);
			},
			error: (error) => {
				console.log(error)
			}
		});
	},
	filterProducts: function (products) {
		var filteredProducts = [];

		products.forEach(function (product, index, array) {
			var skuOptions = [];
			var skuVariations = [];

			product.items.filter(function (sku) {
				if (sku.sellers[0].commertialOffer.AvailableQuantity > 0) {

				skuVariations = sku.variations;

				sku.variations.forEach(function (key) {
					skuOptions.push({
					"skuId": sku.itemId,
					"name": key,
					"value": sku[key][0]
					});
				})
				}
			});

			filteredProducts.push({
				"productId": product.productId,
				"skuOptions": skuOptions,
				"skuVariations": skuVariations
			});
		});
		this.filteredProductBySku(filteredProducts)
	},
	filteredProductBySku: function (filteredProducts){
		var filteredProductBySku = [];

		filteredProducts.forEach(function(product, index, array){
			if(product.productId == "14725"){
				var skuFiltered = [];

				product.skuOptions.forEach(function(item, index, array){
					if(item.name == "Cor" & item.value == "preto"){
						skuFiltered.push(item);
					}
					skuFiltered.forEach(function(item2, index, array){
						if(item2.skuId == item.skuId){
							skuFiltered.push(item)
						}
					})
				});

				filteredProductBySku.push({
					"productId": product.productId,
					"skuVariations": product.skuVariations,
					"skuOptions": skuFiltered
				});

			} else {
				filteredProductBySku.push(product);
			}
		})

		this.mountSkuSelector(filteredProductBySku);
	},
	mountSkuSelector: function (filteredProducts) {
		var _self = this;

		filteredProducts.forEach(function (product, index, array) {
			var productSelector = "[data-productid='" + product.productId + "']";

			product.skuVariations.forEach(function (skuVariation, index, array) {
				if(skuVariation == "Cor") {
					$(productSelector).find(".product__item_sku-selection").append("<select style='display: none' id=" + skuVariation + "><option disabled>" + skuVariation + "</option></select>")
				} else {
					$(productSelector).find(".product__item_sku-selection").append("<select id=" + skuVariation + "><option disabled selected>" + skuVariation + "</option></select>")
				}
			})

			product.skuOptions.forEach(function (skuOption, index, array) {
				if (!$(productSelector).find(".product__item_sku-selection #" + skuOption.name + " #" + _self.helpers.rewrite(skuOption.value) +"").length) { //verifica p não repetir option
					if (product.productId == "3608" & skuOption.name == "Cor" || skuOption.name == "Cor" & product.productId == "14688") {
						if ($(productSelector).find(".product__item_sku-selection #Cor #preto-vermelho").length <= 0) {
							$(productSelector).find(".product__item_sku-selection #Cor").append("<option selected='selected' id='preto-vermelho' data-option='preto-vermelho'>preto-vermelho</option>")
						}
					} else {
						if(skuOption.name == "Cor"){
							if ($(productSelector).find(".product__item_sku-selection #Cor #preto").length <= 0) {
								$(productSelector).find(".product__item_sku-selection #Cor").append("<option selected='selected' id='preto' data-option='preto'>preto</option>")
							}
						} else {
							$(productSelector).find(".product__item_sku-selection #" + skuOption.name).append("<option id=" + _self.helpers.rewrite(skuOption.value) + " data-option="+ skuOption.value +">" + skuOption.value + "</option>")
						}
					}

				}
			});
		});

		$(".product__item_sku-selection select:not(#Cor)").selectpicker()
		$(".product__item_sku-selection select:not(#Cor)").fadeIn();


		this.addToCart(filteredProducts)
	},
	addToCart: function(filteredProducts){
		var skuSelecteds = null

		$("select").on("change", function(){

			$(this).parents(".bootstrap-select").find(".btn").removeClass("input--error");
			$('.label--error').fadeOut().remove();

			var productId = $(this).parents(".product__item").attr("data-productid");
			
			var skuSelected = null;

			var filteredSkus = null;

			$(this).parents(".product__item").find('select').find(":selected").each(function (index, element) {

				var _this = $(this);

				if($(this).attr("data-option") != undefined) {
					filteredProducts.forEach(function (product, index, array) {
						if(product.productId == productId) {
							if(_this.attr("data-option") != null & _this.attr("data-option") != undefined){
								if(skuSelected == null) {
									filteredSkus = product.skuOptions.filter(function(option){
										return option.value == _this.attr("data-option");
									});

									skuSelected = product.skuOptions.filter(function(option){
										return option.value == _this.attr("data-option");
									});
								} else {
									skuSelected = product.skuOptions.filter(function(option){
										return option.value == _this.attr("data-option");
									});
								}
							}
						}
					});
				}
			});


			skuSelected.forEach(function (selected, index, array){
				filteredSkus.forEach(function (filtered, index, array){
					if(selected.skuId == filtered.skuId) {
						skuSelecteds = selected;
					}
				})
			})
		})

		$(".product__item_buy-button a").on("click", function (e) {
			e.preventDefault();
			
			$(this).parents(".product__item").find('select').find(":selected").each(function (index, element) {
				if($(this).attr("data-option") == undefined) {
					$(this).parents(".bootstrap-select").find(".btn").addClass("input--error");
					if(!$('.label--error').length){
						$(this).parents(".bootstrap-select").append("<label class='label--error'>Selecione o tamanho</label>");
						$('.label--error').fadeIn();
					}
				}
			});
			

			if(!$(this).parents(".product__item").find('.btn.input--error').length) {
				var hrefBuyButton = "/checkout/cart/add?sku="+ skuSelecteds.skuId +"&qty=1&seller=1&redirect=true&sc=3";
	
				APP.i.Minicart.addCart(hrefBuyButton, () => {
					APP.i.Minicart.openCart()
				});
			}
		});
	},
	sliderBenefits: function (){
		$(".benefits-bar").slick({
            infinite: !1,
            autoplay: !1,
            dots: !1,
            arrows: !0,
            slidesToShow: 1,
            slidesToScroll: 1
        });
	}
})