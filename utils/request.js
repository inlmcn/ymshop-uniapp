import { VUE_APP_API_URL, VUE_APP_UPLOAD_URL } from "@/config";
import cookie from "@/utils/cookie";
import { handleLoginFailure } from "@/utils/index";
import qs from 'qs'

function baseUrl() {
    let url
    // #ifdef H5
    // h5开发环境直接走代理 vite.config.js
    if (process.env.NODE_ENV === 'development') {
        url = '/HealthCoast-api'
    } else {
        url = VUE_APP_API_URL
    }
    // #endif
    // #ifndef H5
    url = VUE_APP_API_URL
    // #endif
    return url
}

class RequestUtil {

    // 超时时间（毫秒）
    requestTimeout = 60000
    // 默认参数
    defaultOptions = {}


    /**
     * 请求
     * @param options
     * @return {Promise<any>}
     */
    doRequest(options = {}) {
        options = this.beforeRequest(options)
        return new Promise((resolve, reject) => {
            uni.request({
                ...options,
                url: `${ baseUrl() }${ options.url }`,
                timeout: this.requestTimeout,
                success: (res) => {
                    this.afterResponse(res, resolve, reject)
                },
                fail: (err) => {
                    uni.showToast({title: '请求出错了', icon: 'none'})
                    console.error(err)
                    reject(err)
                }
            })
        })
    }

    /**
     * 外部绝对地址请求（不拼接 baseUrl，不走业务后端 code 拦截）
     * 适用于第三方平台（例如腾讯广告等）
     * @param options { url: string, method?: 'GET'|'POST'|'PUT'|'DELETE', header?: object, data?: any }
     * @return {Promise<any>} 直接返回 res.data
     */
    external(options = {}) {
        // 合并默认项，但不附加 Authorization，也不拼接 baseUrl
        const reqOptions = {
            timeout: this.requestTimeout,
            ...options,
        }
        return new Promise((resolve, reject) => {
            uni.request({
                ...reqOptions,
                success: (res) => {
                    if (res.statusCode !== 200) return reject(res.data)
                    resolve(res.data)
                },
                fail: (err) => {
                    console.error(err)
                    reject(err)
                }
            })
        })
    }

    /**
     * 请求拦截器
     * @param options
     */
    beforeRequest(options) {
        // 合并options，用户优先
        options = {
            header: {},
            ...this.defaultOptions,
            ...options
        }
        // 设置header
        const token = cookie.get('accessToken')
        options.header = {
            ...options.header,
            Authorization: token.accessToken ? 'Bearer ' + token.accessToken : '',
        }
        // 处理get参数被吃掉问题
        if (options.method && options.method.toLowerCase() === 'get' && options.data) {
            // 如果是get请求，且params是数组类型如arr=[1,2]，则转换成arr=1&arr=2
            // const newData = stringify(options.data)
            // delete options.data;
            const data = qs.stringify(options.data);
            if (data) {
                delete options.data
                options.url = `${ options.url }?${ data }`;
            }
        }
        return options
    }

    /**
     * 响应拦截器（处理器）
     * @param res {RequestSuccessCallbackResult} 响应
     * @param resolve
     * @param reject
     */
    afterResponse(res, resolve, reject) {
        // 注意：不要在此处全局调用 uni.hideLoading()
        // 1) 有的页面/模块并未调用 uni.showLoading()，强制 hide 会触发 “请注意 showLoading 与 hideLoading 必须配对使用” 警告；
        // 2) 让各业务页面自行在 try/finally 中配对 show/hide，避免干扰。
        if (res.errMsg === 'uploadFile:ok') {
            res.data = JSON.parse(res.data)
        }
        // 请求statusCode非200
        if (res.statusCode !== 200) {
            return reject(res.data)
        }
        const {data} = res
        // 无权限
        if ([401].includes(data.code)) {
            handleLoginFailure()
            return reject(data)
        }
        // 拦截后端响应code
        if (![0, 200].includes(data.code)) {
            if ([1008007023].includes(data.code)) {
                return reject(data)
            }
            setTimeout(() => {
                uni.showToast({title: data.msg, icon: 'none'})
            }, 50)
            return reject(data)
        }
        resolve(data.data)
    }

    /**
     * get
     * @param url
     * @param data
     * @return {Promise<*>}
     */
    get(url, data = {}) {
        return this.doRequest({
            url,
            data,
            method: 'GET'
        })
    }

    /**
     * post
     * @param url
     * @param data
     * @return {Promise<*>}
     */
    post(url, data = {}) {
        return this.doRequest({
            url,
            data,
            method: 'POST'
        })
    }

    /**
     * put
     * @param url
     * @param data
     * @return {Promise<*>}
     */
    put(url, data = {}) {
        return this.doRequest({
            url,
            data,
            method: 'PUT'
        })
    }

    /**
     * delete
     * @param url
     * @param data
     * @return {Promise<*>}
     */
    delete(url, data = {}) {
        return this.doRequest({
            url,
            data,
            method: 'DELETE'
        })
    }

    /**
     * 上传
     * @param options
     * @return {Promise<unknown>}
     * @doc https://zh.uniapp.dcloud.io/api/request/network-file.html
     */
    upload(options) {
        options = this.beforeRequest(options)
        return new Promise((resolve, reject) => {
            uni.uploadFile({
                ...options,
                url: `${ baseUrl() }${ options.url || VUE_APP_UPLOAD_URL }`,
                success: (uploadFileRes) => {
                    this.afterResponse(uploadFileRes, resolve, reject)
                },
                fail(err) {
                    reject(err)
                }
            })
        })
    }

    /**
     * 下载
     * @param url
     * @return {Promise<unknown>}
     * @doc https://zh.uniapp.dcloud.io/api/request/network-file.html
     */
    download(url) {
        return new Promise((resolve, reject) => {
            Request.downLoadTask = uni.downloadFile({
                url,
                success: (res) => {
                    if (res.statusCode === 200) {
                        return resolve(res)
                    }
                    return reject(res)
                },
                fail: (err) => {
                    reject(err)
                }
            });
        })
    }
}


export const requestUtil = new RequestUtil()
