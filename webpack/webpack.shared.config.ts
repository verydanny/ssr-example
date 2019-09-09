import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'

import { WebpackConfig } from '../types/webpack-config'

export const sharedConfig = (env: WebpackConfig) => {
  const { mode, devtool } = env

  return {
    mode,
    devtool,
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
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    }
    // plugins: [
    //   new ForkTsCheckerWebpackPlugin({
    //     eslint: true,
    //     formatter: 'codeframe',
    //     useTypescriptIncrementalApi: true
    //   })
    // ]
  }
}
