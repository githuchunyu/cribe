export default options => {
  const arguments = []
  if (options.method !== 'get') {
    options.data = QS(options.params)
  }
  arguments[0] = options
  return arguments
}