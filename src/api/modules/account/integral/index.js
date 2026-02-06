/**
 * @name: index
 * @author: kahu4
 * @date: 2024-01-19 14:56
 * @description：index
 * @update: 2024-01-19 14:56
 * */
import { requestUtil } from "@/utils/request";


/**
 * 分页获取用户积分
 * @param params
 * @param params.pageNo
 * @param params.pageSize
 * @param params.pm 0支出1获得
 * @return {Promise<*>}
 */
export const pageIntegralBill = async (params) => requestUtil.get('/member/user-bill/page', params)

/**
 * 获取提现方式列表
 * @return {Promise<*>}
 */
export const getWithDrawMethodList = async () => requestUtil.get('/app/distributor/wages/withdrawal-method-list')


/**
 * 添加提现方式
 * @return {Promise<*>}
 */
export const addWithDrawMethod = async () => requestUtil.post('/app/distributor/wages/create')


/**
 * 添加提现方式
 * @return {Promise<*>}
 */
export const updateWithDrawMethod = async (data) => requestUtil.post('/app/distributor/wages/update', data)


/**
 * 提现
 * @param data
 * @param data.id
 * @param data.amount 提现金额
 * @return {Promise<*>}
 */
export const withDrawNow = async (data) => requestUtil.post('/app/distributor/wages/withdraw', data)

/**
 * 分享获得积分
 * @return {Promise<*>}
 */
export const shareToAddIntegral = async () => requestUtil.get('/member/user-bill/shareGoods')
