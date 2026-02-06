<template>
  <view class="order-card">
    <view class="order-header">
      <image :src="logoSrc" class="logo" v-if="logoSrc" />
      <text class="shop-name">{{ data.shopName || '店铺' }}</text>
      <text class="order-status" :class="getStatusClass(data.status)">
        {{ getStatusText(data.status) }}
      </text>
    </view>
    
    <view class="order-products">
      <view 
        class="product-item" 
        v-for="(product, index) in data.products" 
        :key="index"
        @click="goToProduct(product.id)"
      >
        <image :src="product.image" class="product-image" />
        <view class="product-info">
          <text class="product-title">{{ product.name }}</text>
          <text class="product-spec">{{ product.spec || '' }}</text>
          <view class="product-footer">
            <text class="product-price">¥{{ product.price }}</text>
            <text class="product-count">x{{ product.count }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <view class="order-summary">
      <text class="total-text">共{{ getTotalCount }}件商品</text>
      <text class="total-price">合计: ¥{{ data.totalAmount }}</text>
    </view>
    
    <view class="order-actions" v-if="showActions">
      <button 
        class="action-btn cancel" 
        v-if="canCancelOrder(data)"
        @click="emit('cancel', data.id)"
      >
        取消订单
      </button>
      <button 
        class="action-btn pay" 
        v-if="canPayOrder(data)"
        @click="emit('pay', data.id)"
      >
        立即付款
      </button>
      <button 
        class="action-btn refund" 
        v-if="canApplyRefund(data)"
        @click="emit('applyRefund', data.id)"
      >
        申请退款
      </button>
      <button 
        class="action-btn confirm" 
        v-if="canConfirmReceipt(data)"
        @click="emit('confirmReceipt', data.id)"
      >
        确认收货
      </button>
      <button 
        class="action-btn evaluate" 
        v-if="canEvaluateOrder(data)"
        @click="emit('evaluate', data.id)"
      >
        去评价
      </button>
      <button 
        class="action-btn delete" 
        v-if="canDeleteOrder(data)"
        @click="emit('delete', data.id)"
      >
        删除订单
      </button>
      <button 
        class="action-btn check-off" 
        v-if="canShowCheckOffCode(data)"
        @click="emit('checkOffCode', data.writeOffCode)"
      >
        核销码
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Order } from '@/src/types/api';
import { OrderStatus } from '@/src/types/order';

interface Props {
  data: Order;
  logoSrc?: string;
}

interface Emits {
  (e: 'refresh'): void;
  (e: 'pay', orderId: string | number): void;
  (e: 'cancel', orderId: string | number): void;
  (e: 'applyRefund', orderId: string | number): void;
  (e: 'confirmReceipt', orderId: string | number): void;
  (e: 'evaluate', orderId: string | number): void;
  (e: 'delete', orderId: string | number): void;
  (e: 'checkOffCode', code: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  logoSrc: ''
});

const emit = defineEmits<Emits>();

// 计算属性
const showActions = computed(() => !!props.data.status);

const getTotalCount = computed(() => {
  if (!props.data.products) return 0;
  return props.data.products.reduce((sum, product) => sum + (product.count || 1), 0);
});

// 方法
const getStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    [OrderStatus.PENDING_PAYMENT]: '未支付',
    [OrderStatus.PENDING_SHIPMENT]: '待发货',
    [OrderStatus.PENDING_RECEIPT]: '待收货',
    [OrderStatus.PENDING_REVIEW]: '待评价',
    [OrderStatus.COMPLETED]: '已完成',
    [OrderStatus.CANCELLED]: '已取消',
    [OrderStatus.REFUNDING]: '退款中',
    [OrderStatus.REFUNDED]: '已退款',
    [OrderStatus.APPLY_REFUND]: '申请退款',
    [OrderStatus.REFUND_SUCCESS]: '退款成功',
  };
  return statusMap[status] || '未知状态';
};

