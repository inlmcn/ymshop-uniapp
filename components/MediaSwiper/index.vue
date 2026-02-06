<template>
	<view class="media-swiper-container">
		<swiper class="media-swiper" :indicator-dots="indicatorDots" :autoplay="currentAutoplay" :interval="interval"
			:duration="duration" :circular="circular" :indicator-color="indicatorColor"
			:indicator-active-color="indicatorActiveColor" @change="onSwiperChange">
			<swiper-item v-for="(item, index) in mediaList" :key="index">
				<!-- 视频播放器 -->
				<video v-if="item.type === 2" :id="`video-${index}`" class="media-video" :src="item.url"
					:show-center-play-btn="true" :enable-play-gesture="true"
					:object-fit="videoAdaptiveInfo[index]?.objectFit || videoObjectFit"
					:controls="isChildFullscreen[index]" :autoplay="false"
					:show-fullscreen-btn="false" :show-progress="false" :show-picture-in-picture-button="false"
					:picture-in-picture-mode="['push', 'pop']"
					@play="onVideoPlayEvent(index)" @pause="onVideoPause" @error="onVideoError" @ended="handleVideoEnd"
					@timeupdate="onTimeUpdate($event, index)"
					@loadedmetadata="onLoadedMetadata($event, index)" @fullscreenchange="onFullscreenChange($event, index)">
				</video>
				<!-- 自定义控件层 -->
				<view v-if="item.type === 2" class="custom-video-controls" :class="{ 'hide': isChildFullscreen[index] }">
					<!-- 进度条 -->
					<view class="progress-bar-container">
						<text class="time-text">{{ formatVideoTime(videoCurrentTimes[index] || 0) }}</text>
						<slider class="video-slider" 
							:value="videoCurrentTimes[index] || 0" 
							:max="videoDurations[index] || 1" 
							block-size="12" 
							activeColor="#00CBCC" 
							backgroundColor="rgba(255,255,255,0.3)"
							@change="handleSliderChange($event, index)" />
						<text class="time-text">{{ formatVideoTime(videoDurations[index] || 0) }}</text>
						<view class="control-btn fullscreen-btn" @tap.stop="toggleFullscreen(index)">
							<image src="/static/images/fullscreen.png" mode="widthFix" />
						</view>
					</view>
				</view>
				<!-- 图片 -->
				<image v-if="item.type === 1" :src="item.url" class="media-image" :mode="imageMode"
					@tap="handleImagePreview(item.url)">
				</image>
			</swiper-item>
		</swiper>
	</view>
</template>

<script setup>
import { ref, computed, getCurrentInstance, onMounted, reactive, watch } from 'vue'
import { getMediaAdaptiveInfo } from '@/utils/utils'

const instance = getCurrentInstance()

// 定义组件属性
const props = defineProps({
	// 媒体列表 [{type: 1|2, url: string}]
	// type: 1-图片, 2-视频
	mediaList: {
		type: Array,
		default: () => []
	},
	// 轮播图高度
	height: {
		type: String,
		default: '800rpx'
	},
	// 是否显示指示点
	indicatorDots: {
		type: Boolean,
		default: true
	},
	// 是否自动播放
	autoplay: {
		type: Boolean,
		default: false
	},
	// 自动切换时间间隔
	interval: {
		type: Number,
		default: 3000
	},
	// 滑动动画时长
	duration: {
		type: Number,
		default: 400
	},
	// 是否循环
	circular: {
		type: Boolean,
		default: true
	},
	// 指示点颜色
	indicatorColor: {
		type: String,
		default: 'rgba(255, 255, 255, 0.5)'
	},
	// 当前选中的指示点颜色
	indicatorActiveColor: {
		type: String,
		default: '#00CBCC'
	},
	// 图片裁剪模式
	imageMode: {
		type: String,
		default: 'aspectFill'
	},
	// 视频填充模式
	videoObjectFit: {
		type: String,
		default: 'cover'
	},
	// 播放图标大小
	playIconSize: {
		type: Number,
		default: 100
	},
	// 是否启用图片预览
	enableImagePreview: {
		type: Boolean,
		default: true
	}
})

// 定义事件
const emit = defineEmits(['change', 'videoPlay', 'videoEnd', 'imageClick', 'mediaComplete', 'fullscreenchange'])

