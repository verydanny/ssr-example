import { logger } from './middleware/logger'
import { serverRenderer } from './middleware/render'
import { preloadAll } from '../lib/async/asyncLoader'

export const middleware = [logger, serverRenderer]
export { preloadAll }
