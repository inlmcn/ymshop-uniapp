/**
 * API相关类型定义
 */

// 通用响应类型
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
  [key: string]: any;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 用户类型
export interface User {
  id: string | number;
  nickname: string;
  avatar: string;
  phone: string;
  isVip: boolean;
  accessToken?: string;
  routineOpenId?: string;
  [key: string]: any;
}

// 订单类型
export interface Order {
  id: string | number;
  orderId: string;
  status: number;
  title: string;
  amount: number;
  createTime: string;
  updateTime: string;
  uid: number;
  unique?: string;
  orderKey?: string;
  shippingType: number;
  [key: string]: any;
}

// 商品类型
export interface Product {
  id: string | number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  stock: number;
  description: string;
  sales: number;
  rating?: number;
  [key: string]: any;
}

// 地址类型
export interface Address {
  id: string | number;
  name: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  detail: string;
  isDefault: boolean;
  [key: string]: any;
}

// 购物车商品类型
export interface CartItem {
  id: string | number;
  productId: string | number;
  productName: string;
  productImage: string;
  price: number;
  count: number;
  selected: boolean;
  [key: string]: any;
}

// 优惠券类型
export interface Coupon {
  id: string | number;
  title: string;
  discount: number;
  condition: number;
  startTime: string;
  endTime: string;
  used: boolean;
  [key: string]: any;
}

// 评价类型
export interface Comment {
  id: string | number;
  userId: string | number;
  userName: string;
  userAvatar: string;
  content: string;
  rating: number;
  createTime: string;
  images?: string[];
  [key: string]: any;
}