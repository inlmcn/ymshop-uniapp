<template>
  <view class="questionnaire-content">
    <view class="questionnaire-content-inner">
      <template v-for="(item, index) in stepList" :key="item.id">
        <view class="questionnaire-step-item" v-if="currentStep === index + 1 && item.ttype === '3' && item.imgSize !== 5 && item.imgSize !== 6">
          <view class="questionnaire-step-item-title">{{ item.title }}</view>
          <view class="questionnaire-step-item-type">【{{ getTypeName(item,index) }}】</view>
          <view class="questionnaire-step-item-options">
            <uv-textarea v-model="item.answerContent" placeholder="请输入你的答案"></uv-textarea>
          </view>
        </view>
        <view class="questionnaire-step-item" v-if="currentStep === index + 1 && (item.imgSize === 5 || item.imgSize === 6)">
          <view class="questionnaire-step-item-title">{{ item.title }}</view>
          <view class="questionnaire-step-item-type">【{{ getTypeName(item,index) }}】</view>
          <view class="questionnaire-step-item-options" style="padding: 0 100rpx;">
            <uv-input fontSize="16px" :customStyle="{ height: '35px', padding: '5px 20px' }" type="number" shape="circle" v-model="item.answerContent" placeholder="请输入">
              <template #suffix>
                {{ item.imgSize === 5 ? "厘米" : item.imgSize === 6 ? "公斤" : item.unit }}
              </template>
            </uv-input>
          </view>
        </view>
        <view class="questionnaire-step-item xone" v-else-if="currentStep === index + 1 && item.imgSize === 3">
          <view class="questionnaire-step-item-title">{{ item.title }}</view>
          <view class="questionnaire-step-item-type">【{{ getTypeName(item,index) }}】</view>
          <view class="questionnaire-step-item-options">
            <view class="questionnaire-step-item-option" v-for="obj in item.options" :key="obj.id" :class="{ active: obj.checked }" @click="changeOptions(obj, item)">
              <view class="questionnaire-step-item-icon xtwo" v-if="obj.image2">
                <image :src="obj.image" mode="widthFix" />
                <image :src="obj.image2" mode="widthFix" />
              </view>
              <view class="questionnaire-step-item-icon" v-else>
                <image :src="obj.image" mode="widthFix" />
              </view>
              <view class="questionnaire-step-item-label">{{ obj.name }}</view>
            </view>
          </view>
        </view>
        <view class="questionnaire-step-item" v-else-if="currentStep === index + 1 && item.imgSize === 1">
          <view class="questionnaire-step-item-title">{{ item.title }}</view>
          <view class="questionnaire-step-item-type">【{{ getTypeName(item,index) }}】</view>
          <view class="questionnaire-step-item-options">
            <view class="questionnaire-step-item-option" v-for="obj in item.options" :key="obj.id" :class="{ active: obj.checked }" @click="changeOptions(obj, item)">
              <view class="questionnaire-step-item-radio">{{ obj.name }}</view>
            </view>
          </view>
        </view>
        <view class="questionnaire-step-item" v-else-if="currentStep === index + 1 && item.imgSize === 2">
          <view class="questionnaire-step-item-title">{{ item.title }}</view>
          <view class="questionnaire-step-item-type">【{{ getTypeName(item,index) }}】</view>
          <view class="questionnaire-step-item-options">
            <view class="questionnaire-step-item-option" style="width: 50%" v-for="obj in item.options" :key="obj.id" :class="{ active: obj.checked }" @click="changeOptions(obj, item)">
              <view class="questionnaire-step-item-radio">{{ obj.name }}</view>
            </view>
          </view>
        </view>
        <view class="questionnaire-step-item" v-else-if="currentStep === index + 1 && item.imgSize === 4">
          <view class="questionnaire-step-item-title">{{ item.title }}</view>
          <view class="questionnaire-step-item-type">【{{ getTypeName(item,index) }}】</view>
          <view class="questionnaire-step-item-options">
            <view class="questionnaire-step-item-checkbox" v-for="obj in item.options" :key="obj.id" :class="{ active: obj.checked }" @click="changeOptions(obj, item)">
              <view class="questionnaire-step-item-icon">
                <image :src="obj.image" mode="widthFix" />
              </view>
              <view class="questionnaire-step-item-label">{{ obj.name }}</view>
            </view>
          </view>
        </view>
      </template>
    </view>

    <view class="questionnaire-footer" v-if="stepList && stepList[currentStep - 1] && stepList[currentStep - 1].ttype !== '1'">
      <view class="questionnaire-footer-btn" @click="nextStep">{{ maxStep <= currentStepIndex ? "提交" : "下一题" }}</view>
    </view>

    <view class="questionnaire-copywriting" v-if="copywriting">
      <rich-text :nodes="copywriting" />
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  stepList: {
    type: Array,
    required: true,
  },
  currentStep: {
    type: Number,
    required: true,
  },
  maxStep: {
    type: Number,
    required: true,
  },
  currentStepIndex: {
    type: Number,
    required: true,
  },
  maxNum:{
    type: Number,
    required: true
  }
});

