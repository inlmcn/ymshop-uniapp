<template>
	<uv-popup ref="popupRef" :mode="mode" :round="round ? 20 : 0" :closeable="closeable" :closeOnClickOverlay="closeOnClickOverlay"
		:safeAreaInsetBottom="safeAreaInsetBottom" :zIndex="zIndex" :customStyle="popupCustomStyle" 
		@change="handleChange" @maskClick="handleMaskClick">
		<!-- 标题区域 -->
		<view v-if="title" class="popup-header">
			<text class="popup-title">{{ title }}</text>
		</view>

		<!-- 内容区域 -->
		<view class="popup-content" :style="contentStyle">
			<slot></slot>
		</view>

		<!-- 底部按钮区域 -->
		<view v-if="showFooter" class="popup-footer">
			<slot name="footer">
				<view class="popup-buttons">
					<uv-button v-if="showCancel" class="popup-button cancel-button" :text="cancelText"
						@click="handleCancel" />
					<uv-button v-if="showConfirm" class="popup-button confirm-button" :text="confirmText" type="primary"
						@click="handleConfirm" />
				</view>
			</slot>
		</view>
	</uv-popup>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import UvPopup from "@/uni_modules/uv-popup/components/uv-popup/uv-popup.vue"
import UvButton from "@/uni_modules/uv-button/components/uv-button/uv-button.vue"

const props = defineProps({
	// 是否显示弹窗
	show: {
		type: Boolean,
		default: false
	},
	// 弹出方向：top, right, bottom, left, center
	mode: {
		type: String,
		default: 'center'
	},
	// 标题
	title: {
		type: String,
		default: ''
	},
	// 是否显示圆角
	round: {
		type: Boolean,
		default: true
	},
	// 是否显示关闭图标
	closeable: {
		type: Boolean,
		default: false
	},
	// 是否点击遮罩层关闭
	closeOnClickOverlay: {
		type: Boolean,
		default: true
	},
	// 是否显示底部
	showFooter: {
		type: Boolean,
		default: false
	},
	// 是否显示取消按钮
	showCancel: {
		type: Boolean,
		default: true
	},
	// 是否显示确认按钮
	showConfirm: {
		type: Boolean,
		default: true
	},
	// 取消按钮文字
	cancelText: {
		type: String,
		default: '取消'
	},
	// 确认按钮文字
	confirmText: {
		type: String,
		default: '确认'
	},
	// 内容区域自定义样式
	contentStyle: {
		type: Object,
		default: () => ({})
	},
	// 弹窗自定义样式
	customStyle: {
		type: Object,
		default: () => ({})
	},
	// 是否适配底部安全区
	safeAreaInsetBottom: {
		type: Boolean,
		default: true
	},
	// 层级
	zIndex: {
		type: [Number, String],
		default: 10075
	}
})

const emit = defineEmits(['update:show', 'close', 'cancel', 'confirm'])

const popupRef = ref(null)

// 监听 show 属性变化
watch(() => props.show, (newVal) => {
	if (newVal) {
		popupRef.value?.open?.()
	} else {
		popupRef.value?.close?.()
	}
}, { immediate: true })

// 合并弹窗样式
const popupCustomStyle = computed(() => {
	return {
		...props.customStyle
	}
})

// 处理弹窗状态变化
const handleChange = (e) => {
	if (!e.show) {
		emit('update:show', false)
		emit('close')
	}
}

// 处理遮罩层点击
const handleMaskClick = () => {
	if (props.closeOnClickOverlay) {
		emit('update:show', false)
		emit('close')
	}
}

// 取消按钮
const handleCancel = () => {
	emit('cancel')
	emit('update:show', false)
	emit('close')
}

// 确认按钮
const handleConfirm = () => {
	emit('confirm')
}
</script>

<style lang="scss" scoped>
.popup-header {
	padding: 32rpx 32rpx 16rpx;
	border-bottom: 1rpx solid #F5F5F5;
}

.popup-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	line-height: 45rpx;
}

.popup-content {
	padding: 32rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.popup-footer {
	padding: 16rpx 32rpx 32rpx;
	border-top: 1rpx solid #F5F5F5;
}

.popup-buttons {
	display: flex;
	gap: 20rpx;
}

.popup-button {
	flex: 1;
	height: 80rpx;
	border-radius: 40rpx;
}

.cancel-button {
	background-color: #F5F5F5;
	color: #666;
}

.confirm-button {
	background: linear-gradient(90deg, #333 0%, #666 100%);
}
</style>
