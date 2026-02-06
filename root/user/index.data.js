/**
 * @name: index.data
 * @author: kahu4
 * @date: 2023-11-09 15:21
 * @description：index.data
 * @update: 2023-11-09 15:21
 * */

import {
    myScan,
    toDZIcon,
    toFHIcon,
    toKFIcon,
    toKJIcon,
    toPayIcon,
    toPJIcon,
    toSCIcon,
    toSHIcon,
    toSHOIcon,
    toTGIcon,
    toYHQIcon,
    toZBIcon,
    toZHIcon,
    toZJIcon
} from "@/utils/images";
import { useJump } from "@/hooks/useJump";

const {goIntegral, goBalance, goCoupon} = useJump()
export const orderIconList = [
    {
        id: 1,
        label: '待付款',
        icon: toPayIcon,
        rightTopDot: true,
        dotField: 'unpaidCount',
        path: '/pages/orderList/orderList',
        params: {data: {type: 0}}
    },
    {
        id: 2,
        label: '待发货',
        icon: toFHIcon,
        rightTopDot: true,
        dotField: 'unshippedCount',
        path: '/pages/orderList/orderList',
        params: {data: {type: 1}}
    },
    {
        id: 3,
        label: '待收货',
        icon: toSHIcon,
        rightTopDot: true,
        dotField: 'receivedCount',
        path: '/pages/orderList/orderList',
        params: {data: {type: 2}}
    },
    {
        id: 4,
        label: '待评价',
        icon: toPJIcon,
        rightTopDot: true,
        dotField: 'evaluatedCount',
        path: '/pages/orderList/orderList',
        params: {data: {type: 3}}
    },
]

export const cardOneList = [
    {
        id: 1,
        label: '我的足迹',
        icon: toZJIcon,
        path: '/pages/footprint/footprint',
    },
    {
        id: 2,
        label: '优惠券',
        icon: toYHQIcon,
        path: '/pages/discountCoupon/index',
    },
    {
        id: 3,
        label: '我的收藏',
        icon: toSCIcon,
        rightTopDot: false,
        dotField: 'receivedCount',
        path: '/pages/collect/collect',
    },
    {
        id: 5,
        label: '我的推广',
        icon: toTGIcon,
        path: '/views/distribution/center/index',
        params: {}
    },
    // {
    //     id: 6,
    //     label: '砍价记录',
    //     icon: toKJIcon,
    //     path: '',
    //     params: {data: {type: 1}}
    // },
    {
        id: 7,
        label: '售后记录',
        icon: toSHOIcon,
        rightTopDot: false,
        dotField: 'receivedCount',
        path: '/pages/refundList/refundList',
        params: {data: {type: -1}}
    },
    {
        id: 8,
        label: '联系客服',
        icon: toKFIcon,
        rightTopDot: false,
        dotField: 'evaluatedCount',
        path: 'kf',
        params: {data: {type: 3}}
    },
]

export const cardTwoList = [
    {
        id: 1,
        label: '地址管理',
        icon: toDZIcon,
        path: '/pages/address/address',
    },
    {
        id: 2,
        label: '账号管理',
        icon: toZHIcon,
        path: '/pages/userInfo/index',
    },
    {
        id: 3,
        label: '订单核销',
        icon: myScan,
        path: '/views/activity/afterVerification/index',
    },
]

export const accountList = [
    {
        id: 1,
        label: '我的余额',
        field: 'nowMoney',
        path: goBalance
    },
    {
        id: 2,
        label: '我的积分',
        field: 'integral',
        path: goIntegral
    },
    {
        id: 3,
        label: '优惠券',
        field: 'couponNumber',
        path: goCoupon
    }
]
