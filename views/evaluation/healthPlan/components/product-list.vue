<template>
  <view>
    <view class="health-product xtop" v-if="topProducts && topProducts.length">
      <image :src="EVALUATION_IMG_PATH + 'product_top_back2.png'" mode="widthFix" />
      <view class="health-product-title">
        <view>核心目标</view>
        <text>基于你最关心的健康目标，我们强烈推荐您服用以下补剂</text>
      </view>
      <view class="health-product-list">
        <view class="health-product-item" v-for="item in topProducts" :key="item.id">
          <view class="health-product-item-basic">
            <view class="health-product-item-left">
              <view class="health-product-item-checked-wrapper" @click="changeChecked(item)">
                <view class="health-product-item-checked" v-if="!isNewUser">
                  <image v-if="item.checked" :src="EVALUATION_IMG_PATH + 'product_top_checked.png'" mode="widthFix" />
                  <text v-else></text>
                </view>
              </view>
              <view class="health-product-item-image-wrapper">
                <view class="health-product-item-image" @click="GoodsDetail(item)">
                  <image :src="item.image" mode="aspectFit" />

                  <view class="health-product-item-image-tag">
                    <image :src="EVALUATION_IMG_PATH + 'product_hx.png'" mode="widthFit" />
                  </view>
                </view>
                <view class="health-product-item-spec-tag">
                  <text v-if="item.defaultNumber">{{ item.defaultNumber }}</text>
                </view>
              </view>
            </view>
            <view class="health-product-item-info">
              <view class="health-product-item-title">
                <text class="health-product-item-title-text uv-line-1" @click="GoodsDetail(item)">{{ item.storeName }}</text>
                <view @click="openTestResult(item)">
                  <text>通过{{ item.costNum }}项检测</text>
                  <uv-icon name="arrow-right" size="20rpx"></uv-icon>
                </view>
              </view>
              <view class="health-product-item-desc" :class="{
                expanded: item.isOpen,
                more: item.showMore && !item.isOpen,
              }">
                <view class="health-product-item-desc-inner" :id="'productDesc' + item.id" @click="GoodsDetail(item)">
                  {{ item.storeInfo }}
                </view>
                <view class="home-doctor-info-more" v-if="item.showMore && item.isOpen" @click="toggleDesc(item)">
                  收起
                  <uv-icon name="arrow-up" size="24rpx" color="#999999" />
                </view>
                <view class="home-doctor-info-more" v-if="item.showMore && !item.isOpen"
                  @click="toggleDesc(item)">
                  展开
                  <uv-icon name="arrow-down" size="24rpx" color="#999999" />
                </view>
              </view>
            </view>
          </view>

          <view class="health-product-item-tags">
            <view class="health-product-item-tag" :style="{
              backgroundColor: tag.bgColor,
              borderColor: tag.borderColor,
              color: tag.fontColor,
            }" v-for="(tag, tagI) in item.labelList || []" :key="tagI">
              <text>{{ tag.tagName }}</text>
            </view>
          </view>

          <view class="health-product-item-price" v-if="!isNewUser">
            <view class="health-product-item-price-wrapper">
              <view class="health-product-item-now">
                ￥{{ item.price }}元<text>/月</text>
              </view>
              <view v-if="item.comparePrice" class="health-product-item-compare">
                {{ item.comparePrice }}</view>
            </view>
            <!-- <view class="health-product-item-original" v-if="item.otPrice"> {{ item.otPrice }}元 </view> -->
            <!-- item.mrkxls -->
            <view style="margin-left: 24rpx">
              <uv-number-box :min="item.minNumber" v-model="item.onSale" @overlimit="(val) => overlimit(val, item.minNumber)">
                <template #minus>
                  <view class="health-product-item-number-box-minus">
                    <uv-icon name="minus" size="24rpx":color="item.onSale > item.minNumber ? '#F12615' : '#FF978B'" bold></uv-icon>
                  </view>
                </template>
                <template #input>
                  <input v-model="item.onSale" type="number" :min="item.minNumber" class="health-product-item-number-box-input" @input="handleInputOnSale(item, $event)" @change="handleChangeOnSale(item, $event)" />
                </template>
                <template #plus>
                  <view class="health-product-item-number-box-plus">
                    <uv-icon name="plus" size="24rpx" color="#F12615" bold></uv-icon>
                  </view>
                </template>
              </uv-number-box>
            </view>
          </view>
          <view @click="goPayItem(item)" class="health-product-item-price" style="margin-left: 0"
            v-else>
            <view class="l">
              <view class="health-product-item-now">
                ￥{{ item.price }}元<text>/月</text>
              </view>
              <!-- <view class="health-product-item-original" v-if="item.otPrice"> {{ item.otPrice }}元 </view> -->
              <view class="price-area">{{ item.comparePrice }}</view>
            </view>
            <image :src="EVALUATION_IMG_PATH + 'qiang_top.png'" mode="widthFix" />
          </view>
        </view>
      </view>
    </view>
    <view class="health-product">
      <view class="health-product-title">
        <view>协同增效</view>
        <text>基于你关注的健康目标，我们还建议您服用以下补剂</text>
      </view>
      <view class="health-product-list">
        <view class="health-product-item" v-for="item in noTopProducts" :key="item.id">
          <view class="health-product-item-basic">
            <view class="health-product-item-left">
              <view class="health-product-item-checked-wrapper" @click="changeChecked(item)">
                <view class="health-product-item-checked" v-if="!isNewUser">
                  <image v-if="item.checked" :src="EVALUATION_IMG_PATH + 'checked_icon.png'" mode="widthFix" />
                  <text v-else></text>
                </view>
              </view>
              <view class="health-product-item-image-wrapper">
                <view class="health-product-item-image" @click="GoodsDetail(item)">
                  <image :src="item.image" mode="aspectFit" />
                  <view class="health-product-item-image-tag">
                    <image v-if="item.goodstag === '巩固'" :src="EVALUATION_IMG_PATH + 'product_gg.png'"
                      mode="widthFit" />
                    <image v-if="item.goodstag === '关键'" :src="EVALUATION_IMG_PATH + 'product_tj.png'"
                      mode="widthFit" />
                    <image v-if="item.goodstag === '自选'" :src="EVALUATION_IMG_PATH + 'product_zx.png'"
                      mode="widthFit" />
                  </view>
                </view>
                <view class="health-product-item-spec-tag">
                  <text v-if="item.defaultNumber">{{ item.defaultNumber }}</text>
                </view>
              </view>
            </view>
            <view class="health-product-item-info">
              <view class="health-product-item-title">
                <text class="health-product-item-title-text uv-line-1" @click="GoodsDetail(item)">{{ item.storeName }}</text>
                <view @click="openTestResult(item)">
                  <text>通过{{ item.costNum }}项检测</text>
                  <uv-icon name="arrow-right" size="20rpx"></uv-icon>
                </view>
              </view>
              <view class="health-product-item-desc" :class="{
                expanded: item.isOpen,
                more: item.showMore && !item.isOpen,
              }">
                <view class="health-product-item-desc-inner" :id="'productDesc' + item.id" @click="GoodsDetail(item)">
                  {{ item.storeInfo }}
                </view>
                <view class="home-doctor-info-more" v-if="item.showMore && item.isOpen" @click="toggleDesc(item)">
                  收起
                  <uv-icon name="arrow-up" size="24rpx" color="#999999" />
                </view>
                <view class="home-doctor-info-more" v-if="item.showMore && !item.isOpen"
                  @click="toggleDesc(item)">
                  展开
                  <uv-icon name="arrow-down" size="24rpx" color="#999999" />
                </view>
              </view>
            </view>
          </view>

          <view class="health-product-item-tags">
            <view class="health-product-item-tag" :style="{
              backgroundColor: tag.bgColor,
              borderColor: tag.borderColor,
              color: tag.fontColor,
            }" v-for="(tag, tagI) in item.labelList || []" :key="tagI">
              <text>{{ tag.tagName }}</text>
            </view>
          </view>

          <view class="health-product-item-price" v-if="!isNewUser">
            <view class="health-product-item-price-wrapper">
              <view class="health-product-item-now">
                ￥{{ item.price }}元<text>/月</text>
              </view>
              <view v-if="item.comparePrice" class="health-product-item-compare">
                {{ item.comparePrice }}</view>
            </view>
            <!-- <view class="health-product-item-original" v-if="item.otPrice"> {{ item.otPrice }}元 </view> -->
            <!-- item.mrkxls -->
            <view style="margin-left: 24rpx">
              <uv-number-box @overlimit="(val) => overlimit(val, item.minNumber)" :min="item.minNumber"
                v-model="item.onSale">
                <template #minus>
                  <view class="health-product-item-number-box-minus">
                    <uv-icon name="minus" size="24rpx" :color="item.onSale > item.minNumber ? '#000000' : '#B9B9B9'" bold></uv-icon>
                  </view>
                </template>
                <template #input>
                  <input v-model="item.onSale" type="number" :min="item.minNumber" class="health-product-item-number-box-input" @input="handleInputOnSale(item, $event)" @change="handleChangeOnSale(item, $event)" />
                </template>
                <template #plus>
                  <view class="health-product-item-number-box-plus">
                    <uv-icon name="plus" size="24rpx" color="#000000" bold></uv-icon>
                  </view>
                </template>
              </uv-number-box>
            </view>
          </view>
          <view @click="goPayItem(item)" class="health-product-item-price" style="margin-left: 0"
            v-else>
            <view class="l">
              <view class="health-product-item-now">
                ￥{{ item.price }}元<text>/月</text>
              </view>
              <!-- <view class="health-product-item-original" v-if="item.otPrice"> {{ item.otPrice }}元 </view> -->
              <view class="price-area">{{ item.comparePrice }}</view>
            </view>
            <image :src="EVALUATION_IMG_PATH + 'qiang.svg'" mode="widthFix" />
          </view>
        </view>
      </view>

      <view class="health-product-footer">
        <view class="health-product-footer-info">
          <image :src="EVALUATION_IMG_PATH + 'product_bx.png'" mode="widthFix" />
        </view>
        <view class="health-product-footer-tip">
          <view class="health-product-footer-tip-left" @click="openAssurancePopup">
            <image :src="EVALUATION_IMG_PATH + 'bz_icon.png'" mode="widthFix" />
            消费者权益保障
          </view>
          <view class="health-product-footer-tip-right">
            正品保障｜放心买｜品质严保
          </view>
        </view>
      </view>
    </view>
    <!-- 保障弹窗（居中） -->
    <AssurancePopup ref="assurancePopupRef" />

    <!-- 全面检测弹窗组件 -->
    <TestResultModal ref="testResultModalRef" />
  </view>
