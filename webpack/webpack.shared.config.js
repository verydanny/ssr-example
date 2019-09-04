const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = env => {
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
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({
        eslint: true,
        formatter: 'codeframe',
        useTypescriptIncrementalApi: true
      })
    ]
  }
}
