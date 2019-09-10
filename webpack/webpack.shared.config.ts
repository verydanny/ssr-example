import webpack from 'webpack'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { StatsWriterPlugin } from 'webpack-stats-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import { transformStats } from '../bin/transform-stats'

import { WebpackConfig } from '../types/webpack-config'

export const sharedConfig = (env: WebpackConfig) => {
  const { mode } = env
  const _dev_ = mode === 'development'

  return {
    mode,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            // disable type checker - we will use it in fork plugin
            transpileOnly: true
          }
        }
      ]
    },
    optimization: {
      namedChunks: false,
      namedModules: false
    },
    plugins: [
      new CleanWebpackPlugin(),
      !_dev_ &&
        new StatsWriterPlugin({
          fields: null,
          stats: {
            hash: true,
            colors: false,
            chunks: true,
            chunkGroups: true,
            chunkModules: true,
            chunkOrigins: true,
            entrypoints: true,
            assets: true,
            modules: true,
            builtAt: false,
            children: false,
            cached: false,
            errors: false,
            errorDetails: false,
            timings: false,
            version: false,
            warnings: false,
            reasons: false,
            publicPath: true,
            performance: false,
            moduleTrace: true,
            maxModules: Infinity
          },
          transform: function(data: webpack.Stats.ToJsonOutput) {
            return transformStats(data)
          }
        })
    ].filter(Boolean),
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    }
  } as webpack.Configuration
}
