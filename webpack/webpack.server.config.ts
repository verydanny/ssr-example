import webpack from 'webpack'
import { WebpackConfig } from '../types/webpack-config'
import { resolve } from 'path'

export const serverConfig = (env: WebpackConfig) => {
  const { path, target, mode } = env
  const _dev_ = mode === 'development'
  const _prod_ = mode === 'production'

  return {
    entry: './src/server/entry.ts',
    output: {
      path: resolve(path, 'server/'),
      filename: _prod_ ? `${target}.[hash].js` : `${target}.js`,
      chunkFilename: _prod_ ? '[id].[hash].js' : '[id].js',
      pathinfo: _prod_,
      libraryTarget: 'commonjs2'
    },
    module: {
      rules: [
        {
          // For CSS modules
          test: /\.css$/i,
          exclude: /node_modules/,
          use: [
            _prod_ && 'cache-loader',
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
    plugins: [].filter(Boolean)
  } as webpack.Configuration
}
