<!--
    @name: GoodsPoster
    @author: kahu4
    @date: 2024-01-17 17:38
    @description：商品海报
    @update: 2024-01-17 17:38
-->
<script setup>
import { getCurrentInstance, nextTick, ref } from "vue";
import { useImage } from "@/hooks/useImage";
import { useMainStore } from "@/store/modules/useMainStore";
import { VUE_H5_DOMAIN_NAME } from "@/config";
import { useShare } from "@/hooks/useShare";
import QRCode from "qrcode";
import { generateMiniProgramQrCode } from "@/api/global";

// =================================== hooks ============================================
const mainStore = useMainStore();
const {getImageInfo, base64ToUrl, saveImageToPhotosAlbum} = useImage();


const {shareInfo, goodsDetailShare,distributionGoodsDetailShare} = useShare();

const show = ref(false)

const goods = ref(undefined)

const miniProgramQrCode = ref('')

/**
 * 打开分享弹窗
 * @param good 商品信息
 */

async function open(good,distributorId = '') {
  goods.value = good
  show.value = true
  // 生成小程序二维码
  uni.showLoading({title: '获取数据中...'})
 if(distributorId != ''){
 	   distributionGoodsDetailShare(good, distributorId)
 }else{
	 goodsDetailShare(good)
 }
  // #ifdef H5
  console.log('newurl:',`${ VUE_H5_DOMAIN_NAME }${ shareInfo.value.pathQuery }`)
  generateQRCode(`${ VUE_H5_DOMAIN_NAME }${ shareInfo.value.pathQuery }`);
  // #endif
  // #ifdef MP-WEIXIN
  console.log('shareInfo:',shareInfo.value)
  miniProgramQrCode.value = await generateMiniProgramQrCode({path: `pages/share/index`, name: shareInfo.value.query});
  console.log('miniProgramQrCode:',miniProgramQrCode.value)
  // #endif
  await nextTick(() => {
    draw()
  })
}

/**
 * 关闭分享弹窗
 */
function close() {
  goods.value = posterImagePath.value = undefined
  show.value = false
}


defineExpose({open, close})
// ======================= 画布 =========================================
const posterImagePath = ref(null) // 海报图片路径
const _this = getCurrentInstance() // 当前组件实例
const canvasRef = ref() // 画布ref
const ctx = uni.createCanvasContext('goods-canvas', _this) // 画笔对象

/**
 * 绘制画布
 */
function draw() {
  uni.showLoading({title: '海报生成中'})
  const selectorQuery = uni.createSelectorQuery().in(_this);
  selectorQuery.select('#goods-canvas').boundingClientRect().exec(async res => {
    try {
      const {width, height} = res[0] //px
      // 绘制背景
      drawRoundedRectangle({
        width,
        height,
        round: 10
      })
      // 绘制header
      await drawUserInfo()
      // 绘制商品信息
      await drawGoodsInfo(width)
      // 绘制小程序分享信息
      await drawShareInfo(width)
      ctx.draw(false, () => {
        generatePoster()
      });
    } catch (e) {
      uni.hideLoading()
      console.dir(e)
	  console.log('e:',e)
      //throw new Error(e)
    }
  })
}

/**
 * 绘制用户信息
 * @returns {Promise<void>}
 */
async function drawUserInfo() {
  // 用户头像
  await drawImage({x: 15, y: 15, width: 32, height: 32, src: mainStore.user.avatar})
  ctx.save()
  ctx.font = 'normal 16px sans-serif';
  ctx.fillStyle = '#000000'
  ctx.translate(68, 32)
  // y 要设置成字体大小的一半
  ctx.fillText(mainStore.user.nickname, 0, 8)
  ctx.restore()
}

/**
 * 绘制商品信息
 * @returns {Promise<void>}
 */