</template>

<script setup>
import { ref, computed, watch, getCurrentInstance, nextTick } from "vue";
import { EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import AssurancePopup from "@/components/AssurancePopup/index.vue";
import TestResultModal from "../../components/TestResultModal.vue";

const instance = getCurrentInstance();
const assurancePopupRef = ref(null);
const testResultModalRef = ref(null);

const openAssurancePopup = () => {
  assurancePopupRef.value?.open?.();
};
const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  elseProducts: {
    type: Array,
    default: () => [],
  },
  showBottomTip: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "推荐产品",
  },
  isNewUser: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggleDesc", "changeMore", "changeChecked","goDetail"]);

// 核心目标产品列表
const topProducts = computed(() => {
  return props.products.filter((o) => o.goodstag === "核心");
});

// 协同增效产品列表 按照关键、巩固、自选排序
const noTopProducts = computed(() => {
  const list = props.products.filter((o) => o.goodstag !== "核心");

  const sortMap = {
    '关键': 0,
    '巩固': 1,
    '自选': 2,
  }
  
  list.sort((a, b) => (sortMap[a.goodstag] ?? 999) - (sortMap[b.goodstag] ?? 999));
  return list;
});

const overlimit = (type, num) => {
  console.log(type);
  if (type === "minus") {
    uni.showToast({
      title: `最低不能低于${num}件`,
      icon: "none",
    });
  }
};

