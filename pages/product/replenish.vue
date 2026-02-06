<template>
	<!-- 使用统一的Header组件 -->
	<Header :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
		<template #left>
			<view class="header-left">
				<uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
				<image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="backHome" />
			</view>
		</template>
		<text class="header-title">补剂调整</text>
	</Header>
	<view class="container">
		<!-- 用户信息区域 -->
		<view class="user-info">
			<image class="avatar" :src="avatar" />
			<view class="greeting">
				<text class="hello">Hello~</text>
				<text class="username">{{ username }}</text>
			</view>
		</view>
		<!-- 补剂列表 -->
		<view class="supplement-list">
			<view class="list-tip">调整你的每日补剂, 左滑可删除</view>
			<UniSwipeAction :autoClose="false">
				<UniSwipeActionItem v-for="item in supplements" :key="item.id"
					@click="handleSwipeClick($event, item.id)">
					<view class="supplement-item">
						<image class="supplement-image" :src="item.image" />
						<view class="supplement-info">
							<text class="supplement-name">{{ item.name }}</text>
							<text class="supplement-desc">{{ item.desc }}</text>
							<view class="price-row">
								<text class="price-symbol">¥</text>
								<text class="price-value">{{ item.price }}</text>
								<text class="price-unit">/月</text>
								<text class="dosage-text">{{ item.dosage }}</text>
							</view>
						</view>
					</view>
					<template #right>
						<view class="delete-button" @click="handleSwipeClick($event, item.id)">
							<uv-icon name="trash" color="#fff" size="20" />
						</view>
					</template>
				</UniSwipeActionItem>
			</UniSwipeAction>
		</view>
		<!-- 添加补剂按钮 -->
		<view class="add-supplement-btn" @click="addSupplement">
			<uv-icon name="plus" size="16" color="#222" />
			<text class="btn-text">添加更多补剂</text>
		</view>
		<!-- 提示信息 -->
		<view class="tip-text">
			*为规避如药物营养素相互作用等风险, 建议你在营养师或医师指引下进行自定义补剂搭配
		</view>
		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="summary-info">
				<view class="daily-count">
					<text class="label">每日 </text>
					<text class="count">{{ supplementTypes }}</text>
					<text class="label"> 种</text>
				</view>
				<text class="daily-detail">共¥{{ totalPrice.toFixed(0) }}/月</text>
			</view>
			<view class="save-btn" @click="savePlan">
				<text class="save-text">保存方案</text>
			</view>
		</view>

	<CustomToast ref="customToastRef" />
	</view>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import Header from '@/components/Header/index.vue'
import { useRouter } from '@/hooks/useRouter'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath.js'
import { useSupplementStore } from '@/store/supplement'
import { getUserInfo } from '@/api/user'
import UniSwipeAction from '@/pages/components/Uni/uni-swipe-action/uni-swipe-action.vue'
import UniSwipeActionItem from '@/pages/components/Uni/uni-swipe-action-item/uni-swipe-action-item.vue'
import { isEqual } from 'lodash-es'
import CustomToast from "@/components/CustomToast/index.vue";
import { getPlanOrderMinCount } from '@/api/order';

const store = useSupplementStore()
const { toHome } = useRouter()
const customToastRef = ref(null);
const username = ref('')
const avatar = ref('')
const mobile = ref('')
const supplements = ref([])

const totalPrice = ref(263.15)
const originalPrice = ref(263.15)
const totalCount = ref(4)
const supplementTypes = ref(3)
const dailyPrice = ref(3.52)

const isPlanPage = ref(false)

const goBack = () => {
	store.setSelectList([])
	uni.navigateBack()
}

const backHome = () => {
	store.setSelectList([]);
	store.setConfirmList([]);
	toHome();
}

// 处理左滑点击事件
async function handleSwipeClick(e, id) {
	if (isPlanPage.value) {
		const minCount = await getPlanOrderMinCount();
		if (minCount !== 0 && supplements.value.length <= minCount) {
			customToastRef.value.show({
				title: `组合方案建议至少选取${minCount}款产品\n协同增效，收效更佳哦`,
			});
			return;
		}
	}

	// 显示确认对话框
	uni.showModal({
		title: '提示',
		content: '确定要删除这个补剂吗？',
		success: (res) => {
			if (res.confirm) {
				deleteSupplement(id)
			}
		}
	})
}

