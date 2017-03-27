<template>
	<div class="range-slider" :class="`range-slider--${orientation}`">
		<div class="range-slider__track">
			<div class="range-slider__filled"></div>
		</div>
		<div class="range-slider__control range-slider__control--min" @mousedown="mousedownHandler" @touchstart="touchstartHandler">
			<span class="range-slider__tooltip range-slider__tooltip--top" v-html="formatValue(VALUE_MIN)"></span>
		</div>
		<div class="range-slider__control range-slider__control--max" @mousedown="mousedownHandler" @touchstart="touchstartHandler">
			<span class="range-slider__tooltip range-slider__tooltip--bottom" v-html="formatValue(VALUE_MAX)"></span>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'range-slider',
		props: {
			name: {
				type: String,
				default: 'range-slider'
			},
			min: {
				type: Number,
				default: 0
			},
			max: {
				type: Number,
				default: 100
			},
			step: {
				type: Number,
				default: 1
			},
			formatter: {
				type: String,
				default: '{value}'
			},
			orientation: {
				type: String,
				default: 'horizontal'
			},
			value: {
				type: Array,
				default() {
					return [0, 100]
				}
			},
			lazy: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				HAS_INTERACTION: false,
				IS_LOOPING: false,
				EASE: 0.25,
				POINTER_X: 0,
				POINTER_Y: 0,
				X_MIN: 0,
				X_MAX: 100,
				Y_MIN: 0,
				Y_MAX: 100,
				CONTROL_MIN: {
					X: 0,
					Y: 0
				},
				CONTROL_MAX: {
					X: 0,
					Y: 0
				},
				SLIDER_WIDTH: 0,
				SLIDER_HEIGHT: 0,
				IS_DESTROYED: true,
				$currentTarget: null
			}
		},
		computed: {

			/**
			 * Get the number of decimals to display
			 * from the given `step` value
			 */
			DECIMALS() {
				let decimals = `${this.step}`.split('.')[1]
				return decimals ? decimals.length : 0
			},

			/**
			 * Get the range between the minimum
			 * and the maximum values
			 */
			DIFF() {
				return this.max - this.min
			},

			/**
			 * Get the minimum value from
			 * the current minium X position
			 */
			VALUE_MIN() {
				let VALUE

				if (this.orientation === 'horizontal') {
					VALUE = Math.round(((this.CONTROL_MIN.X * this.DIFF / this.SLIDER_WIDTH) + this.min) / this.step) * this.step
				} else {
					VALUE = Math.round(((this.CONTROL_MIN.Y * this.DIFF / this.SLIDER_HEIGHT) + this.min) / this.step) * this.step
				}

				return VALUE.toFixed(this.DECIMALS)
			},

			/**
			 * Get the maximum value from
			 * the current maximum X position
			 */
			VALUE_MAX() {
				let VALUE

				if (this.orientation === 'horizontal') {
					VALUE = Math.round(((this.CONTROL_MAX.X * this.DIFF / this.SLIDER_WIDTH) + this.min) / this.step) * this.step
				} else {
					VALUE = Math.round(((this.CONTROL_MAX.Y * this.DIFF / this.SLIDER_HEIGHT) + this.min) / this.step) * this.step
				}

				return VALUE.toFixed(this.DECIMALS)
			}

		},
		methods: {


			/**
			 * Start updating values and position
			 *
			 * @param  {Object} $target   The current targetted $control
			 * @param  {Number} POINTER_X The current pointer X position
			 * @param  {Number} POINTER_Y The current pointer Y position
			 */
			start($target, POINTER_X, POINTER_Y) {
				// Make sure our target is the
				// control and not the tooltip
				if (!$target.__TYPE) {
					$target = $target.parentElement
				}

				this.HAS_INTERACTION = true

				this.updatePointerPosition(POINTER_X, POINTER_Y)
				this.X = this.getX($target.__TYPE)
				this.Y = this.getY($target.__TYPE)
				this.$currentTarget = $target
				this.IS_LOOPING = true
			},



			/**
			 * End updating values and position,
			 * emit the current values
			 */
			end() {
				this.$currentTarget = null
				this.IS_LOOPING = false
				this.HAS_INTERACTION = false
				this.emitValue()
			},



			/**
			 * Update the pointer's position vars
			 *
			 * @param  {Number} X The pointer's current X position
			 * @param  {Number} Y The pointer's current Y position
			 */
			updatePointerPosition(X, Y) {
				this.POINTER_X = X
				this.POINTER_Y = Y
			},



			/**
			 * Update the range slider sizes' vars
			 */
			updateSizes() {
				const SIZES = this.$slider.getBoundingClientRect()

				this.SLIDER_WIDTH = SIZES.width
				this.SLIDER_HEIGHT = SIZES.height

				this.X_MIN = SIZES.left
				this.X_MAX = SIZES.left + SIZES.width

				this.Y_MIN = SIZES.top
				this.Y_MAX = SIZES.top + SIZES.height
			},



			/**
			 * Update the current value and the
			 * controls positions
			 *
			 * @param  {Array} VALUE The new value
			 */
			updateValue(VALUE) {
				this.CONTROL_MIN.X = (VALUE[0] - this.min) * this.SLIDER_WIDTH / this.DIFF
				this.CONTROL_MIN.Y = (VALUE[0] - this.min) * this.SLIDER_HEIGHT / this.DIFF

				this.CONTROL_MAX.X = (VALUE[1] - this.min) * this.SLIDER_WIDTH / this.DIFF
				this.CONTROL_MAX.Y = (VALUE[1] - this.min) * this.SLIDER_HEIGHT / this.DIFF

				this.updatePosition()
			},



			/**
			 * Emit the current value to the parent
			 *
			 */
			emitValue() {
				const min = Number(this.VALUE_MIN).toFixed(this.DECIMALS)
				const max = Number(this.VALUE_MAX).toFixed(this.DECIMALS)
				this.$emit('input', [Number(min), Number(max)])
			},



			/**
			 * Format the given value with
			 * the formatter string
			 *
			 * @param  {String} value The value to format
			 * @return {String}       The formatted value
			 */
			formatValue(value) {
				return this.formatter.replace('{value}', value)
			},



			/**
			 * Get the current control X position
			 * in function of the slider's size and
			 * the other control's X position
			 *
			 * @param  {String} TYPE The type of the current control
			 * @return {Number}      The current X position
			 */
			getX(TYPE) {
				const X = this.POINTER_X < this.X_MIN ? 0 : this.POINTER_X > this.X_MAX ? this.SLIDER_WIDTH : this.POINTER_X - this.X_MIN

				if (TYPE === 'CONTROL_MIN') {
					return X > this.CONTROL_MAX.X ? this.CONTROL_MAX.X : X
				} else {
					return X < this.CONTROL_MIN.X ? this.CONTROL_MIN.X : X
				}
			},



			/**
			 * Get the current control Y position
			 * in function of the slider's size and
			 * the other control's Y position
			 *
			 * @param  {String} TYPE The type of the current control
			 * @return {Number}      The current Y position
			 */
			getY(TYPE) {
				const Y = this.POINTER_Y < this.Y_MIN ? 0 : this.POINTER_Y > this.Y_MAX ? this.SLIDER_HEIGHT : this.POINTER_Y - this.Y_MIN

				if (TYPE === 'CONTROL_MIN') {
					return Y > this.CONTROL_MAX.Y ? this.CONTROL_MAX.Y : Y
				} else {
					return Y < this.CONTROL_MIN.Y ? this.CONTROL_MIN.Y : Y
				}
			},



			/**
			 * The loop responsible for all the good stuff
			 */
			loop() {
				if (this.IS_DESTROYED || !this.IS_LOOPING) return false

				if (this.$currentTarget !== null) {
					const TYPE = this.$currentTarget.__TYPE

					// Horizontal layout
					if (this.orientation === 'horizontal') {
						const X = this.getX(TYPE)
						this[TYPE].X += (X - this[TYPE].X) * this.EASE
					}

					// Vertical layout
					if (this.orientation === 'vertical') {
						const Y = this.getY(TYPE)
						this[TYPE].Y += (Y - this[TYPE].Y) * this.EASE
					}

					this.updatePosition()
					if (!this.lazy) this.emitValue()
				}
				requestAnimationFrame(this.loop.bind(this))
			},



			/**
			 * Update the elements' positions
			 */
			updatePosition() {
				if (this.orientation === 'horizontal') {
					this.$controls[0].style.transform = `translate3d(${this.CONTROL_MIN.X}px, 0, 0)`
					this.$controls[1].style.transform = `translate3d(${this.CONTROL_MAX.X}px, 0, 0)`
					this.$filled.style.left = `${this.CONTROL_MIN.X}px`
					this.$filled.style.right = `${this.SLIDER_WIDTH - this.CONTROL_MAX.X}px`
				} else {
					this.$controls[0].style.transform = `translate3d(0, ${this.CONTROL_MIN.Y}px, 0)`
					this.$controls[1].style.transform = `translate3d(0, ${this.CONTROL_MAX.Y}px, 0)`
					this.$filled.style.top = `${this.CONTROL_MIN.Y}px`
					this.$filled.style.bottom = `${this.SLIDER_HEIGHT - this.CONTROL_MAX.Y}px`
				}
			},



			/**
			 * Helper to loop over a nodeList
			 *
			 * @param  {Array|NodeList}  array
			 * @param  {Function}        callback
			 * @param  {Object}          scope
			 */
			forEach(array, callback, scope) {
				const length = array.length
				for (let i = 0; i < length; i++) {
					callback.call(scope, array[i], i)
				}
			},



			/**
			 * Dispatch events to their handler
			 *
			 * @param  {Object} e The event's object
			 */
			handleEvent(e) {
				try {
					this[`${e.type}Handler`](e)
				} catch(e) {}
			},



			/**
			 * Window resize event's handler
			 *
			 * @param  {Object} e The event's object
			 */
			resizeHandler(e) {
				this.updateSizes()
			},



			/**
			 * The controls mousedown events' handler
			 *
			 * @param  {Object} event.target  The target of the event
			 * @param  {Number} event.clientX The current X pointer position
			 * @param  {Number} event.clientY The current Y pointer position
			 */
			mousedownHandler({ target, clientX , clientY }) {
				document.addEventListener('mousemove', this)
				document.addEventListener('mouseup', this)
				this.start(target, clientX, clientY)
			},



			/**
			 * Document mouseup event's handler
			 *
			 * @param  {Object} e The event's object
			 */
			mouseupHandler(e) {
				document.removeEventListener('mousemove', this)
				document.removeEventListener('mouseup', this)
				this.end()
			},



			/**
			 * Document mousemove event's handler
			 *
			 * @param  {Number} event.clientX The current X pointer position
			 * @param  {Number} event.clientY The current Y pointer position
			 */
			mousemoveHandler({ clientX , clientY }) {
				this.updatePointerPosition(clientX, clientY)
			},



			/**
			 * The control's touchstart event's handler
			 *
			 * @param  {Object} event.target  The target of the event
			 * @param  {Array}  event.touches The list of all the touch
			 */
			touchstartHandler({ target, touches }) {
				this.EASE = 1
				document.addEventListener('touchmove', this, { passive: false })
				document.addEventListener('touchend', this)
				const X = touches[0].clientX
				const Y = touches[0].clientY
				this.start(target, X, Y)
			},



			/**
			 * The document's touchend handler
			 *
			 * @param  {Object} e The event's object
			 */
			touchendHandler(e) {
				document.removeEventListener('touchmove', this)
				document.removeEventListener('touchend', this)
				this.end()
			},



			/**
			 * The document's touchmove handler
			 *
			 * @param  {Object} e The event's object
			 */
			touchmoveHandler(e) {
				e.preventDefault()
				const X = e.touches[0].clientX
				const Y = e.touches[0].clientY
				this.updatePointerPosition(X, Y)
			}
		},

		watch: {

			/**
			 * Initialize the loop when the
			 * `IS_LOOPING` is set to `true`
			 *
			 * @param {Boolean} newValue The new value of the var
			 */
			IS_LOOPING(newValue) {
				if (newValue) this.loop()
			},

			/**
			 * Watch the change of the `value` prop
			 * and update the component if the change
			 * is not coming from direct interaction
			 * with the component via mouse or touch
			 *
			 * @param  {Array} newValue The new value of the var
			 */
			value(newValue) {
				if (!this.HAS_INTERACTION) this.updateValue(newValue)
			}
		},

		mounted() {
			this.IS_DESTROYED = false

			this.$slider = this.$el
			this.$filled = this.$el.querySelector('.range-slider__filled')

			this.$controls = this.$el.querySelectorAll('.range-slider__control')
			this.$controls[0].__TYPE = 'CONTROL_MIN'
			this.$controls[1].__TYPE = 'CONTROL_MAX'

			this.updateSizes()
			this.updateValue(this.value)

			window.addEventListener('resize', this)
		},

		beforeDestroy() {
			this.IS_DESTROYED = true
			window.removeEventListener('resize', this)
		}
	}
