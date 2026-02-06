<template>
  <view class="health-product">
    <view class="health-product-title">
      <view>推荐产品</view>
      <text>基于你的健康目标和情况，我们推荐你服用以下营养补剂</text>
    </view>
    <view class="health-product-list">
      <view class="health-product-item" v-for="(item, index) in products" :key="item.id">
        <view class="health-product-item-checked" @click="changeChecked(index)" v-if="!isNewUser">
          <image v-if="item.checked" :src="EVALUATION_IMG_PATH + 'checked_icon.png'" mode="widthFix" />
          <text v-else></text>
        </view>
        <view class="health-product-item-image" @click="GoodsDetail(item)"
          :style="{ margin: !isNewUser ? '0 20rpx 0 10rpx' : '0 20rpx 0 0' }">
          <image :src="item.image" mode="aspectFit" />
        </view>
        <view class="health-product-item-info"
          :style="{ width: !isNewUser ? 'calc(100% - 200rpx)' : 'calc(100% - 160rpx)' }">
          <view class="health-product-item-title">
            <text @click="GoodsDetail(item)">{{ item.storeName }}</text>
            <view @click="openDrugDetail(item)">查看检测报告 <uv-icon style="margin-left: 10rpx" name="arrow-right"
                size="14"></uv-icon></view>
          </view>
          <view class="health-product-item-desc"
            :class="{ expanded: item.isOpen, more: item.showMore && !item.isOpen }">
            <view class="health-product-item-desc-inner" :id="'productDesc' + item.id" @click="GoodsDetail(item)">
              {{ item.storeInfo }}
            </view>
            <view class="home-doctor-info-more" v-if="item.showMore && item.isOpen" @click="toggleDesc(index)">
              <uv-icon name="arrow-up" size="24rpx" color="#999999" />
              收起
            </view>
            <view class="home-doctor-info-more" v-if="item.showMore && !item.isOpen" @click="toggleDesc(index)">
              <uv-icon name="arrow-down" size="24rpx" color="#999999" />
              展开
            </view>
          </view>
          <view class="health-product-item-bottom">
            <view class="health-product-item-tags">
              <view class="health-product-item-tag" :style="{backgroundColor:tag.bgColor,borderColor:tag.borderColor,color:tag.fontColor}" v-for="(tag, tagI) in item.labelList || []" :key="tagI">
                <text>{{ tag.tagName }}</text>
              </view>
            </view>
            <view class="health-product-item-price" v-if="!isNewUser">
              <view class="health-product-item-now"> {{ item.price }}元<text>/月</text> </view>
              <view class="health-product-item-original" v-if="item.otPrice"> {{ item.otPrice }}元 </view>
              <!-- item.mrkxls -->
              <view style="margin-left: 10rpx">
                <uv-number-box :min="item.minNumber" v-model="item.onSale" buttonSize="20px"
                  inputWidth="40px"></uv-number-box>
              </view>
            </view>
            <view @click="goPayItem(item)" class="health-product-item-price" style="margin-top: 10rpx; margin-left: 0"
              v-else>
              <view class="l">
                <view class="health-product-item-now"> {{ item.price }}元<text>/月</text> </view>
                <!-- <view class="health-product-item-original" v-if="item.otPrice"> {{ item.otPrice }}元 </view> -->
                <view class="price-area">{{ item.comparePrice}}</view>
              </view>
              <image :src="EVALUATION_IMG_PATH + 'qiang.svg'" mode="widthFix" />
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="elseProducts.length" style="border-top: 1px solid #e5e5e5; margin: 20rpx 0 50rpx"></view>
    <view v-if="elseProducts.length" class="health-product-title">
      <view>其他推荐</view>
      <text>结合你的饮食生活方式?这些补剂也很适合你</text>
    </view>
    <view v-if="elseProducts.length" class="health-product-list">
      <view class="health-product-item" v-for="(item, index) in elseProducts" :key="item.id">
        <view class="health-product-item-checked" @click="changeChecked(index, 2)" v-if="!isNewUser">
          <image v-if="item.checked" :src="EVALUATION_IMG_PATH + 'checked_icon.png'" mode="widthFix" />
          <text v-else></text>
        </view>
        <view class="health-product-item-image" @click="GoodsDetail(item)"
          :style="{ margin: !isNewUser ? '0 20rpx 0 10rpx' : '0 20rpx 0 0' }">
          <image :src="item.image" mode="aspectFit" />
        </view>
        <view class="health-product-item-info"
          :style="{ width: !isNewUser ? 'calc(100% - 200rpx)' : 'calc(100% - 160rpx)' }">
          <view class="health-product-item-title">
            <text @click="GoodsDetail(item)">{{ item.storeName }}</text>
            <view @click="openDrugDetail(item)">查看检测报告 <uv-icon style="margin-left: 10rpx" name="arrow-right"
                size="14"></uv-icon></view>
          </view>
          <view class="health-product-item-desc"
            :class="{ expanded: item.isOpen, more: item.showMore && !item.isOpen }">
            <view class="health-product-item-desc-inner" :id="'productDesc' + item.id" @click="GoodsDetail(item)">
              {{ item.storeInfo }}
            </view>
            <view class="home-doctor-info-more" v-if="item.showMore && item.isOpen" @click="toggleDesc(index, 2)">
              <uv-icon name="arrow-up" size="24rpx" color="#999999" />
              收起
            </view>
            <view class="home-doctor-info-more" v-if="item.showMore && !item.isOpen" @click="toggleDesc(index, 2)">
              <uv-icon name="arrow-down" size="24rpx" color="#999999" />
              展开
            </view>
          </view>
          <view class="health-product-item-bottom">
            <view class="health-product-item-tags">
              <view class="health-product-item-tag" :style="{backgroundColor:tag.bgColor,borderColor:tag.borderColor,color:tag.fontColor}" v-for="(tag, tagI) in item.labelList || []" :key="tagI">
                <text>{{ tag.tagName }}</text>
              </view>
            </view>
            <view class="health-product-item-price" v-if="!isNewUser">
              <view class="health-product-item-now"> {{ item.price }}元<text>/月</text> </view>
              <view class="health-product-item-original" v-if="item.otPrice"> {{ item.otPrice }}元 </view>
              <!-- item.mrkxls -->
              <view style="margin-left: 10rpx">
                <uv-number-box v-model="item.onSale" buttonSize="20px" inputWidth="40px"></uv-number-box>
              </view>
            </view>
            <view @click="goPayItem(item, 2)" class="health-product-item-price"
              style="margin-top: 10rpx; margin-left: 0" v-else>
              <view class="l">
                <view class="health-product-item-now"> {{ item.price }}元<text>/月</text> </view>
                <!-- <view class="health-product-item-original" v-if="item.otPrice"> {{ item.otPrice }}元 </view> -->
                <view class="price-area">{{ item.comparePrice}}</view>
              </view>
              <image :src="EVALUATION_IMG_PATH + 'qiang.svg'" mode="widthFix" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="health-product-footer">
      <view class="health-product-footer-info">
        <view class="health-product-footer-info-left">
          <!-- <text>服用指导</text>
          <view>每天1包，白天随餐服用</view> -->
        </view>
        <image :src="EVALUATION_IMG_PATH + 'cup_icon.png'" mode="widthFix" />
      </view>
      <view class="health-product-footer-tip">
        <view class="health-product-footer-tip-left" @click="openAssurancePopup">
          <image :src="EVALUATION_IMG_PATH + 'bz_icon.png'" mode="widthFix" />
          消费者权益保障
        </view>
        <view class="health-product-footer-tip-right"> 正品保障｜放心买｜品质严保 </view>
      </view>
    </view>
    <!-- 保障弹窗（居中） -->
    <AssurancePopup ref="assurancePopupRef" />

    <!-- 药物详情弹窗组件 -->
    <DrugDetailModal ref="drugDetailModalRef" />
  </view>
