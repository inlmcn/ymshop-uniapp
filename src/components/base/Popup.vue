<!--
    * @FileDescription: Popup
    * @Author: kahu
    * @Date: 2023/2/22
    * @LastEditors: kahu
    * @LastEditTime: 2023/2/22
    * @ProductName：WebStorm
-->
<script
    setup
>
import { nextTick, ref, toRefs } from "vue";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import UniPopup from "@/components/UPopup/uni-popup/uni-popup.vue";

/** some javascript code in here */
const emit = defineEmits(['open', 'close'])
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
 * @event {Function} show 打开弹窗
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
  backgroundColor:{
    type: String,
    default: "#fff"
  }
})

const {title, mode, showCloseable, isMaskClick} = toRefs(props)

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
function open(){
  show()
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

let iphoneSafeHeight = 0 // ios安全区高度
const bottomHeight = ref(5)

// function changeKeyboard(res: any) {
//   bottomHeight.value = res.height > 0 ? res.height : res.height // 有安全区时需要减去该高度，不然还是会被挡住
// }

onLoad(() => {
  // #ifdef MP-WEIXIN
  //获取屏幕信息
  uni.getSystemInfo({
    success(res) {
      iphoneSafeHeight = res.screenHeight - (res?.safeArea?.bottom || 0)
    }
  })
  // uni.onKeyboardHeightChange(changeKeyboard)
  // #endif
})
onUnload(() => {
  // #ifdef MP-WEIXIN
  // uni.offKeyboardHeightChange(changeKeyboard)
  // #endif
})

defineExpose({
  show,
  close,
  open
})
</script>

<template>
  <!-- some html code in here-->
  <page-meta :page-style="`overflow:${isShow?'hidden':'visible'}`"></page-meta>

  <view>
    <UniPopup
        ref="popup"
        :is-mask-click="isMaskClick"
        :type="mode"
        :background-color="backgroundColor"
        @change="handlePopupChange"
    >
      <view
          class="popup_inner"
      >
        <view
            v-if="props.title||props.showCloseable"
            class="head flex flex-lr__center">
          <slot name="leftOption">
            <view></view>
          </slot>
          <slot name="title">
            <view>{{ props.title }}</view>
          </slot>
          <slot name="rightOption">
            <view
            >
              <uv-icon
                  color="#000"
                  name="close"
                  size="16"
                  v-if="props.showCloseable"
                  @click="close"
              />
            </view>
          </slot>
        </view>
        <slot></slot>
      </view>
    </UniPopup>
  </view>
</template>

<style
    lang="scss"
    scoped
>
.popup_inner {
  padding: 20rpx 20rpx env(safe-area-inset-bottom) 20rpx;
  box-sizing: border-box;

  .head {
    padding: 20rpx 0;
    font-weight: bolder;
    font-size: 36rpx;
  }

  .content {


    .option_list_box {
      .option_item {
        margin: 15rpx 0;

        .icon {
          margin-right: 30rpx !important;
        }
      }
    }

  }


}

</style>
