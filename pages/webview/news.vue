<template>
	<Header  v-if="tag!='0'" :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
		<template #left>
			<view class="header-left">
				<uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
				<image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
			</view>
		</template>
		<text class="header-title">{{title}}</text>
	</Header>
	<view class="product-detail">
		  <view class="viewClass" v-if="tag=='1'">
			<rich-text class="content" :nodes="notice.content"></rich-text>
		  </view>
		  <view class="webview-container"  v-if="tag=='0'">
		   <web-view :src="notice.tourl" />
		  </view>
	</view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Header from '@/components/Header/index.vue'
import { useRouter } from '@/hooks/useRouter'
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath.js'
import { collectSingle, getProductDetail, getProductDocument } from '@/api/product'	
import { getNoticeListTop ,getNotice} from "@/api/user";
const { getParams, goBack,toHome } = useRouter()
// 文档数据
const documentData = ref({ report: [], literatureList: [], literatureImg: null });

// 弹窗相关状态
const showDetailPopupRef = ref(null);
const selectedItem = ref(null);
const productId = ref(null)

const tag = ref('-1')
const title = ref('')
// 初始化router
const router = useRouter()
// 产品轮播图数据
const productImages = ref([
	PRODUCT_IMG_PATH + 'image7952x.png',
	// 可以添加更多图片
]);
	const notice = ref({content:''})
	async function selectNotice(id){
		let data = await getNotice(id);
		// 处理富文本中的图片，添加宽度限制
		if(data.content) {
			data.content = data.content.replace(/<img/g, '<img style="max-width:100%;height:auto;display:block;margin:10rpx 0;"');
		}
		notice.value = data;
		title.value = notice.value.title ? (notice.value.title.length > 10 ? notice.value.title.substring(0, 10) + '...' : notice.value.title) : '';
		let num=0;
		if(data.totype==0){
			//跳外链
			if(data.tourl && data.tourl.startsWith('https://')){
			    // 你的代码
				tag.value ='0'
				num++;
			}
		}
		if(data.totype==1 && data.tourl){
			//跳小程序
			num++;
			//小程序跳转
			router.push({
				url: data.tourl
			})
		}
		if(num==0){
			tag.value ='1'
		}
		
		// uni.setNavigationBarTitle({
		// 	title: data.title
		// });
	}
	
	onLoad((options) => {
		console.log("========options=========",options)
		// const params = getParams(options)
		// let id = options.id
		
		// 统一的参数获取
		  const getParam = (key) => {
		    // 优先从直接URL参数获取
		    if (options[key]) {
		      return options[key];
		    }
		    
		    // 从details参数获取
		    if (options.details) {
		      try {
		        const decoded = decodeURIComponent(options.details);
		        const data = JSON.parse(decoded);
		        return data[key];
		      } catch (error) {
		        console.error('解析details失败:', error);
		      }
		    }
		    
		    return undefined;
		  };
		  
		  const id = getParam('id');
		  console.log("========id=========", id);
		selectNotice(id);
		
	})
	
	
	// 智能参数获取函数
	const getSmartParam = (options, paramName) => {
	  // 优先从URL查询参数获取（方式1）
	  if (options && options[paramName]) {
	    return options[paramName];
	  }
	  
	  // 如果URL参数没有，尝试从router的data参数获取（方式2）
	  // 这里需要根据你的router实现来调整
	  const routerData = getApp().globalData.routerTempData;
	  if (routerData && routerData[paramName]) {
	    return routerData[paramName];
	  }
	  
	  return undefined;
	}

</script>

<style lang="scss" scoped>
.product-detail {
	width: 100%;
	min-height: 100vh;
	background: $uni-bg-color;
	position: relative;
	padding-bottom: 80rpx;
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



.content {
  word-wrap: break-word; /* 当内容超过容器宽度时自动换行 */
}

.viewClass {
	overflow-wrap: break-word;
	white-space: pre-wrap;
	padding: 30rpx 24rpx;
	max-height: 100%;
	overflow-y: auto;
	word-break: break-word;
	box-sizing: border-box;
}
.viewClass img {
	max-width: 100% !important;
	height: auto !important;
	display: block !important;
	margin: 15rpx auto !important;
}


</style>
