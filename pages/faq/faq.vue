<template>
	<view class="faq-page">
		<Header system-bar-area-bg="linear-gradient( 270deg, #E2FFFF 0%, #F8FFFF 98%)"
			header-area-bg="linear-gradient( 270deg, #E2FFFF 0%, #F8FFFF 98%)" :scroll-top="scrollTop"
			:show-return="true">
			<view class="title-text">常见问题</view>
		</Header>
		<!-- 顶部标题区域 -->
		<view class="header-section">
			<view class="header-content">
				<text class="header-title-en">PROBLEM</text>
				<text class="header-title-zh">常见问题</text>
			</view>
			<image class="header-icon" :src="COMMON_IMG_PATH + '/2bf06f00c4.png'" />
		</view>
		<!-- FAQ列表 -->
		<view class="faq-list">
			<view v-for="(category, index) in faqCategories" :key="index" class="faq-category">
				<view class="category-item" @click="toggleCategory(index)">
					<view class="category-header">
						<text class="category-number">{{ index + 1 }}.</text>
						<text class="category-title">{{ category.title }}</text>
					</view>
					<image class="expand-icon" :class="{ expanded: category.expanded }"
						:src="COMMON_IMG_PATH + '/44b2ac4c9591.png'" />
				</view>

				<view v-if="category.expanded" class="category-content">
					<view v-for="(item, qIndex) in category.questions" :key="qIndex" class="faq-item">
						<view class="question-wrapper">
							<text class="question-label">Q{{ getGlobalQuestionIndex(index, qIndex) }}</text>
							<text class="question-text">{{ item.question }}</text>
						</view>
						<view class="answer-wrapper">
							<text class="answer-label">A{{ getGlobalQuestionIndex(index, qIndex) }}</text>
							<text class="answer-text">{{ item.answer }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="footer-section">
			<view class="consult-btn" @click="contactService">
				<text class="btn-text">咨询客服</text>
			</view>
		</view>
	</view>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { onLoad, onUnload } from "@dcloudio/uni-app";
import Header from "@/components/Header/index.vue";
import { INDEX_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath'
import CustomerServiceUtil from '@/utils/customerService';
import { getDictType } from "@/api/global";
// FAQ分类数据
const faqCategories = ref([])

// 获取全局连续的问题编号
const getGlobalQuestionIndex = (categoryIndex, questionIndex) => {
	let totalQuestions = 0;
	for (let i = 0; i < categoryIndex; i++) {
		totalQuestions += faqCategories.value[i].questions.length;
	}
	return totalQuestions + questionIndex + 1;
}

// 切换分类展开/收起
const toggleCategory = (index) => {
	faqCategories.value[index].expanded = !faqCategories.value[index].expanded
}

// 返回上一页
const goBack = () => {
	uni.navigateBack()
}

// 返回首页
const goHome = () => {
	uni.switchTab({
		url: '/pages/index/index'
	})
}

// 联系客服
const contactService = () => {
	// uni.showToast({
	// 	title: '正在联系客服',
	// 	icon: 'none'
	// })
	CustomerServiceUtil.open()
	// uni.showToast({ title: '功能未开放', icon: 'none' })
}
onLoad(async () => {
	try {
		const res = await getDictType('ym_faq')
		if (res && res.length > 0) {
			try {
				faqCategories.value = JSON.parse(res[0].remark || '[]')
			} catch (parseError) {
				console.error('FAQ数据解析失败:', parseError)
				faqCategories.value = []
			}
		}
	} catch (e) {
		console.error('获取FAQ数据失败:', e)
	}
})
</script>

<style lang="scss" scoped>
.faq-page {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	padding-bottom: 150rpx;
	background: linear-gradient(270deg, #E3FFFF 0%, #F3FFFF 98%);
	background-repeat: no-repeat;
	background-size: cover;
}

.title-text {
	font-weight: 600;
	font-size: 36rpx;
	color: #121212;
}

/* 顶部标题区域 */
.header-section {
	position: relative;
	background: linear-gradient(271deg, #e3ffff 0%, #f3ffff 97.59%);
	padding: 0 40rpx 80rpx;

	.header-content {
		.header-title-en {
			display: block;
			font-size: 56rpx;
			font-weight: 700;
			color: #222;
			letter-spacing: 1px;
			line-height: 80rpx;
			margin-bottom: 0;
		}

		.header-title-zh {
			display: block;
			font-size: 56rpx;
			font-weight: 600;
			color: #222;
			letter-spacing: 1px;
			line-height: 80rpx;
		}
	}

	.header-icon {
		position: absolute;
		right: 50rpx;
		top: 0rpx;
		width: 182rpx;
		height: 182rpx;
	}
}

/* FAQ列表 */
.faq-list {
	padding: 40rpx;
	background-color: #fff;
}

.faq-category {
	margin-bottom: 40rpx;

	.category-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 26rpx;

		.category-header {
			.category-number {
				font-size: 28rpx;
				font-weight: 700;
				color: #222;
				letter-spacing: 0.5px;
				margin-right: 8rpx;
				margin-bottom: 12rpx;
			}
		}

		.expand-icon {
			width: 32rpx;
			height: 32rpx;
			transition: transform 0.3s;
			transform: rotate(0deg);

			&.expanded {
				transform: rotate(90deg);
			}
		}
	}
}

/* 问题样式 */
.question-wrapper {
	position: relative;
	display: flex;
	align-items: flex-start;
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
		/* 只显示右边和下边的边框，模拟三角形边缘 */
		// border-right: 2rpx dashed #7E7E7E;
		// border-bottom: 2rpx dashed #7E7E7E;
	}

	.question-label {
		font-family: 'Times New Roman', serif;
		font-size: 40rpx;
		font-weight: 400;
		color: #00B2B3;
		margin-right: 20rpx;
		line-height: 1;
		flex-shrink: 0;
	}

	.question-text {
		flex: 1;
		font-size: 24rpx;
		color: #000;
		line-height: 1.5;
		padding-top: 4rpx;
	}
}

/* 答案样式 */
.answer-wrapper {
	display: flex;
	align-items: flex-start;
	padding: 0 12rpx 12rpx 12rpx;
	margin-bottom: 40rpx;

	.answer-label {
		font-family: 'Times New Roman', serif;
		font-size: 40rpx;
		font-weight: 400;
		color: #00B2B3;
		margin-right: 20rpx;
		line-height: 1;
		flex-shrink: 0;
	}

	.answer-text {
		flex: 1;
		font-size: 22rpx;
		color: #4A4A4A;
		line-height: 1.6;
		// padding-top: 6rpx;
		text-align: justify;
	}
}

/* 底部按钮 */
.footer-section {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	padding: 32rpx 40rpx;
	border-top: 2rpx solid #e7e7e7;

	.consult-btn {
		background-color: #00cbcc;
		border-radius: 48rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx 0 rgba(103, 61, 17, 0.08);

		.btn-text {
			font-size: 28rpx;
			font-weight: 500;
			color: #fff;
			letter-spacing: 3px;
		}
	}
}
</style>