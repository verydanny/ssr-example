const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = env => {
  const { path, mode } = env
  return {
    name: 'client',
    entry: ['webpack-hot-middleware/client', './src/client/hydrate.tsx'],
    output: {
      path,
      filename: 'client.js',
      publicPath: '/assets/',
      chunkFilename: '[id].js',
      hotUpdateMainFilename: 'hot-update.json',
      hotUpdateChunkFilename: '[id].hot-update.js'
    },
    target: 'web',
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // all options are optional
        filename: 'client.css',
        chunkFilename: '[id].css',
        ignoreOrder: false // Enable to remove warnings about conflicting order
      })
    ],
    module: {
      rules: [
        {
          // For CSS modules
          test: /\.css$/i,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: mode === 'development'
              }
            },
            {
              loader: 'css-loader',
              options: {
                modules: true
              }
            }
          ]
        }
      ]
    }
  }
}
