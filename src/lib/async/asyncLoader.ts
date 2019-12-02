export type DynamicImport<T> = T | { default: T }

export interface CreateLoader<T> {
  id?: string | number
  attemptSync: boolean
  resolved: undefined | T
  resolve: () => Promise<T | null>
}

declare const __webpack_require__: <T>(id: string | number) => DynamicImport<T>
declare const __webpack_modules__: {
  [key: string]: typeof import('webpack').compilation['Module']
}

export const allAsyncChunks: Map<
  string | number,
  CreateLoader<unknown>
> = new Map()
export const allProcessedChunks: Map<
  string | number,
  CreateLoader<unknown>
> = new Map()

/**
 * This is for jest and regular node. If not working in a webpack
 * environment, you can resolve using Node's `require.resolve`.
 *
 *  Example:
 *    const loaderState = createLoader(
 *      () => import('./foo'),
 *      () => require.resolve('./foo')
 *    )
 *
 * Then node can require it using CJS `require`. The issue is that
 * webpack automatically bundles the module when one uses `require`.
 * 
 */
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
  let moduleId

  try {
    moduleId = id && id()
  } catch (error) {
    // Silent because Jest doesn't have require.resolveWeak
  }

  const loaderState: CreateLoader<T> = {
    attemptSync: false,
    id: moduleId,
    resolved: undefined,
    async resolve() {
      const loaded = normalize(await resolver(load))

      if (loaded) {
        this.resolved = loaded
      }

      return loaded
    }
  }

  if (loaderState.id) {
    const cacheAllResolved = cacheAllAsync(loaderState)
    const cacheReadyResolved = cacheReadyAsync(loaderState)

    if (cacheAllResolved || cacheReadyResolved) {
      return (
        (cacheAllResolved as CreateLoader<T>) ||
        (cacheReadyResolved as CreateLoader<T>)
      )
    }
  }

  // Attempt Synchronous resolution of modules
  if (loaderState.id && !loaderState.attemptSync) {
    loaderState.attemptSync = true

    const resolved = attemptSyncImport(loaderState.id)

    if (resolved) {
      loaderState.resolved = normalize(resolved)

      return loaderState
    }
  }

  return loaderState
}

function cacheReadyAsync<T>(
  loaderState: CreateLoader<T>
): CreateLoader<unknown> | undefined {
  const id = loaderState.id

  if (id && isModuleReady(id)) {
    const cached = allProcessedChunks.has(id)
      ? allProcessedChunks.get(id)
      : undefined

    if (typeof cached?.resolved !== 'undefined') {
      return cached
    }

    allProcessedChunks.set(id, loaderState)
  }

  return undefined
}

function cacheAllAsync<T>(
  loaderState: CreateLoader<T>
): CreateLoader<unknown> | undefined {
  const id = loaderState.id

  if (id) {
    const allCached = allAsyncChunks.has(id)
      ? allAsyncChunks.get(id)
      : undefined

    if (typeof allCached?.resolved !== 'undefined') {
      return allCached
    }

    allAsyncChunks.set(id, loaderState)
  }

  return undefined
}

function resolver<T>(
  load: () => Promise<DynamicImport<T>>
): Promise<DynamicImport<T>> {
  return load().then(mod => mod)
}

export function normalize<T>(asyncModule: DynamicImport<T | null>): T | null {
  if (asyncModule == null) {
    return null
  }

  const value =
    typeof asyncModule === 'object' && 'default' in asyncModule
      ? asyncModule.default
      : asyncModule

  return value == null ? null : value
}

export function attemptSyncImport(id: string | number): DynamicImport<any> {
  if (
    typeof __webpack_require__ === 'function' &&
    typeof __webpack_modules__ === 'object' &&
    __webpack_modules__[id]
  ) {
    try {
      return __webpack_require__(id)
    } catch {
      // SILENTLY FAIL
      //
      // We still want the component to render async through other means
      // so we do a silent fail
    }
  }

  if (typeof nodeRequire === 'function') {
    try {
      return nodeRequire(id)
    } catch {
      // SILENTYLY FAIL
    }
  }
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
      typeof loaderState.resolved === 'undefined' &&
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
      if (typeof loaderState.resolved === 'undefined') {
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
    flushInitializers(allAsyncChunks).then(resolve, reject)
  )

export const preloadReady = () =>
  new Promise(resolve =>
    // we want it resolving even if chunks aren't downloaded properly
    // in SSR. If we don't then it'll fail to render the app.
    flushInitializers(allProcessedChunks).then(resolve, resolve)
  )