async function drawGoodsInfo(width) {
  // 图片
  const imageHeight = width - 24 * 2 // 24是UI稿单边边距
  const src = goods.value.image
  await drawImage({x: 24, y: 72, width: imageHeight, height: imageHeight, src})
  // 商品名称
  const goodsName = goods.value.storeName
  // 商品价格
  const goodsPrice = goods.value.price
  // 商品划线价格
  const goodsOldPrice = goods.value.otPrice

  const sliceName = ctx.measureText(goodsName) >= width / 1.5 ? goodsName : goodsName.slice(0, 17) + '...'
  /** 商品名称 **/
  ctx.save()
  ctx.translate(24, width + 58)
  ctx.font = 'normal bold 16px sans-serif';
  ctx.fillStyle = '#000000'
  ctx.fillText(sliceName, 0, 0)
  ctx.restore()
  /** 商品原始价格 **/
  ctx.save()
  ctx.translate(24, width + 58 + 36)
  ctx.font = 'normal bold 24px sans-serif';
  ctx.fillStyle = '#00CBCC'
  ctx.fillText(`￥${ goodsPrice }`, 0, 0)
  // 删除线价格
  const goodsPriceTextMetrics = ctx.measureText(`￥${ goodsPrice }`); // 商品价格宽度
  ctx.font = 'normal normal 16px sans-serif';
  ctx.fillStyle = '#999999'
  ctx.fillText(`￥${ goodsOldPrice }`, goodsPriceTextMetrics.width + 10, 0)
  const goodsOldPriceTextMetrics = ctx.measureText(`￥${ goodsOldPrice }`); // 商品删除价格宽度
  ctx.fillRect(goodsPriceTextMetrics.width + 10, -8, goodsOldPriceTextMetrics.width + 5, 1.5)
  ctx.restore()
  /** 分割线 */
  ctx.save()
  ctx.beginPath()
  ctx.strokeStyle = '#F0F0F0'
  ctx.translate(24, width + 58 + 36 + 15)
  ctx.moveTo(0, 0)
  ctx.lineWidth = 1
  ctx.lineTo(imageHeight, 0)
  ctx.stroke()
  ctx.closePath()
  ctx.restore()
}

const qrCodeUrl = ref(""); // 存储生成的二维码图像

async function generateQRCode(data) {
  try {
    qrCodeUrl.value = await QRCode.toDataURL(data, {
      width: 55, // 宽度
      margin: 2,  // 边距
    });
  } catch (err) {
    console.error("二维码生成失败：", err);
  }
}

/**
 * 绘制分享信息
 * @returns {Promise<void>}
 */
async function drawShareInfo(width) {
  ctx.save();
  ctx.translate(24, width + 58 + 36 + 15 + 25)
  let text
  let subText
  // #ifdef H5
  text = ""
  subText = "来自「HealthCoast商城」"
  // #endif
  // #ifdef MP-WEIXIN
  text = "长按识别图中二维码"
  subText = "来自「HealthCoast商城」小程序"
  // #endif
  ctx.font = 'normal bold 16px sans-serif';
  ctx.fillStyle = '#000000'
  // 主要字体
  ctx.fillText(text, 0, 0)
  ctx.font = 'normal normal 14px sans-serif';
  ctx.fillStyle = '#8C8C8C'
  ctx.fillText(subText, 0, 25)

  let path;
  // #ifdef H5
  path = await base64ToUrl(qrCodeUrl.value);
  // #endif

  // #ifdef MP-WEIXIN
  path = await base64ToUrl(miniProgramQrCode.value);
  // #endif
  /** 二维码 **/
  await drawImage({
    x: width - (24 * 2) - 50,
    y: -18,
    width: 50,
    height: 50,
    src: path
  })
  ctx.restore();
}


/**
 * 绘制圆角矩形
 * @param options
 */
