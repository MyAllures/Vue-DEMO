import axios from 'axios'
import urls from './urls'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

export * from './ghost'
export * from './venom'
export * from './eagle'
export {
  urls
}
