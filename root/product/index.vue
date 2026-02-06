<template>
	<Header ref="headerRef" :show-return="false" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
		<template #left>
			<view class="header-left">
				<uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
				<image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
			</view>
		</template>
		<image :src="COMMON_IMG_PATH + 'logo-1.png'" class="arrow-icon"></image>
	</Header>
	<!-- 搜索框 - 多端适配 -->
	<view ref="searchBoxRef" class="search-box" :style="searchBoxStyle">
		<view class="custom-search">
			<view class="search-icon">
				<uv-icon name="search" size="18" color="#999" />
			</view>
			<input class="search-input" v-model="searchValue" placeholder="搜索商品" placeholder-class="search-placeholder"
				@confirm="handleSearch" />
			<view class="search-text" @click="handleSearch">搜索</view>
		</view>
	</view>
	<view class="goods-category" :style="computeMainBoxStyle">
		<!-- 修复uv-vtabs超出右侧问题：添加容器并设置样式 -->
		<view class="vtabs-container"
			style="width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box; position: relative;">
			<view v-if="loading" class="goods-loading-mask">
				<uv-loading-icon color="#666" size="22" />
				<text class="loading-text">加载中...</text>
			</view>
			<uv-vtabs :key="`vtabs-${categoryData.length}`" :list="categoryData" :hdHeight="`${computeHeaderHeight}px`"
				:chain="true" :is-scroll="true" :active-color="'#333'" :inactive-color="'#999'" :line-height="4"
				:barWidth="'180rpx'" :contentStyle="{ width: 'calc(100% - 180rpx)', maxWidth: 'calc(100% - 180rpx)' }"
				:customStyle="{ width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box', position: 'relative', display: 'flex', flexDirection: 'row', fontWeight: 600 }"
				:barStyle="sidebarStyle" @change="handleTabChange">
				<!-- 健康测评 -->
				<view class="health-assessment" :style="{ backgroundImage: 'url(' + INDEX_IMG_PATH + 'baogao.png)' }">
					<view class="assessment-info">
						<text class="assessment-title">体验健康测评</text>
						<text class="assessment-desc">已有<text style="color: red;font-weight: 600;">{{ assessmentCount
						}}</text>人参与</text>
						<view>
							<button class="start-assessment" @click="goReview">开始测评</button>
						</view>
					</view>
				</view>
				<!-- 各分类动态渲染 -->
				<template v-for="(category, index) in categoryData" :key="category.id">
					<uv-vtabs-item :index="index">
						<view class="category-list">
							<view class="category">
								<view class="category-title" @click="toGoodsCategoryList(category.id)">
									<view class="category-title-text">
										{{ category.name }}
									</view>
									<uv-icon name="arrow-right" color="#ccc" size="14" class="icon" />
								</view>
								<view class="category-content">
									<uv-grid :border="false" :col="2" :gutter="20">
										<template v-for="(product, productIndex) in category.children"
											:key="product.id">
											<uv-grid-item @click="toGoodsDetail(product.id)">
												<view class="product-card">
													<view class="pc-top-section">
														<view class="pc-title">{{ product.productName.slice(0, 4)}}</view>
														<view class="pc-image">
															<image v-if="!product.productBadge" :src="product.image" mode="aspectFit" />
														</view>
													</view>
													<view class="pc-tags-wrapper">
														<!-- First row: up to 3 tags -->
														<view class="pc-tags-row">
															<view class="pc-tag"
																v-for="(tag, tagIndex) in getValidTags(product.productTagNameList).slice(0, 3)"
																:key="'r1-' + tagIndex" :style="{
																	color: tag.fontColor || '#FFFFFF',
																	backgroundColor: tag.bgColor || '#00CBCC',
																	borderColor: tag.borderColor || '#00CBCC'
																}">
																{{ (typeof tag === 'string' ? tag : tag.tagName)?.slice(0, 3) }}
															</view>
														</view>
													</view>
													<view class="pc-subtitle uv-line-2">{{ product.storeName }}</view>
													<view class="pc-price-row">
														<view class="pc-price">￥{{ product.price }}/月</view>
														<view class="pc-status">{{ formatSoldCount(product.sales) }}</view>
													</view>

													<image v-if="product.productBadge" class="pc-badge" :src="product.productBadge" mode="aspectFit"></image>
												</view>
											</uv-grid-item>
										</template>
									</uv-grid>
								</view>
							</view>
						</view>
					</uv-vtabs-item>
				</template>
				<!-- 底部留白，確保最後一個分類可以滾動到頂部 -->
				<view style="height:500rpx;">
					&nbsp;
				</view>
			</uv-vtabs>
		</view>
	</view>
	
	<view v-if="showCampaign" class="campaign-overlay" @touchmove.stop.prevent>
	  <view class="assurance-card">
	    <view class="campaign-close-btn" @click="closeCampaign">
	      <image style="width: 60rpx; height: 60rpx;" mode="widthFix" :src="COMMON_IMG_PATH + 'X.png'">
	      </image>
	    </view>
	    <view>
	      <image style="width: 100%;" mode="widthFix" :src="cpImg" @click="campaignToIn"></image>
	    </view>
	  </view>
	</view>
	<view class="float-placeholder" :style="{'height':floatpopupList.length*72+'rpx'}"></view>
	<view class="float-box" v-if="floatpopupList&&floatpopupList.length>0">
		<view class="float-item" v-for="(item,index) in floatpopupList" :key="item.id" @click="topathPage(item.path)">
			<view v-if="item.type!==12" class="float-close" @click.stop="floatpopupList.splice(index,1)">
				<uv-icon name="close" color="#666666" size="32rpx" />
			</view>
			<view class="float-content">
				<image :src="item.popupImage" mode="scaleToFill"></image>
			</view>
			<view class="arrow-right">
				<uv-icon name="arrow-right" color="#666666" size="32rpx" />
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref, watch, nextTick, unref, toRefs } from 'vue'
import { useRouter } from "@/hooks/useRouter";
import Header from "@/components/Header/index.vue"
import { onLoad, onShow } from "@dcloudio/uni-app";
import UvVtabs from "@/uni_modules/uv-vtabs/components/uv-vtabs/uv-vtabs.vue";
import UvVtabsItem from "@/uni_modules/uv-vtabs/components/uv-vtabs-item/uv-vtabs-item.vue";
import UvGrid from "@/uni_modules/uv-grid/components/uv-grid/uv-grid.vue";
import UvGridItem from "@/uni_modules/uv-grid/components/uv-grid-item/uv-grid-item.vue";
import UvGap from "@/uni_modules/uv-gap/components/uv-gap/uv-gap.vue";
import UvIcon from "@/uni_modules/uv-icon/components/uv-icon/uv-icon.vue";
import UvLoadingIcon from "@/uni_modules/uv-loading-icon/components/uv-loading-icon/uv-loading-icon.vue";
import { useScroll } from "@/hooks/useScroll";
import { COMMON_IMG_PATH, INDEX_IMG_PATH } from '@/utils/imgpath'
import { getCategoryList, getCategoryProductList, getProductLabel,getPopUpInfo,addPopupLogs } from '@/api/product'
import { syncProductPriceFromProductValue, formatSoldCount } from '@/utils/utils'
import { getUserReportCount } from "@/api/evaluation";
import { useShare } from "@/hooks/useShare";
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useMainStore } from "@/store/modules/useMainStore";
import { checkTheUser } from "@/api/auth";

