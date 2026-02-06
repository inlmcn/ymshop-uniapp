<template>
	<view class="media-section-wrapper"
		v-if="(productMainImages && productMainImages.length > 0) || (broadcasterMediaList && broadcasterMediaList.length > 0) || (formulaMediaList && formulaMediaList.length > 0)">
		<!-- 轮播图容器 -->
		<view class="media-section" v-if="currentTab === 'main' && productMainImages && productMainImages.length > 0"
			@touchstart="handleTouchStart" @touchend="handleTouchEnd">
			<MediaSwiper ref="mainSwiperRef" :media-list="productMainImages" height="750rpx" :indicator-dots="false"
				:autoplay="false" :interval="3000" :circular="true" indicator-color="rgba(255, 255, 255, 0.5)"
				indicator-active-color="#00CBCC" video-object-fit="contain" @videoPlay="onVideoPlay"
				@videoEnd="onVideoEnd" @mediaComplete="onMainMediaComplete" @change="onSwiperChange"
				@fullscreenchange="$emit('fullscreenchange', $event)" />
			<view class="swiper-indicator">
				{{ (Math.max(0, previousMainSwiperIndex) + 1) + '/' + productMainImages.length }}
			</view>
		</view>

		<!-- 主播讲解：轮播或视频 -->
		<view class="media-section"
			v-if="currentTab === 'broadcaster' && broadcasterMediaList && broadcasterMediaList.length > 0"
			@touchstart="handleTouchStart" @touchend="handleTouchEnd">
			<MediaSwiper ref="broadcasterSwiperRef" v-if="isBroadcasterSwiper" :media-list="broadcasterMediaList"
				height="422rpx" :indicator-dots="false" :autoplay="false" :interval="3000" :circular="true"
				indicator-color="rgba(255, 255, 255, 0.5)" indicator-active-color="#00CBCC" video-object-fit="cover"
				@videoPlay="onBroadcasterSwiperVideoPlay" @videoEnd="onBroadcasterVideoEnd"
				@mediaComplete="onBroadcasterMediaComplete" @change="onBroadcasterSwiperChange"
				@fullscreenchange="$emit('fullscreenchange', $event)" />
			<video v-else id="broadcaster-video" class="media-video-player"
				:src="typeof broadcasterMediaList[0] === 'object' ? broadcasterMediaList[0].url : broadcasterMediaList[0]"
				:show-center-play-btn="true" :enable-play-gesture="true" :object-fit="broadcasterVideoFit"
				:controls="isBroadcasterFullscreen"
				:show-picture-in-picture-button="false" :autoplay="false"
				:show-fullscreen-btn="false" :show-progress="false"
				:picture-in-picture-mode="['push', 'pop']"
				@play="onBroadcasterVideoPlay" @ended="onBroadcasterVideoEnd"
				@timeupdate="onBroadcasterTimeUpdate"
				@loadedmetadata="onLoadedMetadata($event, 'broadcaster')"
				@fullscreenchange="onBroadcasterFullscreenChange"
				:style="{ height: broadcasterVideoHeight }">
			</video>
			<!-- 自定义控件层 (仅在非轮播模式下) -->
			<view v-if="!isBroadcasterSwiper" class="custom-video-controls" :class="{ 'hide': isBroadcasterFullscreen }">
				<view class="progress-bar-container">
					<text class="time-text">{{ formatVideoTime(broadcasterCurrentTime) }}</text>
					<slider class="video-slider" 
						:value="broadcasterCurrentTime" 
						:max="broadcasterDuration || 1" 
						block-size="12" 
						activeColor="#00CBCC" 
						backgroundColor="rgba(255,255,255,0.3)"
						@change="handleSliderChange($event, 'broadcaster-video')" />
					<text class="time-text">{{ formatVideoTime(broadcasterDuration) }}</text>
					<view class="control-btn fullscreen-btn" @tap.stop="toggleFullscreen('broadcaster-video')">
						<image src="/static/images/fullscreen.png" mode="widthFix" />
					</view>
				</view>
			</view>
		</view>

		<!-- 配方讲解：轮播或视频 -->
		<view class="media-section" v-if="currentTab === 'formula' && formulaMediaList && formulaMediaList.length > 0"
			@touchstart="handleTouchStart" @touchend="handleTouchEnd">
			<MediaSwiper ref="formulaSwiperRef" v-if="isFormulaSwiper" :media-list="formulaMediaList" height="422rpx"
				:indicator-dots="false" :autoplay="false" :interval="3000" :circular="true"
				indicator-color="rgba(255, 255, 255, 0.5)" indicator-active-color="#00CBCC" video-object-fit="cover"
				@videoPlay="onFormulaSwiperVideoPlay" @videoEnd="onFormulaVideoEnd"
				@mediaComplete="onFormulaMediaComplete" @change="onFormulaSwiperChange"
				@fullscreenchange="$emit('fullscreenchange', $event)" />
			<video v-else id="formula-video" class="media-video-player"
				:src="typeof formulaMediaList[0] === 'object' ? formulaMediaList[0].url : formulaMediaList[0]"
				:show-center-play-btn="true" :enable-play-gesture="true" :object-fit="formulaVideoFit"
				:controls="isFormulaFullscreen"
				:show-picture-in-picture-button="false" :autoplay="false"
				:show-fullscreen-btn="false" :show-progress="false"
				:picture-in-picture-mode="['push', 'pop']"
				@play="onFormulaVideoPlay" @ended="onFormulaVideoEnd"
				@timeupdate="onFormulaTimeUpdate"
				@loadedmetadata="onLoadedMetadata($event, 'formula')"
				@fullscreenchange="onFormulaFullscreenChange"
				:style="{ height: formulaVideoHeight }">
			</video>
			<!-- 自定义控件层 (仅在非轮播模式下) -->
			<view v-if="!isFormulaSwiper" class="custom-video-controls" :class="{ 'hide': isFormulaFullscreen }">
				<view class="progress-bar-container">
					<text class="time-text">{{ formatVideoTime(formulaCurrentTime) }}</text>
					<slider class="video-slider" 
						:value="formulaCurrentTime" 
						:max="formulaDuration || 1" 
						block-size="12" 
						activeColor="#00CBCC" 
						backgroundColor="rgba(255,255,255,0.3)"
						@change="handleSliderChange($event, 'formula-video')" />
					<text class="time-text">{{ formatVideoTime(formulaDuration) }}</text>
					<view class="control-btn fullscreen-btn" @tap.stop="toggleFullscreen('formula-video')">
						<image src="/static/images/fullscreen.png" mode="widthFix" />
					</view>
				</view>
			</view>
		</view>

		<!-- 左下角 Tabs 按钮（浮动覆盖） -->
		<!-- 重要：使用 cover-view 才能在原生视频组件（单个视频模式）之上收听点击事件 -->
		<cover-view class="media-tabs-wrapper" v-if="showTabs">
			<cover-view class="media-tabs">
				<cover-view class="media-tab-item" :class="{ 'active': currentTab === 'main' }" @tap.stop="switchTab('main')"
					v-if="productMainImages && productMainImages.length > 0">
					产品主图
				</cover-view>
				<cover-view class="media-tab-item" :class="{ 'active': currentTab === 'broadcaster' }"
					@tap.stop="switchTab('broadcaster')" v-if="broadcasterMediaList && broadcasterMediaList.length > 0">
					{{ tagsBadges[0] || '全球溯源' }}
				</cover-view>
				<cover-view class="media-tab-item" :class="{ 'active': currentTab === 'formula' }" @tap.stop="switchTab('formula')"
					v-if="formulaMediaList && formulaMediaList.length > 0">
					{{ tagsBadges[1] || '达人推荐' }}
				</cover-view>
			</cover-view>
		</cover-view>
	</view>
