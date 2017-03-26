import Vue from 'vue'
import RangeSlider from './RangeSlider.vue'

new Vue({
	el: '#app',
	data() {
		return {
			MODEL: [15, 50],
			MODEL2: [3, 12],
			style: {
				section: {
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					marginBottom: '1em',
					padding: '3em',
					textAlign: 'center'
				},
				rangeSlider: {
					marginTop: '2em'
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
		<h3 v-html="MODEL"></h3>
		<range-slider
			v-model="MODEL"
			:min="0"
			:max="100"
			:step="5"
			formatter="{value}€"
			orientation="horizontal"
			:style="style.rangeSlider">
		</range-slider>
	</section>
	<section :style="style.section">
		<h3 v-html="MODEL2"></h3>
		<range-slider
			v-model="MODEL2"
			:min="0"
			:max="20"
			:step="1"
			formatter="{value}kg"
			orientation="vertical">
		</range-slider>
	</section>
</main>`
})
