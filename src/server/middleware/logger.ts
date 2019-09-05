/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from 'express'

export const logger = (_req: Request, _res: Response, next: NextFunction) => {
  console.log('Example of a simple logging middleware...')
  next()
}
