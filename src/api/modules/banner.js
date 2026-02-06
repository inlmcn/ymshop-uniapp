import { requestUtil } from '@/utils/request'


/**
 * 获得轮播图列表
 */
export function getBannerList() {
    return requestUtil.get('/mall/banner/list')
}