</script>

<style lang="scss">

	.range-slider {
		position: relative;
		user-select: none;
		cursor: default;
		box-sizing: border-box;

		*,
		*:after,
		*:before {
			box-sizing: inherit;
		}
	}

	.range-slider--horizontal {
		width: 100px;
		height: 6px;
	}

	.range-slider--vertical {
		width: 6px;
		height: 100px;
	}

	.range-slider__track {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #333;
		overflow: hidden;
	}

	.range-slider__filled {
		position: absolute;
		background: red;
		pointer-events: none;
		will-change: left, right;

		.range-slider--horizontal & {
			height: 100%;
		}

		.range-slider--vertical & {
			width: 100%;
		}
	}

	.range-slider__control {
		$width: 10px;
		$height: 20px;

		position: absolute;
		background: #fff;
		cursor: pointer;

		.range-slider--horizontal & {
			top: 50%;
			left: 0;
			width: $width;
			height: $height;
			margin-top: $height * -0.5;
			margin-left: $width * -0.5;
		}

		.range-slider--vertical & {
			top: 0;
			left: 50%;
			width: $height;
			height: $width;
			margin-top: $width * -0.5;
			margin-left: $height * -0.5;
		}
	}

	.range-slider__tooltip {
		position: absolute;
		display: block;
		padding: 1em;
		line-height: 1;

		.range-slider--horizontal & {
			left: 50%;
			text-align: center;
			transform: translate(-50%, 0);
		}

		.range-slider--vertical & {
			top: 50%;
			transform: translate(0, -50%);
		}
	}

	.range-slider__tooltip--top {

		.range-slider--horizontal & {
			bottom: 100%;
		}

		.range-slider--vertical & {
			left: 100%;
			text-align: left;
		}
	}

	.range-slider__tooltip--bottom {

		.range-slider--horizontal & {
			top: 100%;
		}

		.range-slider--vertical & {
			right: 100%;
			text-align: right;
		}
	}
</style>
