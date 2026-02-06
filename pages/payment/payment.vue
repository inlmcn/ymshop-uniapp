<template>
  <view class="page-container">
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <view class="header-left">
          <uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
          <image
            class="icon-home"
            :src="COMMON_IMG_PATH + 'homeimg.png'"
            @click="toHome"
          />
        </view>
        <text class="header-title">选择支付方式</text>
      </view>
      <!-- 订单信息区域 -->
      <view class="order-info-container">
        <view class="order-status">
          <image
            class="check-icon"
            :src="COMMON_IMG_PATH + 'dui.png'"
            alt=""
            srcset=""
          />
          <text>订单已提交</text>
        </view>
        <view class="countdown">
          (请尽快完成支付，剩余时间{{ countdownText }})
        </view>
      </view>
    </view>

    <!-- 支付详情卡片 - 移到这里实现叠加效果 -->
    <view
      class="payment-detail-card"
      :style="{ marginTop: cardMarginTop + 'px' }"
    >
      <view class="detail-item-top">
        <view class="label">支付金额</view>
        <view class="amount">
          <text class="currency">¥</text>
          <text class="value">{{ formatAmount(orderData.payAmount) }}</text>
        </view>
      </view>

      <view class="divider"></view>

      <view class="detail-item">
        <view class="label">订单编号</view>
        <view class="info">{{ orderData.orderId }}</view>
      </view>

      <view class="divider"></view>

      <view class="detail-item">
        <view class="label">收款方</view>
        <view class="info">FCYUU TRANDING LIMITED（香港）</view>
      </view>
    </view>

    <view class="container">
      <!-- 主内容区 -->
      <view class="content">
        <!-- 支付方式区域 -->
        <view class="payment-method-card">
          <view class="method-title">支付方式</view>
          <view class="method-content">
            <view class="method-item">
              <view class="wechat-pay-icon">
                <image :src="COMMON_IMG_PATH + 'wx.png'"></image>
              </view>
              <text>微信</text>
            </view>
            <view class="selected-icon">
              <icon type="success" size="20" color="#00c853" />
            </view>
          </view>
        </view>

        <!-- 底部按钮 -->
        <button
          class="pay-button"
          :class="{ 'disabled-button': !isCountdownActive }"
          @click="handlePay"
          :disabled="!isCountdownActive"
        >
          {{ isCountdownActive ? "立即支付" : "支付已超时" }}
        </button>

        <!-- 小程序保障信息 -->
        <view class="guarantee-info">
          <view class="guarantee-icon">
            <image :src="COMMON_IMG_PATH + 'guarantee.png'"></image>
          </view>
          <text class="guarantee-text">小程序交易保障</text>
          <text class="guarantee-desc"
            >正品保证 | 中国人保险承保 | 准时发货</text
          >
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH } from "@/utils/imgpath.js";
import { useRouter } from "@/hooks/useRouter";
import {
  payOrder,
  getTemplate,
  orderInfo as orderInfoRequest,
} from "@/api/order";
import { PAY_INSTANCE_TYPE, PayFactory } from "@/utils/payModule";
import HealthCoastDialog from "@/components/HealthCoastDialog/HealthCoastDialog.vue";
import TencentAdSDK from "@/utils/tencentAd";
import { requestUtil } from "@/utils/request";
import { APP_ID } from "@/config";
const { goBack, push, toHome } = useRouter();
import { useMainStore } from "@/store/modules/useMainStore";
const mainStore = useMainStore();

// 订单数据
const orderData = ref({
  orderId: "",
  orderKey: "",
  payAmount: 0,
  orderInfo: null,
  _status: {},
});

// 倒计时相关数据
const countdownTime = ref(30 * 60); // 30分钟，单位为秒
const countdownText = ref(""); // 格式化后的倒计时文本
const countdownTimer = ref(null); // 倒计时定时器
const isCountdownActive = ref(true); // 倒计时是否激活

// 获取系统信息
const statusBarHeight = ref(20);
const navBarHeight = ref(44); // 导航栏默认高度
const headerContentHeight = ref(120); // header内容区域高度
const orderInfoHeight = ref(80); // 订单信息区域高度

// 计算header总高度
const headerTotalHeight = computed(() => {
  return (
    statusBarHeight.value +
    navBarHeight.value +
    headerContentHeight.value +
    orderInfoHeight.value
  );
});

// 计算payment-detail-card的margin-top
const cardMarginTop = computed(() => {
  return -60; // 固定叠加60px，确保视觉效果
});

// 格式化金额显示
const formatAmount = (amount) => {
  return parseFloat(amount).toFixed(2);
};

