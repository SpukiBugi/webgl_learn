const path = require('path');
const webpack = require('webpack');

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ImageminPlugin = require("imagemin-webpack");
const CopyPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
// var locals = { /* ... */ };

// var html = template(locals);

/*
 * We've enabled HtmlWebpackPlugin for you! This generates a html
 * page for you when you compile webpack, which will make you start
 * developing and prototyping faster.
 *
 * https://github.com/jantimon/html-webpack-plugin
 *
 */

module.exports = {
	mode: 'development',
	entry: ['./src/js/index.js', './src/scss/index.scss'],

	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'public')
	},

	plugins: [
		new webpack.ProgressPlugin(),
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: "./index.html",
			// filename: "./index.html",
		}),
		new MiniCssExtractPlugin({
			filename: 'index.css',
			chunkFilename: 'index.css'
		}),
		new ImageminPlugin({
      bail: false,
      cache: true,
      imageminOptions: {
        plugins: [
          ["optipng", { optimizationLevel: 5 }],
        ]
      }
		}),
		new CopyPlugin([
			{ from: 'src/img', to: 'img' },
		]),
		new WriteFilePlugin(),
		new VueLoaderPlugin(),
	],

	module: {
		rules: [
			{
				test: /.(js|jsx)$/,
				include: [path.resolve(__dirname, 'src')],
				loader: 'babel-loader',

				options: {
					plugins: ['@babel/syntax-dynamic-import'],

					presets: [
						[
							'@babel/preset-env',
							{
								modules: false
							}
						]
					]
				}
			},
			{
				test: /\.s(a|c)ss$/,
				include: [path.resolve(__dirname, 'src')],
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
			},
			{
				test: /\.html$/,
				include: [path.resolve(__dirname, 'src')],
				use: [
					{
						loader: "html-loader",
						options: { minimize: true }
					}
				]
			},
			{
        test: /\.(jpe?g|png|gif|svg)$/i,
				include: [path.resolve(__dirname, 'src/img')],
        use: [
          {
						loader: "file-loader", // Or `url-loader` or your other loader
						options: {
							context: [path.resolve(__dirname, 'src')],
							name: '[name].[ext]',
							outputPath: 'img',
							publicPath: 'public'
            },
          }
        ]
			},
			{
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
			},
			{
        test: /\.vue$/,
        use: 'vue-loader'
			},
			{
				test: /\.(frag|vert|glsl)$/,
				use: [
					{ 
						loader: 'glsl-shader-loader',
						options: {}  
					}
				]
			}
		]
	},

	optimization: {
		splitChunks: {
			cacheGroups: {
				vendors: {
					priority: -10,
					test: /[\\/]node_modules[\\/]/
				}
			},

			chunks: 'async',
			minChunks: 1,
			minSize: 30000,
			name: true
		}
	},

	devServer: {
		open: true
	},

	resolve: {
		extensions: ['.js', '.jsx', '.scss']
	},

  devServer: {
    contentBase: path.join(__dirname, 'public'),
		compress: true,
		hot: true,
    port: 8080
  }
};