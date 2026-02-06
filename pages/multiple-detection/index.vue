<template>
    <view class="multiple-detection">
        <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
            <view class="header-content">
                <view class="header-left">
                    <uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
                    <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
                </view>
            </view>
        </view>
        <view class="multiple-detection-img">
            <image :src="showImg" mode="widthFix" />
        </view>
        <view class="multiple-detection-list">
            <view class="items-container">
                <view v-for="(item, index) in productList" :key="index" class="multiple-detection-item" @click="goJumpPage(item.productId)">
                    <image :src="item.image" class="product-image" mode="widthFix"/>
                    <view class="product-item">
                        <text class="product-name">{{ item.name }}</text>
                        <view class="product-num">
                            <view class="product-num-text">营养严选</view>
                            <view class="product-num-message">通过{{ item.num }}项检测</view>
                        </view>
                        <view class="detection-info-list">
                            <view v-for="(info, idx) in getDisplayDetectionInfo(item.detectionInfoList)" :key="idx"
                                class="detection-info-item">
                                <text class="detection-text">{{ info.text }}</text>
                                <view v-if="false" class="current-month-tag">本月</view>
                            </view>

                            <view v-if="hasMoreDetectionInfo(item.detectionInfoList)" class="ellipsis-container">
                                <view class="dot"></view>
                                <view class="dot"></view>
                                <view class="dot"></view>
                            </view>
                        </view>
                    </view>
                    <image :src="HOME_IMG_PATH + 'Frame 2119904027.png'" class="checkedImg"></image>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { COMMON_IMG_PATH, HOME_IMG_PATH } from '@/utils/imgpath.js'
import { useRouter } from '@/hooks/useRouter'
import { getMultipleList, getShowImg } from '@/api/multiple.js'
import { useShare } from '@/hooks/useShare';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

const { commonPageShare } = useShare();

const { goBack, toHome } = useRouter()
const statusBarHeight = ref(20)
const showImg = ref('')
const productList = ref([])

// 判断是否是当月
function isCurrentMonth(timestamp) {
    if (!timestamp) return false

    const date = new Date(timestamp)
    const now = new Date()

    return date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
}

// 格式化检测信息
function formatDetectionInfo(item) {
    const detectionInfoList = []

    // 处理 itemList 数据
    if (item.itemList && item.itemList.length > 0) {
        item.itemList.forEach(itemInfo => {
            if (itemInfo.title) {
                detectionInfoList.push({
                    text: itemInfo.title,
                    isCurrentMonth: isCurrentMonth(itemInfo.jcTime)
                })
            }
        })
    }

    // let totalCostNum = 0;
    // if (item.itemList && item.itemList.length > 0) {
    //     totalCostNum = item.itemList.reduce((sum, itemInfo) => {
    //         return sum + (itemInfo.costNum || 0);
    //     }, 0);
    // }

    return {
        productId: item.productId,
        id: item.id,
        image: item.cpImg || '',
        name: item.name,
        num: item.costNum,
        detectionInfoList: detectionInfoList
    }
}

// 获取要显示的检测信息（最多5条）
function getDisplayDetectionInfo(list) {
    return list.slice(0, 5)
}

// 判断是否有更多检测信息需要显示省略号
function hasMoreDetectionInfo(list) {
    return list.length > 5
}

// 跳转至商品详情页
function goToProductDetail(productId) {
    // console.log(productId , 'productIdproductId')
    // push({url: '/pages/product/detail'}, {id: productId})
    uni.navigateTo({ url: '/pages/product/detail?id=' + productId })
}

function goJumpPage(productId) {
    // push({url: '/pages/testing-result/index'}, {id: productId})
    uni.navigateTo({ url: '/pages/testing-result/index?id=' + productId })
}

function goJumpPageData(item) {
    if(item.detectionInfoList && item.detectionInfoList.length > 0) {
        uni.navigateTo({ url: '/pages/testing-result/index?id=' + item.productId })
    }
}