</template>

<script setup>
import { ref, computed, getCurrentInstance, nextTick } from 'vue'
import MediaSwiper from '@/components/MediaSwiper/index.vue'
import { getMediaAdaptiveInfo } from '@/utils/utils'

const instance = getCurrentInstance()

// 定义组件属性
const props = defineProps({
	// 产品主图列表
	productMainImages: {
		type: Array,
		default: () => []
	},
	// 主播讲解媒体列表（支持轮播图和视频）
	broadcasterMedia: {
		type: Array,
		default: () => []
	},
	// 主播讲解视频（兼容旧版本，已弃用，请用 broadcasterMedia）
	broadcasterVideo: {
		type: String,
		default: ''
	},
	// 配方讲解媒体列表（支持轮播图和视频）
	formulaMedia: {
		type: Array,
		default: () => []
	},
	// 配方讲解视频（兼容旧版本，已弃用，请用 formulaMedia）
	formulaVideo: {
		type: String,
		default: ''
	},
	// 轮播TagsBadges
	tagsBadges: {
		type: Array,
		default: () => []
	}
})

// 定义事件
const emit = defineEmits(['videoPlay', 'videoEnd', 'mediaComplete', 'tabChange', 'fullscreenchange'])

// 当前选中的 tab
const currentTab = ref('main')
let idlePlayTimer = null
const previousMainSwiperIndex = ref(0)
const lastTabSwitchTime = ref(0) // 新增：记录最后一次切换 Tab 的时间
const touchStartX = ref(0)
const touchStartY = ref(0)