// 格式化倒计时显示
const formatCountdown = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

// 开始倒计时（按后端 _status._payRemainTime 初始化，单位毫秒 -> 秒）
const startCountdown = (initialSeconds = 30 * 60) => {
  // 清除之前的定时器
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }

  // 重置倒计时
  const init = Math.max(0, Number(initialSeconds) || 0);
  countdownTime.value = init;
  isCountdownActive.value = init > 0;

  // 立即更新一次显示
  countdownText.value = formatCountdown(countdownTime.value);

  if (!isCountdownActive.value) {
    // 无剩余时间直接触发结束处理
    handleCountdownEnd();
    return;
  }

  // 设置定时器
  countdownTimer.value = setInterval(() => {
    countdownTime.value--;
    countdownText.value = formatCountdown(Math.max(0, countdownTime.value));

    // 倒计时结束
    if (countdownTime.value <= 0) {
      clearInterval(countdownTimer.value);
      countdownTimer.value = null;
      isCountdownActive.value = false;
      handleCountdownEnd();
    }
  }, 1000);
};

// 倒计时结束处理
const handleCountdownEnd = () => {
  uni.showModal({
    title: "支付超时",
    content: "订单支付已超时，请重新下单",
    showCancel: false,
    success: () => {
      // 跳转到订单列表
      uni.redirectTo({
        url: "/pages/orderList/orderList",
      });
    },
  });
};

// 页面加载时接收订单数据
onLoad((options) => {
  if (options.data) {
    try {
      const data = JSON.parse(decodeURIComponent(options.data));
      orderData.value = {
        orderId: data.orderId || "",
        orderKey: data.orderKey || "",
        payAmount: data.payAmount || 0,
        orderInfo: data.orderInfo || null,
        _status: data._status || {},
      };
      console.log("接收到订单数据:", orderData.value);

      // 拉取一次订单信息，获取最新的 _status._payRemainTime
      // 订单详情接口需要 key（唯一标识），优先使用 orderKey，没有再使用 orderId
      const key = orderData.value.orderKey || orderData.value.orderId;

      // 如果入参已带有剩余时间，先用它启动倒计时，避免每次都回落到默认值
      const rawRemain = Number(orderData.value?._status?._payRemainTime) || 0;
      if (rawRemain > 0) {
        // 兼容后端返回单位：若数值较大（>=100000）按毫秒处理，否则按秒处理
        const initialSeconds =
          rawRemain >= 100000
            ? Math.floor(rawRemain / 1000)
            : Math.floor(rawRemain);
        startCountdown(initialSeconds);
      }
      if (key) {
        fetchAndInitOrderInfo(key);
      } else {
        // 没有 key，使用默认 30 分钟倒计时
        startCountdown();
      }
    } catch (error) {
      console.error("解析订单数据失败:", error);
      uni.showToast({
        title: "订单数据解析失败",
        icon: "none",
      });
    }
  } else {
    uni.showToast({
      title: "缺少订单数据",
      icon: "none",
    });
  }
});

// 拉取订单详情并初始化倒计时
const fetchAndInitOrderInfo = async (key) => {
  try {
    const info = await orderInfoRequest({ key });
    // 更新订单数据
    orderData.value.orderId =
      info?.orderId || info?.order_id || orderData.value.orderId || "";
    orderData.value.orderKey = key;
    orderData.value.payAmount =
      info?.payPrice ?? info?.totalPrice ?? orderData.value.payAmount ?? 0;
    orderData.value.orderInfo = info || orderData.value.orderInfo;
    orderData.value._status = info?._status || {};

    // 根据后端剩余时间初始化倒计时（兼容毫秒或秒）
    const rawRemain = Number(info?._status?._payRemainTime) || 0;
    if (rawRemain > 0) {
      // 兼容后端返回单位：若数值较大（>=100000）按毫秒处理，否则按秒处理
      const remainSeconds =
        rawRemain >= 100000
          ? Math.floor(rawRemain / 1000)
          : Math.floor(rawRemain);
      startCountdown(remainSeconds);
    } else {
      // 当接口未返回有效剩余时间时，不强制重置为默认值，避免覆盖已有的正确倒计时
      if (!countdownTimer.value) {
        startCountdown();
      }
    }
  } catch (e) {
    console.error("获取订单详情失败：", e);
    // 失败时，如果尚未启动倒计时，回退默认值
    if (!countdownTimer.value) {
      startCountdown();
    }
  }
};

