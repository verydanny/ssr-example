import React from 'react'
import { AssetContext } from '../../../lib/asset/assetContext'
import { makeAsyncModule } from '../../../lib/async/asyncModule'
import { StaticContent } from '../../../lib/partial-hydrate/partial'

interface IconProps {
  name: string
}

export const Icon = ({ name }: IconProps) => {
  const AssetManager = React.useContext(AssetContext)
  const IconModule = makeAsyncModule(
    () => import(/* webpackChunkName: "icon-[request]" */ `./svgs/${name}.svg`),
    () => require.resolveWeak(`./svgs/${name}.svg`),
    {
      isStatic: true
    }
  )

  const IconComponent = StaticContent(() => (
    <IconModule.AssetProvider>
      <IconModule.AssetConsumer>
        {icon => {
          const svg = AssetManager.storeAsset(name, icon)

          return <svg viewBox={svg.viewBox}><use xlinkHref={`#${svg.id}`}></use></svg>
        }}
      </IconModule.AssetConsumer>
    </IconModule.AssetProvider>
  ))

  return <IconComponent />
}
