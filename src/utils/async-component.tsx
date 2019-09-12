/* eslint-disable @typescript-eslint/camelcase */
import React, { useState, useContext, useEffect } from 'react'
import { Consumer, Context } from './async-context'

type GetProps<T> = T extends React.ComponentType<infer P> ? P : never

type DefaultOrNamedExport =
  | {
      readonly [x: string]: any
    }
  | { readonly default: any }

type ResolvedPromise<T extends DefaultOrNamedExport> = {
  [K in keyof T]: React.ComponentType<T[K]>
}

interface LoadInterface {
  loading: boolean
  error?: any
  loaded: false | React.ComponentType<any>
  Promise: Promise<any> | undefined
}

interface HOCState<Props> {
  loading: boolean
  error: any
  loaded: boolean | React.ComponentType<Props>
}

const ALL_ASYNC: (() => Promise<any> | undefined)[] = []
const ON_DEMAND_ASYNC: (() => Promise<any> | undefined)[] = []

function load<ImportFunc extends () => Promise<any>>(importFunc: ImportFunc) {
  const importPromise = importFunc()

  const state: LoadInterface = {
    loading: true,
    error: false,
    loaded: false,
    Promise: undefined
  }

  state.Promise = importPromise
    .then(loaded => {
      state.loading = false
      state.loaded = loaded
      return loaded
    })
    .catch(err => {
      state.loading = false
      state.error = err
      throw err
    })

  return state
}

function isWebpackReady(webpack: () => string | number) {
  if (typeof __webpack_modules__ === 'object') {
    const moduleId = webpack()

    const isReady =
      typeof moduleId !== 'undefined' &&
      typeof __webpack_modules__[moduleId as any] !== 'undefined'

    return isReady
  }

  return false
}

const LoadingComp = () => <div>Loading...</div>

/**
 *
 * @param importComponent - A function that returns a promise with the React.Component
 * @param webpack - A function that returns the `webpack.resolveWeak(./someModule)` function
 * @param exportName - If your import is not default, please specify the import name
 */
export function asyncComponent<
  Exports extends object,
  K extends keyof ResolvedPromise<Exports>,
  Props = GetProps<Exports[K]>
>(
  importComponent: () => Promise<Exports>,
  webpack: () => string | number,
  exportName: K | 'default' = 'default'
) {
  let res: LoadInterface

  function init() {
    if (!res) {
      res = load(importComponent)
    }

    return res.Promise
  }

  // This pushes all async component Promises to a variables. This is so
  // server-side we resolve async components before they load.
  ALL_ASYNC.push(init)

  // This pushes the chunks that are needed for current "view" to array.
  // This is for client-side more than server-side
  if (typeof webpack === 'function') {
    ON_DEMAND_ASYNC.push(() => {
      if (isWebpackReady(webpack)) {
        return init()
      }

      return undefined
    })
  }

  return function AsyncComponent(props: Props) {
    init()
    const { updateChunk } = useContext(Context)
    const [error, setError] = useState(res.error)
    const [loading, setLoading] = useState(res.loading)
    const [loaded, setLoaded] = useState(res.loaded as any)
    const [importPromise] = useState(res.Promise)

    useEffect(() => {
      if (!loading) {
        return
      }

      const update = () => {
        setError(res.error)
        setLoaded(res.loaded)
        setLoading(res.loading)
      }

      if (importPromise) {
        importPromise
          .then(() => {
            update()
          })
          .catch(() => {
            update()
          })
      }
    })

    if (loading) {
      return React.createElement(LoadingComp)
    } else if (loaded && typeof loaded === 'object') {
      updateChunk(webpack)
      return React.createElement(loaded[exportName], props)
    }

    return null
  }
}

function flushInitializers(
  initializers: (() => Promise<any> | undefined)[]
): Promise<any> {
  const promises = []

  while (initializers.length) {
    const init = initializers.pop()

    if (typeof init === 'function') {
      promises.push(init())
    }
  }

  return Promise.all(promises).then(() => {
    if (initializers.length) {
      return flushInitializers(initializers)
    }

    return undefined
  })
}

export const preloadAll = () =>
  new Promise((resolve, reject) => {
    flushInitializers(ALL_ASYNC).then(resolve, reject)
  })

export const preloadReady = () =>
  new Promise(resolve => {
    // We always will resolve, errors should be handled within loading UIs.
    flushInitializers(ON_DEMAND_ASYNC).then(resolve, resolve)
  })
