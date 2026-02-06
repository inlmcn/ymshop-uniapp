import { requestUtil } from '@/utils/request'


/**
 * 基本信息
 */
export function getUserInfo(data) {
    return requestUtil.get('/member/user/get', data)
}

/**
 * 获取收藏产品,或足迹
 */
export function relationCollectUser(data) {
    return requestUtil.get('/relation/collect/user', data)
}

/**
 * 修改用户头像
 */
export function updateAvatar(data) {
    return requestUtil.post('/member/user/update-avatar', data)
}

/**
 * 修改用户昵称或者生日
 */
export function updateNickname(data) {
    return requestUtil.put(`/member/user/update-nickname?nickname=${ data.nickname }&birthday=${ data.birthday }&sex=${ data.sex }`, data)
}

/**
 * 修改用户手机
 */
export function updateMobile(data) {
    return requestUtil.post('/member/user/update-mobile', data)
}

/**
 * 修改用户信息
 * @param data
 * @returns {*}
 */
export const updateUserInfo = (data) => requestUtil.put(`/member/user/update-nickname?nickname=${ data.nickname }&birthday=${ data.birthday }&sex=${ data.sex }`)

/**
 * 获取网站配置
 */
export function getMallConfig(data) {
    return requestUtil.get('/system/dict-data/get-mall-config', data)
}



export function getNoticeListTop(top,type) {
    return requestUtil.get('/news/list?top='+top+'&type='+type)
}


export function getNotice(id) {
    return requestUtil.get('/news/detail/'+id)
}



