import Vue from 'vue'
import RangeSlider from './RangeSlider.vue'

new Vue({
	el: '#app',
	data() {
		return {
			MODEL_HORIZONTAL: [15, 50],
			MODEL_VERTICAL: [3, 12],
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
	<section :style="style.section">
		<h3 v-html="MODEL_HORIZONTAL"></h3>
		<p :style="style.btn" @click="MODEL_HORIZONTAL = [0, 100]">Reset</p>
		<range-slider
			v-model="MODEL_HORIZONTAL"
			:min="0"
			:max="100"
			:step="1"
			formatter="{value}€"
			orientation="horizontal"
			:style="style.rangeSlider">
		</range-slider>
	</section>
	<section :style="style.section">
		<h3 v-html="MODEL_VERTICAL"></h3>
		<p :style="style.btn" @click="MODEL_VERTICAL = [0, 20]">Reset</p>
		<range-slider
			v-model="MODEL_VERTICAL"
			:min="0"
			:max="20"
			:step="0.1"
			:lazy="true"
			formatter="{value}kg"
			orientation="vertical">
		</range-slider>
	</section>
</main>`
})
