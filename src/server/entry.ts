import { logger } from './middleware/logger'
import { serverRenderer } from './middleware/render'

export const middleware = [logger, serverRenderer]
