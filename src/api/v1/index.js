const
  { apiResponse, validationError } = require(`${__basedir}/helpers/error.helper`),
  {
    OK,
    CREATED,
    ACCEPTED,
    FORBIDDEN,
    BAD_REQUEST,
    NOT_FOUND,
    SERVER_ERROR,
    paginationRequest
  } = require(`${__basedir}/helpers/api.helper`),
  suffix = '/api/v1'

module.exports = (app) => {
  app.post(`${suffix}/generateTransaction`, (req, res) => {

    apiResponse(res, async () => {

      const result = await bc.generateTransaction({
        to: req.body.to,
        from: req.body.from,
        data: req.body.data
      })

      return result
    }, ACCEPTED)
  })

  app.post(`${suffix}/addTransaction`, async (req, res) => {

    apiResponse(res, async () => {
      if (bc.create) {
        const result = await bc.addTransaction(req.body)

        if (result.status === 'error')
          validationError(result.message)
      }
      else {
        nodes.sendAll({
          action: 'ADD_TRANSACTION',
          data: req.body
        })
      }
      return true
    }, ACCEPTED)
  })

  app.get(`${suffix}/balance/:id`, async (req, res) => {

    apiResponse(res, async () => {
      const result = await bc.balance(req.params.id)

      if (!result)
        validationError('Insufficient Funds')
      else
        return result
    }, OK)
  })
}