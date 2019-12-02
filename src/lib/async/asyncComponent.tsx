import React, { useEffect } from 'react'

import { useAsyncHook } from './asyncHooks'
import { createLoader, DynamicImport } from './asyncLoader'

type GetProps<T> = T extends React.ComponentType<infer P> ? P : never

interface AsyncComponentOptions<ExportKeys, Props> {
  Loading?(props: Props): React.ReactNode
  exportName?: ExportKeys | 'default'
  isStatic?: boolean
}

/**
 * @param load - A function that returns a promise with the React.Component
 * @param id - A function that returns an id in string or number form to "mark" the module
 * @param exportName - If your import is not default, please specify the import name
 */
export function makeAsyncComponent<
  Exports,
  K extends keyof Exports,
  Props = GetProps<DynamicImport<Exports[K]>>
>(
  load: () => Promise<DynamicImport<Exports>>,
  id: () => string | number,
  {
    Loading = defaultRender,
    exportName = 'default',
    isStatic = false
  }: AsyncComponentOptions<K, Props> = {
    exportName: 'default',
    isStatic: false
  }
): React.ComponentType<Props> {
  const loaderState = createLoader(load, id)

  return function AsyncComponent(props: Props) {
    const { load, resolved: Component, loading, error } = useAsyncHook(
      loaderState,
      isStatic
    )
    const ComponentNormalized =
      Component && exportName !== 'default'
        ? ((Component[exportName] as unknown) as React.ComponentType<Props>)
        : Component
        ? ((Component as unknown) as React.ComponentType<Props>)
        : null
    const rendered = ComponentNormalized ? (
      <ComponentNormalized {...props} />
    ) : null
    let loadingElement: React.ReactNode | null = null
    let markupContent: React.ReactNode | null = null

    loadingElement = <Loader load={load} props={props} />

    if (loading) {
      markupContent = Loading(props)
    } else if (rendered && !error) {
      markupContent = rendered
    }

    return (
      <>
        {markupContent}
        {loadingElement}
      </>
    )
  }
}

function Loader<T>({ load, props }: { load(): void; props: T }) {
  useEffect(() => {
    load()
  }, [load, props])

  return null
}

function defaultRender() {
  return null
}