function drawRoundedRectangle(options = {}) {
  ctx.save()
  const defaultOptions = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    round: 0,
    stroke: false,
    strokeStyle: '#ffffff',
    fillStyle: '#ffffff',
  }
  options = {...defaultOptions, ...options}
  const {x, y, width, height, round, stroke, strokeStyle, fillStyle} = options
  ctx.beginPath();
  ctx.moveTo(x + round, y);
  ctx.arcTo(x + width, y, x + width, y + round, round);
  ctx.lineTo(x + width, y + height - round);
  ctx.arcTo(x + width, y + height, x + width - round, y + height, round);
  ctx.lineTo(x + round, y + height);
  ctx.arcTo(x, y + height, x, y + height - round, round);
  ctx.lineTo(x, y + round);
  ctx.arcTo(x, y, x + round, y, round);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ctx.fill();
  stroke && ctx.stroke()
  ctx.restore()
}

/**
 * 绘制图片
 * @param options
 * @returns {Promise<void>}
 */
async function drawImage(options = {}) {
  const defaultOptions = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    src: ''
  }
  options = {...defaultOptions, ...options}
  // 获取图片信息
  const {path} = await getImageInfo(options.src);
  ctx.drawImage(path, options.x, options.y, options.width, options.height)

}


/**
 * 生成画布
 * @returns {Promise<void>}
 */
async function generatePoster() {
  console.log("开始生成画布")
  // #ifndef MP-WEIXIN
  uni.canvasToTempFilePath({
    canvasId: 'goods-canvas',
    success: async (res) => {
      // 在H5平台下，tempFilePath 为 base64
      // #ifdef H5
      posterImagePath.value = await base64ToUrl(res.tempFilePath);
      // #endif
      // #ifndef H5
      posterImagePath.value = res.tempFilePath;
      console.log(posterImagePath.value, res)
      // #endif
      uni.hideLoading()
    },
    fail: (err) => {
      console.log(err)
      uni.hideLoading()
    }
  })
  // #endif
  // #ifdef MP-WEIXIN
  wx.canvasToTempFilePath({
    canvasId: 'goods-canvas',
    canvas: canvasRef.value,//这里是重点，获取实例的时候保存为全局变量就行了
    success: async (res) => {
      posterImagePath.value = res.tempFilePath;
      uni.hideLoading()
    },
    fail: (err) => {
      console.log(err)
      uni.hideLoading()
    }
  }, _this)
  // #endif
}

/**
 * 保存到相册
 * @returns {Promise<void>}
 */
async function save() {
  uni.showLoading({title: '保存中'})
  try {
    await saveImageToPhotosAlbum(posterImagePath.value, goods.value.storeName)
    close()
  } finally {
    uni.hideLoading()
  }
}
</script>

<template>
  <uv-overlay
      @touchmove="(e)=>{e.preventDefault();}"
      :show="show"
      @click="close">
    <view
        class="poster"
        v-if="goods && posterImagePath">
      <!-- 海报 -->
      <view
          class="poster-image"
          @click.stop>
        <image :src="posterImagePath" />
      </view>
      <!-- 按钮组合 -->
      <view class="button-group">
        <view
            class="button line-button"
            @click.stop="close">
          取消
        </view>
        <view
            class="button animation-button"
            @click.stop="save">
          保存
        </view>
      </view>
    </view>
    <canvas
        canvas-id="goods-canvas"
        ref="canvasRef"
        style="width:654rpx;height: 1032rpx;margin: 20rpx auto;position: absolute;z-index:999;top: -999px;"
        id="goods-canvas" />

  </uv-overlay>
</template>

<style
    scoped
    lang="scss">
.poster {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .poster-image {
    width: 90%;
    aspect-ratio: 327 / 516;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .button-group {
    width: 90%;
    margin-top: 40rpx;
    @include useFlex(center, center, row, nowrap, 20rpx);

    .button {
      flex-grow: 1;
      @include useFlex(center, center);
      height: 80rpx;
      background: $primary-color;
      color: $white-color;
      border-radius: 10rpx;
      box-sizing: border-box;
    }

    .line-button {
      border: 4rpx solid $white-color;
      background: #fff;
      color: #000;
    }
  }
}
</style>
