/**
 * 腾讯广告绑定辅助工具
 * 解决漏绑问题：提供重试机制、状态管理、延迟绑定
 */

import TencentAdSDK from './tencentAd.js'

class BindingHelper {
  // 绑定状态
  static STATUS = {
    PENDING: 'pending',
    BINDING: 'binding',
    SUCCESS: 'success',
    FAILED: 'failed'
  }

  // 重试配置
  static RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 2000,
    retryMultiplier: 1.5
  }

  // 全局锁，防止并发绑定
  static bindingLock = false

  /**
   * 获取当前绑定状态
   */
  static getStatus() {
    return uni.getStorageSync('tencent_binding_status') || this.STATUS.PENDING
  }

  /**
   * 设置绑定状态
   */
  static setStatus(status) {
    uni.setStorageSync('tencent_binding_status', status)
    uni.setStorageSync('tencent_binding_time', Date.now())
    console.log('[绑定辅助] 状态更新:', status)
  }

  /**
   * 检查是否需要绑定
   * @param {boolean} checkSuccess - 是否检查已成功状态（默认false，即每次都绑定）
   */
  static needsBinding(checkSuccess = false) {
    const status = this.getStatus()
    const clickId = TencentAdSDK.getClickId()
    const openid = uni.getStorageSync('wechat_openid')
    const lastBoundClickId = uni.getStorageSync('tencent_last_bound_click_id')

    // 检查是否已经绑定过这个 clickId
    if (checkSuccess && status === this.STATUS.SUCCESS && lastBoundClickId === clickId) {
      console.log('[绑定辅助] 该 clickId 已绑定成功，跳过')
      return false
    }

    // 缺少必要参数
    if (!clickId) {
      console.log('[绑定辅助] 无clickId，跳过绑定')
      return false
    }

    if (!openid) {
      console.log('[绑定辅助] 无openid，等待获取')
      return false
    }

    // 如果是新的 clickId，需要重新绑定
    if (lastBoundClickId && lastBoundClickId !== clickId) {
      console.log('[绑定辅助] 检测到新的 clickId，需要重新绑定', {
        old: lastBoundClickId,
        new: clickId
      })
    }

    return true
  }

  /**
   * 确保 openid 存在
   */
  static async ensureOpenid() {
    let openid = uni.getStorageSync('wechat_openid')
    
    if (!openid) {
      console.log('[绑定辅助] 本地无 openid，尝试获取')
      
      try {
        // 调用 TencentAdSDK.ensureOpenid()
        openid = await TencentAdSDK.ensureOpenid()
        
        if (!openid) {
          console.error('[绑定辅助] ❌ 无法获取 openid')
          return null
        }
      } catch (err) {
        console.error('[绑定辅助] 获取 openid 失败:', err)
        return null
      }
    }
    
    return openid
  }

  /**
   * 执行绑定（带重试）
   */
  static async executeBinding(retryCount = 0) {
    // 全局锁检查
    if (this.bindingLock) {
      console.log('[绑定辅助] 已有绑定任务在执行，跳过')
      return { success: false, reason: 'locked' }
    }

    if (!this.needsBinding()) {
      return { success: false, reason: 'no_need' }
    }

    // 设置全局锁
    this.bindingLock = true
    // 设置为绑定中
    this.setStatus(this.STATUS.BINDING)

    try {
      // 确保 openid 存在
      const openid = await this.ensureOpenid()
      if (!openid) {
        throw new Error('无法获取 openid')
      }

      const clickId = TencentAdSDK.getClickId()
      console.log(`[绑定辅助] 开始绑定 (第${retryCount + 1}次尝试)`, { clickId, openid })
      
      await TencentAdSDK.syncClickWithOpenid()
      
      // 绑定成功，记录已绑定的 clickId
      this.setStatus(this.STATUS.SUCCESS)
      uni.setStorageSync('tencent_last_bound_click_id', clickId)
      console.log('[绑定辅助] ✅ 绑定成功', { clickId })
      
      return { success: true, clickId }
    } catch (error) {
      console.error(`[绑定辅助] ❌ 绑定失败 (第${retryCount + 1}次):`, error)

      // 判断是否需要重试
      if (retryCount < this.RETRY_CONFIG.maxRetries) {
        const delay = this.RETRY_CONFIG.retryDelay * Math.pow(this.RETRY_CONFIG.retryMultiplier, retryCount)
        console.log(`[绑定辅助] ${delay}ms 后进行第${retryCount + 2}次重试`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.executeBinding(retryCount + 1)
      } else {
        // 达到最大重试次数
        this.setStatus(this.STATUS.FAILED)
        console.error('[绑定辅助] ❌ 达到最大重试次数，绑定失败')
        
        return { success: false, reason: 'max_retries', error }
      }
    } finally {
      // 释放全局锁
      this.bindingLock = false
    }
  }

  /**
   * 智能绑定（推荐使用）
   * @param {Object} options
   * @param {string} options.from - 触发来源
   * @param {number} options.delay - 延迟执行（ms）
   * @param {boolean} options.force - 强制重新绑定
   * @param {boolean} options.checkSuccess - 是否检查已成功状态（默认false）
   */
  static async smartBind(options = {}) {
    const { from = '未知', delay = 0, force = false, checkSuccess = false } = options

    const clickId = TencentAdSDK.getClickId()
    console.log(`[绑定辅助] 智能绑定触发 (来源: ${from})`, { clickId })

    // 强制重新绑定
    if (force) {
      console.log('[绑定辅助] 强制重新绑定，清除状态')
      this.reset()
    }

    // 延迟执行
    if (delay > 0) {
      console.log(`[绑定辅助] 延迟 ${delay}ms 后执行`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    return this.executeBinding()
  }

  /**
   * 等待 openid 并绑定
   * 适用于登录后立即绑定的场景
   */
  static async waitForOpenidAndBind(options = {}) {
    const { maxWaitTime = 5000, checkInterval = 500 } = options
    const startTime = Date.now()

    console.log('[绑定辅助] 等待 openid...')

    while (Date.now() - startTime < maxWaitTime) {
      const openid = uni.getStorageSync('wechat_openid')
      
      if (openid) {
        console.log('[绑定辅助] ✅ 检测到 openid，开始绑定')
        return this.executeBinding()
      }

      // 等待一段时间后再检查
      await new Promise(resolve => setTimeout(resolve, checkInterval))
    }

    console.warn('[绑定辅助] ⚠️ 等待 openid 超时')
    return { success: false, reason: 'timeout' }
  }

  /**
   * 重置绑定状态
   */
  static reset() {
    uni.removeStorageSync('tencent_binding_status')
    uni.removeStorageSync('tencent_binding_time')
    console.log('[绑定辅助] 已重置绑定状态')
  }

  /**
   * 获取绑定信息
   */
  static getInfo() {
    return {
      status: this.getStatus(),
      clickId: TencentAdSDK.getClickId(),
      lastBoundClickId: uni.getStorageSync('tencent_last_bound_click_id'),
      openid: uni.getStorageSync('wechat_openid'),
      bindingTime: uni.getStorageSync('tencent_binding_time')
    }
  }
}

export default BindingHelper
