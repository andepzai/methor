'use strict'

const {parse} = require('url')

module.exports = Middleware

function Middleware(req, res, next) {
  req.query = parse(req.url, true).query

  res.json = function json(obj) {
    res.setHeader('Content-Type', 'application/json;charset=utf8')
    res.end(JSON.stringify(obj))
  }

  next()
}