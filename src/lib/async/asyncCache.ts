import { CreateLoader } from './types'

const allAsyncModulesCache = Symbol()
const parsedAsyncModulesCache = Symbol()

class AsyncCache {
  private [allAsyncModulesCache] = new Map<
    string | number,
    CreateLoader<unknown>
  >()
  private [parsedAsyncModulesCache] = new Map<
    string | number,
    CreateLoader<unknown>
  >()

  cacheAsyncModule<T>(
    id: string | number,
    value: CreateLoader<T>
  ): CreateLoader<T> {
    if (this[allAsyncModulesCache].has(id)) {
      return this[allAsyncModulesCache].get(id) as CreateLoader<T>
    }

    return this[allAsyncModulesCache].set(id, value).get(id) as CreateLoader<T>
  }

  cacheParsedAsyncModule<T>(
    id: string | number,
    value: CreateLoader<T>
  ): CreateLoader<T> {
    if (this[parsedAsyncModulesCache].has(id)) {
      return this[parsedAsyncModulesCache].get(id) as CreateLoader<T>
    }

    return this[parsedAsyncModulesCache].set(id, value).get(id) as CreateLoader<
      T
    >
  }

  get getParsedModules() {
    return this[parsedAsyncModulesCache]
  }

  get getAllAsyncModules() {
    return this[allAsyncModulesCache]
  }

  get clearParsedModules() {
    return this[parsedAsyncModulesCache].clear()
  }

  get clearAllAsyncModules() {
    return this[allAsyncModulesCache].clear()
  }
}

export const PrivateModuleCache = new AsyncCache()
