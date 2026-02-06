<template>
    <!-- 赠品选择弹窗 -->
    <uv-popup ref="popup" mode="center" :custom-style="{ width: '650rpx', borderRadius: '32rpx' }"
        :close-on-click-overlay="true" @close="handleClose" @change="onPopupChange">
        <view class="gift-popup-content"
            :style="{ background: 'url(' + INDEX_IMG_PATH + 'f01fe13c.png' + ')', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }">
            <!-- 弹窗标题 -->
            <view class="popup-title">
                <image class="deco-icon" :src="INDEX_IMG_PATH + 'image_6.png'" mode="aspectFit" />
                <text class="title-text">请选择你的赠品</text>
                <image class="deco-icon" :src="INDEX_IMG_PATH + 'image_7.png'" mode="aspectFit" />
            </view>

            <!-- 赠品列表 -->
            <scroll-view class="gift-list" scroll-y="true" :show-scrollbar="false">
                <!-- 空状态 -->
                <view v-if="giftList.length === 0" class="empty-container">
                    <text class="empty-text">暂无可选赠品</text>
                </view>

                <!-- 分组显示 -->
                <template v-if="isGrouped">
                    <view v-for="(group, gIdx) in giftList" :key="gIdx" class="activity-group" :class="'activity-group-' + group.type">
                        <view v-for="(gift, index) in group.list" :key="gift.id || index" class="gift-card"
                            :class="{ selected: isGiftSelected(gift) }" @tap="handleSelectGift(gift, true)">
                            <!-- 赠品图片 -->
                            <view class="gift-image-wrapper">
                                <image class="gift-image" :src="gift.image" mode="aspectFill" />
                                <view class="gift-badge">赠</view>
                            </view>

                            <!-- 赠品信息 -->
                            <view class="gift-info">
                                <view class="gift-header">
                                    <text class="gift-name">{{ gift.storeName }}</text>
                                    <view class="gift-price-section">
                                        <view class="price-wrapper">
                                            <text class="price-symbol">¥</text>
                                            <text class="price-value">0</text>
                                            <text class="original-price">¥{{ gift.price || 0 }}</text>
                                        </view>
                                    </view>
                                </view>
                                <view class="gift-tags" v-if="gift.labelList && gift.labelList.length > 0">
                                    <text v-for="(label, labelIndex) in gift.labelList" :key="labelIndex" class="gift-tag"
                                        :style="{
                                            color: label.fontColor || '#6692FF',
                                            backgroundColor: label.bgColor || '#E0E7FF',
                                            borderColor: label.borderColor || '#E0E7FF'
                                        }">
                                        {{ label.tagName }}
                                    </text>
                                </view>
                                <view class="gift-bottom">
                                    <view>
                                        <text v-show="gift.defaultNumber" class="gift-description">{{ gift.defaultNumber
                                            }},</text>
                                        <text v-show="gift.description" class="gift-description">{{ gift.description }}</text>
                                    </view>
                                    <text class="gift-quantity">x{{ gift.cartNum || 1 }}</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </template>

                <!-- 赠品卡片（原平铺逻辑） -->
                <template v-else>
                    <view v-for="(gift, index) in giftList" :key="gift.id || index" class="gift-card"
                        :class="{ selected: isGiftSelected(gift) }" @tap="handleSelectGift(gift)">
                        <!-- 赠品图片 -->
                        <view class="gift-image-wrapper">
                            <image class="gift-image" :src="gift.image" mode="aspectFill" />
                            <view class="gift-badge">赠</view>
                        </view>

                        <!-- 赠品信息 -->
                        <view class="gift-info">
                            <view class="gift-header">
                                <text class="gift-name">{{ gift.storeName }}</text>
                                <view class="gift-price-section">
                                    <view class="price-wrapper">
                                        <text class="price-symbol">¥</text>
                                        <text class="price-value">0</text>
                                        <text class="original-price">¥{{ gift.price || 0 }}</text>
                                    </view>
                                </view>
                            </view>
                            <view class="gift-tags" v-if="gift.labelList && gift.labelList.length > 0">
                                <text v-for="(label, labelIndex) in gift.labelList" :key="labelIndex" class="gift-tag"
                                    :style="{
                                        color: label.fontColor || '#6692FF',
                                        backgroundColor: label.bgColor || '#E0E7FF',
                                        borderColor: label.borderColor || '#E0E7FF'
                                    }">
                                    {{ label.tagName }}
                                </text>
                            </view>
                            <view class="gift-bottom">
                                <view>
                                    <text v-show="gift.defaultNumber" class="gift-description">{{ gift.defaultNumber
                                        }},</text>
                                    <text v-show="gift.description" class="gift-description">{{ gift.description }}</text>
                                </view>
                                <text class="gift-quantity">x{{ gift.cartNum || 1 }}</text>
                            </view>
                        </view>
                    </view>
                </template>
            </scroll-view>

            <!-- 底部按钮 -->
            <view class="popup-footer">
                <view class="cancel-button" @tap="handleCancel">
                    <text class="cancel-button-text">取消</text>
                </view>
                <view class="confirm-button" @tap="handleConfirm">
                    <text class="confirm-button-text">确定</text>
                </view>
            </view>
        </view>
    </uv-popup>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, computed } from 'vue'
