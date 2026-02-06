<template>
  <div class="coupon-item">
    <div class="coupon-left">
      <!-- 折扣力度 -->
      <div class="discount">
        <div class="unit pre-unit" v-if="item.couponType === 1">
          ￥
        </div>
        {{item.couponType === 1 ? item.couponValue : item.discount}}
        <div class="unit" v-if="item.couponType === 2">
          折
        </div>
      </div>
      <div class="type" v-if="componentContent.arrangeType === '多行多列'">
        {{item.couponType === 1 ? '满减券' : '折扣券'}}
      </div>
    </div>
    <div class="coupon-right">
      <div class="info">
        <div class="type" v-if="componentContent.arrangeType === '一行一个'">
          {{item.couponType === 1 ? '满减券' : '折扣券'}}
        </div>
        <div class="tip">
          {{item.threshold!==0?`(满${item.threshold}元使用)`:'无门槛使用'}}
        </div>
      </div>
      <!-- button -->
      <div class="button get-coupon" @click="goToProduct(item.id)" v-if="!item.obtainable">
        去使用
      </div>
      <div class="button get-coupon" v-else @click="receiveCoupon(item)">
        领取
      </div>
    </div>
  </div>
</template>
<script setup>
import {toRefs} from "vue";

const emits = defineEmits(['receive', 'jumpProduct'])
const props = defineProps({
  item: {
    type: Object,
    default () {
      return {}
    },
  },
  componentContent: {
    type: Object,
    default () {
      return {}
    },
  },
});
const { item, componentContent } = toRefs(props);

function goToProduct (id) {
  emits('jumpProduct', id)
}
function receiveCoupon (item) {
  emits('receive', item)
}

</script>
