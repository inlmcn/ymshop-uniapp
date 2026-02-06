<template>
  <view @touchstart="handlePageTouchStart">
    <uv-sticky bgColor="#fff" customNavHeight="0">
      <uv-navbar 
        :fixed="true" 
        :placeholder="true" 
        :title="title" 
        @leftClick="goUser" 
      />
      <OrderTabs 
        :list="navList" 
        :current="actionType" 
        @change="handleChangeTab" 
      />
    </uv-sticky>
    
    <template v-if="noticeList">
      <view class="static-notice" v-if="shouldShowAsStatic">
        <view class="notice-icon">
          <uv-icon name="volume" size="19" color="#00CBCC"></uv-icon>
        </view>
        <view class="notice-content">
          {{ noticeList }}
        </view>
      </view>
      <view class="notice-bar-wrapper" v-else>
        <uv-notice-bar 
          :text="noticeList" 
          direction="row" 
          color="#00CBCC" 
          bgColor="#E6F9F9" 
          :speed="60" 
          duration="2000"
          leftIcon="volume" 
          :iconColor="'#00CBCC'"
        ></uv-notice-bar>
      </view>
    </template>
    
    <view class="orderList">
      <Empty v-if="listEmpty" :iconSrc="emptyOrderIcon">
        您还没有相关订单~
      </Empty>
      
      <OrderCard 
        v-else
        :data="item" 
        :logo-src="logoSrc" 
        v-for="(item, index) in dataList" 
        :key="actionType + '_' + index"
        @refresh="handleRefresh"
        @pay="openPay"
        @check-off-code="showCheckOffCode"
        @cancel="handleCancelOrder"
        @apply-refund="handleApplyRefund"
        @confirm-receipt="handleConfirmReceipt"
        @evaluate="handleEvaluate"
        @delete="handleDeleteOrder"
      />
      
      <ListLoadLoading v-if="loading" />
      <ListLoadOver v-if="loadend" />
    </view>
    
    <!-- 核销码弹窗 -->
    <CheckOffCode ref="checkOffCodeRef" />
    
    <!-- 返回顶部 -->
    <ReturnTop :scrollTop="scrollTop" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, Ref } from 'vue';
import { onLoad, onPageScroll, onShow } from '@dcloudio/uni-app';
import { orderList } from '@/src/api/modules/order';
import { useRouter } from "@/src/hooks/useRouter";
import ListLoadOver from "@/src/components/common/ListLoadOver/index.vue";
import ListLoadLoading from "@/src/components/common/ListLoadLoading/index.vue";
import Empty from '@/src/components/common/Empty/index.vue';
import { emptyOrderIcon } from "@/src/utils/helpers/images";
import { usePage } from "@/src/hooks";
import ReturnTop from "@/src/components/common/ReturnTop/index.vue";
import { useScroll } from "@/src/hooks/useScroll";
import CheckOffCode from "@/src/components/business/CheckOffCode.vue";
import { useMainStore } from "@/src/stores/modules/useMainStore";
import { storeToRefs } from "pinia";
import { useSystem } from "@/src/hooks/useSystem";
import { orderPayment } from "@/src/utils/helpers/orderPayment";
import { initPageTouchListener } from '@/src/hooks/useOutsideClick';
import { getAdvertList } from '@/src/api/modules/advert';
import OrderTabs from '@/src/components/business/OrderTabs.vue';
import OrderCard from '@/src/components/business/OrderCard.vue';
import type { OrderNavItem } from '@/src/types/order';
import { OrderStatus } from '@/src/types/order';

// 初始化页面触摸监听
const handlePageTouchStart = initPageTouchListener();

const { scrollTop } = useScroll();
const { type, refresh, dataList, loadend, loading, listEmpty, debounceRefresh } = usePage(orderList);
const { getUrlParams, pushToTab, push } = useRouter();
const mainStore = useMainStore();
const { logoSrc } = storeToRefs(mainStore);

const noticeList: Ref<string> = ref('');
const fetchNoticeData = async () => {
  try {
    const res = await getAdvertList({ type: 1 });
    if (res && res.length > 0) {
      let text = '';
      res.forEach((item, index) => {
        text += (index+1) + '.' + item.content + ' ';
      });
      noticeList.value = text;
    }
  } catch (e) {
    console.error('获取通知失败', e);
  }
};

// 判断是否需要静态显示
const shouldShowAsStatic = computed(() => {
  // 如果只有一条通知且文字较短，使用静态显示
  if (noticeList.value.length < 25) {
    return true;
  }
  return false;
});

const actionType = ref(0);

// 订单标签列表
const navList = ref<OrderNavItem[]>([
  { name: "全部", value: OrderStatus.ALL },
  { name: "未支付", value: OrderStatus.PENDING_PAYMENT },
  { name: "待发货", value: OrderStatus.PENDING_SHIPMENT },
  { name: "待收货", value: OrderStatus.PENDING_RECEIPT },
  { name: "待评价", value: OrderStatus.PENDING_REVIEW },
  { name: "已完成", value: OrderStatus.COMPLETED },
]);

const title = computed(() => {
  const find = navList.value.find(item => item.value === type.value);
  return find ? `${find.name}订单` : '订单';
});

const handleRefresh = () => {
  // 确认收货后刷新
  if (actionType.value === 2) {
    actionType.value++;
    type.value++;
  }
  refresh();
});

const handleChangeTab = (data: OrderNavItem) => {
  // 防止重复点击同一个tab
  if (type.value === data.value) {
    return;
  }
  
  // uv-tabs 的 current 需要索引值，这里同步更新 actionType 以避免选中样式错位
  if (typeof data?.index === 'number') {
    actionType.value = data.index;
  } else {
    // 兜底：根据 value 反查索引
    const idx = navList.value.findIndex(item => item.value === data?.value);
    actionType.value = idx > -1 ? idx : 0;
  }
  // 同步业务查询的类型值
  type.value = data.value;
  // 使用防抖刷新，避免频繁切换导致的数据不一致
  debounceRefresh(200);
};