const { push, toHome } = useRouter()
const { scrollTop } = useScroll()
const headerRef = ref() //导航条
const searchValue = ref('') // 搜索框的值
const loading = ref(false) // 页面加载态
const searchBoxRef = ref() // 搜索框ref
const searchBoxHeight = ref(45) // 搜索框实际高度
const currentTabIndex = ref(0) // 当前选中的tab索引
const assessmentCount = ref(8888) // 健康测评人数

const mainStore = useMainStore();
const { user } = toRefs(mainStore);
// 初始化分享
const { productShare, shareAppMessage, shareTimeline, shareH5 } = useShare()
// 设置默认分享内容
// productShare()
// 微信小程序分享给好友
onShareAppMessage(() => {
	console.log("======产品也分享========================");
	const invitationCode = unref(user) ? unref(user).invitationCode : "";
	console.log("invitationCode", invitationCode);
	productShare(invitationCode);
	return shareAppMessage()
})

// 微信小程序分享到朋友圈
onShareTimeline(() => {
	return shareTimeline()
})

//悬浮弹窗
const campaignPopupRef = ref(null)
const showCampaign = ref(false)
const cpImg = ref('')
const popupObj = ref({})
const popupList = ref([])
const floatpopupList = ref([])
const openType = ref(0)
// 兼容旧调用：提供 show/close 方法
campaignPopupRef.value = {
  show() { showCampaign.value = true },
  close() { showCampaign.value = false }
}
// 关闭活动弹窗
const closeCampaign = () => {
  showCampaign.value = false
  popupShow()
}
const popupShow = async()=>{
  if(popupList.value.length>0){
    popupObj.value = popupList.value[0];
    openType.value = 1;
    cpImg.value = popupObj.value.popupImage;
	campaignPopupRef.value?.show?.();
    //显示完后，删掉第一个，这样再次点关闭的时候，就是显示下一个了
    popupList.value.splice(0,1)
  }
}
//弹窗跳转
async function campaignToIn() {
    if(popupObj.value){
		console.log(popupObj.value,'11111111111111')
		campaignPopupRef.value?.close?.()
      if(popupObj.value.path){
		let path = popupObj.value.path;
		if (path.startsWith("/root/")) {
			uni.switchTab({ url: popupObj.value.path})
		}else{
			uni.navigateTo({
			  url: popupObj.value.path,
			})
		}
      }
      addPopupLogs(popupObj.value.id);
    }
}
//悬浮窗跳转
const topathPage = (url)=>{
	if(url){
		uni.navigateTo({
		  url
		})
	}
}
async function isPopup() {
  const data = await getPopUpInfo(1);
  if(data && data.length>0){
    popupList.value =  data.filter(item=>item.popupType==0);
	floatpopupList.value = data.filter(item=>item.popupType==1)
    popupShow();
  }
}

