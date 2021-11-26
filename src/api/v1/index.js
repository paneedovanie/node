const suffix = '/api/v1'

module.exports = (app) => {
  app.post(`${suffix}/generateTransaction`, (req, res) => {

    const transaction = bc.generateTransaction({
      to: req.body.to,
      from: req.body.from,
      data: req.body.data
    })

    res.json(transaction)
  })

  app.post(`${suffix}/addTransaction`, async (req, res) => {

    const result = await bc.addTransaction(req.body)

    res.json(result)
  })
}