const getStatusClass = (status: number): string => {
  const classMap: Record<number, string> = {
    [OrderStatus.PENDING_PAYMENT]: 'status-pending-payment',
    [OrderStatus.PENDING_SHIPMENT]: 'status-pending-shipment',
    [OrderStatus.PENDING_RECEIPT]: 'status-pending-receipt',
    [OrderStatus.PENDING_REVIEW]: 'status-pending-review',
    [OrderStatus.COMPLETED]: 'status-completed',
    [OrderStatus.CANCELLED]: 'status-cancelled',
    [OrderStatus.REFUNDING]: 'status-refunding',
    [OrderStatus.REFUNDED]: 'status-refunded',
  };
  return classMap[status] || 'status-unknown';
};

// 订单操作判断方法
const canCancelOrder = (order: Order): boolean => {
  return order.status === OrderStatus.PENDING_PAYMENT || 
         (order.status === OrderStatus.PENDING_SHIPMENT && order.canCancel);
};

const canPayOrder = (order: Order): boolean => {
  return order.status === OrderStatus.PENDING_PAYMENT;
};

const canApplyRefund = (order: Order): boolean => {
  const nonVerificationOrder = order.shippingType !== 2;
  const verificationOrder = order.shippingType === 2;
  
  if (nonVerificationOrder) {
    return [1, 2, 3, 4, 6, 8].includes(order.status);
  } else if (verificationOrder) {
    return [6].includes(order.status);
  }
  
  return false;
};

const canConfirmReceipt = (order: Order): boolean => {
  return order.status === OrderStatus.PENDING_RECEIPT;
};

const canEvaluateOrder = (order: Order): boolean => {
  return order.status === OrderStatus.PENDING_REVIEW;
};

const canDeleteOrder = (order: Order): boolean => {
  return [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(order.status);
};

const canShowCheckOffCode = (order: Order): boolean => {
  return order.shippingType === 2 && 
         ['6', '8'].includes(String(order.status));
};

const goToProduct = (productId: string | number) => {
  uni.navigateTo({
    url: `/pages/product/detail?id=${productId}`
  });
};
</script>

<style lang="scss" scoped>
.order-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .order-header {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .logo {
      width: 40rpx;
      height: 40rpx;
      margin-right: 12rpx;
    }

    .shop-name {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .order-status {
      font-size: 24rpx;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;

      &.status-pending-payment { color: #FF6B35; background: #FFF2EE; }
      &.status-pending-shipment { color: #FFAA00; background: #FFF8E6; }
      &.status-pending-receipt { color: #00C4CC; background: #E6F9F9; }
      &.status-pending-review { color: #67C23A; background: #F0F9FF; }
      &.status-completed { color: #909399; background: #F4F4F5; }
      &.status-cancelled { color: #909399; background: #F4F4F5; }
      &.status-refunding { color: #F56C6C; background: #FEF0EF; }
      &.status-refunded { color: #909399; background: #F4F4F5; }
    }
  }

  .order-products {
    .product-item {
      display: flex;
      padding: 24rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .product-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 12rpx;
        margin-right: 20rpx;
      }

      .product-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .product-title {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 10rpx;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-spec {
          font-size: 24rpx;
          color: #999;
          margin-bottom: 10rpx;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex: 1;

          .product-price {
            font-size: 28rpx;
            color: #FF6B35;
            font-weight: bold;
          }

          .product-count {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
  }

  .order-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 24rpx;
    background: #fafafa;

    .total-text {
      font-size: 24rpx;
      color: #666;
    }

    .total-price {
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
    }
  }

  .order-actions {
    display: flex;
    justify-content: flex-end;
    padding: 20rpx 24rpx;
    border-top: 1rpx solid #f5f5f5;

    .action-btn {
      height: 60rpx;
      line-height: 60rpx;
      padding: 0 24rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      margin-left: 16rpx;
      border: none;

      &.cancel {
        background: #f5f5f5;
        color: #666;
      }

      &.pay, &.confirm, &.evaluate {
        background: #00CBCC;
        color: #fff;
      }

      &.refund, &.delete {
        background: #FF6B35;
        color: #fff;
      }

      &.check-off {
        background: #67C23A;
        color: #fff;
      }
    }
  }
}
</style>