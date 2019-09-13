import webpack from 'webpack'
import { WebpackConfig } from '../types/webpack-config'
import { resolve } from 'path'
import { UniversalStatsPlugin } from './transform-stats'

export const serverConfig = (env: WebpackConfig) => {
  const { path, mode } = env
  const _dev_ = mode === 'development'
  const _prod_ = mode === 'production'

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
      libraryTarget: 'commonjs2'
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
    },
    plugins: [
      _prod_ &&
        new UniversalStatsPlugin({
          env: 'server'
        })
    ].filter(Boolean)
  } as webpack.Configuration
}
