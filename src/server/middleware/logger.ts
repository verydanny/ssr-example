/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express'

import('./render').then(module => {
  console.log('Even loading async things server side from memory works')
  console.log('AsyncModule ', module)
})

export const logger = (_req: Request, _res: Response, next: NextFunction) => {
  console.log('Middleware, You bingor maximus')
  next()
}