const GoodsDetail = (item) => {
  emit("goDetail", item.id);
};

const changeChecked = (item) => {
  item.checked = !item.checked;
};

const goPayItem = (item, type) => {
  emit("goPayItem", item, type);
};

watch(() => props.products, () => {
  // 在 DOM 更新后检查文本高度
  setTimeout(() => {
    checkTextHeight();
  }, 1000);
}, {
  immediate: true,
  deep: true,
});

// 修改：增强版检查文本高度的函数，处理null返回值的情况
const checkTextHeight = () => {
  props.products.forEach((item) => {
    // 确保元素存在再进行查询
    const selector = `#productDesc${item.id}`;
    uni
      .createSelectorQuery()
      .in(instance.proxy)
      .select(selector)
      .boundingClientRect((res) => {
        if (res) {
          // 如果高度超过 90rpx (约 3行的高度)，则显示展开按钮
          if (res.height > 36) {
            emit("changeMore", item);
          }
        }
      })
      .exec();
  });
};

const toggleDesc = (item) => {
  emit("toggleDesc", item);
};


const openTestResult = (item) => {
  testResultModalRef.value.open(item.id);
};

const handleInputOnSale = async (item, e) => {
  const value = e.detail.value;
  if (value === '') return;

  await nextTick();
  if (value < item.minNumber) {
    item.onSale = item.minNumber;
  }
};

