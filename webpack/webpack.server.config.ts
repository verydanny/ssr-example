import { WebpackConfig } from '../types/webpack-config'

export const serverConfig = (env: WebpackConfig) => {
  const { path } = env

  return {
    name: 'server',
    entry: './src/server/entry.ts',
    target: 'node' as const,
    output: {
      path,
      filename: 'server.js',
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
