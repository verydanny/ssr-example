module.exports = api => {
  const env = api.env()
  const isServerDev = env === 'development_server'
  const isServerProd = env === 'production_server'
  const isClientDev = env === 'development_client'
  const isClientProd = env === 'production_client'
  const isTest = env === 'test'

  api.cache.using(() => isTest || isClientDev || isServerDev)

  return {
    presets: [
      isTest && [
        '@babel/preset-env',
        {
          targets: {
            node: 'current'
          }
        }
      ],
      (isServerDev || isServerProd) && [
        '@babel/preset-env',
        {
          targets: {
            node: 'current'
          },
          modules: false
        }
      ],
      isClientDev && [
        '@babel/preset-env',
        {
          targets: {
            browsers: 'last 2 Chrome versions'
          },
          modules: false
        }
      ],
      isClientProd && [
        '@babel/preset-env',
        {
          targets: {
            browsers: '>1%, not dead, not ie 11, not op_mini all'
          },
          loose: true,
          modules: false,
          useBuiltIns: 'usage',
          corejs: 3,
          shippedProposals: true
        }
      ],
      '@babel/preset-typescript',
      '@babel/preset-react'
    ].filter(Boolean),
    plugins: [
      (isClientDev || isClientProd) && '@babel/plugin-syntax-dynamic-import',
      (isServerDev || isServerProd || isTest) &&
        'babel-plugin-dynamic-import-node',
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: true }],
      ['@babel/plugin-proposal-optional-chaining', { loose: true }]
    ].filter(Boolean)
  }
}
