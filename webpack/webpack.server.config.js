const { resolve } = require('path')

module.exports = env => {
  const { path } = env

  return {
    name: 'server',
    entry: './src/server/serverEntry.ts',
    target: 'node',
    output: {
      path,
      filename: 'server.js',
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
    }
  }
}
