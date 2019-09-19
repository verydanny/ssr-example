import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import { UniversalStatsPlugin } from './transform-stats'

import { WebpackConfig } from '../types/webpack-config'

export const sharedConfig = (env: WebpackConfig) => {
  const { mode, target } = env
  const _client_ = target === 'client'
  const _server_ = target === 'server'
  const _prod_ = mode === 'production'
  const _dev_ = mode === 'development'

  return {
    name: target,
    mode,
    devtool:
      _dev_ && _server_
        ? 'inline-source-map'
        : _prod_ && _server_
        ? 'source-map'
        : _dev_ && _client_
        ? 'cheap-module-eval-source-map'
        : 'source-map',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                // disable type checker - we will use it in fork plugin
                transpileOnly: true
              }
            }
          ].filter(Boolean)
        }
      ]
    },
    optimization: {
      namedChunks: false,
      namedModules: false,
      removeEmptyChunks: _prod_,
      mergeDuplicateChunks: _prod_,
      providedExports: _prod_
    },
    plugins: [
      new CleanWebpackPlugin(),
      new UniversalStatsPlugin({
        env: target,
        module: false
      })
    ].filter(Boolean),
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    }
  } as webpack.Configuration
}
