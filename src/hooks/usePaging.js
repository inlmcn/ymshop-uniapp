import { ref } from "vue";
import { onLoad, onReachBottom } from "@dcloudio/uni-app";

/**
 * 使用分页
 * @param options
 * @param {Function} options.request 加载数据的api
 * @param {Boolean} options.load 是否需要初始加载
 */
export function usePaging(options) {
    // 分页参数
    const page = ref({
        pageNo: 1,
        pageSize: 10
    })

    // 其他参数
    const otherParams = ref({})

    // 数据列表
    const list = ref([])
    // 数据总量
    const total = ref(0)
    // 是否正在加载
    const loading = ref(false)

    /**
     * 获取列表
     * @return {Promise<void>}
     */
    async function getList() {
        if (loading.value) return
        try {
            loading.value = true
            const res = await options.request({
                ...page.value,
                ...otherParams.value
            })
            list.value = [...list.value, ...res.list]
            total.value = res.total
        } finally {
            loading.value = false
        }
    }

    /**
     * 下一页
     * @return {Promise<void>}
     */
    async function pageAdd() {
        if (list.value.length >= total.value) return
        page.value.pageNo++
        await getList()
    }

    /**
     * 重置分页
     * @return {Promise<void>}
     */
    async function refreshPage() {
        page.value.pageNo = 1
        total.value = 0
        list.value = []
        await getList()
    }

    /**
     * 重置所有参数
     * @return {Promise<void>}
     */
    async function refreshAllParams() {
        otherParams.value = {}
        page.value.pageNo = 1
        total.value = 0
        list.value = []
        await getList()
    }

    /**
     * 触底加载
     */
    onReachBottom(async () => {
        // 当total不为0 且 列表数据少于total数据才正常触底
        if (total.value !== 0 && list.value.length < total.value) {
            await pageAdd()
        }
    })

    onLoad(async () => {
        if (options.load) {
            await refreshPage()
        }
    })

    return {
        page,
        otherParams,
        list,
        total,
        loading,
        getList,
        pageAdd,
        refreshPage,
        refreshAllParams
    }
}
