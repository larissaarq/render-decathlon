APP.component.ProductColorThumbs = ClassAvanti.extend({
  init () {
    this.setup()
    this.start()
  },

  setup () {
    this.options = {
      $skuColor: $('.topic.Cor'),
      $skuColorItem: $('.item-dimension-Cor'),
      $skuColorInput: $('.input-dimension-Cor'),
      $allSkus: skuJson.skus,

      skuColorClass: 'color-image',
      oldThumbSize: '-500-500',
      newThumbSize: '-30-30'
    }
  },

  start () {
    this.getColorThumbs()
  },

  getColorThumbs () {
    const {
      $skuColorInput,
      $allSkus,
      skuColorClass,
      $skuColor
    } = this.options

    $skuColorInput.each((i, e) => {
      const _this = $(e)

      const colorName = _this.data('value')
      const skuColors = []
      const skuImages = []

      
      $allSkus.map(skuItem => {
        const colorList = skuItem.dimensions.Cor
        if (colorList === colorName) {
          const colorImgList = skuItem.image
          skuColors.push(colorList)
          skuImages.push(colorImgList)
        }
        return true
      })

      const skuColorName = skuColors.filter((elem, index) => {
        return skuColors.indexOf(elem) === index
      })

      const skuImgSrc = skuImages.filter((elem, index) => {
        return skuImages.indexOf(elem) === index
      })

      _this.next('label').html(`<img src="${skuImgSrc}" alt="${skuColorName}" />`)
    })
  }
})
