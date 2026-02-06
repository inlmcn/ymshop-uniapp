<template>
    <view class="address-page">
        <Header system-bar-area-bg="#FFF"
            header-area-bg="#FFF" :scroll-top="scrollTop"
            :show-return="true" :left-width="20">
            <view class="title-text">{{ pageTitle }}</view>
        </Header>
        <!-- 管理按钮 -->
        <view class="manage-bar">
            <view class="manage-btn" @click="toggleManageMode">
                <image class="manage-icon"
                    :src="COMMON_IMG_PATH + '4e25d168722a06.png'" />
                <text class="manage-text">{{ isManageMode ? '完成' : '管理' }}</text>
            </view>
        </view>

        <!-- 地址列表 -->
        <view class="address-list" v-if="list.length > 0">
            <UniSwipeAction :autoClose="false">
                <UniSwipeActionItem
                    v-for="(item) in list"
                    :key="item.id"
                    @click="handleClick(item)"
                >
                    <view class="address-item">
                        <view class="address-header">
                            <text class="contact-name">{{ item.realName }}</text>
                            <text class="contact-phone">{{ item.phone }}</text>
                        </view>
                        <view class="address-content">
                            <text class="address-detail">{{ item.province }} {{ item.city }} {{ item.district }} {{ item.detail }}</text>
                            <view class="edit-icon" @click.stop="goEditorAddress(item)">
                                <image class="edit-icon-img"
                                    :src="COMMON_IMG_PATH + 'edit.png'" />
                            </view>
                        </view>
                        <view class="address-tags">
                            <view class="tag tag-default" v-if="item.isDefault">
                                <text class="tag-text">默认</text>
                            </view>
                        </view>
                    </view>
                    <template #right>
                        <view
                            class="delete-icon"
                            @click="showModal(item)">
                            <uv-icon
                                name="trash"
                                color="#fff" />
                        </view>
                    </template>
                </UniSwipeActionItem>
            </UniSwipeAction>
        </view>

        <!-- 空状态提示 -->
        <Empty
            :iconSrc="emptyAddressIcon"
            v-else
        >
            您还没有新增地址~
        </Empty>

        <!-- 底部操作栏 -->
        <view class="footer-bar">
            <view class="contact-service" @click="contactService">
                <image class="service-icon"
                    :src="COMMON_IMG_PATH + 'headset.png'" />
                <text class="service-text">联系客服</text>
            </view>
            <view class="add-address-btn" @click="goCreateAddress">
                <text class="add-btn-text">新建地址</text>
            </view>
        </view>
        
        <!-- 删除确认弹窗 -->
        <Modal
            ref="delModalRef"
            content="确认要删除地址吗？"
            @confirm="doDeleteRequest" />
    </view>