onMounted(() => {
  // 获取系统信息
  uni.getSystemInfo({
    success: (res) => {
      statusBarHeight.value = res.statusBarHeight || 20;

      // #ifdef APP-PLUS
      // App平台获取更精确的状态栏高度
      statusBarHeight.value = plus.navigator.getStatusbarHeight();
      // #endif

      // #ifdef H5
      // H5平台不需要状态栏高度
      statusBarHeight.value = 0;
      // #endif

      // #ifdef MP-WEIXIN
      // 微信小程序获取胶囊按钮信息来计算导航栏高度
      const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
      if (menuButtonInfo) {
        navBarHeight.value =
          (menuButtonInfo.top - res.statusBarHeight) * 2 +
          menuButtonInfo.height;
      }
      // #endif
    },
  });
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
});
// 调用模版
const getTemplateData = async () => {
  await getTemplate({});
};
// 处理支付
const handlePay = async () => {
  await getTemplateData();
  // 检查倒计时是否已结束
  if (!isCountdownActive.value) {
    uni.showModal({
      title: "支付超时",
      content: "订单支付已超时，请重新下单",
      confirmText: "重新下单",
      cancelText: "查看订单",
      success: (res) => {
        if (res.confirm) {
          // 跳转到商品详情页重新下单
          uni.redirectTo({
            url: "/pages/index/index",
          });
        } else {
          // 跳转到订单列表
          uni.redirectTo({
            url: "/pages/orderList/orderList",
          });
        }
      },
    });
    return;
  }

  // 检查订单数据是否存在
  if (!orderData.value.orderId) {
    uni.showModal({
      title: "订单信息不完整",
      content: "订单信息不完整，请重新下单或联系客服",
      confirmText: "重新下单",
      cancelText: "联系客服",
      success: (res) => {
        if (res.confirm) {
          // 跳转到商品详情页重新下单
          uni.redirectTo({
            url: "/pages/index/index",
          });
        } else {
          // 跳转到客服页面
          uni.navigateTo({
            url: "/pages/customerService/index",
          });
        }
      },
    });
    return;
  }

  // 前置查询腾讯广告点击数据（在支付前）
  let adsClickData = null;
  try {
    const userOpenid =
      mainStore.user?.openid || mainStore.user?.routineOpenId || "";
    console.log("[TAds] 支付前检查用户 openid:", userOpenid);
    
    if (userOpenid) {
      console.log("[TAds] 支付前查询点击数据，openId:", userOpenid);
      const clickData = await requestUtil.get("/shop-datanexus/getClick", {
        id: userOpenid,
      });
      console.log("[TAds] 查询点击数据 API 返回:", clickData);
      
      if (clickData && clickData.clickId) {
        adsClickData = clickData;
        console.log("[TAds] ✅查询到点击数据，支付成功后将上报转化:", clickData);
      } else {
        console.log("[TAds] ⚠️未查询到点击数据（clickId 不存在），支付成功后不上报转化");
        console.log("[TAds] clickData 内容:", JSON.stringify(clickData, null, 2));
      }
    } else {
      console.log("[TAds] 用户 openid 不存在，跳过点击数据查询");
    }
  } catch (error) {
    console.error("[TAds] ⚠️查询点击数据失败:", error);
    console.error("[TAds] 错误详情:", error.message);
    console.error("[TAds] 错误堆栈:", error.stack);
  }

  uni.showLoading({
    title: "支付处理中...",
  });

  try {
    // 调用支付接口
    const payRes = await payOrder({
      orderId: orderData.value.orderId,
      payType: "weixin_applet",
      from: "weixin_applet",
      // helpPay: false
    });

    if (payRes) {
      // 调用微信支付
      uni.requestPayment({
        provider: "wxpay",
        timeStamp: payRes.timeStamp,
        nonceStr: payRes.nonceStr,
        package: payRes.package,
        signType: payRes.signType,
        paySign: payRes.paySign,
        success: async (res) => {
          console.log("✅支付成功:", res);
          console.log("[TAds] adsClickData 状态:", adsClickData ? '存在' : '不存在');
          
          // 上报腾讯广告转化（支付成功后才上报，使用前置查询的数据）
          if (adsClickData) {
            console.log("[TAds] ✅开始上报转化，订单ID:", orderData.value.orderId, "金额:", orderData.value.payAmount);
            try {
              await reportTencentAdsConversion(
                orderData.value.orderId,
                orderData.value.payAmount,
                adsClickData
              );
              console.log("[TAds] ✅转化上报完成，准备跳转页面");
            } catch (error) {
              console.error("[TAds] 转化上报异常:", error);
            }
          } else {
            console.log("[TAds] 无点击数据，跳过转化上报");
          }
          
          // 确保上报完成后再隐藏 loading 和跳转
          uni.hideLoading();
          
          // 稍微延迟跳转，确保上报请求完全发送（给 SDK 200ms 缓冲时间）
          console.log("[TAds] ✅准备跳转页面，延迟 200ms 以确保上报完成");
          setTimeout(() => {
            console.log("[TAds] 开始跳转到支付成功页面");
            uni.redirectTo({
              url: "/pages/payment/placeOrder",
            });
          }, 200);
        },
        fail: (err) => {
          console.error("支付失败:", err);
          // 判断是否是用户主动取消支付
          if (err.errMsg === "requestPayment:fail cancel") {
            uni.redirectTo({
              url: "/pages/orderList/orderList",
            });
          } else {
            uni.redirectTo({
              url: "/pages/orderList/orderList",
            });
          }
        },
      });
    } else {
      uni.hideLoading();
      // 支付接口返回失败
      uni.showModal({
        title: "支付失败",
        content: "支付接口返回失败，请重试或联系客服",
        confirmText: "重新支付",
        cancelText: "查看订单",
        success: (res) => {
          if (res.confirm) {
            // 用户选择重新支付，不做任何操作，用户可以再次点击支付按钮
          } else {
            // 用户选择查看订单，跳转到订单列表
            uni.redirectTo({
              url: "/pages/orderList/orderList",
            });
          }
        },
      });
    }
  } catch (error) {
    console.error("支付出错:", error);
    uni.hideLoading();

    // 支付接口调用失败，显示错误信息并提供重试选项
    uni.showModal({
      title: "支付失败",
      content: error.message || "支付过程中出现错误，请重试或联系客服",
      confirmText: "重新支付",
      cancelText: "查看订单",
      success: (res) => {
        if (res.confirm) {
          // 用户选择重新支付，不做任何操作，用户可以再次点击支付按钮
        } else {
          // 用户选择查看订单，跳转到订单列表
          uni.redirectTo({
            url: "/pages/orderList/orderList",
          });
        }
      },
    });
  } finally {
    uni.hideLoading();
  }
};

