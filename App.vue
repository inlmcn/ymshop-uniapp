<script setup>
import { createBuryPoint } from "@/api/global";
import cookie from "@/utils/cookie";
import { onLaunch, onShow } from "@dcloudio/uni-app";
import { useMainStore } from "@/store/modules/useMainStore";
// import { ensureUserActionSetOnce } from "@/api/tencentAds";
import TencentAdSDK from "@/utils/tencentAd.js";
import BindingHelper from "@/utils/tencentAdBindingHelper.js";
import { checkTheUser } from "@/api/auth";
import { orderBindingBiliTrackId } from "@/api/order";
import { autoReceiveCoupon } from "@/api/coupon";
import { isFunction } from "lodash-es";

const mainStore = useMainStore();

// 自动登录函数（未登录时自动注册）
function checkTheUserInit(invitationCode, callback) {
  //进行注册绑定关系操作
  wx.login({
    async success(res) {
      if (res.code) {
        console.log("微信code===========----" + res.code);
        let data = {};
        data.phoneCode = "888801";
        data.loginCode = res.code;
        data.invitationCode = invitationCode;
        try {
          const loginRes = await checkTheUser(data);
          await mainStore.setAccessToken(loginRes);
          await mainStore.getUserInfo();
          console.log("[自动登录] 登录成功");
          
          if (isFunction(callback)) {
            callback();
          }
        } catch (error) {
          console.error("[自动登录] 登录失败:", error);
        }
      }
    },
    fail(err) {
      console.error("[自动登录] wx.login 失败:", err);
    },
  });
}

/**
 * 关联B站trackId
 * @param bilibiliTrackId
 */
async function bindingBiliTrackId(bilibiliTrackId) {
  // 如果有B站广告trackId，则关联用户信息
  if (bilibiliTrackId) {
    try {
      await orderBindingBiliTrackId({
        trackId: bilibiliTrackId,
      });
      console.log("[TAds] ✅B站trackId关联用户信息成功, trackId=" + bilibiliTrackId);
    } catch (error) {
      console.error("[TAds] ⚠️B站trackId关联用户信息失败: trackId=" + bilibiliTrackId, error);
    }
  }
}

/**
 * 自动领券 进小程序就发
 */
async function handleAutoReceiveCoupon() {
  try {
    await autoReceiveCoupon();
  } catch (error) {
    console.log("[自动领券-进小程序就发] 接口调用失败", error);
  }
}

/**
 * 用户token存在后的回调
 */
async function existTokenCallback(options = { bilibiliTrackId: '' }) {
  handleAutoReceiveCoupon();
  bindingBiliTrackId(options.bilibiliTrackId);
}

onLaunch(async (options) => {
  // if (process.env.NODE_ENV === 'development') {
  //   options.query = { "weixinadinfo": "70484662320.wx0rkablpyffphpg01.0.0", "gdt_vid": "wx0rkablpyffphpg01" };
  // }
  const tokenObj = cookie.get("accessToken");
  let userInfo = "";
  console.log("App Launch", options);
  console.log("query参数:", options.query);
  // 初始化腾讯广告 SDK（SDK 会从 options 中提取并保存 click_id）

  // B站广告trackId
  const bilibiliTrackId = options.query?.cmfromtrackid;

  try {
    TencentAdSDK.init(options);
    // 腾讯广告转化 - 创建用户行为数据源 (user_action_set) - 仅需执行一次
    // await ensureUserActionSetOnce();
  } catch (e) {
    // 静默处理，避免影响正常启动流程，但增加更详细的错误记录
    console.warn(
      "[TAds] TencentAdSDK init or ensureUserActionSetOnce error (ignored):",
      e
    );
    // 可选：向错误监控服务报告错误
    // reportError(e);
  }

  // 检查是否已登录，未登录则自动注册登录
  if (!tokenObj) {
    console.log("[自动登录] 检测到未登录，开始自动注册登录");
    let code=''
    if(options.query){
      let scene = options.query.scene || "";
        console.log("====scene==========参数:", scene);
      if(scene.startsWith('code_')){
        code = scene.substring(5);
      }
    }
    await checkTheUserInit(code, () => {
      existTokenCallback({ bilibiliTrackId: bilibiliTrackId });
    });
  } else {
    // 有token信息直接获取用户信息 等待用户信息获取成功后调用existTokenCallback 如果失败则等待token刷新后再调用existTokenCallback
    try {
      userInfo = await mainStore.getUserInfo();
      existTokenCallback({ bilibiliTrackId: bilibiliTrackId });
    } catch (error) {
      console.log("获取用户信息失败", error);
      // 等待token刷新后再调用existTokenCallback 只执行一次 防止重复调用
      uni.$once('TOKEN_REFRESH_DONE', () => {
        console.log("[TOKEN_REFRESH_DONE] 监听到token刷新完成");
        existTokenCallback({ bilibiliTrackId: bilibiliTrackId });
      });

      return;
    }
  }

  

  // 使用绑定辅助工具处理 openid 同步
  if (tokenObj && TencentAdSDK.getClickId()) {
    console.log("[腾讯广告] App启动时检测到用户已登录且有clickId");
    // 等待 openid 并执行绑定（最多等待5秒）
    BindingHelper.waitForOpenidAndBind({
      maxWaitTime: 5000,
      checkInterval: 500,
    }).then((result) => {
      if (result.success) {
        console.log("[腾讯广告] ✅ App启动时绑定成功");
      } else {
        console.warn("[腾讯广告] ⚠️ App启动时绑定失败:", result.reason);
      }
    });
  }

  mainStore.getMallLogo();
  // 埋点
  createBuryPoint({
    event: "visit",
  });
});

onShow(() => {
  mainStore.doGetIntegralName();
  // 热启动时检查绑定状态（每次都检查 clickId 是否变化）
  const clickId = TencentAdSDK.getClickId();

  if (clickId) {
    BindingHelper.smartBind({ from: "App热启动" });
  }
  // 监听网络状态变化
  uni.onNetworkStatusChange((res) => {
    console.log("[网络] 网络状态变化:", res);

    if (res.isConnected && TencentAdSDK.getClickId()) {
      const currentStatus = BindingHelper.getStatus();
      if (currentStatus !== BindingHelper.STATUS.SUCCESS) {
        console.log("[网络] 网络恢复，重试绑定");
        BindingHelper.smartBind({ from: "网络恢复" });
      }
    }
  });
});
</script>

<style lang="scss">
/*每个页面公共css */
@import "@/uni_modules/uv-ui-tools/index.scss";
@import "style/flex.scss";
@import "style/main.scss";
@import "style/style.scss";

page {
  background-color: #f5f5f5;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
