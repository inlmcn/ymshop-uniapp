/**
 * @name: 封装uni跳转
 * @author: kahu4
 * @date: 2023-10-30 10:52
 * @description：useRouter.js
 * @update: 2023-10-30 10:52
 * */
export const PARAMS_KEY = 'details' // 路由参数key

/**
 * 封装Router
 */
export const useRouter = () => {
    /**
     * 原uni.navigateTo，uni.redirectTo，uni.reLaunch方法封装
     * 使用此方法的跳转获取参数必须使用本hooks的getParams方法获取路由参数
     * 注意：2.8.9+以后版本可以使用events参数传递一个方法对象和新打开的页面建立一个channel通讯，getOpenerEventChannel获取到这个channel
     * @docs: https://uniapp.dcloud.net.cn/api/router.html#navigateto
     * @param {object} options 原始参数
     * @param {any} config 配置参数
     * @param {'navigateTo'|'redirectTo'|'reLaunch'} config.type 跳转类型
     * @param {object} config.data 跳转参数
     * @param {number} config.timeout 延时时间
     * type：跳转类型，默认navigateTo ; data：跳转参数，默认空对象 ; timeout：跳转延时，默认0
     * @returns {Promise<boolean>}
     */
    function push(options = {}, config = {}) {
        // 合并默认参数
        config = {
            type: 'navigateTo',
            data: {},
            timeout: 0,
            ...config
        }
        checkUrl(options)
        processingParameter(options, config.data)
        const funcMap = {
            navigateTo: uni.navigateTo,
            redirectTo: uni.redirectTo,
            reLaunch: uni.reLaunch,
            switchTab: uni.switchTab,
        }
        return new Promise((resolve, reject) => {
            const pushTab = () => funcMap[config.type]({
                ...options,
                success: () => {
                    resolve(true)
                },
                fail: (error) => {
                    reject(error)
                }
            })
            if (config.timeout !== 0) {
                setTimeout(() => {
                    pushTab()
                }, config.timeout)
            } else {
                pushTab()
            }
        })
    }

    /**
     * 原uni.switchTab方法封装
     * @param options{any}原始参数
     * @param timeout{number}延时跳转时间默认0
     * @returns {Promise<boolean>}
     */
    function pushToTab(options, timeout = 0) {
        checkUrl(options)
        return new Promise((resolve, reject) => {
            const switchTab = () => uni.switchTab({
                ...options,
                success: () => {
                    resolve(true)
                },
                fail: (error) => {
                    reject(error)
                }
            })
            if (timeout !== 0) {
                setTimeout(() => {
                    switchTab()
                }, timeout)
            } else {
                switchTab()
            }
        })
    }

    /**
     * 返回
     * @param {object} options 默认参数对象
     * @param {number} timeout 延时跳转
     * @returns {Promise<unknown>}
     */
    function goBack(options, timeout = 0) {
        return new Promise((resolve, reject) => {
            const back = () => {
                const currentPageList = getCurrentPageList();
                // 如果页面栈，说明只有一个页面，直接重定向到首页
                if (currentPageList.length === 1) {
                    pushToTab({url: '/root/index/index'})
                    return
                }
                uni.navigateBack({
                    ...options,
                    success: () => {
                        uni.$emit('update', {msg: '页面更新'})
                        resolve(true)
                    },
                    fail: (error) => {
                        reject(error)
                    }
                });
            }
            if (timeout !== 0) {
                setTimeout(() => {
                    back()
                }, timeout)
            } else {
                back()
            }
        })
    }

    /**
     * 获取跳转页参数解析对象
     * @param {object} options onLoad函数的原始参数
     * @returns {object}
     */
    function getParams(options) {
        if (typeof options !== 'object') return {}
        if (!options[PARAMS_KEY]) return {}
        console.log('参数原始-----', options[PARAMS_KEY])
        // #ifdef MP-WEIXIN
        // console.log(typeof options[PARAMS_KEY],options[PARAMS_KEY],decodeURIComponent(options[PARAMS_KEY]))
        // #endif
        return JSON.parse(decodeURIComponent(options[PARAMS_KEY]));
    }

    /**
     * 从url获取跳转页参数解析对象
     * @returns {object}
     */
    function getUrlParams() {
        let pageArr = getCurrentPages();//获取应用页面栈
        let currentPagePath = pageArr[pageArr.length - 1];//获取当前页面信息
        const options = currentPagePath.options ? currentPagePath.options : currentPagePath.$page.options
        if (!options[PARAMS_KEY]) return {}
        return JSON.parse(decodeURIComponent(options[PARAMS_KEY]));
    }

    /**
     * 预加载页面
     * @param {string} url 路径
     * @returns {Promise<boolean>}
     */
    function preLoad(url) {
        return new Promise((resolve, reject) => {
            uni.preloadPage({
                url,
                success: () => {
                    resolve(true)
                },
                fail: (error) => {
                    reject({
                        message: `${ url }预加载失败，请检查路径`,
                        error
                    })
                }
            });
        })
    }

    /**
     * 获取当前页面对象
     * @returns {
     * {
     *      prePage: (Page.PageInstance<AnyObject, {}>|{}|null),
     *      currentPages: Array<Page.PageInstance<AnyObject, {}> & {}>,
     *      nowPage: (Page.PageInstance<AnyObject, {}>|{}|null)}
     * }
     */
    function getCurrentPage() {
        const currentPages = getCurrentPages();
        return {
            currentPages,
            prePage: currentPages.length - 2 >= 0 ? currentPages[currentPages.length - 2] : null,
            nowPage: currentPages.length - 1 >= 0 ? currentPages[currentPages.length - 1] : null,
        };
    }

    /**
     * 获取所有页面对象
     * @returns {Array<Page.PageInstance<AnyObject, {}> & {}>}
     */
    function getCurrentPageList() {
        return getCurrentPages()
    }

	function toHome(){
		uni.switchTab({ url: '/root/index/index' })
	}

    return {
        push,
        pushToTab,
        goBack,
        getParams,
        getUrlParams,
        preLoad,
        getCurrentPage,
        getCurrentPageList,
		toHome
    }
}


/**
 * 校验URL
 * @param {object} options
 */
const checkUrl = (options) => {
    if (!options.url) throw new Error('options 必须携带url参数')
}

/**
 * 处理参数
 * 如果有参数的情况，使用encodeURIComponent + JSON.stringify格式化掉
 * @param {object} options
 * @param {object} data
 */
const processingParameter = (options, data) => {
    if (Object.keys(data).length > 0) {
        options.url = `${ options.url }?${ PARAMS_KEY }=${ encodeURIComponent(JSON.stringify(data)) }`
    }
    return options
}