/**
 * 上报腾讯广告转化
 * @param {string} orderId - 订单ID
 * @param {number} payAmount - 支付金额
 * @param {object} clickData - 前置查询的点击数据
 */
const reportTencentAdsConversion = async (orderId, payAmount, clickData) => {
  console.log("[TAds] reportTencentAdsConversion 被调用");
  console.log("[TAds] 参数 - orderId:", orderId);
  console.log("[TAds] 参数 - payAmount:", payAmount);
  console.log("[TAds] 参数 - clickData:", clickData);
  
  try {
    // 1. 获取用户 openid
    const userOpenid =
      mainStore.user?.openid || mainStore.user?.routineOpenId || "";
    console.log("[TAds] 用户 openid:", userOpenid);
    
    if (!userOpenid) {
      console.warn("[TAds] 用户 openid 不存在，跳过转化上报");
      return;
    }

    console.log("[TAds] 使用前置查询的点击数据:", clickData);

    // 2. 解析 callback 字段
    let callbackUrl = "";
    try {
      if (clickData.data) {
        const parsedData =
          typeof clickData.data === "string"
            ? JSON.parse(clickData.data)
            : clickData.data;
        callbackUrl = parsedData.callback || "";
        console.log("[TAds] 解析到 callback:", callbackUrl);
      } else {
        console.log("[TAds] clickData.data 不存在");
      }
    } catch (error) {
      console.error("[TAds] 解析 callback 失败:", error);
    }

    // 4. 准备上报数据
    const conversionData = {
      actionType: "COMPLETE_ORDER",
      wechatOpenid: userOpenid,
      wechatAppId: APP_ID,
      clickId: clickData.clickId,
      callback: callbackUrl, // 传递 callback URL
      actionParam: {
        value: Math.round(payAmount * 100), // 将元转换为分
        order_id: orderId,
      },
    };

    console.log("[TAds] 准备上报转化数据:", JSON.stringify(conversionData, null, 2));

    // 5. 上报转化
    console.log("[TAds] 开始调用 TencentAdSDK.reportConversionByOfficial");
    const result = await TencentAdSDK.reportConversionByOfficial(conversionData);
    console.log("[TAds] 转化上报成功，返回结果:", result);
  } catch (error) {
    console.error("[TAds] 转化上报失败:", error);
    console.error("[TAds] 错误堆栈:", error.stack);
    // 不抛出错误，避免影响支付流程
  }
};
</script>

<style lang="scss" scoped>
page {
  background-color: #f4f4f4;
  height: 100%;
}

.page-container {
}

