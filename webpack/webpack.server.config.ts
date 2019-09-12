import webpack from 'webpack'
import { WebpackConfig } from '../types/webpack-config'
import { resolve } from 'path'

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { StatsWriterPlugin } from 'webpack-stats-plugin'
import { transformServerStats } from '../bin/transform-stats'

export const serverConfig = (env: WebpackConfig) => {
  const { path, mode } = env
  const _dev_ = mode === 'development'

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
          transform: transformServerStats
        })
    ]
  } as webpack.Configuration
}
