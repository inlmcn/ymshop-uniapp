import { computed, ref, unref } from "vue";
import { orderCancel, orderDelete } from "@/api/order";
import { useRouter } from "@/hooks/useRouter";
import { useInterface } from "@/hooks/useInterface";

const {toast} = useInterface();

export function useOrder(handleOrderInfo = () => {
}) {
    const checkOffCodeRef = ref()
    const modalRef = ref()
    const modalType = ref(0) // 0删除 1取消 2确认收货
    const {push} = useRouter()
    const modalTitle = computed(() => {
        const tipsArr = ['确认删除订单吗？', '确认取消订单吗？', '确认要确认收货吗？', "确认取消订单吗?"]
        return tipsArr[modalType.value]
    })

    const MODAL_TYPE = {
        DELETE: 0, // 删除
        CANCEL: 1, // 撤销
        CONFIRM: 2, // 确认收货
        CANCEL_CHECK: 3 // 核销订单取消
    }

    /**
     * 打开弹窗
     * @param {number} type 0删除记录 1撤销申请 2确认收货
     */
    function showModal(type) {
        modalType.value = type
        unref(modalRef).show()
    }

    /**
     * 确认取消订单
     * @returns {Promise<void>}
     */
    async function cancelOrder(item) {
        return new Promise((resolve, reject) => {
            orderCancel({
                id: item.orderId
            }).then(res => {
                toast({title: '已取消'});
                resolve()
            })
        })
    }

    /**
     * 确认删除订单
     * @returns {Promise<void>}
     */
    function deleteOrder(item) {
        return new Promise((resolve, reject) => {
            orderDelete({
                uni: item.orderId
            }).then(res => {
                toast({title: '删除成功'});
                resolve()
            })
        })
    }

    /**
     * 去评价
     */
    const toEvaluate = (unique, orderId, isRedirectTo) => {
        // 跳转到新的评论页面
        let config = {
            data: {
                unique: unique,
                orderId: orderId
            }
        }
        if (isRedirectTo) {
            config.type = 'redirectTo'
        }
        push({url: '/pages/comment/comment'}, config)
    }

    /**
     * 追评
     */
    const toFollowUp = (unique, orderId, oId) => {
        push({url: '/pages/comment/comment'}, {
            data: {
                unique: unique,
                orderId: orderId,
                oId: oId,
                followup: true
            }
        })
    }

    /**
     * 申请退款
     */
    const toSelectRefundGood = (id) => {
        push({url: '/pages/selectRefundGood/selectRefundGood'}, {
            data: {
                id: id
            }
        })
    }

    /**
     * 微信确认收货弹窗
     * @param transactionId
     * @returns {Promise<void>}
     */
    const showWsReceipt = (transactionId) => {
        return new Promise((resolve, reject) => {
            // #ifdef MP-WEIXIN
            // 如果没有transactionId，说明使用的不是微信支付，直接返回成功
            if (!transactionId) return resolve('success')
            //拉起确认收货组件
            if (wx.openBusinessView) {
                wx.openBusinessView({
                    businessType: 'weappOrderConfirm',
                    extraData: {
                        // merchant_id: '',//用户交易商户号
                        // merchant_trade_no: "",//商户订单号
                        transaction_id: transactionId //用户交易单号
                    },
                    success: (e) => {
                        resolve('success');
                    }, fail: e => {
                        reject(e)
                    }
                });
            } else {
                //引导用户升级微信版本
                uni.showToast({
                    title: "请升级微信版本",
                    duration: 3000,
                    icon: "none",
                });
                reject("请升级微信版本")
            }
            // #endif
            // #ifndef MP-WEIXIN
            resolve('success');
            // #endif
        })
    }

    const checkOffCode = (offCode) => {
        checkOffCodeRef.value.open(offCode)
    }

    return {
        MODAL_TYPE,
        modalRef,
        checkOffCodeRef,
        modalType,
        modalTitle,
        showModal,
        cancelOrder,
        deleteOrder,
        toEvaluate,
        toFollowUp,
        toSelectRefundGood,
        showWsReceipt,
        checkOffCode
    }
}
