// @flow

import { parse } from 'url'
import type { HttpResponse, HttpRequest } from './types'

export default function Middleware(
  req: HttpRequest,
  res: HttpResponse,
  next: Function
): void {
  const query = (req.query = parse(req.url, true).query)
  res.json = function json(obj: any, pretty?: boolean): void {
    res.setHeader('Content-Type', 'application/json;charset=utf8')
    res.end(pretty == true ? JSON.stringify(obj, null, 4) : JSON.stringify(obj))
  }

  res.redirect = function redirect(uri: string, statusCode: ?number): void {
    res.statusCode = statusCode || 322
    res.setHeader('Location', uri)
    res.end()
  }

  next()
}