const broadcasterVideoFit = ref('cover')
const formulaVideoFit = ref('cover')
const broadcasterVideoHeight = ref('422rpx')
const formulaVideoHeight = ref('422rpx')
const broadcasterVideoInfo = ref(null)
const formulaVideoInfo = ref(null)
const isBroadcasterFullscreen = ref(false)
const isFormulaFullscreen = ref(false)

// 视频进度跟踪
const broadcasterDuration = ref(0)
const broadcasterCurrentTime = ref(0)
const formulaDuration = ref(0)
const formulaCurrentTime = ref(0)

const formatVideoTime = (seconds) => {
	if (!seconds) return '00:00'
	const m = Math.floor(seconds / 60)
	const s = Math.floor(seconds % 60)
	return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const onBroadcasterTimeUpdate = (e) => {
	broadcasterCurrentTime.value = e.detail.currentTime
	broadcasterDuration.value = e.detail.duration
}

const onFormulaTimeUpdate = (e) => {
	formulaCurrentTime.value = e.detail.currentTime
	formulaDuration.value = e.detail.duration
}

const handleSliderChange = (e, videoId) => {
	const pos = e.detail.value
	const videoContext = uni.createVideoContext(videoId, instance)
	if (videoContext) {
		videoContext.seek(pos)
	}
}


const onLoadedMetadata = (e, type) => {
	const { width, height } = e.detail
	const info = getMediaAdaptiveInfo(width, height)
	if (type === 'broadcaster') {
		broadcasterVideoFit.value = info.objectFit
		broadcasterVideoHeight.value = info.suggestedHeight
		broadcasterVideoInfo.value = info
	} else if (type === 'formula') {
		formulaVideoFit.value = info.objectFit
		formulaVideoHeight.value = info.suggestedHeight
		formulaVideoInfo.value = info
	}
	console.log(`${type} 视频自适应信息:`, info)
}

// 处理媒体列表 - 支持新的 API（broadcasterMedia/formulaMedia）和旧的 API（broadcasterVideo/formulaVideo）
const broadcasterMediaList = computed(() => {
	if (props.broadcasterMedia && props.broadcasterMedia.length > 0) {
		return props.broadcasterMedia
	} else if (props.broadcasterVideo) {
		return [props.broadcasterVideo]
	}
	return []
})

const formulaMediaList = computed(() => {
	if (props.formulaMedia && props.formulaMedia.length > 0) {
		return props.formulaMedia
	} else if (props.formulaVideo) {
		return [props.formulaVideo]
	}
	return []
})

// 判断是否为轮播图（多个媒体项）
const isBroadcasterSwiper = computed(() => {
	return broadcasterMediaList.value && broadcasterMediaList.value.length > 1
})

const isFormulaSwiper = computed(() => {
	return formulaMediaList.value && formulaMediaList.value.length > 1
})

// 是否显示 Tabs（只有当有多于一个 tab 内容时才显示）
const showTabs = computed(() => {
	let count = 0
	if (props.productMainImages && props.productMainImages.length > 0) count++
	if (broadcasterMediaList.value && broadcasterMediaList.value.length > 0) count++
	if (formulaMediaList.value && formulaMediaList.value.length > 0) count++
	return count > 1
})


const mainSwiperRef = ref(null)
const broadcasterSwiperRef = ref(null)
const formulaSwiperRef = ref(null)

// 切换 tab
const switchTab = (tabName) => {
	// 清除上一个计时器
	clearTimeout(idlePlayTimer);

	// 暂停当前正在播放的视频
	if (currentTab.value === 'main') {
		mainSwiperRef.value?.pauseAllVideos();
	} else if (currentTab.value === 'broadcaster') {
		if (isBroadcasterSwiper.value) {
			broadcasterSwiperRef.value?.pauseAllVideos();
		} else {
			const ctx = uni.createVideoContext('broadcaster-video', instance);
			if (ctx) {
				ctx.pause();
				ctx.seek(0);
				broadcasterCurrentTime.value = 0;
			}
		}
	} else if (currentTab.value === 'formula') {
		if (isFormulaSwiper.value) {
			formulaSwiperRef.value?.pauseAllVideos();
		} else {
			const ctx = uni.createVideoContext('formula-video', instance);
			if (ctx) {
				ctx.pause();
				ctx.seek(0);
				formulaCurrentTime.value = 0;
			}
		}
	}
	
	// 记录切换时间，用于后续防止误跳
	lastTabSwitchTime.value = Date.now();

	// 关键修复：切换到主图时，先将索引设为 -1，防止初始化时的 index=0 触发自动跳转
	if (tabName === 'main') {
		previousMainSwiperIndex.value = -1;
	}

	currentTab.value = tabName;
	console.log('切换到了:', tabName);
	emit('tabChange', tabName);

	// 如果切换到视频 tab，则设置延时播放
	if (tabName === 'broadcaster' || tabName === 'formula') {
		nextTick(() => {
			idlePlayTimer = setTimeout(() => {
				if (tabName === 'broadcaster') {
					if (isBroadcasterSwiper.value) {
						broadcasterSwiperRef.value?.playCurrentVideo();
					} else {
						const ctx = uni.createVideoContext('broadcaster-video', instance);
						ctx?.play();
					}
				} else if (tabName === 'formula') {
					if (isFormulaSwiper.value) {
						formulaSwiperRef.value?.playCurrentVideo();
					} else {
						const ctx = uni.createVideoContext('formula-video', instance);
						ctx?.play();
					}
				}
			}, 3000);
		});
	}
};

// 处理滑动切换 - 仅在只有一项时使用，因为多项时轮播图会处理滑动
const handleTouchStart = (e) => {
	touchStartX.value = e.touches[0].pageX;
	touchStartY.value = e.touches[0].pageY;
};

const handleTouchEnd = (e) => {
	const deltaX = touchStartX.value - e.changedTouches[0].pageX;
	const deltaY = touchStartY.value - e.changedTouches[0].pageY;

	// 判断是否为水平左滑（deltaX > 50 且 deltaX > |deltaY|）
	if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 50) {
		console.log('检测到左滑动作');
		if (currentTab.value === 'main' && props.productMainImages.length === 1) {
			console.log('单图主图左滑，切换到下一个Tab');
			onMainMediaComplete();
		} else if (currentTab.value === 'broadcaster' && broadcasterMediaList.value.length === 1) {
			console.log('单项溯源左滑，切换到下一个Tab');
			onBroadcasterMediaComplete();
		}
	}
};

