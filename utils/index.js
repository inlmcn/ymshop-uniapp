/**
 * 保持向后兼容的utils入口文件
 * 用于支持旧的导入路径
 */

// 重新导出新位置的模块以保持向后兼容
export { default as cookie } from '../src/utils/helpers/cookie'
export * from '../src/utils/helpers/utils'
export * from '../src/utils'
export * from '../src/utils/helpers/request'
export * from '../src/utils/helpers/images'
export * from '../src/utils/helpers/orderPayment'
export * from '../src/utils/helpers/wechatUtils'
export * from '../src/utils/helpers/mapUtils'
export * from '../src/utils/helpers/emitter'
export * from '../src/utils/helpers/router'