</template>
<script setup>
import { ref, unref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import Header from '@/components/Header/index.vue'
import Empty from '@/components/Empty/index.vue'
import { useScroll } from '@/hooks/useScroll'
import { useRouter } from "@/hooks/useRouter"
import { usePaging } from "@/hooks/usePaging"
import { emitter } from "@/utils/emitter"
import { INDEX_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath.js'
import { iconAdd, iconWechat } from "@/utils/images"
import { getAddressDel, getAddressList } from '@/api/address'
import Modal from "@/components/Modal/index.vue"
import UniSwipeAction from "@/pages/components/Uni/uni-swipe-action/uni-swipe-action.vue"
import UniSwipeActionItem from "@/pages/components/Uni/uni-swipe-action-item/uni-swipe-action-item.vue"

// ================================= hooks =============================================
const { scrollTop } = useScroll()
const { push, goBack, getParams } = useRouter()

// 响应式数据
const isManageMode = ref(false)
const actionType = ref(undefined) // 页面状态是选择还是管理 'select' | undefined
const pageTitle = computed(() => actionType.value === 'select' ? '选择地址' : '地址管理') // 页面title
const emptyAddressIcon = ref('')

onLoad((option) => {
  const params = getParams?.(option)
  actionType.value = params?.type
})

onShow(() => {
  refreshPage?.()
})

// ============================== 用户地址列表相关 =================================
const {list, refreshPage} = usePaging({
  request: getAddressList,
  // load: true
});

/**
 * 去创建地址
 */
function goCreateAddress() {
  push?.({url: '/pages/createAddress/createAddress'}, {
    data: {
      type: actionType.value
    }
  })
}

/**
 * 去修改地址
 * @param address
 */
function goEditorAddress(address) {
  push?.({url: '/pages/createAddress/createAddress'}, {
    data: {
      type: actionType.value,
      address
    }
  })
}

/**
 * 处理选择状态下返回
 * @param item
 */
function handleClick(item) {
  if (actionType.value === 'select') {
    emitter.emit('selectAddress', item)
    goBack?.({delta: 1})
  }
}

// 切换管理模式
const toggleManageMode = () => {
    isManageMode.value = !isManageMode.value
}

// ============================ 删除相关 ============================
const delModalRef = ref()
const prepareData = ref(undefined)

/**
 * 打开弹窗
 */
function showModal(data) {
  prepareData.value = data
  unref(delModalRef).show()
}

/**
 * 删除地址
 */
async function doDeleteRequest() {
  await getAddressDel(prepareData.value)
  await refreshPage?.()
}

// 微信导入
const wxAddFn = () => {
  uni.chooseAddress({
    success(res) {
      let addData = {
        realName: res.userName,
        phone: res.telNumber,
        detail: res.detailInfo,
        province: res.provinceName,
        city: res.cityName,
        district: res.countyName
      }
      goEditorAddress(addData)
    },
    fail:(res)=>{
      console.log('err---选择地址',res)
    }
  })
}

// 联系客服
const contactService = () => {
    console.log('联系客服')
}
</script>
<style lang='scss' scoped>
@import "../../style/images";

.address-page {
    min-height: 100vh;
    background-color: #f8f9fa;
    padding-bottom: 144rpx;
    box-sizing: border-box;
}

/* 管理按钮栏 */
.manage-bar {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background-color: #fff;
    padding: 16rpx 40rpx;

    .manage-btn {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .manage-icon {
            width: 32rpx;
            height: 32rpx;
        }

        .manage-text {
            font-size: 28rpx;
            color: #00cbcc;
            letter-spacing: 0.5px;
        }
    }
}

/* 地址列表 */
.address-list {
    padding: 20rpx 20rpx 100rpx 20rpx;
}

.address-item {
    background-color: #fff;
    border: 1px solid #e7e7e7;
    border-radius: 24rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 8rpx 100rpx 0 rgba(0, 0, 0, 0.07);

    &:last-child {
        margin-bottom: 0;
    }
}

.address-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10rpx;

    .contact-name {
        font-size: 32rpx;
        font-weight: 500;
        color: #222;
        letter-spacing: 0.5px;
    }

    .contact-phone {
        font-size: 32rpx;
        color: #222;
        letter-spacing: 0.5px;
    }
}

.address-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10rpx;

    .address-detail {
        flex: 1;
        font-size: 24rpx;
        color: #666;
        line-height: 36rpx;
        letter-spacing: 0.5px;
        margin-right: 20rpx;
    }

    .edit-icon {
        width: 34rpx;
        height: 34rpx;
        cursor: pointer;
    }

    .edit-icon-img {
        width: 100%;
        height: 100%;
    }
}

.address-tags {
    display: flex;
    gap: 5rpx;

    .tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 15rpx;
        height: 27rpx;
        border-radius: 41rpx;

        .tag-text {
            font-size: 20rpx;
            line-height: 26rpx;
            white-space: nowrap;
        }
    }

    .tag-default {
        background-color: #00cbcc;

        .tag-text {
            color: #fff;
        }
    }

    .tag-type {
        background-color: #def7f7;

        .tag-text {
            color: #009e9f;
        }
    }
}

/* 底部操作栏 */
.footer-bar {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    border-top: 2px solid #e7e7e7;
    border-radius: 24rpx 24rpx 0 0;
    padding: 32rpx 40rpx;
    box-sizing: border-box;
    z-index: 99;

    .contact-service {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .service-icon {
            width: 36rpx;
            height: 36rpx;
        }

        .service-text {
            font-size: 28rpx;
            color: #666;
        }
    }

    .add-address-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #00cbcc;
        border-radius: 48rpx;
        height: 80rpx;
        margin-left: 40rpx;
        box-shadow: 0 8rpx 24rpx 0 rgba(103, 61, 17, 0.08);

        .add-btn-text {
            font-size: 28rpx;
            font-weight: 500;
            color: #fff;
            letter-spacing: 3px;
        }
    }
}

/* 滑动删除按钮样式 */
.delete-icon {
    margin: 0 0 20rpx 20rpx;
    width: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #00CBCC;
    border-radius: 30rpx;
    transition: all .3s;

    &:active {
        scale: .9;
    }
}
</style>
