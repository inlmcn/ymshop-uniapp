<!--
    @name: index
    @author: kahu4
    @date: 2023-10-31 15:06
    @description：index
    @update: 2023-10-31 15:06
-->
<script setup>
import { nextTick, ref, toRefs, computed } from "vue";
import UniPopup from "@/components/uniComponents/UPopup/uni-popup/uni-popup.vue";

/** some javascript code in here */
const emit = defineEmits(['open', 'close', 'maskClick'])
/**
 * @property {String} title 标题
 * @property {String} mode 模式
 *  @value top 顶部弹出
 *  @value center 中间弹出
 *  @value bottom 底部弹出
 *  @value left		左侧弹出
 *  @value right  右侧弹出
 *  @value message 消息提示
 *  @value dialog 对话框
 *  @value share 底部分享示例
 * @property {Boolean} showCloseable 是否展示关闭按钮
 * @property {Boolean} isMaskClick 是否点击masker关闭弹窗
 * @event {Function} open 打开弹窗
 * @event {Function} close 关闭回调
 */
const props = defineProps({
  title: {
    type: String,
    default: () => ''
  },
  mode: {
    type: String,
    default: () => 'bottom'
  },
  showCloseable: {
    type: Boolean,
    default: () => true
  },
  isMaskClick: {
    type: Boolean,
    default: () => true
  },
  maskBg: {
    type: String,
    default: () => 'rgba(0, 0, 0, 0.5)'
  },
  /**
   * 内层容器的 padding（支持 '20rpx' 或数字 rpx），默认 20rpx
   * 如果是底部弹出，自动在 padding-bottom 叠加安全区高度
   */
  padding: {
    type: [String, Number],
    default: () => '20rpx'
  },
})

const {title, mode, showCloseable, isMaskClick, maskBg, padding} = toRefs(props)

const popup = ref()
const isShow = ref(false)
/**
 * 打开
 */
const show = () => {
  nextTick(() => {
    isShow.value = true
    popup.value.open()
    emit('open')
  })
}

/**
 * 关闭回调
 */
const close = () => {
  isShow.value = false
  popup.value.close()
}

const handlePopupChange = (e) => {
  if (!e.show) emit('close')
}

const handleMaskClick = (e) => {
  emit('maskClick')
}

defineExpose({
  show,
  close
})

// 计算内层样式，支持动态 padding 与底部安全区叠加
const innerStyle = computed(() => {
  const pad = typeof padding.value === 'number' ? `${padding.value}rpx` : padding.value
  const style = { padding: pad }
  if (mode.value === 'bottom') {
    style.paddingBottom = `calc(${pad} + env(safe-area-inset-bottom))`
  }
  return style
})
</script>

<template>
  <UniPopup
      ref="popup"
      :type="mode"
      :is-mask-click="isMaskClick"
      :mask-background-color="maskBg"
      background-color="#fff"
      @change="handlePopupChange"
      @maskClick="handleMaskClick"
      class="y-popup"
  >
    <view
        class="popup_inner"
        :style="innerStyle">
      <view
          class="head"
          v-if="title||showCloseable"
      >
        <view></view>
        <view>{{ title }}</view>
        <slot name="rightOption">
          <view
              @click="close"
              v-if="showCloseable"
          >
            <uv-icon
                name="close"
                color="#000"
                size="16"
            />
          </view>
        </slot>
      </view>
      <slot></slot>
    </view>
    <!-- 如果是h5 增加tabbar高度 -->
    <!--    <view class="h5-tabbar-height"></view>-->
  </UniPopup>
</template>

<style lang="scss">

</style>
<style
    scoped
    lang="scss"
>
.popup_inner {
  /* 默认内边距由 props.padding 控制 */
  box-sizing: border-box;

  .head {
    padding: 20rpx 0;
    font-weight: bolder;
    font-size: 36rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .content {
    .tips {
      width: 100%;
      text-align: center;
      font-size: 22rpx;
      color: #000;
    }

    .option_list_box {
      .option_item {
        margin: 15rpx 0;

        .icon {
          margin-right: 30rpx !important;
        }
      }
    }

  }

  .button_content {
    margin-top: 50rpx;
    width: 100%;
    height: 80rpx;
    background: #00CBCC;
    font-size: 40rpx;
    color: #fff;
    text-align: center;
    line-height: 80rpx;
    border-radius: 80rpx;
    font-weight: bolder;
  }

}

</style>
