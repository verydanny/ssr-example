import { HYDRATE_CONST } from './const'
import { isServer } from '../helpers/is-server'

const DEFAULT_ID = '_constId'
const DEFAULT_PRE = 'hydro_'

export class HydrationManager {
  hydrated = false
  isServer = isServer
  private hydration: { [x: string]: string } = {}
  private ids: { [x: string]: number } = {}

  constructor() {
    if (typeof document !== 'undefined') {
      const allHydrationElements: HTMLElement[] = [].slice.call(
        document.querySelectorAll(`[${HYDRATE_CONST}]`)
      )

      for (const element of allHydrationElements) {
        if (typeof element.getAttribute(HYDRATE_CONST) === 'string') {
          this.hydration = {
            ...this.hydration,
            [element.getAttribute(HYDRATE_CONST) as string]: element.innerHTML
          }
        }
      }
    }
  }

  hydrationId(id?: string) {
    const finalId = id || DEFAULT_ID
    const current = this.ids[finalId] || 0

    this.ids = {
      ...this.ids,
      [finalId]: current + 1
    }

    return `${id || DEFAULT_PRE}${current + 1}`
  }

  getHydration(id: string) {
    return this.hydration[id]
  }
}
