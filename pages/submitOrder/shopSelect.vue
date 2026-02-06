<!--
    @name: shopSelect
    @author: kahu4
    @date: 2024-01-19 17:47
    @description：shopSelect
    @update: 2024-01-19 17:47
-->
<script setup>
import Header from "@/components/Header/index.vue"
import { onMounted, ref } from "vue";
import {
  emptyCollectIcon,
  shopLocation,
  shopLocation1,
  shopLocationGrey,
  shopPhone,
  shopPhoneGrey,
  shopTime
} from "@/utils/images";
import { getShopList } from "@/api/address";
import { onLoad } from "@dcloudio/uni-app";
import { useRouter } from "@/hooks/useRouter";
import { mapUtils, openMap } from "@/utils/mapUtils";
import { emitter } from "@/utils/emitter";
import { IS_DEMO } from "@/config";
import Empty from "@/components/Empty/index.vue";

const {getParams, goBack} = useRouter()
onMounted(() => {
})

const shopSelectId = ref('')

const shopList = ref([])

async function doGetShopList() {
  uni.showLoading({title: '加载中'})
  if(IS_DEMO){
	shopList.value = await getShopList({lat: 111, lon: 222})  
  }else{
	uni.getLocation({
	  success: async (res) => {
	    console.log(res)
	    shopList.value = await getShopList({lat: res.latitude, lon: res.longitude})
	  },
	  complete: () => {
	    uni.hideLoading()
	  },
	  fail: (err) => {
	    console.error(err)
	  }
	})  
  }
   
}

function handleSelectShop(shop) {
  shopSelectId.value = shop.id
  emitter.emit('selectShop', shop)
  goBack()
}

const showMapSelect = ref(false)
let shopSelect = null

function handleConfirmMapSelect(e) {
  shopSelect.type = e.name
  openMap(shopSelect)
}

function handleMapSelectClose() {
  shopSelect = null
  showMapSelect.value = false
}

function handleNavigation(shop) {
  // #ifdef H5
  shopSelect = shop
  showMapSelect.value = true
  // #endif
  // #ifndef H5
  openMap(shop)
  // #endif
}

function handleCall(shop) {
  uni.makePhoneCall({
    phoneNumber: shop.storePhone
  })
}

onMounted(() => {
  doGetShopList()
})

onLoad((options) => {
  const params = getParams(options);
  // 默认选中
  if (params && params.shopSelect) {
    shopSelectId.value = params.shopSelect.id
  }
})

</script>

<template>
  <view>
    <Header
        system-bar-area-bg="#fff"
        header-area-bg="#fff"> 选择门店
    </Header>
    <view class="shop-list">
      <template v-if="shopList.length>0">
        <view
            class="shop-item"
            :class="{current:shopSelectId === shop.id}"
            v-for="shop in shopList"
            :key="shop.id"
            @click="handleSelectShop(shop)">
          <view class="row-box">
            <view class="title-row">
              <view class="name">{{ shop.storeName }}</view>
              <view class="sub">距离 {{ shop.distance }} m</view>
            </view>
            <view class="sub-row address-row">
              <image :src="shopLocation1" />
              {{ shop.address }}
            </view>
            <view class="sub-row time-row">
              <image :src="shopTime" />
              {{ shop.businessStartTime }} - {{ shop.businessEndTime }}
            </view>
          </view>
          <view class="bottom-row">
            <view
                class="button-item"
                @click.stop="handleCall(shop)">
              <image :src="shopSelectId === shop.id?shopPhone:shopPhoneGrey" />
              门店电话
            </view>
            <view
                class="button-item"
                @click.stop="handleNavigation(shop)">
              <image :src="shopSelectId === shop.id?shopLocation:shopLocationGrey" />
              导航
            </view>
          </view>
        </view>
      </template>
      <template v-else>
        <Empty
            :iconSrc="emptyCollectIcon"
        >
          当前暂无门店~
        </Empty>
      </template>
    </view>
    <uv-action-sheet
        :actions="mapUtils.mapList"
        :show="showMapSelect"
        cancelText="取消"
        @select="handleConfirmMapSelect"
        @close="handleMapSelectClose" />
  </view>
</template>

<style
    scoped
    lang="scss">
.shop-list {
  @include usePadding(32, 32);

  .shop-item {
    width: 100%;
    border: 1rpx solid #E6E6E6;
    overflow: hidden;
    border-radius: 15rpx;
    margin-bottom: 20rpx;

    .row-box {
      @include usePadding(40, 40);
    }

    .title-row {
      font-size: 34rpx;
      font-weight: bold;
      @include useFlex(space-between, center);

      .sub {
        font-weight: normal;
        color: #999;
        font-size: 24rpx;
      }
    }

    .sub-row, .bottom-row {
      image {
        width: 30rpx;
        height: 30rpx;
        margin-right: 15rpx;
      }
    }

    .sub-row {
      @include useFlex(flex-start, center);
      font-size: 24rpx;
      margin: 10rpx 0;
    }

    .bottom-row {
      background: #e6e6e6;
      color: #A1A1A1;
      font-size: 30rpx;
      @include useFlex(space-between, center);
      @include usePadding(0, 24);

      .button-item {
        @include useFlex(center, center);
        width: 50%;
      }
    }
  }

  .current {
    border: 1rpx solid $primary-color;

    .bottom-row {
      background: $primary-color;
      color: #fff;
    }
  }
}
</style>
