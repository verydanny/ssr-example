import { logger } from './middleware/logger'
import { serverRenderer } from './middleware/render'
import { preloadAll } from '../utils/async-component'

export const middleware = [logger, serverRenderer]
export { preloadAll }
