<template>
  <view class="user-page">
    <!-- 背景区域 -->
    <view class="bg-wrapper" :style="{ backgroundImage: 'url(' + INDEX_IMG_PATH + 'bg1.png' + ')' }">
      <!-- Header组件 -->
      <Header 
        :scroll-top="scrollTop" 
        :show-return="false" 
        :prop-up="true" 
        system-bar-area-bg="transparent"
        header-area-bg="transparent"
        :bg-change-by-scroll="false">
        <template #default>
          <image :src="COMMON_IMG_PATH + 'logo.png'" class="logo-image"></image>
        </template>
      </Header>
      
      <!-- 用户信息卡片 -->
      <view class="user-card">
      <view class="user-header" v-if="user">
        <image class="avatar" :src="user.avatar || userInfo.avatar" mode="aspectFill" @click="toUserCenter" />
        <view class="user-info">
          <text class="username" @click="toUserCenter"> {{ user.nickname }}</text>
          <view class="user-tips" @click="toUserCenter">
            <text class="tip-text">
              <!-- <text>完善信息 赠 积分</text> -->
              <text>完善信息</text>
              <img :src="INDEX_IMG_PATH + '11.png'" alt="" srcset="">
            </text>
            <!-- <view class="points-link" @click="goPoints">积分中心
              <img :src="INDEX_IMG_PATH + '33.png'" class="points-icon" alt="" srcset="">
            </view> -->
          </view>
        </view>
      </view>

      <!-- 资产信息 -->
      <view class="assets" v-if="user">
        <!-- <view class="asset-item" @click="showComingSoon('储值金')">
          <text class="value">{{ user.nowMoney ?? 0 }}</text>
          <text class="label">储值金</text>
        </view>
        <view class="asset-item" @click="showComingSoon('积分')">
          <text class="value">{{ user.integral ?? 0 }}</text>
          <text class="label">积分</text>
        </view> -->
        <view class="asset-item">
          <text class="value">0</text>
          <text class="label">储值金</text>
        </view>
        <view class="asset-item">
          <text class="value">0</text>
          <text class="label">积分</text>
        </view>
        <view class="asset-item" @click="goCouponCenter">
          <text class="value">{{ user.couponNumber ?? 0 }}</text>
          <text class="label">优惠券</text>
        </view>
      </view>

      <!-- 未登录状态 -->
      <view class="user-header" v-else>
        <image class="avatar" :src="userInfo.avatar" mode="aspectFill" @click="toUserCenter" />
        <view class="user-info">
          <text class="username" @click="toUserCenter">点击登录</text>
          <view class="user-tips">
            <text class="tip-text">
              <text>登录后查看更多信息</text>
            </text>
          </view>
        </view>
      </view>
    </view>
    </view>

    <!-- 常用功能 -->
    <view class="section">
      <view class="section-header">
        <text class="title">常用功能</text>
        <!-- <view class="more" @click="viewAll">查看全部
          <image :src="INDEX_IMG_PATH + 'angle-right1.png'" class="angle-right" alt="" srcset="" />
        </view> -->
      </view>
      <view class="function-grid">
        <view class="grid-item" v-for="(item, index) in functions" :key="index" @click="handleFunctionClick(item)">
          <image class="icon" :src="item.icon" mode="aspectFit" />
          <text class="name">{{ item.name }}</text>
		  <view v-if="index==0&&gridTip" class="badge">{{gridTip}}</view>
        </view>
		
		<!-- <view class="grid-item"  @click="goToClink()">
		  <text class="name">领取券包</text>
		</view> -->
		
      </view>
    </view>

    <!-- 广告位 -->
    <view class="ad-banner" @click="onAdbanner">
      <image :src="INDEX_IMG_PATH + 'ggt.png'" class="ad-image" />
    </view>

    <!-- 任务中心 -->
    <!-- <view class="section">
      <view class="section-header">
        <text class="title">做任务赚积分</text>
        <view class="more" @click="goTaskCenter">任务中心
          <image :src="INDEX_IMG_PATH + 'angle-right1.png'" class="angle-right" alt="" srcset="" />
        </view>
      </view>

      <view class="hot-tasks">
        <view class="task-card" v-for="(task, index) in hotTasks" :key="task.id"
          :class="{ 'completed': task.completed }" @click="handleTaskComplete(task)">
          <image class="task-img" :src="task.icon" mode="aspectFit" />
          <text class="task-name">{{ task.name }}</text>
          <text class="task-desc">{{ task.desc }}</text>
          <view class="reward">
            <text>+{{ task.points }}</text>
            <image :src="INDEX_IMG_PATH + 'jb-1.png'" class="angle-reward" alt="" srcset="" />
          </view>
        </view>
      </view>

      <view class="task-list">
        <view class="task-item" v-for="(task, index) in tasks" :key="task.id" :class="{ 'completed': task.completed }">
          <image class="task-icon" :src="task.icon" mode="aspectFit" />
          <view class="task-info">
            <text class="task-title">{{ task.name }}</text>
            <text class="task-points">+{{ task.points }}积分</text>
          </view>
          <view class="btn-go" :class="{ 'completed': task.completed }" @click="handleTaskComplete(task)">
            {{ task.completed ? '已完成' : '去完成' }}
          </view>
        </view>
      </view>
    </view> -->
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
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, unref, toRefs } from 'vue'
import { onShow,onLoad } from '@dcloudio/uni-app'
import { INDEX_IMG_PATH, COMMON_IMG_PATH } from '../../utils/imgpath'
import Header from "@/components/Header/index.vue";
import { useScroll } from '@/hooks/useScroll'
import { useMainStore } from '@/store/modules/useMainStore'
import { useRouter } from "@/hooks/useRouter";
import { storeToRefs } from "pinia";
import GridCard from "@/root/user/components/GridCard.vue";
import { accountList, cardOneList, cardTwoList, orderIconList } from "@/root/user/index.data";
import { defaultAvatarIcon, mySignIn, myVip1, noneVip } from "@/utils/images";
import { useInterface } from "@/hooks/useInterface";
import { useJump } from "@/hooks/useJump";
import { getUserMemberLevel } from "@/api/member";
import { useService } from "@/hooks/useService";
import { useShare } from "@/hooks/useShare";
import CustomerServiceUtil from '@/utils/customerService.js';
import { CUSTOMER_SERVICE } from '@/config/index.js';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { checkTheUser,getUserOrderCorner } from "@/api/auth";
import {getPopUpInfo,addPopupLogs} from "@/api/product"
// 初始化分享
const { userIndexShare, shareAppMessage, shareTimeline, shareH5 } = useShare()
// 设置默认分享内容
// userIndexShare()
const { scrollTop } = useScroll()
const mainStore = useMainStore()
const { user, integralName } = storeToRefs(mainStore);
const { push } = useRouter()
const { toast } = useInterface();
const { goSignIn, goMemberCenter } = useJump()
const { getServiceData, openService } = useService();
const orderUserCountData = ref(null)
const gridTip = ref('')

