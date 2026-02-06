/**
 * @name: index
 * @author: kahu4
 * @date: 2024-01-19 11:25
 * @description：会员等级
 * @update: 2024-01-19 11:25
 * */
import { requestUtil } from "@/utils/request";


/**
 * 获取用户等级信息
 * @return {Promise<{data:Object}>} data
 * @return {number} data.currentGrowthValue 当前成长值
 * @return {number} data.needGrowthValue 升级所需成长值
 * @return {Object} data.currentLevel 当前等级
 * @return {Object} data.nextLevel 下一等级
 */
export const getUserMemberLevel = async () => requestUtil.get('/member/user-level/levelInfo')


/**
 * 获取等级列表
 * @return {Promise<{data:[]}>} data
 * @return data.levelName 等级名称
 * @return data.level 等级
 * @return data.growthValue 成长值
 * @return data.iconUrl 图标
 * @return data.backgroundUrl 背景
 * @return data.status 状态
 * @return data.remarks 说明
 * @return data.id 参数主键
 * @return data.createTime 时间
 * @return data.levelEquityList 管理后台 - 会员等级权益中间 Response VO
 * @return data.colorNum 色号
 */
export const getMemberLevelList = async () => requestUtil.get('/member/user-level/levelConfig')


/**
 * 获取会员等级成长任务
 * @return {Promise<data:[]>} data
 * @return data.type 成长任务类型
 * @return data.typeName 类型名称
 * @return data.growthValue 成长值
 * @return data.id    参数主键
 * @return data.createTime 创建时间
 */
export const getMemberTaskList = async () => requestUtil.get('/member/user-level/growthValueConfig')

/**
 * 获取会员等级权益
 * @param params
 * @param params.levelId 等级id
 * @return {Promise<data:[]>} data
 * @return data.type 类型
 * @return data.typeName 类型名称
 * @return data.iconUrl    图标
 * @return data.equityValue 权益值
 * @return data.id id
 * @return data.createTime 创建时间
 */
export const getMemberEquityList = async (params) => requestUtil.get('/member/user-level/equity', params)

/**
 * 获取积分名称
 * @return {Promise<*>}
 */
export const getIntegralName = async () => requestUtil.get('/system/dict-data/get-value?dictType=integral_config&label=integral_name')
