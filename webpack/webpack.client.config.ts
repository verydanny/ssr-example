import webpack from 'webpack'
import { resolve } from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { StatsWriterPlugin } from 'webpack-stats-plugin'
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

import { WebpackConfig } from '../types/webpack-config'

export const clientConfig = (env: WebpackConfig) => {
  const { path, mode } = env
  const _dev_ = mode === 'development'

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
      chunkFilename: '[id].js',
      pathinfo: false,
      hotUpdateMainFilename: 'hot-update.json',
      hotUpdateChunkFilename: '[id].hot-update.js'
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    },
    target: 'web' as const,
    plugins: [
      // new StatsWriterPlugin({
      //   fields: null,
      //   stats: {
      //     hash: true,
      //     colors: false,
      //     chunks: true,
      //     chunkGroups: true,
      //     chunkModules: true,
      //     chunkOrigins: true,
      //     entrypoints: true,
      //     assets: true,
      //     modules: true,
      //     builtAt: false,
      //     children: false,
      //     cached: false,
      //     errors: false,
      //     errorDetails: false,
      //     timings: false,
      //     version: false,
      //     warnings: false,
      //     reasons: false,
      //     publicPath: true,
      //     performance: false,
      //     moduleTrace: true
      //   }
      // }),
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
  } as webpack.Configuration
}
