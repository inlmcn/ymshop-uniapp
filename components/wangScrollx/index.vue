<template>
  <view class="pc-carousel" @touchstart="starts" @touchend="ends">
    <view
      v-for="(item, index) in imagelist"
      :key="index"
      :class="item.class"
      class="carousel-block"
      @click="changeBlock(item)"
      :style="{
        left: item.left,
        top: item.top,
        zIndex: item.zIndex,
        width: item.width,
        height: item.height,
        transition: item.transition + 's all',
        transform: 'scale(' + (item.scale || 1) + ')',
      }"
    >
      <!-- 始终渲染slot，由父组件决定内容 -->
      <slot
        :item="datalist[item.isIndex]"
        :index="item.isIndex"
      >
        <!-- 默认插槽内容 -->
        <view
          class="image-block"
          :style="{ backgroundImage: 'url(' + item.field + ')' }"
        ></view>
        <view class="error-block">
          <uni-icons :type="icon" :size="size" color="#909399"></uni-icons>
        </view>
      </slot>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  field: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "image",
  },
  size: {
    type: [Number, String],
    default: "40",
  },
  mode: {
    type: String,
    default: "multiple",
  },
  showDots: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["activeIndexChange", "selection"]);

const datalist = ref([]);
const imagelist = ref([]);
const ismove = ref(0);
const count = ref({ sta: 0, end: 0 });

const style_multiple = [
  {
    left: "10rpx",
    top: "90rpx",
    height: "calc(100% - 180rpx)",
    width: "calc(50% - 160rpx)",
    zIndex: 10,
    transition: 0.2,
  },
  {
    left: "calc(12.5% - 2.5rpx)",
    top: "50rpx",
    height: "calc(100% - 100rpx)",
    width: "calc(50% - 80rpx)",
    zIndex: 15,
    transition: 0.4,
  },
  {
    left: "calc(25% - 5rpx)",
    top: "10rpx",
    height: "calc(100% - 20rpx)",
    width: "calc(50% - 10rpx)",
    zIndex: 20,
    transition: 0.5,
  },
  {
    left: "calc(37.5% + 77.5rpx)",
    top: "50rpx",
    height: "calc(100% - 100rpx)",
    width: "calc(50% - 80rpx)",
    zIndex: 15,
    transition: 0.4,
  },
  {
    left: "calc(50% + 150rpx)",
    top: "90rpx",
    height: "calc(100% - 180rpx)",
    width: "calc(50% - 160rpx)",
    zIndex: 10,
    transition: 0.2,
  },
];

const style_single = [
  {
    left: "10rpx",
    top: "50rpx",
    height: "calc(100% - 100rpx)",
    width: "calc(50% - 80rpx)",
    zIndex: 15,
    transition: 0.1,
    scale: 0.8,
  },
  {
    left: "calc(25% - 5rpx)",
    top: "10rpx",
    height: "calc(100% - 20rpx)",
    width: "calc(50% - 10rpx)",
    zIndex: 20,
    transition: 0.3,
    scale: 1,
  },
  {
    left: "calc(50% + 70rpx)",
    top: "50rpx",
    height: "calc(100% - 100rpx)",
    width: "calc(50% - 80rpx)",
    zIndex: 15,
    transition: 0.1,
    scale: 0.8,
  },
];

const getDatalist = () => {
  if (props.data) {
    datalist.value = JSON.parse(JSON.stringify(props.data));
    let num = props.mode === "multiple" ? 5 : props.mode === "single" ? 3 : 0;
    let diff = num - props.data.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        let obj = {};
        obj[props.field] = "";
        datalist.value.push(obj);
      }
    }
    getImagelist();
  }
};

const getImagelist = () => {
  if (props.mode === "multiple") {
    imagelist.value = JSON.parse(JSON.stringify(style_multiple));
    count.value.sta = 0;
    count.value.end = 4;
  } else if (props.mode === "single") {
    imagelist.value = JSON.parse(JSON.stringify(style_single));
    count.value.sta = 0;
    count.value.end = 2;
  }
  for (let i = 0; i < datalist.value.length; i++) {
    if (imagelist.value[i]) {
      imagelist.value[i].field = datalist.value[i][props.field];
      imagelist.value[i].isIndex = i;
      imagelist.value[i].isToor = i;
      imagelist.value[i].scale = imagelist.value[i].scale || 1;
    } else {
      break;
    }
  }
};

const LeftSliding = () => {
  let list =
    props.mode === "multiple"
      ? style_multiple
      : props.mode === "single"
      ? style_single
      : [];
  imagelist.value.forEach((item) => {
    let toor =
      item.isToor - 1 < 0 ? imagelist.value.length - 1 : item.isToor - 1;
    item.isToor = toor;
    item.transition = list[toor].transition;
    item.left = list[toor].left;
    item.top = list[toor].top;
    item.width = list[toor].width;
    item.height = list[toor].height;
    item.zIndex = list[toor].zIndex;
    item.scale = list[toor].scale || 1;
    if (
      (toor === 4 && props.mode === "multiple") ||
      (toor === 2 && props.mode === "single")
    ) {
      count.value.end =
        count.value.end + 1 > datalist.value.length - 1
          ? 0
          : count.value.end + 1;
      item.isIndex = count.value.end;
      item.field = datalist.value[count.value.end][props.field];
    }
    if (toor === 0) {
      count.value.sta = item.isIndex;
    }
  });
  // 发送当前活跃索引变化事件
  emit("activeIndexChange", getCurrentActiveIndex());
};