// 微信小程序分享给好友
onShareAppMessage(() => {
  console.log("======我的分享========================");
  const invitationCode = unref(user) ? unref(user).invitationCode : "";
  console.log("invitationCode", invitationCode);
  userIndexShare(invitationCode);
  return shareAppMessage()
})

// 微信小程序分享到朋友圈
onShareTimeline(() => {
  return shareTimeline()
})
// 响应式数据
const functions = ref([
  { name: '我的订单', icon: INDEX_IMG_PATH + '8.png', route: '/pages/orderList/orderList' },
  { name: '我的地址', icon: INDEX_IMG_PATH + '1.png', route: '/pages/address/address' },
  // { name: '积分商城', icon: INDEX_IMG_PATH + '2.png', action: 'comingSoon' },
  // { name: '签到', icon: INDEX_IMG_PATH + '3.png', action: 'signIn' },
  { name: '联系客服', icon: INDEX_IMG_PATH + '4.png', action: 'contact' },
  { name: '服用说明', icon: INDEX_IMG_PATH + '5.png', route: '/pages/guide/guide' },
  { name: '常见问题', icon: INDEX_IMG_PATH + '6.png', route: '/pages/faq/faq' },
  // { name: '关于我们', icon: INDEX_IMG_PATH + '7.png', route: '/pages/about/index' },
  { name: '售后记录', icon: INDEX_IMG_PATH + '10.png', route: '/pages/refundList/refundList' },
  { name: '用户协议', icon: INDEX_IMG_PATH + '9.png', action: 'userProtocol' },
])

