/**
 * @name: useService
 * @author: kahu4
 * @date: 2024-01-24 17:35
 * @description：客服
 * @update: 2024-01-24 17:35
 * */
import { useInterface } from "@/hooks/useInterface";
import { onLoad } from "@dcloudio/uni-app";
import { getServiceDetail } from "@/api/global";


const {toast, loading, hideLoading} = useInterface()

export const useService = () => {
    let serviceData = {
        corpId: '',
        accountLink: ''
    }

    /**
     * 获取客服数据
     * @return {Promise<void>}
     */
    async function getServiceData() {
        try {
            loading()
            serviceData = await getServiceDetail();
        } finally {
            hideLoading()
        }
    }

    /**
     * 区分环境打开客服
     * @return {Promise<*>}
     */
    async function openService() {
        if (Reflect.ownKeys(serviceData).length <= 0) return toast({title: '暂无客服~', icon: 'error'})
        if (!serviceData.corpId || !serviceData.accountLink) return toast({title: '暂无客服~', icon: 'error'})
        // #ifdef MP-WEIXIN
        return _miniProgramOpen(serviceData)
        // #endif
        // #ifdef APP-PLUS
        return _appPlusOpen(serviceData)
        // #endif
        // #ifdef H5
        return _h5Open(serviceData)
        // #endif
    }



    return {
        getServiceData,
        openService
    }
}


/**
 * 小程序环境打开客服
 * @param serviceData
 * @return {Promise<unknown>}
 * @private
 */
function _miniProgramOpen(serviceData) {
    return new Promise((resolve, reject) => {
        wx.openCustomerServiceChat({
            extInfo: {
                url: serviceData.accountLink
            },
            corpId: serviceData.corpId,
            success() {
                resolve(true)
            },
            fail(err) {
                reject(err)
            }
        })
    })
}


/**
 * app环境打开客服
 * @param serviceData
 * @return {Promise<unknown>}
 * @private
 */
function _appPlusOpen(serviceData) {
    return new Promise((resolve, reject) => {
        plus.share.getServices(
            res => {
                const wechatServices = res.find(appItem => appItem.id === 'weixin')
                if (!wechatServices) return reject('当前环境不支持微信操作')
                wechatServices.openCustomerServiceChat(
                    {
                        corpid: serviceData.corpId,
                        url: serviceData.accountLink,
                    },
                    () => {
                        resolve(true)
                    },
                    err => {
                        reject(err)
                    })
            },
            err => {
                reject(err)
            }
        )
    })
}


/**
 * h5环境打开客服
 * @param serviceData
 * @return {Promise<Awaited<boolean>>}
 * @private
 */
function _h5Open(serviceData) {
    // window.open(serviceURL) safari浏览器不支持window.open
    window.location.href = serviceData.accountLink
    return Promise.resolve(true)
}
