<template>
	<view class="nav-box">
		<!-- 横向或宫格滚动 -->
		<scroll-view
			:scroll-x="true"
			:scroll-y="false"
			class="scroll-view"
			@scroll="scroll"
			:bounces="true"
			:show-scrollbar="false"
			:enhanced="true"
			:scroll-anchoring="true"
			
			
		>
			<view
				:class="styleType === 1 ? 'navF' : 'navG'"
				:style="styleType === 2 ? `grid-template-rows: repeat(${rows}, 1fr);` : ''"
			>
				<slot></slot>
			</view>
		</scroll-view>

		<!-- 自定义滚动条 -->
		<!-- <view
			class="scroll-box"
			v-show="(lL / rows > rows && styleType === 2) || is_scroll"
		>
			<view class="scroll" :style="`transform: translateX(${sX});`"></view>
		</view> -->
	</view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, nextTick, watch, computed } from 'vue'

// ============================
// props 不改动
// ============================
const props = defineProps({
	styleType: { type: Number, default: 2 }, // 1=横向 2=宫格
	rows: { type: Number, default: 2 }, // 行数
	lL: { type: Number, default: 0 }, // 列表长度
	is_scroll: { type: Boolean, default: true } // 是否显示滚动条
})

// ============================
// 响应式变量
// ============================
const sX = ref('0px')
const c_W = ref(0) // 容器宽度 (px)
const s_b_W = ref(0) // 滚动条轨道宽度 (px)
const s_W = ref(0) // 滚动条滑块宽度 (px)

// ============================
// 滚动事件
// ============================
function scroll(e) {
	const scrollWidth = e.detail.scrollWidth // 可滚动区域总宽度
	const scrollLeft = e.detail.scrollLeft // 当前滚动位置
	const containerWidth = c_W.value // 容器可见宽度
	
	// 如果尺寸还未测量，尝试重新测量
	if (containerWidth === 0 || s_b_W.value === 0 || s_W.value === 0) {
		measure()
		return
	}
	
	// 计算最大可滚动距离
	const maxScrollLeft = scrollWidth - containerWidth
	
	if (maxScrollLeft > 0 && s_b_W.value > 0 && s_W.value > 0) {
		// 计算滚动条可移动的距离 (px)
		const scrollBarMaxMove = s_b_W.value - s_W.value
		// 根据滚动比例计算滚动条位置
		const scrollRatio = scrollLeft / maxScrollLeft
		const moveDistance = scrollBarMaxMove * scrollRatio
		sX.value = moveDistance + 'px'
	} else {
		sX.value = '0px'
	}
}

// ============================
// 节点尺寸测量
// ============================
const measure = () => {
	const instance = getCurrentInstance()
	if (!instance) return
	
	setTimeout(() => {
		const query = uni.createSelectorQuery().in(instance.proxy)
		
		// 查询滚动条轨道
		query.select('.scroll-box').boundingClientRect((scrollBoxData) => {
			if (scrollBoxData && scrollBoxData.width) {
				s_b_W.value = scrollBoxData.width
			}
		})
		
		// 查询滚动条滑块
		query.select('.scroll').boundingClientRect((scrollData) => {
			if (scrollData && scrollData.width) {
				s_W.value = scrollData.width
			}
		})
		
		// 查询容器宽度
		query.select('.scroll-view').boundingClientRect((navBoxData) => {
			if (navBoxData && navBoxData.width) {
				c_W.value = navBoxData.width
			}
		})
		
		query.exec()
	}, 200)
}

onMounted(() => {
	measure()
	// 延迟再次测量，确保DOM完全渲染
	setTimeout(measure, 500)
})

watch(() => props.lL, () => {
	// 列表长度变化时重新计算
	setTimeout(measure, 200)
})
</script>

<style scoped>
/* ==============================
   外层容器
============================== */
.nav-box {
	width: 100%;
	margin: 24rpx 0;
	overflow: visible;
	position: relative;
}

/* ==============================
   横向滚动样式 (styleType=1)
============================== */
.navF {
	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	column-gap: 20rpx; row-gap: 10rpx;
}

/* ==============================
   宫格布局 (styleType=2)
============================== */
.navG {
	display: inline-grid;
	grid-auto-flow: column;
	gap: 20rpx;
}

/* ==============================
   滚动视图容器
============================== */
.scroll-view {
	width: 100%;
	display: block;
	white-space: nowrap;
	overflow: auto;
	background-color: transparent;

	/* 兼容小程序滚动方向问题 */
	box-sizing: border-box;
	scroll-snap-type: x mandatory;
}

/* ==============================
   自定义滚动条
============================== */
.scroll-box {
	width: 70rpx;
	height: 8rpx; /* Make it thinner */
	background: rgba(0, 0, 0, 0.1); /* Lighter background */
	border-radius: 4rpx;
	position: absolute; /* Position it absolutely */
	bottom: 10rpx; /* Place it near the bottom */
	left: 50%; /* Center it horizontally */
	transform: translateX(-50%);
	overflow: hidden;
}

.scroll {
	width: 30rpx;
	height: 100%;
	background: rgba(0, 0, 0, 0.3); /* Darker but slightly transparent */
	border-radius: 4rpx;
	transition: transform 0.15s linear;
}
</style>
