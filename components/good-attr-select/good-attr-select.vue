<template>
  <Popup
      ref="popupRef"
      :showCloseable="false"
      @close="emit('close')"
  >
    <view
        class="goodAttrSelect"
    >
      <view
          class="goodAttrSelect-goods"
          v-if="curAttr"
      >
        <uv-image
            class="attr-image"
            :src="curAttr.image || storeInfo.image"
            width="150rpx"
            height="150rpx"
        ></uv-image>
        <view class="attr-info">
          <view class="name">
            {{ storeInfo.storeName }}
          </view>
          <view class="attr-info-bottom">
            <!-- 普通SKU -->
            <template v-if="actionType==='singleBuy' || !curAttr.campaignType">
              <view class="price">¥{{ curAttr.price }}</view>
              <view class="stock">库存：{{ curAttr.stock }}</view>
            </template>
            <!-- 活动SKU -->
            <template v-else>
              <view class="flex flex-ai__end integral-box" v-if="curAttr.campaignType === 4">
                <view class="integral">{{curAttr.integral}} 积分</view>
                <view class="add-str" v-if="curAttr.campaignPrice !==0">+</view>
                <view class="price primary-color" v-if="curAttr.campaignPrice !==0">¥{{ curAttr.campaignPrice }}</view>
              </view>
              <view class="flex flex-ai__end" v-else>
                <view
                    class="price-name"
                    v-if="curAttr.campaignState===1">{{ activityName }}
                </view>
                <view class="price primary-color">¥{{ curAttr.campaignPrice }}</view>
                <view class="old-price">￥{{ curAttr.price }}</view>
              </view>
              <view class="stock">库存：{{ curAttr.campaignStock }}</view>
            </template>
          </view>
        </view>
      </view>
      <!-- 没有选中sku -->
      <view
          class="goodAttrSelect-goods"
          v-else
      >
        <uv-image
            class="attr-image"
            :src="storeInfo.image"
            width="150rpx"
            height="150rpx"
        ></uv-image>
        <view class="attr-info">
          <view class="name">
            {{ storeInfo.storeName }}
          </view>
          <view class="attr-info-bottom">
            <view class="price">¥{{ storeInfo.price }}</view>
            <view class="stock">库存：{{ storeInfo.stock }}</view>
          </view>
        </view>
      </view>

      <div class="line"></div>
      <view
          class="goodAttrSelect-attr row"
          v-if="curAttr && curAttr.campaignType !== 4"
      >
        <view class="goodAttrSelect-attr-title">
          数量
        </view>
        <view class="goodAttrSelect-attr-content">
          <!-- cart number -->
          <view
              class="cart-num flex flex-ai__center flex-jc__sb"
              @click.stop=""
          >
            <view
                class="button"
                :class="storeNum <= 1 && 'disabled'"
                @click="handleCartNumberChange(curAttr,'minus')"
            >
              <uv-icon
                  name="minus"
                  color="#333"
                  size="24rpx"
              ></uv-icon>
            </view>
            <view class="input">
              <input
                  type="number"
                  inputmode="numeric"
                  v-model="storeNum"
                  @blur="(e)=>handleCartNumberInputChange(e,curAttr)"
                  @input="(e)=>cartNumberInput(e,curAttr)"
              >
            </view>
            <view
                class="button"
                :class="storeNum >= curAttr.stock && 'disabled'"
                @click="handleCartNumberChange(curAttr,'plus')"
            >
              <uv-icon
                  name="plus"
                  color="#333"
                  size="24rpx"
              ></uv-icon>
            </view>
          </view>
        </view>
      </view>
      <div class="line"></div>

      <view
          class="goodAttrSelect-attr"
          v-for="(item, index) in productAttr"
          :key="index"
      >
        <view class="goodAttrSelect-attr-title">
          {{ item.attrName }}
        </view>
        <view class="goodAttrSelect-attr-content">
          <space
              wrap="warp"
              gap>
            <view
                :class="{ attr: true, check: selectedAttr[index] === attr,disabled:checkAttrDisable(index,attr)}"
                v-for="(attr, attrIndex) in item.attrValueArr"
                :key="attrIndex"
                @tap="handleSelectAttr(index, attr)"
            >{{ attr }}
            </view>
          </space>
        </view>
      </view>
      <view class="goodAttrSelect-action">
        <uv-button
            :disabled="!curAttr || isSoldOut()|| storeNum===0"
            round
            block
            type="primary"
            @tap="handleSubmit"
        >
          确定
        </uv-button>
      </view>
    </view>
  </Popup>
