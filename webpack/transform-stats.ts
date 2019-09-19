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
  module: boolean
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
  files?: Files
  chunkGroupFiles?: Files
}

interface Stats {
  [x: string]: {
    name?: string
    files?: Files
    chunkGroupFiles?: Files
  }
}

const defaultOptions: UniversalStatsPluginOptions = {
  env: undefined,
  path: undefined,
  filename: 'stats',
  module: false
}

function makeModule(isModule: boolean, jsonString: string) {
  return isModule ? `module.exports = ${jsonString}` : jsonString
}

function makeFilename(isModule: boolean, filename?: string) {
  return isModule && filename ? `${filename}.js` : `${filename}.json`
}

function buildStats(
  compilation: webpack.compilation.Compilation,
  env: 'client' | 'server'
) {
  const { chunkGroups, modules } = compilation
  const entry: Entry = {}
  const moduleArray: WebpackStubbedModule[] = []
  const stats: Stats = {}

  for (const chunkGroup of chunkGroups) {
    const getChunkGroupFiles = chunkGroup.getFiles()
    const chunkGroupFiles = {
      js: getChunkGroupFiles.filter((file: string) => /\.js$/.test(file)),
      css: getChunkGroupFiles.filter((file: string) => /\.css$/.test(file))
    }
    // Get chunks for entrypoint
    if (chunkGroup.constructor.name === 'Entrypoint') {
      entry[chunkGroup.name] = chunkGroupFiles
    }

    // There are 2 kinds of ChunkGroups. EntryPoints (top level) and
    // ChunkGroups, which is what splits off when you use import()
    if (env === 'client' && chunkGroup.constructor.name === 'ChunkGroup') {
      for (const chunk of chunkGroup.chunks) {
        const modulesInCurrentChunk = chunk.getModules()
        const files = {
          js: chunk.files.filter((file: string) => /\.js$/.test(file)),
          css: chunk.files.filter((file: string) => /\.css$/.test(file))
        }

        for (const module of modulesInCurrentChunk) {
          if (module.rawRequest) {
            moduleArray.push({
              id: module.id,
              name: module.rawRequest,
              chunkGroupFiles,
              files
            })
          }
          if (
            !module.rawRequest &&
            module.constructor.name === 'ConcatenatedModule'
          ) {
            moduleArray.push({
              id: module.id,
              name: module.rootModule.rawRequest,
              chunkGroupFiles,
              files
            })
          }
        }
      }
    }

    if (env === 'server') {
      for (const module of modules) {
        if (module.rawRequest) {
          moduleArray.push({
            id: module.id,
            name: module.rawRequest
          })
        }
        if (
          !module.rawRequest &&
          module.constructor.name === 'ConcatenatedModule'
        ) {
          moduleArray.push({
            id: module.id,
            name: module.rootModule.rawRequest
          })
        }
      }
    }
  }

  if (env === 'client') {
    for (const { name, files, chunkGroupFiles } of moduleArray) {
      stats[name] = {
        files: files ? files : { js: [], css: [] },
        chunkGroupFiles: chunkGroupFiles ? chunkGroupFiles : { js: [], css: [] }
      }
    }
  }

  if (env === 'server') {
    for (const { id, name } of moduleArray) {
      stats[id] = {
        name
      }
    }
  }

  return { entry, stats }
}

export const buildDevStats = (
  compilation: webpack.compilation.Compilation,
  env: 'client' | 'server'
) => {
  const { entry, stats } = buildStats(compilation, env)

  if (env === 'client') {
    return {
      entry,
      publicPath:
        compilation.compiler &&
        compilation.compiler.options &&
        compilation.compiler.options.output &&
        compilation.compiler.options.output.publicPath
          ? compilation.compiler.options.output.publicPath
          : '/',
      statsEnv: env,
      ...stats
    }
  } else {
    return stats
  }
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
        const statsModule = makeModule(this.options.module, statsString)
        const statsFilename = makeFilename(
          this.options.module,
          this.options.filename
        )

        if (this.options.path) {
          const normalizePath = path.resolve(this.options.path)

          const fullPath = path.join(normalizePath, statsFilename)
          const dirPath = path.dirname(fullPath)

          try {
            ensureDirSync(dirPath)
            fs.writeFileSync(fullPath, statsModule)
          } catch (err) {
            if (err.code !== 'EEXIST') throw err
          }
        } else {
          compilation.assets[statsFilename] = {
            source() {
              return statsModule
            },
            size() {
              return statsModule.length
            }
          }
        }

        callback()
      }
    )
  }
}
