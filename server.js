'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var methodOverride = require('method-override')
var logger = require('morgan')
var cors = require('cors')
var validator = require('express-validator')
var compression = require('compression')
var helmet = require('helmet')
var httpStatus = require('http-status')
var mongoose = require('mongoose')
var util = require('util')
var debug = require('debug')('app:server')
var errorHandler = require('./middlewares/errorHandler')
var APIError = require('./utils/APIError')
var config = require('./config')

var app = express()

// ========================================================
// Middleware
// ========================================================
debug('Init middleware...')
if (config.env === 'development') { app.use(logger('dev')) }
app.use(compression())
app.use(cors(config.cors))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(validator())
app.use(cookieParser())
app.use(methodOverride())
app.use(helmet())

// static
app.use(express.static('dist'))
// 404
app.use('/', function (req, res, next) {
  next(new APIError('Method Not Found', httpStatus.NOT_FOUND, true))
})

// error transform
app.use(function (err, req, res, next) {
  if (Array.isArray(err)) {
    var unifiedErrorMessage = err.map(function (error) { return error.msg }).join(' and ')
    var error = new APIError(unifiedErrorMessage, httpStatus.BAD_REQUEST, true)
    return next(error)
  } else if (!(err instanceof APIError)) {
    return next(new APIError(err.message, err.status, err.isPublic))
  }
  return next(err)
})

// error handler
app.use(errorHandler())

module.exports = app