</template>

<script setup>
import {computed, nextTick, ref, toRefs} from 'vue';
import { useInterface } from "@/hooks/useInterface";
import Popup from '@/components/Popup/index.vue';
// ====================== hooks ============================
const {toast} = useInterface()

// ====================== 组件相关 ============================
const emit = defineEmits(['select', 'close'])
/**
 * @property goodsDetail 商品详情
 * @property skuId sku打开时默认sku
 */
const props = defineProps({
  goodsDetail: {
    type: Object,
    default: ()=>{}
  },
  skuId: {
    type: [String, Number],
  },
  isIntegral: {
    type: Boolean,
    default: false,
  }
})
const {goodsDetail, skuId, isIntegral} = toRefs(props)

// ======================= 数据相关 ==============================
const storeInfo = computed(() => goodsDetail.value ? goodsDetail.value.storeInfo : {}) // 商品信息
const productAttr = computed(() => goodsDetail.value ? goodsDetail.value.productAttr : {}) // 商品sku attr细腻些
const productValue = computed(() => goodsDetail.value ? goodsDetail.value.productValue : {}) // 商品sku value信息
const activityName = computed(() => {
  if (!curAttr.value) return ''
  return ['拼团价', '秒杀价', '折扣价'][curAttr.value.campaignType - 1]
})

// ======================= sku 操作相关 ==========================
const selectedAttr = ref([]) // 当前选中sku的attr key信息
const curAttr = ref(null) // 当前选中的sku

/**
 * 检查是否为disable
 * @param attrRowIndex
 * @param attr
 * @return {boolean}
 */
function checkAttrDisable(attrRowIndex, attr) {
  // 模拟当前值选中
  const selectedAttrMock = JSON.parse(JSON.stringify(selectedAttr.value))
  selectedAttrMock[attrRowIndex] = attr
  const filterAttrMock = selectedAttrMock.filter(i => i);
  // 如果不是最后一次选择属性，构不成sku比较，直接return false
  if (filterAttrMock.length < productAttr.value.length) return false
  for (const skuName in productValue.value) {
    let skuNameArr = skuName.split(',')
    if (skuNameArr[attrRowIndex] === attr) {
      const sku = productValue.value[skuName]
      const trueStock = sku.campaignState === 1 ? sku.campaignStock : sku.stock // 真实库存 （区分活动和普通）
      // ！！！从有库存的开始查，不要从没库存的直接break
      // 只要有一条includes且库存大于0就直接break
      if(isIntegral.value){
        if (trueStock > 0 && sku.campaignType === 4) return false
      } else {
        if (trueStock > 0) return false
      }
    }
  }
  return true
}

/**
 * 设置默认sku选中
 */
