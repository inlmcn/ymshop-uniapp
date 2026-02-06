/**
 * @name: global
 * @author: kahu4
 * @date: 2024-01-22 17:59
 * @description：global
 * @update: 2024-01-22 17:59
 * */
import { requestUtil } from '@/utils/request'

/**
 * 生成二维码
 * @param data
 * @param {string} data.content 二维码内容
 * @return {*}
 */
export const generateQrCode = (data) => requestUtil.post('/infra/QrCode/generate', data)


/**
 * 生成小程序码
 * @param data
 * @param data.path 小程序跳转路径
 * @return {*}
 */
export const generateMiniProgramQrCode = async (data) => {
    const res = await requestUtil.post('/infra/QrCode/generate-mini', data);
    return `data:image/jpg;base64,${ res }`
}


/**
 * 获取客服链接
 * @return {Promise<*>}
 */
export const getServiceDetail = async () => requestUtil.get('/cp/kf')

/**
 * 获取广告窗口
 * @return {Promise<*>}
 */
export const getAdPopup = async () => requestUtil.get('/shop/popup/get')


/**
 * 根据字典类型获取字典
 * @param type
 * @param label
 * @return {Promise<*>}
 */
export const getDictByType = async (type, label) => {
    return requestUtil.get(`/system/dict-data/get-stream`, {dictType: type, label})
}

/**
 * 创建埋点
 * @param data
 * @return {*}
 */
export const createBuryPoint = (data) => requestUtil.post('/bury-point/create', data)

/**
 * 获取字典类型
 * @return {Promise<*>}
 */
export const getDictType = async (type) => requestUtil.get('/system/dict-data/type', {type: type})

/**
 * 根据页面地址获取分享图片标题
 * @param {string} pageUrl 页面地址
 */
export const getShareTitleByPageUrl = async (pageUrl) => requestUtil.get('/system/customize-page-share/getPageShare', {pageUrl: pageUrl})