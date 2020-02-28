import React, { createContext, useEffect } from 'react'

import { createLoader } from './asyncLoader'
import { useAsyncHook } from './asyncHooks'
import { DynamicImport } from './types'

interface ConsumerProps<Value> {
  children(value: Value | null): React.ReactNode
}

interface ProviderProps {
  children?: React.ReactNode
}

export interface AsyncContextType<Value> {
  Context: React.Context<Value | null>
  AssetProvider: React.ComponentType<ProviderProps>
  AssetConsumer: React.ComponentType<ConsumerProps<Value>>
}

interface MakeAsyncModule {
  isStatic?: boolean
  displayName?: string
}

export function makeAsyncModule<Exports, K extends keyof Exports>(
  load: () => Promise<DynamicImport<Exports>>,
  webpack: () => string | number,
  { isStatic = false, displayName = '' }: MakeAsyncModule = {
    isStatic: false,
    displayName: ''
  }
): AsyncContextType<Exports> {
  const Context = createContext<Exports | null>(null)
  const loaderState = createLoader(load, webpack)

  function AssetProvider(props: ProviderProps) {
    // const { load, resolved, loading } = useAsyncHook(loaderState, isStatic)
    const { load, resolved, loading } = useAsyncHook(loaderState, isStatic)

    useEffect(() => {
      if (loading && resolved == null) {
        load()
      }
    }, [load, loading])

    return <Context.Provider value={resolved} {...props} />
  }
  AssetProvider.displayName = `${
    displayName ? displayName : 'Anonymous'
  }.AssetProvider`

  function AssetConsumer(props: ConsumerProps<Exports>) {
    return <Context.Consumer {...props} />
  }
  AssetConsumer.displayName = `${
    displayName ? displayName : 'Anonymous'
  }.AssetConsumer`

  function Root() {
    throw new Error(
      'Do not attempt to render the result of calling `makeAsyncModule()` directly. Render its `.Provider` component instead.'
    )
  }

  const Final: AsyncContextType<Exports> = Root as any

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
