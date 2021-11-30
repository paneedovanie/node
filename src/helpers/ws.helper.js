module.exports.messageSending = (message) => {
  if (typeof message === 'string') return message

  return JSON.stringify(message)
}

module.exports.messageReceiving = (message) => {
  message = message.toString()
  try {
    return JSON.parse(message)
  } catch (err) {
    return message
  }
}