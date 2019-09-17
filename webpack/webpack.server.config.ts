import webpack from 'webpack'
import { WebpackConfig } from '../types/webpack-config'
import { resolve } from 'path'

export const serverConfig = (env: WebpackConfig) => {
  const { path, target } = env

  return {
    entry: './src/server/entry.ts',
    output: {
      path: resolve(path, 'server/'),
      filename: `${target}.js`,
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
    plugins: [].filter(Boolean)
  } as webpack.Configuration
}
