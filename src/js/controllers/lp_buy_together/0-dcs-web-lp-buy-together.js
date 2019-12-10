APP.controller.LpBuyTogether = ClassAvanti.extend({
	init(options) {
		this.setup(options)
		this.start();
		this.bind();
	},

	setup(options) {
		this.options = $.extend({
			helpers: APP.i.Helpers,
			allPageSets: window.productsBuyTogether,
			skusToPrice: [],
			allSkusFiltereds: [],
			readySimilars: 0,
			title(content){
				$(".section__intro").html(`<h2>${content}:</h2>`);
			}
		}, options)
	},

	start() {
		const productIds = this.getIds();

		this.getProduct(productIds.map(item => item = `fq=productId:${item}`).join("&"), products => {
			products.forEach(product => {
				if(product.items.some(item => item.sellers[0].commertialOffer.AvailableQuantity > 0)){
					this.filterSkus(product);
				}
			});
		});
	},

	getIds(){
		return location.search.split("?")[1].split("&").filter(item => item.indexOf("id=") != -1).map(item => item.replace("id=", ""))
	},

	getSimilars(id, callback) {
		$.ajax({
		url: `/api/catalog_system/pub/products/crossselling/similars/${id}`,
		type: "GET",
		dataType: "json",
			success: (response) => {
				this.options.readySimilars++
				callback(response);
			},
			error: (error) => {
				alert('Não foi possível buscar os produtos');
				console.error('Não foi possível buscar os produtos', error)
			}
		});
	},

  	getProduct(ids, callback) {
		$.ajax({
		url: `/api/catalog_system/pub/products/search/?${ids}`,
		type: "GET",
		dataType: "json",
			success: (response) => {
				callback(response)
			},
			error: (error) => {
				alert('Não foi possível buscar os produtos');
				console.error('Não foi possível buscar os produtos', error)
			}
		});
	},
	  
	filterSkus(product){
		const { allPageSets, allSkusFiltereds, title } = this.options;

		let skusFiltered = [];
		
		allPageSets.forEach(set => {
			set.products.forEach(item => {
				if(item.id == product.productId){
					this.getSimilars(product.productId, similars => {
						allSkusFiltereds.push({id: product.productId, skus: []});
						
						if(($(".section__images-slider img") && $(".section__intro h2")).length < 1){
							title(set.name)
						}
						
						if(similars.length){
							similars.forEach(similar => {
								similar.items.forEach(item =>{
									allSkusFiltereds[allSkusFiltereds.length - 1].skus.push(item)
								})
							})
						}
	
						item.skus.forEach(sku => {
							product.items.forEach( skus => {
								if(skus.itemId == sku){
									skusFiltered.push(skus)
									allSkusFiltereds[allSkusFiltereds.length - 1].skus.push(skus);
								}
							})
						});

						this.mountProducts(product);

						if(this.options.readySimilars > 1){
							this.mountPrice();
						}
					});
				}
			})
		});
	},

	mountProducts(product){
		const { helpers } = this.options

		const currentSkus = this.getCurrentSkus(product.productId);
		const skuColors = this.filterSkuColors(currentSkus);
		const skuDetails = this.findMainSkuByPrice(currentSkus);
		const installment = this.findBestInstallmentFromSku(skuDetails);

		$(".section__products-inner").append(`
			<div class="product" data-id="${skuDetails.itemId}">
				<div class="product__image">
					<img src="${skuDetails.images[0].imageUrl}" title="${product.productName}" alt="Conjunto Ideal - ${product.productName}" />
				</div>
				<div class="product__all-info">
					<div class="product__info">
						<h3 class="product__info-name">${product.productName}</h3>
						<div class="product__info-price">
						${skuDetails.sellers[0].commertialOffer.Price > 0 ? 
							`<h4 class="product__info-price__list">${helpers._formatMoney(skuDetails.sellers[0].commertialOffer.Price, 2, ",", ".", "R$")}</h4>`
							:
							`<h4 class="product__info-price__unavailable">Sem estoque no site</h4>`
						}
						
						${installment ? 
							`<h4 class="product__info-price__installments">Ou ${installment.NumberOfInstallments}x de ${helpers._formatMoney(installment.Value, 2, ",", ".", "R$")}</h4>` 
							: 
							`<h4 class="product__info-price__installments"></h4>`}
						</div>
					</div>
					<div class="product__variations" data-id="${product.productId}">
						<div class="product__variations-color" data-color="${skuDetails["Cor"][0]}">
							<label>Selecione a Cor</label>
							<ul class="shelf-colors__list">
								${skuColors.map(color => 
									`<li class="shelf-colors__item" data-color="${color["Cor"][0]}">
										<a href="#" class="shelf-colors__link" data-image="${color.images[0].imageUrl}" data-color="${product.productName}">
											<img src="${color.images[0].imageUrl}" class="shelf-colors__image" title="${color["Cor"][0]}" alt="${product.productName} - ${color["Cor"][0]}" />
										</a>
									</li>`
								).join("")}
							</ul>
						</div>
						<div class="product__variations-size">
							<label>Selecione o tamanho</label>
							<select style="display: none"></select>
						</div>
					</div>
				</div>
			</div>
		`);
		
		this.selectCurrentColor(product.productId);
	},

	getCurrentSkus(id) {
		const { allSkusFiltereds } = this.options

		let skus = allSkusFiltereds.find(item => item.id == id).skus;

		return skus;
	},

	findMainSkuByPrice(skus){
		const { skusToPrice } = this.options

		const sku = skus.sort((a, b) => { 
			return a.sellers[0].commertialOffer.Price - b.sellers[0].commertialOffer.Price; 
		})[skus.length - 1];

		skusToPrice.push(sku.itemId);

		return sku
	},
	
	findBestInstallmentFromSku(sku){
		let installments = [];
		
		sku.sellers[0].commertialOffer.Installments.forEach(options => {
			if(options.NumberOfInstallments > 1 && options.InterestRate <= 0){
				installments.push(options)
			}
		});

		return installments.length ? installments.sort((a, b) => a.count - b.count)[installments.length - 1] : 0
	},

	filterSkuColors(skus) {
		const unique = skus.reduce((accumulator, current) => {
			
			const field = accumulator.find(item => item["Cor"][0] === current["Cor"][0]);

			if (!field) {
		    	return accumulator.concat([current]);
			} else {
		   		return accumulator;
			}
			  
		}, []);

		return unique
	},

	selectCurrentColor(id) {
		const _self = this;
	
		$(`[data-id=${id}] .shelf-colors__item`).each((index, element) => {
			const mainColor = $(element).parents(".product__variations-color").attr("data-color");
			const color = $(element).attr("data-color");

		  	if (color == mainColor) {
				$(element).addClass("selected");

				_self.mountSizesOptions($(element), color, false);
			}
		});
	},

	mountSizesOptions($scope, color, refresh){
		const { helpers } = this.options;

		const $select = $scope.parents(".product__variations").find(".product__variations-size select");
		const productId = $scope.parents(".product__variations").attr("data-id");

		$select.find("option").remove();
		$select.append("<option disabled selected>Selecione o tamanho</option>");
		
		const sizes = this.getCurrentSkus(productId).filter(sku => sku["Cor"][0] == color);

		$select.append(`
			${sizes.map(size => 
				`<option
					value="${helpers._rewrite(size["Tamanho"][0])}" 
					id="${helpers._rewrite(size["Tamanho"][0])}"
					${size.sellers[0].commertialOffer.AvailableQuantity == 0 ? `class="item-unavailable" disabled` : ``} 
				>
					${size["Tamanho"][0]}
				</option>`
			).join("")}		
		`);

		if(!refresh){
			$select.selectpicker();
			$select.fadeIn();
		} else {
			$select.selectpicker("refresh");
			$select.selectpicker("val", "");
			$select.parents(".bootstrap-select").find(".filter-option-inner-inner").html("Selecione o tamanho");
		}
	},

	mountPrice(){
		const { helpers } = this.options;

		this.getPrice(orderForm => {

			let discount = orderForm.totals.find(item => item.id === "Discounts");
			discount = discount != undefined ? ((discount.value) * -1) / 100 : 0;
			
			let total =  orderForm.totals.find(item => item.id === "Items");
			total = total != undefined ? total.value / 100 : 0;

			let best = total - discount;

			let installment = this.findBestInstallmentFromOrderForm(orderForm);

			$(".totals__title").html(`VALOR TOTAL DO${orderForm.items.length > 1 ? `S 2 PRODUTOS` : ` PRODUTO`}:`);
			$(".totals__title").after(`
				<div class="totals__price">
					<h4 class="totals__price-list">${total > best ? `antes <b>${helpers._formatMoney(total, 2, ",", ".", "R$")}` : ``}</b></h4>
					<h4 class="totals__price-best">${helpers._formatMoney(best, 2, ",", ".", "R$")}</h4>
					<h4 class="totals__price-installments">${installment != undefined ? `Ou ${installment.count}x de ${helpers._formatMoney(installment.value / 100, 2, ",", ".", "R$")}` : ``}</h4>
					<h4 class="totals__price-discount">${discount ? `Você economizou ${helpers._formatMoney(discount, 2, ",", ".", "R$")}` : ``}</h4>
				</div>
			`);

			if(orderForm.items.length > 1){
				$(".totals").fadeIn();
			} else {
				this.unvailableMessage();
			}
		})
	},

	unvailableMessage() {
		$(".totals").after(`
			<p class="unvailable-message">Este conjunto não está mais disponível para compra</p>
		`);
	},

	getPrice(callback){
		const { skusToPrice } = this.options;

		skusToPrice.map((item, index) => skusToPrice[index] = {"id" : item, "quantity": 1, "seller": "1"});

		$.ajax({
			url: "/api/checkout/pub/orderforms/simulation?sc=3",
			headers: { "Content-Type": "application/json" },
			type: "POST",
			data: JSON.stringify({
				"items": skusToPrice,
				"country": "BRA"
			}),
			success: (data) => {
				callback(data)
			},
			error: (error) => {
				console.error("Error on get price product skus.")
				console.error(error)
			}
		});
	},
	
	findBestInstallmentFromOrderForm(orderForm) {
		let installments = [];

		orderForm.paymentData.installmentOptions.forEach(option => { 
			if(option.installments.length > 1){
				installments = installments.concat(option.installments.filter(item => !item.interestRate));
			}
		});

		return installments.sort((a, b) => a.count - b.count)[installments.length - 1];
	},
	
	bind() {
		this.changeColor();
		this.getSkusSelecteds();
		this.selectRemoveErrors();
	},

	changeColor(){
		$("body").on("click", ".shelf-colors__item", (element) => {
			element.preventDefault();

			$(element.currentTarget).siblings().removeClass("selected");
			$(element.currentTarget).addClass("selected");
			$(element.currentTarget).parents(".product").find(".product__image img").attr("src", element.target.src);

			this.mountSizesOptions($(element.currentTarget), $(element.currentTarget).attr("data-color"), true);
		});
	},
	
	selectShowErrors($scope){
		$scope.find(".product__variations-size").addClass("error");

		if(!$scope.find(".label--error").length){
			$scope.find(".product__variations-size.error").append(`<label class="label--error">Selecione o tamanho</label>`);
			$scope.find(".label--error").fadeIn();
		}

		if(window.innerWidth <= 768) {
			$('html, body').animate({
				scrollTop: ($(".label--error:eq(0)").offset().top) - ((window.innerHeight / 2) + ($(".header").height() / 2))
			}, 1000);
		}
	},

	selectRemoveErrors(){
		$("body").on("change", ".product__variations-size select", (element) => {
			element.preventDefault();
			
			$(element.currentTarget).parents(".product__variations-size").find(".label--error").fadeOut().remove();
			$(element.currentTarget).parents(".product__variations-size").removeClass("error")
		});
	},

	getSkusSelecteds() {
		const { allSkusFiltereds } = this.options;

		$("body").on("click", ".totals__add-to-cart a", (element) => {
			element.preventDefault();
			let allSkuSelecteds = [];

			$(".section__products .product").each((index, element) => {
				const size = $(element).find(".filter-option-inner-inner").text();
				const color = $(element).find(".shelf-colors__item.selected").attr("data-color");

				if(size == "Selecione o tamanho"){
					this.selectShowErrors($(element));
					allSkuSelecteds = [];
					return
				};

				let skuSelected = [];

				const currentProductId = $(element).find(".product__variations").attr("data-id");

				skuSelected = allSkusFiltereds.find(item => item.id == currentProductId).skus.filter(sku => sku["Cor"][0] == color);
				skuSelected = skuSelected.find(sku => sku["Tamanho"][0] == size);

				if(skuSelected){
					allSkuSelecteds.push(skuSelected);
				}
			});

			this.addToCart(allSkuSelecteds);
		});
	},

	addToCart(skus) {
		if(!skus.length || $("body").find(".product__variations .error").length > 0) return;

		let ids = "";
		let qtds = "";
		let sellers = "";

		for (let index = 0; index < skus.length; index++) {
			const element = skus[index];
			ids += `sku=${element.itemId}&`;
			qtds += `qty=1&`;
			sellers += `seller=1&`;
		}

		let hrefBuyButton = `/checkout/cart/add?${ids}${qtds}${sellers}redirect=true&sc=3`;

		APP.i.Minicart.addCart(hrefBuyButton, () => {
			APP.i.Minicart.openCart()
		});
	}
});