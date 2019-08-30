/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express'

import('./render').then(m => {
  console.log('Even loading async things server side from memory works')
  console.log('AsyncModule ', m)
})

export const logger = (_req: Request, _res: Response, next: NextFunction) => {
  console.log('Middleware, You bingor maximus')
  next()
}
