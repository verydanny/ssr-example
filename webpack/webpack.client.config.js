const path = require('path')

module.exports = env => {
  return {
    name: 'client',
    entry: './src/client/hydrate.tsx',
    target: 'web'
  }
}
