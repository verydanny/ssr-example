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
    }
  }
}
