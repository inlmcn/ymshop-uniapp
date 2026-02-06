import { CacheKey } from "@/utils/config";
import { createMessage } from "@/utils/index";
import { payOrder } from "@/api/order";
import { useJump } from "@/hooks/useJump";
import {aliIcon, balanceIcon, friendsIcon, wechatIcon} from "@/utils/images";
import {useRouter} from "@/hooks/useRouter";
const {push} = useRouter()
// ==================== 👇 私有化 非暴露类 start 👇 =======================

// 支付类型（后端接口from）
const ServiceFrom = {
    'h5': 'h5', // H5（微信内h5、微信外H5）
    'weixin': 'weixin_applet', // 微信小程序
    'app': 'weixin_app', // 微信APP
}

// 支付类型（后端接口payType）
const ServicePayType = {
    'h5': 'weixin_h5', // H5（微信外H5）服务端定义的类型字段，前端使用者注意区分
    'weixin-h5': 'weixin', // h5 微信内h5 服务端定义的类型字段，前端使用者注意区分
    'weixin': 'weixin_applet', // 微信小程序微信支付
    'app': 'weixin_app', // APP微信支付
    'yue': 'yue', // 余额支付
}

/**
 * 下单pojo类
 */
class PlaceOrderPOJO {
    from
    payType
    orderId
    helpPay
    /**
     *
     * @param from 服务来源构造方法
     * @param {ServiceFrom} from
     * @param {ServicePayType} payType
     * @param {string} orderId 订单id
     */
    constructor(from, payType, orderId, helpPay) {
        this.from = from
        this.payType = payType
        this.orderId = orderId
        this.helpPay = helpPay
    }
}


/**
 * 支付工具类
 */
class PayUtils {
    static instance
    static WECHAT_PROVIDER = 'wxpay' // 微信支付的provider
    static getInstance() {
        if (!PayUtils.instance) {
            PayUtils.instance = new PayUtils()
        }
        return PayUtils.instance
    }

    /**
     * 下单，获取支付信息
     * @param {PlaceOrderPOJO} payOrderInfo
     * @return {Promise<object>}
     */
    async doPayOrder(payOrderInfo) {
        return await payOrder(payOrderInfo)
    }

    /**
     * 设置缓存信息
     * @param {PlaceOrderPOJO} payOrderInfo
     * @param {any} options
     */
    setCache(payOrderInfo, options) {
        uni.setStorageSync(CacheKey.PAY_INFO, JSON.stringify({payData: payOrderInfo, options}))
    }
}

/**
 * 支付接口
 */
class PayInterface {
    constructor() {
        if (this.constructor === PayInterface.prototype.constructor)
            throw new SyntaxError(`PayInterface is not a constructor, It's an interface, Do not construct it with new`)
    }

    /**
     * app支付
     * @param orderId 订单id
     * @param options
     * @param options.type PayType 0微信 1余额 2支付宝
     * @param options.payInfo 订单结算返回的结算信息
     * @param options.payInfo.orderId 结算订单id，必填
     * @return {Promise<void>}
     */
    appPay(orderId, options) {
        throw new Error('appPay method must be implemented in subclass')
    }


    /**
     * 小程序支付
     * @param orderId 订单id
     * @param options
     * @param options.type PayType 0微信 1余额 2支付宝
     * @param options.payInfo 订单结算返回的结算信息
     * @param options.payInfo.orderId 结算订单id，必填
     * @return {Promise<void>}
     */
    miniProgramPay(orderId, options) {
        throw new Error('miniProgramPay method must be implemented in subclass')
    }

    /**
     * 程序内h5支付
     * @param orderId 订单id
     * @param options
     * @param options.type PayType 0微信 1余额 2支付宝
     * @param options.payInfo 订单结算返回的结算信息
     * @param options.payInfo.orderId 结算订单id，必填
     * @return {Promise<void>}
     */
    innerH5Pay(orderId, options) {
        throw new Error('innerH5Pay method must be implemented in subclass')
    }

    /**
     * 程序外h5支付
     * @param orderId 订单id
     * @param options
     * @param options.type PayType 0微信 1余额 2支付宝
     * @param options.payInfo 订单结算返回的结算信息
     * @param options.payInfo.orderId 结算订单id，必填
     * @return {Promise<void>}
     */
    outH5Pay(orderId, options) {
        throw new Error('outH5Pay method must be implemented in subclass')
    }
}

/**
 * 微信支付实现类
 */
class WechatPay extends PayInterface {

    constructor() {
        super()
    }

