import webpack from 'webpack'
import { resolve } from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CompressionPlugin from 'compression-webpack-plugin'
import { UniversalStatsPlugin } from './transform-stats'
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { WebpackConfig } from '../types/webpack-config'

export const clientConfig = (env: WebpackConfig) => {
  const { path, mode } = env
  const _dev_ = mode === 'development'
  const _prod_ = mode === 'production'

  return {
    name: 'client',
    devtool:
      mode === 'development' ? 'cheap-module-eval-source-map' : 'source-map',
    entry: [
      _dev_ && 'webpack-hot-middleware/client?reload=true&noInfo=true',
      './src/client/entry.tsx'
    ].filter(Boolean),
    output: {
      path: resolve(path, 'client/'),
      filename: 'client.js',
      publicPath: '/assets/',
      chunkFilename: '[name].[hash:5].js',
      pathinfo: false,
      hotUpdateMainFilename: 'hot-update.json',
      hotUpdateChunkFilename: '[id].hot-update.js'
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: false,
          default: false,
          vendorReactDom: {
            test: /node_modules\/react-dom\//,
            name: 'react-dom',
            priority: 10
          }
        }
      }
    },
    target: 'web' as const,
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
    },
    plugins: [
      _dev_ && new webpack.HotModuleReplacementPlugin(),
      _prod_ && new CompressionPlugin(),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // all options are optional
        filename: 'client.css',
        chunkFilename: '[id].css',
        ignoreOrder: false // Enable to remove warnings about conflicting order
      }),
      _prod_ &&
        new UniversalStatsPlugin({
          env: 'client'
        })
    ].filter(Boolean)
  } as webpack.Configuration
}