// 轮播图播放事件
const onVideoPlay = (index) => {
	console.log('轮播图视频开始播放', index);
	// 清除延时播放计时器
	clearTimeout(idlePlayTimer);
	emit('videoPlay', { type: 'main', index })
}

// 轮播图结束事件
const onVideoEnd = () => {
	console.log('轮播图播放结束');
	// 切换到下一个
	onMainMediaComplete();
}

// 轮播图切换事件
const onSwiperChange = (index) => {
	console.log('轮播图切换到:', index);
	
	// 如果索引未准备好（比如刚切换 Tab 时的初始化触发），直接返回，防止跳变
	if (previousMainSwiperIndex.value === -1) {
		previousMainSwiperIndex.value = index;
		return;
	}

	// 【关键修复】：只有在有多张图（length > 1）的情况下，才处理循环到第一张后的自动跳转
	// 如果只有 1 张图，由于 index 始终为 0，点击切换回来时会触发 index == 0 导致立刻又跳走
	if (props.productMainImages.length > 1 && previousMainSwiperIndex.value === props.productMainImages.length - 1 && index === 0) {
		console.log('主图轮播循环完成，跳转到下一个Tab');
		onMainMediaComplete();
	}
	// Update the previous index
	previousMainSwiperIndex.value = index;

	// 为主图轮播中的视频也开启 3 秒延时播放
	clearTimeout(idlePlayTimer);
	const currentItem = props.productMainImages[index];
	if (currentItem && currentItem.type === 2) {
		idlePlayTimer = setTimeout(() => {
			if (currentTab.value === 'main') {
				mainSwiperRef.value?.playCurrentVideo();
			}
		}, 3000);
	}
}

