<template>
	<!-- 富文本内容 -->
	<view v-if="type === 'richtext' && content" class="research-section">
		<view v-if="title" class="research-title">{{ title }}</view>
		<view class="detail-content">
			<rich-text :nodes="formatRichHtml(content)"></rich-text>
			<view v-if="richImages.length" class="rich-images">
				<image v-for="(url, idx) in richImages" :key="idx" :src="url" class="rich-image" mode="widthFix"
					@longpress="onImageLongPress(url)" />
			</view>
		</view>
	</view>

	<!-- 图片轮询 - 卡片式 -->
	<view v-else-if="type === 'carousel' && imageStr" class="image-carousel-section">
		<!-- 轮播卡片 -->
		<view class="carousel-card-wrapper">
			<swiper v-if="carouselImages.length > 0" class="card-swiper" :indicator-dots="false"
				:autoplay="autoplay || false" :interval="interval || 3000" :circular="circular !== false"
				:previous-margin="'0rpx'" :next-margin="'200rpx'" @change="onSwiperChange">
				<swiper-item v-for="(item, index) in carouselImages" :key="index" class="swiper-item">
					<view class="card-content" :class="{ 'active': currentIndex === index }">
						<!-- 图片 -->
						<image :src="item.url" class="card-image" mode="widthFix"
							@longpress="onImageLongPress(item.url)"
							@error="(e) => console.error('图片加载失败:', item.url, e)"
							@load="(e) => console.log('图片加载成功:', item.url)" />

						<!-- 描述文字 -->
						<view v-if="item.description" class="card-description">
							<text class="description-text">{{ item.description }}</text>
						</view>
					</view>
				</swiper-item>
			</swiper>

			<!-- 自定义指示器 -->
			<view v-if="carouselImages.length > 1" class="custom-indicator">
				<view v-for="(item, index) in carouselImages" :key="index"
					:class="['indicator-dot', { 'active': currentIndex === index }]"></view>
			</view>
		</view>
	</view>

	<!-- 信息区块（带中英文标题） -->
	<view v-else-if="type === 'info'" class="info-section">
		<view class="info-title" @click="toggleExpand">
			<view class="title-left">
				<text class="title-text">{{ title || '' }}</text>
				<view class="title-en-wrapper" v-if="titleEn">
					<text class="title-en">{{ titleEn }}</text>
					<view class="expand-btn">
						<uv-icon :name="isExpanded ? 'arrow-up' : 'arrow-down'" size="16" color="#999"
							class="expand-icon" />
					</view>
				</view>
			</view>
		</view>
		<view v-show="isExpanded" class="info-content">
			<rich-text v-if="content" :nodes="formatInfoHtml(content)"></rich-text>
			<view v-if="infoImages.length" class="info-images">
				<image v-for="(url, idx) in infoImages" :key="idx" :src="url" class="info-image" mode="widthFix"
					@longpress="onImageLongPress(url, idx)" />
			</view>
			<!-- 二维码图片（长按识别） -->
			<view v-if="showQrcode && qrcodeImage" class="qrcode-section">
				<image :src="qrcodeImage" class="qrcode-image" :show-menu-by-longpress="true" mode="widthFix" />
			</view>
			<view v-else-if="!content" class="empty-content">
				<text class="empty-text">暂无内容</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import UvIcon from '@/uni_modules/uv-icon/components/uv-icon/uv-icon.vue'

// 当前轮播索引
const currentIndex = ref(0)

// 轮播切换事件
const onSwiperChange = (e) => {
	currentIndex.value = e.detail.current
}

const props = defineProps({
	// 内容类型：richtext-富文本, carousel-图片轮询, info-信息区块
	type: {
		type: String,
		required: true,
		validator: (value) => ['richtext', 'carousel', 'info'].includes(value)
	},
	// 内容（富文本或信息区块使用）
	content: {
		type: String,
		default: ''
	},
	// 图片字符串（图片轮询使用，逗号分隔）
	imageStr: {
		type: String,
		default: ''
	},
	// 标题（富文本和信息区块使用）
	title: {
		type: String,
		default: ''
	},
	// 英文标题（信息区块使用）
	titleEn: {
		type: String,
		default: ''
	},
	// 图片轮询高度
	height: {
		type: String,
		default: '800rpx'
	},
	// 是否显示指示器
	indicatorDots: {
		type: Boolean,
		default: true
	},
	// 是否自动播放
	autoplay: {
		type: Boolean,
		default: false
	},
	// 自动播放间隔
	interval: {
		type: Number,
		default: 3000
	},
	// 是否循环播放
	circular: {
		type: Boolean,
		default: true
	},
	// 指示器颜色
	indicatorColor: {
		type: String,
		default: 'rgba(255, 255, 255, 0.5)'
	},
	// 当前指示器颜色
	indicatorActiveColor: {
		type: String,
		default: '#00CBCC'
	},
	// 是否默认展开（信息区块使用）
	defaultExpanded: {
		type: Boolean,
		default: true
	},
	// 是否显示二维码长按识别功能
	showQrcode: {
		type: Boolean,
		default: false
	},
	// 二维码图片 URL
	qrcodeImage: {
		type: String,
		default: ''
	}
})

