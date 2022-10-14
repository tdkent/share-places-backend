class HttpError extends Error {
  constructor(message, errorCode) {
    super(message) // Adds a new 'message' property to the built-in Error model
    this.code = errorCode
  }
}

module.exports = HttpError