</template>

<script setup>
import { reactive, ref, computed, onMounted, getCurrentInstance } from "vue";
import { REVIEW_IMG_PATH, EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import AssurancePopup from "@/components/AssurancePopup/index.vue";
import DrugDetailModal from "../../components/DrugDetailModal.vue";

const instance = getCurrentInstance();
const assurancePopupRef = ref(null);
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

const emit = defineEmits(["toggleDesc", "changeMore", "changeChecked"]);

const GoodsDetail = (item) => {
  emit("goDetail", item.id);
};

const changeChecked = (index, type) => {
  emit("changeChecked", index, type);
};

const goPayItem = (item, type) => {
  emit("goPayItem", item, type);
};

onMounted(() => {
  // 在 DOM 更新后检查文本高度
  setTimeout(() => {
    checkTextHeight();
  }, 1000);
});

// 修改：增强版检查文本高度的函数，处理null返回值的情况
const checkTextHeight = () => {
  props.products.forEach((item, index) => {
    // 确保元素存在再进行查询
    const selector = `#productDesc${item.id}`;
    uni
      .createSelectorQuery()
      .in(instance.proxy)
      .select(selector)
      .boundingClientRect((res) => {
        if (res) {
          // 如果高度超过 90rpx (约 3行的高度)，则显示展开按钮
          if (res.height > 45) {
            emit("changeMore", index);
          }
        }
      })
      .exec();
  });
};

const toggleDesc = (index) => {
  emit("toggleDesc", index);
};

// 药物详情弹窗引用
const drugDetailModalRef = ref(null);

const openDrugDetail = (item) => {
  if (!item.documents || !item.documents.length) {
    // 无报告资料
    uni.showToast({
      title: "无报告资料",
      icon: "none",
    });
    return;
  }
  const html = item.documents && item.documents.length ? item.documents[0].content : item.content;
  const formattedContent = html.replace(/<img /g, "<img style='width:100%;' ");
  drugDetailModalRef.value.open(formattedContent);
};
</script>

<style lang="scss">
.health-product {
  border: 1px solid #e5e5e5;
  border-radius: 30rpx;
  padding: 30rpx;
  margin: 30rpx;
}

.health-product-title {
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
    font-size: 24rpx;
    margin-top: 10rpx;
    display: block;
  }
}

