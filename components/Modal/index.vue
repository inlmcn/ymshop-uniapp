<!--
    @name: index
    @author: kahu4
    @date: 2023-10-31 15:14
    @description：index
    @update: 2023-10-31 15:14
-->
<script setup>
import Popup from "@/components/Popup/index.vue";
import { ref, toRefs } from "vue";

const props = defineProps({
  // 内容
  content: {
    type: String,
    default: () => ''
  },
  // 确认文字
  confirmText: {
    type: String,
    default: () => '确认'
  },
  // 取消文字
  cancelText: {
    type: String,
    default: () => '取消'
  },
  // 是否展示取消
  showCancel: {
    type: Boolean,
    default: () => true
  },
  // 是否展示提交
  showConfirm: {
    type: Boolean,
    default: () => true
  }
})

const {content, confirmText, cancelText, showCancel, showConfirm} = toRefs(props)

const emits = defineEmits(['confirm', 'cancel'])

const popupRef = ref()

function show() {
  popupRef.value.show()
}

function close() {
  // something before close todo
  popupRef.value.close()
}

function clickBtn(type = 'confirm') {
  emits(type)
  close()
}

defineExpose({show, close})
</script>

<template>
  <Popup
      ref="popupRef"
      :showCloseable="false"
      mode="center"
  >
    <view class="modal-inner">
      <view class="content">
        <slot>
          {{ content }}
        </slot>
      </view>
      <view
          class="btn-group"
          v-if="showCancel||showConfirm"
      >
        <view
            class="btn cancel"
            v-if="showCancel"
            @click="clickBtn('cancel')"
        >
          {{ cancelText }}
        </view>
        <view
            class="btn"
            v-if="showConfirm"
            @click="clickBtn('confirm')"
        >
          {{ confirmText }}
        </view>
      </view>
    </view>
  </Popup>
</template>

<style
    scoped
    lang="scss"
>
.modal-inner {
  width: 70vw;
  padding: 50rpx 40rpx 20rpx 50rpx;
  box-sizing: border-box;

  .content {
    width: 100%;
    text-align: center;
    font-size: 34rpx;
    margin-bottom: 40rpx;
  }

  .btn-group {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    position: relative;
    gap: 30rpx;

    .btn {
      box-sizing: border-box;
      flex: 0 0 45%;
      height: 80rpx;
      font-size: 34rpx;
      line-height: 80rpx;
      border: 1px solid #00CBCC;
      background: #00CBCC;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 40rpx;
    }

    .cancel {
      background: #fff;
      color: #00CBCC;
    }
  }
}
</style>
