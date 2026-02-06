/**
 * @name: useSystem
 * @author: kahu4
 * @date: 2023-10-30 12:23
 * @description：useSystem
 * @update: 2023-10-30 12:23
 * */

/**
 *
 * @returns {{getDeviceInfo: (function(): UniNamespace.GetDeviceInfoResult), getAppBaseInfo: (function(): UniNamespace.GetAppBaseInfoResult), getAppAuthorizeSetting: (function(): UniNamespace.GetAppAuthorizeSettingResult), getSystemSetting: (function(): UniNamespace.GetsystemsettingResult), getWindowInfo: (function(): UniNamespace.GetWindowInfoResult), getSystemInfo: (function(): Promise<unknown>), openAppAuthorizeSetting: (function(): Promise<unknown>)}}
 */
export const useSystem = ()=>{
    /**
     * 获取系统信息
     * @docs https://uniapp.dcloud.net.cn/api/system/info.html
     * @returns {Promise<UniNamespace.GetSystemInfoOptions>}
     */
    function getSystemInfo(){
        return new Promise((resolve, reject) => {
            uni.getSystemInfo({
                success:(res)=>resolve(res),
                fail:(error)=>reject(error)
            })
        })
    }

    /**
     * 获取设备信息
     * @docs https://uniapp.dcloud.net.cn/api/system/getDeviceInfo.html
     * @returns {UniNamespace.GetDeviceInfoResult}
     */
    function getDeviceInfo(){
        return uni.getDeviceInfo()
    }

    /**
     * 获取窗口信息
     * @docs https://uniapp.dcloud.net.cn/api/system/getWindowInfo.html
     * @returns {UniNamespace.GetWindowInfoResult}
     */
    function getWindowInfo(){
        return uni.getWindowInfo()
    }

    /**
     * 获取微信 APP 基础信息
     * @docs https://uniapp.dcloud.net.cn/api/system/getAppBaseInfo.html
     * @returns {UniNamespace.GetAppBaseInfoResult}
     */
    function getAppBaseInfo(){
        return uni.getAppBaseInfo()
    }

    /**
     * 获取App授权信息
     * @docs https://uniapp.dcloud.net.cn/api/system/getappauthorizesetting.html
     * @returns {UniNamespace.GetAppAuthorizeSettingResult}
     */
    function getAppAuthorizeSetting(){
        return uni.getAppAuthorizeSetting()
    }

    /**
     * 获取设备设置
     * @docs https://uniapp.dcloud.net.cn/api/system/getsystemsetting.html
     * @returns {UniNamespace.GetsystemsettingResult}
     */
    function getSystemSetting(){
        return uni.getSystemSetting()
    }

    /**
     * 打开用户授权
     * @docs https://uniapp.dcloud.net.cn/api/system/openappauthorizesetting.html
     * @returns {Promise<unknown>}
     */
    function openAppAuthorizeSetting(){
        return new Promise((resolve, reject) => {
            uni.openAppAuthorizeSetting({
                success:()=>resolve(true),
                fail:(error)=>reject(error)
            })
        })
    }


    return{
        getSystemInfo,
        getDeviceInfo,
        getWindowInfo,
        getAppBaseInfo,
        getAppAuthorizeSetting,
        getSystemSetting,
        openAppAuthorizeSetting
    }
}
