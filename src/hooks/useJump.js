/**
 * @name: useJump
 * @author: kahu4
 * @date: 2024-01-16 11:12
 * @description：跳转
 * @update: 2024-01-16 11:12
 * */
import { useRouter } from "@/hooks/useRouter";

const {push, pushToTab} = useRouter()

export function useJump() {
    // ============================= global =============================================
    const goWebview = (data = {}) => {
        push({
            url: '/pages/webview/index',
        }, {
            data
        })
    }

    const goHome = (data = {}) => {
        pushToTab({url: '/root/index/index'})
    }

    // ============================= 活动 start ==============================================
    // 拼团
    const goGroupBy = (data = {}) => {
        push({
            url: '/views/activity/groupBy/index',
        }, {
            data
        })
    }

    // 拼团详情
    const goGroupByDetail = (data = {}) => {
        push({
            url: '/views/activity/groupBy/detail',
        }, {
            data
        })
    }

    // 订单核销
    const goAfterVerification = (data = {}) => {
        push({
            url: '/views/activity/afterVerification/index',
        }, {
            data
        })
    }
    // ============================= 活动 end ==============================================


    // ============================= 分销 start ==============================================
    // 分销中心
    const goDistribution = (data = {}, redirect = false) => {
        push({
            url: '/views/distribution/center/index',
        }, {
            data,
            type: redirect ? 'redirectTo' : 'navigateTo'
        })
    }

    // 申请经销商
    const goDistributionApplyFor = (data = {}, redirect = false) => {
        push({
            url: '/views/distribution/applyFor/index',
        }, {
            data,
            type: redirect ? 'redirectTo' : 'navigateTo'
        })
    }

    // 我的团队
    const goDistributionTeam = (data = {}, redirect = false) => {
        push({
            url: '/views/distribution/team/index',
        }, {
            data,
            type: redirect ? 'redirectTo' : 'navigateTo'
        })
    }

    // 佣金明细
    const goDistributionCommission = (data = {}, redirect = false) => {
        push({
            url: '/views/distribution/commission/index',
        }, {
            data,
            type: redirect ? 'redirectTo' : 'navigateTo'
        })
    }

    // 分销订单
    const goDistributionOrder = (data = {}, redirect = false) => {
        push({
            url: '/views/distribution/order/index',
        }, {
            data,
            type: redirect ? 'redirectTo' : 'navigateTo'
        })
    }

    // 推广商品
    const goDistributionGoods = (data = {}, redirect = false) => {
        push({
            url: '/views/distribution/goods/index',
        }, {
            data,
            type: redirect ? 'redirectTo' : 'navigateTo'
        })
    }
    // 我的资料
    const goDistributionDatum = (data = {}, redirect = false) => {
        push({
            url: '/views/distribution/datum/index',
        }, {
            data,
            type: redirect ? 'redirectTo' : 'navigateTo'
        })
    }
    // ============================= 分销 end ==============================================

    // ============================= 账户模块 start ==============================================
    // 签到
    const goSignIn = (data = {}) => {
        push({
            url: '/views/account/signIn/index',
        }, {
            data
        })
    }

    // 去会员中心
    const goMemberCenter = (data = {}) => {
        push({
            url: '/views/member/index/index',
        }, {
            data
        })
    }

    // 积分
    const goIntegral = (data = {}) => {
        push({
            url: '/views/account/integral/index',
        }, {
            data
        })
    }

    // 去提现
    const goWithdraw = (data = {}) => {
        push({
            url: '/views/account/withdraw/index',
        }, {
            data
        })
    }

    // 去充值
    const goRecharge = (data = {}) => {
        push({
            url: '/views/account/recharge/index',
        }, {
            data
        })
    }
    // 去余额
    const goBalance = (data = {}) => {
        push({
            url: '/views/account/balance/index',
        }, {
            data
        })
    }
    const goCoupon = (data = {}) => {
        push({
            url: '/pages/discountCoupon/index',
        }, {
            data
        })
    }
    // ============================= 账户模块 end ==============================================

    return {
        goHome,
        goWebview,

        goGroupBy,
        goGroupByDetail,

        goDistribution,
        goDistributionApplyFor,
        goDistributionTeam,
        goDistributionCommission,
        goDistributionOrder,
        goDistributionGoods,
        goDistributionDatum,

        goSignIn,
        goMemberCenter,
        goIntegral,
        goWithdraw,
        goRecharge,
        goBalance,
        goCoupon
    }
}
