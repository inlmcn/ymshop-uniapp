/**
 * @name: 支付工具方法
 * @author: kahu4
 * @date: 2023-11-07 11:42
 * @description：支付工具方法
 * @update: 2023-11-07 11:42
 * */
import { useInterface } from "@/hooks/useInterface";
import { getEnvType, WECHAT_PAY_ENV_TYPE } from "@/utils/index";
import { PAY_INSTANCE_TYPE, PayFactory } from "@/utils/payModule";

const {loading, hideLoading} = useInterface()

/**
 * @name: 全局支付
 * @param options {{ type:any, payInfo:any,[x:string]:any }}
 * @param {PAY_INSTANCE_TYPE|string} options.type PAY_INSTANCE_TYPE
 * @param options.payInfo 订单结算返回的结算信息
 * @param options.payInfo.orderId 结算订单id，必填
 * options还可以包含其他自定义参数，比如isGroup等
 * 当支付完成之后，会将请求下单的信息payData，以及当前的options存入缓存，便于跳转后逻辑处理
 */
export async function doPayment(options) {
    try {
        loading?.({title: '支付中...'})
        const {type, payInfo} = options
        const payInstance = PayFactory.getPay(type);
        const envTypeInstanceMap = {
            [WECHAT_PAY_ENV_TYPE.APP]: payInstance.appPay,
            [WECHAT_PAY_ENV_TYPE.MINI_PROGRAM]: payInstance.miniProgramPay,
            [WECHAT_PAY_ENV_TYPE.H5_IN]: payInstance.innerH5Pay,
            [WECHAT_PAY_ENV_TYPE.H5_OUT]: payInstance.outH5Pay,
        }
        return envTypeInstanceMap[getEnvType()].call(payInstance, options.payInfo.orderId, options)
    } finally {
        hideLoading?.()
    }
}
