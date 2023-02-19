const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

let apiAddress = process.env.API_ADDRESS;
if (!apiAddress) {
  console.error('Missing environment API_ADDRESS, using default 127.0.0.1:8080');
  apiAddress = '127.0.0.1:8080';
}
console.log("Using proxy to API on address " + apiAddress);

module.exports = {
  devServer: {
    historyApiFallback: true
  },
  devtool: 'source-map',
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(@material)\/).*/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [
              ["@babel/plugin-proposal-decorators", { decoratorsBeforeExport: true }],
              ["@babel/plugin-proposal-class-properties", { "loose": true }],
              ["template-html-minifier", {
                "modules": {
                  "lit": ["html"],
                  "lit-html": ["html"],
                  "lit-element": [
                    "html",
                    {"name": "css", "encapsulation": "style"}
                  ],
                },
                "strictCSS": true,
                "htmlMinifier": {
                  "collapseWhitespace": true,
                  "conservativeCollapse": true,
                  "removeComments": true,
                  "caseSensitive": true,
                  "minifyCSS": true
                }
              }]
            ]
          }
        }
      },
      {
        test: /\.s?css$/,
        use: [
          {
            loader: 'lit-scss-loader',
            options: {
              minify: true,
            },
          },
          'extract-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false
            }
          },
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunksSortMode: 'none',
      template: 'index.html'
    }),
    new CopyPlugin({
      patterns: [
        { from: "node_modules/material-icons/iconfont/material-icons.woff2", to: "material-icons.woff2" }
      ]
    }),
    new CompressionPlugin({
      test: /\.(js|html)$/,
    })
  ],
  resolve: {
    alias: {
      '@material': path.resolve(__dirname, 'node_modules/@material')
    }
  },
  devServer: {
    proxy: {
      '/api': 'http://' + apiAddress,
      '/wsApi': {
        target: 'ws://' + apiAddress,
        ws: true
      }
    }
  }
};