<template>
  <goods
    card
    :data="goodsData"
    :storeName="goodsData.storeName"
    :price="goodsData.price"
    :stock="goodsData.stock"
    surplus="200"
    link
  />
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps(['data'])

const goodsData = props.data

</script>

<style lang="scss">
.goods {
  width: 100%;
  padding: 30rpx 0;

  &-card {
    display: flex;
    flex-direction: column;

    .goods {
      &-content {
        padding: 0 20rpx;
        display: flex;
        flex-direction: column;
      }

      &-info {
        margin-top: 15rpx;
      }

      &-thumb {
        margin-bottom: 15rpx;
        width: 100%;
        height: 203rpx;

        &-img {
          width: 100%;
          height: 100%;
          display: block;
        }
      }

    }
  }

  &-thumb {
    background: #FAFAFA;
  }

  &-title {
    line-height: 40rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333333;
  }



  &-price {
    &-row {
      display: flex;
      align-items: center;

      .goods-price {}
    }

    &-primary {
      line-height: 42rpx;
      font-size: 30rpx;
      font-weight: 500;
      color: #00CBCC;
    }

    &-default {
      line-height: 40rpx;
      font-size: 28rpx;
      font-weight: 500;
      color: #333333;
    }

    &-original {
      margin-left: 9rpx;
      line-height: 28rpx;
      font-size: 20rpx;
      color: #999999;
      text-decoration: line-through;
    }

  }


  &-desc {
    line-height: 33rpx;
    font-size: 24rpx;
    color: #999999;
  }

  &-info {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    &-left {}

    &-action {
      &-btn {}

      &-desc {
        line-height: 28rpx;
        font-size: 20rpx;
        color: #999999;
      }
    }


  }

  &-image {
    &-img {}
  }

  &-list {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 14rpx;

    .goods {
      &-thumb {
        margin-bottom: 0;
        width: 220rpx;
        height: 220rpx;

        &-img {
          width: 100%;
          height: 100%;
          display: block;
        }
      }

      &-content {
        padding-right: 40rpx;
        margin-left: 30rpx;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
    }
  }


  // .goods {
  //   padding: 16rpx 14rpx;

  //   &-header {
  //     display: flex;
  //     align-items: flex-start;
  //   }

  //   &-thumb {

  //     width: 220rpx;
  //     height: 220rpx;

  //     &-img {
  //       width: 100%;
  //       height: 100%;
  //       display: block;
  //     }
  //   }

  //   &-content {
  //     margin-top: 24rpx;
  //     margin-left: 40rpx;
  //     flex: 1
  //   }

  //   &-title {
  //     line-height: 40rpx;
  //     font-size: 28rpx;
  //     font-weight: 500;
  //     color: #333333;
  //     margin-bottom: 35rpx;
  //   }

  //   &-info {
  //     display: flex;
  //     align-items: center;
  //     justify-content: space-between;

  //     &-left {
  //       display: flex;
  //       align-items: flex-end;

  //     }

  //     &-action {
  //       &-btn {}

  //       &-desc {
  //         color: #999999;
  //         font-size: 24rpx;
  //         line-height: 40rpx;
  //       }
  //     }

  //   }


  //   &-price {
  //     &-default {
  //       line-height: 28rpx;
  //       font-size: 20rpx;
  //       color: #999999;

  //     }

  //     &-primary {
  //       line-height: 42rpx;
  //       font-size: 30rpx;
  //       font-weight: 500;
  //       color: #00CBCC;
  //       margin-left: 5rpx;
  //     }
  //   }



  //   &-desc {
  //     color: #999999;
  //     font-size: 24rpx;
  //     line-height: 40rpx;
  //   }


  //   &-model {
  //     display: inline-flex;
  //     align-items: center;
  //     width: auto;
  //     height: 40rpx;
  //     border: 1px solid #CCCCCC;
  //     opacity: 1;
  //     border-radius: 0rpx;
  //     padding: 0 10rpx;

  //     margin-bottom: 28rpx;

  //     &-label {
  //       line-height: 38rpx;
  //       font-size: 24rpx;
  //       color: #999999;
  //     }

  //     &-value {
  //       line-height: 38rpx;
  //       font-size: 24rpx;
  //       color: #333333;
  //       margin-right: 10rpx;
  //     }

  //     &-action {
  //       width: 11rpx;
  //       height: 7rpx;
  //     }
  //   }

  //   &-model-info {
  //     display: inline-flex;
  //     align-items: center;
  //     width: auto;
  //     height: 40rpx;
  //     opacity: 1;
  //     border-radius: 0rpx;
  //     margin-bottom: 28rpx;

  //     &-label {
  //       line-height: 38rpx;
  //       font-size: 24rpx;
  //       color: #999999;
  //     }

  //     &-value {
  //       line-height: 38rpx;
  //       font-size: 24rpx;
  //       color: #333333;
  //       margin-right: 10rpx;
  //     }

  //     &-action {
  //       width: 11rpx;
  //       height: 7rpx;
  //     }
  //   }
  // }
}

.buy-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &-info {
    flex: 1;

    &-desc {
      color: #999999;
      font-size: 24rpx;
      line-height: 32rpx;
    }
  }

  &-action {
    margin-left: 17rpx;
  }
}

.buy-num {

  &-info-desc {
    color: #999999;
    font-size: 24rpx;
    line-height: 32rpx;
  }
}
</style>
