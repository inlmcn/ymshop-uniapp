import {
    distributionGoods,
    distributionMoney,
    distributionOrder,
    distributionShare,
    distributionTeam,
    distributionUser, productCartIcon, shopIcon
} from "@/utils/images";
import { useJump } from "@/hooks/useJump";

const {
    goDistribution,
    goDistributionApplyFor,
    goDistributionTeam,
    goDistributionCommission,
    goDistributionOrder,
    goDistributionGoods,
    goDistributionDatum,
    goHome
} = useJump();

export const distributionCenterInfoList = [
    {
        label: '总收益（元）',
        field: 'addUpWages'
    },
    {
        label: '待入账佣金（元）',
        field: 'refuseAmount'
    },
    {
        label: '已入账佣金（元）',
        field: 'amount'
    }
]

export const distributionCenterCardList = [
    {
        label: '我的团队',
        path: goDistributionTeam,
        icon: distributionTeam
    },
    {
        label: '佣金明细',
        path: goDistributionCommission,
        icon: distributionMoney
    },
    {
        label: '分销订单',
        path: goDistributionOrder,
        icon: distributionOrder
    },
    {
        label: '推广商品',
        path: (data) => goDistributionGoods({distributionId: data.id}),
        icon: distributionGoods
    },
    {
        label: '邀请海报',
        path: 'share',
        icon: distributionShare
    },
    {
        label: '我的资料',
        path: goDistributionDatum,
        icon: distributionUser
    },
    {
        label: '商城首页',
        path: goHome,
        icon: productCartIcon
    }
]