const picUrl = ref('')
picUrl.value = COMMON_IMG_PATH + 'picUrl.png';

// 搜索框定位样式
const searchBoxStyle = computed(() => {
	const height = headerRef.value?.containerHeight ?? 0
	return {
		top: `${height}px`
	}
})

// 中心高度 100bh - 上导航栏 - h5底部高度
const computeMainBoxStyle = computed(() => {
	const height = headerRef.value?.containerHeight ?? 0
	return {
		paddingTop: `${searchBoxHeight.value}px`,
		height: `100vh`,
		boxSizing: 'border-box'
	}
})

// 左侧边栏定位样式
const sidebarStyle = computed(() => {
	const height = headerRef.value?.containerHeight ?? 0
	return {
		width: '180rpx',
		maxWidth: '180rpx',
		overflow: 'hidden',
		flexShrink: 0,
		background: '#F5F5F5',
		top: `${height + searchBoxHeight.value}px`,
		height: `calc(100vh - ${height + searchBoxHeight.value}px - var(--window-bottom, 0px) - ${floatpopupList.value.length*72}rpx)`
	}
})

// 计算头部总高度（header + 搜索框），用于vtabs的hdHeight属性
const computeHeaderHeight = computed(() => {
	const height = headerRef.value?.containerHeight ?? 0
	return height + searchBoxHeight.value
})

// 处理标签切换事件（确保左侧边栏同步）
function handleTabChange(index) {
	currentTabIndex.value = index
	console.log('标签切换到:', index)
}

const goReview = () => {
	uni.navigateTo({
		url: '/views/evaluation/startup/index'
	})
}

// 过滤有效的标签（只显示有 tagName 的标签）
function getValidTags(tags) {
	if (!tags || !Array.isArray(tags)) return [];
	return tags.filter(tag => typeof tag === 'string' || tag.tagName);
}


/**
 * 获取分类
 */
async function doGetCategoryList() {
	loading.value = true
	const category = await getCategoryProductList().catch(() => null)
	if (!category) { loading.value = false; return }
	// 二级分类，需要处理一下
	categoryData.value = category.map((item, index) => {
		const newItem = { ...item };
		if (newItem.storeProductList) {
			const processedList = syncProductPriceFromProductValue(newItem.storeProductList);
			newItem.children = processedList;
			delete newItem.storeProductList;
		}
		// 每个分类会在uv-vtabs中按照index+1(一个‘全部’会被插入到前面)
		// 由于uv-vtabs组件此时只暴露了picUrl容器但没有提供CSS控制其不正常显示
		// 所以需要为没有picUrl的牡或空值的picUrl预先设定为undefined以便没有图标渲染
		if (!newItem.picUrl) {
			newItem.picUrl = undefined; // 配合uv-vtabs的v-if=”item.picUrl”逻辑，不会picUrl渲染图标
		}
		return newItem;
	});

	// 創建"全部"分類，聚合所有產品（去重）
	const allProducts = [];
	const productMap = new Map(); // 用于去重
	categoryData.value.forEach(category => {
		if (category.children && Array.isArray(category.children)) {
			category.children.forEach(product => {
				if (!productMap.has(product.id)) {
					productMap.set(product.id, product);
					allProducts.push(product);
				}
			});
		}
	});

	// 根据sort字段排序 (升序: sort值越小越靠前)
	allProducts.sort((a, b) => (a.sort || 0) - (b.sort || 0));
	console.log(allProducts,'allProducts');
	// 創建全部分類對象
	const allCategory = {
		id: 0, // 使用特殊ID 0 表示全部
		name: '全部',
		picUrl: '/static/images/activ.png', // 設置默認圖片
		sort: 0,
		description: '所有商品',
		status: 0,
		createTime: Date.now(),
		children: allProducts
	};
	categoryData.value.unshift(allCategory);
	console.log(categoryData.value,'categoryData.value');
	loading.value = false;
} // End of doGetCategoryList function

