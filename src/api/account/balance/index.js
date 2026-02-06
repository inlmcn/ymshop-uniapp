/**
 * @name: index
 * @author: kahu4
 * @date: 2024-01-25 17:21
 * @description：index
 * @update: 2024-01-25 17:21
 * */
import { requestUtil } from "@/utils/request";

/**
 * 创建充值订单
 * @param data
 * @return {*}
 */
export const createRechargeOrder = (data) => requestUtil.post('/recharge-order/create', data)


/**
 * 获取所有充值配置
 * @return {*}
 */
export const getRechargeConfig = () => requestUtil.get('/recharge-package/get-all-config')

/**
 * 获取用户账单
 * @param params
 * @return {*}
 */
export const pageUserBill = (params) => requestUtil.get('/member/user-bill/page', params)
