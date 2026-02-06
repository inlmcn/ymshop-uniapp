/**
 * @name: index.data
 * @author: kahu4
 * @date: 2023-11-07 18:16
 * @description：index.data
 * @update: 2023-11-07 18:16
 * */

export const addressTabs = [
    {
        label: '配送到家',
        value: 1
    },
    {
        label: '门店自取',
        value: 2
    }
]


export const discountsPriceRows = [
    {
        label: '优惠',
        field: 'couponPrice',
        prefix: '-￥'
    },
    {
        label: '运费',
        field: 'storePostage',
        prefix: '+￥'
    }
]

export const priceRows = [
    {
        label: '商品总价',
        field: 'costPrice',
        prefix: '￥'
    },
    {
        label: '优惠',
        field: 'couponPrice',
        prefix: '-￥'
    },
    {
        label: '运费',
        field: 'storePostage',
        prefix: '￥'
    }
]