// 生成唯一组件ID
const componentId = ref(`swiper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

// 视频控制状态
const isPlaying = ref(false)
const currentVideoIndex = ref(-1)

// 轮播当前索引
const currentSwiperIndex = ref(0)
// 动态高度
const dynamicHeight = ref(props.height)

// 视频自适应信息
const videoAdaptiveInfo = reactive({})
// 视频时间跟踪
const videoDurations = reactive({})
const videoCurrentTimes = reactive({})

// 初始化时间跟踪
watch(() => props.mediaList, (newList) => {
	if (newList && newList.length > 0) {
		newList.forEach((item, index) => {
			if (item.type === 2) {
				if (videoDurations[index] === undefined) videoDurations[index] = 0
				if (videoCurrentTimes[index] === undefined) videoCurrentTimes[index] = 0
			}
		})
	}
}, { immediate: true })

const formatVideoTime = (seconds) => {
	if (!seconds) return '00:00'
	const m = Math.floor(seconds / 60)
	const s = Math.floor(seconds % 60)
	return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const onTimeUpdate = (e, index) => {
	videoCurrentTimes[index] = e.detail.currentTime
	videoDurations[index] = e.detail.duration
}

const handleSliderChange = (e, index) => {
	const pos = e.detail.value
	const videoContext = uni.createVideoContext(`video-${index}`, instance)
	if (videoContext) {
		videoContext.seek(pos)
	}
}


// 视频全屏状态
const isChildFullscreen = reactive({})

const onLoadedMetadata = (e, index) => {
	const { width, height } = e.detail
	const info = getMediaAdaptiveInfo(width, height)
	videoAdaptiveInfo[index] = info
	console.log(`视频[${index}]自适应信息:`, info)

	// 如果加载的是当前显示的项，立即更新高度
	if (index === currentSwiperIndex.value) {
		dynamicHeight.value = info.suggestedHeight
	}
}

// 计算当前是否应该自动播放（视频播放时暂停自动播放）
const currentAutoplay = computed(() => {
	return props.autoplay && !isPlaying.value
})

// 检查是否是纯图片轮播
const isImageOnly = computed(() => {
	if (!props.mediaList || props.mediaList.length === 0) return false;
	return props.mediaList.every(item => item.type === 1);
});

// 轮播图切换事件
const onSwiperChange = (e) => {
	const current = e.detail.current
	currentSwiperIndex.value = current

	// 如果切换到其他页面，停止当前视频播放
	if (isPlaying.value && currentVideoIndex.value !== current) {
		// 停止视频播放
		const videoContext = uni.createVideoContext(`video-${currentVideoIndex.value}`, instance)
		if (videoContext) {
			videoContext.pause()
			videoContext.seek(0) // 重置到开始位置
		}
		// 重置进度条
		videoCurrentTimes[currentVideoIndex.value] = 0
		handleVideoEnd()
	}

	emit('change', current)

	// 切换时根据存储的自适应信息更新高度
	if (videoAdaptiveInfo[current]) {
		dynamicHeight.value = videoAdaptiveInfo[current].suggestedHeight
	} else {
		// 如果没用信息（比如是图片），恢复默认高度
		dynamicHeight.value = props.height
	}
}

// 播放视频（现在不需要了，视频自带播放按钮）
const handleVideoPlay = (index) => {
	isPlaying.value = true
	currentVideoIndex.value = index
	emit('videoPlay', index)
}

// 视频加载完成事件
const onVideoLoaded = (index) => {
	console.log('视频加载完成:', index)
}

// 视频实际开始播放事件
const onVideoPlayEvent = (index) => {
	console.log('✅ 视频开始播放:', index)
	isPlaying.value = true
	currentVideoIndex.value = index

	// 暂停其他视频
	props.mediaList.forEach((item, idx) => {
		if (item.type === 2 && idx !== index) {
			const ctx = uni.createVideoContext(`video-${idx}`, instance)
			ctx.pause()
		}
	})

	emit('videoPlay', index)
}

// 暂停所有视频
const pauseAllVideos = () => {
	props.mediaList.forEach((item, index) => {
		if (item.type === 2) {
			const ctx = uni.createVideoContext(`video-${index}`, instance)
			ctx.pause()
		}
	})
}

// 视频暂停事件
const onVideoPause = () => {
	console.log('视频暂停')
	isPlaying.value = false
}

// 视频错误事件
const onVideoError = (e) => {
	console.error('❌ 视频播放错误:', e)
	isPlaying.value = false
	currentVideoIndex.value = -1
}

// 视频播放结束
const handleVideoEnd = () => {
	console.log('视频播放结束')
	// 重置该视频进度
	if (currentVideoIndex.value >= 0) {
		videoCurrentTimes[currentVideoIndex.value] = 0
	}
	
	isPlaying.value = false
	currentVideoIndex.value = -1

	emit('videoEnd')

	// 判断是否是最后一个媒体，如果是，发送 mediaComplete 事件
	if (currentSwiperIndex.value === props.mediaList.length - 1) {
		console.log('媒体流程完成')
		emit('mediaComplete')
	}
}
// 切换全屏
const toggleFullscreen = (index) => {
	console.log('触发全屏切换, 索引:', index)
	const videoContext = uni.createVideoContext(`video-${index}`, instance)
	if (videoContext) {
		const info = videoAdaptiveInfo[index]
		// 立即开启控制栏，确保全屏下有退出按钮
		isChildFullscreen[index] = true
		
		// 如果是横屏视频，进入全屏时旋转90度
		const direction = info?.orientation === 'horizontal' ? 90 : 0
		console.log('请求全屏, 方向:', direction)
		
		videoContext.requestFullScreen({
			direction: direction
		})
	}
}

// 全屏切换事件
const onFullscreenChange = (e, index) => {
	console.log('全屏状态改变:', e.detail.fullScreen, '索引:', index)
	isChildFullscreen[index] = e.detail.fullScreen
	emit('fullscreenchange', e.detail.fullScreen)
}

// 图片预览
const handleImagePreview = (currentUrl) => {
	if (!props.enableImagePreview) {
		emit('imageClick', currentUrl)
		return
	}

	// 只获取图片类型的URL
	const imageUrls = props.mediaList
		.filter(item => item.type === 1)
		.map(item => item.url)

	uni.previewImage({
		current: currentUrl,
		urls: imageUrls
	})

	emit('imageClick', currentUrl)
}



// 暴露方法给父组件
defineExpose({
	// 停止视频播放
	stopVideo: () => {
		if (isPlaying.value && currentVideoIndex.value >= 0) {
			const videoContext = uni.createVideoContext(`video-${currentVideoIndex.value}`)
			if (videoContext) {
				videoContext.pause()
				videoContext.seek(0) // 重置到开始位置
			}
			// 重置进度条
			videoCurrentTimes[currentVideoIndex.value] = 0
			handleVideoEnd()
		}
	},
	// 播放指定索引的视频
	playVideo: (index) => {
		if (props.mediaList[index]?.type === 2) {
			handleVideoPlay(index)
		}
	},
	// 前进到下一个媒体
	goToNextMedia: () => {
		if (currentSwiperIndex.value < props.mediaList.length - 1) {
			currentSwiperIndex.value++
			console.log('前进到第', currentSwiperIndex.value, '个媒体')
			// 使用 uni.createSwiperContext 控制轮播图前进
			const swiperContext = uni.createSwiperContext('.media-swiper', this)
			if (swiperContext) {
				swiperContext.swipeTo({ current: currentSwiperIndex.value, source: 'touch' })
			}
		}
	},
	pauseAllVideos,
	playCurrentVideo: () => {
		const index = currentSwiperIndex.value;
		const currentItem = props.mediaList[index];
		if (currentItem && currentItem.type === 2) {
			const ctx = uni.createVideoContext(`video-${index}`, instance);
			if (ctx) {
				console.log('Playing current video:', index);
				ctx.play();
			}
		}
	}
})
</script>

<style lang="scss" scoped>
.media-swiper-container {
	width: 100%;
	position: relative;
	background: #f5f5f5;
}

.media-swiper {
	width: 100%;
	height: v-bind(dynamicHeight);
	background: transparent;
}

.media-swiper swiper-item {
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
}

.media-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
	transition: transform 0.3s ease;
	border-radius: 16rpx;
}

.media-image:active {
	transform: scale(0.98);
}

.media-video {
	width: 100%;
	height: 100%;
	background-color: transparent;
	animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

.custom-video-controls {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 100rpx;
	background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	padding: 0 20rpx 10rpx;
	z-index: 100;
	transition: opacity 0.3s;
	
	&.hide {
		opacity: 0;
		pointer-events: none;
	}
}

.progress-bar-container {
	display: flex;
	align-items: center;
	width: 100%;
	height: 60rpx;
}

.video-slider {
	flex: 1;
	margin: 0 10rpx;
}

.time-text {
	color: #fff;
	font-size: 20rpx;
	min-width: 60rpx;
	text-align: center;
}

.fullscreen-btn {
	margin-left: 10rpx;
}

.control-btn {
	width: 36rpx;
	height: 36rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	
	image {
		width: 100%;
		height: 100%;
	}
}
</style>