const hotTasks = ref([
  {
    id: 1,
    name: '分享小程序',
    desc: '任意页面均可',
    points: 200,
    icon: INDEX_IMG_PATH + '14.png',
    completed: false
  },
  {
    id: 2,
    name: 'AI定制',
    desc: '完成首次测评问卷',
    points: 200,
    icon: INDEX_IMG_PATH + '13.png',
    completed: false
  },
  {
    id: 3,
    name: '邀请下单',
    desc: '享10倍积分',
    points: 200,
    icon: INDEX_IMG_PATH + '12.png',
    completed: false
  }
])
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
  const data = await getPopUpInfo(3);
  if(data && data.length>0){
    popupList.value =  data.filter(item=>item.popupType==0);
	floatpopupList.value = data.filter(item=>item.popupType==1)
    popupShow();
  }
}

const goToService = async () => {
  // 直接调用客服功能
  handleContact()
};

const onAdbanner = () => {
  uni.navigateTo({
    url: '/pages/couponShare/index'
  })
}

const tasks = ref([
  { id: 4, name: '关注公众号', points: 200, icon: INDEX_IMG_PATH + '111.png', completed: false },
  { id: 5, name: '完成报告测评', points: 200, icon: INDEX_IMG_PATH + '222.png', completed: false },
  { id: 6, name: '添加专属营养管家', points: 200, icon: INDEX_IMG_PATH + '333.png', completed: false },
  { id: 7, name: '首次订阅服用提醒', points: 100, icon: INDEX_IMG_PATH + '444.png', completed: false },
  { id: 8, name: '完善个人资料', points: 100, icon: INDEX_IMG_PATH + '555.png', completed: false }
])

// 用户信息
const userInfo = reactive({
  username: 'HI～麻辣毛豆',
  avatar: INDEX_IMG_PATH + 'tx1.png',
  assets: {
    balance: 571.5,
    points: 160,
    coupons: 5
  },
  isVip: false,
  level: 1
})
function toNewsDetail(id) {
  console.log("======================" + id)
  push({
    url: '/pages/webview/news'
  }, {
    data: {
      id: id
    }
  })
}
const goCouponCenter = () => {
  console.log('前往优惠券中心')
  uni.navigateTo({
    url: '/pages/discountCoupon/index',
    fail: (err) => {
      console.error('跳转失败:', err)
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none'
      })
    }
  })
}
// 加载状态
const loading = ref(false)

// 计算属性
const totalPoints = computed(() => {
  return hotTasks.value.reduce((sum, task) => {
    return sum + (task.completed ? 0 : task.points)
  }, 0) + tasks.value.reduce((sum, task) => {
    return sum + (task.completed ? 0 : task.points)
  }, 0)
})

const completedTasksCount = computed(() => {
  return [...hotTasks.value, ...tasks.value].filter(task => task.completed).length
})

const userLevel = computed(() => {
  const points = userInfo.assets.points
  if (points >= 1000) return '黄金会员'
  if (points >= 500) return '白银会员'
  return '普通会员'
})

// 方法定义
const goPoints = () => {
  // 改为弹窗提示
  showComingSoon('积分中心')
}

const viewAll = () => {
  console.log('查看全部功能')
  uni.navigateTo({
    url: '/pages/functions/index',
    fail: (err) => {
      console.error('跳转失败:', err)
    }
  })
}

// 通用“即将上线”弹窗
const showComingSoon = (feature) => {
  const content = feature ? `${feature}功能即将上线，敬请期待` : '即将上线，敬请期待'
  uni.showModal({
    title: '提示',
    content,
    showCancel: false,
    confirmText: '知道了'
  })
}

const goTaskCenter = () => {
  console.log('前往任务中心')
  uni.navigateTo({
    url: '/pages/tasks/index',
    fail: (err) => {
      console.error('跳转失败:', err)
    }
  })
}

   const goToClink = () => {
        // push({url: '/pages/goodsList/goodsList'},{data: {couponId: id}})
		uni.navigateTo({ url: '/root/index/index?id=193' })
    }
	
// 处理功能点击
const handleFunctionClick = (item) => {
  console.log('点击功能:', item.route)

  // 统一拦截“积分商城”之类的即将上线功能
  if (item.action === 'comingSoon') {
    return showComingSoon(item.name)
  }
	
  if (item.route) {
    uni.navigateTo({
      url: item.route,
      fail: (err) => {
        console.error('跳转失败:', err)
        uni.showToast({
          title: '功能暂未开放',
          icon: 'none'
        })
      }
    })
  } else if (item.action) {
    handleSpecialAction(item.action)
  }
}

