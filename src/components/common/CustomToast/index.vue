<template>
	<view v-if="isShow" class="custom-toast" :class="positionClass">
		<!-- 遮罩层 -->
		<view v-if="mask" class="custom-toast__mask" @tap.stop.prevent></view>
		<!-- 内容区域 -->
		<view class="custom-toast__content">
			<!-- 文本内容，支持换行 -->
			<view v-if="title" class="custom-toast__text">
				<text v-for="(line, index) in textLines" :key="index" class="custom-toast__text-line">{{ line }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

// 响应式数据
const isShow = ref(false)
const title = ref('')
const duration = ref(1500)
const mask = ref(false)
const position = ref('center') // center, top, bottom
const timer = ref(null)
const success = ref(null)
const fail = ref(null)
const complete = ref(null)

// 计算属性
// 文本行数组，支持换行符
const textLines = computed(() => {
	if (!title.value) return []
	// 支持 \n 和 \r\n 换行符
	return String(title.value).split(/\r?\n/)
})

// 位置类名
const positionClass = computed(() => {
	return `custom-toast--${position.value}`
})

/**
 * 显示 toast
 * @param {Object|String} options 配置对象或提示文本
 * @param {String} options.title 提示的内容（支持换行符 \n）
 * @param {Number} options.duration 提示的延迟时间，单位毫秒，默认 1500
 * @param {Boolean} options.mask 是否显示透明蒙层，防止触摸穿透，默认 false
 * @param {String} options.position 提示的位置，可选值：center, top, bottom，默认 center
 * @param {Function} options.success 接口调用成功的回调函数
 * @param {Function} options.fail 接口调用失败的回调函数
 * @param {Function} options.complete 接口调用结束的回调函数
 */
function show(options = {}) {
	// 如果传入的是字符串，转换为对象
	if (typeof options === 'string') {
		options = { title: options }
	}
	
	// 清除之前的定时器
	hide()
	
	// 合并配置
	title.value = options.title || ''
	duration.value = options.duration !== undefined ? options.duration : 1500
	mask.value = options.mask !== undefined ? options.mask : false
	position.value = options.position || 'center'
	success.value = options.success || null
	fail.value = options.fail || null
	complete.value = options.complete || null
	
	// 显示 toast
	isShow.value = true
	
	// 触发 success 回调
	if (typeof success.value === 'function') {
		success.value()
	}
	
	// 设置定时器自动隐藏
	if (duration.value > 0) {
		timer.value = setTimeout(() => {
			hide()
		}, duration.value)
	}
}

function hide() {
	if (timer.value) {
		clearTimeout(timer.value)
		timer.value = null
	}
	isShow.value = false
	
	// 触发 complete 回调
	if (typeof complete.value === 'function') {
		complete.value()
	}
}

// 组件卸载前清理
onBeforeUnmount(() => {
	hide()
})

// 暴露方法给父组件
defineExpose({
	show,
	hide
})
</script>

<style lang="scss" scoped>
.custom-toast {
	position: fixed;
	left: 0;
	right: 0;
	z-index: 9999;
	pointer-events: none;
	display: flex;
	justify-content: center;
	align-items: center;
	
	&--center {
		top: 50%;
		transform: translateY(-50%);
	}
	
	&--top {
		top: 100rpx;
	}
	
	&--bottom {
		bottom: 100rpx;
	}
	
	&__mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: transparent;
		z-index: 9998;
	}
	
	&__content {
		background-color: rgba(0, 0, 0, 0.9);
		border-radius: 16rpx;
		padding: 32rpx 48rpx;
		width: 70%;
		min-width: 120rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		position: relative;
		z-index: 9999;
	}
	
	&__text {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		
		&-line {
			color: #fff;
			font-size: 28rpx;
			line-height: 1.4;
			word-break: break-all;
			word-wrap: break-word;
			
			&:not(:last-child) {
				margin-bottom: 4rpx;
			}
		}
	}
}
</style>

