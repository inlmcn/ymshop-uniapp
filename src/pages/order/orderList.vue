<template>
  <view @touchstart="handlePageTouchStart">
    <uv-sticky bgColor="#fff" customNavHeight="0">
      <uv-navbar :fixed="true" :placeholder="true" :title="title" @leftClick="goUser" />
      <uv-tabs :list="navList" @click="click" :itemStyle="{ width: '100rpx', padding: '15rpx', marginBottom: '10rpx' }"
        lineWidth="100rpx" lineColor="#00CBCC" :current="actionType" :scrollable="scrollable">
      </uv-tabs>
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
		  <uv-notice-bar :text="noticeList" direction="row" color="#00CBCC" bgColor="#E6F9F9" :speed="60" duration="2000"
		    leftIcon="volume" :iconColor="'#00CBCC'"></uv-notice-bar>
		</view>
	</template>
    <view class="orderList">
    <template v-if="!listEmpty">
      <order :data="item" :logoSrc="logoSrc" v-for="(item, index) in dataList" :key="actionType + '_' + index"
        @refresh="handleRefresh" @pay="openPay" @check-off-code="showCheckOffCode" />
    </template>
    <Empty :iconSrc="emptyOrderIcon" v-else>
      您还没有相关订单~
    </Empty>
    <!-- 加载中 -->
    <ListLoadLoading v-if="loading" />
    <!-- 加载完毕-->
    <ListLoadOver v-if="loadend" />
    <!-- 支付面板（保持与 PayPopup 一样的调用方法） -->
    <!-- <PaymentPopup ref="payPopupRef" :isInvite="0" @confirm="paySuccess" /> -->
    <!-- 核销 -->
    <CheckOffCode ref="checkOffCodeRef" />
    <!-- 返回顶部 -->
    <ReturnTop :scroll-top="scrollTop" />
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onPageScroll, onShow } from '@dcloudio/uni-app'
import { orderList } from '@/api/order'
import { useRouter } from "@/hooks/useRouter";
import ListLoadOver from "@/components/ListLoadOver/index.vue"
import ListLoadLoading from "@/components/ListLoadLoading/index.vue"
import Empty from '@/components/Empty/index.vue'
import { emptyOrderIcon } from "@/utils/images";
// import PaymentPopup from '@/components/PaymentPopup/index.vue'
// import { usePay } from "@/hooks/usePay";
import { usePage } from "@/hooks";
import ReturnTop from "@/components/ReturnTop/index.vue";
import { useScroll } from "@/hooks/useScroll";
import CheckOffCode from "@/components/order/CheckOffCode.vue";
import { useMainStore } from "@/store/modules/useMainStore";
import { storeToRefs } from "pinia";
import { useSystem } from "@/hooks/useSystem";
import { orderPayment } from "@/utils/orderPayment";
import { initPageTouchListener } from '@/hooks/useOutsideClick'
import { getAdvertList } from '@/api/advert'

// 初始化页面触摸监听
const handlePageTouchStart = initPageTouchListener()


const { scrollTop } = useScroll()
const { type, refresh, dataList, loadend, loading, listEmpty, debounceRefresh } = usePage(orderList)
const { getUrlParams, pushToTab, push } = useRouter()
const mainStore = useMainStore()
const { logoSrc } = storeToRefs(mainStore);

const noticeList = ref('')
const fetchNoticeData = async () => {
  try {
    const res = await getAdvertList({ type: 1 })
    if (res && res.length > 0) {
		let text = ''
		res.forEach((item,index) => {
			text+=(index+1)+'.'+item.content+' '
		})
		noticeList.value = text
    }
  } catch (e) {
    console.error('获取通知失败', e)
  }
}

// 判断是否需要静态显示
const shouldShowAsStatic = computed(() => {
  // 如果只有一条通知且文字较短，使用静态显示
  if (noticeList.value.length < 25) {
    return true
  }
  return false
})

// 保持与 PayPopup 相同的调用方式，但在订单列表中需要将 orderId 映射为后端所需的 key（一般为 unique）
// const { paySuccess } = usePay()

const actionType = ref(0)
// 根据屏幕宽度与标签数量动态决定是否可滚动，避免在小屏或标签过多时换行/挤压
const scrollable = ref(false)
const navList = ref([
  { name: "全部", value: -1, },
  { name: "未支付", value: 0, },
  // { name: "待成团", value: 5, },
  { name: "待发货", value: 1, },
  { name: "待收货", value: 2, },
  { name: "待评价", value: 3, },
  { name: "已完成", value: 4, },
  // { name: "退款中", value: 5, },
  // { name: "已退款", value: 6, },
  // { name: "退款", value: 7, },
])