function goUser() {
  pushToTab({ url: '/root/user/user' }, {});
}

// ============================= 核销相关 ==============================
const checkOffCodeRef = ref();

/**
 * 打开核销码
 * @param writeOffCode 核销码
 */
function showCheckOffCode(writeOffCode: string) {
  checkOffCodeRef.value.open(writeOffCode);
}

onLoad(() => {
  fetchNoticeData();
  const params = getUrlParams();
  // 默认传"全部"类型，当无参数或参数无效时设为 -1
  const paramType = Number(params?.type);
  type.value = isNaN(paramType) ? OrderStatus.ALL : paramType;
  
  // 动态适配 uv-tabs 的滚动：当标签数量较多或屏幕较窄时启用滚动
  try {
    const { getWindowInfo } = useSystem();
    const winInfo = typeof getWindowInfo === 'function' ? getWindowInfo() : null;
    const screenWidth = winInfo?.screenWidth || 375;
    const count = navList.value.length;
    // 估算每个标签的最小宽度（包含内边距与下划线），以像素计算
    const minItemPx = 90;
    // 如果总宽度超过屏幕宽度，或屏幕特别窄，则开启滚动
    scrollable.value = (count * minItemPx) > screenWidth || screenWidth < 360;
  } catch (e) {
    // 兜底逻辑：标签超过 5 个时开启滚动
    scrollable.value = navList.value.length > 5;
  }
  
  // 保证 current 为有效索引，避免 uv-tabs 报 tabRect undefined
  if (Number(type.value) < 0) {
    actionType.value = 0;
    return;
  }
  const idx = navList.value.findIndex(item => item.value === type.value);
  actionType.value = idx > -1 ? idx : 0;
});

onShow(() => {
  refresh();
});

onPageScroll((e) => {
  // 页面滚动处理
});

// ============================= 支付（映射 orderId -> unique） ==============================
async function openPay(orderId: string | number) {
  // 根据订单列表数据，尝试找到 unique 或 orderKey 以适配后端
  try {
    const list = Array.isArray(dataList?.value) ? dataList.value : [];
    const order = list.find(o => o?.orderId === orderId || o?.id === orderId);
    if (order && (order.unique || order.orderKey)) {
      return handlePayment(order.unique || order.orderKey, order.uid);
    }
  } catch (e) {
    console.warn('openPay 映射失败，尝试直接传入 orderId 作为 key', e);
  }
  // 兜底：直接当作 key 传入
  return handlePayment(orderId);
}

async function handlePayment(orderKey: string) {
  uni.showLoading({ title: '处理中...', mask: true });
  try {
    await orderPayment(orderKey, {
      onSuccess: () => {
        push?.({ url: '/pages/payStatus/index?status=success&orderId=' + orderKey }, { type: 'redirectTo' });
      }
    }, false);
  } finally {
    uni.hideLoading();
  }
}

// ============================= 订单操作处理 ==============================
const handleCancelOrder = async (orderId: string | number) => {
  // 处理取消订单逻辑
  try {
    uni.showModal({
      title: '提示',
      content: '确定要取消此订单吗？',
      success: async (res) => {
        if (res.confirm) {
          // 调用取消订单API
          // await orderCancel({ orderId });
          // 刷新列表
          refresh();
        }
      }
    });
  } catch (error) {
    console.error('取消订单失败', error);
  }
};

const handleApplyRefund = async (orderId: string | number) => {
  // 处理申请退款逻辑
  try {
    uni.navigateTo({
      url: `/pages/refund/refund?orderId=${orderId}`
    });
  } catch (error) {
    console.error('申请退款失败', error);
  }
};

const handleConfirmReceipt = async (orderId: string | number) => {
  // 处理确认收货逻辑
  try {
    uni.showModal({
      title: '提示',
      content: '确定已收到货了吗？',
      success: async (res) => {
        if (res.confirm) {
          // await orderTake({ orderId });
          refresh();
        }
      }
    });
  } catch (error) {
    console.error('确认收货失败', error);
  }
};

const handleEvaluate = async (orderId: string | number) => {
  // 处理去评价逻辑
  try {
    uni.navigateTo({
      url: `/pages/comment/comment?orderId=${orderId}`
    });
  } catch (error) {
    console.error('跳转评价页面失败', error);
  }
};

const handleDeleteOrder = async (orderId: string | number) => {
  // 处理删除订单逻辑
  try {
    uni.showModal({
      title: '提示',
      content: '确定要删除此订单吗？',
      success: async (res) => {
        if (res.confirm) {
          // await orderDelete({ id: orderId });
          refresh();
        }
      }
    });
  } catch (error) {
    console.error('删除订单失败', error);
  }
};
</script>

<style lang="scss">
.orderList {
  padding: 0 0 20rpx 0;
}

.notice-bar-wrapper {
  padding: 15rpx 24rpx 0 20rpx;
}

.static-notice {
  width: 715rpx;
  margin: 15rpx 24rpx 0 20rpx;
  padding: 18rpx 24rpx;
  box-sizing: border-box;
  background-color: #E6F9F9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20rpx;
  font-size: 28rpx;

  .notice-icon {
    margin-right: 10rpx;
  }

  .notice-content {
    flex: 1;
    color: #00CBCC;
  }
}

.notice-bar-wrapper {
  padding: 10rpx 30rpx 0;
  background-color: #fff;
}
</style>