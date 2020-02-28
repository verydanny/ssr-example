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
    () => import(`./svgs/${name}.svg`),
    () => require.resolveWeak(`./svgs/${name}.svg`),
    {
      isStatic: true,
      displayName: `SVGIcon_${name}`
    }
  )

  const StaticIcon = () => (
    <IconModule.AssetProvider>
      <IconModule.AssetConsumer>
        {icon => {
          if (icon) {
            AssetManager.storeAsset(name, icon)
          }

          return (
            <svg
              dangerouslySetInnerHTML={{
                __html: `<use xlink:href="#${name}"></use>`
              }}
            />
          )
        }}
      </IconModule.AssetConsumer>
    </IconModule.AssetProvider>
  )

  StaticIcon.displayName = 'StaticIcon'

  const StaticWrapper = StaticContent(StaticIcon)

  return <StaticWrapper />
}

Icon.displayName = `SVGIcon`
