import webpack from 'webpack'
import { WebpackConfig } from '../types/webpack-config'
import { resolve } from 'path'
import nodeExternals from 'webpack-node-externals'

export const serverConfig = (env: WebpackConfig) => {
  const { path, target, mode } = env
  const _dev_ = mode === 'development'
  const _prod_ = mode === 'production'

  return {
    entry: './src/server/entry.ts',
    devtool: _dev_ ? 'inline-cheap-module-source-map' : 'source-map',
    output: {
      path: resolve(path, 'server/'),
      filename: `${target}.js`,
      chunkFilename: '[id].js',
      pathinfo: _prod_,
      hotUpdateMainFilename: 'hot-update.json',
      hotUpdateChunkFilename: '[id].hot-update.js',
      libraryTarget: 'commonjs2'
    },
    externals: [
      nodeExternals({
        whitelist: ['webpack/hot']
      })
    ],
    target: 'node',
    module: {
      rules: [
        {
          // For CSS modules
          test: /\.css$/i,
          exclude: /node_modules/,
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                onlyLocals: true
              }
            }
          ].filter(Boolean)
        }
      ]
    },
    plugins: [_dev_ && new webpack.HotModuleReplacementPlugin()].filter(Boolean)
  } as webpack.Configuration
}
