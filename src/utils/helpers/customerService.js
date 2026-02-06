/**
 * 企业微信客服工具类
 * 使用企业微信 JS-SDK 实现客服功能
 */
import { CUSTOMER_SERVICE } from '@/config/index.js'

export class CustomerServiceUtil {
  /**
   * 打开企业微信客服（小程序专用）
   */
  static openInMiniProgram() {
    // #ifdef MP-WEIXIN
    if (!CUSTOMER_SERVICE.enabled) {
      uni.showToast({
        title: '客服功能暂未开启',
        icon: 'none'
      })
      return
    }

    wx.openCustomerServiceChat({
      extInfo: {
        url: CUSTOMER_SERVICE.url
      },
      corpId: CUSTOMER_SERVICE.corpId,
      success: (res) => {
        console.log('[客服] 打开客服成功', res)
      },
      fail: (err) => {
        console.error('[客服] 打开客服失败', err)
        // 降级方案：使用 web-view
        this.openInWebView()
      }
    })
    // #endif

    // #ifndef MP-WEIXIN
    console.warn('[客服] 当前环境不支持 wx.openCustomerServiceChat，使用降级方案')
    this.openInWebView()
    // #endif
  }

  /**
   * 使用 web-view 打开客服（通用方案）
   */
  static openInWebView() {
    if (!CUSTOMER_SERVICE.enabled) {
      uni.showToast({
        title: '客服功能暂未开启',
        icon: 'none'
      })
      return
    }

    const url = CUSTOMER_SERVICE.url

    // #ifdef MP-WEIXIN
    uni.navigateTo({
      url: `/pages/webview/customerService?url=${encodeURIComponent(url)}`
    })
    // #endif

    // #ifdef H5
    window.open(url, '_blank')
    // #endif

    // #ifdef APP-PLUS
    plus.runtime.openURL(url)
    // #endif
  }

  /**
   * 打开客服（自动选择最佳方案）
   */
  static open() {
    // #ifdef MP-WEIXIN
    // 小程序优先使用 JS-SDK
    this.openInMiniProgram()
    // #endif

    // #ifndef MP-WEIXIN
    // 其他环境使用 web-view
    this.openInWebView()
    // #endif
  }

  /**
   * 显示客服联系方式弹窗
   */
  static showContact() {
    if (!CUSTOMER_SERVICE.enabled) {
      uni.showToast({
        title: '客服功能暂未开启',
        icon: 'none'
      })
      return
    }

    const content = `客服工作时间：${CUSTOMER_SERVICE.workTime}${
      CUSTOMER_SERVICE.phone ? '\n客服电话：' + CUSTOMER_SERVICE.phone : ''
    }`

    uni.showModal({
      title: '联系客服',
      content: content,
      confirmText: '在线客服',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.open()
        }
      }
    })
  }

  /**
   * 显示客服按钮（返回按钮配置）
   */
  static getButtonConfig() {
    return {
      type: 'default-dark',
      size: 27,
      'session-from': 'weapp' // 会话来源
    }
  }
}

// 默认导出
export default CustomerServiceUtil