function getOutPutList(allDataSources) {
	const seenStoreIds = new Set();
	const dedupedProducts = [];
	for (const item of allDataSources) {
		const sid = item?.storeInfo?.id || item?.id;
		if (!sid) continue; // 没有 storeInfo.id 的项直接跳过或按需处理
		if (seenStoreIds.has(sid)) continue;
		seenStoreIds.add(sid);
		dedupedProducts.push(item);
	}

	// 2. 映射为您需要的输出结构（这里用当前 productInfo 结构为示例）
	const output = dedupedProducts.map(item => {
		console.log('item:', item);
		const storeInfo = item?.storeInfo || {};
		const uniqueId = storeInfo?.id; // 仅使用 storeInfo.id

		// 保持与 addproduct.vue 一致的价格取值逻辑：优先取 productValue 中第一个 SKU 的价格
		let price = 0;
		if (item?.productValue && typeof item.productValue === 'object') {
			// 优先级1：从 productValue 的第一个 SKU 取价格（与 addproduct.vue 处理逻辑一致）
			const firstKey = Object.keys(item.productValue)[0];
			if (firstKey && item.productValue[firstKey]?.price !== undefined) {
				price = item.productValue[firstKey].price;
			} else if (item.price !== undefined) {
				price = item.price;
			} else {
				price = storeInfo.price || 0;
			}
		} else {
			// 优先级2：直接取 item.price
			price = item.price !== undefined ? item.price : (storeInfo.price || 0);
		}

		// 获取dosage（服用剂量，可能包含单位）：优先级1->storeInfo.defaultNumber, 2->productAttr, 3->defaultNumber, 4->从productValue提取, 5->默认'无'
		let dosage = '无';
		if (storeInfo.defaultNumber) {
			// 最高优先级：从storeInfo中获取defaultNumber（通常包含单位，如"2颗/天"）
			dosage = storeInfo.defaultNumber;
		} else if (Array.isArray(item.productAttr) && item.productAttr.length > 0) {
			// 优先从productAttr中提取defaultNumber
			dosage = item.productAttr[0].defaultNumber || item.defaultNumber || '无';
		} else if (item.defaultNumber) {
			dosage = item.defaultNumber;
		} else if (item.productValue && typeof item.productValue === 'object') {
			// 尝试从productValue中提取
			const firstKey = Object.keys(item.productValue)[0];
			if (firstKey && item.productValue[firstKey]?.defaultNumber) {
				dosage = item.productValue[firstKey].defaultNumber;
			}
		}

		return {
			id: uniqueId,
			name: storeInfo.storeName || storeInfo.productName,
			desc: storeInfo.remark,
			price: parseFloat(price),
			dosage: dosage,
			image: storeInfo.image || `${PRODUCT_IMG_PATH}1f3f35778.png`,
			// 如需保留规格或时间戳做扩展（不参与去重判断），可附加
			productAttr: Array.isArray(item.productAttr) ? item.productAttr : [],
			selectedTime: item.selectedTime || null,
			// 保留原始数据
			originalData: item
		};
	});

	return output;
}

