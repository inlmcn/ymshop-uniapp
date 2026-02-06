import { defineStore } from 'pinia'

import cookie from '@/utils/cookie'
import { getUserInfo, getMallConfig } from '@/api/user'
// import { ensureUserActionSetOnce } from '@/api/tencentAds'
import { useRouter } from "@/hooks/useRouter";
import { getIntegralName } from "@/api/member";
import { loginLogoIcon } from "@/utils/images";
import store from "@/store";
import TencentAdSDK from '@/utils/tencentAd.js';

const {push} = useRouter()

export const useMainStore = defineStore('main', {
    state: () => ({
        user: null,
        areaList: [],
        selectAddress: null,
        moreLoading: true,
        cartId: null,
        integralName: '积分',
        logoSrc: loginLogoIcon,
        payload:{}
    }),
    getters: {},
    actions: {
        setAccessToken(user) {
            cookie.set('accessToken', user)
            // 静默触发：登录成功后确保腾讯广告 user_action_set 只创建一次
            // 不阻塞获取用户信息与页面跳转
            // try { ensureUserActionSetOnce() } catch (e) { /* ignore */ }
            return getUserInfo()
        },
        setSelectAddress(id) {
            this.selectAddress = this.address.filter(item => item.id == id)[0]
        },
        async getUserInfo() {
            let res = await getUserInfo()
            console.log('[腾讯广告] getUserInfo 返回数据:', res)
            this.user = res
            // 获取用户信息后，保存openId并同步点击数据
            try {
                // 从用户信息中提取routineOpenId并保存到本地存储
                if (res && res.routineOpenId) {
                    uni.setStorageSync('wechat_openid', res.routineOpenId)
                    console.log('[腾讯广告] 从用户信息获取并保存routineOpenId:', res.routineOpenId)
                    // 同步点击数据和openid
                    await TencentAdSDK.syncClickWithOpenid()
                } else {
                    console.warn('[腾讯广告] 用户信息中没有routineOpenId字段')
                }
            } catch (e) {
                console.warn('[腾讯广告] 同步点击数据失败:', e)
            }
            return res
        },
        async getMallLogo() {
            let res = await getMallConfig()
            this.logoSrc = res.appLogo
        },
        init() {
            let accessToken = cookie.get('accessToken')
            if (accessToken) {
                // 应用初始化时若已登录，也静默触发一次，确保数据源创建
                // try { ensureUserActionSetOnce() } catch (e) { /* ignore */ }
                return getUserInfo()
            }
            return null
        },
        logout() {
            this.user = null
            this.address = []
            this.areaList = []
            this.selectAddress = null
            cookie.remove('accessToken')
            push({url: '/pages/login/guid'}, {type: "redirectTo"})
        },
        async doGetIntegralName() {
            this.integralName = await getIntegralName()
        }
    },
})

export const useMainStoreWithOut = () => useMainStore(store)
