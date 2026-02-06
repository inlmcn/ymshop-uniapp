import { requestUtil } from '@/utils/request'

/**
 * 获取优惠券列表
 * @param data
 * @returns {*}
 */
export const getCouponList = (type) => requestUtil.get(`/product/coupon/relation/searchUserCoupon/${ type }`, {})

/**
 * 领取优惠券
 * @param data
 * @returns {*}
 */
export const receiveACoupon = (id) => requestUtil.get(`/product/coupon/relation/receive/${ id }`, {})

/**
 * 查询当前商品优惠券
 * @param data
 * @returns {*}
 */
export const getProductCoupon = (productId) => requestUtil.get(`/product/coupon/receive-list/${ productId }`, {})

/**
 * 查询当前提交订单商品优惠券
 * @param data
 * @returns {*}
 */
export const getCartCoupon = (productId,activityId) => {
    let additional=''
    if(activityId){
        additional+='&activityId='+activityId
    }
    return requestUtil.get(`/cart/coupon?cartIds=${ productId }${additional}`, {})
}

/**
 * 根据ids获取优惠券列表
 * @param data
 * @returns {*}
 */
export const getCouponListById = (data) => requestUtil.get(`/product/coupon/list`, data)

export const getCouponListByClId = (clid) => requestUtil.get(`/product/campaign/getLinkList?id=`+clid,{})


/**
 * 根据code领取优惠券
 * @param code
 * @returns {*}
 */
export const receiveByCdkey = (code) => requestUtil.get(`/product/coupon/relation/receive/cdkey/${code}`)

/**
 * 自动领券接口 （进入小程序就调用）
 */
export const autoReceiveCoupon = () => requestUtil.get(`/product/coupon/check/automatic`)