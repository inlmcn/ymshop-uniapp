// 请求工具
// import router from './../../router'
// import * as Vue from 'vue'
// import promise from 'es6-promise'
import canvasConfig from '../config'
import cookie from '@/utils/cookie'
// import Cookies from 'js-cookie'
// import localStorage from '../storage/localStorage'
// promise.polyfill()

/*
const service = axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true,
  timeout: 20000 // 请求超时 20s
})

// 请求拦截器
service.interceptors.request.use(config => {
  // 是否为当前的请求加上请求头 token
  const token = canvasConfig.getToken()
  if (token) {
    if(canvasConfig.typeId === 1){
      config.headers['Authorization-admin'] = token
    } else if(canvasConfig.typeId === 3){
      config.headers['Authorization-business'] = token
    } else {
      config.headers['Authorization'] = token
    }
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    console.log(response)
    if (response.data.code && response.data.code !=='200' && response.data.message) {
      // Vue.prototype.$message.error(response.data.message)
      uni.showToast({
        title:response.data.message,
        icon:"none"
      })
    }
    return response
  },
  err => {
    console.log(err)
    // 失败响应
    if (err && err.response) {
      switch (err.response.status) {
        case 400:
          err.message = '请求无效，请检查参数是否正确!'
          break

        case 401:
          err.message = '未经授权，访问被拒!'
          break

        case 403:
          err.message = '拒绝访问!'
          break

        case 404:
          err.message = `地址不存在!`
          break

        case 408:
          err.message = '请求超时!'
          break

        case 500:
          err.message = '系统错误!'
          break

        case 501:
          err.message = '该方法未实现!'
          break

        case 502:
          err.message = '网关出错!'
          break

        case 503:
          err.message = '服务不可用!'
          break

        case 504:
          err.message = '网关请求超时'
          break

        case 505:
          err.message = 'HTTP版本不受支持'
          break

        default:
      }
      if (err.response.data.error) {
        err.message = err.response.data.error
      }
      // Vue.prototype.$message.closeAll()
      // Vue.prototype.$message.error(err.message)
      uni.showToast({
        title:err.message,
        icon:"none"
      })
      // router.push({name: 'error', params: {message: err.message, status: err.response.status}})
    }
  }
)
*/

const request = (url,data,method='GET',header={})=>new Promise((resolve, reject)=>{
// 是否为当前的请求加上请求头 token
  const token = cookie.get('accessToken')
  const headers = {...header}
  if (token.accessToken) {
    headers['Authorization'] = 'Bearer ' + token.accessToken
  }
  uni.request({
    url: url,
    data: data,
    method: method,
    header: headers,
    success: response => {
      if (response.data.code && response.data.code !=='200' && response.data.message) {
        uni.showToast({
          title:response.data.message,
          icon:"none"
        })
      }else{
        resolve(response)
      }
    },
    fail: err => {
      // 失败响应
      if (err && err.response) {
        switch (err.response.status) {
          case 400:
            err.message = '请求无效，请检查参数是否正确!'
            break

          case 401:
            err.message = '未经授权，访问被拒!'
            break

          case 403:
            err.message = '拒绝访问!'
            break

          case 404:
            err.message = `地址不存在!`
            break

          case 408:
            err.message = '请求超时!'
            break

          case 500:
            err.message = '系统错误!'
            break

          case 501:
            err.message = '该方法未实现!'
            break

          case 502:
            err.message = '网关出错!'
            break

          case 503:
            err.message = '服务不可用!'
            break

          case 504:
            err.message = '网关请求超时'
            break

          case 505:
            err.message = 'HTTP版本不受支持'
            break

          default:
        }
        if (err.response.data.error) {
          err.message = err.response.data.error
        }
        // Vue.prototype.$message.closeAll()
        // Vue.prototype.$message.error(err.message)
        uni.showToast({
          title:err.message,
          icon:"none"
        })
        reject(err)
        // router.push({name: 'error', params: {message: err.message, status: err.response.status}})
      }
    },
  })
})

//真机获取
// service.defaults.adapter = function (config) {
//   return new Promise((resolve, reject) => {
//     console.log(config)
//     var settle = require('axios/lib/core/settle');
//     var buildURL = require('axios/lib/helpers/buildURL');
//     uni.request({
//       method: config.method.toUpperCase(),
//       url: buildURL(config.url, config.params, config.paramsSerializer),
//       header: config.headers,
//       data: config.data,
//       dataType: config.dataType,
//       responseType: config.responseType,
//       sslVerify: config.sslVerify,
//       complete:function complete(response){
//         response = {
//           data: response.data,
//           status: response.statusCode,
//           errMsg: response.errMsg,
//           header: response.header,
//           config: config
//         };
//
//         settle(resolve, reject, response);
//       }
//     })
//   })
// }
export default request
