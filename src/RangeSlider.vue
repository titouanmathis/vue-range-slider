<template>
	<div>

	<p>
		<label for="min">MIN => <span v-html="MIN"></span></label>
		<br>
		<input id="min" type="range" :min="min" :max="MAX" :step="step" :value="value[0]" v-model="MIN" @input="emitValue">
	</p>

	<p>
		<label for="max">MAX => <span v-html="MAX"></span></label>
		<br>
		<input id="max" type="range" :min="MIN" :max="max" :step="step" :value="value[1]" v-model="MAX" @input="emitValue">
	</p>

	<p>&nbsp;</p>

	<p>
		<div class="range-slider" :class="`range-slider--${direction}`">
			<div class="range-slider__track"></div>
			<div class="range-slider__control range-slider__control--min">
				<span class="range-slider__tooltip" v-html="formatValue(MIN)"></span>
			</div>
			<div class="range-slider__control range-slider__control--max">
				<span class="range-slider__tooltip" v-html="formatValue(MAX)"></span>
			</div>
		</div>

	</p>

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
				default: 10
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
				X_MAX: 0,
				X: 0,
				Y_MIN: 0,
				Y_MAX: 0,
				Y: 0,
				SLIDER_WIDTH: 0,
				SLIDER_HEIGHT: 0,
				EVENTS: [
					'mousedown',
					'touchstart',
				],
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
				this.$emit('input', [Number(this.MIN), Number(this.MAX)]);
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
				const SIZES = this.$slider.getBoundingClientRect()

				this.SLIDER_WIDTH = SIZES.width
				this.SLIDER_HEIGHT = SIZES.height

				this.X_MIN = SIZES.left
				this.X_MAX = SIZES.left + SIZES.width

				this.Y_MIN = SIZES.top
				this.Y_MAX = SIZES.top + SIZES.height
			},

			resizeHandler(e) {
				this.saveSizes()
			},

			mousedownHandler({ target, clientX , clientY }) {
				this.updatePointerPosition(clientX, clientY);
				document.addEventListener('mousemove', this);
				document.addEventListener('mouseup', this);
				this.X = this.getX()
				this.Y = this.getY()
				this.$currentTarget = target
				this.IS_LOOPING = true
			},


			mouseupHandler(e) {
				document.removeEventListener('mousemove', this);
				document.removeEventListener('mouseup', this);
				this.$currentTarget = null
				this.IS_LOOPING = false
			},


			mousemoveHandler({ clientX , clientY }) {
				this.updatePointerPosition(clientX, clientY);
			},

			touchstartHandler(e) {
				this.$doc.addEventListener('touchmove', this)
			},

			touchendHandler(e) {
				this.$doc.removeEventListener('touchmove', this)
			},

			touchmoveHandler({ touches }) {
				const touch = touches[0]
				this.updatePointerPosition(touch.clientX, touch.clientY)
			},

			updatePointerPosition(X, Y) {
				this.POINTER_X = X
				this.POINTER_Y = Y
			},


			getX() {
				return this.POINTER_X < this.X_MIN ? 0 : this.POINTER_X > this.X_MAX ? this.SLIDER_WIDTH : this.POINTER_X - this.X_MIN
			},

			getY() {
				return this.POINTER_Y < this.Y_MIN ? 0 : this.POINTER_Y > this.Y_MAX ? this.SLIDER_HEIGHT : this.POINTER_Y - this.Y_MIN
			},

			loop() {
				if (this.IS_DESTROYED || !this.IS_LOOPING) return false

				// Horizontal layout
				if (this.$currentTarget !== null && this.direction === 'horizontal') {
					const X = this.getX()
					this.X += (X - this.X) * this.EASE
					this.$currentTarget.style.transform = `translate(${this.X}px, 0)`
				}

				// Vertical layout
				if (this.$currentTarget !== null && this.direction === 'vertical') {
					const Y = this.getY()
					this.Y += (Y - this.Y) * this.EASE
					this.$currentTarget.style.transform = `translate(0, ${this.Y}px)`
				}
				requestAnimationFrame(this.loop.bind(this))
			}
		},
		watch: {
			POINTER(newValue) {
				console.log(newValue);
			},
			IS_LOOPING(yes) {
				if (yes) this.loop()
			}
		},
		mounted() {
			this.IS_DESTROYED = false
			this.$slider = this.$el.querySelector('.range-slider')
			this.$controls = this.$el.querySelectorAll('.range-slider__control');

			forEach(this.$controls, ($control, index) => {
				forEach(this.EVENTS, (EVENT) => {
					$control.addEventListener(EVENT, this)
				})
			})
			this.saveSizes();
		},
		beforeDestroy() {
			this.IS_DESTROYED = true
			forEach(this.$controls, ($control, index) => {
				forEach(this.EVENTS, (EVENT) => {
					$control.removeEventListener(EVENT, this)
				})
			})
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
			bottom: 100%;
			left: 50%;
			text-align: center;
			transform: translate(-50%, 0);
		}

		.range-slider--vertical & {
			top: 50%;
			left: 100%;
			transform: translate(0, -50%);
		}
	}
</style>
