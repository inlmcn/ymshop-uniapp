/**
 * @name: useInterface
 * @author: kahu4
 * @date: 2023-10-30 11:56
 * @description：封装uni app界面相关接口，利于维护
 * @update: 2023-10-30 11:56
 * */

/**
 * 封装uni app界面相关接口，利于维护
 * @returns {
 *  {
 *         toast:Function,
 *         loading:Function,
 *         hideLoading:Function,
 *         setNavTitle:Function,
 *         setNavBgColor:Function,
 *         scrollTo:Function,
 *         pageResize:Function,
 *         unPageResize:Function,
 *         startPullDownRefresh:Function,
 *         stopPullDownRefresh:Function,
 *         createSelectorQuery:Function,
 *         createObserver:Function,
 *         createMediaObserver:Function,
 *         createAnimation:Function,
 *         getMenuButtonInfo:Function
 *  }
 * }
 */
export const useInterface = () => {
    /**
     * 使用uni的toast
     * @param options
     * @returns {Promise<any>}
     */
    function toast(options) {
        return new Promise((resolve, reject) => {
            uni.showToast({
                icon: 'none', mask: false, ...options, success: () => resolve(true), fail: (error) => reject(error)
            })
        })
    }

    /**
     * 使用uni的loading
     * @param options
     * @returns {Promise<unknown>}
     */
    function loading(options = {}) {
        return new Promise((resolve, reject) => {
            uni.showLoading({
                icon: 'none', mask: true, ...options, success: () => resolve(true), fail: (error) => reject(error)
            })
        })
    }

    function hideLoading() {
        uni.hideLoading()
    }

    /**
     * 动态设置当前页面的标题
     * @param title
     * @returns {Promise<unknown>}
     */
    function setNavTitle(title) {
        return new Promise((resolve, reject) => {
            uni.setNavigationBarTitle({
                title, success: () => resolve(true), fail: (error) => reject(error)
            })
        })
    }

    /**
     * 设置页面导航条颜色。如果需要进入页面就设置颜色，请延迟执行，防止被框架内设置颜色逻辑覆盖
     * @param options
     * @param timeout
     * @returns {Promise<unknown>}
     */
    function setNavBgColor(options, timeout = 500) {
        return new Promise((resolve, reject) => {
            const setNavigationBarColor = () => uni.setNavigationBarColor({
                ...options, success: () => resolve(true), fail: (error) => reject(error)
            })
            if (timeout === 0) {
                setNavigationBarColor()
            } else {
                setTimeout(() => {
                    uni.setNavigationBarColor({
                        ...options, success: () => resolve(true), fail: (error) => reject(error)
                    })
                }, timeout)
            }

        })
    }

    /**
     * 页面滚动到元素或者指定位置
     * @param options
     * @returns {Promise<unknown>}
     */
    function scrollTo(options) {
        return new Promise((resolve, reject) => {
            uni.pageScrollTo({
                ...options, success: () => resolve(true), fail: (error) => reject(error)
            })
        })
    }

    /**
     * 监听窗口尺寸变化事件
     * 如App端设置软键盘弹出方式为adjustResize ，则在键盘弹出时，会触发此事件。
     * 横竖屏切换时，会触发此事件。
     * @param callback
     */
    function pageResize(callback) {
        uni.onWindowResize(callback)
    }

    /**
     * 取消监听窗口尺寸变化事件
     * callback为调用pageResize时传入的callback
     * @param callback
     */
    function unPageResize(callback) {
        uni.offWindowResize(callback)
    }

    /**
     * 逻辑触发页面下拉刷新
     * page.json相关字段 "enablePullDownRefresh": true
     * @returns {Promise<unknown>}
     */
    function startPullDownRefresh() {
        return new Promise((resolve, reject) => {
            uni.startPullDownRefresh({
                success: () => resolve(true), fail: (error) => reject(error)
            })
        })
    }

    /**
     * 停止下拉刷新
     */
    function stopPullDownRefresh() {
        uni.stopPullDownRefresh()
    }

    /**
     * 返回uni app的SelectorQuery 对象实例
     * @docs https://uniapp.dcloud.net.cn/api/ui/nodes-info.html
     * @returns {UniNamespace.SelectorQuery}
     */
    function createSelectorQuery() {
        return uni.createSelectorQuery()
    }

    /**
     * 创建并返回一个 IntersectionObserver 对象实例。
     * @param _this
     * @param options
     * @docs https://uniapp.dcloud.net.cn/api/ui/intersection-observer.html
     * @returns {UniNamespace.IntersectionObserver}
     */
    function createObserver(_this, options) {
        return uni.createIntersectionObserver(_this, options)
    }

    /**
     * 创建并返回一个 MediaQueryObserver 对象实例。
     * @param _this
     * @docs https://uniapp.dcloud.net.cn/api/ui/media-query-observer.html
     * @returns {UniNamespace.MediaQueryObserver}
     */
    function createMediaObserver(_this) {
        return uni.createMediaQueryObserver(_this)
    }

    /**
     * 创建一个动画实例 animation。调用实例的方法来描述动画。最后通过动画实例的export方法导出动画数据传递给组件的animation属性。
     * @param options
     * @docs https://uniapp.dcloud.net.cn/api/ui/animation.html
     * @returns {UniNamespace.Animation}
     */
    function createAnimation(options) {
        return uni.createAnimation(options)
    }

    /**
     * 小程序获取菜单按钮信息
     * @returns {UniNamespace.GetMenuButtonBoundingClientRectRes}
     */
    function getMenuButtonInfo() {
        return uni.getMenuButtonBoundingClientRect()
    }

    return {
        toast,
        loading,
        hideLoading,
        setNavTitle,
        setNavBgColor,
        scrollTo,
        pageResize,
        unPageResize,
        startPullDownRefresh,
        stopPullDownRefresh,
        createSelectorQuery,
        createObserver,
        createMediaObserver,
        createAnimation,
        getMenuButtonInfo
    }
}
