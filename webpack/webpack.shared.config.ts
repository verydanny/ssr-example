import webpack from 'webpack'
import * as path from 'path'
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
          loader: 'babel-loader',
          exclude: /node_modules/,
          include: path.resolve(__dirname, '../src'),
          options: {
            cacheDirectory: false,
            envName: _client_
              ? _dev_
                ? 'development_client'
                : 'production_client'
              : _server_ && _dev_
              ? 'development_server'
              : 'production_server'
          }
        },
        {
          test: /\.svg$/,
          exclude: /node_modules/,
          use: [
            'svg-sprite-loader',
            {
              loader: 'svgo-loader',
              options: {
                plugins: [
                  { removeAttrs: { attrs: 'fill' } },
                  { removeTitle: true },
                  { removeStyleElement: true },
                  { removeXMLNS: true },
                  { removeUselessStrokeAndFill: false }
                ]
              }
            }
          ]
        }
      ]
    },
    optimization: {
      namedChunks: false,
      namedModules: true,
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
