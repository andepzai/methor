'use strict'

const Methor = require('../../lib/methor')

const Register = Methor.createMethod(function(req) {
  return {
    success: true,
    data: {
      message: 'Hello world'
    }
  }
})

Register.mark('user.register2')

module.exports = Register
