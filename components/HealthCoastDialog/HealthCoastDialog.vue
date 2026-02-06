<template>
	<view class="health-dialog-mask" v-if="visible" @tap="handleMaskClick">
		<view class="dialog-wrapper">
			<view class="health-dialog-container" @tap.stop>
				<!-- 整个弹窗的背景图片 -->
				<image class="bg-image" :src="COMMON_IMG_PATH + 'G903985.png'" mode="scaleToFill"></image>
				
				<!-- 背景装饰 -->
				<view class="dialog-bg">
					<!-- 品牌标题区域 -->
					<view class="brand-header">
						<text class="brand-title">HealthCoast®</text>
						<text class="brand-subtitle">营养严选</text>
					</view>
				</view>
				
				<!-- 内容区域 -->
				<view class="dialog-content">
					<!-- 图标插槽 -->
					<view class="icon-wrapper" v-if="showIcon">
						<slot name="icon">
							<image class="default-icon" :src="iconUrl" mode="aspectFit"></image>
						</slot>
					</view>
					
					<!-- 标题 -->
					<view class="dialog-title" v-if="title">{{ title }}</view>
					
					<!-- 描述文本 -->
					<view class="dialog-desc" v-if="description">{{ description }}</view>
					
					<!-- 自定义内容插槽 -->
					<slot></slot>
					
					<!-- 按钮区域 -->
					<view class="dialog-buttons">
						<view 
							class="dialog-btn btn-cancel" 
							v-if="showCancel"
							@tap="handleCancel"
						>
							{{ cancelText }}
						</view>
						<view 
							class="dialog-btn btn-confirm" 
							@tap="handleConfirm"
						>
							{{ confirmText }}
						</view>
					</view>
				</view>
			</view>
			
			<!-- 关闭按钮 -->
			<view class="close-btn" @tap="handleClose" v-if="showClose">
				<text class="close-icon">✕</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath'

// 定义组件属性
const props = defineProps({
	// 是否显示弹窗
	visible: {
		type: Boolean,
		default: false
	},
	// 标题
	title: {
		type: String,
		default: '确定要离开?'
	},
	// 描述文本
	description: {
		type: String,
		default: '您正在享受专属健康方案，放弃就太可惜啦!'
	},
	// 是否显示图标
	showIcon: {
		type: Boolean,
		default: true
	},
	// 图标URL
	iconUrl: {
		type: String,
		default: '' // 可以设置默认图标
	},
	// 是否显示取消按钮
	showCancel: {
		type: Boolean,
		default: true
	},
	// 取消按钮文本
	cancelText: {
		type: String,
		default: '我要退出'
	},
	// 确认按钮文本
	confirmText: {
		type: String,
		default: '继续支付'
	},
	// 是否显示关闭按钮
	showClose: {
		type: Boolean,
		default: true
	},
	// 点击遮罩是否关闭
	closeOnClickMask: {
		type: Boolean,
		default: false
	}
})

// 定义事件
const emit = defineEmits(['cancel', 'confirm', 'close', 'update:visible'])

// 方法
const handleCancel = () => {
	emit('cancel')
	emit('update:visible', false)
}

const handleConfirm = () => {
	emit('confirm')
	emit('update:visible', false)
}

const handleClose = () => {
	emit('close')
	emit('update:visible', false)
}

const handleMaskClick = () => {
	if (props.closeOnClickMask) {
		handleClose()
	}
}
</script>

<style lang="scss" scoped>
.health-dialog-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	padding: 0 30rpx;
}

.dialog-wrapper {
	position: relative;
	width: 100%;
	max-width: 600rpx;
}

.health-dialog-container {
	position: relative;
	width: 100%;
	max-width: 600rpx;
	border-radius: 32rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
	
	// 整个弹窗的背景图片
	.bg-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		border-radius: 32rpx;
		display: block;
	}
}

.dialog-bg {
	position: relative;
	padding: 60rpx 40rpx 60rpx;
	z-index: 1;
}

.brand-header {
	position: relative;
	z-index: 1;
	text-align: center;
	
	.brand-title {
		display: block;
		font-size: 40rpx;
		font-weight: 600;
		color: #000000;
		letter-spacing: 2rpx;
	}
	
	.brand-subtitle {
		display: block;
		font-size: 32rpx;
		font-weight: 500;
		color: #000000;
		margin-top: 8rpx;
	}
}

.dialog-content {
	position: relative;
	padding: 60rpx 40rpx 40rpx;
	margin-top: -40rpx;
	z-index: 1;
}

.icon-wrapper {
	display: flex;
	justify-content: center;
	margin-bottom: 40rpx;
	
	.default-icon {
		width: 160rpx;
		height: 160rpx;
	}
}

.dialog-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #000000;
	text-align: center;
	margin-bottom: 24rpx;
	line-height: 1.4;
}

.dialog-desc {
	font-size: 28rpx;
	color: #666666;
	text-align: center;
	line-height: 1.6;
	margin-bottom: 40rpx;
}

.dialog-buttons {
	display: flex;
	gap: 24rpx;
	margin-top: 40rpx;
}

.dialog-btn {
	flex: 1;
	height: 88rpx;
	border-radius: 44rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	font-weight: 500;
	transition: all 0.3s;
	
	&.btn-cancel {
		background: #FFFFFF;
		color: #00CBCC;
		border: 2rpx solid #00CBCC;
		
		&:active {
			opacity: 0.8;
			background: #F0FFFE;
		}
	}
	
	&.btn-confirm {
		background: linear-gradient(135deg, #00D4BA 0%, #00CBCC 100%);
		color: #FFFFFF;
		box-shadow: 0 4rpx 16rpx rgba(0, 191, 165, 0.3);
		
		&:active {
			opacity: 0.9;
			transform: translateY(2rpx);
		}
	}
}

.close-btn {
	position: absolute;
	bottom: -100rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.9);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
	
	.close-icon {
		font-size: 36rpx;
		color: #666666;
		font-weight: 300;
	}
	
	&:active {
		opacity: 0.8;
	}
}
</style>