// 展开/收缩状态（仅信息区块使用）
const isExpanded = ref(props.defaultExpanded)

// 切换展开/收缩状态
const toggleExpand = () => {
	if (props.type === 'info') {
		isExpanded.value = !isExpanded.value
	}
}

// 格式化富文本内容
const formatContent = (content) => {
	if (!content) return ''
	return content.replace(
		/<img/gi,
		'<img style="max-width:100%;height:auto;display:block;margin:0 auto;"'
	)
}

const stripImgs = (html) => {
	if (!html) return ''
	return html.replace(/<img[^>]*>/gi, '')
}

const extractImageUrls = (html) => {
	if (!html) return []
	const urls = []
	const regex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi
	let m
	while ((m = regex.exec(html)) !== null) {
		if (m[1]) urls.push(m[1])
	}
	return urls
}

const formatRichHtml = (content) => stripImgs(content)
const richImages = computed(() => extractImageUrls(props.content))

const formatInfoHtml = (content) => {
	if (!content) return ''
	const noImg = content.replace(/<img[^>]*>/gi, '')
	return noImg
}

const infoImages = computed(() => extractImageUrls(props.content))

// 处理图片轮询数据
const carouselImages = computed(() => {
	if (!props.imageStr) return []

	let imageUrls = []
	const trimmedStr = props.imageStr.trim()

	try {
		// 判断是否为 JSON 数组格式（以 [ 开头，以 ] 结尾）
		if (trimmedStr.startsWith('[') && trimmedStr.endsWith(']')) {
			// 尝试解析为标准 JSON 格式
			try {
				// 先尝试直接解析
				imageUrls = JSON.parse(trimmedStr)
			} catch {
				// 如果不是标准 JSON，手动处理
				// 移除首尾的方括号
				const content = trimmedStr.slice(1, -1).trim()
				if (content) {
					// 按逗号分割，并清理每个 URL
					imageUrls = content.split(',').map(url => {
						// 移除首尾的引号、空格等
						return url.trim().replace(/^["'`\[\]]+|["'`\[\]]+$/g, '')
					})
				}
			}
		} else {
			// 普通逗号分隔格式
			imageUrls = trimmedStr.split(',').map(url => url.trim())
		}
	} catch (error) {
		console.error('解析图片数据失败:', error, props.imageStr)
		// 降级处理：按逗号分割
		imageUrls = trimmedStr.split(',').map(url => url.trim())
	}

	// 过滤空值并格式化
	return imageUrls
		.filter(url => {
			const cleaned = url.trim().replace(/^["'`\[\]]+|["'`\[\]]+$/g, '')
			return cleaned && cleaned.length > 0
		})
		.map((url, index) => {
			// 清理 URL（移除引号、反引号、方括号等）
			const cleanUrl = url.trim().replace(/^["'`\[\]]+|["'`\[\]]+$/g, '')
			return {
				type: 1, // 1表示图片
				url: cleanUrl,
				description: '' // 可以后续扩展支持描述文字
			}
		})
})

const getImageUrlsForType = computed(() => {
	if (props.type === 'carousel') {
		return (carouselImages.value || []).map(i => i.url)
	}
	if (props.type === 'richtext') {
		return richImages.value || []
	}
	if (props.type === 'info') {
		return infoImages.value || []
	}
	return []
})

const downloadAndSave = (url) => {
	// #ifdef MP-WEIXIN
	uni.downloadFile({
		url,
		success: (res) => {
			if (res.statusCode === 200) {
				uni.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: () => {
						uni.showToast({ title: '已保存到相册', icon: 'success' })
					},
					fail: () => {
						uni.showToast({ title: '保存失败', icon: 'none' })
					}
				})
			} else {
				uni.previewImage({ current: url, urls: [url] })
			}
		},
		fail: () => {
			uni.previewImage({ current: url, urls: [url] })
		}
	})
	// #endif
	// #ifndef MP-WEIXIN
	uni.previewImage({ current: url, urls: [url] })
	// #endif
}

const onImageLongPress = (url, idx) => {
	const urls = getImageUrlsForType.value
	// #ifdef MP-WEIXIN
	uni.showActionSheet({
		itemList: ['保存到相册', '预览'],
		success: (res) => {
			if (res.tapIndex === 0) {
				downloadAndSave(url)
			} else {
				uni.previewImage({ current: url, urls: urls && urls.length ? urls : [url] })
			}
		}
	})
	// #endif
	// #ifndef MP-WEIXIN
	uni.previewImage({ current: url, urls: urls && urls.length ? urls : [url] })
	// #endif
}

// 二维码长按识别
const onQrcodeLongPress = (url) => {
	// #ifdef MP-WEIXIN
	uni.showActionSheet({
		itemList: ['识别二维码', '保存到相册'],
		success: (res) => {
			if (res.tapIndex === 0) {
				// 识别二维码 - 使用 wx.scanCode
				if (uni.$u?.vuex?.user) {
					uni.scanCode({
						success: (res) => {
							console.log('扫码结果:', res);
							uni.showToast({
								title: '识别成功',
								icon: 'success'
							})
						},
						fail: () => {
							uni.showToast({
								title: '识别失败',
								icon: 'none'
							})
						}
					})
				}
			} else if (res.tapIndex === 1) {
				downloadAndSave(url)
			}
		}
	})
	// #endif
	// #ifndef MP-WEIXIN
	uni.previewImage({ current: url, urls: [url] })
	// #endif
}
</script>

<style lang="scss" scoped>
/* 富文本区域 */
.research-section {
	// background: #fff;
	// margin-bottom: 20rpx;
}

.research-title {
	font-size: 36rpx;
	font-weight: 700;
	color: $uni-text-color;
	margin-bottom: 30rpx;
}

.detail-content {
	box-sizing: border-box;
	word-break: break-word;
	text-align: center;
	background-color: #fff;
}

.detail-content image,
.detail-content img {
	display: block;
	margin: 0 auto;
	max-width: 100%;
	height: auto;
	object-fit: contain;
	box-sizing: border-box;
}

/* 图片轮询区域 - 卡片式 */
.image-carousel-section {
	width: 100%;
	background: #f8f8f8;
	margin-bottom: 20rpx;
}

.carousel-card-wrapper {
	position: relative;
	width: 100%;
	padding-left: 30rpx;
}

.card-swiper {
	width: 100%;
	height: 840rpx;
}

.swiper-item {
	display: flex;
	align-items: flex-start;
	justify-content: flex-start;
	padding: 20rpx 15rpx 20rpx 0;
	height: 100%;
}

.card-content {
	width: 100%;
	height: auto;
	background: #F8F8F8;
	border-radius: 20rpx;
	padding: 0;
	box-sizing: border-box;
	position: relative;
	display: flex;
	flex-direction: column;
	transform: scale(0.95);
	opacity: 0.5;
	transition: all 0.3s ease;
	overflow: hidden;
}

.card-content.active {
	transform: scale(1);
	opacity: 1;
}

.card-image {
	width: 100%;
	height: auto;
	border-radius: 20rpx 20rpx 0 0;
	display: block;
}

.card-description {
	padding: 30rpx;
	line-height: 1.6;
}

.description-text {
	font-size: 26rpx;
	color: #666;
	line-height: 1.8;
}

.custom-indicator {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	margin-top: 30rpx;
}

.indicator-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background: #E0E0E0;
	transition: all 0.3s ease;
}

.indicator-dot.active {
	// width: 32rpx;
	border-radius: 8rpx;
	background: #000;
}

/* 信息区块样式 */
.info-section {
	padding: 40rpx 0;
	background: #fff;
	// margin-bottom: 20rpx;//
}

.info-title {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 1rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid #f0f0f0;
	cursor: pointer;
	user-select: none;
	padding: 0 30rpx;
}

.title-left {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.title-text {
	font-size: 36rpx;
	font-weight: 700;
	color: $uni-text-color;
	margin-bottom: 8rpx;
}

.title-en-wrapper {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
}

.title-en {
	font-size: 24rpx;
	color: $uni-text-color-grey;
	font-weight: 400;
	flex: 1;
}

.expand-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 4rpx;
	flex-shrink: 0;
}

.expand-icon {
	transition: transform 0.3s ease;
}

.info-content {
	font-size: 28rpx;
	color: $uni-text-color;
	line-height: 1.8;
	overflow: hidden;
	transition: all 0.3s ease;

	:deep(img) {
		max-width: 100% !important;
		height: auto !important;
		display: block;
		margin: 20rpx auto;
		border-radius: 8rpx;
	}
}

// .rich-images {
// 	margin-top: 20rpx;
// }

.rich-image {
	width: 100%;
	height: auto;
	border-radius: 8rpx;
	display: block;
}

.info-images {
	margin-top: 20rpx;
}

.info-image {
	width: 100%;
	height: auto;
	border-radius: 8rpx;
	display: block;
}

/* 二维码样式 */
.qrcode-section {
	margin-top: 30rpx;
	text-align: center;
}

.qrcode-image {
	width: 100%;
	height: auto;
	border-radius: 8rpx;
	display: block;
	margin: 0 auto;
	// border: 2rpx solid #f0f0f0;
	// box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.qrcode-tip {
	display: block;
	margin-top: 16rpx;
	font-size: 24rpx;
	color: #999;
	text-align: center;
}

.empty-content {
	padding: 40rpx 0;
	text-align: center;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}
</style>
