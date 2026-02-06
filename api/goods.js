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

/**
 * 评论列表
 * @param {Object} data - 请求参数
 * @param {string|number} data.id - 产品ID（必需）
 * @param {string|number} [data.type] - 评价类型：1好评 2中评 3差评 4有图，所有传空
 */
export function replyList(data) {
    // 构建API路径，将id作为路径参数
    const apiUrl = `/product/reply/list/${data.id}`
    // 传递完整的data对象作为查询参数，包括id和type
    console.log('replyList API URL:', apiUrl)
    console.log('replyList queryParams:', data)
    return requestUtil.get(apiUrl, data)
}

export function replyListPids(data) {
    // 构建API路径，将id作为路径参数
    const apiUrl = `/product/reply/list/pids`
    // 传递完整的data对象作为查询参数，包括id和type
    console.log('replyList API URL:', apiUrl)
    console.log('replyList queryParams:', data)
    return requestUtil.get(apiUrl, data)
}

/**
 * 评论列表
 */
export function replyHomeList(data) {
    return requestUtil.get(`/product/reply/home/list`, data)
}


/**
 *  获取可拼团列表
 * @param data
 * @return {*}
 */
export function getCanGroupByList(data) {
    return requestUtil.get('/teamwork/wait-list', data)
}

/**
 * 根据拼团ID获取拼团信息
 * @param data.id
 * @return {*}
 */
export function getGroupByDetailTeamworkId(data) {
    return requestUtil.get('/teamwork/product-detail', data)
}

/**
 * 获取评论类型数量
 * @param data.id
 * @return {*}
 */
export function getCommentTypeCount(id) {
    return requestUtil.get(`/product/reply/quantity/${id}`)
}