function handleSetDefaultSkuSelect() {
  const skuList = productValue.value
  // 遍历sku的对象数组，匹配到id相同的项
  if (skuId.value) {
    for (const skuName in skuList) {
      const sku = skuList[skuName]
      const trueStock = sku.campaignState === 1 ? sku.campaignStock : sku.stock // 真实库存 （区分活动和普通）
      if (sku.id === skuId.value && trueStock > 0) {
        // 设置默认选中
        selectedAttr.value = skuName.split(',')
        curAttr.value = sku
        break;
      }
    }
  }
  // 如果没有找到，那就默认选中sku的第一个、
  if (selectedAttr.value.filter(i => i).length <= 0) {
    const skuNameList = Reflect.ownKeys(skuList)
    if (skuNameList.length > 0) {
      let defaultSku, defaultSkuName
      for (const skuName of skuNameList) {
        const sku = skuList[skuName];
        const trueStock = sku.campaignState === 1 ? sku.campaignStock : sku.stock // 真实库存 （区分活动和普通）
        let ifJudge = isIntegral.value? trueStock > 0 && sku.campaignType === 4 : trueStock > 0
        if (ifJudge) {
          defaultSku = sku
          defaultSkuName = skuName
          break;
        }
      }
      if (defaultSku) {
        selectedAttr.value = defaultSkuName.split(',')
        curAttr.value = defaultSku
      }
    }
  }
  handleSetStoreNum()
}

/**
 * sku选中
 * @param attrRowIndex sku属性row索引
 * @param attrItemName sku选中的item的名称（object的key）
 */
const handleSelectAttr = (attrRowIndex, attrItemName) => {
  if (checkAttrDisable(attrRowIndex, attrItemName)) return toast({title: "商品抢完啦~看看其他的吧"})
  curAttr.value = undefined
  if (selectedAttr.value[attrRowIndex] && selectedAttr.value[attrRowIndex] === attrItemName) {
    selectedAttr.value[attrRowIndex] = ''
    return;
  }
  selectedAttr.value[attrRowIndex] = attrItemName
  if (selectedAttr.value.filter(i => i).length === productAttr.value.length) {
    curAttr.value = productValue.value[selectedAttr.value.join(',')]
    // 设置库存
    handleSetStoreNum()
  }
}


/**
 * 提交
 */
const handleSubmit = () => {
  if (!curAttr.value) return;
  if (isSoldOut() && storeNum.value === 0) return
  emit('select', {
    store: curAttr.value,
    num: storeNum.value
  })
  close()
}

// ========================== 数量相关 ===========================

const storeNum = ref(1) // 数量

/**
 * 用户手动输入改变数量
 * @param e
 * @param item
 * @returns {*}
 */
function handleCartNumberInputChange(e, item) {
  const value = Number(e.detail.value)
  const trueStock = item.campaignState === 1 ? item.campaignStock : item.stock // 真实库存 （区分活动和普通）
  if (value <= 0) {
    storeNum.value = 1
  } else if (value > trueStock) {
    storeNum.value = trueStock
  } else {
    storeNum.value = value.toString().replace(/^0+/, '')
  }
}

/**
 *  购买数量验证
 */
function cartNumberInput(e, item){
  const pattern = /^0+|[.]*/g;
  nextTick(() => {
    storeNum.value = e.detail.value.replace(pattern,'');
  })
}

/**
 * 用户点击购物车+-改变数量
 * @param item
 * @param type
 * @returns {*}
 */
function handleCartNumberChange(item, type = 'plus') {
  const trueStock = item.campaignState === 1 ? item.campaignStock : item.stock // 真实库存 （区分活动和普通）
  if (type === 'plus') {
    if (storeNum.value + 1 > trueStock) {
      storeNum.value = trueStock
    } else {
      storeNum.value += 1
    }

  } else {
    if (storeNum.value - 1 <= 0) {
      storeNum.value = 1
    } else {
      storeNum.value -= 1
    }
  }
}

/**
 * 设置选中数量
 * 当sku发生改变的时候需要调用
 */
const handleSetStoreNum = () => {
  if (!curAttr.value) return storeNum.value = 0
  const defaultSkuStock = curAttr.value.campaignState === 1 ? curAttr.value.campaignStock : curAttr.value.stock
  if (storeNum.value === 0 && defaultSkuStock > 0) {
    storeNum.value = 1
  }
  if (storeNum.value > defaultSkuStock) {
    storeNum.value = curAttr.value.stock
  }
}

