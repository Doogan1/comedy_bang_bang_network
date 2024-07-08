const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'), // Ensure this points to 'build'
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
  devServer: {
    static: './build', // Ensure this matches your output directory
    hot: true,
    port: 3000,
    historyApiFallback: true,
    proxy: [{
      context: ['/api'],
      target: 'http://localhost:8000',
      secure: false,
      changeOrigin: true
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
