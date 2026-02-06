import { payOrder, getTemplate, orderInfo as orderInfoRequest } from "@/api/order";
import { useMainStore } from "@/store/modules/useMainStore";
import TencentAdSDK from "@/utils/tencentAd";
import { requestUtil } from "@/utils/request";
import { APP_ID } from "@/config";

export async function orderPayment(
  key,
  options = {
    onSuccess: () => {}, // 支付成功
    onFailed: () => {}, // 支付失败
    onRePayment: () => {}, // 重新支付
    onViewOrder: () => {}, // 查看订单
    onRePlaceOrder: () => {}, // 重新下单
  },
  isNeedReport = true
) {
  await getTemplate({});
  const orderInfo = await orderInfoRequest({ key });
  const mainStore = useMainStore();

  const { orderId = "", _status = {}, payPrice, totalPrice } = orderInfo || {};

  // 获取支付金额
  const payAmount = payPrice ?? totalPrice ?? 0;

  if (Number(_status?._payRemainTime) === 0) {
    uni.showModal({
      title: "支付超时",
      content: "订单支付已超时，请重新下单",
      confirmText: "重新下单",
      cancelText: "查看订单",
      success: (res) => {
        if (res.confirm) {
          // 跳转到商品详情页重新下单
          options.onRePayment?.();
        } else {
          // 跳转到订单列表
          options.onViewOrder?.();
        }
      },
    });
    return;
  }

  if (!orderId) {
    uni.showModal({
      title: "订单信息不完整",
      content: "订单信息不完整，请重新下单或联系客服",
      showCancel: true,
      confirmText: "重新下单",
      cancelText: "联系客服",
      success(res) {
        if (res.confirm) {
          options.onRePlaceOrder?.();
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

  if (isNeedReport) {
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
          console.log(
            "[TAds] ✅查询到点击数据，支付成功后将上报转化:",
            clickData
          );
        } else {
          console.log(
            "[TAds] ⚠️未查询到点击数据（clickId 不存在），支付成功后不上报转化"
          );
          console.log(
            "[TAds] clickData 内容:",
            JSON.stringify(clickData, null, 2)
          );
        }
      } else {
        console.log("[TAds] 用户 openid 不存在，跳过点击数据查询");
      }
    } catch (error) {
      console.error("[TAds] ⚠️查询点击数据失败:", error);
      console.error("[TAds] 错误详情:", error.message);
      console.error("[TAds] 错误堆栈:", error.stack);
    }
  }

  uni.showLoading({ title: "支付处理中...", mask: true });

  try {
    const payRes = await payOrder({
      orderId,
      payType: "weixin_applet",
      from: "weixin_applet",
    });

    if (payRes) {
      uni.requestPayment({
        provider: "wxpay",
        timeStamp: payRes.timeStamp,
        nonceStr: payRes.nonceStr,
        package: payRes.package,
        signType: payRes.signType,
        paySign: payRes.paySign,
        async success(res) {
          console.log("✅支付成功:", res);
          console.log(
            "[TAds] adsClickData 状态:",
            adsClickData ? "存在" : "不存在"
          );

          // 上报腾讯广告转化（支付成功后才上报，使用前置查询的数据）
          if (adsClickData) {
            console.log(
              "[TAds] ✅开始上报转化，订单ID:",
              orderId,
              "金额:",
              payAmount
            );
            try {
              await reportTencentAdsConversion(
                orderId,
                payAmount,
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

          options.onSuccess?.();
        },
        fail(err) {
          console.error("支付失败:", err);
          options.onFailed?.(err);
        },
      });
    } else {
      uni.hideLoading();
      uni.showModal({
        title: "支付失败",
        content: "支付接口返回失败，请重试或联系客服",
        confirmText: "重新支付",
        cancelText: "查看订单",
        success: (res) => {
          if (res.confirm) {
            // 用户选择重新支付，不做任何操作，用户可以再次点击支付按钮
            options.onRePayment?.();
          } else {
            // 用户选择查看订单，跳转到订单列表
            options.onViewOrder?.();
          }
        },
      });
    }
  } catch (error) {
    console.error("支付出错:", error);
    uni.hideLoading();

    uni.showModal({
      title: "支付失败",
      content: error.message || "支付过程中出现错误，请重试或联系客服",
      confirmText: "重新支付",
      cancelText: "查看订单",
      success: (res) => {
        if (res.confirm) {
          options.onRePayment?.();
        } else {
          options.onViewOrder?.();
        }
      },
    });
  } finally {
    uni.hideLoading();
  }
}

/**
 * 上报腾讯广告转化
 * @param {string} orderId - 订单ID
 * @param {number} payAmount - 支付金额
 * @param {object} clickData - 前置查询的点击数据
 */
async function reportTencentAdsConversion(orderId, payAmount, clickData) {
  console.log("[TAds] reportTencentAdsConversion 被调用");
  console.log("[TAds] 参数 - orderId:", orderId);
  console.log("[TAds] 参数 - payAmount:", payAmount);
  console.log("[TAds] 参数 - clickData:", clickData);
  const mainStore = useMainStore();

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

    console.log(
      "[TAds] 准备上报转化数据:",
      JSON.stringify(conversionData, null, 2)
    );

    // 5. 上报转化
    console.log("[TAds] 开始调用 TencentAdSDK.reportConversionByOfficial");
    const result = await TencentAdSDK.reportConversionByOfficial(
      conversionData
    );
    console.log("[TAds] 转化上报成功，返回结果:", result);
  } catch (error) {
    console.error("[TAds] 转化上报失败:", error);
    console.error("[TAds] 错误堆栈:", error.stack);
    // 不抛出错误，避免影响支付流程
  }
}
