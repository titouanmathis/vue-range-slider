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
		<div class="range-slider">
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
				MAX: this.value[1]
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
			}



			/**
			 * Dispatch events to their handler
			 *
			 * @param  {Object} e The event's object
			 */
			handleEvent(e) {
				try {
					this[`${e.type}Handler`](e)
				} catch(e) {}
			}


			mousedownHandler(e) {

			},


			mouseupHandler(e) {

			},


			touchstartHandler(e) {

			},

			touchendHandler(e) {

			}
		}
	}
</script>

<style lang="scss">

	.range-slider {
		position: relative;
		width: 100%;
		height: 6px;
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
		top: 50%;
		left: 0;
		width: $width;
		height: $height;
		margin-top: $height * -0.5;
		margin-left: $width * -0.5;
		background: #fff;
	}


	.range-slider__control--min {
		transform: translateX(40px);
	}

	.range-slider__control--max {
		transform: translateX(270px);
	}


	.range-slider__tooltip {
		$width: 3em;

		position: absolute;
		bottom: 100%;
		left: 50%;
		width: $width;
		margin-left: $width * -0.5;
		text-align: center;

		pointer-events: none;
	}
</style>
