/**
 * Maintain Webpack 5 compatibility
 */
const path = require('path')
const webpack = require('webpack')

const overrideWebpackConfig = ({ context, webpackConfig, pluginOptions }) => {
  // Add buffer to Webpack 5 polyfill
  // https://github.com/diegomura/react-pdf/issues/1029
  webpackConfig.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  )
  webpackConfig.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  )
  // Add polyfill libraries
  webpackConfig.resolve.fallback = {
    // For WASM
    stream: require.resolve('stream-browserify'),
    // For Ethereum Web3
    os: require.resolve('os-browserify/browser'),
    http: require.resolve('stream-http'),
    crypto: require.resolve('crypto-browserify'),
    https: require.resolve('https-browserify'),
    path: require.resolve('path-browserify'),
    fs: false,
    buffer: require.resolve("buffer/"),
    util: require.resolve("util/"),
    zlib: require.resolve('zlib-browserify'),
    // process: require.resolve('process/browser'),
  }
  // Fix unrecognized change / caching problem
  webpackConfig.cache.buildDependencies.config.push(
    path.join(context.paths.appPath, './craco.config.js'),
  )
  // Fix "fully specified"
  // https://github.com/webpack/webpack/issues/11467#issuecomment-808618999/
  webpackConfig.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  })
  return webpackConfig
}

module.exports = { overrideWebpackConfig }
