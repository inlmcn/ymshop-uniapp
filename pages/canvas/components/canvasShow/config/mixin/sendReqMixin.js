import { ref } from 'vue';
import request from './server'

export default function () {
  const loading = ref(false)
  /*
  * 发送请求
  */

  function sendReq (params, callback) {
    request(params.url, params.data || {},params.method || 'POST',{
      'Content-type': params.contentType || 'application/json;charset=utf-8'
    }).then((res) => {
      if (res && res.data) {
        callback && callback(res.data)
      }
    }, (error) => {
      console.log(error)
    })
  }
  return {
    loading,
    sendReq
  }
}