onShow(() => {
	console.log('onShow - store.confirmList:', store.confirmList);
	console.log('onShow - store.selectList:', store.selectList);

	let allDataSources = []

	if (isPlanPage.value) {
		// 方案页处理逻辑
		if (store.confirmList.length && !store.selectList.length) {
			const confirmDataList = Array.isArray(store.confirmList) ? store.confirmList : [store.confirmList];
			store.setSelectList([...confirmDataList]);
		}

		const selectList = store.selectList;

		if (isEqual(selectList, supplements.value) && selectList.length > 0) return;

		// 合并处理confirmList和selectList数据（与onLoad逻辑保持一致）
		allDataSources = [...(selectList || [])];

		console.log('实际数据源:', allDataSources);

		const output = getOutPutList(allDataSources);

		supplements.value = output;
		store.setSelectList([...output]);

	} else {

	// 添加confirmList数据
	if (store.confirmList) {
		const confirmDataList = Array.isArray(store.confirmList) ? store.confirmList : [store.confirmList];
			allDataSources.push(...confirmDataList);
			console.log('onShow添加confirmList数据:', confirmDataList);
		}

		// 添加selectList数据
		if (store.selectList) {
			const selectDataList = Array.isArray(store.selectList) ? store.selectList : [store.selectList];
			allDataSources.push(...selectDataList);
			console.log('onShow添加selectList数据:', selectDataList);
		}

		console.log('onShow合并后的数据源:', allDataSources);
		// 假设此处已得到 productsToProcess（来自 zpProductList/goodList/productData）
		// 1. 先按 storeInfo.id 去重

		const output = getOutPutList(allDataSources);


		// 3. 如需再与页面已有 supplements.value 做外部去重（只对 storeInfo.id 比较），可以如下处理：
		const existingIds = new Set((supplements.value || []).map(s => s?.originalData?.storeInfo?.id).filter(Boolean));
		const finalOutput = output.filter(o => !existingIds.has(o.originalData?.storeInfo?.id));
			// 最终您想要的变量名，可以是 convertedSupplements / supplementsList / result 等
		console.log('去重后的输出:', finalOutput);
		// 不要覆盖已有的补剂列表，合并新增的不重复项
		supplements.value = [...(supplements.value || []), ...finalOutput]
		console.log('合并后的补剂列表:', supplements.value);
	}
	
	calculateTotals()
})
onMounted(async () => {
	const userInfo = await getUserInfo()
	username.value = userInfo.nickname || userInfo.userName
	avatar.value = userInfo.avatar || `${COMMON_IMG_PATH}avatar.png`
	mobile.value = userInfo.mobile || ''
})
function addSupplement() {
	uni.showToast({
		title: '添加补剂',
		icon: 'none'
	})
	uni.navigateTo({
		url: `/pages/product/addproduct?isPlanPage=${isPlanPage.value ? '1' : '0'}`
	})
}

function deleteSupplement(id) {
	supplements.value = supplements.value.filter(item => item.id !== id)
	if (isPlanPage.value) {
		store.setSelectList([...supplements.value])
	}
	// 重新计算总价等
	calculateTotals()
}

async function savePlan() {
	const seenIds = new Set()
	const originalList = []
	for (const item of (supplements.value || [])) {
		const sid = item?.originalData?.storeInfo?.id
		if (!sid) continue
		if (seenIds.has(sid)) continue
		seenIds.add(sid)
		
		// 获取起售数量
		const onSale = item?.originalData?.storeInfo?.onSale || 1
		
		// 为productValue中的每个SKU补充onSale字段
		const dataToSave = JSON.parse(JSON.stringify(item.originalData)) // 深拷贝
		if (dataToSave.productValue && typeof dataToSave.productValue === 'object') {
			Object.keys(dataToSave.productValue).forEach(key => {
				if (dataToSave.productValue[key] && !dataToSave.productValue[key].onSale) {
					dataToSave.productValue[key].onSale = onSale
				}
			})
		}
		
		originalList.push(dataToSave)
	}

	const minCount = await getPlanOrderMinCount();
	if (isPlanPage.value && minCount !== 0 && originalList.length < minCount) {
		customToastRef.value.show({
			title: `组合方案建议至少选取${minCount}款产品\n协同增效，收效更佳哦`,
		});
		return;
	}

	store.setConfirmList(originalList)

	if (isPlanPage.value) {
		store.setSelectList([])
	}

	
	uni.showToast({
		title: '保存成功',
		icon: 'success'
	})

	// 返回上一页
	uni.navigateBack({
		success: () => {
			uni.$emit('SAVE_REPLENISH_CONFIRM_LIST')
		}
	})
}

// 计算统计数据
function calculateTotals() {
	if (supplements.value.length === 0) {
		totalPrice.value = 0
		originalPrice.value = 0
		totalCount.value = 0
		supplementTypes.value = 0
		dailyPrice.value = 0
		return
	}

	// 计算总价格
	const total = supplements.value.reduce((sum, item) => {
		const itemPrice = parseFloat(item.price) || 0;
		return sum + itemPrice;
	}, 0)
	totalPrice.value = total
	originalPrice.value = total

	// 计算总数量（假设每种补剂每月30颗）
	totalCount.value = supplements.value.length * 30

	// 补剂种类数
	supplementTypes.value = supplements.value.length

	// 每日价格（总价除以30天）
	dailyPrice.value = parseFloat((total / 30).toFixed(2))
}

onLoad((options) => {
 	isPlanPage.value = options.isPlan === '1'
})
</script>
<style lang='scss' scoped>
.container {
  background-color: #E5FFFF;
  padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
  min-height: 100vh;
  box-sizing: border-box;
}

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

