<template>
  <Popup
      ref="popupRef"
      :showCloseable="false"
      @close="emit('close')"
      @maskClick="clickMask"
  >
    <template v-if="couponList.length>=0">
      <view
          class="coupon-box"
      >
        <view class="exchange-box">
          <input
              class="input"
              type="text"
              placeholder="请输入码，注意区分大小写"
              v-model="couponCode"
          />
          <view class="btn" @click="receiveByCode">使用</view>
        </view>
        <uv-radio-group
            v-model="couponItem"
            class="pay-box__inner flex flex-ai__center flex-jc__center flex-wrap"
            shape="circle"
            activeColor="#00CBCC"
            @change="groupChange"
        >
          <template v-for="item in couponList">
            <view class="select-box">
              <uv-radio
                  :name="item.detailId"
                  @change="radioChage"
              >
                <CouponItem
                    class="select-coupon"
                    :coupons="item"
                    :type="'noType'"
                />
              </uv-radio>
            </view>
          </template>
        </uv-radio-group>
      </view>

    </template>
    <Empty
        v-else
        padding="120rpx 0"
        :icon-src="emptyCouponIcon"
    >
      暂无可用的优惠券
    </Empty>
    <view class="action-height"></view>
    <view class="button-action">
      <view
          class="animation-button"
          :class="{disabled:couponList.length<=0}"
          @click="handleSubmit"
      >
        确定
      </view>
    </view>
  </Popup>
</template>

<script setup>
import { ref } from 'vue';
import Empty from "@/components/Empty/index.vue"
import { useInterface } from "@/hooks/useInterface";
import { getCartCoupon, receiveByCdkey } from "@/api/coupon";
import CouponItem from "@/pages/discountCoupon/components/CouponItem.vue";
import Popup from '@/components/Popup/index.vue';
import UvRadio from "@/uni_modules/uv-radio/components/uv-radio/uv-radio.vue";
import UvRadioGroup from "@/uni_modules/uv-radio/components/uv-radio-group/uv-radio-group.vue";
import { emptyCouponIcon } from "@/utils/images";

const props = defineProps(["id", 'currentCouponId'])

const emit = defineEmits(['submitCoupon', 'close'])
const couponList = ref([])
const popupRef = ref(false)
const currentCoupon = ref({})
const visible = ref(false)
const couponItem = ref(props.currentCouponId ? props.currentCouponId : -1)
const oldCoupon = ref(props.currentCouponId ? props.currentCouponId : -1)
const num = ref(0)
const radioValue = ref('')
const selectCouponPanel = ref(false)
const couponCode = ref('')
const handleGetDetail = async (id) => {
  const list = await getCartCoupon(id)
  if (list) {
    couponList.value = list
  }
}

const handleSubmit = () => {
  if (couponList.value.length <= 0) {
    close()
    return
  }
  oldCoupon.value = couponItem.value
  emit('submitCoupon', {
    couponId: couponItem.value
  })
}

const groupChange = (n) => {
  if (n == radioValue.value && num.value == 0) {
    num.value++
  } else {
    couponItem.value = -1
    num.value = 0
  }
}

const clickMask = () => {
  if (oldCoupon.value !== couponItem.value) {
    couponItem.value = oldCoupon.value
  }
}

const radioChage = (n) => {
  radioValue.value = n
  num.value = 0
}

const {toast} = useInterface()

/**
 * 用户手动输入改变数量
 * @param e
 * @param item
 * @returns {*}
 */
const selectCurrentCoupon = (item) => {
  currentCoupon.value = item
}

const open = () => {
  handleGetDetail(props.id)
  popupRef.value.show()
}

const close = () => {
  popupRef.value.close()
  emit('close')
}

const receiveByCode = () => {
  if(!couponCode.value){
    uni.showToast({
      title: "兑换码不能为空",
      icon: "none",
      duration: 2000
    });
    return false
  }
  receiveByCdkey(couponCode.value).then(()=>{
    uni.showToast({
      title: '领取成功',
      icon: 'success'
    })
    couponCode.value = ''
    handleGetDetail(props.id)
  })
}


defineExpose({
  open,
  close
})
</script>

<style lang="scss">
.coupon-box {
  padding: 24rpx 24rpx 68rpx 24rpx;
  box-sizing: border-box;
  width: 100%;
  .exchange-box{
    display: flex;
    justify-content: space-between;
    margin-bottom: 34rpx;
    .input{
      flex: 1;
      height: 80rpx;
      font-size: 28rpx;
      color: #999999;
      background: #F6F8F8;
      border-radius: 8rpx;
      padding-left: 24rpx;
    }
    .btn{
      width: 104rpx;
      height: 80rpx;
      background: #00CBCC;
      border-radius: 8rpx;
      font-size: 28rpx;
      color: #FFFFFF;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 24rpx;
    }
  }
  .select-box {
    width: 100%;
    margin-bottom: 30rpx;

    .select-icon {
      width: 20rpx;
      height: 20rpx;
    }

    .coupon-item {
      margin-bottom: 0 !important;
      padding: 0 60rpx;
    }

    .select-coupon {
      flex: 1;
    }
  }
}

.action-height {
  width: 100%;
  height: 80rpx;
}

.button-action {
  position: fixed;
  bottom: 0;
  width: 100%;
  left: 0;

  .animation-button {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
  }
}


</style>
