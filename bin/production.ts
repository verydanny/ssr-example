import { resolve } from 'path'
import webpackMerge from 'webpack-merge'
import { universalCompiler } from 'webpack-universal-compiler'

import { sharedConfig } from '../webpack/webpack.shared.config'
import { clientConfig } from '../webpack/webpack.client.config'
import { serverConfig } from '../webpack/webpack.server.config'

const env = {
  mode: 'production',
  path: resolve(process.cwd(), 'dist')
} as const

const clientEnv = {
  ...env,
  target: 'client' as const
}

const serverEnv = {
  ...env,
  target: 'server' as const
}

const defaultStatsOptions = {
  assets: true,
  children: false,
  chunks: false,
  colors: true,
  hash: false,
  modules: false,
  timings: false,
  version: false,
  builtAt: false,
  entrypoints: false
}

const clientConfigMerged = webpackMerge.smart(
  sharedConfig(clientEnv),
  clientConfig(clientEnv)
)

const serverConfigMerged = webpackMerge(
  sharedConfig(serverEnv),
  serverConfig(serverEnv)
)

const compiler = universalCompiler(clientConfigMerged, serverConfigMerged)

compiler
  .run()
  .then(({ clientStats, serverStats }) => {
    if (clientStats && serverStats) {
      const clientInfo = clientStats.toString(defaultStatsOptions)
      const serverInfo = serverStats.toString(defaultStatsOptions)

      if (serverStats.hasErrors() || clientStats.hasErrors()) {
        console.log(clientInfo || serverInfo)
      }

      console.log(
        '\n\nClient: \n\n',
        clientInfo,
        '\n\n',
        'Server: \n\n',
        serverInfo,
        '\n\n'
      )
    }
  })
  .catch(e => console.log(e))
