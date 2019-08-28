module.exports = env => {
  const { path } = env

  return {
    name: 'server',
    entry: './src/server/render.tsx',
    target: 'node',
    output: {
      path,
      filename: 'server.js',
      libraryTarget: 'commonjs2'
    }
  }
}
