import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import { warmup } from 'thread-loader'

import { WebpackConfig } from '../types/webpack-config'

export const sharedConfig = (env: WebpackConfig) => {
  const { mode } = env
  const _prod_ = mode === 'production'

  warmup({}, ['ts-loader'])

  return {
    mode,
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            _prod_ && 'thread-loader',
            {
              loader: 'ts-loader',
              options: {
                // disable type checker - we will use it in fork plugin
                transpileOnly: true,
                happyPackMode: true
              }
            }
          ].filter(Boolean)
        }
      ]
    },
    optimization: {
      namedChunks: false,
      namedModules: false
    },
    plugins: [new CleanWebpackPlugin()].filter(Boolean),
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    }
  } as webpack.Configuration
}
