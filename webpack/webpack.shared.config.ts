import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'

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
    plugins: [new CleanWebpackPlugin()].filter(Boolean),
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    }
  } as webpack.Configuration
}
