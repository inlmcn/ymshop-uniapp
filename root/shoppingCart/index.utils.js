/**
 * @name: 购物车相关操作方法
 * @author: kahu4
 * @date: 2023-11-06 15:03
 * @description：index.utils
 * @update: 2023-11-06 15:03
 * */
import { computed, nextTick, ref, unref } from "vue";
import { changeCartSku, computeSelectInfo, deleteCartByIds, getCartList, updateCartNumber } from "@/api/cart";
import { onShow } from '@dcloudio/uni-app'
import _ from "lodash-es";
import { useInterface } from "@/hooks/useInterface";
import { useRouter } from "@/hooks/useRouter";
import { getProductDetail } from "@/api/product";


/**
 * 购物车数据
 */
export function useCartData() {
    const cartListLoading = ref(false)
    const cartList = ref([])

    const showEmpty = computed(() => cartList.value.length <= 0)

    /**
     * 获取购物车列表
     * @returns {Promise<void>}
     */
    async function doGetCartList() {
        try {
            cartListLoading.value = true
            const res = await getCartList()
            cartList.value = res?.valid ?? []
        } finally {
            cartListLoading.value = false
        }
    }

    onShow(async () => {
        await doGetCartList()
    })

    return {
        showEmpty,
        cartListLoading,
        cartList,
        doGetCartList
    }
}

/**
 * 用户操作相关
 */
export function useCartOption(options) {
    const {cartList, doGetCartList} = options
    const {toast} = useInterface()
    const {push} = useRouter()

    const manage = ref(false)
    const manageStr = computed(() => {
        return manage.value ? '取消' : '管理'
    })

    const shoppingSelect = ref([]) // 选中数据
    const shoppingSelectAll = ref(false) // 是否全选

    /**
     * 用户单选
     * @param value
     */
    async function handleSingleSelect(value) {
        shoppingSelectAll.value = value.length === cartList.value.length
        setTimeout(async () => {
            await computeSelectInfoByShoppingSelect()
        }, 100)
    }

    /**
     * 用户全选
     * @param e
     * @returns {Promise<void>}
     */
    async function handleSelectAll(e) {
        shoppingSelect.value = !!e ? cartList.value.map(item => item.id) : []
        shoppingSelectAll.value = e
        await computeSelectInfoByShoppingSelect()
    }

    const statisticsInfo = ref(undefined) // 统计信息

    /**
     * 根据shoppingSelect去计算选中数据
     * @returns {Promise<void>}
     */
    async function computeSelectInfoByShoppingSelect() {
        if (unref(shoppingSelect).length <= 0) return statisticsInfo.value = void (0)
        const res = await computeSelectInfo({
            cartId: unref(shoppingSelect).join(','),
            orderType: 1,
            useIntegral: false
        });
        statisticsInfo.value = res.priceGroup
    }

    /**
     * 重新设置选中信息
     * @returns {Promise<void>}
     */
    async function resetUserSelect() {
        shoppingSelect.value = []
        shoppingSelectAll.value = false
        await computeSelectInfoByShoppingSelect()
    }

    let delItem

    /**
     * 打开删除弹窗
     * @param modalRef
     * @param toDelItem 有就代表单独删除
     * @returns {*}
     */
    function openDelModal(modalRef, toDelItem = undefined) {
        if (!toDelItem && unref(shoppingSelect).length <= 0) return toast({title: '请勾选需要删除的商品'})
        delItem = toDelItem
        unref(modalRef).show()
    }

    /**
     * 删除数据
     * @returns {Promise<void>}
     */
    async function doDelete() {
        if (delItem) {
            await deleteCartByIds({
                ids: [delItem.id]
            })
        } else {
            await deleteCartByIds({
                ids: shoppingSelect.value
            })
        }
        delItem = undefined
        await doGetCartList()
        await resetUserSelect()
    }

    /**
     * 取消删除
     */
    function doDelCancel() {
        delItem = undefined
    }

    /**
     * 提交订单
     * @returns {*}
     */
    function submitOrder() {
        if (unref(shoppingSelect).length <= 0) return toast({title: '请勾选需要购买的商品'})
        push({url: '/pages/submitOrder/submitOrder'}, {
            data: {cartId: shoppingSelect.value.toString()}
        })
    }

    return {
        manage,
        manageStr,
        shoppingSelect,
        shoppingSelectAll,
        statisticsInfo,
        handleSingleSelect,
        handleSelectAll,
        computeSelectInfoByShoppingSelect,
        openDelModal,
        doDelete,
        doDelCancel,
        submitOrder
    }
}


