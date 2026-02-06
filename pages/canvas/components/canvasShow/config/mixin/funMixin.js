import sendReqMixin from './sendReqMixin'
import { useRouter } from "@/hooks/useRouter";
import { useService } from "@/hooks/useService";

export default function () {
    const {sendReq} = sendReqMixin()
    const {push} = useRouter()

    //  请求数据前 请求完再显示所有组件
    function beforeGetData() {
        if (typeof uni !== 'undefined') {
            uni.getStorage({
                key: 'sendNum',
                success: function (res) {
                    const sendNum = res.data
                    uni.setStorage({key: 'sendNum', data: parseInt(sendNum) + 1})
                },
            })
        } else {
            const sendNum = localStorage.getItem('sendNum')
            localStorage.setItem('sendNum', parseInt(sendNum) + 1)
        }
    }

    //  请求数据后
    function afterGetData() {
        if (typeof uni !== 'undefined') {
            uni.getStorage({
                key: 'sendNum',
                success: function (res) {
                    const sendNum = res.data
                    uni.setStorage({key: 'sendNum', data: parseInt(sendNum) - 1})
                },
            })
        } else {
            const sendNum = localStorage.getItem('sendNum')
            localStorage.setItem('sendNum', parseInt(sendNum) - 1)
        }
    }

    // 判断url
    function jumpLink(linkObj) {
        console.log(linkObj, 'linkObj')
        switch (linkObj.type){
            case 'basePage':
                switch (linkObj.value.value){
                    case 'home':
                        uni.navigateTo({
                            url: `/root/index/index`
                        })
                        break
                    case 'classify':
                        uni.navigateTo({
                            url: `/root/goodsCategory/goodsCategory`
                        })
                        break
                    case 'cart':
                        uni.navigateTo({
                            url: `/root/shoppingCart/shoppingCart`
                        })
                        break
                    case 'my':
                        uni.navigateTo({
                            url: `/root/user/user`
                        })
                        break
                    case 'myOrder':
                        push({url: '/pages/orderList/orderList'}, {data: {type: -1}})
                        break
                    case 'afterSales':
                        push({url: '/pages/refundList/refundList'}, {data: {type: -1}})
                        break
                    case 'signIn':
                        push({
                            url: '/views/account/signIn/index',
                        })
                        break
                    case 'vip':
                        push({url: '/views/member/index/index'})
                        break
                    case 'recharge':
                        push({
                            url: '/views/account/recharge/index',
                        })
                        break
                    case 'footprints':
                        push({
                            url: '/pages/footprint/footprint',
                        })
                        break
                    case 'collect':
                        push({
                            url: '/pages/collect/collect',
                        })
                        break
                    case 'promotion':
                        push({
                            url: '/views/distribution/center/index',
                        })
                        break
                    case 'customerService':
                        const {getServiceData, openService} = useService();
                        getServiceData()
                        openService()
                        break
                    case 'addressList':
                        push({
                            url: '/pages/address/address',
                        })
                        break
                    case 'orderVerification':
                        push({
                            url: '/views/activity/afterVerification/index',
                        })
                        break
                    case 'myProfile':
                        push({
                            url: '/pages/userInfo/index',
                        })
                        break
                }
                break
            case 'marketingPage':
                switch (linkObj.value.value){
                    case 'productCenter':
                        jumpProList()
                        break
                    case 'seckillArea':
                        jumpSeckills()
                        break
                    case 'groupArea':
                        jumpGroupWorks()
                        break
                    case 'discountArea':
                        jumpDiscount()
                        break
                    case 'integral':
                        jumpIntegral()
                        break
                    case 'coupon':
                        jumpCoupon()
                        break
                }
                break
            case 'microPage':
                push({
                    url: '/pages/canvas/canvas'
                }, {
                    data: {id: linkObj.value.id}
                })
                break
            case 'goodsCategory':
                jumpCategory(linkObj.value.id)
                break
            case 'goods':
            case 'groupGoods':
            case 'seckillGoods':
            case 'discountGoods':
                jumpProductDetail(linkObj.value)
                break
            case 'customLink':
                push({
                    url: linkObj.value,
                })
                break
        }
    }

    // 跳转到搜索
    function toSearch(key) {
        push({
            url: '/pages/search/search'
        }, {
            data: {key}
        })
    }

    // 跳转到类别主页
    function jumpCategory(id) {
        push({
            url: '/pages/goodsList/goodsList'
        }, {
            data: {sid: id}
        })
    }

    // 跳转到优惠券相关产品列表
    const jumpCouponProduct = (id) => {
        push({url: '/pages/goodsList/goodsList'},{data: {couponId: id}})
    }

    // 跳转到产品列表
    function jumpProList(item) {
        push({
            url: '/pages/goodsList/goodsList'
        })
    }

    // 跳转到店铺主页
    function jumpStore(item) {
        uni.navigateTo({
            url: `/pages_category_page1/store/index?storeId=${ item.shopId }`
        })
    }

    // 跳转到商品详情
    function jumpProductDetail(item) {
        push({url: '/pages/goodsDetail/goodsDetail'}, {data: {id:item.id,skuId:item.skuId}})
    }

    // 跳转到秒杀专区
    function jumpSeckills() {
        push({url: '/pages/seckilling/seckilling'})
    }

    // 跳转到拼团专区
    function jumpGroupWorks() {
        push({url: '/pages/groupBuy/groupBuy'})
    }

    // 跳转到折扣专区
    function jumpDiscount() {
        push({url: '/pages/discount/discount'})
    }

    // 跳转到积分商城
    function jumpIntegral() {
        push({url: '/pages/integral/integral'})
    }

    // 跳转到领券中心
    function jumpCoupon() {
        push({url: '/pages/coupon/coupon'})
    }

    // 跳转到会员专区
    function jumpVip() {
        uni.navigateTo({
            url: '/pages_category_page1/memberCenter/activityList',
            success: res => {
            }, fail: () => {
            }, complete: () => {
            }
        })
    }

    // 跳转组合支付
    function jumpCombination(item) {
        if (item.priceId) {
            uni.navigateTo({
                url: '/pages_category_page1/goodsModule/combination?priceId=' + item.priceId
            })
        } else {
            uni.showToast({
                title: '暂无活动',
                icon: "none"
            });
        }
    }

    // 跳转到公告详情
    function jumpNoticeDetail(item) {
        uni.navigateTo({
            url: '/pages_category_page2/userModule/messageDetail?noticeId=' + item.noticeId
        })
    }

    // 跳转到直播列表
    function jumpLive() {
        uni.navigateTo({
            url: '/pages_category_page2/livePage/index'
        })
    }

    // 加入购物车
    function addCart(id) {
        console.log(id)
    }

    return {
        beforeGetData,
        afterGetData,
        toSearch,
        sendReq,
        jumpLink,
        jumpCategory,
        jumpStore,
        jumpProductDetail,
        jumpSeckills,
        jumpGroupWorks,
        jumpDiscount,
        jumpVip,
        jumpNoticeDetail,
        addCart,
        jumpProList,
        jumpLive,
        jumpCombination,
        jumpCoupon,
        jumpCouponProduct
    }
}
