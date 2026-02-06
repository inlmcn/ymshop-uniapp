<template>
	<view class="page-wrapper">
		<Header :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
			<template #left>
				<view class="header-left">
					<uv-icon name="arrow-left" size="20" color="#000" @tap="goBack" />
					<image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @tap="backHome" />
				</view>
			</template>
			<text class="header-title">添加产品</text>
		</Header>
		<view class="container">
			<!-- 主体内容 -->
			<scroll-view scroll-y class="content-area">
				<!-- 动态分类 -->
				<view v-for="(category, categoryIndex) in categories" :key="category.id" class="category-section">
					<view class="category-header" @tap="toggleCategory(categoryIndex)">
						<view class="category-title-wrapper">
							<view class="category-icon" :style="{ backgroundImage: `url(${category.picUrl})` }"></view>
							<text class="category-title">{{ category.name }}</text>
						</view>
						<view class="expand-icon" :class="{ 'expanded': category.expanded }">
							<text class="arrow-down">▼</text>
						</view>
					</view>

					<view v-show="category.expanded" class="category-content">
						<view v-if="category.storeProductList && category.storeProductList.length > 0" class="product-list">
							<view v-for="product in category.storeProductList" :key="`${category.id}-${product.id}`"
								class="swipe-action">
								<view class="product-item" @tap="toggleProduct(product)">
									<view class="product-content">
										<view class="product-image">
											<image :src="product.image" mode="aspectFit"></image>
										</view>
										<view class="product-info">
											<view class="product-name uv-line-1">{{ product.storeName || product.productName }}</view>
											<!-- <view class="product-desc">{{ product.storeInfo }}</view> -->
											<view class="product-tags" v-if="product.productTagNameList && product.productTagNameList.length > 0">
												<view class="product-tag" v-for="(tag, tagIdx) in product.productTagNameList" :key="tagIdx" :style="{
													backgroundColor: tag.bgColor,
													borderColor: tag.borderColor,
													color: tag.fontColor,
												}">{{ tag.tagName }}</view>
											</view>
											<view class="product-price">
												¥{{ product.price }}
												<text class="price-unit">/月</text>
												<text class="divider">|</text>
												{{ product.defaultNumber || 0 }}
											</view>
										</view>
									</view>
									<view class="check-button" :class="{ 'is-checked': product.type === 'checked' }">
									</view>
								</view>
							</view>
						</view>
						<view v-else class="empty-content">
							<text>暂无{{ category.name }}产品</text>
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 底部按钮 -->
			<view class="bottom-btn-wrapper">
				<button class="bottom-btn" @tap="onComplete" :disabled="selectedCount === 0">
					完成({{ selectedCount }})
				</button>
			</view>
		</view>
		<CustomToast ref="customToastRef" />
	</view>
</template>

<script setup>
import {
	ref,
	computed,
	onMounted
} from 'vue';
import { onLoad } from '@dcloudio/uni-app'
import {
	COMMON_IMG_PATH
} from '@/utils/imgpath.js'
import Header from '@/components/Header/index.vue'
import { useRouter } from '@/hooks/useRouter'
import { useSupplementStore } from '@/store/supplement'
import { getCategoryProductList, getProductDetail } from '@/api/product'
import { syncProductPriceFromProductValue } from '@/utils/utils'
import CustomToast from "@/components/CustomToast/index.vue";
import { getPlanOrderMinCount } from '@/api/order';

const store = useSupplementStore()
const { goBack, toHome } = useRouter()

const customToastRef = ref(null);
// 分类和产品数据
const categories = ref([]);
const isPlanPage = ref(false)

// 获取分类和产品数据
const fetchCategoriesAndProducts = async () => {

	try {
		//定制产品分类id是95 写死
		let query = { categoryId: 0 };
		const response = await getCategoryProductList(query);
		if (response) {
			// 为每个分类添加 expanded 属性，默认第一个分类展开
			categories.value = response.map((category, index) => {
				// 先处理产品价格，将productValue中第一个SKU的price赋值给父级的price
				const processedProductList = category.storeProductList
					? syncProductPriceFromProductValue(category.storeProductList)
					: [];

				return {
					...category,
					expanded: true, // 默认全部展开
					// 为每个产品添加初始 type 字段
					storeProductList: processedProductList.map(product => {
						if (isPlanPage.value) {
							return {
								...product,
								type: isChecked(product) ? 'checked' : 'add'
							}
						} else {
							return {
								...product,
								type: product.type || 'add'
							}
						}
					})
				};
			});
		}
	} catch (error) {
		console.error('获取分类和产品数据失败:', error);
		uni.showToast({
			title: '获取数据失败',
			icon: 'none'
		});
	}
};

const isChecked = (product) => {
	return store.selectList?.some(item => item?.id === product?.id);
}
// 选中数量
const selectedCount = computed(() => {
	let count = 0;
	categories.value.forEach(category => {
		if (category.storeProductList) {
			count += category.storeProductList.filter(p => p.type === 'checked').length;
		}
	});
	return count;
});

