APP.controller.LpBolaF900 = ClassAvanti.extend({
	init() {
		this.start()
		this.bind()
	},

	start() {
		this.mapProducts();
	},

	bind() {},

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

		$('.to__cart').each(function (index, element) {
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

		this.mountSkuSelector(filteredProducts)
	},

	mountSkuSelector: function (filteredProducts) {
		var _self = this;

		filteredProducts.forEach(function (product, index, array) {
			var productSelector = "[data-productid='" + product.productId + "']";
			product.skuVariations.forEach(function (skuVariation, index, array) {
				if(skuVariation == "Cor") {
					$(productSelector).find(".product-buy").prepend("<select style='display: none' id=" + skuVariation + "><option disabled>" + skuVariation + "</option></select>")
				} else {
					$(productSelector).find(".product-buy").prepend("<select id=" + skuVariation + "><option disabled selected>" + skuVariation + "</option></select>")
				}
			})

			product.skuOptions.forEach(function (skuOption, index, array) {
				if (!$(productSelector).find(".product-buy #" + skuOption.name + " #" + _self.helpers.rewrite(skuOption.value) +"").length) { //verifica p não repetir option
					if(skuOption.name == "Cor"){
						$(productSelector).find(".product-buy #" + skuOption.name).append("<option selected id=" + _self.helpers.rewrite(skuOption.value) + " data-option="+ skuOption.value +">" + skuOption.value + "</option>")

					} else {
						$(productSelector).find(".product-buy #" + skuOption.name).append("<option id=" + _self.helpers.rewrite(skuOption.value) + " data-option="+ skuOption.value +">" + skuOption.value + "</option>")
					}
				}
			});
		});

		$(".product-buy select:not(#Cor)").selectpicker()
		$(".product-buy select:not(#Cor)").fadeIn();


		this.addToCart(filteredProducts)
	},

	addToCart: function(filteredProducts){
		var skuSelecteds = null

		$("select").on("change", function(){

			$(this).parents(".bootstrap-select").find(".btn").removeClass("input--error");
			$('.label--error').fadeOut().remove();

			var productId = $(this).parents(".to__cart").attr("data-productid");
			
			var skuSelected = null;

			var filteredSkus = null;

			$(this).parents(".to__cart").find('select').find(":selected").each(function (index, element) {

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

		
		$(".to__cart_buy-button").on("click", function (e) {
			e.preventDefault();
			
			$(this).parents(".to__cart").find('select').find(":selected").each(function (index, element) {
				if($(this).attr("data-option") == undefined) {
					$(this).parents(".bootstrap-select").find(".btn").addClass("input--error");
					if(!$('.label--error').length){
						$(this).parents(".bootstrap-select").append("<label class='label--error'>Selecione o tamanho</label>");
						$('.label--error').fadeIn();
					}
				}
			});
			

			if(!$(this).parents(".to__cart").find('.btn.input--error').length) {
				var hrefBuyButton = "/checkout/cart/add?sku="+ skuSelecteds.skuId +"&qty=1&seller=1&redirect=true&sc=3";
	
				APP.i.Minicart.addCart(hrefBuyButton, () => {
					APP.i.Minicart.openCart()
				});
			}
		});
	}
})