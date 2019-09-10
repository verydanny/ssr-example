import { resolve } from 'path'
import webpackMerge from 'webpack-merge'
import { clientServerCompiler } from 'webpack-universal-compiler'

import { sharedConfig } from '../webpack/webpack.shared.config'
import { clientConfig } from '../webpack/webpack.client.config'
import { serverConfig } from '../webpack/webpack.server.config'

const env = {
  mode: 'production',
  devtool: 'cheap-module-eval-source-map',
  path: resolve(process.cwd(), 'dist')
} as const

const clientConfigMerged = webpackMerge(sharedConfig(env), clientConfig(env))
const serverConfigMerged = webpackMerge(sharedConfig(env), serverConfig(env))

const compiler = clientServerCompiler(clientConfigMerged, serverConfigMerged)

compiler.run()
