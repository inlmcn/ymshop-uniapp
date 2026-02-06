<template>
	<view class="rich-html" v-if="content">
		<!-- H5 端使用 v-html -->
		<!-- #ifdef H5 -->
		<view v-html="processedContent"></view>
		<!-- #endif -->

		<!-- 小程序端使用 rich-text -->
		<!-- #ifndef H5 -->
		<rich-text :nodes="processedContent"></rich-text>
		<!-- #endif -->
	</view>
</template>

<script setup>
	import {
		computed
	} from 'vue'
	const props = defineProps({
		content: {
			type: String,
			default: ''
		}
	})

	/**
	 * 自动给 <img>、<video> 添加自适应样式
	 * 防止富文本中样式失效
	 */
	const processedContent = computed(() => {
		if (!props.content) return ''
		let html = props.content

		// 统一处理图片样式
		html = html.replace(
			/<img([^>]*?)>/g,
			'<img style="max-width:100%;height:auto;display:block;margin:10rpx auto;border-radius:8rpx;object-fit:contain;" $1>'
		)

		// 视频自适应
		html = html.replace(
			/<video([^>]*?)>/g,
			'<video style="width:100%;border-radius:8rpx;display:block;margin:10rpx 0;" $1>'
		)

		return html
	})
</script>

<style scoped lang="scss">
	.rich-html {
		width: 100%;
		box-sizing: border-box;
		word-break: break-word;
		font-size: 28rpx;
		line-height: 1.6;
		color: #444;
		background: #f8f9fa;
		border-radius: 12rpx;
		padding: 20rpx;

		:deep(img) {
			max-width: 100% !important;
			height: auto !important;
			display: block;
			margin: 10rpx auto;
			border-radius: 8rpx;
		}

		:deep(video) {
			width: 100% !important;
			border-radius: 8rpx;
			display: block;
			margin: 10rpx 0;
		}
	}
</style>