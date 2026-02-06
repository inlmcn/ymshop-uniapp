import { defineStore } from 'pinia';
import type { User } from '@/src/types/api';
import cookie from '@/utils/helpers/cookie';
import { getUserInfo, getMallConfig } from '@/src/api/modules/user';
import { useRouter } from "@/src/hooks/useRouter";
import { getIntegralName } from "@/src/api/modules/member";
import { loginLogoIcon } from "@/src/utils/helpers/images";
import store from "@/src/stores";
import TencentAdSDK from '@/src/utils/helpers/tencentAd';

const { push } = useRouter();

export interface MainStoreState {
  user: User | null;
  areaList: any[];
  selectAddress: any;
  moreLoading: boolean;
  cartId: string | null;
  integralName: string;
  logoSrc: string;
  payload: Record<string, any>;
}

export const useMainStore = defineStore('main', {
  state: (): MainStoreState => ({
    user: null,
    areaList: [],
    selectAddress: null,
    moreLoading: true,
    cartId: null,
    integralName: '积分',
    logoSrc: loginLogoIcon,
    payload: {}
  }),
  
  getters: {
    isLoggedIn: (state): boolean => !!state.user,
    userNickName: (state): string => state.user?.nickname || '',
    userAvatar: (state): string => state.user?.avatar || '',
    userId: (state): string | number | undefined => state.user?.id
  },
  
  actions: {
    /**
     * 设置访问令牌并获取用户信息
     */
    async setAccessToken(user: any): Promise<User> {
      cookie.set('accessToken', user);
      
      // 静默触发：登录成功后确保腾讯广告 user_action_set 只创建一次
      // 不阻塞获取用户信息与页面跳转
      // try { ensureUserActionSetOnce() } catch (e) { /* ignore */ }
      
      return await this.getUserInfo();
    },
    
    /**
     * 设置选中地址
     */
    setSelectAddress(id: string | number) {
      this.selectAddress = this.address.filter((item: any) => item.id == id)[0];
    },
    
    /**
     * 获取用户信息
     */
    async getUserInfo(): Promise<User> {
      try {
        const res = await getUserInfo();
        console.log('[腾讯广告] getUserInfo 返回数据:', res);
        this.user = res;
        
        // 获取用户信息后，保存openId并同步点击数据
        try {
          // 从用户信息中提取routineOpenId并保存到本地存储
          if (res && res.routineOpenId) {
            uni.setStorageSync('wechat_openid', res.routineOpenId);
            console.log('[腾讯广告] 从用户信息获取并保存routineOpenId:', res.routineOpenId);
            // 同步点击数据和openid
            await TencentAdSDK.syncClickWithOpenid();
          } else {
            console.warn('[腾讯广告] 用户信息中没有routineOpenId字段');
          }
        } catch (e) {
          console.warn('[腾讯广告] 同步点击数据失败:', e);
        }
        
        return res;
      } catch (error) {
        console.error('获取用户信息失败:', error);
        throw error;
      }
    },
    
    /**
     * 获取商城LOGO
     */
    async getMallLogo() {
      try {
        const res = await getMallConfig();
        this.logoSrc = res.appLogo;
      } catch (error) {
        console.error('获取商城LOGO失败:', error);
      }
    },
    
    /**
     * 应用初始化
     */
    async init(): Promise<User | null> {
      const accessToken = cookie.get('accessToken');
      if (accessToken) {
        // 应用初始化时若已登录，也静默触发一次，确保数据源创建
        // try { ensureUserActionSetOnce() } catch (e) { /* ignore */ }
        return await this.getUserInfo();
      }
      return null;
    },
    
    /**
     * 登出
     */
    logout() {
      this.user = null;
      this.address = [];
      this.areaList = [];
      this.selectAddress = null;
      cookie.remove('accessToken');
      push({ url: '/pages/login/guid' }, { type: "redirectTo" });
    },
    
    /**
     * 获取积分名称
     */
    async doGetIntegralName() {
      try {
        this.integralName = await getIntegralName();
      } catch (error) {
        console.error('获取积分名称失败:', error);
      }
    },
    
    /**
     * 更新用户信息
     */
    updateUser(userInfo: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...userInfo };
      }
    },
    
    /**
     * 更新用户积分
     */
    updateUserPoints(points: number) {
      if (this.user) {
        (this.user as any).points = points;
      }
    }
  },

  // 持久化存储配置
  persist: {
    key: 'main-store',
    storage: uni.getStorageSync ? uni : localStorage,
    paths: ['user', 'integralName', 'logoSrc'] // 只持久化特定字段
  }
});

export const useMainStoreWithOut = () => useMainStore(store);