// 轮播图流程完成事件
const onMainMediaComplete = () => {
	// 【最后防线】：切换 Tab 后的 1.5 秒内，禁止任何形式的自动跳转（包括视频结束、滑动等）
	if (Date.now() - lastTabSwitchTime.value < 1500) {
		console.log('处于 Tab 切换保护期，忽略自动跳转请求');
		return;
	}
	
	console.log('主图媒体流程完成');
	// 自动切换到下一个 tab
	if (broadcasterMediaList.value && broadcasterMediaList.value.length > 0) {
		switchTab('broadcaster');
	} else if (formulaMediaList.value && formulaMediaList.value.length > 0) {
		switchTab('formula');
	}
	emit('mediaComplete', 'main');
}

// 主播讲解视频播放事件
const onBroadcasterVideoPlay = () => {
	console.log('主播讲解视频开始播放');
	// 清除延时播放计时器
	clearTimeout(idlePlayTimer);
	emit('videoPlay', { type: 'broadcaster' });
};

// 主播讲解轮播图视频播放事件
const onBroadcasterSwiperVideoPlay = (index) => {
	console.log('主播讲解轮播图视频开始播放', index);
	// 清除延时播放计时器
	clearTimeout(idlePlayTimer);
	emit('videoPlay', { type: 'broadcaster', index })
}

// 主播讲解视频结束事件
const onBroadcasterVideoEnd = () => {
	console.log('主播讲解视频播放结束');
	// 重置进度条
	broadcasterCurrentTime.value = 0;
	
	// 自动切换到配方讲解
	if (formulaMediaList.value && formulaMediaList.value.length > 0) {
		switchTab('formula');
	}
	emit('videoEnd', 'broadcaster');
}

// 主播讲解媒体完成事件
const onBroadcasterMediaComplete = () => {
	console.log('主播讲解媒体流程完成');
	// 自动切换到配方讲解
	if (formulaMediaList.value && formulaMediaList.value.length > 0) {
		switchTab('formula');
	}
	emit('mediaComplete', 'broadcaster')
}

// 主播讲解轮播图切换事件
const onBroadcasterSwiperChange = (index) => {
	console.log('主播讲解轮播图切换到:', index);
	// 清除上一个计时器
	clearTimeout(idlePlayTimer);
	
	// 如果是视频项，设置 3 秒延时播放
	const currentItem = broadcasterMediaList.value[index];
	if (currentItem && currentItem.type === 2) {
		idlePlayTimer = setTimeout(() => {
			console.log('主播讲解轮播图自动播放检测');
			if (currentTab.value === 'broadcaster' && isBroadcasterSwiper.value) {
				broadcasterSwiperRef.value?.playCurrentVideo();
			}
		}, 3000);
	}
}

// 配方讲解视频播放事件
const onFormulaVideoPlay = () => {
	console.log('配方讲解视频开始播放');
	// 清除延时播放计时器
	clearTimeout(idlePlayTimer);
	emit('videoPlay', { type: 'formula' });
};

// 配方讲解轮播图视频播放事件
const onFormulaSwiperVideoPlay = (index) => {
	console.log('配方讲解轮播图视频开始播放', index);
	// 清除延时播放计时器
	clearTimeout(idlePlayTimer);
	emit('videoPlay', { type: 'formula', index })
}

// 配方讲解视频结束事件
const onFormulaVideoEnd = () => {
	console.log('配方讲解视频播放结束');
	// 重置进度条
	formulaCurrentTime.value = 0;
	
	// 不自动切换（最后一步）
	emit('videoEnd', 'formula')
}

// 配方讲解媒体完成事件
const onFormulaMediaComplete = () => {
	console.log('配方讲解媒体流程完成');
	// 不自动切换（最后一步）
	emit('mediaComplete', 'formula')
}

