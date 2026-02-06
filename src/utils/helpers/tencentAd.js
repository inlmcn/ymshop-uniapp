/**
 * 腾讯广告小程序SDK
 * 用于小程序端接入腾讯广告转化追踪
 * 
 * 使用方法:
 * 1. 将此文件复制到小程序项目的 utils 目录
 * 2. 在需要的页面引入: const TencentAdSDK = require('../../utils/tencentAd.js');
 * 3. 在 config/index.js 中配置 TENCENT_AD_API_URL
 */

import { TENCENT_AD_API_URL } from '@/config/index'
import { requestUtil } from '@/utils/request'

const API_URL = TENCENT_AD_API_URL
class TencentAdSDK {
  /**
   * 初始化 - 在 app.js 的 onLaunch 中调用
   * @param {Object} options - 启动参数
   */
  static init(options) {
    console.log('[腾讯广告] init() 被调用，完整参数:', JSON.stringify(options, null, 2));
    
    // ✅ 从 options.query 或 options.scene 中获取点击ID
    const query = options.query || {};
    console.log('[腾讯广告] query参数:', JSON.stringify(query, null, 2));
    
    const clickId = query.gdt_vid || query.click_id || options.gdt_vid || options.click_id;
    
    if (clickId) {
      this.saveClickId(clickId);
      console.log('[腾讯广告] 已保存点击ID:', clickId);
    } else {
      console.log('[腾讯广告] 未检测到广告点击ID (可能不是从广告进入)');
    }

    // ✅ 解析 weixinadinfo 参数 (格式: adgroupId.appId.0.0)
    const weixinadinfo = query.weixinadinfo;
    if (weixinadinfo) {
      try {
        const parts = weixinadinfo.split('.');
        if (parts.length >= 2) {
          const adgroupId = parts[0]; // 广告组ID: 70203308427
          const appId = parts[1];     // 小程序AppID: wx07zrrdhf5savfi01
          
          // 保存广告归因信息
          uni.setStorageSync('tencent_adgroup_id', adgroupId);
          uni.setStorageSync('tencent_app_id', appId);
          
          // 从 gdt_vid 中提取 requestId (去掉后缀)
          // gdt_vid 格式: wx07zrrdhf5savfi01 -> requestId: wx07zrrdhf5savfi
          if (clickId) {
            const requestId = clickId.replace(/\d+$/, ''); // 去掉末尾数字
            uni.setStorageSync('tencent_request_id', requestId);
            console.log('[腾讯广告] 解析weixinadinfo成功:', {
              adgroupId,
              appId,
              requestId,
              gdt_vid: clickId
            });
          }
        }
      } catch (err) {
        console.error('[腾讯广告] 解析weixinadinfo失败:', err);
      }
    }

    // ✅ 解析 callback 参数 (腾讯广告回调URL)
    const callback = query.callback || query.__CALLBACK__;
    console.log('[腾讯广告] 检测到的callback参数:', callback);
    
    if (callback && callback !== '__CALLBACK__') {
      try {
        // 保存完整的 callback URL
        uni.setStorageSync('tencent_callback_url', callback);
        
        // 解析 callback URL 获取 cb 和 conv_id
        const callbackUrl = new URL(callback);
        const cb = callbackUrl.searchParams.get('cb');
        const convId = callbackUrl.searchParams.get('conv_id');
        
        if (cb) uni.setStorageSync('tencent_cb', cb);
        if (convId) uni.setStorageSync('tencent_conv_id', convId);
        
        console.log('[腾讯广告] 解析到 callback:', callback);
        console.log('[腾讯广告] cb:', cb, 'conv_id:', convId);
      } catch (err) {
        console.error('[腾讯广告] 解析callback失败:', err);
      }
    }

    // ✅ 从监测链接中获取微信标识（如果存在）
    const wechatOpenid = query.wechat_openid;
    const wechatAppId = query.wechat_app_id;
    
    if (wechatOpenid && wechatOpenid !== '__WECHAT_OPENID__') {
      uni.setStorageSync('wechat_openid', wechatOpenid);
      console.log('[腾讯广告] 从监测链接获取openid:', wechatOpenid);
      
      // ✅ 绑定到点击数据
      this.bindOpenidToClick(wechatOpenid, wechatAppId || '');
    }
    // ✅ 主动获取并绑定openid（如果已登录）
    // 注意：实际的同步操作在用户登录成功后通过 syncClickWithOpenid() 方法调用
    // 这样可以确保 openid 已经存在
  }