const handleChangeOnSale = async (item, e) => {
  const value = e.detail.value;

  await nextTick();
  if (value < item.minNumber) {
    item.onSale = item.minNumber;
  }
};
</script>

<style lang="scss" scoped>
.health-product {
  border: 1px solid #e5e5e5;
  border-radius: 34rpx;
  margin: 30rpx;

  &.xtop {
    position: relative;
    border: 0;
    // 旋转渐变
    background: linear-gradient(45deg, #fef3f1 0%, #fffcfb 50%, #fff7f4);
    box-shadow: inset 1rpx -4rpx 15rpx 2rpx #FFE1E1;
    overflow: hidden;
    
    .health-product-item {
      padding-bottom: 60rpx;
    }

    &>image {
      position: absolute;
      left: -3px;
      bottom: -3px;
      width: 176rpx;
      height: 160rpx;
      display: block;
      z-index: 2;
    }

    &>view {
      position: relative;
      z-index: 1;
    }

    .health-product-item-tag {
      background-color: #fff2d3;
      color: #4a2d02;
    }

    .health-product-item-spec-tag {
      background-color: #ffe2dd;
      color: #fd5041;
    }

    .health-product-item-now {
      color: #fd5041;
    }

    .health-product-item-checked text {
      border: 2rpx solid #fd5041;
    }

    .health-product-item-price {
      .l {
        background: #FFE4E4;
        
        .price-area {
          color: #FD2F1E;
        }
      }
    }

    .health-product-item-number-box-minus,
    .health-product-item-number-box-plus,
    .health-product-item-number-box-input {
      background-color: #FFE4E4;
    }

    .health-product-item-number-box-input {
      color: #F12615;
    }
  }
}

.health-product-title {
  padding: 30rpx 30rpx 0;
  &>view {
    font-size: 28rpx;
    font-weight: 600;
    position: relative;
    border-left: 6rpx solid #333333;
    padding-left: 10rpx;
    line-height: 30rpx;
  }

  &>text {
    color: #535353;
    font-size: 22rpx;
    margin-top: 6rpx;
    line-height: 28rpx;
    display: block;
  }
}

.health-product-item {
  padding: 30rpx 30rpx 30rpx 0;
}

.health-product-item-basic {
  display: flex;
  align-items: flex-start;
}

.health-product-item-left {
  display: flex;
  justify-content: space-between;
}

.health-product-item-checked-wrapper {
  width: 62rpx;
  height: 114rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.health-product-item-checked {
  width: 32rpx;
  height: 32rpx;

  image {
    display: block;
    width: 100%;
    height: 100%;
  }

  text {
    width: 28rpx;
    height: 28rpx;
    border: 2rpx solid #00cbcc;
    border-radius: 50%;
    display: block;
  }
}

.health-product-item-image-wrapper {
  position: relative;
}

.health-product-item-image {
  position: relative;
  border-radius: 15rpx;
  width: 114rpx;
  height: 114rpx;
  border: 2rpx solid #f1f1f1;
  overflow: hidden;
  box-sizing: border-box;

  &>image {
    width: 100%;
    height: 100%;
    display: block;
  }

  .health-product-item-image-tag {
    position: absolute;
    left: 0;
    top: 0;

    image {
      width: 48rpx;
      height: 32rpx;
    }
  }
}

.health-product-item-spec-tag {
  position: absolute;
  bottom: -12rpx;
  left: 50%;
  transform: translate(-50%, 100%);
  padding: 0 6rpx;
  width: 114rpx;
  height: 24rpx;
  line-height: 24rpx;
  font-weight: 400;
  font-size: 16rpx;
  color: #17d0d1;
  white-space: nowrap;
  text-align: center;
  background-color: #eaffff;
  overflow: hidden;
  border-radius: 8rpx;
  box-sizing: border-box;
}

.health-product-item-info {
  margin-left: 35rpx;
  flex: 1;
}

.health-product-item-title {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .health-product-item-title-text {
    font-weight: 600;
    font-size: 28rpx;
    color: #222222;
    line-height: 32rpx;
    text-align: left;
    font-style: normal;
    text-transform: none;
    flex:0 0 260rpx;
  }

  &>view {
    font-weight: 400;
    font-size: 22rpx;
    display: flex;
    line-height: 32rpx;
    align-items: center;
    color: #595959;

    text {
      margin-right: 10rpx;
    }
  }
}

.health-product-item-desc {
  margin-top: 18rpx;
  font-weight: 400;
  font-size: 22rpx;
  color: #222222;
  line-height: 28rpx;
  height: 56rpx;
  position: relative;
  overflow: hidden;
  text-align: justify;

  &.expanded {
    height: auto;
    padding-bottom: 28rpx;
  }

  &.more {
    // 三行
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
  }
}

.health-product-item-tags {
  margin-top: 12rpx;
  padding-left: 210rpx;
  display: flex;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
}

.health-product-item-tag {
  padding: 0 12rpx;
  font-weight: 400;
  font-size: 16rpx;
  background: #e9eeff;
  border-radius: 8rpx;
  white-space: nowrap;
  height: 24rpx;
  line-height: 24rpx;
  color: #4c4036;
  box-sizing: border-box;
}

.health-product-item-price {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
  // 强制不换行
  white-space: nowrap;
  margin-top: 36rpx;
  padding-left: 188rpx;

  .l {
    width: calc(100% - 84rpx);
    height: 55rpx;
    display: flex;
    align-items: center;
    background-color: #eaffff;
    font-size: 22rpx;
    color: #00cbcc;
    padding: 5rpx 15rpx;
    border-radius: 10rpx 0 0 10rpx;
    box-sizing: border-box;

    .price-area {
      font-size: 16rpx;
      margin-left: 8rpx;
    }
  }

  &>image {
    width: 65rpx;
    height: 55rpx;
    display: block;
    image-rendering: -webkit-optimize-contrast;
    /* Safari */
    image-rendering: crisp-edges;
    /* Firefox */
    image-rendering: pixelated;
    /* Chrome, Edge */
  }
}

.health-product-item-price-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.health-product-item-now {
  font-weight: 600;
  font-size: 30rpx;
  color: #00cbcc;
  line-height: 24rpx;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

.health-product-item-compare {
  margin-top: 10rpx;
  font-weight: 400;
  font-size: 22rpx;
  color: #5E5E5E;
  line-height: 26rpx;
}

.health-product-item-original {
  font-weight: 400;
  font-size: 24rpx;
  color: #848484;
  line-height: 24rpx;
  text-align: left;
  font-style: normal;
  text-decoration-line: line-through;
  text-transform: none;
  margin-left: 10rpx;
}

.home-doctor-info-more {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 140rpx;
  height: 28rpx;
  font-size: 22rpx;
  color: #5E5E5E;
  line-height: 28rpx;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10rpx;
  background: linear-gradient(-90deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(255, 255, 255, 1) 50%,
      rgba(255, 255, 255, 0.5) 100%);
}

.health-product-footer {
  margin: 0 50rpx;
  padding-top: 30rpx;
  padding-bottom: 36rpx;
  border-top: 1px solid #e5e5e5;
}

.health-product-footer-info {
  display: flex;
  align-items: center;
  justify-content: center;

  &>image {
    width: 191rpx;
    height: 48rpx;
  }
}

.health-product-footer-info-left {
  text {
    display: block;
    font-weight: 500;
    font-size: 24rpx;
    color: #868686;
    line-height: 34rpx;
  }

  view {
    font-weight: 500;
    font-size: 28rpx;
    color: #222222;
    margin-top: 10rpx;
  }
}

.health-product-footer-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  margin-top: 20rpx;
}

.health-product-footer-tip-left {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 24rpx;
  color: #02c655;
  margin-right: 20rpx;

  image {
    width: 24rpx;
    height: 24rpx;
    margin-right: 8rpx;
  }
}

.health-product-item-number-box-minus {
  margin-right: 1px;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f1f1;
  border-radius: 8rpx 0 0 8rpx;
}

.health-product-item-number-box-input {
  width: 65rpx;
  height: 48rpx;
  min-height: 30rpx;
  line-height: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  background-color: #f1f1f1;
  overflow: hidden;
  font-size: 24rpx;
  text-align: center;
}

.health-product-item-number-box-plus {
  margin-left: 1px;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f1f1;
  border-radius: 0 8rpx 8rpx 0;
}
</style>
