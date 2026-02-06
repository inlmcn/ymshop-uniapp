import {requestUtil} from "@/utils/request";

/**
 * 获取活动页 详情
 * @param id
 * @returns {Promise<*>}
 */
export function getActivityPageDetail(id) {
    return requestUtil.get(`/product/marketing/activity/details/${id}`)
}

/**
 * 获取活动页详情下的菜单
 * @param activityId
 * @param menuId
 * @returns {Promise<*>}
 */
export function getActivityPageMenu(activityId, menuId) {
    return requestUtil.get(`/product/marketing/activity/details/tab/${activityId}/${menuId}`)
}