import Axios from 'axios'

Axios.defaults.baseURL = this.config.BASE
Axios.defaults.headers.post['Accept'] = 'application/json'
Axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
Axios.defaults.timeout = this.config.TIMEOUT
Axios.defaults.withCredentials = this.config.WITHCREDENTIALS

export default Axios