// 处理特殊操作
const handleSpecialAction = (action) => {
  switch (action) {
    case 'signIn':
      // 改为弹窗提示
      showComingSoon('签到')
      break
    case 'contact':
      goToService()
      break
    case 'userProtocol':
      toNewsDetail(25)
      break
    default:
      console.log('未知操作:', action)
  }
}

// 签到功能
const handleSignIn = () => {
  uni.showLoading({ title: '签到中...' })

  // 模拟签到请求
  setTimeout(() => {
    uni.hideLoading()
    userInfo.assets.points += 10
    uni.showToast({
      title: '签到成功，获得10积分',
      icon: 'success'
    })
  }, 1000)
}

// 联系客服
const handleContact = () => {
  console.log('[客服] 直接打开在线客服')
  try {
    CustomerServiceUtil.open()
  } catch (error) {
    console.error('[客服] 打开失败:', error)
    uni.showToast({
      title: '客服功能暂时不可用',
      icon: 'none'
    })
  }
}

// 处理任务完成
const handleTaskComplete = (task) => {
  console.log('完成任务:', task.name)

  if (task.completed) {
    uni.showToast({
      title: '任务已完成',
      icon: 'none'
    })
    return
  }

  uni.showLoading({ title: '处理中...' })

  // 模拟任务完成
  setTimeout(() => {
    uni.hideLoading()
    task.completed = true
    userInfo.assets.points += task.points

    uni.showToast({
      title: `任务完成，获得${task.points}积分`,
      icon: 'success'
    })
  }, 1500)
}

// 加载用户数据
const loadUserData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 这里可以调用实际的API
    console.log('用户数据加载完成')
  } catch (error) {
    console.error('加载用户数据失败:', error)
    uni.showToast({
      title: '数据加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function toUserCenter() {
  if (!user.value) {
    // 未登录，跳转到登录页
    push({ url: '/pages/login/guid' })
    return
  }
  // 已登录，跳转到账号设置页
  push({ url: '/pages/userInfo/index' })
}

// 空函数占位，避免报错
const handleOrderUserCount = () => {
  // TODO: 实现订单统计功能
}

const doGetUserMemberLevel = () => {
  // TODO: 实现会员等级获取功能
}



// 生命周期
onMounted(() => {
  console.log('用户页面已挂载')
  loadUserData()

  mainStore.getUserInfo()
  handleOrderUserCount()
  doGetUserMemberLevel()
})

// 页面显示时检查登录状态并刷新数据
onShow(() => {
	getUserOrderCorner().then(res=>{
		gridTip.value = res
	})
  // 处理分享参数（从其他页面分享跳转过来）
  const shareParams = uni.getStorageSync('shareParams')
  if (shareParams && shareParams.t) {
    console.log('接收到分享参数:', shareParams)
    // 清除已使用的分享参数
    uni.removeStorageSync('shareParams')

    // 这里可以根据分享参数执行特定逻辑
    // 例如：展示特定内容、弹窗提示等
    // 目前用户页面不需要特殊处理，仅清除参数即可
  }

  // 如果用户已登录,刷新用户信息
  if (user.value) {
    mainStore.getUserInfo().then(() => {
      console.log('用户数据:', user.value)
      console.log('nowMoney类型:', typeof user.value.nowMoney, user.value.nowMoney)
      console.log('integral类型:', typeof user.value.integral, user.value.integral)
      console.log('couponNumber类型:', typeof user.value.couponNumber, user.value.couponNumber)
    })
  }
})

onLoad(async (options) => {
  console.log("onLoad options=================================:", options);
  if (options.scene) {
  	//表示扫二维码 或者 小程序链接 过来的
  	let sc = options.scene;
  	if (sc.startsWith('code_')) {
  		let code = sc.substring(5);
  		checkTheUserInit(code,Number(options.channelId))
  	}
  }
  isPopup()
});


async function checkTheUserInit(invitationCode,channelId) {
	//进行注册绑定关系操作
	wx.login({
		async success(res) {
			if (res.code) {
				console.log('微信code===========----' + res.code)
				let data = {};
				data.phoneCode = '888811';
				data.loginCode = res.code;
				data.invitationCode = invitationCode;
				data.channelId = channelId
				const loginRes = await checkTheUser(data);
				await mainStore.setAccessToken(loginRes)
			}
		}
	});
}
</script>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 20rpx;
}

.bg-wrapper {
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-position: top center;
  border-radius: 0 0 24rpx 24rpx;
  overflow: hidden;
}

.angle-right {
  width: 8rpx;
  height: 16rpx;
  margin-left: 4rpx;
}

.logo-image {
  width: 234rpx;
  height: 58rpx;
}

.user-card {
  // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  color: #000000;
  position: sticky;
  top: 0;
  z-index: 999;
  // background: $page-bg-color;
  transition: all .3s;

  .user-header {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-right: 24rpx;
    }

    .user-info {
      flex: 1;

      .username {
        font-size: 36rpx;
        font-weight: bold;
        display: block;
        margin-bottom: 16rpx;
      }

      .user-tips {
        display: flex;
        justify-content: space-between;
        font-size: 24rpx;
        opacity: 0.9;

        .tip-text {
          display: flex;
          align-items: center;
          color: #747E80;

          img {
            width: 28rpx;
            height: 28rpx;
            margin-left: 8rpx;
            margin-bottom: -3rpx;
          }
        }

        .points-link {
          display: flex;
          align-items: center;

          .points-icon {
            width: 8rpx;
            height: 16rpx;
            margin-left: 8rpx;
          }
        }
      }
    }
  }

  .assets {
    display: flex;
    justify-content: space-around;
    padding-top: 32rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.2);

    .asset-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      flex: 1;
      padding: 0 24rpx;

      // 中间竖线分隔（首尾不显示）
      &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 20rpx;
        bottom: 20rpx;
        width: 1rpx;
        background-color: #686868;
        opacity: 0.2;
      }

      .value {
        font-size: 40rpx;
        font-weight: bold;
        margin-bottom: 8rpx;
      }

      .label {
        font-size: 24rpx;
        opacity: 0.8;
        color: #606060;
      }
    }
  }
}

