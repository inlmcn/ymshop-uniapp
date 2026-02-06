import { requestUtil } from '@/utils/request'


/**
 * 获得banner列表
 */
export function getBanner(data) {
    return requestUtil.get('/market/banner/list', data)
}

/**
 * 获取首页信息
 */
export function getHomeData(data) {
    return requestUtil.get('/product/shop/index', data)
}
