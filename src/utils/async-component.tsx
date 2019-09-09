/* eslint-disable @typescript-eslint/camelcase */
import React from 'react'
import { Consumer } from './async-context'

type MakePromise<T> = Promise<
  {
    [K in keyof T]: React.ComponentType<T[K]>
  }
>

interface LoadInterface {
  loading: boolean
  error?: any
  loaded: boolean | React.ComponentType<any>
  Promise: Promise<any> | undefined
}

interface HOCState<Props> {
  loading: boolean
  error: any
  loaded: boolean | React.ComponentType<Props>
}

export const ALL_ASYNC: (() => Promise<any> | undefined)[] = []
export const ALL_READY_ASYNC: (() => Promise<any> | undefined)[] = []

export const ALL_CHUNKS = []
export const READY_CHUNKS = []

function load(loader: () => Promise<any>) {
  const promise = loader()

  const state: LoadInterface = {
    loading: true,
    loaded: false,
    Promise: undefined
  }

  state.Promise = promise
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

function isWebpackReady(webpack: () => number) {
  if (typeof __webpack_modules__ === 'object') {
    const moduleId = webpack()

    const isReady =
      typeof moduleId !== 'undefined' &&
      typeof __webpack_modules__[moduleId] !== 'undefined'

    console.log(isReady)

    return isReady
  }

  return false
}

const LoadingComp = () => <div>Loading...</div>

export function asyncComponent<Props extends object, K extends keyof Props>(
  importComponent: () => MakePromise<Props>,
  exportName: K,
  webpack: () => any,
  chunkName: string
) {
  let res: LoadInterface

  function init() {
    if (!res) {
      res = load(importComponent)
    }

    return res.Promise
  }

  ALL_ASYNC.push(init)

  if (typeof webpack === 'function') {
    ALL_READY_ASYNC.push(() => {
      if (isWebpackReady(webpack)) {
        return init()
      }

      return undefined
    })
  }

  return class AsyncComponent extends React.Component<
    Props[K],
    HOCState<Props[K]>
  > {
    _mounted = false

    constructor(props: Props[K]) {
      super(props)
      init()

      this.state = {
        error: false,
        loading: res.loading,
        loaded: res.loaded
      }
    }

    componentDidMount() {
      this._mounted = true
      this._loadModule()
    }

    componentWillUnmount() {
      this._mounted = false
    }

    _loadModule() {
      if (!res.loading) {
        return
      }

      const update = () => {
        if (!this._mounted) {
          return
        }

        this.setState({
          error: res.error,
          loaded: res.loaded,
          loading: res.loading
        })
      }

      if (res.Promise) {
        res.Promise.then(() => {
          update()
        }).catch(() => {
          update()
        })
      }
    }

    retry = () => {
      this.setState({ loading: true })
      res = load(importComponent)
      this._loadModule()
    }

    render() {
      if (this.state.loading) {
        return React.createElement(LoadingComp)
      } else if (this.state.loaded && typeof this.state.loaded === 'object') {
        return (
          <Consumer>
            {({ updateChunk }) => {
              if (typeof updateChunk === 'function') {
                updateChunk(chunkName)
              }

              if (typeof this.state.loaded === 'object') {
                return React.createElement(
                  this.state.loaded[exportName],
                  this.props
                )
              }

              return null
            }}
          </Consumer>
        )
      } else {
        return null
      }
    }
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
    flushInitializers(ALL_READY_ASYNC).then(resolve, resolve)
  })