// 选择/取消产品
const toggleProduct = (product, compositeId) => {
	// 只有未选中状态（add）的产品才能被点击选中
	if (product.type === 'add') {
		product.type = 'checked';
	} else {
		product.type = 'add';
	}
};

// 完成选择
const onComplete = async () => {
	const selectedProducts = [];
	categories.value.forEach(category => {
		if (category.storeProductList) {
			const checkedProducts = category.storeProductList.filter(p => p.type === 'checked');
			selectedProducts.push(...checkedProducts);
		}
	});
	console.log('已选择的产品:', selectedProducts);
	const minCount = await getPlanOrderMinCount();
	if (isPlanPage.value && minCount !== 0 && selectedProducts.length < minCount) {
		customToastRef.value.show({
			title: `组合方案建议至少选取${minCount}款产品\n协同增效，收效更佳哦`,
		});
		return;
	}

	// 获取选中产品的详细信息
	const detailedProducts = [];

	try {
		uni.showLoading({
			title: '加载中...',
			mask: true
		});
		// 并发请求所有选中产品的详情
		const detailPromises = selectedProducts.map(product =>
			getProductDetail({ productId: product.id })
		);

		const detailResults = await Promise.all(detailPromises);

		// 处理返回的详情数据
		detailResults.forEach((result, index) => {
			if (result) {
				// 直接使用API返回的完整数据结构
				const detailedProduct = {
					...result, // API返回的完整详细数据
					selectedTime: new Date().getTime(), // 添加选择时间戳
					// 保留原始选择的分类信息
					categoryId: selectedProducts[index].categoryId,
					categoryName: selectedProducts[index].categoryName,
					categoryPicUrl: selectedProducts[index].categoryPicUrl,
					// 关键：保留原始选择时的 defaultNumber 值，确保与显示值一致
					defaultNumber: selectedProducts[index].defaultNumber
				};
				detailedProducts.push(detailedProduct);
			}
		});

		console.log('获取到的详细产品信息:', detailedProducts);

		// 保存详细产品信息到store
		store.setSelectList(detailedProducts);

		uni.hideLoading();

		uni.showToast({
			title: `已选择${selectedCount.value}种产品`,
			icon: 'success'
		});

	} catch (error) {
		console.error('获取产品详情失败:', error);
		uni.hideLoading();

		// 如果获取详情失败，仍然保存基础信息
		const basicProducts = selectedProducts.map(product => ({
			...product,
			selectedTime: new Date().getTime(),
			// 确保保留 defaultNumber
			defaultNumber: product.defaultNumber
		}));

		store.setSelectList(basicProducts);

		uni.showToast({
			title: '部分信息获取失败，已保存基础信息',
			icon: 'none'
		});
	}

	// 在实际应用中，这里可以提交选择结果
	uni.navigateBack();
};


// 切换分类展开状态
const toggleCategory = (categoryIndex) => {
	categories.value[categoryIndex].expanded = !categories.value[categoryIndex].expanded;
};

const backHome = () => {
	store.setSelectList([]);
	store.setConfirmList([]);
	toHome();
}

onMounted(() => {
	fetchCategoriesAndProducts();
})

onLoad((options) => {
	isPlanPage.value = options.isPlanPage === '1';
})
</script>

<style lang="scss" scoped>
.page-wrapper {
	height: 100%;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	overflow: hidden;
}

.container {
	height: 100%;
	padding: 30rpx 24rpx 0;
	display: flex;
	flex-direction: column;
	// background-color: #ffffff;
	font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
	overflow: hidden;
	box-sizing: border-box;
}

/* 导航栏 */
// 
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

/* 内容区域 */
.content-area {
	// margin-top: 44px;
	flex: 1;
	// background-color: #f8f9fa;
	padding-bottom: calc(220rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
}


/* 分类区域 */
.category-section {
	margin-bottom: 20rpx;
	background-color: #fff;
	border-radius: 20rpx;
	padding: 32rpx 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	border: 1px solid rgba(0, 0, 0, 0.04);
	overflow: hidden;
}

.category-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 0 24rpx 0;
	border-bottom: 2rpx solid #f0f0f0;
	cursor: pointer;
	transition: all 0.3s ease;
}

.category-header:active {
	background-color: rgba(0, 195, 178, 0.05);
	border-radius: 12rpx;
	margin: -12rpx -12rpx 24rpx -12rpx;
	padding: 12rpx;
}

.category-content {
	animation: slideDown 0.3s ease-out;
	overflow: hidden;
}

@keyframes slideDown {
	from {
		opacity: 0;
		max-height: 0;
		transform: translateY(-20rpx);
	}

	to {
		opacity: 1;
		max-height: 1000rpx;
		transform: translateY(0);
	}
}

.expand-icon {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background-color: #f0f0f0;
	transition: all 0.3s ease;
}

.expand-icon.expanded {
	background-color: #00c3b2;
	transform: rotate(180deg);
}

