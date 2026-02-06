<template>
	<Header ref="headerRef" :show-return="true" :show-right="true" :prop-up="false" header-area-bg="#fff"
		system-bar-area-bg="#fff">
		<template #left>
			<view class="header-left">
				<uv-icon name="arrow-left" size="20" color="#000" @click="goBack2" />
				<image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
			</view>
		</template>
		<image class="logo-image" :src="COMMON_IMG_PATH + 'logo.png'" />
	</Header>
	<view class="place-order-page" :style="computeMainBoxStyle">
		<view class="success-card">
			<image class="success-icon" :src="COMMON_IMG_PATH + 'duis.png'" mode="aspectFit" />
			<view class="success-title">下单成功！</view>
			<view class="success-subtitle">查看订单进度、咨询售后服务</view>
			<view class="subtitle-hint">请扫码添加健康伙伴</view>

			<view class="qr-section">
				<image class="qr-image" :src="imgCode" :show-menu-by-longpress="true" mode="aspectFit" />
			</view>

			<view class="qr-action">
				<view class="qr-button">长按二维码识别添加</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Header from '@/components/Header/index.vue'
import { useRouter } from '@/hooks/useRouter'
import { COMMON_IMG_PATH } from '@/utils/imgpath'
import { getDictValue } from "@/api/evaluation";

const { goBack, toHome } = useRouter()
const headerRef = ref(null)
const imgCode = ref('')
const getDict = async (dictType, label) => {
	const res = await getDictValue({ dictType, label })
	return res
}

//直接返回到订单列表
const goBack2 =()=>{
	uni.redirectTo({
		url: '/pages/orderList/orderList'
	})
}

// 为主体区域预留Header的高度
const computeMainBoxStyle = computed(() => {
	const height = headerRef.value?.containerHeight ?? 0
	return {
		paddingTop: `${height}rpx`
	}
})

onMounted(async () => {
	imgCode.value = await getDict('mall_config_dict_type', 'qy_wx_img')
})
</script>

<style lang="scss" scoped>
.place-order-page {
	width: 100%;
	min-height: 100vh;
	background-color: #fff;
}

.logo-image {
	width: 234rpx;
	height: 58rpx;
}

.header-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #000;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 20rpx;

	.icon-home {
		width: 48rpx;
		height: 48rpx;
	}
}

.success-card {
	margin: 60rpx auto;
	padding: 60rpx 40rpx 50rpx;
	background: #fff;
	border-radius: 16rpx;
	text-align: center;
}

.success-icon {
	width: 160rpx;
	height: 102rpx;
	margin: 0 auto 24rpx;
}

.success-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #000;
	margin-bottom: 16rpx;
}

.success-subtitle {
	font-size: 28rpx;
	color: #000;
	line-height: 40rpx;
	margin-bottom: 8rpx;
}

.subtitle-hint {
	font-size: 28rpx;
	color: #000;
	line-height: 40rpx;
	margin-bottom: 32rpx;
}

.qr-section {
	margin-bottom: 40rpx;
}

.qr-title {
	font-size: 28rpx;
	color: #000;
	margin-bottom: 20rpx;
}

.qr-image {
	width: 360rpx;
	height: 360rpx;
	margin: 0 auto;
	border-radius: 12rpx;
	border: 1rpx solid #eaeaea;
}

.qr-action {
	display: flex;
	justify-content: center;
}

.qr-button {
	background: #00CBCC;
	border-radius: 48rpx;
	padding: 20rpx 80rpx;
	font-size: 28rpx;
	font-weight: 500;
	color: #fff;
	box-shadow: 0px 8rpx 24rpx 0px rgba(0, 203, 204, 0.25);
}
</style>