<template>
	<view class="product-page">
		<view class="header-left" :style="{ top: headerTop + 'px' }">
		  <!-- <uv-icon name="arrow-left" size="20" color="#7E7E7E" @click="goBack" /> -->
		  <image class="arrow-left" :src="PRODUCT_IMG_PATH + 'products_left_icon.png'" mode="widthFix" @click="goBack" />
		  <!-- <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="goHome" /> -->
		  <!-- 左上角菜单按钮 -->
		  <view class="header-menu-btn" @click="toggleSidebar">
		    <image :src="PRODUCT_IMG_PATH + 'product_menu_icon2.png'" mode="widthFix" />
		    <!-- <image v-else :src="PRODUCT_IMG_PATH + 'products_menu_white_icon.png'" mode="widthFix" /> -->
		  </view>
		</view>
			<!-- 富文本内容 -->
			<rich-text :nodes="firstModel"></rich-text>
			<view v-if="itemsList&&itemsList.length>0" class="items-box" id="scrollBox">
				<view :id="'scroll-'+index" v-for="(item,index) in itemsList" :key="index.id">
					<rich-text :nodes="item.description"></rich-text>
				</view>
			</view>
			<rich-text :nodes="lastModel"></rich-text>
			<!-- 悬浮视频窗 -->
			<view v-if="showFloatVideo && videoSrc" class="float-video" @touchstart="startDrag" @touchmove="moveDrag"
				@touchend="endDrag" :style="{ right: `${right}px`, bottom: `${bottom}px` }">
				<video ref="videoPlayer" class="video-cover" :show-center-play-btn="false" :src="videoSrc" :controls="false"
					object-fit="cover"></video>
				<view class="play-icon" @click="toggleFloatVideo">
					<image :src="PRODUCT_IMG_PATH + 'products_play_icon.png'" mode="widthFix" />
				</view>
				<view class="close-btn" @click.stop="hideFloatVideo">
					<image :src="PRODUCT_IMG_PATH + 'products_play_close.png'" mode="widthFix" />
				</view>
			</view>
			
			<!-- 产品弹窗 -->
			<movable-area>
				<movable-view :x="x" :y="y" direction="all" :animation="false">
					<view v-if="productItem && productItem.image" class="product-item" @click="goProductDetail">
						<image :src="productItem.image" mode="aspectFill" />
						<view class="product-item-name">查看商品</view>
					</view>
				</movable-view>
			</movable-area>
			<!-- 左侧分类显示部分 -->
			<view v-if="showCate" class="cate-box">
				<scroll-view scroll-y="true" class="scroll-box" :scroll-top="scrolltoText">
					<view v-for="(item,index) in itemsList" :key="item.id" class="cate-item-box">
						<view :style="{backgroundImage:'url('+COMMON_IMG_PATH+'yxcateIconed.png'+')',top:-29*index+'rpx'}"
							v-if="activeCate==index" :class="['cate-item',activeCate==index?'cate-items':'']">
							{{item.title}}
						</view>
						<view @click="changeactiveCate(index)"
							:style="{backgroundImage:'url('+COMMON_IMG_PATH+'yxcateIcon.png'+')',top:-29*index+'rpx'}" v-else
							:class="['cate-item',activeCate==index?'cate-items':'']">
							{{item.title}}
						</view>
					</view>
				</scroll-view>
			</view>
		<!-- 侧边栏：使用 picker-view 实现 -->
		<view v-if="sidebarVisible" class="sidebar-mask" @click="closeSidebar"></view>
		<view class="sidebar" :class="{ xshow: sidebarVisible }">
			<picker-view :indicator-style="`height: 50px;`" indicator-class="sidebar-pricker-box"
				:immediateChange="true" :style="{
          height: `100vh`,
          background: '#000000',
          color: '#ffffff',
          border: '0px',
        }" mask-style="background-image: linear-gradient(#000000,rgba(255, 255, 255, 0)),linear-gradient(rgba(255, 255, 255, 0),#000000);"
				:value="currentProductIndex" @change="onPickerChange" @pickend="onPickerEnd">
				<picker-view-column>
					<view class="picker-item" v-for="(item, index) in productList" :key="index"
						:class="{ active: currentProductIndex[0] === index }">
						{{ item.storeName }}
					</view>
				</picker-view-column>
			</picker-view>
		</view>
	</view>
</template>
<script setup>
	import {
		ref,
		onMounted,
		watch,
		getCurrentInstance
	} from "vue";
	import {
		getDocumentYl,
		getDocumentyldetail
	} from "@/api/selective.js";
	import {
		onLoad,
		onPageScroll
	} from "@dcloudio/uni-app";
	import {
		useRouter
	} from "@/hooks/useRouter";
	import {
		PRODUCT_IMG_PATH,
		COMMON_IMG_PATH
	} from "@/utils/imgpath";
	import { useShare } from '@/hooks/useShare';
	import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

	const { commonPageShare } = useShare();

	const firstModel = ref('')
	const lastModel = ref('')
	const itemsList = ref([])
	const showCate = ref(false)
	const windowHeight = ref(0)
	const videoSrc = ref("");
	const activeCate = ref(0)
	const sectionTops = ref([])
	const scrollTop = ref(0)
	const itemtopTop = ref(0)
	const scrolltoText = ref(0)
	const itemtopHeight = ref(0)
	const scrollLoading = ref(false)
	const showFloatVideo = ref(true);
	const sidebarVisible = ref(false);
	const currentProductIndex = ref([0]);
	const instance = getCurrentInstance();
	const x = ref(0)
	const y = ref(0)
	const query = uni.createSelectorQuery().in(instance.proxy);
	onMounted(() => {
		windowHeight.value = uni.getSystemInfoSync().windowHeight
		const windowWidth = uni.getSystemInfoSync().windowWidth
		y.value = windowHeight.value - 155
		x.value = windowWidth - 80
	})
	const getsystemInfo = () =>{
			query.select("#scrollBox").boundingClientRect()
			query.exec(res => {
				const {
					top,
					bottom
				} = res[0]
				itemtopTop.value = top
				itemtopHeight.value = bottom
			})
	}
	onPageScroll((e) => { //nvue暂不支持滚动监听，可用bindingx代替
		if(scrollLoading.value) return
		handlePageScroll(e.scrollTop)
		scrollTop.value = e.scrollTop
		showCate.value = isElementVisible(itemtopTop.value,itemtopHeight.value,scrollTop.value,windowHeight.value)
	})
	//判断分类区域是否在可视区域
	const isElementVisible=(elementAbsoluteTop,elementAbsoluteBottom,scrollTop,windowHeight)=>{
	  // 计算视口的上下边界
	  const viewportTop = scrollTop;
	  const viewportBottom = scrollTop + windowHeight;
	  
	  // 核心判断逻辑：元素与视口是否有交集
	  return (
	    elementAbsoluteBottom > viewportBottom &&  // 元素底部在视口顶部下方
	    elementAbsoluteTop < viewportTop     // 元素顶部在视口底部上方
	  );
	}
	// 处理页面滚动
	const handlePageScroll=(scrollTop)=> {
		// 根据滚动位置确定当前应该激活的tab
		let currentIndex = 0
	  // 从后往前查找，找到第一个scrollTop大于等于section顶部的index
	  for (let i = sectionTops.value.length - 1; i >= 0; i--) {
	    if (scrollTop >= sectionTops.value[i]) {
	      currentIndex = i
	      break
	    }
	  }
	  // 更新激活的tab
	  if (currentIndex !== activeCate.value) {
	    activeCate.value = currentIndex
		scrolltoText.value = 70*activeCate.value
	  }
	}
	//切换分类区tab
	const changeactiveCate = (i) => {
		if (activeCate.value == i) return
		activeCate.value = i
		scrollLoading.value = true
		uni.pageScrollTo({
			selector:'#scroll-' + i,
			duration: 300,
			complete: (res) => {
				setTimeout(()=>{
					scrollLoading.value = false
					scrolltoText.value = 70*i
				},100)
			}
		})
	}
	// 计算各section距离页面顶部的距离
	const calcSectionPositions = ()=> {
	  sectionTops.value = []
	  itemsList.value.forEach((item, index) => {
	    query.select('#scroll-' + index).boundingClientRect(res => {
	      if (res) {
	        // 获取相对于页面顶部的绝对位置
	        const top = res.top
	        sectionTops.value[index] = top > 0 ? top : 0
	      }
	    }).exec()
	  })
	}
	const {
		goBack
	} = useRouter();

	const goHome = () => {
		uni.switchTab({
			url: "/root/index/index",
		});
	};

	// watch(sidebarVisible, (newVal) => {
	// 	console.log("侧边栏可见性变化：", newVal);
	// 	if (!newVal) {
	// 		selectProduct(productList.value[currentProductIndex.value]);
	// 	}
	// });

	// 产品列表数据
	const productList = ref([]);

	const goProductDetail = () => {
		if (productItem.value && productItem.value.productId) {
			uni.navigateTo({
				url: `/pages/product/detail?id=${productItem.value.productId}`
			})
		} else {
			uni.showToast({
				title: "暂无商品链接",
				icon: "none",
			});
		}
	};

	// async function fetchRichText() {
	//   const res = {
	//     data: {
	//       content: `
	//         <img src="${PRODUCT_IMG_PATH}products_1.png" style="width: 100%;" />
	//       `,
	//     },
	//   };
	//   richTextContent.value = res.data.content.replace(/<img /g, "<img style='width:100%;' ");
	// }

	const videoPlayer = ref(null); // 视频组件引用

	function toggleFloatVideo() {
		uni.setStorageSync("videoUrl", videoSrc.value);
		uni.navigateTo({
			url: "/pages/products/videoDetail?url=" + encodeURIComponent(videoSrc.value),
		});
	}

	function hideFloatVideo() {
		showFloatVideo.value = false;
	}

	const productItem = ref(null);

	const selectProduct = (product) => {
		videoSrc.value = "";
		firstModel.value = ''
		lastModel.value = ''
		console.log("选择的产品：", product);
		// 在这里可以添加根据选择的产品更新页面内容的逻辑
		showFloatVideo.value = true;
		right.value = 20;
		bottom.value = 180;
		getDocumentyldetail(product.id).then(res => {
			if (res) {
				videoSrc.value = res.videoUrl;
				firstModel.value = res.firstModel ? res.firstModel.replace(/<img /g,
					"<img style='width:100%;' ") : "";
				lastModel.value = res.lastModel ? res.lastModel.replace(/<img /g,
					"<img style='width:100%;' ") : "";
				productItem.value = res;
				if (res.items && res.items.length > 0) {
					itemsList.value = res.items.map(item => {
						item.description = item.description ? item.description.replace(/<img /g,
							"<img style='width:100%;' ") : ""
						return item
					})
					activeCate.value = 0
					showCate.value = false
					scrollLoading.value = true
					setTimeout(()=>{
						// 页面加载完成后获取各section的位置信息
						scrollLoading.value = true
						uni.pageScrollTo({
							duration:300,
							scrollTop:0,
							complete: (res) => {
								setTimeout(()=>{
									scrollLoading.value = false
								},100)
							}
						})
						getsystemInfo()
						calcSectionPositions()
						scrollLoading.value = false
					},500)
				}else{
					itemsList.value = []
					sectionTops.value = []
					scrollTop.value = 0
					itemtopHeight.value = 0
					activeCate.value = 0
					itemtopTop.value = 0
				}
			}
		})
	};

	// picker-view 选择变化
	function onPickerChange(e) {
		console.log("选择产品：", e.detail.value);
		currentProductIndex.value = e.detail.value;
		selectProduct(productList.value[currentProductIndex.value]);
	}

	// picker-view 选择结束
	function onPickerEnd(e) {
		console.log("选择产品结束：", currentProductIndex.value);
		// selectProduct(productList.value[currentProductIndex.value]);
	}

	// 切换侧边栏
	function toggleSidebar() {
		sidebarVisible.value = !sidebarVisible.value;
	}

	// 点击非列表区域收起
	function closeSidebar() {
		sidebarVisible.value = false;
	}

	// 修改data定义部分
	const isDragging = ref(false);
	const startX = ref(0);
	const startY = ref(0);
	const startRight = ref(20); // 初始右偏移
	const startBottom = ref(180); // 初始下偏移
	const right = ref(20);
	const bottom = ref(180);
	const screenWidth = ref(0);
	const screenHeight = ref(0);

	// 修改startDrag函数
	function startDrag(e) {
		console.log("开始拖动");
		isDragging.value = true;
		startX.value = e.touches[0].clientX;
		startY.value = e.touches[0].clientY;
		startRight.value = right.value; // 保存当前位置
		startBottom.value = bottom.value; // 保存当前位置

		// 获取屏幕尺寸
		const systemInfo = uni.getSystemInfoSync();
		screenWidth.value = systemInfo.windowWidth;
		screenHeight.value = systemInfo.windowHeight;
	}

	// 修改 moveDrag 函数
	function moveDrag(e) {
		if (!isDragging.value) return;
		const dx = e.touches[0].clientX - startX.value;
		const dy = e.touches[0].clientY - startY.value;
		console.log("移动中", dx, dy);

		// 相对于初始位置计算新位置（修正方向）
		let newRight = startRight.value - dx;
		let newBottom = startBottom.value - dy; // 修正：减去dy而不是加上

		// 限制 right 范围 (20px 到 屏幕宽度-100px)
		newRight = Math.max(20, Math.min(newRight, screenWidth.value - 100));

		// 限制 bottom 范围 (20px 到 屏幕高度-150px)
		newBottom = Math.max(20, Math.min(newBottom, screenHeight.value - 170));

		// 更新位置
		right.value = newRight;
		bottom.value = newBottom;
	}

	// 结束拖动
	function endDrag() {
		console.log("结束拖动");
		isDragging.value = false;
	}

	// 新增响应式数据
	const headerTop = ref(0);
	const menuTop = ref(0);

	onLoad(() => {
		calculateMenuTop(); // 页面加载后计算 menuTop
		console.log("menuTop:", menuTop.value);
		getDocumentYl({
			// pageNo: 1,
			// pageSize: 100,
		}).then((res) => {
			console.log("获取成功", res);
			if (res && res.length) {
				productList.value = res;
				selectProduct(res[0]);
			} else {
				uni.showToast({
					title: "未获取到产品数据",
					icon: "none",
				});
			}
		});
	});

	function calculateMenuTop() {
		// 获取状态栏高度
		const systemInfo = uni.getSystemInfoSync();
		const statusBarHeight = systemInfo.statusBarHeight || 0;

		// 获取胶囊按钮边界信息
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect();

		// 计算 menu-btn 应有的 top 值
		menuTop.value = statusBarHeight + 44; // 默认胶囊高度设为32px
		headerTop.value = statusBarHeight;

		// 获取屏幕尺寸
		screenWidth.value = systemInfo.windowWidth;
		screenHeight.value = systemInfo.windowHeight;
	}

	onShareAppMessage(() => {
		return commonPageShare();
	});
	onShareTimeline(() => {
		return commonPageShare();
	});
</script>

<style lang="scss">
	.product-page {
		// background-color: white;
		min-height: 100vh;
	}
	.header-left {
	  position: fixed;
	  left: 20px;
	  display: flex;
	  align-items: center;
	  gap: 24rpx;
	  height: 44px;
	  z-index: 999;
	
	  .arrow-left {
	    width: 48rpx;
	    height: 48rpx;
	  }
	
	  .header-menu-btn {
	    width: 42rpx;
	    height: 34rpx;
	  }
	}
	rich-text{
		line-height: 1 !important; /* 重置行高 */
		font-size: 0 !important; /* 消除字体间隙 */
		display: block !important;
	}
	.sidebar-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.4);
		z-index: 9;
	}

	.sidebar {
		position: fixed;
		left: -100vw;
		top: 0;
		width: 300rpx;
		height: 100vh;
		background-color: #000;
		color: white;
		z-index: 998;
		transition: left 0.3s ease;

		&.xshow {
			left: 0;
		}

		.picker-item {
			padding: 5px;
			box-sizing: border-box;
			line-height: 40px;
			font-size: 32rpx;
			text-align: center;
			color: rgba(255, 255, 255, 0.8);
			transition: font-size 0.3s ease;
			font-weight: 400;
			width: 300rpx;
			// 单行溢出隐藏
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			&.active {
				color: #ffffff;
				font-weight: 600;
				font-size: 34rpx;
			}
		}
	}

	.float-video {
		position: fixed;
		width: 160rpx;
		height: 220rpx;
		right: 20px;
		bottom: 180px;
		background-color: rgba(0, 0, 0, 0.6);
		border-radius: 10rpx;
		overflow: hidden;
		z-index: 999;
		touch-action: none;

		.video-cover {
			width: 100%;
			height: 100%;
		}

		.play-icon {
			position: absolute;
			top: 0%;
			left: 0%;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.4);
			z-index: 9;
			display: flex;
			align-items: center;
			justify-content: center;

			image {
				display: block;
				width: 45rpx;
				height: 45rpx;
			}
		}

		.close-btn {
			position: absolute;
			top: 0;
			right: 0;
			z-index: 19;

			image {
				display: block;
				width: 30rpx;
				height: 30rpx;
			}
		}
	}

	.cate-box {
		position: fixed;
		left: 0;
		top: 229rpx;
		text-align: center;
		height: calc(100vh - 394rpx);
		.scroll-box{
			max-height: calc(100vh - 394rpx);
			.cate-item-box {
				.cate-item {
					font-size: 32rpx;
					width: 88rpx;
					height: 242rpx;
					line-height: 88rpx;
					writing-mode: vertical-lr;
					background-size: cover;
					position: relative;
					left: 0;
				}
			
				.cate-items {
					color: #fff;
					z-index: 9;
				}
			
			}
		}
	}

	.pickerMask {
		background-color: #000 !important;
	}

	.sidebar-pricker-box::after {
		border-bottom: 0px;
	}

	.sidebar-pricker-box::before {
		border-top: 0px;
	}
	.header-title {
	    font-size: 36rpx;
	    font-weight: 600;
	    color: #121212;
	}
	movable-area {
	  position: fixed;
	  top: 0;
	  left: 0;
	  width: calc(100vw - 120rpx);
	  height: calc(100vh - 155rpx);
	  pointer-events: none;
	  z-index: 999;
	  movable-view{
		  pointer-events: auto; //可以点击
		  .product-item {
			width: 120rpx;
			height: 155rpx;
		  	text-align: center;
		  	background: #ffffff;
		  	box-shadow: 2rpx 5rpx 18rpx 0rpx rgba(0, 0, 0, 0.07);
		  	border-radius: 20rpx;
		  	overflow: hidden;
		  
		  	image {
		  		width: 120rpx;
		  		height: 120rpx;
		  		display: block;
		  	}
		  
		  	.product-item-name {
		  		background: #00cbcc;
		  		border-radius: 0rpx 0rpx 0rpx 0rpx;
		  		font-weight: 500;
		  		font-size: 22rpx;
		  		color: #ffffff;
		  		line-height: 35rpx;
		  		text-align: center;
		  	}
		  }
	  }
	}
</style>