/**
 * 数组转tree
 * @param items
 * @returns {*[]}
 */
function arrayToTree(items) {
	const rootItems = [];
	const itemMap = {};

	// 首先，将所有项按照id映射到itemMap中，并找到根项（没有父项的项）
	items.forEach(item => {
		itemMap[item.id] = { ...item, children: [] };

		if (item.parentId === 0) {
			rootItems.push(itemMap[item.id]);
		}
	});

	// 然后，将子项添加到父项的children属性中
	items.forEach(item => {
		if (item.parentId !== 0) {
			itemMap[item.parentId].children.push(itemMap[item.id]);
		}
	});

	return rootItems;
}

/**
 * 去商品详情
 * @param productId
 */
function toGoodsDetail(productId) {
	push({
		url: '/pages/product/detail'
	}, {
		data: {
			id: productId
		}
	})
}

/**
 * 去商品列表
 * @param categoryId
 */
function toGoodsCategoryList(categoryId) {
	push({
		url: '/pages/goodsList/goodsList'
	}, {
		data: { sid: categoryId }
	})
}


/**
 * 处理搜索
 */
function handleSearch() {
	// 去除头尾空格
	const keyword = searchValue.value?.trim() || ''

	// 如果搜索关键词为空，不进行跳转
	if (!keyword) {
		uni.showToast({
			title: '请输入搜索关键词',
			icon: 'none'
		})
		return
	}

	console.log('搜索内容:', keyword)
	push({
		url: '/pages/goodsList/goodsList'
	}, {
		data: { keyword }
	})
}
const categoryData = ref([]) // 分类列表

// 获取搜索框实际高度
function getSearchBoxHeight() {
	uni.createSelectorQuery().select('.search-box').boundingClientRect(data => {
		if (data && data.height) {
			searchBoxHeight.value = data.height
			console.log('搜索框实际高度:', data.height)
		}
	}).exec()
}

onLoad(async (option) => {
	
	if (option.scene) {
		//表示扫二维码 或者 小程序链接 过来的
		let sc = option.scene;
		if (sc.startsWith('code_')) {
			let code = sc.substring(5);
			checkTheUserInit(code,Number(option.channelId))
		}
	}
	doGetCategoryList()
	console.log('分类数据:', categoryData.value)
	// 获取搜索框高度
	nextTick(() => {
		setTimeout(() => {
			getSearchBoxHeight()
		}, 100)
	})
	isPopup()
})


async function checkTheUserInit(invitationCode,channelId) {
	//进行注册绑定关系操作
	wx.login({
		async success(res) {
			if (res.code) {
				console.log('微信code===========----' + res.code)
				let data = {};
				data.phoneCode = '888809';
				data.loginCode = res.code;
				data.invitationCode = invitationCode;
				data.channelId = channelId
				const loginRes = await checkTheUser(data);
				await mainStore.setAccessToken(loginRes)
			}
		}
	});
}


onShow(() => {
	// 处理分享参数(从其他页面分享跳转过来)
	const shareParams = uni.getStorageSync('shareParams')
	if (shareParams && shareParams.t) {
		console.log('接收到分享参数:', shareParams)
		// 清除已使用的分享参数
		uni.removeStorageSync('shareParams')

		// 这里可以根据分享参数执行特定逻辑
		// 例如:展示特定内容、弹窗提示等
		// 目前产品页面不需要特殊处理,仅清除参数即可
	}

	// 获取导航条高度
	getUserReportCount().then((res) => {
		console.log("res", res);
		assessmentCount.value = res;
	});
})

</script>

<style lang="scss">
page {
	background-color: #fff;
}

