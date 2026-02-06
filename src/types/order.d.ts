/**
 * 订单相关类型定义
 */

// 订单状态枚举
export enum OrderStatus {
  ALL = -1,           // 全部
  PENDING_PAYMENT = 0, // 未支付
  PENDING_SHIPMENT = 1, // 待发货
  PENDING_RECEIPT = 2,  // 待收货
  PENDING_REVIEW = 3,   // 待评价
  COMPLETED = 4,        // 已完成
  CANCELLED = 5,        // 已取消
  REFUNDING = 6,        // 退款中
  REFUNDED = 7,         // 已退款
  WAIT_FOR_GROUP = 6,   // 待成团
  GROUP_FAILURE = -4,   // 成团失败
  APPLY_REFUND = -1,    // 申请退款
  REFUND_SUCCESS = -2,  // 退款成功
}

// 订单导航项类型
export interface OrderNavItem {
  name: string;
  value: OrderStatus;
  index?: number;
}

// 订单卡片组件属性
export interface OrderCardProps {
  data: Order;
  logoSrc?: string;
}

// 订单列表组件属性
export interface OrderListProps {
  type: OrderStatus;
  refresh: () => void;
  dataList: Order[];
  loadend: boolean;
  loading: boolean;
  listEmpty: boolean;
}

// 订单列表组件事件
export interface OrderListEvents {
  onRefresh: () => void;
  onPay: (orderId: string | number) => void;
  onCheckOffCode: (writeOffCode: string) => void;
}

// 订单操作类型
export interface OrderOperations {
  canCancel: boolean;
  canPay: boolean;
  canApplyRefund: boolean;
  canConfirmReceipt: boolean;
  canDelete: boolean;
  canEvaluate: boolean;
}

// 订单列表状态
export interface OrderListState {
  actionType: number;
  scrollable: boolean;
  navList: OrderNavItem[];
  title: string;
  noticeList: string;
  shouldShowAsStatic: boolean;
}