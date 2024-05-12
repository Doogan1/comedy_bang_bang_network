const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // Entry point of your application
  entry: './src/index.js',

  // Where to output the bundle
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  // Define how different types of modules will be treated
  module: {
    rules: [
      {
        test: /\.js$/, // Apply this rule to files ending in .js
        exclude: /node_modules/, // Do not apply to files within node_modules
        use: {
          loader: 'babel-loader', // Use babel-loader to transform these files
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'] // Presets used for React and modern JavaScript
          }
        }
      },
      {
        test: /\.css$/, // Apply this rule to files ending in .css
        use: ['style-loader', 'css-loader'] // Use these loaders to deal with CSS files
      }
    ]
  },

  // Optional: Configure how source maps are generated
  devtool: 'inline-source-map',

  // Optional: Setup development server
  devServer: {
    static: './dist',
    hot: true,
    port: 3000, // You can specify a port that doesn't conflict with Django
},

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html' // Path to your template file
    })
  ]
};