const title = computed(() => {
  const find = navList.value.find(item => item.value === type.value);
  return find ? `${find.name}订单` : '订单'
})


const handleRefresh = () => {
  // 确认收货
  if (actionType.value === 2) {
    actionType.value++
    type.value++
  }
  refresh()
}


const click = (data) => {
  // 防止重复点击同一个tab
  if (type.value === data.value) {
    return
  }
  
  // uv-tabs 的 current 需要索引值，这里同步更新 actionType 以避免选中样式错位
  if (typeof data?.index === 'number') {
    actionType.value = data.index
  } else {
    // 兜底：根据 value 反查索引
    const idx = navList.value.findIndex(item => item.value === data?.value)
    actionType.value = idx > -1 ? idx : 0
  }
  // 同步业务查询的类型值
  type.value = data.value
  // 使用防抖刷新，避免频繁切换导致的数据不一致
  debounceRefresh(200)
}

function goUser() {
  pushToTab({ url: '/root/user/user' }, {})
}

// ============================= 核销相关 ==============================
const checkOffCodeRef = ref()

/**
 * 打开核销码
 * @param writeOffCode 核销码
 */
function showCheckOffCode(writeOffCode) {
  checkOffCodeRef.value.open(writeOffCode)
}

onLoad(() => {
	fetchNoticeData()
  const params = getUrlParams()
  // 默认传“全部”类型，当无参数或参数无效时设为 -1
  const paramType = Number(params?.type)
  type.value = isNaN(paramType) ? -1 : paramType
  // 动态适配 uv-tabs 的滚动：当标签数量较多或屏幕较窄时启用滚动
  try {
    const { getWindowInfo } = useSystem()
    const winInfo = typeof getWindowInfo === 'function' ? getWindowInfo() : null
    const screenWidth = winInfo?.screenWidth || 375
    const count = navList.value.length
    // 估算每个标签的最小宽度（包含内边距与下划线），以像素计算
    const minItemPx = 90
    // 如果总宽度超过屏幕宽度，或屏幕特别窄，则开启滚动
    scrollable.value = (count * minItemPx) > screenWidth || screenWidth < 360
  } catch (e) {
    // 兜底逻辑：标签超过 5 个时开启滚动
    scrollable.value = navList.value.length > 5
  }
  // 保证 current 为有效索引，避免 uv-tabs 报 tabRect undefined
  if (Number(type.value) < 0) {
    actionType.value = 0
    return
  }
  const idx = navList.value.findIndex(item => item.value === type.value)
  actionType.value = idx > -1 ? idx : 0
})

onShow(() => {
  refresh()

})
// 返回该页面的获取数据
// uni.$on('update', function (data) {
//   console.log('update')
//   //触发更新后
//   refresh()
// })

onPageScroll((e) => {
})

// ============================= 支付（映射 orderId -> unique） ==============================
async function openPay(orderId) {
  // 根据订单列表数据，尝试找到 unique 或 orderKey 以适配后端
  try {
    const list = Array.isArray(dataList?.value) ? dataList.value : []
    const order = list.find(o => o?.orderId === orderId || o?.id === orderId)
    if (order && (order.unique || order.orderKey)) {
      return handlePayment(order.unique || order.orderKey, order.uid);
    }
  } catch (e) {
    console.warn('openPay 映射失败，尝试直接传入 orderId 作为 key', e)
  }
  // 兜底：直接当作 key 传入
  return handlePayment(orderId);
}

async function handlePayment(orderKey) {
  uni.showLoading({ title: '处理中...', mask: true });
  try {
    await orderPayment(orderKey, {
      onSuccess: () => {
        push?.({ url: '/pages/payStatus/index?status=success&orderId=' + orderKey }, { type: 'redirectTo' });
      }
    }, false)
  } finally {
    uni.hideLoading();
  }
}


</script>

<style lang="scss">
.orderList {
  padding: 0 0 20rpx 0;
}

.notice-bar-wrapper {
  padding: 15rpx 24rpx 0 20rpx;
}
.static-notice{
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
	.notice-icon{
		margin-right: 10rpx;
	}
	.notice-content{
		flex:1;
		color:#00CBCC;
	}
}

.notice-bar-wrapper {
  padding: 10rpx 30rpx 0;
  background-color: #fff;
}
</style>
