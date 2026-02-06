<template>
  <div class="report-card" :class="{ xnull: !item.id || hide, xhide: hide }">
    <div class="report-card-title" v-if="item.id && !hide">
      <div class="report-card-title-left">
        <div class="report-card-username">{{ item.username }}</div>
        <div class="report-card-tag">{{ item.version }}</div>
      </div>
      <div class="report-card-title-right"  @click="goDetail(item)">
        <div class="report-card-time">{{ item.time }}</div>
        <div class="report-card-right" v-if="showBuy">
          <uv-icon name="arrow-right" size="14px" />
        </div>
      </div>
    </div>
    <div class="report-card-title" v-else-if="item.id && hide">
      <div class="report-card-title-left">
        <div class="report-card-username">{{ item.username }}的健康评估报告</div>
      </div>
      <div class="report-card-title-right"  @click="goDetail(item)">
        <div class="report-card-time">{{ item.time }}</div>
        <div class="report-card-right">
          <uv-icon name="arrow-right" size="14px" />
        </div>
      </div>
    </div>
    <div class="report-card-title" v-else>
      <div class="report-card-title-left">
        <div class="report-card-username">待测评用户的健康评估报告</div>
      </div>
      <div class="report-card-title-right">
        <div class="report-card-time">未更新时间</div>
        <div class="report-card-right">
          <uv-icon name="arrow-right" size="14px" />
        </div>
      </div>
    </div>

    <div class="report-card-infos" v-if="item.id && !hide">
      <div class="report-card-infos-item">
        <div class="report-card-infos-value">
          <span>{{ item.height.value }}</span>{{ item.height.unit }}
        </div>
        <div class="report-card-infos-name">{{ item.height.label }}</div>
      </div>
      <div class="report-card-infos-item">
        <div class="report-card-infos-value">
          <span>{{ item.weight.value }}</span>{{ item.weight.unit }}
        </div>
        <div class="report-card-infos-name">{{ item.weight.label }}</div>
      </div>
      <div class="report-card-infos-item">
        <div class="report-card-infos-value">
          <span>{{ item.bmi.value }}</span>
        </div>
        <div class="report-card-infos-name">{{ item.bmi.label }}</div>
      </div>
    </div>

    <div class="report-card-infos" v-else-if="!hide">
      <div class="report-card-infos-item">
        <div class="report-card-infos-value"><span>160</span>cm</div>
        <div class="report-card-infos-name">身高/CM</div>
      </div>
      <div class="report-card-infos-item">
        <div class="report-card-infos-value"><span>45</span>kg</div>
        <div class="report-card-infos-name">体重/KG</div>
      </div>
      <div class="report-card-infos-item">
        <div class="report-card-infos-value">
          <span>17.0</span>
        </div>
        <div class="report-card-infos-name">BMI</div>
      </div>
    </div>

    <div class="report-card-view" :style="{ height: getHeight(item) }"
      v-if="item.items && item.items.length && item.id && !hide">
      <div class="report-card-view-icon">
        <image :src="item.centerImage" mode="aspectFit" />
      </div>
      <div class="report-card-view-item x1" v-if="item.items && item.items[0]">
        <div class="report-card-view-item-icon">
          <image v-if="item.items[0].icon" :src="item.items[0].icon" mode="aspectFit" />
          <image v-else :src="EVALUATION_IMG_PATH + 'icon_mubiao1.png'"
            mode="aspectFit" />
        </div>
        <div class="report-card-view-name">{{ item.items[0].name }}</div>
        <div class="report-card-view-line"></div>
        <div class="report-card-view-tags" v-if="item.items[0].tags">
          <div class="report-card-view-tag" v-for="(tag, index) in item.items[0].tags.filter((o,i)=>i<5)" :key="index">{{ tag }}</div>
        </div>
      </div>
      <div class="report-card-view-item x2" v-if="item.items && item.items[1]">
        <div class="report-card-view-item-icon">
          <image v-if="item.items[1].icon" :src="item.items[1].icon" mode="aspectFit" />
          <image v-else :src="EVALUATION_IMG_PATH + 'icon_mubiao2.png'"
            mode="aspectFit" />
        </div>
        <div class="report-card-view-name">{{ item.items[1].name }}</div>
        <div class="report-card-view-line"></div>
        <div class="report-card-view-tags" v-if="item.items[1].tags">
          <div class="report-card-view-tag" v-for="(tag, index) in item.items[1].tags.filter((o,i)=>i<5)" :key="index">{{ tag }}</div>
        </div>
      </div>
      <div class="report-card-view-item x3" v-if="item.items && item.items[2]">
        <div class="report-card-view-item-icon">
          <image v-if="item.items[2].icon" :src="item.items[2].icon" mode="aspectFit" />
          <image v-else :src="EVALUATION_IMG_PATH + 'icon_mubiao2.png'"
            mode="aspectFit" />
        </div>
        <div class="report-card-view-name">{{ item.items[2].name }}</div>
        <div class="report-card-view-line"></div>
        <div class="report-card-view-tags" v-if="item.items[2].tags">
          <div class="report-card-view-tag" v-for="(tag, index) in item.items[2].tags.filter((o,i)=>i<5)" :key="index">{{ tag }}</div>
        </div>
      </div>
    </div>

    <div class="report-card-view" :style="{ height: '240rpx' }" v-else-if="!hide">
      <div class="report-card-view-icon">
        <image :src="COMMON_IMG_PATH + 'default_avatar.png'" mode="aspectFit" />
      </div>
      <div class="report-card-view-item x1">
        <div class="report-card-view-item-icon">
          <image :src="EVALUATION_IMG_PATH + 'icon_mubiao1.png'" mode="aspectFit" />
        </div>
        <div class="report-card-view-name">皮肤</div>
        <div class="report-card-view-line"></div>
      </div>
      <div class="report-card-view-item x2">
        <div class="report-card-view-item-icon">
          <image :src="EVALUATION_IMG_PATH + 'icon_mubiao2.png'" mode="aspectFit" />
        </div>
        <div class="report-card-view-name">免疫力</div>
        <div class="report-card-view-line"></div>
      </div>
    </div>

    <div class="report-card-footer" v-if="item.id && !hide && showBuy && item.spList && item.spList.length">
      <div class="report-card-footer-top">
        <div class="report-card-footer-total">每日服用: <text>{{item.spList.length}}</text>种补剂</div>
        <div class="report-card-footer-btns">
          <div class="report-card-footer-btn xon" @click="goBuy(item)">查看方案</div>
          <div class="report-card-footer-btn" @click="goDetail(item)">查看报告</div>
        </div>
      </div>
      <div class="report-card-drug-list" v-if="isOpen">
        <div class="report-card-drug-item" v-for="item in item.spList" :key="item">
          <div class="report-card-drug-info">
            <image :src="item.image" mode="aspectFill" />
            <div class="report-card-drug-name uv-line-1">{{item.storeName}}</div>
            <div class="report-card-drug-num">x{{item.priceUint||0}}颗</div>
          </div>
          <div class="report-card-drug-price">￥{{Number(item.price).toFixed(2)}}/月</div>
        </div>
      </div>
      <div class="report-card-footer-export">
        <div class="report-card-footer-export-btn" v-if="!isOpen" @click="openDrug">
          展开
          <uv-icon name="arrow-down" color="#999999" size="24rpx" />
        </div>
        <div class="report-card-footer-export-btn" style="margin-top: 15rpx" v-else @click="openDrug">
          收起
          <uv-icon name="arrow-up" color="#999999" size="24rpx" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { COMMON_IMG_PATH, EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import { getCartClear } from '@/api/cart'

const props = defineProps({
  item: {
    type: Object,
    default: () => { },
  },
  hide: {
    type: Boolean,
    default: false,
  },
  showBuy: {
    type: Boolean,
    default: true,
  },
});

const getHeight = (item) => {
  if (item.items && item.items.length) {
    return item.items.length < 3 ? "360rpx" : "450rpx";
  } else {
    return "240rpx";
  }
};

const goBuy = async (item) => {
  // let pids = (item.spList && item.spList.map(item=>item.id)) || []
  // try {
	// 	await getCartClear()
	// 	console.log('购物车已清空')
	// } catch (error) {
	// 	console.error('清空购物车失败:', error)
	// 	// 清空失败不影响购买流程，继续执行
	// }
  // uni.navigateTo({ url: `/pages/orderList/confirmOrder?tag=1&data=${pids}` });
  uni.navigateTo({
    url: `/views/evaluation/healthPlan/index?id=${item.id}&qid=${item.qid}`,
  });
};


const goDetail = (item) => {
  if(props.mode === "detail"){
    return;
  }
  uni.navigateTo({
    url: `/views/evaluation/questionnaire/detail?id=${item.id}&qid=${item.qid}`,
  });
};

const isOpen = ref(false);
const openDrug = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style lang="scss">
.report-card {
  background: #ffffff;
  border-radius: 28rpx 28rpx 28rpx 28rpx;
  box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
  margin: 30rpx;
  padding: 30rpx;

  &.xnull {
    background: #fafafa;

    .report-card-infos-value {
      span {
        color: #999999;
        text-decoration: underline;
        font-weight: 400;
      }
    }
  }

  &.xhide {
    .report-card-title {
      border: 0;
      padding: 0;
    }
  }
}

.report-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e5e5;
  padding: 0 0 15rpx;
}