// 用户信息区域
.user-info {
	display: flex;
	align-items: center;
	padding: 30rpx 40rpx;
	gap: 24rpx;

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 60rpx;
	}

	.greeting {
		display: flex;
		flex-direction: column;
		gap: 8rpx;

		.hello {
			font-size: 36rpx;
			font-weight: 600;
			color: #121212;
		}

		.username {
			font-size: 28rpx;
			color: #666;
		}
	}
}

// 添加补剂按钮
.add-supplement-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	margin: 24rpx 48rpx;
	padding: 32rpx;
	border: 2px solid #222;
	border-radius: 24rpx;
	background-color: #fff;

	.btn-text {
		font-size: 32rpx;
		font-weight: 700;
		color: #222;
	}
}

// 提示信息
.tip-text {
	display: block;
	padding: 0 72rpx;
	margin: 38rpx 0;
	font-size: 22rpx;
	color: #999;
	text-align: center;
	line-height: 1.6;
}

// 补剂列表
.supplement-list {
	margin: 40rpx 24rpx;
	padding: 40rpx 24rpx;
	background-color: #fff;
	border-radius: 44rpx;
	box-shadow: -1px 4px 23px 0px rgba(0, 0, 0, 0.07);
	position: relative;

	.list-tip {
		position: absolute;
		top: -17rpx;
		right: 24rpx;
		padding: 6rpx 24rpx;
		background-color: #D4FFFF;
		font-size: 24rpx;
		font-weight: 700;
		color: #222;
		border-radius: 20rpx;
	}

	.supplement-item {
		display: flex;
		align-items: flex-start;
		gap: 34rpx;
		padding: 38rpx 0;
		border-bottom: 1px solid #f5f5f5;

		&:last-child {
			border-bottom: none;
		}

		.supplement-image {
			width: 153rpx;
			height: 153rpx;
			border-radius: 16rpx;
			flex-shrink: 0;
		}

		.supplement-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 10rpx;

			.supplement-name {
				font-size: 32rpx;
				font-weight: 700;
				color: #222;
				// 两行省略
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
			}

			.supplement-desc {
				font-size: 24rpx;
				color: #666;
				line-height: 1.5;
			}

			.price-row {
				display: flex;
				align-items: baseline;
				margin-top: 16rpx;

				.price-symbol {
					font-size: 24rpx;
					color: #00CBCC;
				}

				.price-value {
					font-size: 36rpx;
					font-weight: 600;
					color: #00CBCC;
				}

				.price-unit {
					font-size: 24rpx;
					font-weight: 700;
					color: #00CBCC;
					margin-left: 4rpx;
				}

				.dosage-text {
					font-size: 22rpx;
					font-weight: 700;
					color: #00CBCC;
					white-space: nowrap;
					margin-left: 6rpx;
				}

				.dosage-unit {
					font-size: 22rpx;
					font-weight: 700;
					color: #00CBCC;
				}
			}
		}

		// .dosage-badge {
		// 	display: flex;
		// 	align-items: center;
		// 	gap: 26rpx;
		// 	padding: 10rpx 30rpx;
		// 	border: 2px solid #333;
		// 	border-radius: 30rpx;
		// 	background-color: #fff;
		// 	margin-top: 116rpx;


		// }
	}
}

// 底部操作栏
.bottom-bar {
	position: fixed;
	left: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 58rpx 24rpx 58rpx;
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	background-color: #fff;
	border-radius: 60rpx 60rpx 0 0;
	box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);

	.summary-info {
		display: flex;
		flex-direction: column;
		gap: 8rpx;

		.daily-count {
			font-size: 28rpx;
			font-weight: 700;
			color: #222;

			.count {
				color: #00CBCC;
				font-weight: 600;
			}
		}

		.daily-detail {
			font-size: 24rpx;
			font-weight: 700;
			color: #666;
		}
	}

	.save-btn {
		padding: 20rpx 78rpx;
		background-color: #00CBCC;
		border-radius: 48rpx;
		box-shadow: 0px 8px 24px 0px rgba(103, 61, 17, 0.08);

		.save-text {
			font-size: 28rpx;
			font-weight: 700;
			color: #fff;
		}
	}
}

// 删除按钮样式
.delete-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 160rpx;
	height: 100%;
	background-color: #ff4d4f;
}
</style>
