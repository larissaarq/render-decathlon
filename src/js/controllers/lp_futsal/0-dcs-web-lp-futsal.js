APP.controller.LpFutsal = ClassAvanti.extend({
    init() {
        this.start()
        this.bind()
    },

    start() {
        this.mapProducts();
    },

    bind() {},

    helpers: {
        rewrite: function(str) {
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

    mapProducts: function() {
        var productIds = "";

        $('.product__item').each(function(index, element) {
            productIds += "fq=productId:" + $(this).attr("data-productid") + "&";
        });

        this.getProducts(productIds)
    },

    getProducts: function(productIds) {
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

    filterProducts: function(products) {
        var filteredProducts = [];

        products.forEach(function(product, index, array) {
            var skuOptions = [];
            var skuVariations = [];

            product.items.filter(function(sku) {
                if (sku.sellers[0].commertialOffer.AvailableQuantity > 0) {

                    skuVariations = sku.variations;

                    sku.variations.forEach(function(key) {
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

    mountSkuSelector: function(filteredProducts) {
        var _self = this;

        filteredProducts.forEach(function(product, index, array) {
            var productSelector = "[data-productid='" + product.productId + "']";

            product.skuVariations.forEach(function(skuVariation, index, array) {
                if (skuVariation == "Cor") {
                    $(productSelector).find(".product__item_sku-selection").prepend("<select style='display: none' id=" + skuVariation + "><option disabled>" + skuVariation + "</option></select>")
                } else {
                    $(productSelector).find(".product__item_sku-selection").prepend("<select id=" + skuVariation + "><option disabled selected>" + skuVariation + "</option></select>")
                }
            })

            product.skuOptions.forEach(function(skuOption, index, array) {
                if (!$(productSelector).find(".product__item_sku-selection #" + skuOption.name + " #" + _self.helpers.rewrite(skuOption.value) + "").length) { //verifica p não repetir option
                    if (skuOption.name == "Cor") {
                        $(productSelector).find(".product__item_sku-selection #" + skuOption.name).append("<option selected id=" + _self.helpers.rewrite(skuOption.value) + " data-option=" + _self.helpers.rewrite(skuOption.value) + ">" + skuOption.value + "</option>")

                    } else {
                        $(productSelector).find(".product__item_sku-selection #" + skuOption.name).append("<option id=" + _self.helpers.rewrite(skuOption.value) + " data-option=" + _self.helpers.rewrite(skuOption.value) + ">" + skuOption.value + "</option>")
                    }
                }
            });
        });

        $(".product__item_sku-selection select:not(#Cor)").selectpicker()
        $(".product__item_sku-selection select:not(#Cor)").fadeIn();


        this.addToCart(filteredProducts)
    },

    selectSku: function($scope, filteredProducts) {

        var _this1 = this;
        $scope.parents(".product__item-actions").find(".bootstrap-select .btn").removeClass("input--error");
        $('.label--error').fadeOut().remove();

        var productId = $scope.parents(".product__item").attr("data-productid");

        var filteredBySize = null
        var filteredByColor = null

        $scope.parents(".product__item-actions").find('.product__item_sku-selection select').find(":selected").each(function(index, element) {
            var _this = $(this);

            if ($(this).attr("data-option") != undefined) {
                filteredProducts.forEach(function(product, index, array) {
                    if (product.productId == productId) {
                        if (_this.attr("data-option") != null && _this.attr("data-option") != undefined) {
                            if (filteredBySize == null) {
                                filteredBySize = product.skuOptions.filter(option => _this1.helpers.rewrite(option.value) == _this.attr("data-option"));
                            } else {
                                filteredByColor = product.skuOptions.filter(option => _this1.helpers.rewrite(option.value) == _this.attr("data-option"));
                            }
                        }
                    }
                });
            }
        });

        const matchSku = filteredByColor.filter(color => {
            return filteredBySize.find(size => size.skuId == color.skuId);
        })

        return matchSku[0].skuId;
    },

    addToCart: function(filteredProducts) {
        var _self = this

        $(".product__item_buy-button a").on("click", function(e) {
            e.preventDefault();

            const skuIdSelected = _self.selectSku($(this), filteredProducts);

            $(this).parents(".product__item").find('select').find(":selected").each(function(index, element) {
                if ($(this).attr("data-option") == undefined) {
                    $(this).parents(".bootstrap-select").find(".btn").addClass("input--error");
                    if (!$('.label--error').length) {
                        $(this).parents(".bootstrap-select").append("<label class='label--error'>Selecione o tamanho</label>");
                        $('.label--error').fadeIn();
                    }
                }
            });

            if (!$(this).parents(".product__item").find('.btn.input--error').length) {
                var hrefBuyButton = "/checkout/cart/add?sku=" + skuIdSelected + "&qty=1&seller=1&redirect=true&sc=3";

                APP.i.Minicart.addCart(hrefBuyButton, () => {
                    APP.i.Minicart.openCart()
                });
            }
        });
    }
})