const getList = async () => {
    try {
        const res = await getMultipleList()
        if (res && res.length > 0) {
            productList.value = res.map(item => formatDetectionInfo(item))
        }
        console.log('获取产品列表成功:', productList.value)
    } catch (err) {
        console.error('获取产品列表失败:', err)
    }
}

const getShowImage = async () => {
    try {
        const res = await getShowImg()
        if (res && res.picUrl) {
            showImg.value = res.picUrl
        }
    } catch (err) {
        console.error('获取产品列表失败:', err)
    }
}


onMounted(() => {
    // 获取系统信息
    uni.getSystemInfo({
        success: (res) => {
            statusBarHeight.value = res.statusBarHeight || 20

            // #ifdef APP-PLUS
            // App平台获取更精确的状态栏高度
            statusBarHeight.value = plus.navigator.getStatusbarHeight()
            // #endif

            // #ifdef H5
            // H5平台不需要状态栏高度
            statusBarHeight.value = 0
            // #endif
        }
    });
    getShowImage();
    getList();
})

onShareAppMessage(() => {
    return commonPageShare();
});
onShareTimeline(() => {
    return commonPageShare();
});
</script>

<style lang="scss" scoped>
page {
    background-color: #f8f9fa;
    height: 100%;
}

.header {
    position: absolute;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 88rpx;
    padding: 0 40rpx;
    position: relative;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 24rpx;
    z-index: 2;

    .icon-home {
        width: 48rpx;
        height: 48rpx;
        border-radius: 12rpx;
        padding: 8rpx;
    }
}

.multiple-detection {
    background-color: #F8F9FA;
}

.multiple-detection-img {
    display: flex;
    justify-content: center;
    align-items: center;

    image {
        width: 100%;
        height: auto;
    }
}

.multiple-detection-list {
    padding: 36rpx;

    .items-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 36rpx;
    }

    .multiple-detection-item {
        // height: 625rpx;
        background: #ffffff;
        border-radius: 19rpx;
        box-sizing: border-box;
        position: relative;
        padding-bottom: 57rpx;

        .checkedImg {
            width: 96rpx;
            height: 94rpx;
            position: absolute;
            right: 14rpx;
            bottom: 19rpx;
        }

        .product-item {
            padding: 0 19rpx;
        }

        .product-image {
            width: 100%;
            // height: 287rpx;
            height: auto;
            margin-bottom: 17rpx;
            border-radius: 10rpx;
        }

        .product-num {
            width: fit-content;
            background: #F0FFFF;
            border-radius: 49rpx;
            border: 2rpx solid #00CBCC;
            overflow: hidden;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 28rpx;
            margin-bottom: 13rpx;

            .product-num-text {
                width: 116rpx;
                background: #00CBCC;
                font-weight: 500;
                font-size: 20rpx;
                color: #FFFFFF;
                border-radius: 49rpx;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .product-num-message {
                font-weight: 500;
                font-size: 20rpx;
                height: 100%;
                padding: 0 9rpx 0 5rpx;
                color: #00CBCC;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        .product-name {
            font-weight: 600;
            font-size: 32rpx;
            color: #000000;
            display: block;
            margin-bottom: 9rpx;
        }

        .detection-info-list {
            .detection-info-item {
                display: flex;
                align-items: center;
                margin-bottom: 8rpx;

                .detection-text {
                    font-weight: 400;
                    font-size: 22rpx;
                    color: #424242;
                    margin-right: 8rpx;
                }

                .current-month-tag {
                    height: 21rpx;
                    background: #f6f6f6;
                    padding: 0 8rpx;
                    border-radius: 20rpx;
                    font-weight: 400;
                    font-size: 14rpx;
                    color: #a1a1a1;
                    white-space: nowrap;
                }
            }

            .ellipsis-container {
                display: flex;
                align-items: center;
                margin-top: 14rpx;

                .dot {
                    width: 6rpx;
                    height: 6rpx;
                    background: #d9d9d9;
                    border-radius: 50%;
                    margin-right: 9rpx;
                }
            }
        }
    }
}
</style>