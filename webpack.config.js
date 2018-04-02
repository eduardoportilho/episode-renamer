const path = require('path');
const webpack = require('webpack');
const PermissionsOutputPlugin = require('webpack-permissions-plugin');

const config = {
  entry: ['babel-polyfill', './src/index.js'],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, use: 'babel-loader' }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({banner: '#!/usr/bin/env node', raw: true }),
    new PermissionsOutputPlugin({
      buildFiles: [
        {
          path: path.resolve(__dirname, 'build/bundle.js'),
          fileMode: '755'
        }
      ]
    })
  ],
  mode: 'development',
  target: 'node'
};

module.exports = config;
