/**
 * 类型定义文件 (JavaScript注释版)
 * 
 * 为将来迁移到TypeScript做准备
 */

/*
 * 订单类型定义
 * @typedef {Object} Order
 * @property {string|number} id - 订单ID
 * @property {number} status - 订单状态
 * @property {string} title - 订单标题
 * @property {number} amount - 订单金额
 * @property {string} createTime - 创建时间
 * @property {string} updateTime - 更新时间
 */

/*
 * 用户类型定义
 * @typedef {Object} User
 * @property {string|number} id - 用户ID
 * @property {string} nickname - 用户昵称
 * @property {string} avatar - 头像URL
 * @property {string} phone - 手机号
 * @property {boolean} isVip - 是否VIP
 */

/*
 * 商品类型定义
 * @typedef {Object} Product
 * @property {string|number} id - 商品ID
 * @property {string} name - 商品名称
 * @property {number} price - 价格
 * @property {string} image - 商品图片
 * @property {number} stock - 库存
 * @property {string} description - 描述
 */

/*
 * 地址类型定义
 * @typedef {Object} Address
 * @property {string|number} id - 地址ID
 * @property {string} name - 收货人姓名
 * @property {string} phone - 收货人电话
 * @property {string} province - 省份
 * @property {string} city - 城市
 * @property {string} area - 区域
 * @property {string} detail - 详细地址
 * @property {boolean} isDefault - 是否默认地址
 */

export default {};