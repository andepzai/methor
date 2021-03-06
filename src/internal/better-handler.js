// @flow

import {
  getParamFunc,
  getProperty,
  isArray,
  isFunction,
  isString
} from '../util'
import _get from 'lodash.get'
import type { HttpResponse, HttpRequest } from '../types'

function generateRegEx(name: string): RegExp {
  return new RegExp('(\\$?' + name + '\\.?(.+)?$)')
}

export default async function(
  handler: Function,
  req: HttpRequest,
  res: HttpResponse,
  next: Function,
  handlerIfNoRes: boolean = true
): Promise<void> {
  const { $options: opts, isFunction, isPromise } = this

  if (handler.name === 'MethorObject') {
  }

  let calledNext = false

  const regexs = [
    [generateRegEx('req|request'), req],
    [generateRegEx('res|resp|request'), res],
    [generateRegEx('headers'), req.headers],
    [
      generateRegEx('next'),
      function(err) {
        calledNext = true
        next(err)
      }
    ]
  ]

  for (let key in this.services) {
    const service = this.services[key]
    regexs.push([generateRegEx(key), service])
  }

  // ctx bind to function

  const ctx = Object.assign(
    {
      payload: req.payload,
      body: req.body,
      query: req.query,
      headers: req.headers,
      userAgent: req.headers['user-agent'],
      end: res.end,
      setHeader: res.setHeader,
      $options: this.$options,
      methods: this.methods,
      method: req._method,
      methodName: req.methodName,
      betterhandler: this.BetterHandler,
      redirect: res.redirect,
      next,
      req,
      res
    },
    this.$options.services,
    this.$options.funcs
  )

  req.ctx = req.ctx || ctx

  const ctxProxy = new Proxy(req.ctx, {
    get(c, name) {
      return c[name] || req.ctx[name]
    },
    set(c, name, val) {
      return (req.ctx[name] = val)
    }
  })

  let params = []

  if (isFunction(handler)) {
    params = getParamFunc(handler)
  }
  if (isArray(handler.$inject)) {
    params = handler.$inject
  }
  if (isArray(handler)) {
    params = handler.slice(0, -1)
    handler = handler[handler.length - 1]
    if (!isFunction(handler))
      throw new TypeError(
        'argument handler is required (' + req.methodName + ')'
      )
  }
  const inject = []
  for (const name of params) {
    let val
    for (const [regex, obj] of regexs) {
      if (regex.test(name)) {
        let matches = name.match(regex)
        let getByProperty = _get(obj, name)
        if ((matches && matches[1]) || getByProperty) {
          val =
            getProperty(obj, matches[matches.length - 1]) ||
            getByProperty ||
            obj
        }
      }
    }
    inject.push(val || undefined)
  }
  let result = handler.apply(ctxProxy, inject)

  if (isPromise(result)) {
    try {
      result = await result
    } catch (err) {
      if (isFunction(opts.catchHandler)) {
        opts.catchHandler(err, req, res)
      } else {
        console.error(err)
      }
    }
  }

  if (!handlerIfNoRes && !result) return
  calledNext === false && this.handlerResponse(req, res, result)
}
