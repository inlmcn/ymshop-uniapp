import { requestUtil } from '@/utils/request'

/**
 * 添加购物车
 */
export function getCartAdd(data) {
    return requestUtil.post('/cart/add', data)
}

/**
 * 删除购物车
 */
export function getCartDel(data) {
    return requestUtil.delete('/cart/cart/del', data)
}

/**
 * 购物车列表
 */
export function getCartList(data) {
    return requestUtil.get('/cart/cart/list', data)
}

/**
 * 购物车列表
 */
export function getCartNum(data) {
    return requestUtil.post('/cart/num', data)
}

/**
 * 购物车数量
 */
export function getCartCount(data) {
    return requestUtil.get('/cart/count', data)
}

// 清空购物车
export function getCartClear(data) {
    return requestUtil.delete('/cart/cart/delAll', data)
}

// ======================== 👇kahu refactor ================================
/**
 * 改变用户购物车数量
 * @param data {{number:number,id:any}}
 * {number:更改后的数量，id:购物车item的id}
 * @returns {*}
 */
export const updateCartNumber = (data) => requestUtil.post('/cart/num', data)

/**
 * 获取用户已勾选购物车统计数据
 * @param data {{ cartId:string }}
 *  {cartId:购物车id拼接字符串}
 * @returns {*}
 */
export const computeSelectInfo = (data) => requestUtil.post('/order/confirm', data)


/**
 * 根据ids删除购物车
 * @param data {{ ids:string[] }}
 * @returns {*}
 */
export const deleteCartByIds = (data) => requestUtil.delete('/cart/cart/del', data)

/**
 * 更改SKU
 * @param data {{id:number,productId:any,productAttrUnique:any}}
 * @returns {*}
 */
export const changeCartSku = (data) => requestUtil.post('/cart/cart/changeSku', data)
