module.exports = api => {
  const isServerDev = api.env() === 'development_server'
  const isServerProd = api.env() === 'production_server'
  const isClientDev = api.env() === 'development_client'
  const isClientProd = api.env() === 'production_client'

  return {
    presets: [
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
            browsers: 'last 2 Chrome versions'
          },
          modules: false
        }
      ],
      '@babel/preset-typescript',
      '@babel/preset-react'
    ].filter(Boolean),
    plugins: [
      (isClientDev || isClientProd) && '@babel/plugin-syntax-dynamic-import',
      (isServerDev || isServerProd) && 'babel-plugin-dynamic-import-node',
      ['@babel/plugin-proposal-class-properties', { loose: true }]
    ].filter(Boolean)
  }
}