import { INDEX_IMG_PATH } from '@/utils/imgpath'

// Props
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    giftList: {
        type: Array,
        default: () => []
    },
    selectedGifts: {
        type: Array,
        default: () => []
    },
    // 是否多选
    multiple: {
        type: Boolean,
        default: false
    },
    // 最多可选数量
    maxSelect: {
        type: Number,
        default: 3
    }
})

// Emits
const emit = defineEmits(['close', 'confirm'])

// 弹窗引用
const popup = ref(null)

// 临时选中的赠品列表
const tempSelectedGifts = ref([])

// 判断赠品是否被选中
const isGiftSelected = (gift) => {
    return tempSelectedGifts.value.some(item =>
        (item.id && item.id === gift.id) ||
        (item.productId && item.productId === gift.productId)
    )
}

// 判断是否为分组数据
const isGrouped = computed(() => {
    return props.giftList.length > 0 && Array.isArray(props.giftList[0].list)
})

// 选择赠品
const handleSelectGift = (gift, inGroup = false) => {
    const index = tempSelectedGifts.value.findIndex(item =>
        (item.id && item.id === gift.id) ||
        (item.productId && item.productId === gift.productId)
    )

    if (inGroup || gift.activityType !== undefined) {
        // 分组模式：每个活动只能选一个
        if (index > -1) {
            // 已选中，且是必选模式，则点击相同的不再取消选择
            // 或者如果业务允许取消，可以在这里处理
            return
        }
        
        // 寻找并替换同组的赠品
        const sameGroupIndex = tempSelectedGifts.value.findIndex(item => item.activityType === gift.activityType)
        if (sameGroupIndex > -1) {
            tempSelectedGifts.value.splice(sameGroupIndex, 1)
        }
        tempSelectedGifts.value.push(gift)
    } else {
        // 原有平铺模式逻辑
        if (index > -1) {
            // 已选中，取消选择
            tempSelectedGifts.value.splice(index, 1)
        } else {
            // 未选中，添加选择
            if (props.multiple) {
                // 多选模式
                if (tempSelectedGifts.value.length >= props.maxSelect) {
                    uni.showToast({
                        title: `最多只能选择${props.maxSelect}个赠品`,
                        icon: 'none',
                        duration: 2000
                    })
                    return
                }
                tempSelectedGifts.value.push(gift)
            } else {
                // 单选模式
                tempSelectedGifts.value = [gift]
            }
        }
    }
}

// 弹窗状态变化
const onPopupChange = (e) => {
    if (!e?.show) {
        emit('close')
    }
}

// 监听visible变化
watch(() => props.visible, (newVal) => {
    if (newVal) {
        // 打开弹窗时，初始化临时选中列表
        tempSelectedGifts.value = [...props.selectedGifts]
        popup.value?.open()
    } else {
        popup.value?.close()
    }
})

// 关闭弹窗
const handleClose = () => {
    emit('close')
}

// 取消
const handleCancel = () => {
    tempSelectedGifts.value = []
    emit('close')
}

// 确定
const handleConfirm = () => {
    emit('confirm', tempSelectedGifts.value)
    emit('close')
}
</script>