.ad-banner {
  width: 100%;
  height: 196rpx;
  margin: 40rpx 0 20rpx 0;
  padding: 0 30rpx;
  box-sizing: border-box;

  .ad-image {
    width: 100%;
    height: 100%;
  }
}

.section {
  // background: #fff;
  border-radius: 24rpx;
  margin: 30rpx;
  margin-bottom: 20rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .more {
      font-size: 24rpx;
      color: #999;
    }
  }

  .function-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32rpx;

    .grid-item {
      display: flex;
      flex-direction: column;
      align-items: center;
		position: relative;
      .icon {
        width: 48rpx;
        height: 48rpx;
        border-radius: 16rpx;
        margin-bottom: 12rpx;
      }

      .name {
        font-size: 24rpx;
        color: #666;
      }
	  .badge{
		  position: absolute;
		  left: 50%;
		  top: -15rpx;
		  width: max-content;
		  height: 29rpx;
		  line-height: 27rpx;
		  border: 1rpx solid #FFD3D4;
		  box-sizing: border-box;
		  font-size: 18rpx;
		  color:#fff;
		  padding: 0 14rpx;
		  border-radius: 15rpx 15rpx 15rpx 0;
		  background-color: #FE4C4F;
	  }
    }
  }

  .hot-tasks {
    display: flex;
    justify-content: space-between;
    margin-bottom: 32rpx;
    overflow-x: auto;

    .task-card {
      flex-shrink: 0;
      width: 196rpx;
      padding: 20rpx 10rpx;
      background: #f6f6f6;
      border-radius: 20rpx;
      text-align: center;

      .task-img {
        width: 50rpx;
        height: 50rpx;
        border-radius: 16rpx;
        margin-bottom: 16rpx;
      }

      .task-name {
        display: block;
        font-size: 26rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 8rpx;
      }

      .task-desc {
        display: block;
        font-size: 22rpx;
        color: #999;
        margin-bottom: 16rpx;
      }

      .reward {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rpx 10rpx;
        background: #e1e1e1;
        border-radius: 40rpx;
        font-size: 24rpx;
        font-weight: 500;
        color: #333;
        margin: 0 20px;

        .angle-reward {
          width: 30rpx;
          height: 30rpx;
        }
      }
    }
  }

  .task-list {
    .task-item {
      display: flex;
      align-items: center;
      padding: 24rpx;
      border-radius: 16rpx;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .task-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 24rpx;
      }

      .task-info {
        flex: 1;

        .task-title {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx;
        }

        .task-points {
          display: block;
          font-size: 22rpx;
          color: #999;
        }
      }

      .btn-go {
        padding: 12rpx 32rpx;
        background: #00cbcc;
        border-radius: 40rpx;
        color: #fff;
        font-size: 24rpx;
      }
    }
  }
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