.header {
  background: linear-gradient(147deg, #52eab5 19%, #00cbcc 100%);
  border-radius: 0rpx 0rpx 36rpx 36rpx;
  padding: 20rpx 30rpx 150rpx 30rpx;
  position: relative;
  box-shadow: 0 8rpx 24rpx rgba(0, 200, 204, 0.15);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0 30rpx 0;
  position: relative;
}

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  z-index: 2;

  .icon-home {
    width: 48rpx;
    height: 48rpx;
    border-radius: 12rpx;
    background: rgba(255, 255, 255, 0.2);
    padding: 8rpx;
    backdrop-filter: blur(10rpx);
  }
}

.order-info-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  padding: 20rpx 0 40rpx 0;
  min-height: 80rpx;
}

.order-status {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16rpx;
  font-size: 32rpx;
  font-weight: 500;

  .check-icon {
    width: 40rpx;
    height: 40rpx;
    // background: rgba(255, 255, 255, 0.9);
    // border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12rpx;
    // box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }
}

.countdown {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  letter-spacing: 1rpx;
}

.payment-detail-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-left: 30rpx;
  margin-right: 30rpx;
  margin-bottom: 20rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 15;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.status-bar {
  width: 100%;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  height: 88rpx;
  position: relative;
  color: #ffffff;

  .back-icon,
  .home-icon {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
  }

  .title {
    flex: 1;
    text-align: center;
    font-size: 36rpx;
    font-weight: 500;
  }

  .right-controls {
    display: flex;
    align-items: center;

    .more-icon {
      margin-right: 20rpx;
      font-weight: bold;
    }

    .circle-icon {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      border: 2rpx solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.content {
  flex: 1;
  padding: 0 30rpx 30rpx 30rpx;
  overflow-y: auto;
  position: relative;
  z-index: 10;
}

.detail-item-top {
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #464646;
  margin-bottom: 40rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;

  &:last-child {
    .divider {
      display: none;
    }
  }
}

.label {
  color: #666666;
  font-size: 28rpx;
}

.amount {
  font-weight: bold;
}

.currency {
  font-size: 34rpx;
  margin-right: 4rpx;
}

.value {
  font-size: 60rpx;
  font-weight: bold;
}

.info {
  font-size: 28rpx;
  color: #333333;
}

.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  width: 100%;
}

.payment-method-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-top: 20rpx;
  padding: 30rpx;
}

.method-title {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 30rpx;
}

.method-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.method-item {
  display: flex;
  align-items: center;

  .wechat-pay-icon {
    width: 60rpx;
    height: 60rpx;
    // background-color: #07c160;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;

    image {
      width: 56rpx;
      height: 56rpx;
    }
  }
}

.selected-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #07c160;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #07c160;
}

.pay-button {
  background-color: #00c8b5;
  color: #ffffff;
  font-size: 32rpx;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  margin-top: 40rpx;
  font-weight: normal;
  letter-spacing: 2rpx;
}

.disabled-button {
  background-color: #cccccc;
  color: #999999;
}

.guarantee-info {
  display: flex;
  align-items: center;
  margin-top: 30rpx;
  font-size: 24rpx;
  color: #666666;

  .guarantee-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 10rpx;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .guarantee-text {
    color: #07c160;
    margin-right: 20rpx;
  }

  .guarantee-desc {
    color: #999999;
  }
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .header {
    padding: 15rpx 20rpx 30rpx 20rpx;
  }

  .header-content {
    padding: 15rpx 0 25rpx 0;
  }

  .header-title {
    font-size: 32rpx;
  }

  .header-left {
    gap: 20rpx;

    .icon-home {
      width: 44rpx;
      height: 44rpx;
    }
  }

  .order-status {
    font-size: 30rpx;

    .check-icon {
      width: 36rpx;
      height: 36rpx;
    }
  }

  .countdown {
    font-size: 26rpx;
  }
}

@media screen and (min-width: 1200rpx) {
  .header {
    padding: 25rpx 40rpx 50rpx 40rpx;
  }

  .header-content {
    padding: 25rpx 0 35rpx 0;
  }

  .header-title {
    font-size: 40rpx;
  }

  .header-left {
    gap: 28rpx;

    .icon-home {
      width: 52rpx;
      height: 52rpx;
    }
  }

  .order-status {
    font-size: 34rpx;

    .check-icon {
      width: 44rpx;
      height: 44rpx;
    }
  }

  .countdown {
    font-size: 30rpx;
  }
}

/* 安全区域适配 */
.header {
  padding-top: calc(20rpx + env(safe-area-inset-top));
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .header {
    background: linear-gradient(147deg, #2d7a5f 19%, #006b6b 100%);
  }
}
</style>
