<template>
	<view class="page">
		<!-- Header Section -->
		<Header :show-return="true" header-area-bg="#fff" system-bar-area-bg="#fff">
			<template #left>
				<view class="header-left">
					<uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
					<image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
				</view>
			</template>
			<text class="header-title">服用说明</text>
		</Header>

		<!-- Banner Section -->
		<view class="banner">
			<view class="banner-content">
				<text class="banner-title-en">EXPLANATION</text>
				<text class="banner-title-zh">服用说明</text>
			</view>
			<image class="banner-image" :src="COMMON_IMG_PATH + '3430efa81b314d3c34.png'" />
		</view>

		<!-- Tab Navigation -->
		<view class="tabs">
			<view v-for="(tab, index) in tabs" :key="index" class="tab-item" :class="{ active: currentTab === index }"
				@click="switchTab(index)">
				<text class="tab-text">{{ tab.name }}</text>
				<view v-if="currentTab === index" class="tab-indicator"></view>
			</view>
		</view>

		<!-- Content Section -->
		<view class="content">
			<view class="content-item" v-for="item in currentContent" :key="item.id">
				<view class="item-title" :class="{ alt: item.isAlt }">
					<view class="item-content">
						<text class="item-number">{{ item.id }}.</text>
						<text class="item-text">{{ item.title }}</text>
					</view>
				</view>
				<text class="item-desc">{{ item.description }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onUnload } from "@dcloudio/uni-app";
import Header from '@/components/Header/index.vue'
import { useRouter } from '@/hooks/useRouter'
import { INDEX_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath'
import { getDictType } from "@/api/global";

const { goBack, toHome } = useRouter()

// 当前选中的 Tab 索引
const currentTab = ref(0)

// Tab 配置
const tabs = ref([])

// 存储所有 Tab 的内容
const tabContents = ref({})

// 根据当前选中的 Tab 返回对应的内容
const currentContent = computed(() => {
	if (tabs.value.length > 0) {
		const currentTabItem = tabs.value[currentTab.value]
		if (currentTabItem) {
			return tabContents.value[currentTabItem.value] || []
		}
	}
	return []
})

// 切换 Tab
const switchTab = (index) => {
	currentTab.value = index
}
onLoad(async () => {
	try {
		const res = await getDictType('ty_fysm_cp')
		if (res && Array.isArray(res)) {
			// 处理 Tab 数据
			tabs.value = res.map(item => ({
				name: item.label,
				value: item.value
			}))
			
			// 处理内容数据
			res.forEach(item => {
				try {
					tabContents.value[item.value] = JSON.parse(item.remark || '[]')
				} catch (e) {
					console.error(`解析Tab内容失败: ${item.label}`, e)
					tabContents.value[item.value] = []
				}
			})
			
			// 默认选中第一个
			if (tabs.value.length > 0) {
				currentTab.value = 0
			}
		}
	} catch (e) {
		console.error('获取服用说明数据失败:', e)
	}
})
</script>

<style lang="scss" scoped>
.page {
	background-color: #fff;
	min-height: 100vh;
	padding-bottom: 60rpx;
}

// Header Section
.header-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #121212;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 24rpx;

	.icon-home {
		width: 48rpx;
		height: 48rpx;
	}
}

.header-right {
	display: flex;
	align-items: center;
	background-color: rgba(255, 255, 255, 0.6);
	border-radius: 50px;
	padding: 16rpx 26rpx;
	border: 1px solid rgba(151, 151, 151, 0.2);

	.icon-more {
		width: 37rpx;
		height: 13rpx;
		background-color: #000;
		border-radius: 2rpx;
	}

	.divider {
		width: 1rpx;
		height: 37rpx;
		background-color: rgba(0, 0, 0, 0.2);
		margin: 0 23rpx;
	}

	.icon-search {
		width: 34rpx;
		height: 34rpx;
	}
}

// Banner Section
.banner {
	position: relative;
	background: linear-gradient(271deg, #e3ffff 0%, #f3ffff 97.59%);
	padding: 60rpx 40rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 60rpx;

	.banner-content {
		display: flex;
		flex-direction: column;
		gap: 8rpx;

		.banner-title-en {
			font-size: 56rpx;
			font-weight: 700;
			color: #222;
			line-height: 1.2;
		}

		.banner-title-zh {
			font-size: 56rpx;
			font-weight: 600;
			color: #222;
			line-height: 1.2;
		}
	}

	.banner-image {
		width: 196rpx;
		height: 196rpx;
	}
}

// Tab Navigation
.tabs {
	display: flex;
	background-color: #fff;
	border-bottom: 1px solid #e7e7e7;

	.tab-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 24rpx 0;
		position: relative;

		.tab-text {
			font-size: 32rpx;
			color: #999;
			line-height: 1.2;
		}

		&.active {
			.tab-text {
				color: #222;
				font-weight: 500;
			}

			.tab-indicator {
				position: absolute;
				bottom: 0;
				width: 80rpx;
				height: 6rpx;
				background-color: #00cbcc;
				border-radius: 64px;
			}
		}
	}
}

	// Content Section
	.content {
		padding: 48rpx 40rpx 0;

		.content-item {
			margin-bottom: 40rpx;

			.item-title {
				position: relative;
				display: flex;
				align-items: center;
				background-color: #E2F6F7;
				// border: 2rpx dashed #7E7E7E;
				border-radius: 12rpx;
				padding: 10rpx;
				margin-bottom: 20rpx;

				&::after {
					content: '';
					position: absolute;
					bottom: -6rpx;
					left: 300rpx;
					width: 20rpx;
					height: 20rpx;
					background-color: #E2F6F7;
					transform: rotate(45deg);
					// border-right: 2rpx dashed #7E7E7E;
					// border-bottom: 2rpx dashed #7E7E7E;
				}

				&.alt {
					background-color: #f0f;
					background-image: none;
				}

				.item-content {
					display: flex;
					align-items: center;
					width: 100%;
				}

				.item-number {
					font-size: 28rpx;
					font-weight: 700;
					color: #222;
					margin-right: 12rpx;
					flex-shrink: 0;
					line-height: 1.2;
				}

				.item-text {
					font-size: 28rpx;
					font-weight: 500;
					color: #222;
					line-height: 1.4;
				}
			}

			.item-desc {
				display: block;
				font-size: 28rpx;
				color: #666;
				line-height: 1.6;
				margin-top: 12rpx;
				padding-left: 0;
				text-align: justify;
			}
		}
	}
</style>
