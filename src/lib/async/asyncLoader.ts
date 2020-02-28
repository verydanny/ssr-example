import { PrivateModuleCache } from './asyncCache'

import { DynamicImport, CreateLoader } from './types'

declare const __webpack_require__: <T>(id: string | number) => DynamicImport<T>
declare const __webpack_modules__: {
  [key: string]: typeof import('webpack').compilation['Module']
}

const requireKey = 'require'
const nodeRequire =
  (typeof global === 'object' &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    typeof global[requireKey] === 'function' &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    global[requireKey]) ||
  (typeof module === 'object' &&
    typeof module[requireKey] === 'function' &&
    module[requireKey]) ||
  undefined

export function createLoader<T>(
  load: () => Promise<DynamicImport<T>>,
  id: () => string | number
): CreateLoader<T> {
  let moduleId = id && id()

  try {
    moduleId = id && id()
  } catch (error) {
    // Silent because Jest doesn't have require.resolveWeak
  }

  const loaderState: CreateLoader<T> = {
    attemptSync: false,
    id: moduleId,
    resolved: null,
    async resolve() {
      const loaded = await resolver(load)

      if (loaded) {
        this.resolved = loaded
      }

      return loaded
    }
  }

  // Caching modules messes up hot reloading
  if (!module.hot) {
    if (loaderState.id) {
      if (isModuleReady(loaderState.id)) {
        const parsedAsyncModuleCached = PrivateModuleCache.cacheParsedAsyncModule(
          loaderState.id,
          loaderState
        )

        if (parsedAsyncModuleCached.resolved) {
          return parsedAsyncModuleCached
        }
      }

      const allAsyncModulesCached = PrivateModuleCache.cacheAsyncModule(
        loaderState.id,
        loaderState
      )

      if (allAsyncModulesCached.resolved) {
        return allAsyncModulesCached
      }
    }
  }

  // Attempt Synchronous resolution of modules
  if (loaderState.id && !loaderState.attemptSync) {
    loaderState.attemptSync = true

    const resolved = attemptSyncImport(loaderState.id)

    if (resolved) {
      // Hard to type this one since we're using library module things like
      // webpack's require, or node's require. Hard to type
      loaderState.resolved = (resolved as unknown) as T

      return loaderState
    }
  }

  return loaderState
}

async function resolver<T>(
  load: () => Promise<DynamicImport<T>>
): Promise<T | null> {
  const loaded = await load()

  return normalize(loaded)
}

export function normalize<T>(asyncModule: DynamicImport<T | null>): T | null {
  if (asyncModule == null) return null

  const value =
    typeof asyncModule === 'object' && 'default' in asyncModule
      ? asyncModule.default
      : asyncModule

  return value == null ? null : value
}

export function attemptSyncImport(
  id: string | number
): typeof normalize | undefined | null {
  if (
    typeof __webpack_require__ === 'function' &&
    typeof __webpack_modules__ === 'object' &&
    __webpack_modules__[id]
  ) {
    try {
      return normalize(__webpack_require__(id))
    } catch {
      // SILENTLY FAIL
      //
      // We still want the component to render async through other means
      // so we do a silent fail
    }
  }

  if (typeof nodeRequire === 'function') {
    try {
      return normalize(nodeRequire(id))
    } catch {
      // SILENTYLY FAIL
    }
  }

  return undefined
}

export function isModuleReady(id: string | number) {
  if (typeof __webpack_modules__ === 'object') {
    const isReady =
      typeof id !== 'undefined' &&
      typeof __webpack_modules__[id] !== 'undefined'

    return isReady
  }

  return false
}

function flushInitializers<T>(
  initializers: Map<string | number, CreateLoader<T>>
): Promise<T | undefined> {
  const promises: Array<Promise<T | null>> = []

  /**
   * We cycle through every loaderState, checking if any
   * CreateLoader<T>.resolved is undefined. It will only be defined
   * if the module successfully loads. If there's still undefined, we
   * push the resolver for that particular module to promises[].
   */
  for (const [, loaderState] of initializers) {
    if (
      loaderState.resolved == null &&
      typeof loaderState.resolve === 'function'
    ) {
      promises.unshift(loaderState.resolve())
    }
  }

  /**
   * If during resolution there ends up being more undefined modules added,
   * resolve those recursively until every module is resolved
   */
  return Promise.all(promises).then(() => {
    const unresolved = []

    for (const [key, loaderState] of initializers) {
      if (loaderState.resolved == null) {
        unresolved.push(key)
      }
    }

    if (unresolved.length > 0) {
      return flushInitializers(initializers)
    }

    return undefined
  })
}

export const preloadAll = () =>
  new Promise((resolve, reject) =>
    flushInitializers(PrivateModuleCache.getAllAsyncModules).then(
      resolve,
      reject
    )
  )

export const preloadReady = () =>
  new Promise(resolve =>
    // we want it resolving even if chunks aren't downloaded properly
    // in SSR. If we don't then it'll fail to render the app.
    flushInitializers(PrivateModuleCache.getParsedModules).then(
      resolve,
      resolve
    )
  )
