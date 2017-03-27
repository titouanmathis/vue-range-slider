import Vue from 'vue'
import RangeSlider from './RangeSlider.vue'

new Vue({
	el: '#app',
	data() {
		return {
			MODELS: [
				{
					MIN: 0,
					MAX: 100,
					VALUE: [15, 50],
					STEP: 1,
					ORIENTATION: 'horizontal'
				},
				{
					MIN: 20,
					MAX: 40,
					VALUE: [22, 36],
					STEP: 1,
					ORIENTATION: 'vertical'
				}
			],
			style: {
				section: {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					minWidth: '250px',
					marginBottom: '1em',
					padding: '3em',
					textAlign: 'center'
				},
				rangeSlider: {
					marginTop: '2em'
				},
				btn: {
					margin: '0 0 2em',
					borderBottom: '1px solid'
				}
			}
		}
	},
	components: {
		RangeSlider
	},
	template: `
<main>
	<section :style="style.section" v-for="MODEL in MODELS">
		<h3 v-html="MODEL.VALUE"></h3>
		<p :style="style.btn" @click="MODEL.VALUE = [MODEL.MIN, MODEL.MAX]">Reset</p>
		<range-slider
			v-model="MODEL.VALUE"
			:min="MODEL.MIN"
			:max="MODEL.MAX"
			:step="MODEL.STEP"
			formatter="{value}€"
			:orientation="MODEL.ORIENTATION"
			:style="style.rangeSlider">
		</range-slider>
	</section>
</main>`
})