<style lang="scss" scoped>
.gift-popup-content {
    background-color: #ffffff;
    border-radius: 32rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 0 32rpx;
}

/* 弹窗标题 */
.popup-title {
    padding: 48rpx 32rpx 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    position: relative;
}

.deco-icon {
    width: 64rpx;
    height: 12rpx;
}

.title-text {
    font-family: PingFang SC;
    font-weight: 600;
    font-size: 36rpx;
    line-height: 52rpx;
    color: #000000;
    white-space: nowrap;
}

/* 赠品列表 */
.gift-list {
    flex: 1;
    min-height: 0;
    max-height: 700rpx;
}

.activity-group {
    padding: 24rpx;
    border-radius: 20rpx;
    margin-bottom: 32rpx;
    
    &.activity-group-0 {
        background-color: #E6FBFB;
    }
    
    &.activity-group-1 {
        background-color: #F0F9EB;
    }
    
    &.activity-group-2 {
        background-color: #FEF0F0;
    }
    
    .gift-card:last-child {
        margin-bottom: 0;
    }
}

.empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80rpx 0;
}

.empty-text {
    font-size: 28rpx;
    color: #999999;
}

/* 赠品卡片 */
.gift-card {
    background-color: #ffffff;
    // border: 3rpx solid #E5E5E5;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    padding: 24rpx;
    display: flex;
    align-items: center;
    gap: 20rpx;
    transition: all 0.3s ease;

    &.selected {
        border-color: #00CBCC;
        background-color: #F0FFFE;
        box-shadow: 0 0 0 1rpx #00CBCC inset;
    }

    &:active {
        transform: scale(0.98);
    }
}

.gift-image-wrapper {
    position: relative;
    width: 107rpx;
    height: 107rpx;
    flex-shrink: 0;
    background-color: #EDEDED;
    border-radius: 16rpx;
}

.gift-image {
    width: 100%;
    height: 100%;
}

.gift-badge {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    width: 44rpx;
    height: 44rpx;
    background-color: #00CBCC;
    color: #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
}

.gift-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    min-width: 0;
}

.gift-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12rpx;
}

.gift-name {
    font-family: PingFang SC;
    font-weight: 500;
    font-size: 24rpx;
    line-height: 34rpx;
    color: #000000;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
}

.gift-tags {
    display: flex;
    align-items: center;
    gap: 8rpx;
    flex-wrap: wrap;
}

.gift-tag {
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
    font-size: 20rpx;
    line-height: 28rpx;
    font-weight: 500;
    border: 1rpx solid;
}

.gift-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12rpx;
}

.gift-description {
    font-size: 22rpx;
    line-height: 32rpx;
    color: #999999;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.gift-price-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0;
    flex-shrink: 0;
}

.price-wrapper {
    display: flex;
    align-items: baseline;
    gap: 4rpx;
}

.price-symbol {
    font-family: OPPO Sans;
    font-weight: 500;
    font-size: 24rpx;
    color: #000000;
}

.price-value {
    font-family: OPPO Sans;
    font-weight: 600;
    font-size: 24rpx;
    line-height: 1em;
    color: #000000;
}

.original-price {
    font-size: 18rpx;
    color: #777777;
    text-decoration: line-through;
    margin-left: 8rpx;
}

.gift-quantity {
    font-size: 20rpx;
    color: #000;
    flex-shrink: 0;
}

/* 底部按钮 */
.popup-footer {
    padding: 24rpx 32rpx 32rpx;
    display: flex;
    gap: 20rpx;
    // border-top: 1rpx solid #F5F5F5;
}

.cancel-button,
.confirm-button {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;

    &:active {
        transform: scale(0.98);
    }
}

.cancel-button {
    background-color: #F5F5F5;
    border: 2rpx solid #E5E5E5;
}

.cancel-button-text {
    font-family: PingFang SC;
    font-weight: 500;
    font-size: 28rpx;
    color: #666666;
}

.confirm-button {
    background-color: #00CBCC;
}

.confirm-button-text {
    font-family: PingFang SC;
    font-weight: 500;
    font-size: 28rpx;
    color: #ffffff;
}
</style>
