<script setup>
import { ref } from 'vue'
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath'
import Popup from '@/components/Popup/index.vue'

// 数据：四条保障项（标题+说明）
const items = ref([
    {
        id: 1,
        icon: `${COMMON_IMG_PATH}bb022470373.png`,
        title: '购物保障',
        desc: '已向微信官方缴纳50万元安全保证金，让您购物无忧'
    },
    {
        id: 2,
        icon: `${COMMON_IMG_PATH}122c875ae582.png`,
        title: '质量保证',
        desc: '投保PICC(中国人保)百万产品质量责任险，质量问题全额赔付'
    },
    {
        id: 3,
        icon: `${COMMON_IMG_PATH}3d73d65e3c.png`,
        title: '100%正品保障',
        desc: '品牌官方商城直发，杜绝假货！'
    },
    {
        id: 4,
        icon: `${COMMON_IMG_PATH}1e3c99cfa61.png`,
        title: '交易保障',
        desc: '接入微信支付，保障您的资金安全'
    }
])

// 底部提示
const tipText = ref('提供8:00-24:00客服即时在线咨询服务，即刻解决您的问题')

const popupRef = ref(null)

function open(customItems = null) {
    // if (Array.isArray(customItems) && customItems.length) {
    //     // 兼容字符串或对象传入
    //     items.value = customItems.map((it, idx) => {
    //         if (typeof it === 'string') {
    //             return { id: idx + 1, icon: 'checkbox-circle-fill', title: '', desc: it }
    //         }
    //         return { id: idx + 1, icon: it.icon || 'checkbox-circle-fill', title: it.title || '', desc: it.desc || '' }
    //     })
    // }
    popupRef.value?.show?.()
}

function close() {
    popupRef.value?.close?.()
}

defineExpose({ open, close })
</script>

<template>
    <!-- 居中弹窗容器 -->
    <Popup ref="popupRef" mode="center" :isMaskClick="true" :showCloseable="false" maskBg="rgba(0,0,0,0.5)"
        :padding="0">
        <view class="assurance-card">
            <!-- 头部：图标+主标题 -->
            <view class="card-header">
                <view class="header-row">
                    <image v-if="COMMON_IMG_PATH" :src="COMMON_IMG_PATH + '6d06d791850.png'"
                        style="width: 31rpx; height: 37rpx;" mode="widthFix" />
                    <view class="title">HealthCoast交易保障</view>
                </view>
                <view class="subtitle">消费者权益保障</view>
                <!-- 右上浅色装饰纹理 -->
                <view class="decor-shape" />
            </view>

            <!-- 内容区：白色卡片 -->
            <view class="card-content">
                <view class="assurance-item" v-for="item in items" :key="item.id">
                    <view class="item-left">
                        <view class="icon-wrap">
                            <image v-if="item.iconUrl" :src="item.iconUrl" class="icon-img" />
                            <uv-icon v-else :name="item.icon" color="#18C17C" size="24" />
                        </view>
                    </view>
                    <view class="item-right">
                        <view class="item-title">{{ item.title }}</view>
                        <view class="item-desc">{{ item.desc }}</view>
                    </view>
                    <!-- <view class="item-arrow">
                        <uv-icon name="arrow-right" color="#C2C2C2" size="16" />
                    </view> -->
                </view>

                <view class="bottom-tip">{{ tipText }}</view>
            </view>
            <view class="card-footer">
                <view class="close-circle" @click="close">
                    <uv-icon name="close" color="#121212" size="20" />
                </view>
            </view>
        </view>
    </Popup>
</template>

<style scoped lang="scss">
.assurance-card {
    width: 600rpx;
    max-width: 86vw;
    border-radius: 36rpx;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(225, 255, 238, 1) 0%, rgba(238, 255, 246, 1) 100%);
    box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.08);
}

.card-header {
    position: relative;
    padding: 28rpx 32rpx 10rpx;

    .header-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16rpx;
    }

    .title {
        font-size: 34rpx;
        font-weight: 700;
        color: #121212;
    }

    .subtitle {
        text-align: center;
        margin-top: 12rpx;
        font-size: 26rpx;
        font-weight: 600;
        color: #7A7A7A;
    }

    .decor-shape {
        position: absolute;
        right: 0;
        top: 0;
        width: 220rpx;
        height: 140rpx;
        background: radial-gradient(120rpx 80rpx at 80% 20%, rgba(24, 193, 124, 0.15), rgba(255, 255, 255, 0));
        pointer-events: none;
    }
}

.card-content {
    margin: 0 24rpx 24rpx;
    padding: 24rpx;
    border-radius: 24rpx;
    background: #FFFFFF;

    .assurance-item {
        display: flex;
        align-items: flex-start;
        padding: 18rpx 0;

        .item-left {
            margin-right: 16rpx;
            margin-top: 6rpx;
        }

        .icon-wrap {
            width: 44rpx;
            height: 44rpx;
            border-radius: 22rpx;
            background: #E9FFF3;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .icon-img {
            width: 40rpx;
            height: 40rpx;
        }

        .item-right {
            flex: 1;
        }

        .item-title {
            font-size: 28rpx;
            font-weight: 700;
            color: #121212;
        }

        .item-desc {
            margin-top: 6rpx;
            font-size: 24rpx;
            color: #6D6D6D;
            line-height: 40rpx;
        }

        .item-arrow {
            margin-left: 8rpx;
            display: flex;
            align-items: center;
        }
    }

    .bottom-tip {
        margin-top: 10rpx;
        font-size: 22rpx;
        color: #9B9B9B;
    }
}

.card-footer {
    display: flex;
    justify-content: center;
    padding-bottom: -32rpx;
    position: absolute;
    bottom: -45px;
    left: 0;
    right: 0;

    .close-circle {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        background: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
    }
}
</style>