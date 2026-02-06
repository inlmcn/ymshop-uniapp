import { requestUtil } from '@/utils/request'

import { VUE_APP_API_URL } from '@/config'

/**
 * 使用手机 + 验证码登录
 */
export function smsLogin(data) {
    return requestUtil.post('/member/auth/sms-login', data, {login: false})
}

/**
 * 使用手机 + 验证码登录
 */
export function sendSmsCode(data) {
    return requestUtil.post('/member/auth/send-sms-code', data, {login: false})
}

/**
 * 小程序
 */
export function weixinLogin(data) {
    return requestUtil.post('/member/auth/weixin-mini-app-login', data, {login: false})
}

/**
 * 小程序手机号授权
 * @param {Object} data - { phoneCode: string, loginCode: string }
 * @returns {Promise} data: 1=成功, 0=失败
 */
export function weixinMiniAppMobile(data) {
    return requestUtil.post('/member/auth/weixin-mini-app-mobile', data, {login: false})
}

export function checkTheUser(data) {
    return requestUtil.post('/member/auth/checkTheUser', data, {login: false})
}

export function addRoutineOpenId(data) {
    return requestUtil.post('/member/auth/addRoutineOpenId', data, {login: false})
}


/**
 * wechatAuth   
 */
export function wechatAuth(data) {
  return requestUtil.get('/member/auth/auth-wechat-login', data, { login: false })
}


// 用户协议地址
export const userAgreementUrl = `${ VUE_APP_API_URL }/system/dict-data/agreement/1`

// 隐私协议地址
export const privacyAgreementUrl = `${ VUE_APP_API_URL }/system/dict-data/agreement/2`

// 分销商协议地址
export const distributionAgreementUrl = `${ VUE_APP_API_URL }/system/dict-data/get-stream?dictType=distributor_agreement&label=分销商协议`

//获得用户订单角标
export function getUserOrderCorner(){
	return requestUtil.get(`/order/getUserOrderCorner`)
}