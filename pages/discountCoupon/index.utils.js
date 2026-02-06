/**
 * @name: index.utli
 * @author: kahu4
 * @date: 2023-10-31 11:19
 * @description：index.utli
 * @update: 2023-10-31 11:19
 * */
import { computed, ref } from "vue";
import { onShow } from '@dcloudio/uni-app'
import { getCouponList, receiveByCdkey } from "@/api/coupon";
import { tabList } from "@/pages/discountCoupon/index.data";

export function useDiscountCoupon() {
    const tabCurrent = ref(0)
    const couponType = ref(1)
    const couponListLoading = ref(false)
    const couponList = ref([])
    const couponCounts = ref({ 1: 0, 2: 0, 3: 0 })
    const cdkey = ref('')

    const showEmpty = computed(() => couponList.value.length <= 0)

    const tabListWithCounts = computed(() => {
        return tabList.map(item => ({
            ...item,
            label: `${item.label}(${couponCounts.value[item.value] || 0})`
        }))
    })

    /**
     * tab发生改变
     * @param e
     */
    async function handleTabsChange(e) {
        couponList.value = []
        tabCurrent.value = e.index
        couponType.value = e.value
        await doGetCouponList()
    }

    /**
     * 获取优惠券列表
     */
    async function doGetCouponList() {
        try {
            couponListLoading.value = true
            const res = await getCouponList(couponType.value)
            couponList.value = res
            // Update current type count if changed
            couponCounts.value[couponType.value] = res.length
        } finally {
            couponListLoading.value = false
        }
    }

    /**
     * 获取所有计数
     */
    async function fetchAllCounts() {
        try {
            const [res1, res3] = await Promise.all([
                getCouponList(1),
                getCouponList(3)
            ])
            couponCounts.value[1] = res1.length
            couponCounts.value[3] = res3.length
        } catch (e) { }
    }


    /**
     * 兑换优惠券
     */
    async function handleRedeem() {
        if (!cdkey.value) {
            uni.showToast({
                title: '请输入兑换码',
                icon: 'none'
            })
            return
        }
        try {
            await receiveByCdkey(cdkey.value)
            uni.showToast({
                title: '兑换成功',
                icon: 'success'
            })
            cdkey.value = ''
            await fetchAllCounts()
            await doGetCouponList()
        } catch (e) {
            uni.showToast({
                title: e.message || '兑换失败',
                icon: 'none'
            })
        }
    }


    onShow(async () => {
        await fetchAllCounts()
        await doGetCouponList()
    })

    return {
        tabList: tabListWithCounts,
        tabCurrent,
        handleTabsChange,
        showEmpty,
        couponListLoading,
        couponList,
        doGetCouponList,
        fetchAllCounts,
        cdkey,
        handleRedeem
    }
}
