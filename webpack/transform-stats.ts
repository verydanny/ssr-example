import webpack from 'webpack'
import fs from 'fs'
import path from 'path'

function ensureDirSync(dirpath: string) {
  try {
    fs.mkdirSync(dirpath, { recursive: true })
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

interface UniversalStatsPluginOptions {
  env?: 'client' | 'server'
  path?: string | false
  filename?: string
}

interface Files {
  js: string[]
  css: string[]
}

interface Entry {
  [x: string]: Files
}

interface WebpackStubbedModule {
  id: number
  name: string
  files: Files
}

interface Stats {
  [x: string]: {
    name?: string
    files: Files
  }
}

const defaultOptions = {
  env: undefined,
  path: undefined,
  filename: 'stats.json'
}

export function buildStats(
  compilation: webpack.compilation.Compilation,
  env: 'client' | 'server'
) {
  const { chunkGroups } = compilation
  const entry: Entry = {}
  const moduleArray: WebpackStubbedModule[] = []
  const stats: Stats = {}

  for (const chunkGroup of chunkGroups) {
    const chunkGroupFiles = chunkGroup.getFiles()
    const files = {
      js: chunkGroupFiles.filter((file: string) => /\.js$/.test(file)),
      css: chunkGroupFiles.filter((file: string) => /\.css$/.test(file))
    }

    // Get chunks for entrypoint
    if (chunkGroup.constructor.name === 'Entrypoint') {
      entry[chunkGroup.name] = files
    }

    // There are 2 kinds of ChunkGroups. EntryPoints (top level) and
    // ChunkGroups, which is what splits off when you use import()
    if (chunkGroup.constructor.name === 'ChunkGroup') {
      for (const chunk of chunkGroup.chunks) {
        const modulesInCurrentChunk = chunk.getModules()

        for (const module of modulesInCurrentChunk) {
          if (module.rawRequest) {
            moduleArray.push({
              id: module.id,
              name: module.rawRequest,
              files
            })
          } else if (
            !module.rawRequest &&
            module.constructor.name === 'ConcatenatedModule'
          ) {
            moduleArray.push({
              id: module.id,
              name: module.rootModule.rawRequest,
              files
            })
          }
        }
      }
    }
  }

  for (const { id, name, files } of moduleArray) {
    if (env === 'client') {
      stats[name] = {
        files
      }
    } else if (env === 'server') {
      stats[id] = {
        name,
        files
      }
    }
  }

  return { entry, stats }
}

export class UniversalStatsPlugin {
  options: UniversalStatsPluginOptions
  /**
   *
   * @param {'client' | 'server'} - Is this config for client or server?
   */
  constructor(opts: UniversalStatsPluginOptions) {
    this.options = {
      ...defaultOptions,
      ...opts
    }

    if (!this.options.env) {
      throw new Error(
        "You must specify 'client' or 'server' in UniversalStatsPlugin options.env"
      )
    }
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.emit.tapAsync(
      'UniversalStatsPlugin',
      (compilation, callback) => {
        const { entry, stats } = buildStats(compilation, this.options
          .env as any)

        const statsString = JSON.stringify({
          entry,
          publicPath: compiler.options.output
            ? compiler.options.output.publicPath
            : undefined,
          statsEnv: this.options.env,
          ...stats
        })

        if (this.options.path && this.options.filename) {
          const normalizePath = path.resolve(this.options.path)

          const fullPath = path.join(normalizePath, this.options.filename)
          const dirPath = path.dirname(fullPath)

          try {
            ensureDirSync(dirPath)
            fs.writeFileSync(fullPath, statsString)
          } catch (err) {
            if (err.code !== 'EEXIST') throw err
          }
        } else {
          if (this.options.filename) {
            compilation.assets[this.options.filename] = {
              source() {
                return statsString
              },
              size() {
                return statsString.length
              }
            }
          }
        }

        callback()
      }
    )
  }
}
