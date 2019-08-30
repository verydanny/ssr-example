module.exports = env => {
  const { path } = env
  return {
    name: 'client',
    entry: './src/client/hydrate.tsx',
    output: {
      path,
      filename: 'client.js',
      publicPath: '/assets/'
    },
    target: 'web'
  }
}
