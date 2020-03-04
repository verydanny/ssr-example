import React, { useEffect, useState, useContext } from 'react'
import { useHydrationManager } from './hooks'
import { makeAsyncComponent } from '../async/asyncComponent'
import { AsyncChunkContext } from '../async/asyncContext'

import { GetProps } from '../async/asyncComponent'

type DefaultOrNamedExport =
  | {
      readonly [x: string]: any
    }
  | { readonly default: any }

type ResolvedPromise<T extends DefaultOrNamedExport> = {
  [K in keyof T]: React.ComponentType<T[K]>
}

interface DeferredComponentProps {
  children: React.ReactChild
  resolver?: () => string | number
}

export function DeferredComponent({
  children,
  resolver
}: DeferredComponentProps) {
  const manager = useHydrationManager()
  const [hydrated, setHydrated] = useState(manager.hydrated)

  if (resolver) {
    const { recordChunk } = useContext(AsyncChunkContext)

    recordChunk(resolver(), false)
  }

  useEffect(() => setHydrated(manager.hydrated), [manager])

  return manager.isServer ? null : hydrated ? <>{children}</> : null
}

export function DeferHydrateToClient<
  T extends React.ComponentType<GetProps<T>>,
  Props extends GetProps<T>
>(Component: T, resolver?: () => string | number) {
  function DeferredComponentHOC(props: Props) {
    return (
      <DeferredComponent resolver={resolver ? resolver : undefined}>
        <Component {...props} />
      </DeferredComponent>
    )
  }

  return React.memo(DeferredComponentHOC)
}

export function importClientDeferred<
  Exports extends object,
  K extends keyof ResolvedPromise<Exports>
>({
  importComponent,
  webpack,
  exportName,
  isStatic
}: {
  importComponent: () => Promise<Exports>
  webpack: () => string | number
  exportName: K | 'default'
  isStatic?: boolean
}) {
  const C = makeAsyncComponent(importComponent, webpack, {
    exportName,
    isStatic
  })

  return DeferHydrateToClient(C, webpack)
}
