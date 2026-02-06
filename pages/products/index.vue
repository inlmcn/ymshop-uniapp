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
    <rich-text :nodes="richTextContent"></rich-text>

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
    		<view v-if="productCoverImage" class="product-item" @click="goProductDetail">
    			<image :src="productCoverImage" mode="aspectFill" />
    			<view class="product-item-name">查看商品</view>
    		</view>
    	</movable-view>
    </movable-area>
    <!-- 侧边栏：使用 picker-view 实现 -->
    <view v-if="sidebarVisible" class="sidebar-mask" @click="closeSidebar"></view>
    <view class="sidebar" :class="{ xshow: sidebarVisible }">
      <picker-view :indicator-style="`height: 50px;`" indicator-class="sidebar-pricker-box" :immediateChange="true"
        :style="{
          height: `100vh`,
          background: '#000000',
          color: '#ffffff',
          border: '0px',
        }"
        mask-style="background-image: linear-gradient(#000000,rgba(255, 255, 255, 0)),linear-gradient(rgba(255, 255, 255, 0),#000000);"
        :value="currentProductIndex" @change="onPickerChange" @pickend="onPickerEnd">
        <picker-view-column>
          <view class="picker-item" v-for="(item, index) in productList" :key="index"
            :class="{ active: currentProductIndex[0] === index }">
            {{ item.name }}
          </view>
        </picker-view-column>
      </picker-view>
    </view>
  </view>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { getDocumentPf } from "@/api/selective.js";
import { onLoad } from "@dcloudio/uni-app";
import { useRouter } from "@/hooks/useRouter";
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH } from "@/utils/imgpath";
import { useShare } from '@/hooks/useShare';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

const { commonPageShare } = useShare();

const richTextContent = ref("");
const videoSrc = ref("");
const showFloatVideo = ref(true);
const sidebarVisible = ref(false);
const currentProductIndex = ref([0]);
const x = ref(0)
const y = ref(0)
const { goBack } = useRouter();
onMounted(()=>{
	const windowHeight = uni.getSystemInfoSync().windowHeight
	const windowWidth = uni.getSystemInfoSync().windowWidth
	y.value = windowHeight - 155
	x.value = windowWidth - 80
})
const goHome = () => {
  uni.switchTab({
    url: "/root/index/index",
  });
};

// watch(sidebarVisible, (newVal) => {
//   console.log("侧边栏可见性变化：", newVal);
//   if (!newVal) {
//     selectProduct(productList.value[currentProductIndex.value]);
//   }
// });

// 产品列表数据
const productList = ref([]);

const goProductDetail = () => {
  if (productItem.value && productItem.value.id) {
    uni.navigateTo({ url: `/pages/product/detail?id=${productItem.value.id}` })
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
const productCoverImage = ref("");

const selectProduct = (product) => {
  videoSrc.value = "";
  richTextContent.value = "";
  productCoverImage.value = "";
  console.log("选择的产品：", product);
  // 在这里可以添加根据选择的产品更新页面内容的逻辑
  showFloatVideo.value = true;
  right.value = 20;
  bottom.value = 180;
  console.log("获取产品详情成功", product.content);
  videoSrc.value = product.mpImg;
  richTextContent.value = product.content ? product.content.replace(/<img /g, "<img style='width:100%;' ") : "";
  productItem.value = product.productList && product.productList.length > 0 ? product.productList[0] : null;
  // 处理产品主图（只有图片）
  if (productItem.value.sliderImage) {
    const mediaUrls = productItem.value.sliderImage.split(',').map(url => url.trim()).filter(url => {
      return !/\.(mp4|mov|avi|wmv|flv|mkv|webm|m4v)(\?.*)?$/i.test(url.toLowerCase());
    });
    if(mediaUrls.length > 0){
      productCoverImage.value = mediaUrls[0]
    }
  }
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
  selectProduct(productList.value[currentProductIndex.value]);
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
  getDocumentPf({
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
page {
  padding-bottom: 0px !important;
}

.product-page {
  background-color: white;
  min-height: 100vh;
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

.menu-btn {
  position: fixed;
  left: 50rpx;
  z-index: 999;

  image {
    width: 50rpx;
    height: 40rpx;
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

movable-area {
	  position: fixed;
	  top: 0;
	  left: 0;
	  width: calc(100vw - 120rpx);
	  height: calc(100vh - 155rpx);
	  pointer-events: none;
	  z-index: 999;
	  movable-view{
		pointer-events: auto;
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
