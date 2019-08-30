const webpack = require('webpack')

module.exports = env => {
  const { path } = env
  return {
    name: 'client',
    entry: ['webpack-hot-middleware/client', './src/client/hydrate.tsx'],
    output: {
      path,
      filename: 'client.js',
      publicPath: '/assets/',
      chunkFilename: '[name].[id].js',
      hotUpdateMainFilename: 'hot-update.json',
      hotUpdateChunkFilename: '[id].hot-update.js'
    },
    target: 'web',
    plugins: [new webpack.HotModuleReplacementPlugin()]
  }
}
