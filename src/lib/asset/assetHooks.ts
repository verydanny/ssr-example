import { useContext } from 'react'

import { AssetContext } from './assetContext'

export function useAssetContext() {
  return useContext(AssetContext)
}
