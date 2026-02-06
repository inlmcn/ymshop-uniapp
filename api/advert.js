import { requestUtil } from '@/utils/request'

/**
 * 获得广告列表
 * @param {Object} data { type: 0首页1订单页 }
 */
export function getAdvertList(data) {
    return requestUtil.get('/mall/advert/list', data)
}
