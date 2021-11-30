module.exports.OK = 200
module.exports.CREATED = 201
module.exports.ACCEPTED = 202
module.exports.FORBIDDEN = 403
module.exports.UNAUTHORIZED = 401
module.exports.BAD_REQUEST = 400
module.exports.NOT_FOUND = 404
module.exports.SERVER_ERROR = 500
module.exports.paginationRequest = (reqQuery) => {
  let customOptions = reqQuery.options ? JSON.parse(reqQuery.options) : {},
    options = {
      nextPage: null,
      page: 1,
      pages: { 1: null },
      prevPage: null,
      totalItems: 0,
      totalPages: 1,
      itemsPerPage: 10,
      ...customOptions
    },
    searchQuery = [],
    query = null

  const
    search = reqQuery.search,
    searchFields = reqQuery.searchFields,
    customQuery = reqQuery.q,
    itemsPerPage = options.itemsPerPage ? parseInt(options.itemsPerPage) : 10,
    page = options.page ? parseInt(options.page) : 1,
    lastId = options.lastId

  if ((search && searchFields) || customQuery)
    query = { $and: [] }

  if (search && searchFields) {
    const fields = searchFields.split(',')
    fields.forEach(field => {
      searchQuery.push({ [field]: new RegExp(search, 'i') })
    })

    query['$and'].push({
      $or: searchQuery
    })
  }

  if (customQuery) {
    const newQuery = JSON.parse(customQuery)
    query['$and'].push(newQuery)
  }

  return { query, itemsPerPage, page, lastId }
}