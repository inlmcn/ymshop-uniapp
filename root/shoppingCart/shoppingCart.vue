<template>
  <Header
      :scroll-top="scrollTop"
      system-bar-area-bg="#fff"
      header-area-bg="#fff"
      bg-change-by-scroll
      :show-return="false"
  >
    <template #right>
      <view
          class="flex flex-ai__base"
          @click="manage=!manage">
        <uv-icon
            :name="!manage?'car':'car-fill'"
            class="icon-item"
            size="16" />
        {{ manageStr }}
      </view>
    </template>
    购物车
  </Header>
  <!-- have data  -->
  <view v-if="!showEmpty">
    <!-- cart body box-->
    <uv-checkbox-group
        v-model="shoppingSelect"
        shape="circle"
        activeColor="#00CBCC"
        @change="handleSingleSelect"
    >
      <view class="shopping-checkbox">
        <!-- 购物车信息 -->
        <UniSwipeAction :autoClose="false">
          <UniSwipeActionItem
              v-for="(item) in cartList"
              :key="item.id">
            <view class="shopping-item">
              <uv-checkbox
                  :name="item.id"
              />
              <view class="good">
                <Goods
                    :rounded="false"
                    row
                    imgWidth="200rpx"
                    info-padding="0 0 0 40rpx"
                    :goods="item.productInfo"
                >
                  <template #options>
                    <view class="goods-options">
                      <!-- sku select -->
                      <view class="sku-row flex">
                        <view
                            class="sku-info flex flex-jc__sb flex-ai__center"
                            @click.stop="handleOpenSkuSelect(item,goodsAttrSelectRef)"
                        >
                          <view class="info">
                            {{ item.productInfo && item.productInfo.attrInfo && item.productInfo.attrInfo.sku }}
                          </view>
                          <uv-icon
                              class="icon"
                              name="arrow-down"
                              color="#ccc"
                              size="12"
                          />
                        </view>
                      </view>
                      <!-- bottom -->
                      <view class="price-row flex flex-ai__center flex-jc__sb">
                        <!-- price -->
                        <view class="price-box flex flex-ai__end">
                          ￥{{ item.truePrice }}
                          <view class="old-price">
                            ￥{{ item.productInfo.otPrice }}
                          </view>
                        </view>
                        <!-- cart number -->
                        <view
                            class="cart-num flex flex-ai__center flex-jc__sb"
                            @click.stop=""
                        >
                          <view
                              class="button"
                              :class="item.cartNum <= 1 && 'disabled'"
                              @click="handleCartNumberChange(item,'minus')"
                          >
                            <uv-icon
                                name="minus"
                                color="#333"
                                size="18rpx"
                            ></uv-icon>
                          </view>
                          <view class="input">
                            <input
                                type="number"
                                inputmode="numeric"
                                v-model="item.cartNum"
                                @blur="(e)=>handleCartNumberInputChange(e,item)"
                                @input="(e)=>cartNumberInput(e,item)"
                            >
                          </view>
                          <view
                              class="button"
                              :class="item.cartNum >= item.trueStock && 'disabled'"
                              @click="handleCartNumberChange(item,'plus')"
                          >
                            <uv-icon
                                name="plus"
                                color="#333"
                                size="18rpx"
                            ></uv-icon>
                          </view>
                        </view>
                      </view>
                    </view>
                  </template>
                </Goods>
              </view>
            </view>
            <template #right>
              <view
                  class="delete-icon"
                  @click="openDelModal(modalRef,item)">
                <uv-icon
                    name="trash"
                    color="#fff" />
              </view>
            </template>
          </UniSwipeActionItem>
        </UniSwipeAction>

        <!-- 选中了的结算统计信息 -->
        <view :class="{'select-product-settle-info':true,show:shoppingSelect.length>0}">
          <view
              class="row flex flex-ai__center flex-jc__sb"
              v-for="(item,index) in settleFields"
              :key="index"
          >
            <view class="label">
              {{ item.label }}
            </view>
            <view v-if="statisticsInfo">
              {{ item.prefix }} {{ statisticsInfo[item.field].toFixed(2) }}
            </view>
          </view>
        </view>
      </view>
    </uv-checkbox-group>
    <!-- bottom action row -->
    <view class="screen action-bar ">
      <view class="action-info">
        <view class="action-checkbox">
          <uv-checkbox-group
              shape="circle"
              activeColor="#00CBCC"
          >
            <uv-checkbox
                name="all"
                :checked="shoppingSelectAll"
                @change="handleSelectAll"
            >
              全选
            </uv-checkbox>
          </uv-checkbox-group>
        </view>
      </view>
      <view class="action-btns">
        <view
            class="action-total"
            v-show="!manage"
        >
          总计：￥{{ statisticsInfo ? statisticsInfo.totalPrice.toFixed(2) : "0.00" }}
        </view>
        <view
            class="button"
            v-if="!manage"
            @click="submitOrder"
        >结算
        </view>
        <view
            v-else
            class="button"
            @click="openDelModal(modalRef)"
        >
          删除
        </view>
      </view>
    </view>

  </view>
  <!-- null data -->
  <CartEmpty v-else />
  <!-- 商品推荐 -->
  <Recommend />
  <view class="action-height"></view>
  <view class="h5-tabbar-height"></view>
  <!-- sku select -->
  <GoodAttrSelect
      style="z-index: 999"
      :id="openSkuProductId"
      ref="goodsAttrSelectRef"
      :goods-detail="openProductItem"
      :sku-id="openSkuSkuId"
      @select="(e)=>handleSubmitSkuSelect(e, goodsAttrSelectRef,cartList,handleCartNumberInputChange,doGetCartList)
