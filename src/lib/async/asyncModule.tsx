import React, { createContext, useContext, useEffect, useState } from 'react'

import { AsyncChunkContext } from './asyncContext'
import { createLoader, DynamicImport, normalize } from './asyncLoader'

interface ConsumerProps<Value> {
  children(value: Value | null): React.ReactNode
}

interface ProviderProps {
  children?: React.ReactNode
}

export interface AsyncContextType<Value> {
  Context?: React.Context<Value | null>
  AssetProvider?: React.ComponentType<ProviderProps>
  AssetConsumer?: React.ComponentType<ConsumerProps<Value>>
}

export function makeAsyncModule<Exports, K extends keyof Exports>(
  load: () => Promise<DynamicImport<Exports>>,
  webpack: () => string | number,
  {
    exportName = 'default',
    isStatic = false
  }: {
    exportName?: K | 'default'
    isStatic?: boolean
  } = { exportName: 'default', isStatic: false }
): AsyncContextType<Exports> {
  const Context = createContext<AsyncContextType<Exports>>(null)
  const loaderState = createLoader(load, webpack)

  function AssetProvider(props: ProviderProps) {
    let mounted = false
    const { resolved } = loaderState
    const [value, setValue] = useState(resolved)
    const AsyncChunkManager = useContext(AsyncChunkContext)
    const isResolved = value && typeof value === 'object'

    AsyncChunkManager.updateChunk(webpack, isStatic)

    // Only used if:
    // 1. Chunks aren't loaded in properly in a "sync" manner
    // 2. Chunks aren't loaded quickly with the webpack runtime
    // Warning: if it must import chunk directly with no runtime, you
    //          *WILL* probably get a server/client mismatch
    useEffect(() => {
      const resolver = loaderState.resolve.bind(loaderState)

      if (!isResolved && !mounted && typeof resolver === 'function') {
        resolver()
          .then(val => val && setValue(val))
          .catch(error => setValue(error))
      }

      return () => {
        mounted = true
      }
    }, [resolved])

    if (value) {
      const normalizedModule = normalize(value)
      const normalizedExport =
        exportName === 'default' && normalizedModule
          ? normalizedModule
          : normalizedModule
          ? normalizedModule
          : {}

      return <Context.Provider value={normalizedExport} {...props} />
    }

    return null
  }

  function AssetConsumer(props: ConsumerProps<Exports>) {
    return <Context.Consumer {...props} />
  }

  function Root() {
    throw new Error(
      'Do not attempt to render the result of calling `makeAsyncModule()` directly. Render its `.Provider` component instead.'
    )
  }

  const Final = Root as any

  Object.defineProperty(Final, 'AssetProvider', {
    value: AssetProvider,
    writable: false
  })

  Object.defineProperty(Final, 'AssetConsumer', {
    value: AssetConsumer,
    writable: false
  })

  return Final
}
