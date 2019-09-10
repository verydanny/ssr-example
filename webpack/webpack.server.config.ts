import webpack from 'webpack'
import { WebpackConfig } from '../types/webpack-config'
import { resolve } from 'path'

export const serverConfig = (env: WebpackConfig) => {
  const { path, mode } = env

  return {
    name: 'server',
    devtool: mode === 'development' ? 'inline-source-map' : 'source-map',
    entry: './src/server/entry.ts',
    target: 'node' as const,
    output: {
      path: resolve(path, 'server/'),
      filename: 'server.js',
      chunkFilename: '[id].js',
      pathinfo: false,
      libraryTarget: 'commonjs2' as const
    },
    module: {
      rules: [
        {
          // For CSS modules
          test: /\.css$/i,
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                onlyLocals: true
              }
            }
          ]
        }
      ]
    }
  } as webpack.Configuration
}
