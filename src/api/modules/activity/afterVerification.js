/**
 * @name: afterVerification
 * @author: kahu4
 * @date: 2024-01-22 10:30
 * @description：核销相关api
 * @update: 2024-01-22 10:30
 * */
import { requestUtil } from "@/utils/request";


/**
 * 订单核销
 * @param data
 * @param data.writeOffCode 核销码
 * @return {*}
 */
export const cancelAfterVerification = (data) => requestUtil.post(`/order/writeOff`, data)
