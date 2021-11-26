const { requireContext } = require(`${__basedir}/helpers/file.helper.js`)

module.exports = () => {
  const files = requireContext('../subscribers', /.js$/)
  files.keys().forEach(file => {
    const Subscriber = files(file),
      subscriber = new Subscriber,
      functions = Object.getOwnPropertyNames(Object.getPrototypeOf(subscriber))

    for (const fnName of functions) {
      if (fnName === constructor) continue
      events.on(subscriber.suffix + fnName, subscriber[fnName])
    }
  })
}