.arrow-down {
	font-size: 24rpx;
	color: #666;
	transition: color 0.3s ease;
}

.expand-icon.expanded .arrow-down {
	color: white;
}

.empty-content {
	padding: 60rpx 0;
	text-align: center;
	color: #999;
	font-size: 28rpx;
}



.category-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #1a1a1a;
	letter-spacing: 0.5rpx;
}

/* 左滑删除相关样式 */
.swipe-action {
	position: relative;
	height: 176rpx;
	// margin-bottom: 20rpx;
	overflow: hidden;
}

.product-item {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	transition: background-color 0.2s ease;
	display: flex;
	align-items: center;
	z-index: 2;
	box-sizing: border-box;
}


.product-content {
	display: flex;
	align-items: center;
	flex: 1;
}

.bottom-btn {
	background: linear-gradient(135deg, #00c3b2 0%, #00a89a 100%);
	color: white;
	border-radius: 60rpx;
	height: 100rpx;
	line-height: 100rpx;
	font-size: 32rpx;
	font-weight: 600;
	width: 100%;
	box-shadow: 0 8rpx 24rpx rgba(0, 195, 178, 0.3);
	border: none;
	transition: all 0.3s ease;
}

.bottom-btn:active {
	transform: translateY(2rpx);
	box-shadow: 0 4rpx 12rpx rgba(0, 195, 178, 0.4);
}

.category-title-wrapper {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.category-icon {
	width: 56rpx;
	height: 56rpx;
	border-radius: 14rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: 500;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
}



.highlight {
	color: #1a1a1a;
	position: relative;
	padding-bottom: 8rpx;
}

.highlight::after {
	content: '';
	position: absolute;
	bottom: -2rpx;
	left: 0;
	width: 100%;
	height: 6rpx;
	background: linear-gradient(90deg, #00c3b2 0%, #00a89a 100%);
	border-radius: 3rpx;
}

.arrow-right {
	color: #00c3b2;
	font-size: 40rpx;
	font-weight: 300;
}

/* 产品列表 */
.product-list {
	margin-top: 20rpx;
}

.product-item {
	display: flex;
	padding: 30rpx 0;
	border-bottom: 1px solid #f0f0f0;
	align-items: center;
	border-radius: 16rpx;
	// margin-bottom: 16rpx;
	background-color: #fff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
	padding: 24rpx 20rpx;
	border: none;
}

.product-item:active {
	background-color: #f8f9fa;
}

.product-image {
	width: 120rpx;
	height: 120rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	position: relative;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.product-image::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(0, 195, 178, 0.1) 0%, rgba(0, 195, 178, 0.05) 100%);
	border-radius: 16rpx;
}

.product-image image {
	width: 80rpx;
	height: 80rpx;
	z-index: 1;
	position: relative;
}

.product-info {
	flex: 1;
	padding: 0 24rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.product-name {
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 8rpx;
	color: #1a1a1a;
	line-height: 1.4;
}

.product-desc {
	font-size: 22rpx;
	color: #666;
	margin-bottom: 12rpx;
	line-height: 1.3;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	overflow: hidden;
	text-overflow: ellipsis;
}

.product-tags {
	margin-bottom: 8rpx;
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.product-tag {
	font-size: 20rpx;
	height: 28rpx;
	line-height: 28rpx;
	color: #4c4036;
	background-color: #e9eeff;
	border-radius: 10rpx;
	padding: 0 8rpx;
}

.product-price {
	font-size: 28rpx;
	color: #00c3b2;
	font-weight: 600;
	display: flex;
	align-items: baseline;
}

.price-unit {
	font-size: 24rpx;
	color: #00c3b2;
	font-weight: 400;
}

.divider {
	margin: 0 12rpx;
	color: #ddd;
	font-size: 24rpx;
}

/* 按钮样式 */
.check-button {
	width: 48rpx;
	height: 48rpx;
	border-radius: 12rpx;
	background: #f0f0f0;
	box-shadow: 0 4rpx 12rpx rgba(0, 195, 178, 0.3);
	margin-left: auto;
	margin-right: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
}

.check-button::before {
	content: '✓';
	position: absolute;
	color: #666;
	font-size: 32rpx;
	font-weight: 300;
	transition: all 0.3s ease;
}

.check-button.is-checked {
	background: linear-gradient(135deg, #00c3b2 0%, #00a89a 100%) !important;
	box-shadow: none;
}

.check-button.is-checked::before {
	color: white;
	font-size: 28rpx;
	font-weight: 600;
}



/* 底部按钮 */
.bottom-btn-wrapper {
	padding: 15px;
	background-color: #fff;
	backdrop-filter: blur(10rpx);
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 999;
}

.bottom-btn {
	background-color: #00c3b2;
	color: white;
	border-radius: 30px;
	height: 50px;
	line-height: 50px;
	font-size: 16px;
	font-weight: normal;
	width: 100%;
}
</style>
