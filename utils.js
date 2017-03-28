var ExtractTextPlugin = require('extract-text-webpack-plugin')

exports.cssLoaders = function (options) {

	// Simple configuration for the dev env
	if (process.env.NODE_ENV === 'development') {
		return {
			// Since sass-loader (weirdly) has SCSS as its default parse mode, we map
			// the "scss" and "sass" values for the lang attribute to the right configs here.
			// other preprocessors should work out of the box, no loader config like this necessary.
			scss: 'vue-style-loader!css-loader!sass-loader',
			sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
		}
	}


	options = options || {}

	var cssLoader = {
		loader: 'css-loader',
		options: {
			minimize: process.env.NODE_ENV === 'production',
			sourceMap: options.sourceMap
		}
	}

	// generate loader string to be used with extract text plugin
	function generateLoaders (loader, loaderOptions) {
		var loaders = [cssLoader]
		if (loader) {
			loaders.push({
				loader: loader + '-loader',
				options: Object.assign({}, loaderOptions, {
					sourceMap: options.sourceMap
				})
			})
		}

		// Extract CSS when that option is specified
		// (which is the case during production build)
		if (options.extract) {
			return ExtractTextPlugin.extract({
				use: loaders,
				fallback: 'vue-style-loader'
			})
		} else {
			return ['vue-style-loader'].concat(loaders)
		}
	}

	// https://vue-loader.vuejs.org/en/configurations/extract-css.html
	return {
		css: generateLoaders(),
		postcss: generateLoaders(),
		less: generateLoaders('less'),
		sass: generateLoaders('sass', { indentedSyntax: true }),
		scss: generateLoaders('sass'),
		stylus: generateLoaders('stylus'),
		styl: generateLoaders('stylus')
	}
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
	var output = []
	var loaders = exports.cssLoaders(options)
	for (var extension in loaders) {
		var loader = loaders[extension]
		output.push({
			test: new RegExp('\\.' + extension + '$'),
			use: loader
		})
	}
	return output
}
