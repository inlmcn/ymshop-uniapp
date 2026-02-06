/**
 * @name: 设置屏幕相关事件
 * @author: kahu4
 * @date: 2023-10-30 14:16
 * @description：useScreen
 * @update: 2023-10-30 14:16
 * */

/**
 * 设置屏幕相关事件
 * @returns {{getScreenLight: (function(): Promise<unknown>), setScreenLight: (function(number): Promise<unknown>), setScreenKeepLight: (function(*): Promise<unknown>)}}
 */
export const useScreen = ()=>{
    /**
     * 设置屏幕亮度
     * @param value{number} 亮度值 0-1
     * @returns {Promise<unknown>}
     */
    function setScreenLight(value){
        return new Promise((resolve, reject) => {
            uni.setScreenBrightness({
                value,
                success:()=>resolve(true),
                fail:(error)=>reject(error)
            })
        })
    }

    /**
     * 获得屏幕亮度
     * @returns {Promise<number>}
     */
    function getScreenLight(){
        return new Promise((resolve, reject) => {
            uni.getScreenBrightness({
                success:({value})=>resolve(value),
                fail:(error)=>reject(error)
            })
        })
    }

    /**
     * 设置是否保持常亮状态。仅在当前应用生效，离开应用后设置失效。
     * @param isKeepOn
     * @returns {Promise<unknown>}
     */
    function setScreenKeepLight(isKeepOn){
        return new Promise((resolve, reject) => {
            uni.setKeepScreenOn({
                keepScreenOn:isKeepOn,
                success:()=>resolve(true),
                fail:(error)=>reject(error)
            })
        })
    }

    return{
        setScreenLight,
        getScreenLight,
        setScreenKeepLight
    }
}
