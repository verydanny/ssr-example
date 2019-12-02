const storage = Symbol()

export class AssetManager {
  [storage] = new Map()
  assetCallback?: Function

  storeAsset<T>(assetKey: string, assetValue: T) {
    if (!this.hasAsset(assetKey)) {
      this[storage].set(assetKey, assetValue)
    }

    if (this.assetCallback) {
      this.assetCallback(assetKey, assetValue, this)
    }

    return assetValue
  }

  hasAsset(assetKey: string) {
    return this[storage].has(assetKey)
  }

  getAsset(assetKey: string) {
    if (this.hasAsset(assetKey)) {
      return this[storage].get(assetKey)
    }
  }

  logAssets<T extends Function>(fn: T) {
    if (!this.assetCallback) {
      this.assetCallback = fn.bind(this)
    }
  }
}