const RightSliding = () => {
  let list =
    props.mode === "multiple"
      ? style_multiple
      : props.mode === "single"
      ? style_single
      : [];
  imagelist.value.forEach((item) => {
    let toor =
      item.isToor + 1 > imagelist.value.length - 1 ? 0 : item.isToor + 1;
    item.isToor = toor;
    item.transition = list[toor].transition;
    item.left = list[toor].left;
    item.top = list[toor].top;
    item.width = list[toor].width;
    item.height = list[toor].height;
    item.zIndex = list[toor].zIndex;
    item.scale = list[toor].scale || 1;
    if (toor === 0) {
      count.value.sta =
        count.value.sta - 1 < 0
          ? datalist.value.length - 1
          : count.value.sta - 1;
      item.isIndex = count.value.sta;
      item.field = datalist.value[count.value.sta][props.field];
    }
    if (
      (toor === 4 && props.mode === "multiple") ||
      (toor === 2 && props.mode === "single")
    ) {
      count.value.end = item.isIndex;
    }
  });
  // 发送当前活跃索引变化事件
  emit("activeIndexChange", getCurrentActiveIndex());
};

const changeBlock = (item) => {
  let toor = item.isToor;
  if (props.mode === "multiple") {
    if (toor === 0 || toor === "0") {
      LeftSliding();
      setTimeout(() => {
        LeftSliding();
      }, 100);
    } else if (toor === 1) {
      LeftSliding();
    } else if (toor === 2) {
      emit("selection", datalist.value[item.isIndex]);
    } else if (toor === 3) {
      RightSliding();
    } else if (toor === 4) {
      RightSliding();
      setTimeout(() => {
        RightSliding();
      }, 100);
    }
  } else if (props.mode === "single") {
    if (toor === 0 || toor === "0") {
      RightSliding();
    } else if (toor === 1) {
      emit("selection", datalist.value[item.isIndex]);
    } else if (toor === 2) {
      LeftSliding();
    }
  }
};

const starts = (e) => {
  ismove.value = e.touches[0].pageX;
};

const ends = (e) => {
  let pageX = e.changedTouches[0].pageX;
  let nums = ismove.value - pageX;
  if (nums > 50) {
    LeftSliding();
  } else if (nums < -50) {
    RightSliding();
  }
};

const getCurrentActiveIndex = () => {
  // 找到中心位置的项目索引
  let centerIndex = -1;
  if (props.mode === "multiple") {
    // multiple模式下，中心位置是toor=2的项目
    for (let item of imagelist.value) {
      if (item.isToor === 2) {
        centerIndex = item.isIndex;
        break;
      }
    }
  } else if (props.mode === "single") {
    // single模式下，中心位置是toor=1的项目
    for (let item of imagelist.value) {
      if (item.isToor === 1) {
        centerIndex = item.isIndex;
        break;
      }
    }
  }
  return centerIndex;
};

const goToSlide = (targetIndex) => {
  let currentIndex = getCurrentActiveIndex();
  if (currentIndex === targetIndex) return;

  let diff = targetIndex - currentIndex;
  let steps = Math.abs(diff);

  // 选择最短路径
  if (steps > datalist.value.length / 2) {
    steps = datalist.value.length - steps;
    diff = diff > 0 ? -steps : steps;
  }

  // 执行滑动
  for (let i = 0; i < Math.abs(diff); i++) {
    setTimeout(() => {
      if (diff > 0) {
        LeftSliding();
      } else {
        RightSliding();
      }
    }, i * 100);
  }
};

onMounted(() => {
  getDatalist();
});

watch(
  () => props.data,
  () => {
    getDatalist();
  },
  { deep: true }
);

// 暴露goToSlide方法供父组件调用
defineExpose({
  goToSlide,
});
</script>

<style lang="scss" scoped>
.pc-carousel {
  width: 100%;
  height: 100%;
  min-height: 200px;
  position: relative;
  overflow: hidden;

  .carousel-block {
    position: absolute;
    overflow: visible;
    border-radius: 10upx;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center center;

    .image-block {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-size: 100% 100%;
      z-index: 5;
    }

    .error-block {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .carousel-dots {
      position: absolute;
      top: 20rpx;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
      z-index: 10;

      .dot-item {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.5);
        transition: all 0.3s ease;
        cursor: pointer;

        &.dot-active {
          width: 24rpx;
          border-radius: 6rpx;
          background-color: rgba(255, 255, 255, 0.9);
        }

        &:hover {
          background-color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }
}
</style>
