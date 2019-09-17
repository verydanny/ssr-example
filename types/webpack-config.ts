export interface WebpackConfig {
  mode: 'development' | 'production'
  path: string
  target: 'server' | 'client'
}