  /**
   * 保存点击ID到本地存储
   * @param {string} clickId - 点击ID
   */
  static saveClickId(clickId) {
    if (clickId) {
      try {
        uni.setStorageSync('tencent_click_id', clickId);
        uni.setStorageSync('tencent_click_time', Date.now());
      } catch (err) {
        console.error('[腾讯广告] 保存点击ID失败:', err);
      }
    }
  }

  /**
   * 获取点击ID
   * @returns {string} 点击ID
   */
  static getClickId() {
    try {
      return uni.getStorageSync('tencent_click_id') || '';
    } catch (err) {
      console.error('[腾讯广告] 获取点击ID失败:', err);
      return '';
    }
  }

  /**
   * 获取存储的 callback URL
   * @returns {string} callback URL
   */
  static getCallbackUrl() {
    try {
      return uni.getStorageSync('tencent_callback_url') || '';
    } catch (err) {
      console.error('[腾讯广告] 获取callback URL失败:', err);
      return '';
    }
  }

  /**
   * 检查点击ID是否过期(默认30天)
   * @param {number} maxAge - 最大有效期(毫秒)
   * @returns {boolean}
   */
  static isClickIdValid(maxAge = 30 * 24 * 60 * 60 * 1000) {
    try {
      const clickTime = uni.getStorageSync('tencent_click_time');
      if (!clickTime) return false;
      return (Date.now() - clickTime) < maxAge;
    } catch (err) {
      return false;
    }
  }