    appPay(orderId, options) {
        return new Promise(async (resolve, reject) => {
            const instance = PayUtils.getInstance()
            const payData = new PlaceOrderPOJO(ServiceFrom['app'], ServicePayType['app'], orderId, options.helpPay)
            const {appId, merchant_id, timeStamp, paySign, out_trade_no, nonceStr} = await instance.doPayOrder(payData)
            instance.setCache(payData, options)
            uni.requestPayment({
                provider: PayUtils.WECHAT_PROVIDER,
                orderInfo: {
                    appid: appId, // 微信开放平台审核通过的移动应用AppID 。
                    prepayid: merchant_id, // 请填写商户号mchid对应的值。
                    timestamp: timeStamp, // 时间
                    sign: paySign, // 签名，使用字段AppID、timeStamp、nonceStr、prepayid计算得出的签名值 注意：取值RSA格式
                    partnerid: out_trade_no, // 微信返回的支付交易会话ID，该值有效期为2小时。
                    noncestr: nonceStr, // 随机字符串，不长于32位。推荐随机数生成算法。
                    package: 'Sign=WXPay', // 暂填写固定值Sign=WXPay
                },
                success: (res) => resolve(createMessage('用户支付成功', res)),
                fail: (error) => reject(createMessage('用户支付失败', error))
            })
        })
    }

    miniProgramPay(orderId, options) {
        return new Promise(async (resolve, reject) => {
            const instance = PayUtils.getInstance()
            const payData = new PlaceOrderPOJO(ServiceFrom['weixin'], ServicePayType['weixin'], orderId, options.helpPay)
            const {timeStamp, nonceStr, signType, paySign, package: packAge} = await instance.doPayOrder(payData)
            instance.setCache(payData, options)
            // 缓存支付信息
            uni.setStorageSync(CacheKey.PAY_INFO, JSON.stringify({payData, options}))
            // 发起微信小程序支付
            uni.requestPayment({
                timeStamp,
                nonceStr,
                signType,
                paySign,
                package: packAge,
                provider: PayUtils.WECHAT_PROVIDER,
                success: (res) => resolve(createMessage('用户支付成功', res)),
                fail: (error) => reject(createMessage('用户支付失败', error))
            })
        })
    }