/**
 * 判断是不是卖完了
 */
const isSoldOut = () =>{
  if (!curAttr.value) return true
  const defaultSkuStock = curAttr.value.campaignState === 1 ? curAttr.value.campaignStock : curAttr.value.stock
  return defaultSkuStock === 0
}

// ========================= 弹窗相关 ============================
const popupRef = ref()
const actionType = ref('select') //  select:普通选择 cart:购物车选择 buy:普通下单 activeBuy:活动下单 singleBuy:单独购买
/**
 * 打开弹窗
 * @param cartNum
 * @param action 打开弹窗类型
 */
const open = (cartNum = 1, action = 'select') => {
  actionType.value = action
  storeNum.value = cartNum || 1
  const attrLength = productAttr.value.length
  selectedAttr.value = new Array(attrLength).fill('')
  handleSetDefaultSkuSelect()
  popupRef.value.show()
}

const close = () => {
  curAttr.value = null
  emit('close')
  popupRef.value.close()
}

defineExpose({
  open,
  close
})
</script>

<style lang="scss">
.goodAttrSelect {
  height: 100%;

  &-goods {
    padding: 40rpx 30rpx;
    display: flex;

    .attr-image {

    }

    .attr-info {
      max-width: calc(100% - 150rpx - 30rpx);
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-between;
      margin-left: 30rpx;

      .name {
        font-size: 28rpx;
        line-height: 40rpx;
        color: #333333;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
      }

      &-bottom {
        display: flex;
        justify-content: space-between;

        .price {
          font-size: 30rpx;
          line-height: 42rpx;
          color: #00CBCC;
          font-weight: bold;
        }

        .integral-box{
          display: flex;
          font-size: 30rpx;
          line-height: 42rpx;
          font-weight: bold;
          color: #00CBCC;
          .integral-box{}
          .add-str{
            margin: 0 5rpx;
          }
        }

        .price-name {
          background: #00CBCC;
          color: #fff;
          border-radius: 10rpx;
          font-size: 24rpx;
          font-style: italic;
          padding: 3rpx 10rpx;
          margin-right: 5rpx;
        }

        .old-price {
          font-size: 22rpx;
          color: grey;
          text-decoration: line-through;
        }

        .stock {
          font-size: 24rpx;
          line-height: 42rpx;
          color: #666666;
        }
      }
    }
  }

  &-action {
    padding: 20rpx 20rpx;

  }

  &-attr {
    padding: 40rpx 30rpx 10rpx 0;

    &.row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 40rpx;

      .goodAttrSelect-attr-title {
        margin-bottom: 0;
      }
    }

    &-title {
      margin: 0 0 30rpx 30rpx;
    }

    &-content {
    }
  }
}

.line {
  height: 1rpx;
  background: #E6E6E6;
}

.attr {
  height: 68rpx;
  border: 1rpx solid #00CBCC;
  padding: 0 20rpx;
  font-size: 28rpx;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 0 30rpx 30rpx;

  &.check {
    background: #00CBCC;
    color: #fff;
  }

  &.disabled {
    border: none;
    background: #f5f7fa;
    color: #ccced3;
  }
}

.cart-num {
  font-size: 24rpx;

  .input {
    width: 120rpx;

    input {
      width: 100%;
      text-align: center;
      color: #333;
    }
  }

  .button {
    font-size: 32rpx;
    width: 40rpx;
    height: 40rpx;
    aspect-ratio: 1/1;
    border-radius: 5rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .3s;
    border: 1px solid #999999;

    &:active {
      scale: 1.2;
    }

    &.disabled {
      border-color: #dddddd;

      :deep(.uv-icon__icon) {
        color: #dddddd !important;
      }

      &:active {
        scale: 1;
      }
    }
  }
}

.gap {
  gap: 20rpx;
}

</style>
