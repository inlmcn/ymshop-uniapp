/**
 * @name: index
 * @author: kahu4
 * @date: 2024-01-18 15:40
 * @description：分销模块
 * @update: 2024-01-18 15:40
 * */

import { requestUtil } from "@/utils/request";


/**
 * 检查用户是否是分销商
 * @returns {Object} data
 * @returns data.status 状态 -1-非代理商 0-待审核 1-已通过 2-已拒绝
 * @returns data.refuse 拒绝原因
 * @returns data.realName 真实姓名
 * @returns data.levelName 分销等级
 * @returns data.superiorName 推荐人
 * @returns data.addUpWages 总收益
 * @returns data.refuseAmount 待入账佣金
 * @returns data.amount 已入账佣金
 */
export const checkIsDistribution = () => requestUtil.get('/app/distributor/details')

/**
 * 申请成为经销商
 * @param data
 * @param data.realName 真实姓名
 * @param data.address 地址
 * @param data.reason 申请原因
 * @returns {*}
 */
export const applyDistribution = (data) => requestUtil.post('/app/distributor/apply', data)

/**
 * 修改资料
 * @param data
 * @param data.realName 真实姓名
 * @param data.address 地址
 * @param data.reason 申请原因
 * @return {*}
 */
export const updateApply = (data) => requestUtil.post('/app/distributor/update', data)

/**
 * 分页获取我的团队
 * @param params
 * @param params.pageNo
 * @param params.pageSize
 * @param params.type 1 一级 2 二级
 * @return {Promise<*>}
 */
export const pageMyUserTeam = async (params) => requestUtil.get('/app/distributor/user/page', params)

/**
 * 获取用户当天新增人数
 @param params
 *
 * @param params.type 1 一级 2 二级
 * @return {Promise<*>}
 */
export const getUserAddCount = async (params) => requestUtil.get('/app/distributor/user/today-count', params)

/**
 * 获取一二级用户总数
 * @return {Promise<*>}
 */
export const getUserAllCount = async () => requestUtil.get('/app/distributor/user/count')

/**
 * 分页获取佣金列表
 * @param params
 * @param params.pageNo
 * @param params.pageSize
 * @param params.createTime 创建时间 datetime[]
 * @param params.type 类型 1-已入账 4-提现成功
 * @return {Promise<*>}
 */
export const pageCommission = async (params) => requestUtil.get('/app/distributor/wages/page', params)

/**
 * 我的佣金详情
 * @param params
 * @param params.createTime 创建时间 datetime[]
 * @return {Promise<*>}
 */
export const getMyCommissionDetail = async (params) => requestUtil.get('/app/distributor/wages/get', params)

/**
 * 分销订单分页
 * @param params
 * @param params.pageNo
 * @param params.pageSize
 * @param params.createTime 创建时间 datetime[]
 * @return {Promise<*>}
 */
export const pageDistributionOrder = async (params) => requestUtil.get('/app/distributor/order/page', params)

/**
 * 分销收益
 * @param params
 * @param params.createTime 创建时间 datetime[]
 * @return {Promise<*>}
 */
export const getDistributionDetail = async (params) => requestUtil.get('/app/distributor/order/wages', params)
