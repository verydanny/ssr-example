import { WebpackConfig } from '../types/webpack-config'
import { resolve } from 'path'

export const serverConfig = (env: WebpackConfig) => {
  const { path } = env

  return {
    name: 'server',
    entry: './src/server/entry.ts',
    target: 'node' as const,
    output: {
      path: resolve(path, 'server/'),
      filename: 'server.js',
      chunkFilename: '[id].js',
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
  }
}
