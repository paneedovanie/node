const {
  OK,
  CREATED,
  ACCEPTED,
  FORBIDDEN,
  BAD_REQUEST,
  NOT_FOUND,
  SERVER_ERROR
} = require("./api.helper")

module.exports.catchError = function (
  fun,
  cat = err => { throw new Error(err.message) },
  fin = () => { }
) {
  try { return fun() }
  catch (err) { cat(err) }
  finally { fin() }
}

module.exports.apiResponse = async function (
  res,
  fun,
  statusCode
) {
  try {
    res.status(statusCode).json(await fun())
  } catch (err) {
    if (err.name === 'ValidationError')
      statusCode = BAD_REQUEST
    else
      statusCode = SERVER_ERROR
    res.status(statusCode).json(apiError(err))
  }
}

module.exports.filterJoiErrors = function (object) {
  return object.map(e => e.message)
}

const validationError = function (message, details) {
  throw new CustomError('ValidationError', message, details)
}

module.exports.validationError = validationError

module.exports.formatValidationError = function (obj) {
  let newDetails = {}

  obj.details.forEach(item => {
    newDetails[item.path[0]] = [item.message]
  })
  validationError('Invalid Input', newDetails)
}

function apiError(err) {
  return {
    name: err.name,
    message: err.message,
    details: err.details
  }
}

module.exports.apiError = apiError

class CustomError extends Error {
  constructor(name = '', message = '', details = {}, params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }

    this.name = name
    this.message = message
    this.details = details
    // Custom debugging information
    // this.date = new Date()
  }
}