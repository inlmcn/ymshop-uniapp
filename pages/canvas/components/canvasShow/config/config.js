// 画布配置
// import Cookies from 'js-cookie'

const config = {
  terminal: 4, // 画布设备 1 小程序，2 H5，3 App 4 电脑
  typeId: 0, // 页面类型 0 C端 1 平台画布，2 自定义页面，3 商家店铺装修
  getToken: function(){
    return uni.getStorageSync('storage_key').token
  }
}

// #ifdef H5
config.terminal = 2
// #endif

// #ifdef APP-PLUS || APP-NVUE
config.terminal = 3
// #endif

// #ifdef MP
config.terminal = 1
// #endif

export default config
