const storage = Symbol()

export class AssetManager {
  [storage] = new Map()
  assetCallback?: Function

  storeAsset<T>(assetKey: string, assetValue: T) {
    if (!this.hasAsset(assetKey)) {
      this[storage].set(assetKey, assetValue)
    }

    if (this.assetCallback) {
      this.assetCallback(assetKey, assetValue)
    }

    return assetValue
  }

  hasAsset(assetKey: string) {
    return this[storage].has(assetKey)
  }

  getAsset(assetKey: string) {
    if (this.hasAsset(assetKey)) {
      const asset = this[storage].get(assetKey)

      if (this.assetCallback) {
        this.assetCallback(assetKey, asset)
      }

      return asset
    }
  }

  logAssets<T extends Function>(fn: T) {
    if (!this.assetCallback) {
      this.assetCallback = fn.bind(this)
    }
  }
}