const emit = defineEmits(["changeOptions", "submit", "nextStep"]);
// "ttype": "1",  // 题目类型 1=单选、2=多选、3=填空
const getTypeName = (item,index) => {
  if(index === 0){
    if(props.maxNum === 1){
      return "可选1个健康目标";
    }else {
      return `可选1-${props.maxNum}个健康目标`;
    }
  }
  return item.ttype === "1" ? "单选题" : item.ttype === "2" ? "多选题" : item.ttype === "3" ? "填空题" : "其他";
};

const changeOptions = (obj, item) => {
  emit("changeOptions", obj, item);
};

const copywriting = computed(() => {
  if (props.currentStep && props.stepList[props.currentStep - 1]) {
    const item = props.stepList[props.currentStep - 1];
    const checkedOptions = item.options.filter((item) => item.checked && item.copywriting);
    if (checkedOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * checkedOptions.length);
      const option = checkedOptions[randomIndex];
      console.log(option.copywriting);
      return option.copywriting;
    }
  }
  return "";
});

const nextStep = () => {
  const currentItem = props.stepList[props.currentStep - 1];
  if (currentItem.ttype === "3" && currentItem.answerContent === "") {
    // 填空题
    uni.showToast({
      title: "请输入你的答案",
      icon: "none",
    });
    return;
  } else if (currentItem.ttype !== "3" && currentItem && currentItem.options && currentItem.options.filter((o) => o.checked).length === 0) {
    uni.showToast({
      title: "请选择对应选项",
      icon: "none",
    });
    return;
  }
  if (props.currentStep < props.stepList.length) {
    emit("nextStep");
  } else {
    emit("submit");
  }
};
</script>

<style lang="scss">
.questionnaire-content {
  // padding-bottom: 50rpx;
}

.questionnaire-content-inner {
  min-height: 20vh;
}

.questionnaire-step-item-title {
  text-align: center;
  font-weight: 600;
  font-size: 40rpx;
  color: #000000;
  text-align: center;
  font-style: normal;
  text-transform: none;
}

.questionnaire-step-item-type {
  font-weight: bold;
  font-size: 24rpx;
  color: #999999;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin-top: 10rpx;
}

.questionnaire-step-item-options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 50rpx;
}

.questionnaire-step-item-option {
  width: 100%;
  box-sizing: border-box;

  &.active {
    .questionnaire-step-item-label {
      color: #333333;
    }
  }

  &.active .questionnaire-step-item-radio {
    background-color: white;
    border: 1px solid #000000;
  }
}

.questionnaire-step-item-label {
  text-align: center;
  font-weight: bold;
  font-size: 28rpx;
  color: #9f9f9f;
  letter-spacing: 1px;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin-top: 15rpx;
}

.questionnaire-step-item {
  &.xone {
    .questionnaire-step-item-option {
      width: 50%;

      .questionnaire-step-item-icon image {
        width: 240rpx;
        height: 240rpx;
        margin: auto;
        display: block;
        opacity: 0.5;

        &:nth-child(2) {
          display: none;
        }
      }

      &.active {
        .questionnaire-step-item-icon image {
          opacity: 1;
        }
        .questionnaire-step-item-icon.xtwo image {
          display: none;

          &:nth-child(2) {
            display: block;
          }
        }
      }
    }
  }
}

.questionnaire-step-item-radio {
  width: 80%;
  padding: 25rpx;
  background: #f0f0f2;
  border: 1px solid #f0f0f2;
  border-radius: 108rpx 108rpx 108rpx 108rpx;
  font-weight: bold;
  font-size: 28rpx;
  color: #222222;
  line-height: 40rpx;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin: 15rpx auto;
}

.questionnaire-step-item-checkbox {
  width: calc(33.33% - 40rpx);
  margin: 20rpx;
  background: #f0f0f2;
  border-radius: 24rpx 24rpx 24rpx 24rpx;
  padding: 20rpx 0;
  border: 1px solid #f0f0f2;
  box-sizing: border-box;

  .questionnaire-step-item-icon {
    width: 55rpx;
    height: 55rpx;
    margin: 0 auto;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .questionnaire-step-item-label {
    color: #000000;
    font-size: 26rpx;
    margin-top: 15rpx;
  }

  &.active {
    background: #ffffff;
    border: 1px solid #000000;
  }
}

.questionnaire-footer {
  padding: 50rpx 0;
}

.questionnaire-footer-btn {
  width: 360rpx;
  line-height: 84rpx;
  background: #00cbcc;
  border-radius: 60rpx 60rpx 60rpx 60rpx;
  font-weight: 600;
  font-size: 32rpx;
  color: #ffffff;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin: 0 auto;
}

.questionnaire-copywriting {
  background-color: #f5f5f5;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
}
</style>
