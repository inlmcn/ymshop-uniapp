// 导入api接口模块
import { VUE_APP_API_URL } from '@/config'
// 获取当前环境变量 true => 生产环境 false => 开发环境
// const BASEURL = process.env.VUE_APP_DOMAIN_PREFIX
const BASEURL = VUE_APP_API_URL
// const BASEURL = (process.env.NODE_ENV === 'production') ? 'http://127.0.0.1:9007' : 'http://127.0.0.1:9007'


export const api = {
  // 画布模块
  getCanvas: BASEURL + '/shop/canvas/canvas-json', // 读取画布
  getProducts: BASEURL + '/product/canvas/page', // 选择商品查询
  getCoupons: BASEURL + '/product/coupon/list', // 优惠券查询
  takeCoupon: BASEURL + '/product/coupon/relation/receive/', // 领取优惠券
  getActivityProduct: `${BASEURL}/product/campaign/product-page`, // 获取活动商品
  getActivity: `${BASEURL}/product/campaign/get`, // 获取单个活动
  getActivityByType: `${BASEURL}/product/campaign/getByType`, // 根据类型获取单个活动

}
export default api