/* 选中项样式 */
:deep(.uv-vtabs__bar-item--active) {
	background: #FFFFFF !important;
	color: #333333 !important;
	font-weight: 600 !important;
	border-left: 4rpx solid #333333 !important;
	border-right: none !important;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05) !important;
	position: relative !important;
	z-index: 10 !important;
}

.search-box {
	position: fixed;
	left: 0;
	right: 0;
	padding: 10rpx 30rpx;
	background-color: #fff;
	z-index: 100;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.custom-search {
	display: flex;
	align-items: center;
	background-color: #f5f5f5;
	border-radius: 50rpx;
	padding: 0 20rpx;
	height: 70rpx;
	/* 减少搜索框高度 */
	position: relative;
}

.search-icon {
	display: flex;
	align-items: center;
	margin-right: 20rpx;
}

.search-input {
	flex: 1;
	height: 100%;
	font-size: 28rpx;
	color: #333;
	background-color: transparent;
	border: none;
	outline: none;
}

.search-placeholder {
	color: #999;
	font-size: 28rpx;
}

.search-text {
	color: #999;
	font-size: 28rpx;
	margin-left: 20rpx;
	cursor: pointer;
}

.arrow-icon-gg {
	height: 184rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 20rpx;
	box-sizing: border-box;
	background: transparent;

	image {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
}

.arrow-icon {
	width: 234rpx;
	height: 70rpx;
}



.category-list {
	padding: 0;
	box-sizing: border-box;
}

.category {
	margin-bottom: 20rpx;

	&-title {
		display: flex;
		align-items: center;
		margin-top: 50rpx;
		margin-bottom: 30rpx;
		justify-content: space-between;

		&-text {
			line-height: 45rpx;
			font-size: 32rpx;
			color: #333333;
			margin: 0 30rpx;
		}

		.line {
			width: 30rpx;
			height: 1rpx;
			background: #CCCCCC;
		}
	}

	&-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-bottom: 30rpx;

		.image {
			width: 150rpx;
			height: 110rpx;
			display: block;
			background: #ffffff;
		}

		&-name {
			margin-top: 20rpx;
			line-height: 32rpx;
			font-size: 24rpx;
			color: #999999;
		}
	}
}

/* 主容器样式调整 - 根据新搜索栏高度 */
.goods-category {
	width: 100%;
	overflow: hidden;
	padding-left: 0;
	padding-right: 0;
	box-sizing: border-box;
	background: #fff;
	position: relative;
}

/* 修复uv-vtabs超出右侧问题的容器样式 */
.vtabs-container {
	width: 100%;
	max-width: 100%;
	overflow: hidden;
	position: relative;
	box-sizing: border-box;
	padding-right: 0;
	margin-right: 0;
	background: #fff;
}

/* 确保vtabs内容不会超出屏幕 */
:deep(.uv-vtabs) {
	width: 100%;
	max-width: 100%;
	overflow: hidden;
	box-sizing: border-box;
	display: flex;
	flex-direction: row;
	background: #fff;
}

:deep(.uv-vtabs__bar) {
	background: #F5F5F5;
	position: fixed;
	left: 0;
	z-index: 10;
	width: 180rpx !important;
	max-width: 180rpx !important;
	border-right: 2rpx solid #EEEEEE;

	.uv-vtabs__bar-item {
		text-align: left;
		padding: 30rpx 20rpx 30rpx 50rpx;
		font-size: 24rpx;
		color: #999999;
		background: transparent;
		border-radius: 0;
		min-height: 100rpx;
		position: relative;
	}
}

:deep(.uv-vtabs__content) {
	flex: 1;
	overflow: hidden;
	box-sizing: border-box;
	width: calc(100% - 180rpx) !important;
	max-width: calc(100% - 180rpx) !important;
	margin-left: 180rpx !important;
	padding: 0 20rpx !important;
	background: #fff !important;
}

/* 确保内容区域可以正常滚动 */
:deep(.uv-vtabs__content scroll-view) {
	width: 100% !important;
	max-width: 100% !important;
	box-sizing: border-box !important;
	overflow-y: auto !important;
	padding: 0 !important;
}

/* vtabs内容面板优化 */
:deep(.uv-vtabs__content-item) {
	width: 100% !important;
	padding: 0 !important;
	margin: 0 !important;
	box-sizing: border-box !important;
}

/* 分类图标显示控制：仅激活时显示 */
:deep(.uv-vtabs__bar-item) {
	.uv-vtabs__bar-item--top-icon {
		display: none !important;
	}
}

:deep(.uv-vtabs__bar-item-active) {
	.uv-vtabs__bar-item--top-icon {
		display: block !important;
	}
}

/* 选中项样式 */
:deep(.uv-vtabs__bar-item--active) {
	background: #FFFFFF !important;
	color: #333333 !important;
	font-weight: 600 !important;
	border-left: 4rpx solid #333333 !important;
	border-right: none !important;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05) !important;
	position: relative !important;
	z-index: 10 !important;
}