.health-product-list {}

.health-product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
}

.health-product-item-checked {
  image {
    width: 28rpx;
    height: 28rpx;
  }

  text {
    width: 26rpx;
    height: 26rpx;
    border: 2rpx solid #00cbcc;
    border-radius: 50%;
    display: block;
  }
}

.health-product-item-image {
  margin: 0 20rpx 0 10rpx;

  image {
    width: 140rpx;
    height: 140rpx;
  }
}

.health-product-item-info {
  width: calc(100% - 200rpx);
}

.health-product-item-title {
  display: flex;
  justify-content: space-between;

  text {
    font-weight: 500;
    font-size: 28rpx;
    color: #222222;
    line-height: 46rpx;
    text-align: left;
    font-style: normal;
    text-transform: none;
  }

  &>view {
    // padding: 0 25rpx;
    // line-height: 42rpx;
    // background: #ffffff;
    // border-radius: 21rpx;
    // border: 1px solid #333333;
    font-weight: 400;
    font-size: 24rpx;
    // color: #222222;
    // text-align: left;
    // font-style: normal;
    display: flex;
    align-items: center;
    color: #666666;
  }
}

.health-product-item-desc {
  font-size: 12px;
  margin-top: 10rpx;
  line-height: 15px;
  height: 45px;
  position: relative;
  overflow: hidden;

  &.expanded {
    height: auto;
    padding-bottom: 15px;
  }

  &.more {
    // 三行
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    white-space: normal;
  }
}

.health-product-item-bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 10rpx;
  width: 100%;
}

.health-product-item-tags {
  display: flex;
  flex-wrap: wrap;
}

.health-product-item-tag {
  line-height: 30rpx;
  font-size: 24rpx;
  background: #e9eeff;
  border-radius: 48rpx;
  white-space: nowrap;
  padding: 0 10rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;

  text {
    transform: scale(0.9) translate(0%, 0%);
    /* 根据实际情况调整数值 */
    display: block;
  }
}

.health-product-item-price {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
  // 强制不换行
  white-space: nowrap;
  margin-left: 10rpx;

  .l {
    width: calc(100% - 65rpx);
    height: 55rpx;
    display: flex;
    align-items: center;
    background-color: #eaffff;
    font-size: 22rpx;
    color: #00cbcc;
    padding: 5rpx 15rpx;
    border-radius: 10rpx 0 0 10rpx;
    box-sizing: border-box;
    .price-area{
      font-size: 20rpx;
      margin-left: 15rpx;
    }
  }

  &>image {
    width: 65rpx;
    height: 55rpx;
    display: block;
    image-rendering: -webkit-optimize-contrast; /* Safari */
    image-rendering: crisp-edges; /* Firefox */
    image-rendering: pixelated;  /* Chrome, Edge */
  }
}

.health-product-item-now {
  font-weight: 500;
  font-size: 24rpx;
  color: #00cbcc;
  line-height: 24rpx;
  text-align: left;
  font-style: normal;
  text-transform: none;

  text {
    font-size: 22rpx;
  }
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
  width: 130rpx;
  height: 25rpx;
  font-size: 12px;
  line-height: 17px;
  z-index: 9;
  color: #5e5e5e;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: linear-gradient(-90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.5) 100%);
}

.health-product-footer {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1px solid #e5e5e5;
}

.health-product-footer-info {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &>image {
    width: 48rpx;
    height: 48rpx;
    margin-right: 20rpx;
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
  justify-content: space-between;
  font-size: 24rpx;
  margin-top: 20rpx;
}

.health-product-footer-tip-left {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 24rpx;
  color: #02c655;

  image {
    width: 24rpx;
    height: 24rpx;
    margin-right: 8rpx;
  }
}
</style>
