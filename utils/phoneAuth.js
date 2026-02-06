import { weixinMiniAppMobile } from '@/api/auth'

/**
 * 获取微信登录 code
 * @returns {Promise<string>} loginCode
 */
export async function getWxLoginCode() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(new Error('获取登录code失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 授权手机号（带重试机制）
 * @param {string} phoneCode - 手机号code，通过 wx.getPhoneNumber 获取
 * @param {string} loginCode - 登录code，通过 wx.login 获取
 * @param {number} retryCount - 重试次数，默认1次
 * @returns {Promise<boolean>} 是否授权成功
 */
export async function authPhoneNumber(phoneCode, loginCode, retryCount = 1) {
  if (!phoneCode) {
    throw new Error('缺少必要参数: phoneCode')
  }
  if (!loginCode) {
    throw new Error('缺少必要参数: loginCode')
  }

  try {
    console.log('[手机号授权] 开始授权', { phoneCode, loginCode })
    
    const res = await weixinMiniAppMobile({
      phoneCode,
      loginCode
    })

    console.log('[手机号授权] 授权结果:', res)

    // 判断返回结果
    if (res && res.data === 1) {
      console.log('[手机号授权] 授权成功')
      return true
    } else if (res && res.data === 0) {
      console.warn('[手机号授权] 授权失败，准备重试')
      
      // 如果失败且还有重试次数，则重试
      if (retryCount > 0) {
        console.log(`[手机号授权] 开始第 ${2 - retryCount} 次重试`)
        // 延迟500ms后重试
        await new Promise(resolve => setTimeout(resolve, 500))
        return authPhoneNumber(phoneCode, loginCode, retryCount - 1)
      } else {
        console.error('[手机号授权] 重试次数已用完，授权失败')
        return false
      }
    } else {
      console.error('[手机号授权] 返回数据格式异常:', res)
      return false
    }
  } catch (error) {
    console.error('[手机号授权] 请求异常:', error)
    
    // 如果是网络错误且还有重试次数，则重试
    if (retryCount > 0) {
      console.log(`[手机号授权] 请求异常，开始第 ${2 - retryCount} 次重试`)
      await new Promise(resolve => setTimeout(resolve, 500))
      return authPhoneNumber(phoneCode, loginCode, retryCount - 1)
    } else {
      throw error
    }
  }
}

/**
 * 处理手机号授权按钮事件
 * @param {Object} e - getPhoneNumber 事件对象
 * @param {Function} onSuccess - 授权成功回调
 * @param {Function} onFail - 授权失败回调
 */
export async function handlePhoneAuth(e, onSuccess, onFail) {
  // 检查用户是否同意授权
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    console.error('[手机号授权] 用户拒绝授权或授权失败', e.detail)
    if (onFail) {
      onFail(new Error('用户拒绝授权'))
    }
    return
  }

  try {
    // 获取 phoneCode
    const phoneCode = e.detail.code
    if (!phoneCode) {
      throw new Error('未获取到手机号code')
    }

    // 获取 loginCode
    const loginCode = await getWxLoginCode()

    // 执行授权（带重试）
    const success = await authPhoneNumber(phoneCode, loginCode)

    if (success) {
      if (onSuccess) {
        onSuccess()
      }
    } else {
      if (onFail) {
        onFail(new Error('手机号授权失败'))
      }
    }
  } catch (error) {
    console.error('[手机号授权] 处理失败:', error)
    if (onFail) {
      onFail(error)
    }
  }
}
