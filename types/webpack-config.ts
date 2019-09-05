export interface WebpackConfig {
  mode: 'development' | 'production'
  devtool: 'cheap-module-eval-source-map' | 'source-map'
  path: string
}
