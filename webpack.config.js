const path = require('path');
const _ = require('underscore');
const webpack = require('webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const pkg = require('./package.json');

var filename = 'BIGU.js';

const banner = `
${pkg.name} ${pkg.version}
${pkg.description}
Author ${pkg.author.name}
Contributors ${pkg.contributors[0].name}
Released under the ${_.pluck(pkg.licenses, 'type').join(', ')} license.
${_.pluck(pkg.licenses, 'url')}
`;

// production uglify
const uglify = process.argv.indexOf('--uglify') !== -1;
const plugins = [
  new webpack.DefinePlugin({
    LIB_VERSION: JSON.stringify(pkg.version),
  }),
  new webpack.BannerPlugin(banner),
  new CircularDependencyPlugin(),
];

if (uglify) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    minimize: true,
  }));
  filename = 'BIGU.min.js';
}

module.exports = {
  context: './src',
  entry: {
    BIGU: './main.js',
  },
  output: {
    path: 'dist',
    filename,
    library: 'BIGU',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    root: [
      path.resolve('./src'),
    ],
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  module: {
    loaders: [
      {
        // test: /^\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins,
};
