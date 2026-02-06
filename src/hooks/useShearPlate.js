/**
 * @name: 剪切版封装
 * @author: kahu4
 * @date: 2023-10-30 14:06
 * @description：useShearPlate
 * @update: 2023-10-30 14:06
 * */
export const useShearPlate = () => {
    /**
     * 设置剪切版
     * @param text{string} 设置的内容
     * @param toast{string} 是否需要toast提示
     * @returns {Promise<unknown>}
     */
    function setData(text, toast = '') {
        return new Promise((resolve, reject) => {
            uni.setClipboardData({
                data:text,
                showToast:false,
                success:()=>{
                    if(toast){
                        uni.showToast({title:toast})
                    }
                    return resolve(true)
                },
                fail:(error)=> {
                    reject(error)
                }
            })
        })
    }

    /**
     * 获取当前剪切板内容
     * @returns {Promise<unknown>}
     */
    function getData() {
        return new Promise((resolve, reject) => {
            uni.getClipboardData({
                success: (res) => resolve(res),
                fail: (error) => reject(error)
            })
        })
    }

    return {
        setData,
        getData,
    }
}
