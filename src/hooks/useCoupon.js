// mouse.js
import { ref } from 'vue'
import { onReachBottom, onReady } from '@dcloudio/uni-app'
import cookie from "@/utils/cookie";
import { receiveACoupon } from "@/api/coupon";
import {useRouter} from "@/hooks/useRouter";
const {push} = useRouter()

export const useCoupon = getPage => {
    // 页码,默认为1
    const page = ref(1)

    // 页大小,默认为10
    const pageSize = ref(10)

    // 到底了
    const loadend = ref(false)

    // 加载中
    const loading = ref(false)

    // 加载中
    const startTime = ref(null)
    // 加载中
    const endTime = ref(null)

    // 是否有数据
    const listEmpty = ref(false)

    const dataList = ref([])

    const otherQuery = ref({})

    const handleGetDataList = async () => {
        if (loading.value || loadend.value) return

        loading.value = true
        // const res = await getPage({
        //     pageNo: page.value,
        //     pageSize: pageSize.value,
        //     ...otherQuery.value
        // })
        // const products = res.list
		
		const res = await getPage(otherQuery.value.clId)
		const products = res
        listEmpty.value = false
        console.log(products,'products')
        if (products) {
            if (products.length <= 0) {
                if (page.value === 1) {
                    listEmpty.value = true
                } else {
                    loadend.value = true
                }
            }
            dataList.value = dataList.value.concat(products)
        }
        loading.value = false
    }

    const handleRefresh = async () => {
        loadend.value = false
        loading.value = false
        page.value = 1
        dataList.value = []
        await handleGetDataList()
    }

    // 领取优惠券
    const receiveCoupon = async (id) => {
        var token = cookie.get('accessToken')
        if (token) {
            const res = await receiveACoupon(id)
            if(res){
                uni.showToast({
                    title: '领取成功',
                    icon: 'success'
                })
                dataList.value.map(item=>{
                    if(item.id === id){
                        item.obtainable = false
                        item.number --
                    }
                    return item
                })
            }
        } else {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            uni.navigateTo({
                url: '/pages/login/guid'
            })
        }
    }

    const goToProduct = (id) => {
        // push({url: '/pages/goodsList/goodsList'},{data: {couponId: id}})
		uni.switchTab({ url: '/root/product/index' })
    }

    onReachBottom(() => {
        if (loading.value || loadend.value) return
        page.value += 1
        handleGetDataList()
    })

    // 通过返回值暴露所管理的状态
    return {
        dataList,
        page,
        pageSize,
        loading,
        loadend,
        listEmpty,
        refresh: handleRefresh,
        otherQuery,
        receiveCoupon,
        goToProduct
    }
}
