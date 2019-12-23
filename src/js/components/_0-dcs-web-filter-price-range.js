/**
  * @name FilterPriceRange
  * @description null 
  * @controllers using this component: 
  * * Product
  * * List
*/

APP.component.FilterPriceRange = ClassAvanti.extend({
  init (options) {
    this.setup(options)
    this.start()
    this.bind()
  },

  setup (options) {
    this.options = $.extend({
      templatePriceRange: `<div class="prince-range">
                              <div class="price-range__values">
                                <div class="price-range__value price-range__value--min"></div>
                                <div class="price-range__value price-range__value--max"></div>
                              </div>

                              <div class="prince-range__content"></div>
                            </div>`,

      $scope () {
        return $('h5:contains("Faixa de preço")').parent('fieldset').children('div')
      },

      classContent: 'prince-range__content',
      classRangeValue: 'price-range__value',

      onChange (saveFilter, filter) {
        console.log(filter)

        if (saveFilter) {
          AvantiSearch._refreshFilter(saveFilter, false, null)
        } else {
          AvantiSearch._refreshFilter(filter, true, null)
        }
      }
    }, options)
  },

  start () {
    this.createElement()
    this.startPlugin()
  },

  createElement () {
    const options = this.options

    const $scope = options.$scope()

    $scope.prepend(options.templatePriceRange)
  },

  startPlugin () {
    const $target = this.getTarget()

    if (typeof $target === 'undefined') {
      return false
    }

    const minValue = this.getMinValue()
    const maxValue = this.getMaxValue()

    // eslint-disable-next-line no-undef
    noUiSlider.create($target, {
      connect: true,
      step: 1.00,
      start: [
        minValue,
        maxValue
      ],
      range: {
        min: minValue,
        max: maxValue
      }
    })
  },

  getTarget () {
    const options = this.options

    return $(`.${options.classContent}`)[0]
  },

  getMinValue () {
    return this._getValue('first')
  },

  getMaxValue () {
    return this._getValue('last')
  },

  _getValue (position = 'first') {
    const $scope = this.options.$scope()

    const $label = $scope.find(`label:${position}`)
    const $input = $label.find('input')

    const value = $input.val()
    const result = this._matchValue(value)

    if (position === 'last') {
      return Number(result[1])
    }

    return Number(result[0])
  },

  _matchValue (value) {
    const pattern = new RegExp('([0-9.]+)', 'g')

    return value.match(pattern)
  },

  resetSlider (min = null, max = null) {
    const $target = this.getTarget()

    $target.noUiSlider.set([
      min || this.getMinValue(),
      max || this.getMaxValue()
    ])
  },

  _formatPrice (price, prefix) {
    let priceString = price.toString()

    if (priceString.length < 3) {
      priceString = this._padStart(priceString, '000')
    }

    let temp = priceString.replace(/([0-9]{2})$/g, ',$1')

    if (temp.length > 6) {
      temp = temp.replace(/([0-9]{3}),([0-9]{2}$)/g, '.$1,$2')
    } else if (temp.length > 9) {
      temp = temp.replace(/([0-9]{3}).([0-9]{3}),([0-9]{2}$)/g, '.$1.$2,$3')
    }

    if (typeof prefix !== 'undefined') {
      temp = prefix + temp
    }

    return temp
  },

  bind () {
    const $target = this.getTarget()

    if (typeof $target === 'undefined') {
      return false
    }

    this.bindUpdate()
    this.bindChange()
  },

  bindUpdate () {
    const $target = this.getTarget()

    const $rangeValue = $(`.${this.options.classRangeValue}`)

    $target.noUiSlider.on('update', (values, handle) => {
      const value = values[handle].replace(/\D/g, '')

      $rangeValue
        .eq(handle)
        .text(this._formatPrice(value, 'R$ '))
    })
  },

  bindChange () {
    const $target = this.getTarget()

    $target.noUiSlider.on('change', values => {
      const [ start, end ] = values
      const filter = `fq=P:[${start} TO ${end}]`

      this.options.onChange(this.saveFilter, filter)

      this.saveFilter = filter
    })
  }
})