.report-card-title-left,
.report-card-title-right {
  display: flex;
  align-items: center;
}

.report-card-username {
  font-weight: 600;
  font-size: 32rpx;
  color: #000000;
  line-height: 50rpx;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

.report-card-tag {
  width: 80rpx;
  background: #000000;
  border-radius: 30rpx 30rpx 30rpx 0;
  font-weight: 400;
  font-size: 20rpx;
  color: #e6c79d;
  line-height: 30rpx;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin-left: 10rpx;
}

.report-card-time {
  font-weight: 400;
  font-size: 24rpx;
  color: #666666;
  line-height: 50rpx;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

.report-card-right {
  margin-left: 10rpx;
}

.report-card-infos {
  margin: 30rpx 0;
  display: flex;
  background: #ffffff;
  border-radius: 20rpx 20rpx 20rpx 20rpx;
  border: 2rpx solid #ebebeb;
}

.report-card-infos-item {
  width: calc(100% / 3);
  padding: 15rpx;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: 25rpx;
    display: block;
    border-right: 1px solid #e5e5e5;
    height: 35rpx;
    width: 0;
  }
}

.report-card-infos-value {
  font-weight: 500;
  font-size: 32rpx;
  color: #000000;
  text-align: center;
  font-style: normal;
  text-transform: none;
}

.report-card-infos-name {
  font-weight: 400;
  font-size: 24rpx;
  color: #353535;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin-top: 10rpx;
}

.report-card-view {
  position: relative;
  display: flex;
  justify-content: center;
  height: 420rpx;
}

.report-card-view-icon {
  width: 178rpx;
  height: 178rpx;
  padding: 10rpx;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0rpx 0rpx 5rpx rgba(0, 0, 0, 0.1);
  margin-top: 40rpx;

  image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.report-card-view-item {
  position: absolute;
  width: 40%;

  &.x1 {
    left: 0;
    top: 0;
    width: 43%;

    .report-card-view-item-icon {
      right: 0;
      top: 50rpx;
    }

    .report-card-view-line {
      border-top: 1px solid #e5e5e5;
      border-right: 1px solid #e5e5e5;
      transform: skewX(30deg);
      width: 200rpx;
      right: 60rpx;
      top: 50rpx;
    }
  }

  &.x2 {
    right: 0;
    top: 80rpx;

    .report-card-view-item-icon {
      left: 0;
      top: 50rpx;
    }

    .report-card-view-name {
      text-align: right;
    }

    .report-card-view-line {
      border-left: 1px solid #e5e5e5;
      border-top: 1px solid #e5e5e5;
      transform: skewX(-30deg);
      left: 60rpx;
      top: 50rpx;
    }

    .report-card-view-tags {
      align-items: flex-end;
    }
  }

  &.x3 {
    left: 20%;
    top: 210rpx;
    padding-top: 30rpx;
    width: 45%;
    padding-left: 30rpx;
    box-sizing: border-box;

    .report-card-view-item-icon {
      top: 0;
      right: 10%;
    }

    .report-card-view-name {
      text-align: left;
    }

    .report-card-view-line {
      border-bottom: 1px solid #e5e5e5;
      border-right: 1px solid #e5e5e5;
      transform: skewX(-30deg);
      right: calc(10% + 30rpx);
      top: 45rpx;
    }

    .report-card-view-tags {
      flex-direction: row;
      flex-wrap: wrap;
      width: 120%;
    }

    .report-card-view-tag {
      margin-right: 10rpx;
    }
  }
}

.report-card-view-item-icon {
  width: 45rpx;
  height: 45rpx;
  position: absolute;
  background: #ededed;
  border-radius: 50%;
  box-shadow: 0rpx 0rpx 5rpx rgba(0, 0, 0, 0.1);
  padding: 5rpx;

  image {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
}

.report-card-view-name {
  font-weight: 600;
  font-size: 28rpx;
  line-height: 1.5;
  color: #000008;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-bottom: 10rpx;
}

.report-card-view-line {
  width: 180rpx;
  height: 30rpx;
  position: absolute;
}

.report-card-view-tags {
  display: flex;
  flex-direction: column;
}

.report-card-view-tag {
  background: #e9eeff;
  border-radius: 15rpx;
  font-weight: 400;
  font-size: 22rpx;
  color: #6692ff;
  line-height: 30rpx;
  text-align: center;
  font-style: normal;
  text-transform: none;
  width: max-content;
  padding: 5rpx 15rpx;
  margin-top: 10rpx;
  max-width: 160rpx;
  // 单行溢出省略号
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-card-footer {
  border-top: 1px solid #e5e5e5;
}

.report-card-footer-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 0 10rpx;
}

.report-card-footer-total {
  font-weight: 400;
  font-size: 28rpx;
  color: #000000;
  line-height: 50rpx;
  text-align: center;
  font-style: normal;
  text-transform: none;

  text {
    color: #ff4848;
    font-weight: 600;
    margin: 0 2rpx;
  }
}

.report-card-footer-btns {
  display: flex;
  align-items: center;
}

.report-card-footer-btn {
  padding: 10rpx 25rpx;
  line-height: 30rpx;
  border-radius: 87rpx;
  border: 1px solid #00cbcc;
  color: #00cbcc;
  font-size: 24rpx;
  margin-left: 10rpx;
  min-width: 95rpx;
  text-align: center;

  &.xon {
    background-color: #00cbcc;
    color: white;
  }
}

.report-card-drug-list {
  //   margin-top: 20rpx;
}

.report-card-drug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15rpx;
}

.report-card-drug-info {
  display: flex;
  align-items: center;
  flex:1;
  image {
    width: 50rpx;
    height: 50rpx;
    flex :0 0 50rpx;
  }
}

.report-card-drug-name {
  font-weight: 400;
  font-size: 28rpx;
  color: #222222;
  line-height: 42rpx;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin-left: 10rpx;

}

.report-card-drug-num {
  font-weight: 400;
  font-size: 24rpx;
  color: #7a7a7a;
  line-height: 42rpx;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin-left: 10rpx;
  flex:0 0 72rpx;
}

.report-card-drug-price {
  font-size: 28rpx;
}

.report-card-footer-export {
  display: flex;

  .report-card-footer-export-btn {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #999999;
    border-bottom: 1px solid #aaa;
    line-height: 1;
  }
}
</style>
