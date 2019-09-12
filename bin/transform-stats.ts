import webpack from 'webpack'

interface DesiredClientStats {
  modulesByName: {
    [x: string]: any
  }
  entrypoints: webpack.Stats.ToJsonOutput['entrypoints']
  publicPath: webpack.Stats.ToJsonOutput['publicPath']
}

interface DesiredServerStats {
  modulesById: {
    [x: string]: any
  }
  entrypoints: webpack.Stats.ToJsonOutput['entrypoints']
  publicPath: webpack.Stats.ToJsonOutput['publicPath']
}

export function transformClientStats({
  modules,
  chunks,
  entrypoints,
  publicPath
}: webpack.Stats.ToJsonOutput) {
  const nodemodulesRegex = /node_modules/
  const webpackRegex = /\(webpack\)/
  const statsObj: DesiredClientStats = {
    modulesByName: {},
    entrypoints:
      entrypoints &&
      Object.keys(entrypoints).reduce((entries, key) => {
        if (entrypoints[key].assets) {
          return {
            ...entries,
            css: entrypoints[key].assets.filter(asset => asset.match(/\.css$/)),
            js: entrypoints[key].assets.filter(asset => asset.match(/\.js$/))
          }
        }

        return {
          ...entries
        }
      }, {}),
    publicPath
  }

  if (modules && chunks) {
    for (const { name, id: moduleId, chunks: moduleChunks } of modules) {
      const chunkFiles = []
      const parentIds = []
      const siblingIds = []

      if (!nodemodulesRegex.test(name) && !webpackRegex.test(name)) {
        for (const { id, parents, siblings, files, initial } of chunks) {
          if (moduleChunks.includes(id) && files) {
            chunkFiles.push(...files)
          }

          // Only get parent/sibling chunks if not initial aka async
          if (!initial && (parents || siblings)) {
            if (parents) {
              parentIds.push(...parents)
            } else if (siblings) {
              siblingIds.push(...siblings)
            }
          }
        }

        const chunkFilesUnique = Array.from(new Set(chunkFiles))
        const cssJsObj = {
          css: chunkFilesUnique.filter(file => file.match(/\.css$/)),
          js: chunkFilesUnique.filter(file => file.match(/\.js$/))
        }

        statsObj.modulesByName[name] = {
          id: moduleId,
          chunkFiles: cssJsObj,
          parentFiles: Array.from(new Set(parentIds)),
          siblingFiles: Array.from(new Set(siblingIds))
        }

        statsObj.modulesById[moduleId] = {
          name,
          chunkFiles: cssJsObj,
          parentFiles: Array.from(new Set(parentIds)),
          siblingFiles: Array.from(new Set(siblingIds))
        }

        if (
          statsObj.modulesById[moduleId].parentFiles &&
          statsObj.modulesById[moduleId].parentFiles.length > 0
        ) {
          const currentParentIdArray =
            statsObj.modulesById[moduleId].parentFiles
          const parentFiles = []
          for (const { id, files } of chunks) {
            if (currentParentIdArray.includes(id)) {
              parentFiles.push(...files)
            }
          }

          const parentFilesUnique = Array.from(new Set(parentFiles))
          const cssJsObj = {
            css: parentFilesUnique.filter(file => file.match(/\.css$/)),
            js: parentFilesUnique.filter(file => file.match(/\.js$/))
          }

          statsObj.modulesById[moduleId].parentFiles = cssJsObj
          statsObj.modulesByName[name].parentFiles = cssJsObj
        }

        if (
          statsObj.modulesById[moduleId].siblingFiles &&
          statsObj.modulesById[moduleId].siblingFiles.length > 0
        ) {
          const currentSiblingIdArray =
            statsObj.modulesById[moduleId].siblingFiles
          const siblingFiles = []
          for (const { id, files } of chunks) {
            if (currentSiblingIdArray.includes(id)) {
              siblingFiles.push(...files)
            }
          }

          const siblingFilesUnique = Array.from(new Set(siblingFiles))
          const cssJsObj = {
            css: siblingFilesUnique.filter(file => file.match(/\.css$/)),
            js: siblingFilesUnique.filter(file => file.match(/\.js$/))
          }

          statsObj.modulesById[name].siblingFiles = cssJsObj
          statsObj.modulesByName[name].siblingFiles = cssJsObj
        }
      }
    }
  }

  console.log(statsObj)

  return JSON.stringify(statsObj)
}