// 配方讲解轮播图切换事件
const onFormulaSwiperChange = (index) => {
	console.log('配方讲解轮播图切换到:', index);
	// 清除上一个计时器
	clearTimeout(idlePlayTimer);
	
	// 如果是视频项，设置 3 秒延时播放
	const currentItem = formulaMediaList.value[index];
	if (currentItem && currentItem.type === 2) {
		idlePlayTimer = setTimeout(() => {
			console.log('配方讲解轮播图自动播放检测');
			if (currentTab.value === 'formula' && isFormulaSwiper.value) {
				formulaSwiperRef.value?.playCurrentVideo();
			}
		}, 3000);
	}
}

// 暴露方法给父组件
defineExpose({
	// 切换到指定 tab
	switchTo: (tabName) => {
		switchTab(tabName)
	},
	// 获取当前 tab
	getCurrentTab: () => {
		return currentTab.value
	}
})
// 切换全屏
const toggleFullscreen = (videoId) => {
	console.log('触发全屏切换:', videoId)
	const videoContext = uni.createVideoContext(videoId, instance)
	if (videoContext) {
		const info = videoId === 'broadcaster-video' ? broadcasterVideoInfo.value : formulaVideoInfo.value
		
		// 立即开启控制栏
		if (videoId === 'broadcaster-video') {
			isBroadcasterFullscreen.value = true
		} else {
			isFormulaFullscreen.value = true
		}
		
		// 如果是横屏视频，进入全屏时旋转90度
		const direction = info?.orientation === 'horizontal' ? 90 : 0
		console.log('请求全屏, 方向:', direction)
		
		videoContext.requestFullScreen({
			direction: direction
		})
	}
}

// 全屏切换事件
const onBroadcasterFullscreenChange = (e) => {
	console.log('播报视频全屏状态改变:', e.detail.fullScreen)
	isBroadcasterFullscreen.value = e.detail.fullScreen
	emit('fullscreenchange', e.detail.fullScreen)
}

const onFormulaFullscreenChange = (e) => {
	console.log('配方视频全屏状态改变:', e.detail.fullScreen)
	isFormulaFullscreen.value = e.detail.fullScreen
	emit('fullscreenchange', e.detail.fullScreen)
}
</script>

<style lang="scss" scoped>
/* 媒体区域包裣 */
.media-section-wrapper {
	position: relative;
	// margin-bottom: 30rpx;
	background: #fff;
	// border-radius: 16rpx;
	overflow: hidden;
	// box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

/* 媒体区域样式 */
.media-section {
	// padding: 30rpx 0;
	// margin-bottom: 30rpx;
	background: #fff;
	// border-radius: 16rpx;
	// box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	position: relative;

	.swiper-indicator {
		position: absolute;
		right: 32rpx;
		bottom: 38rpx;
		background-color: rgba(0, 0, 0, 0.2);
		font-size: 24rpx;
		color: #fff;
		border-radius: 21rpx;
		width: 76rpx;
		height: 42rpx;
		line-height: 40rpx;
		text-align: center;
	}
}

.section-label {
	font-size: 28rpx;
	font-weight: 600;
	color: #121212;
	margin-bottom: 20rpx;
	display: block;
}

.media-video-player {
	width: 100%;
	height: 422rpx;
	// border-radius: 12rpx;
	overflow: hidden;
	background: #f5f5f5;
	background-color: transparent;
	animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

/* 顶部 Tabs 导航栏容器 */
.media-tabs-container {
	display: none;
}

.media-tab-button {
	display: none;
}

/* 浮动 Tabs 按锕箱 */
.media-tabs-wrapper {
	position: absolute;
	top: 30rpx;
	right: 30rpx;
	z-index: 10;
	background: rgba(255, 255, 255, 0.3);
	border-radius: 32rpx;
	display: inline-flex;
	padding: 6rpx;
}

.media-tabs {
	display: flex;
	align-items: center;
	gap: 0;
}

.media-tab-item {
	padding: 10rpx 24rpx;
	background: transparent;
	font-size: 24rpx;
	color: #000000;
	white-space: nowrap;
	transition: all 0.3s ease;
	border-radius: 28rpx;
	font-weight: 600;

	&.active {
		background: #fff;
		color: #000000;
		font-weight: 600;
	}
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