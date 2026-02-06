import devConfig from './env/dev'
import prodConfig from './env/prod'

const isDev = process.env.NODE_ENV === 'development'

// 根据环境选择不同的环境配置
const config = isDev ? devConfig : prodConfig

export const VUE_APP_API_URL = config.app_api_url // 请求API地址
export const VUE_APP_UPLOAD_URL = config.app_upload_url // 上传文件地址
export const VUE_APP_STATIC_URL = config.app_static_url // 静态资源路径
export const TENCENT_AD_API_URL = config.tencent_ad_api_url // 腾讯广告API地址


export const VUE_SHARE_TITLE = '邀请您使用HealthCoast~'
//export const VUE_H5_DOMAIN_NAME = "http://yx.free.svipss.top/h5/#"
export const VUE_H5_DOMAIN_NAME = "https://b2c.yixiang.co/h5/#"
export const IS_DEMO = true //生产环境false

export const APP_ID = 'wx6a4405fbe351b0f9'
// export const APP_ID = 'wx6a4405fbe351b0f9'

// 腾讯广告（Tencent Ads）相关配置
// 请将下面的账号 ID 替换为你的“广告主账号 ID”（整数）。
// 如果暂时没有该 ID，可保持为 0，则前端在登录后不会触发创建数据源。
export const TENCENT_ADS_ACCOUNT_ID = 64520661
// 数据源名称，可按需自定义；用于 user_action_set 的 name 字段
export const TENCENT_ADS_DATASET_NAME = 'HealthCoast'
// （仅联调/测试用）腾讯广告 access_token 的前端常量配置，不建议生产环境使用
// 如需在前端硬编码方便联调，请在本地修改为你的 token；发布前务必置空或改为从本地缓存/后端获取
export const TENCENT_ADS_ACCESS_TOKEN = '133354b2ce10c95ff17b3d492f5f90b1'

// 企业微信客服配置
export const CUSTOMER_SERVICE = {
    // 企业ID（从企业微信后台获取）
    corpId: 'ww4a649ca60c6d3d0d',
    // 客服ID（从企业微信后台获取）
    kfId: 'kfcfb0b472c119eac24',
    // 客服链接
    url: 'https://work.weixin.qq.com/kfid/kfcfb0b472c119eac24',
    // 是否启用
    enabled: true,
    // 客服工作时间
    workTime: '9:00-18:00',
    // 客服电话（可选）
    phone: '400-xxx-xxxx'
}

const orderListStatus = {}





// -1:申请退款
// -2:退货成功
// 0:待发货；
// 1:待收货；
// 2:已收货；
// 3:待评价；
// -1:已退款

export const orderStatus = {
    0: '未支付',
    1: '待发货',
    2: '待收货',
    3: '待评价',
    4: '已完成',
    5: '退款中',
    6: '已退款',
    7: '退款',
}

export const orderReStatus = {
    0: '等待买家付款',
    // 1: '等待卖家发货',
    1: '卖家已发货',
    2: '等待买家待评价',
    3: '订单已完成',
    4: '订单退款中',
    5: '订单已退款',
    6: '退款已完成',
    '-1': '申请退款中',
    99: '等待卖家发货',
}

export const refundOrderStatus = {
    0: '等待平台审核',
    1: '平台已审核',
    2: '用户已发货',
    3: '退款成功',
    4: '用户取消',
    5: '商家拒绝',
    6: '超时取消'
}

