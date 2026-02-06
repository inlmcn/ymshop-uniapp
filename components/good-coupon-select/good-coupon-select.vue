<template>
  <Popup
      ref="popupRef"
      :showCloseable="false"
      @close="emit('close')"
  >
    <view class="coupon-box">
      <template v-if="!showEmpty">
        <view
            class="coupon-list"
            v-for="item in couponList">
          <CouponItem
              @receiveCoupon="handleGetDetail(props.id)"
              :coupons="item"
              type="get"
          />
        </view>
      </template>
      <Empty
          :iconSrc="emptyCouponIcon"
          v-else
      >
        暂时没有可领取的优惠券~
      </Empty>
    </view>
  </Popup>
</template>


<script setup>
import { ref } from 'vue';
import { useInterface } from "@/hooks/useInterface";
import Empty from "@/components/Empty/index.vue"
import { getProductCoupon } from "@/api/coupon";
import CouponItem from "@/pages/discountCoupon/components/CouponItem.vue";
import Popup from '@/components/Popup/index.vue';
import { emptyCouponIcon } from "@/utils/images";

const props = defineProps(["id"])

const emit = defineEmits(['submitCoupon', 'close'])
const couponList = ref([])
const popupRef = ref(false)
const currentCoupon = ref({})
const visible = ref(false)
const showEmpty = ref(false)
const selectCouponPanel = ref(false)

const handleGetDetail = async (id) => {
  const list = await getProductCoupon(id)
  if (list) {
    couponList.value = list
  }
}

const handleSubmit = () => {
  emit('submitCoupon', {
    couponId: currentCoupon.value.id
  })
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


defineExpose({
  open,
  close
})
</script>

<style lang="scss">
.coupon-box {
  padding: 24rpx;
  box-sizing: border-box;
  width: 100%;

  .coupon-list {
    margin-bottom: 24rpx;
  }
}

</style>
