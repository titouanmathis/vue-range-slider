import Vue from 'vue'
import RangeSlider from './RangeSlider.vue'

new Vue({
	el: '#app',
	data() {
		return {
			MODEL: [15, 50],
			MODEL2: [ 100, 400 ]
		}
	},
	components: {
		RangeSlider
	},
	template: `
<main>
	<h3 v-html="MODEL"></h3>
	<range-slider
		v-model="MODEL"
		:min="0"
		:max="100"
		:step="1"
		:reverse="false"
		formatter="{value}€"
		direction="horizontal">
	</range-slider>


	<br>
	<br>
	<br>
	<br>
	<h3 v-html="MODEL2"></h3>
	<range-slider
		v-model="MODEL2"
		:min="100"
		:max="500"
		:step="1"
		:reverse="false"
		formatter="{value}€"
		direction="horizontal">
	</range-slider>
</main>`
})
