import QS from 'qs'

export default options => {
  const args = []
  if (options.method !== 'get') {
    options.data = QS(options.params)
  }
  args[0] = options
  return args
}