"
  />
  <!-- delete modal -->
  <Modal
      ref="modalRef"
      content="确认要删除这些购物车数据吗？"
      @confirm="doDelete"
      @cancel="doDelCancel"
  />
  <ReturnTop :scroll-top="scrollTop" />
</template>

<script setup>
import { ref } from 'vue'
import Goods from "@/components/goodsComponents/Goods.vue";
import GoodAttrSelect from "@/components/good-attr-select/good-attr-select.vue";
import UniSwipeAction from "@/pages/components/Uni/uni-swipe-action/uni-swipe-action.vue";
import UniSwipeActionItem from "@/pages/components/Uni/uni-swipe-action-item/uni-swipe-action-item.vue";
import Modal from "@/components/Modal/index.vue"
import { settleFields } from "@/root/shoppingCart/index.data";
import { useCartData, useCartNumber, useCartOption, useSku } from "@/root/shoppingCart/index.utils";
import CartEmpty from "@/root/shoppingCart/components/CartEmpty.vue";
import Header from "@/components/Header/index.vue"
import { onHide } from "@dcloudio/uni-app";
import Recommend from "@/components/Recommend/index.vue";
import { useScroll } from "@/hooks/useScroll";
import ReturnTop from "@/components/ReturnTop/index.vue"


const modalRef = ref() // 删除弹窗
const goodsAttrSelectRef = ref() // 更改sku

const {
  showEmpty,
  cartList,
  doGetCartList
} = useCartData();

const {
  manage,
  manageStr,
  shoppingSelect,
  shoppingSelectAll,
  handleSingleSelect,
  handleSelectAll,
  statisticsInfo,
  computeSelectInfoByShoppingSelect,
  openDelModal,
  doDelete,
  doDelCancel,
  submitOrder,
} = useCartOption({cartList, doGetCartList})

const {
  openSkuSkuId,
  openProductItem,
  openSkuProductId,
  handleOpenSkuSelect,
  handleCloseSkuSelect,
  handleSubmitSkuSelect
} = useSku()


const {
  handleCartNumberInputChange,
  handleCartNumberChange,
  cartNumberInput
} = useCartNumber({afterChange: computeSelectInfoByShoppingSelect})


onHide(() => {
  modalRef.value?.close()
  goodsAttrSelectRef.value?.close()
})

const {scrollTop} = useScroll()
</script>

<style lang="scss">
// 商品SKU 数量等操作条
.goods-options {
  width: 100%;

  .sku-row {
    margin-bottom: 30rpx;

    .sku-info {
      @include usePadding(10, 4);
      border: 1rpx solid #ccc;
      border-radius: 5rpx;
      font-size: 24rpx;
      transition: all .3s;
      max-width: 100%;


      .info {
        width: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      &:active {
        scale: 1.1;
      }

      .icon {
        margin-left: 15rpx;
      }
    }
  }

  .price-row {
    width: 100%;

    .price-box {
      font-size: 30rpx;

      .old-price {
        font-size: 20rpx;
        color: $tips-color;
        text-decoration: line-through;
        margin-left: 10rpx;
      }
    }

    .cart-num {
      font-size: 24rpx;

      .input {
        width: 70rpx;


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
  }
}

.action-bar {
  z-index: 1000;
  height: 100rpx;


  .action-btns {
    height: 100%;
    padding: 0 0;

    .action-total {
      padding-right: 30rpx;
      font-size: 34rpx;
    }

    .button {
      margin: 0 0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 50rpx;
      background: $primary-color;
      color: $white-color;
    }
  }
}

// #ifndef H5
.action-height {
  width: 100%;
  height: 100rpx;
  background: #fff;
}

// #endif

.shopping-checkbox {
  width: 100%;
  @include usePadding(20, 20);

  .shopping-item {
    display: flex;
    align-items: center;
    padding: 20rpx;
    box-sizing: border-box;
    background: #fff;
    border-radius: 30rpx;
    box-shadow: 0 0 10rpx #efefef;
    margin: 10rpx 0;
    //border-bottom: 1rpx solid #efefef;

    .good {
      width: 93%;
      position: relative;
    }

  }

  .delete-icon {
    margin: 10rpx 0 10rpx 20rpx;
    width: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $primary-color;
    border-radius: 30rpx;
    transition: all .3s;

    &:active {
      scale: .9;
    }
  }
}
</style>
