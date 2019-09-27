import { HYDRATE_CONST } from './const'

const DEFAULT_ID = '_constId'
const DEFAULT_PRE = 'hydro_'

export const EFFECT_ID = Symbol('react-hydrate')

export class HydrationManager {
  hydrated = false

  private hydration: { [x: string]: string } = {}
  private ids: { [x: string]: number } = {}

  constructor() {
    if (typeof document !== 'undefined') {
      for (const element of document.querySelectorAll(`[${HYDRATE_CONST}]`)) {
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

  getCurrentID(id: string) {
    return this.ids[id]
  }

  getHydration(id: string) {
    return this.hydration[id]
  }
}