/* 商品网格布局优化 - 完全消除右侧空白 */
:deep(.uv-grid) {
	width: 100% !important;
	box-sizing: border-box !important;
	margin: 0 !important;
	padding: 0 !important;
}

:deep(.uv-grid-item) {
	width: 50% !important;
	margin-bottom: 20rpx !important;
	box-sizing: border-box !important;
	padding: 0 10rpx !important;
}

/* 商品卡片样式优化 */
.product-card {
	position: relative;
	background-color: #F6F6F6;
	border-radius: 24rpx;
	padding: 20rpx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	width: 100%;
}

.pc-top-section {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	width: 100%;
}

.pc-title {
	font-size: 32rpx;
	line-height: 1.2;
	font-weight: 400;
	color: #000;
	white-space: normal;
	word-break: break-all;
	flex: 0.8; /* Allow title to take available space */
}

.pc-tags-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  height: 44rpx;
  overflow: hidden;
  justify-content: center;
}

.pc-tags-row {
  display: flex;
  gap: 4rpx;
  flex-wrap: nowrap;
  align-items: center;
  min-height: 32rpx;
  /* Ensure row takes up space even if empty */
  overflow: hidden;
}

.pc-tag {
	font-size: 16rpx;
	color: #5578FF;
	background-color: #E7F2FF;
	padding: 4rpx 10rpx;
	border-radius: 32rpx;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 160rpx;
}

.pc-subtitle {
	margin-top: 10rpx;
	font-size: 24rpx;
	font-weight: 500;
	color: #000;
	white-space: break-spaces;
  width: 100%;
  height: 65rpx;
}

.pc-price-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 10rpx;
	width: 100%;
}

.pc-price {
	font-size: 24rpx;
	font-weight: 600;
	color: #222;
}

.pc-status {
	font-size: 18rpx;
	color: #979797;
}

.pc-image {
	width: 80rpx;
	height: 80rpx;
	flex-shrink: 0; /* Prevent image from shrinking */
	margin-left: 10rpx;
}

.pc-image image {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.pc-badge {
	position: absolute;
	display: block;
	top: 0;
	right: 0;
	width: 108rpx;
	height: 108rpx;
}

/* 商品列表加载遮罩样式 */
.goods-loading-mask {
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.9);
	z-index: 99;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
}

.loading-text {
	color: #666;
	font-size: 26rpx;
}

/* 健康测评 */
.health-assessment {
	margin: 30rpx 0;
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
	display: flex;
	align-items: center;
	position: relative;
	overflow: hidden;
	min-height: 244rpx;
	border-radius: 24rpx;
}

.assessment-info {
	width: 100%;
	display: flex;
	flex-direction: column;
	text-align: right;
	align-items: flex-end;
	padding: 0 30rpx;
}

.assessment-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #1a202c;
	margin-bottom: 12rpx;
	letter-spacing: 1rpx;
}

.assessment-desc {
	font-size: 24rpx;
	color: #718096;
	margin-bottom: 40rpx;
	line-height: 1.5;
}

.start-assessment {
	background: #00CBCC;
	color: #fff;
	border-radius: 35rpx;
	font-size: 26rpx;
	font-weight: 600;
	border: none !important;
	position: relative;
	overflow: hidden;
	cursor: pointer;
	min-width: 174rpx;
	line-height: 1;
	padding: 20rpx 0;
}
.assurance-card {
  position: relative;
  width: 90%;
  max-width: 600rpx;
}
.campaign-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.campaign-close-btn {
  position: absolute;
  bottom: -80rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 60rpx;
  z-index: 10000;
  cursor: pointer;
}
.float-box{
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	z-index:99;
	.float-item{
		width: 750rpx;
		height: 72rpx;
		position: relative;
		.float-close{
			position: absolute;
			left: 30rpx;
			top:50%;
			transform: translateY(-50%);
		}
		.float-content{
			width: 750rpx;
			height:72rpx;
			image{
				width: 750rpx;
				height:72rpx;
			}
		}
		.arrow-right{
			position: absolute;
			right: 31rpx;
			top:50%;
			transform: translateY(-50%);
		}
	}
}
</style>