  /**
   * 上报转化事件 (新方案: 按腾讯广告官方标准结构)
   * @param {Object} options - 转化参数
   * @param {string} options.actionType - 行为类型: COMPLETE_ORDER, PLACE_ORDER, PAY 等
   * @param {string} options.userActionSetId - 转化目标ID
   * @param {string} options.wechatOpenid - 微信openid
   * @param {string} options.wechatAppId - 微信AppID
   * @param {Object} options.actionParam - 转化参数 {例如 value: 455}
   * @param {string} options.clickId - 点击ID(可选)
   * @param {string} options.callback - 腾讯广告 callback URL(可选)
   * @returns {Promise}
   */
  static async reportConversionByOfficial(options) {
    const {
      actionType,
      userActionSetId,
      wechatOpenid,
      wechatAppId,
      actionParam = {},
      clickId,  // 如果用户没传，下面会自动获取
      callback  // 腾讯广告 callback URL
    } = options;
    
    // ✅ 自动获取 clickId（用户传入的优先，否则从本地存储获取）
    const finalClickId = clickId || this.getClickId();
    
    // ✅ 自动获取 callback（用户传入的优先，否则从本地存储获取）
    const finalCallback = callback || this.getCallbackUrl();
    console.log('[腾讯广告] finalCallback值:', finalCallback);
    console.log('[腾讯广告] callback来源:', callback ? '用户传入' : (this.getCallbackUrl() ? '本地存储' : '未找到'));

    // 参数校验
    if (!actionType) {
      return Promise.reject(new Error('缺少必要参数: actionType'));
    }
    if (!wechatOpenid) {
      return Promise.reject(new Error('缺少必要参数: wechatOpenid'));
    }
    if (!wechatAppId) {
      return Promise.reject(new Error('缺少必要参数: wechatAppId'));
    }
    // ℹ️ userActionSetId 改为可选（可不传）
    // if (!userActionSetId) {
    //   return Promise.reject(new Error('缺少必要参数: userActionSetId'));
    // }

    console.log('[腾讯广告] 准备上报转化 (官方标准)', {
      actionType,
      userActionSetId,
      hasOpenid: !!wechatOpenid,
      wechatAppId,
      hasActionParam: !!actionParam,
      hasCallback: !!finalCallback
    });

    // ⚠️ 归因关键字段检查
    if (!finalClickId) {
      console.warn('[腾讯广告] 警告: clickId为空，归因可能失败！');
      console.warn('[腾讯广告] 请确保: 1) 已调用init初始化 2) 用户从广告链接进入');
    }

    const sendData = {
      actionType,
      userActionSetId,
      wechatOpenid,
      wechatAppId,
      actionParam,
      clickId: finalClickId,
      callback: finalCallback  // ✅ 传递callback参数（自动获取）
    };
    console.log('[腾讯广告] reportConversionByOfficial将发送的完整数据:', JSON.stringify(sendData, null, 2));

    return new Promise((resolve, reject) => {
      uni.request({
        url: `${API_URL}/api/conversion`,
        method: 'POST',
        data: sendData,
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            console.log(`[腾讯广告] ${actionType} 转化上报成功`, res.data);
            resolve(res.data);
          } else {
            console.error(`[腾讯广告] ${actionType} 转化上报失败`, res.data);
            reject(res.data);
          }
        },
        fail: (err) => {
          console.error(`[腾讯广告] ${actionType} 转化上报请求失败`, err);
          reject(err);
        }
      });
    });
  }

  /**
   * 上报转化事件 (旧方案: 兼容)
   * @param {Object} options - 转化参数
   * @param {string} options.actionType - 行为类型: PAGE_VIEW, REGISTER, PURCHASE 等
   * @param {string} options.userActionSetId - 转化目标ID(在腾讯广告后台获取)
   * @param {string} options.phone - 用户手机号(可选)
   * @param {string} options.email - 用户邮箱(可选)
   * @param {string} options.wechatOpenid - 微信openid(小程序场景建议传)
   * @param {string} options.wechatUnionid - 微信unionid(可选)
   * @param {string} options.wechatAppId - 微信AppID(小程序场景必传)
   * @param {Object} options.actionParam - 转化参数(如订单金额等)
   * @returns {Promise}
   */
  static reportConversion(options) {
    const {
      actionType,
      userActionSetId,
      phone,
      email,
      wechatOpenid,
      wechatUnionid,
      wechatAppId,
      actionParam = {}
    } = options;

    // ℹ️ userActionSetId 改为可选参数
    // if (!userActionSetId) {
    //   return Promise.reject(new Error('缺少必要参数: userActionSetId'));
    // }

    const clickId = this.getClickId();
    
    // 如果没有点击ID,仍然上报(服务端会尝试其他归因方式)
    if (!clickId) {
      console.warn('[腾讯广告] 未找到点击ID,将使用其他归因方式');
    }

    return new Promise((resolve, reject) => {
      uni.request({
        url: `${API_URL}/api/conversion`,
        method: 'POST',
        data: {
          actionType: actionType || 'PAGE_VIEW',
          userActionSetId,
          clickId,
          phone,
          email,
          wechatOpenid,
          wechatUnionid,
          wechatAppId,
          actionParam
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            console.log(`[腾讯广告] ${actionType} 转化上报成功`, res.data);
            resolve(res.data);
          } else {
            console.error(`[腾讯广告] ${actionType} 转化上报失败`, res.data);
            reject(res.data);
          }
        },
        fail: (err) => {
          console.error(`[腾讯广告] ${actionType} 转化上报请求失败`, err);
          reject(err);
        }
      });
    });
  }

  /**
   * 上报小程序转化事件 (方式1：有监测链接，通过cb参数)
   * @param {Object} options - 转化参数
   * @param {string} options.actionType - 行为类型: REGISTER, PURCHASE 等
   * @param {string} options.wechatOpenid - 微信openid(与unionid二选一)
   * @param {string} options.wechatUnionid - 微信unionid(与openid二选一)
   * @param {string} options.wechatAppId - 微信AppID(wx开头,必传)
   * @param {string} options.callbackParam - __CALLBACK__参数(可选，非广告渠道可不提供)
   * @param {string} options.clickId - 点击ID(备用)
   * @param {Object} options.actionParam - 转化参数(如订单金额等)
   * @returns {Promise}
   */
  static reportMiniProgramConversion(options) {
    const {
      actionType,
      wechatOpenid,
      wechatUnionid,
      wechatAppId,
      callbackParam,
      clickId,
      actionParam = {}
    } = options;

    // 参数校验
    if (!wechatAppId) {
      return Promise.reject(new Error('缺少必要参数: wechatAppId(微信AppID)'));
    }

    if (!wechatOpenid && !wechatUnionid) {
      return Promise.reject(new Error('缺少必要参数: wechatOpenid或wechatUnionid(其中一个)'));
    }

    // ✅ callbackParam现在是可选的（兼容非广告渠道的场景）
    console.log('[腾讯广告] 准备上报小程序转化 (方式1)', {
      actionType,
      wechatAppId,
      hasOpenid: !!wechatOpenid,
      hasUnionid: !!wechatUnionid,
      hasCallbackParam: !!callbackParam
    });

    return new Promise((resolve, reject) => {
      uni.request({
        url: `${API_URL}/api/miniprogram/conversion`,
        method: 'POST',
        data: {
          actionType: actionType || 'PURCHASE',
          wechatOpenid: wechatOpenid || '',
          wechatUnionid: wechatUnionid || '',
          wechatAppId,
          callbackParam: callbackParam || '',  // ✅ 可选参数
          clickId: clickId || '',
          actionParam
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            console.log(`[腾讯广告] 小程序${actionType}转化上报成功`, res.data);
            resolve(res.data);
          } else {
            console.error(`[腾讯广告] 小程序${actionType}转化上报失败`, res.data);
            reject(res.data);
          }
        },
        fail: (err) => {
          console.error(`[腾讯广告] 小程序${actionType}转化上报请求失败`, err);
          reject(err);
        }
      });
    });
  }

  // ========== 新增：按官方API结构的便利方法 ==========

  /**
   * 完成订单
   * @param {Object} options
   * @param {string} options.wechatOpenid - 微信openid (必需)
   * @param {string} options.wechatAppId - 微信AppID (必需)
   * @param {string} options.userActionSetId - 转化目标ID (可选)
   * @param {Object} options.actionParam - 订单参数 {value: 455}
   */
  static reportCompleteOrder(options = {}) {
    return this.reportConversionByOfficial({
      actionType: 'COMPLETE_ORDER',
      ...options
    });
  }

  /**
   * 下单
   * @param {Object} options
   * @param {string} options.wechatOpenid - 微信openid (必需)
   * @param {string} options.wechatAppId - 微信AppID (必需)
   * @param {string} options.userActionSetId - 转化目标ID (可选)
   * @param {Object} options.actionParam - 订单参数 {order_id, amount}
   */
  static reportPlaceOrder(options = {}) {
    return this.reportConversionByOfficial({
      actionType: 'PLACE_ORDER',
      ...options
    });
  }

  /**
   * 支付
   * @param {Object} options
   * @param {string} options.wechatOpenid - 微信openid (必需)
   * @param {string} options.wechatAppId - 微信AppID (必需)
   * @param {string} options.userActionSetId - 转化目标ID (可选)
   * @param {Object} options.actionParam - 支付参数 {value: 99.9}
   */
  static reportPay(options = {}) {
    return this.reportConversionByOfficial({
      actionType: 'PAY',
      ...options
    });
  }

  /**
   * 确保openid存在并绑定到点击数据
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<string|null>} openid
   */
  static async ensureOpenid(forceRefresh = false) {
    let openid = uni.getStorageSync('wechat_openid');
    
    // 如果没有openid或需要强制刷新，则重新获取
    if (!openid || forceRefresh) {
      try {
        // 调用uni.login获取code
        const loginRes = await new Promise((resolve, reject) => {
          uni.login({
            success: resolve,
            fail: reject
          });
        });
        
        // 向后端请求获取openid
        const res = await new Promise((resolve, reject) => {
          uni.request({
            url: `${API_URL}/api/wechat/get-openid`,
            method: 'POST',
            data: {
              code: loginRes.code
            },
            success: resolve,
            fail: reject
          });
        });
        
        if (res.data && res.data.openid) {
          openid = res.data.openid;
          // 存储到本地
          uni.setStorageSync('wechat_openid', openid);
          uni.setStorageSync('wechat_appid', res.data.appid || '');
          console.log('[腾讯广告] 已获取并存储openid:', openid);
          
          // ✅ 主动绑定到点击数据
          await this.bindOpenidToClick(openid, res.data.appid || '');
        }
      } catch (err) {
        console.error('[腾讯广告] 获取openid失败:', err);
      }
    }
    
    if (!openid) {
      console.warn('[腾讯广告] 警告: 未找到wechat_openid');
      return null;
    }
    
    return openid;
  }

  /**
   * 更新点击数据(绑定openid)
   * @param {string} clickId - 点击ID
   * @returns {Promise}
   */
  static async updateClickWithOpenid(clickId) {
    if (!clickId) {
      console.log('[腾讯广告] 无点击ID，跳过更新');
      return Promise.resolve();
    }

    try {
      // 获取本地存储的openid (使用uni API兼容多端)
      const openId = uni.getStorageSync('wechat_openid');
      console.log('[腾讯广告] 从本地存储读取openId:', openId);
      if (!openId) {
        console.log('[腾讯广告] 无openid，跳过更新点击数据');
        return;
      }

      // 获取提取后的 requestId (去掉后缀)
      // 优先使用已保存的 requestId，如果没有则使用完整的 clickId
      const requestId = uni.getStorageSync('tencent_request_id') || clickId;

      console.log('[腾讯广告] 准备更新点击数据:', { 
        gdt_vid: clickId, 
        requestId, 
        openId 
      });

      const res = await requestUtil.post('/shop-datanexus/updateClick', {
        requestid: requestId,
        openId
      });

      console.log('[腾讯广告] 点击数据更新成功:', res);
      return res;
    } catch (err) {
      console.error('[腾讯广告] 点击数据更新失败:', err);
      // 不抛出错误，避免影响正常流程
    }
  }

  /**
   * 绑定openid到点击数据
   * @param {string} openid - 微信openid
   * @param {string} appid - 微信appid
   * @returns {Promise}
   */
  static bindOpenidToClick(openid, appid) {
    const clickId = this.getClickId();
    if (!clickId) {
      console.log('[腾讯广告] 无点击ID，跳过绑定openid');
      return Promise.resolve();
    }

    console.log('[腾讯广告] 准备绑定openid到点击数据:', { clickId, openid, appid });

    return new Promise((resolve, reject) => {
      uni.request({
        url: `${API_URL}/api/bind-openid`,
        method: 'POST',
        data: {
          clickId,
          openid,
          appid
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            console.log('[腾讯广告] openid绑定成功');
            resolve(res.data);
          } else {
            console.error('[腾讯广告] openid绑定失败:', res.data);
            reject(res.data);
          }
        },
        fail: (err) => {
          console.error('[腾讯广告] openid绑定请求失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 检查下单条件
   * 判断是否满足：当日广告、首单用户、当天下单
   * @param {Object} options - 参数
   * @param {string} options.userId - 用户ID
   * @param {number} options.orderTime - 订单时间（时间戳）
   * @param {Array} options.userOrderHistory - 用户订单历史（可选）
   * @returns {Promise} 检查结果
   */
  static checkOrderCondition(options = {}) {
    const {
      userId,
      orderTime,
      userOrderHistory = []
    } = options;

    // 参数校验
    if (!userId) {
      return Promise.reject(new Error('缺少必要参数: userId'));
    }
    if (!orderTime) {
      return Promise.reject(new Error('缺少必要参数: orderTime'));
    }

    const clickId = this.getClickId();
    if (!clickId) {
      console.warn('[腾讯广告] 警告: 无法获取点击ID，条件检查可能失败');
    }

    console.log('[腾讯广告] 检查下单条件:', {
      clickId,
      userId,
      orderTime,
      hasOrderHistory: userOrderHistory.length > 0
    });

    return new Promise((resolve, reject) => {
      uni.request({
        url: `${API_URL}/api/check/order-condition`,
        method: 'POST',
        data: {
          clickId,
          userId,
          orderTime,
          userOrderHistory
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            console.log('[腾讯广告] 下单条件检查结果:', res.data);
            resolve(res.data);
          } else {
            console.error('[腾讯广告] 下单条件检查失败:', res.data);
            reject(res.data);
          }
        },
        fail: (err) => {
          console.error('[腾讯广告] 下单条件检查请求失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 获取点击数据（监测链接返回的数据）
   * @returns {Promise} 点击数据
   */
  static getClickLinkData() {
    const clickId = this.getClickId();
    if (!clickId) {
      return Promise.reject(new Error('未找到点击ID'));
    }

    return new Promise((resolve, reject) => {
      uni.request({
        url: `${API_URL}/api/check/click-data/${clickId}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            console.log('[腾讯广告] 点击数据:', res.data.data);
            resolve(res.data.data);
          } else {
            console.error('[腾讯广告] 获取点击数据失败:', res.data);
            reject(res.data);
          }
        },
        fail: (err) => {
          console.error('[腾讯广告] 获取点击数据请求失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 同步点击数据和openid（供外部主动调用）
   * 建议在用户登录成功后调用此方法
   * @returns {Promise}
   */
  static syncClickWithOpenid() {
    const clickId = this.getClickId();
    return this.updateClickWithOpenid(clickId);
  }

  /**
   * 获取广告归因信息
   * @returns {Object} 包含 gdt_vid, adgroupId, requestId, appId 的对象
   */
  static getAttributionInfo() {
    try {
      return {
        gdt_vid: uni.getStorageSync('tencent_click_id') || '',
        adgroupId: uni.getStorageSync('tencent_adgroup_id') || '',
        requestId: uni.getStorageSync('tencent_request_id') || '',
        appId: uni.getStorageSync('tencent_app_id') || '',
        clickTime: uni.getStorageSync('tencent_click_time') || ''
      };
    } catch (err) {
      console.error('[腾讯广告] 获取归因信息失败:', err);
      return {
        gdt_vid: '',
        adgroupId: '',
        requestId: '',
        appId: '',
        clickTime: ''
      };
    }
  }

  /**
   * 绑定广告归因数据到后端
   * 将前端的 gdt_vid 和后端的归因数据建立关联
   * @param {Object} attributionData - 后端返回的归因数据
   * @returns {Promise}
   */
  static bindAttributionData(attributionData) {
    const localInfo = this.getAttributionInfo();
    
    console.log('[腾讯广告] 准备绑定归因数据:', {
      local: localInfo,
      backend: attributionData
    });

    // 验证关键字段是否匹配
    if (attributionData.adgroupId && localInfo.adgroupId) {
      if (attributionData.adgroupId !== localInfo.adgroupId) {
        console.warn('[腾讯广告] 警告: adgroupId不匹配', {
          local: localInfo.adgroupId,
          backend: attributionData.adgroupId
        });
      }
    }

    // 通过 requestId 建立绑定关系
    if (attributionData.requestId && localInfo.requestId) {
      if (attributionData.requestId === localInfo.requestId) {
        console.log('[腾讯广告] requestId匹配成功,建立绑定关系');
        
        return new Promise((resolve, reject) => {
          uni.request({
            url: `${API_URL}/api/bind-attribution`,
            method: 'POST',
            data: {
              gdt_vid: localInfo.gdt_vid,
              adgroupId: attributionData.adgroupId,
              requestId: attributionData.requestId,
              clickId: attributionData.clickId,
              adId: attributionData.adId,
              dynamicCreativeId: attributionData.dynamicCreativeId
            },
            success: (res) => {
              if (res.statusCode === 200 && res.data.success) {
                console.log('[腾讯广告] 归因数据绑定成功');
                resolve(res.data);
              } else {
                console.error('[腾讯广告] 归因数据绑定失败:', res.data);
                reject(res.data);
              }
            },
            fail: (err) => {
              console.error('[腾讯广告] 归因数据绑定请求失败:', err);
              reject(err);
            }
          });
        });
      } else {
        console.warn('[腾讯广告] requestId不匹配,无法建立绑定', {
          local: localInfo.requestId,
          backend: attributionData.requestId
        });
        return Promise.reject(new Error('requestId不匹配'));
      }
    }

    console.warn('[腾讯广告] 缺少必要的归因字段,无法建立绑定');
    return Promise.reject(new Error('缺少必要的归因字段'));
  }
}

// 导出(兼容小程序原生和Vue3)
export default TencentAdSDK;
