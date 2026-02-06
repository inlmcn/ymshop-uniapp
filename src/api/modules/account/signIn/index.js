/**
 * @name: index
 * @author: kahu4
 * @date: 2024-01-18 15:40
 * @description：签到
 * @update: 2024-01-18 15:40
 * */
import { requestUtil } from "@/utils/request";


/**
 * 获取用户签到信息
 * @returns {Object} data
 * @returns {number} data.signInDays 连续签到天数
 * @returns {boolean} data.todaySignIn 今天是否签到
 * @returns {Array} data.signInRecordList 签到记录
 * @returns {number} data.signInRecordList.userId 会员id
 * @returns {number} data.signInRecordList.id id
 * @returns {number} data.signInRecordList.integral 积分
 * @returns {string} data.signInRecordList.createTime 时间
 */
export const getSignInInfo = () => requestUtil.get('/member/sign-in-record/signInInfo')


/**
 * 获取每日任务
 * @returns {Object} data
 * @returns {string} data.type 类型
 * @returns {string} data.typeName 类型名称
 * @returns {number} data.integral 获取积分
 * @returns {string} data.attribute1 拓展字段
 * @returns {string} data.id 	评论ID
 * @returns {string} data.createTime	添加时间
 * @returns {string} data.iconUrl
 */
export const getIntegralRule = () => requestUtil.get('/member/sign-in-record/integralRule')

/**
 * 签到
 * @returns {*}
 */
export const signIn = () => requestUtil.get('/member/sign-in-record/signIn')
