<template>
	<div class="range-slider" :class="`range-slider--${direction}`">
		<div class="range-slider__track">
			<div class="range-slider__filled"></div>
		</div>
		<div class="range-slider__control range-slider__control--min" @mousedown="mousedownHandler">
			<span class="range-slider__tooltip range-slider__tooltip--top" v-html="formatValue(CONTROL_MIN.VALUE)"></span>
		</div>
		<div class="range-slider__control range-slider__control--max" @mousedown="mousedownHandler">
			<span class="range-slider__tooltip range-slider__tooltip--bottom" v-html="formatValue(CONTROL_MAX.VALUE)"></span>
		</div>
	</div>
</template>

<script>
	import forEach from 'foreach'

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
			direction: {
				type: String,
				default: 'horizontal'
			},
			reverse: {
				type: Boolean,
				default: false
			},
			value: {
				type: Array,
				default() {
					return [0, 100]
				}
			},
		},
		data() {
			return {
				MIN: this.value[0],
				MAX: this.value[1],
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
					Y: 0,
					VALUE: this.value[0]
				},
				CONTROL_MAX: {
					X: 0,
					Y: 0,
					VALUE: this.value[1]
				},
				SLIDER_WIDTH: 0,
				SLIDER_HEIGHT: 0,
				IS_DESTROYED: true,
				$currentTarget: null
			}
		},
		methods: {



			/**
			 * Emit the current value to the parent
			 *
			 */
			emitValue() {
				this.$emit('input', [Number(this.CONTROL_MIN.VALUE), Number(this.CONTROL_MAX.VALUE)]);
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
			 * Dispatch events to their handler
			 *
			 * @param  {Object} e The event's object
			 */
			handleEvent(e) {
				try {
					this[`${e.type}Handler`](e)
				} catch(e) {}
			},


			saveSizes() {
				console.log('saveSizes');
				const SIZES = this.$slider.getBoundingClientRect()

				this.SLIDER_WIDTH = SIZES.width
				this.SLIDER_HEIGHT = SIZES.height

				this.X_MIN = SIZES.left
				this.X_MAX = SIZES.left + SIZES.width

				this.Y_MIN = SIZES.top
				this.Y_MAX = SIZES.top + SIZES.height
			},

			start($target, POINTER_X, POINTER_Y) {
				this.updatePointerPosition(POINTER_X, POINTER_Y);
				this.X = this.getX($target.__TYPE)
				this.Y = this.getY($target.__TYPE)
				this.$currentTarget = $target
				this.IS_LOOPING = true
			},

			end() {
				this.$currentTarget = null
				this.IS_LOOPING = false
				this.emitValue()
			},

			resizeHandler(e) {
				this.saveSizes()
			},

			mousedownHandler({ target, clientX , clientY }) {
				document.addEventListener('mousemove', this);
				document.addEventListener('mouseup', this);
				this.start(target, clientX, clientY);
			},


			mouseupHandler(e) {
				document.removeEventListener('mousemove', this);
				document.removeEventListener('mouseup', this);
				this.end()
			},

			mousemoveHandler({ clientX , clientY }) {
				this.updatePointerPosition(clientX, clientY);
			},

			updatePointerPosition(X, Y) {
				this.POINTER_X = X
				this.POINTER_Y = Y
			},


			getX(TYPE) {
				const X = this.POINTER_X < this.X_MIN ? 0 : this.POINTER_X > this.X_MAX ? this.SLIDER_WIDTH : this.POINTER_X - this.X_MIN

				if (TYPE === 'CONTROL_MIN') {
					return X > this.CONTROL_MAX.X ? this.CONTROL_MAX.X : X
				} else {
					return X < this.CONTROL_MIN.X ? this.CONTROL_MIN.X : X
				}
			},

			getY(TYPE) {
				const Y = this.POINTER_Y < this.Y_MIN ? 0 : this.POINTER_Y > this.Y_MAX ? this.SLIDER_HEIGHT : this.POINTER_Y - this.Y_MIN

				if (TYPE === 'CONTROL_MIN') {
					return Y > this.CONTROL_MAX.Y ? this.CONTROL_MAX.Y : Y
				} else {
					return Y < this.CONTROL_MIN.Y ? this.CONTROL_MIN.Y : Y
				}
			},

			loop() {
				if (this.IS_DESTROYED || !this.IS_LOOPING) return false

				if (this.$currentTarget !== null) {
					const TYPE = this.$currentTarget.__TYPE

					// Horizontal layout
					if (this.direction === 'horizontal') {
						const X = this.getX(TYPE)
						this[TYPE].X += (X - this[TYPE].X) * this.EASE
						this.$currentTarget.style.transform = `translate3d(${this[TYPE].X}px, 0, 0)`
						this.$filled.style.left = `${this.CONTROL_MIN.X}px`
						this.$filled.style.right = `${this.SLIDER_WIDTH - this.CONTROL_MAX.X}px`

						this[TYPE].VALUE = Math.round((this[TYPE].X * this.max / this.SLIDER_WIDTH) / this.step) * this.step
					}

					// Vertical layout
					if (this.direction === 'vertical') {
						const Y = this.getY(TYPE)
						this[TYPE].Y += (Y - this[TYPE].Y) * this.EASE
						this.$currentTarget.style.transform = `translate3d(0, ${this[TYPE].Y}px, 0)`
						this.$filled.style.top = `${this.CONTROL_MIN.Y}px`
						this.$filled.style.bottom = `${this.SLIDER_HEIGHT - this.CONTROL_MAX.Y}px`

						this[TYPE].VALUE = Math.round((this[TYPE].Y * this.max / this.SLIDER_HEIGHT) / this.step) * this.step
					}

					this.emitValue()
				}
				requestAnimationFrame(this.loop.bind(this))
			},

			initPositions() {
				this.CONTROL_MIN.X = this.value[0] * this.SLIDER_WIDTH / this.max
				this.CONTROL_MIN.Y = this.value[0] * this.SLIDER_HEIGHT / this.max
				this.CONTROL_MAX.X = this.value[1] * this.SLIDER_WIDTH / this.max
				this.CONTROL_MAX.Y = this.value[1] * this.SLIDER_HEIGHT / this.max

				if (this.direction === 'horizontal') {
					this.$filled.style.left = `${this.CONTROL_MIN.X}px`
					this.$filled.style.right = `${this.SLIDER_WIDTH - this.CONTROL_MAX.X}px`
					this.CONTROL_MIN.VALUE = Math.round((this.CONTROL_MIN.X * this.max / this.SLIDER_WIDTH) / this.step) * this.step
					this.CONTROL_MAX.VALUE = Math.round((this.CONTROL_MAX.X * this.max / this.SLIDER_WIDTH) / this.step) * this.step
				} else {
					this.$filled.style.top = `${this.CONTROL_MIN.Y}px`
					this.$filled.style.bottom = `${this.SLIDER_HEIGHT - this.CONTROL_MAX.Y}px`
					this.CONTROL_MIN.VALUE = Math.round((this.CONTROL_MIN.Y * this.max / this.SLIDER_HEIGHT) / this.step) * this.step
					this.CONTROL_MAX.VALUE = Math.round((this.CONTROL_MAX.Y * this.max / this.SLIDER_HEIGHT) / this.step) * this.step
				}

				forEach(this.$controls, ($control) => {
					const TYPE = $control.__TYPE;
					if (this.direction === 'horizontal') {
						$control.style.transform = `translate3d(${this[TYPE].X}px, 0, 0)`
					} else {
						$control.style.transform = `translate3d(0, ${this[TYPE].Y}px, 0)`
					}
				})
			}
		},
		watch: {
			IS_LOOPING(newValue) {
				if (newValue) this.loop()
			}
		},
		mounted() {
			this.IS_DESTROYED = false

			this.$slider = this.$el
			this.$filled = this.$el.querySelector('.range-slider__filled')

			this.$controls = this.$el.querySelectorAll('.range-slider__control');
			this.$controls[0].__TYPE = 'CONTROL_MIN'
			this.$controls[1].__TYPE = 'CONTROL_MAX'

			this.saveSizes();
			this.initPositions()

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
		pointer-events: none;

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
