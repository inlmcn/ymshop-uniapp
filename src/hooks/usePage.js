// mouse.js
import { ref } from 'vue'
import { onReachBottom, onReady } from '@dcloudio/uni-app'

// 请求唯一标识，用于防止数据不一致
let currentRequestId = 0

export const usePage = getPage => {
    // 页码,默认为1
    const page = ref(1)

    // 页大小,默认为10
    const limit = ref(10)

    // 关键字
    const keyword = ref('')

    // 类别
    const type = ref(-1)

    // 分类ID
    const sid = ref('')

    // 优惠券ID
    const couponId = ref('')

    // 是否新品,不为空的字符串即可
    const news = ref('')

    // 是否积分兑换商品
    const isIntegral = ref('')

    // 到底了
    const loadend = ref(false)

    // 加载中
    const loading = ref(false)

    // 是否有数据
    const listEmpty = ref(false)

    const dataList = ref([])

    const otherQuery = ref({})

    // 防抖计时器
    let debounceTimer = null

    const handleGetDataList = async () => {
        if (loading.value || loadend.value) return

        // 生成新的请求ID
        const requestId = ++currentRequestId
        
        loading.value = true
        try {
            // 构建请求参数并打印日志
            const requestParams = {
                page: page.value,
                limit: limit.value,
                keyword: keyword.value,
                type: type.value,
                sid: sid.value,
                couponId: couponId.value,
                news: news.value,
                isIntegral: isIntegral.value,
                ...otherQuery.value
            }
            
            console.log('API请求参数:', requestParams)
            
            const products = await getPage(requestParams)
            
            // 检查是否为最新请求，如果不是则忽略结果
            if (requestId !== currentRequestId) {
                console.log('请求已过期，忽略结果')
                return
            }
            
            listEmpty.value = false
            if (products) {
                const list = products.list && Array.isArray(products.list) ? products.list : products;
                if (Array.isArray(list)) {
                    if (list.length <= 0) {
                        if (page.value === 1) {
                            listEmpty.value = true;
                        } else {
                            loadend.value = true;
                        }
                    } else {
                        dataList.value = dataList.value.concat(list);
                    }
                }
            }
        } catch (error) {
            // 只处理最新请求的错误
            if (requestId !== currentRequestId) {
                console.log('错误来自过期请求，忽略')
                return
            }
            console.error('获取数据列表失败:', error)
            // 可以在这里添加错误提示
        } finally {
            // 只在最新请求完成时更新loading状态
            if (requestId === currentRequestId) {
                loading.value = false
            }
        }
    }

    const handleRefresh = async () => {
        // 清除防抖计时器
        if (debounceTimer) {
            clearTimeout(debounceTimer)
            debounceTimer = null
        }
        
        // 增加请求ID，使之前的请求失效
        currentRequestId++
        
        loadend.value = false
        loading.value = false
        page.value = 1
        dataList.value = []
        await handleGetDataList()
    }

    // 防抖刷新方法
    const debounceRefresh = (delay = 300) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }
        debounceTimer = setTimeout(() => {
            handleRefresh()
        }, delay)
    }

    onReady(() => {
        // handleGetDataList()
    })

    onReachBottom(() => {
        if (loading.value || loadend.value) return
        page.value += 1
        handleGetDataList()
    })

    // 通过返回值暴露所管理的状态
    return {
        type,
        dataList,
        page,
        limit,
        keyword,
        loading,
        loadend,
        listEmpty,
        news,
        sid,
        couponId,
        refresh: handleRefresh,
        debounceRefresh,
        otherQuery
    }
}