/**
 * 更改sku
 */
export function useSku() {
    const {toast} = useInterface()
    const openSkuProductId = ref(undefined) // 当前选中的sku商品id
    const openSkuSkuId = ref(undefined) // 当前选中sku的sku id
    const openSkuCartId = ref(undefined)
    const openProductItem = ref(undefined)

    /**
     * 获取商品详情
     * @param data
     * @param data.skuId skuId
     * @param data.productId productId
     * @return {Promise<void>}
     */
    const handleGetDetail = async (data) => {
        openProductItem.value = await getProductDetail(data);
    };

    /**
     * 打开sku选择器
     * @param item
     * @param modalRef
     */
    async function handleOpenSkuSelect(item, modalRef) {
        await handleGetDetail({productId: item.productId})
        openSkuSkuId.value = item.productInfo.attrInfo.id
        openSkuProductId.value = item.productId
        openSkuCartId.value = item.id
        await nextTick(() => {
            modalRef.open(item.cartNum)
        })
    }

    /**
     * 关闭sku选择器
     */
    function handleCloseSkuSelect() {
        openSkuProductId.value = openSkuCartId.value = void (0)
    }

    async function handleSubmitSkuSelect(e, modalRef, cartList, func, doGetCartList) {
        if (!openSkuProductId.value) return
        const {store, num} = e
        await changeCartSku({
            id: openSkuCartId.value,
            productId: openSkuProductId.value,
            productAttrUnique: store.unique
        })
        if (typeof func === 'function') {
            const find = cartList.find(item => item.id === openSkuCartId.value);
            await func({detail: {value: num}}, find)
        }
        setTimeout(async () => {
            await doGetCartList()
            toast({title: '修改成功', icon: 'success'})
            handleCloseSkuSelect()
        }, 400)
    }

    return {
        openProductItem,
        openSkuSkuId,
        openSkuProductId,
        handleOpenSkuSelect,
        handleCloseSkuSelect,
        handleSubmitSkuSelect
    }
}


/**
 * 更改购物车数量
 */
export function useCartNumber(options) {
    const {toast} = useInterface()

    /**
     * 用户手动输入改变数量
     * @param e
     * @param item
     * @returns {*}
     */
    function handleCartNumberInputChange(e, item) {
        const value = parseInt(e.detail.value.toString().replace(/^0+/, ''))
        if (value <= 0) {
            item.cartNum = 1
            toast({title: '至少选一件哦~'})
            return
        }
        if (value > item.trueStock) {
            item.cartNum = item.productInfo.stock
            toast({title: '超出库存啦~'})
            return
        }
        nextTick(() => {
            item.cartNum = value
            doCartNumberChangeRequest(item)
        })
    }

    /**
     *  购买数量验证
     */
    function cartNumberInput(e, item) {
        const pattern = /^0+|[.]*/g;
        nextTick(() => {
            item.cartNum = e.detail.value.replace(pattern, '');
        })
    }

    /**
     * 用户点击购物车+-改变数量
     * @param item
     * @param type
     * @returns {*}
     */
    function handleCartNumberChange(item, type = 'plus') {
        if (type === 'plus') {
            if (item.cartNum + 1 > item.trueStock) {
                item.cartNum = item.trueStock
            } else {
                item.cartNum += 1
            }

        } else {
            if (item.cartNum <= 1) {
                item.cartNum = 1
            } else {
                item.cartNum -= 1
            }
        }
        doCartNumberChangeRequest(item)
    }

    /**
     * 请求改变后台用户购物车数据
     * @param item
     * @returns {Promise<void>}
     */
    const doCartNumberChangeRequest = _.debounce(async (item) => {
        await updateCartNumber({
            id: item.id,
            number: item.cartNum
        })
        options && options.afterChange && await options.afterChange()
    }, 300)

    return {
        handleCartNumberInputChange,
        handleCartNumberChange,
        cartNumberInput
    }
}