    innerH5Pay(orderId, options) {
        return new Promise(async (resolve, reject) => {
            const instance = PayUtils.getInstance()
            const payData = new PlaceOrderPOJO(ServiceFrom['h5'], ServicePayType['weixin-h5'], orderId, options.helpPay)
            const {
                appId,
                timeStamp,
                nonceStr,
                paySign,
                package: packAge,
                signType,
            } = await instance.doPayOrder(payData)
            // 注册微信JS_SDK
            jweixin.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId, // 必填，公众号的唯一标识
                timestamp: timeStamp, // 必填，生成签名的时间戳
                nonceStr, // 必填，生成签名的随机串
                signature: paySign, // 必填，签名，见附录1
                jsApiList: ['chooseWXPay'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
            /** JS SDK 可使用状态 */
            jweixin.ready(() => {
                /** 检查JS SDK API是否可用 */
                jweixin.checkJsApi({
                    jsApiList: ['chooseWXPay'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                    success: () => {
                        instance.setCache(payData, options)
                        /** 去拉起微信支付 */
                        jweixin.chooseWXPay({
                            timestamp: timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                            nonceStr: nonceStr, // 支付签名随机串，不长于 32 位
                            package: packAge, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                            signType: signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                            paySign: paySign, // 支付签名
                            success: (res) => {
                                // 支付成功后的回调函数
                                resolve(createMessage('用户支付成功', res))
                            },
                            cancel: (r) => {
                                reject(createMessage('用户取消支付', {}))
                            },
                            fail: (error) => {
                                reject(createMessage('跳转微信支付失败', error))
                            }
                        });
                    },
                    fail: (error) => {
                        reject(createMessage('微信版本过低，请升级微信版本', error))
                    }
                });
            });
            /** JS SDK发生错误 */
            jweixin.error((error) => {
                reject(createMessage('JS-SDK加载错误', error))
            });
        })
    }

    outH5Pay(orderId, options) {
        return new Promise(async (resolve, reject) => {
            const instance = PayUtils.getInstance()
            const payData = new PlaceOrderPOJO(ServiceFrom['h5'], ServicePayType['h5'], orderId, options.helpPay)
            const {mwebUrl} = await instance.doPayOrder(payData)
            if (mwebUrl) {
                // 缓存支付订单数据
                uni.setStorageSync(CacheKey.PAY_INFO, JSON.stringify({payData, options}))
                location.replace(mwebUrl)
                return Promise.resolve(createMessage('拉起支付成功', {type: 'h5'}))
            } else {
                return Promise.reject(createMessage('服务端拉起支付失败', {type: 'h5', error: '错误'}))
            }
        })
    }
}

/**
 * 支付宝支付实现类
 */
class AliPay extends PayInterface {
    constructor() {
        super();
    }

    appPay(orderId, options) {
        return Promise.reject("暂不支持支付宝支付")
    }

    miniProgramPay(orderId, options) {
        return Promise.reject("暂不支持支付宝支付")
    }

    innerH5Pay(orderId, options) {
        return Promise.reject("暂不支持支付宝支付")
    }

    outH5Pay(orderId, options) {
        return Promise.reject("暂不支持支付宝支付")
    }
}

/**
 * 本地支付类
 */
class LocalPay extends PayInterface {
    PAY_STATUS_PATH = '/pages/payStatus/index' // 支付成功后的跳转地址

    constructor() {
        super();
    }

    appPay(orderId, options) {
        const payData = new PlaceOrderPOJO(ServiceFrom['app'], ServicePayType['yue'], orderId, options.helpPay)
        return this.doBalancePay(orderId, payData, options)
    }

    miniProgramPay(orderId, options) {
        const payData = new PlaceOrderPOJO(ServiceFrom['weixin'], ServicePayType['yue'], orderId, options.helpPay)
        return this.doBalancePay(orderId, payData, options)
    }

    innerH5Pay(orderId, options) {
        const payData = new PlaceOrderPOJO(ServiceFrom['h5'], ServicePayType['yue'], orderId, options.helpPay)
        return this.doBalancePay(orderId, payData, options)
    }

    outH5Pay(orderId, options) {
        const payData = new PlaceOrderPOJO(ServiceFrom['h5'], ServicePayType['yue'], orderId, options.helpPay)
        return this.doBalancePay(orderId, payData, options)
    }

    /**
     * 余额支付
     * @param orderId
     * @param payData
     * @param options
     * @return {Promise<Object>}
     */
    async doBalancePay(orderId, payData, options) {
        const payInstance = PayUtils.getInstance()
        const res = await payInstance.doPayOrder(payData)
        payInstance.setCache(payData, options)
        // 余额支付支付完直接跳转
        push({url: this.PAY_STATUS_PATH}, {type: 'redirectTo'})
        return res
    }
}


/**
 * 好友帮支付类
 */
class FriendsPay extends PayInterface {

    constructor() {
        super();
    }

    appPay(orderId, options) {
        return this.doFriendsPay(orderId)
    }

    miniProgramPay(orderId, options) {
        return this.doFriendsPay(orderId)
    }

    innerH5Pay(orderId, options) {
        return this.doFriendsPay(orderId)
    }

    outH5Pay(orderId, options) {
        return this.doFriendsPay(orderId)
    }

    /**
     * 好友代付
     * @param orderId
     * @return {Promise<Object>}
     */
    async doFriendsPay(orderId) {
        push({url: '/pages/friendsPay/friendsPay'}, {type: 'redirectTo',data:{id:orderId}})
    }
}

// ==================== 👆 私有化 非暴露类 end 👆 =======================


// 支付实现类枚举
export const PAY_INSTANCE_TYPE = {
    ALI: 'ali',
    LOCAL: 'local',
    WECHAT: 'wechat',
    FRIENDS: 'friends'
}

// 支付实现类枚举对应map
const PAY_INSTANCE_TYPE_MAP = {
    [PAY_INSTANCE_TYPE.ALI]: AliPay,
    [PAY_INSTANCE_TYPE.LOCAL]: LocalPay,
    [PAY_INSTANCE_TYPE.WECHAT]: WechatPay,
    [PAY_INSTANCE_TYPE.FRIENDS]: FriendsPay
}

/**
 * 支付方式
 * @type {[{icon: string, eLabel: string, disabled: boolean, label: string, type: string},{icon: string, eLabel: string, disabled: boolean, label: string, type: string},{icon: string, eLabel: string, disabled: boolean, label: string, type: string}]}
 */
export const payRows = [
    {
        label: '微信支付',
        eLabel: 'Wechat Pay',
        icon: wechatIcon,
        type: PAY_INSTANCE_TYPE.WECHAT,
        disabled: false

    },
    {
        label: '余额支付',
        eLabel: 'Balance Pay',
        icon: balanceIcon,
        type: PAY_INSTANCE_TYPE.LOCAL,
        disabled: false
    },
    // {
    //     label: '支付宝支付',
    //     eLabel: 'ALi Pay',
    //     icon: aliIcon,
    //     type: PAY_INSTANCE_TYPE.ALI,
    //     disabled: true
    // },
    {
        label: '好友代付款',
        eLabel: 'Friends Pay',
        icon: friendsIcon,
        type: PAY_INSTANCE_TYPE.FRIENDS,
        disabled: false
    },
]

/**
 * 支付静态工厂
 */
export class PayFactory {

    /**
     * 获取支付实例
     * @param {PAY_INSTANCE_TYPE|string} type
     */
    static getPay(type) {
        return new PAY_INSTANCE_TYPE_MAP[type]()
    }
}