export function transformServerStats({
  modules,
  chunks,
  entrypoints,
  publicPath
}: webpack.Stats.ToJsonOutput) {
  const statsObj: DesiredStats = {
    modulesByName: {},
    modulesById: {},
    entrypoints:
      entrypoints &&
      Object.keys(entrypoints).reduce((entries, key) => {
        if (entrypoints[key].assets) {
          return {
            css: entrypoints[key].assets.filter(asset => asset.match(/\.css$/)),
            js: entrypoints[key].assets.filter(asset => asset.match(/\.js$/))
          }
        }

        return {}
      }, {}),
    publicPath
  }

  if (modules && chunks) {
    for (const { name, id: moduleId, chunks: moduleChunks } of modules) {
      const chunkFiles = []
      const parentIds = []
      const siblingIds = []

      if (!name.match(/node_modules/) && !name.match(/\(webpack\)/)) {
        for (const { id, parents, siblings, files, initial } of chunks) {
          if (moduleChunks.includes(id) && files) {
            chunkFiles.push(...files)
          }

          // Only get parent/sibling chunks if not initial aka async
          if (!initial && (parents || siblings)) {
            if (parents) {
              parentIds.push(...parents)
            } else if (siblings) {
              siblingIds.push(...siblings)
            }
          }
        }

        const chunkFilesUnique = Array.from(new Set(chunkFiles))
        const cssJsObj = {
          css: chunkFilesUnique.filter(file => file.match(/\.css$/)),
          js: chunkFilesUnique.filter(file => file.match(/\.js$/))
        }

        statsObj.modulesByName[name] = {
          id: moduleId,
          chunkFiles: cssJsObj,
          parentFiles: Array.from(new Set(parentIds)),
          siblingFiles: Array.from(new Set(siblingIds))
        }

        statsObj.modulesById[moduleId] = {
          name,
          chunkFiles: cssJsObj,
          parentFiles: Array.from(new Set(parentIds)),
          siblingFiles: Array.from(new Set(siblingIds))
        }

        if (
          statsObj.modulesById[moduleId].parentFiles &&
          statsObj.modulesById[moduleId].parentFiles.length > 0
        ) {
          const currentParentIdArray =
            statsObj.modulesById[moduleId].parentFiles
          const parentFiles = []
          for (const { id, files } of chunks) {
            if (currentParentIdArray.includes(id)) {
              parentFiles.push(...files)
            }
          }

          const parentFilesUnique = Array.from(new Set(parentFiles))
          const cssJsObj = {
            css: parentFilesUnique.filter(file => file.match(/\.css$/)),
            js: parentFilesUnique.filter(file => file.match(/\.js$/))
          }

          statsObj.modulesById[moduleId].parentFiles = cssJsObj
          statsObj.modulesByName[name].parentFiles = cssJsObj
        }

        if (
          statsObj.modulesById[moduleId].siblingFiles &&
          statsObj.modulesById[moduleId].siblingFiles.length > 0
        ) {
          const currentSiblingIdArray =
            statsObj.modulesById[moduleId].siblingFiles
          const siblingFiles = []
          for (const { id, files } of chunks) {
            if (currentSiblingIdArray.includes(id)) {
              siblingFiles.push(...files)
            }
          }

          const siblingFilesUnique = Array.from(new Set(siblingFiles))
          const cssJsObj = {
            css: siblingFilesUnique.filter(file => file.match(/\.css$/)),
            js: siblingFilesUnique.filter(file => file.match(/\.js$/))
          }

          statsObj.modulesById[name].siblingFiles = cssJsObj
          statsObj.modulesByName[name].siblingFiles = cssJsObj
        }
      }
    }
  }

  return JSON.stringify(statsObj)
}
