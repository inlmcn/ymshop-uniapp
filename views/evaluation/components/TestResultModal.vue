<template>
  <view>
    <uv-popup
      mode="bottom"
      :safe-area-inset-bottom="true"
      :customStyle="{
        width: '100%',
        height: '80vh',
        padding: '0',
      }"
      round="30rpx"
      ref="modalRef"
      @change="closeModal"
    >
      <view
        class="testing-result"
        :style="{ backgroundImage: `url(${HOME_IMG_PATH}WechatIMG1247.jpg)` }"
        @touchmove.stop.prevent
      >
        <!-- 关闭按钮 -->
        <view class="product-detail-popup-close" @click="close">
          <uv-icon name="close" size="32rpx" color="#ffffff"></uv-icon>
        </view>

        <view class="header">
          <text class="header-title">全面检测</text>
        </view>

        <!-- 主要内容区域 -->
        <view class="content">
          <view class="content-title"
            >本检测报告基于平台随机抽样盲检，检测结果仅与该送检产品有关。检测报告仅作为平台内部质量控制之用。</view
          >

          <!-- 检测项目水平滚动列表 -->
          <scroll-view
            class="content-scroll"
            scroll-x="true"
            show-scrollbar="false"
          >
            <view class="content-list">
              <view
                class="list-item"
                v-for="(item, index) in itemList"
                :key="item.id"
                :class="{ selected: selectedIndex === index }"
                @click="selectItem(index)"
              >
                <view class="item-first-row">
                  <text class="item-time">{{ formatDate(item.jcTime) }}</text>
                  <view class="count-container"
                    >第{{ itemList.length - index || 0 }}次</view
                  >
                </view>
                <view class="item-second-row">
                  <text class="item-new" v-if="shouldShowNewTag(item)">
                    新
                  </text>
                  <text class="item-text">{{ item.title || "" }}</text>
                </view>
              </view>
            </view>
          </scroll-view>

          <!-- 检测内容详情 -->
          <scroll-view class="choose-us-scroll" scroll-y="true">
            <image
              class="choose-img"
              :src="HOME_IMG_PATH + 'Frame 2119904207.png'"
            ></image>
            <view class="choose-content" @click="handleRichTextClick">
              <rich-text :nodes="nodeContent" />
            </view>
          </scroll-view>
        </view>

        <!-- 分享按钮 -->
        <view class="testing-jump-img" @click="show = true">
          <image :src="HOME_IMG_PATH + 'Group 2082895178.png'"></image>
        </view>

        <!-- 查看商品按钮 -->
        <view
          v-if="selectItemObj && selectItemObj.cpImg"
          class="testing-box-bottom"
          @click="goProductDetail"
        >
          <image :src="selectItemObj?.cpImg" mode="aspectFill" />
          <view class="testing-box-bottom-name">查看商品</view>
        </view>

        <!-- 分享弹窗 -->
        <uv-overlay :show="show" @click="show = false">
          <view class="warp">
            <!-- 隐藏的Canvas用于绘制分享图片 -->
            <canvas
              canvas-id="shareCanvas"
              :style="{
                width: canvasWidth + 'px',
                height: canvasHeight + 'px',
                position: 'absolute',
                top: '-9999px',
                left: '-9999px',
              }"
            ></canvas>

            <!-- 分享图片预览区域 -->
            <view class="warp-top" @click.stop>
              <image
                v-if="canvasImage"
                :src="canvasImage"
                style="width: 579rpx; height: auto; border-radius: 28rpx"
                mode="widthFix"
              />
              <view v-else class="loading-tip">
                <uv-loading-icon
                  text="正在生成分享图片..."
                  color="#00CBCC"
                ></uv-loading-icon>
              </view>
            </view>

            <!-- 底部操作按钮 -->
            <view class="warp-bottom" @click.stop>
              <view class="warp-bottom-left" @click="saveImage">保存图片</view>
              <view class="warp-bottom-right" @click="shareImage">
                分享好友
                <button open-type="share">分享</button>
              </view>
            </view>
          </view>
        </uv-overlay>
      </view>
    </uv-popup>
  </view>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  nextTick,
  defineExpose,
  getCurrentInstance,
} from "vue";
import { HOME_IMG_PATH } from "@/utils/imgpath.js";
import { getMultipleList } from "@/api/multiple.js";
import { generateMiniProgramQrCode } from "@/api/global";

const emit = defineEmits(["closeModal"]);

const _this = getCurrentInstance();

const productId = ref("");
const itemList = ref([]);
const selectedIndex = ref(0);
const show = ref(false);
const canvasImage = ref("");
const canvasWidth = ref(579 * 1.2);
const canvasHeight = ref(900 * 1.2);
const isDrawing = ref(false);
const systemInfo = ref(null);
const listdata = ref({});

// 设备像素比
const pixelRatio = ref(1);

// 弹窗引用
const modalRef = ref(null);

// 描述内容
const description = ref("");

// 打开弹窗
const open = (id) => {
  productId.value = id;

  getDetail();
};

// 关闭弹窗
const close = () => {
  modalRef.value?.close();
};

const closeModal = ({ show }) => {
  if (!show) emit("closeModal");
};

// 格式化时间戳为日期
const formatDate = (timestamp) => {
  if (!timestamp) return "--";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}.${month}.${day}`;
};

// 选择检测项目
const selectItem = (index) => {
  selectedIndex.value = index;
};

// 当前选中的检测项目
const selectItemObj = computed(() => {
  return listdata.value;
});

const shouldShowNewTag = (item) => {
  if (!item.jcTime) return false;

  // 条件1：当月
  const now = new Date();
  const date = new Date(item.jcTime);
  const isCurrentMonth =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth();

  // 返回判断结果（这里返回当月判断）
  return isCurrentMonth;
};

// 在 script setup 中添加 ref
const currentPreviewImages = ref([]);

const nodeContent = computed(() => {
  if (itemList.value.length > 0) {
    let content = itemList.value[selectedIndex.value].content;
    if (content) {
      const images = [];
      const imgRegex = /<img[^>]*src=['"]([^'"]+)['"][^>]*>/gi;
      let match;
      while ((match = imgRegex.exec(content)) !== null) {
        images.push(match[1]);
      }

      currentPreviewImages.value = images;

      content = content.replace(
        /<img([^>]*)src=['"]([^'"]+)['"]([^>]*)>/gi,
        (match, before, src, after) => {
          return `<img${before}src="${src}"${after} 
                        style="width:100%;max-width:100%;cursor:pointer;display:block;margin:10rpx 0;">`;
        }
      );
      return content;
    }
  }
  return "";
});

const handleRichTextClick = (e) => {
  if (e.detail && currentPreviewImages.value.length > 0) {
    const images = currentPreviewImages.value;

    if (images.length === 1) {
      uni.previewImage({
        urls: images,
        current: images[0],
        indicator: "default",
        loop: true,
      });
    } else {
      uni.previewImage({
        urls: images,
        indicator: "default",
        loop: true,
      });
    }
  }
};

// 跳转到商品详情
const goProductDetail = () => {
  if (selectItemObj.value?.productId) {
    uni.navigateTo({
      url: "/pages/product/detail?id=" + selectItemObj.value.productId,
    });
  } else {
    uni.showToast({
      title: "商品信息不存在",
      icon: "none",
    });
  }
};

// 获取检测数据
const getDetail = async () => {
  try {
    const res = await getMultipleList({ productId: productId.value });
    console.log("获取产品详情成功:", res);
    if (res && res.length > 0) {
      listdata.value = res[0];
      itemList.value = res[0].itemList;
      // 默认选中第一个
      if (itemList.value.length > 0) {
        selectedIndex.value = 0;
      }

      modalRef.value?.open();
    } else {
      uni.showToast({
        title: "暂无检测数据",
        icon: "none",
      });
    }
  } catch (err) {
    console.error("获取产品详情失败:", err);
    uni.showToast({
      title: "数据加载失败",
      icon: "none",
    });
  }
};

// 监听弹窗显示，绘制canvas
watch(show, (newVal) => {
  if (newVal && selectItemObj.value && !isDrawing.value) {
    canvasImage.value = "";
    nextTick(() => {
      setTimeout(() => {
        drawCanvas();
      }, 300);
    });
  }
});

// 监听选中的项目变化，重新绘制canvas
watch([selectItemObj], () => {
  if (show.value && selectItemObj.value && !isDrawing.value) {
    drawCanvas();
  }
});

const getImageInfo = (url) => {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: url,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

// 添加辅助函数
const base64ToPath = (base64Data) => {
  return new Promise((resolve, reject) => {
    // 处理base64数据URL前缀
    let base64 = base64Data;
    const match = base64Data.match(/^data:image\/(\w+);base64,/);
    if (match) {
      base64 = base64Data.substring(match[0].length);
    }

    // #ifdef MP
    const fs = uni.getFileSystemManager();
    const filePath = `${uni.env.USER_DATA_PATH}/qrcode_${Date.now()}.png`;

    fs.writeFile({
      filePath: filePath,
      data: base64,
      encoding: "base64",
      success: () => {
        resolve(filePath);
      },
      fail: (err) => {
        console.error("保存base64到文件失败:", err);
        reject(err);
      },
    });
    // #endif

    // #ifndef MP
    // H5等平台可以直接使用base64
    resolve(base64Data);
    // #endif
  });
};
const getReversedIndex = (index) => {
  if (!itemList.value || itemList.value.length === 0) return 0;
  return itemList.value.length - index;
};
// 绘制Canvas分享图片
const drawCanvas = async () => {
  if (!selectItemObj.value) return;

  isDrawing.value = true;
  const ctx = uni.createCanvasContext("shareCanvas", _this);

  // 清空画布
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

  // 设置缩放比例，确保在高分辨率设备上清晰
  // ctx.scale(pixelRatio.value, pixelRatio.value)

  // 1. 绘制白色背景
  // ctx.setFillStyle('#FFFFFF')
  // ctx.fillRect(0, 0, 579, 900)

  // 2. 绘制顶部logo
  const backUrl = HOME_IMG_PATH + "canvas_back2.png";
  const backImageInfo = await getImageInfo(backUrl);
  ctx.drawImage(
    backImageInfo.path,
    0,
    0,
    canvasWidth.value,
    canvasHeight.value
  );

  // await new Promise((resolve) => {
  //     ctx.draw(true,() => {
  //         resolve()
  //     })
  // })

  // // 3. 绘制"向你推荐"文字
  // ctx.setFontSize(24)
  // ctx.setFillStyle('#606060')
  // ctx.setTextAlign('right')
  // ctx.fillText('向你推荐', 579 - 40, 52 + 20)

  // // 4. 绘制产品图片区域
  const productImgWidth = canvasWidth.value * 0.7;
  const productImgHeight = canvasWidth.value * 0.7;
  const productImgX = (canvasWidth.value - productImgWidth) / 2;
  const productImgY = canvasWidth.value * 0.2158894645941278; // 52+27+46

  // // 绘制灰色背景
  // ctx.setFillStyle('#FAFAFA')
  // ctx.fillRect(productImgX, productImgY, productImgWidth, productImgHeight)

  // // 继续绘制其他元素
  const continueDrawing = async () => {
    // // 5. 绘制底部标签
    // const tagX = productImgX + productImgWidth / 2
    // const tagY = productImgY - 30
    // const tagWidth = 207
    // const tagHeight = 25

    // // 绘制标签背景
    // ctx.setFillStyle('#F0FFFF')
    // ctx.setStrokeStyle('#00CBCC')
    // ctx.setLineWidth(1)
    // roundRect(ctx, tagX - tagWidth/2, tagY, tagWidth, tagHeight, 21.5)
    // ctx.fill()
    // ctx.stroke()

    // // 绘制"营养严选"按钮
    // const buttonWidth = 195
    // const buttonHeight = 47
    // const buttonX = tagX - tagWidth/2
    // const buttonY = tagY

    // ctx.setFillStyle('#00CBCC')
    // roundRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, 41.5)
    // ctx.fill()

    // 绘制"营养严选"文字
    // ctx.setFontSize(27)
    // ctx.setFillStyle('#FFFFFF')
    // ctx.setTextAlign('center')
    // ctx.fillText('营养严选', buttonX + buttonWidth/2, buttonY + buttonHeight/2 + 10)

    // 绘制"通过X项检测"文字
    const icon1Width = canvasWidth.value * 0.689119170984456;
    const icon1Height = canvasWidth.value * 0.08635578583765112;
    const icon1X = (canvasWidth.value - icon1Width) / 2;
    const icon1Y = canvasWidth.value * 0.7633851468048359;
    const icon1Url = HOME_IMG_PATH + "canvas_icon1.png";
    const icon1ImageInfo = await getImageInfo(icon1Url);
    ctx.drawImage(icon1ImageInfo.path, icon1X, icon1Y, icon1Width, icon1Height);
    const detectTextSize = 0.045;
    const detectText = `通过${selectItemObj.value?.costNum || 0}项检测`;
    ctx.setFontSize(detectTextSize * canvasWidth.value);
    ctx.setFillStyle("#00CBCC");
    ctx.setTextAlign("left");
    ctx.setTextBaseline("middle");
    ctx.fillText(
      detectText,
      canvasWidth.value * 0.5008635578583766,
      canvasWidth.value * 0.81
    );
    // 6. 绘制产品信息区域
    // const infoY = productImgY + productImgHeight + 12

    // 产品名字
    const productNameSize = 0.06217616580310881;
    ctx.setFontSize(productNameSize * canvasWidth.value);
    ctx.setFillStyle("#000000");
    ctx.setTextAlign("left");
    let productName = selectItemObj.value?.name || "";
    if (productName.length > 10) {
      productName = productName.substring(0, 10) + "...";
    }
    ctx.fillText(
      productName,
      canvasWidth.value * 0.07253886010362694,
      canvasWidth.value * 1
    );
    // 文本换行处理
    // drawText(ctx, productName, 40, infoY, 36, 579 - 80, 2)

    // 7. 绘制信息卡片
    // const cardX = 40
    // const cardY = infoY + 72  // 36+12+24
    // const cardWidth = 315
    // const cardHeight = 150

    // 卡片背景渐变
    // const gradient = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight)
    // gradient.addColorStop(0, '#FFFFFF')
    // gradient.addColorStop(1, '#F4FDFF')
    // ctx.setFillStyle(gradient)
    // ctx.setStrokeStyle('#00CBCC')
    // ctx.setLineWidth(1)

    // roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 6)
    // ctx.fill()
    // ctx.stroke()

    // 8. 绘制卡片顶部标签
    // const labelX = cardX - 3
    // const labelY = cardY - 6
    // const labelWidth = 200
    // const labelHeight = 40

    // 标签渐变背景
    // const labelGradient = ctx.createLinearGradient(labelX, labelY, labelX + labelWidth, labelY + labelHeight)
    // labelGradient.addColorStop(0, '#88E4E4')
    // labelGradient.addColorStop(1, '#00CBCC')
    // ctx.setFillStyle(labelGradient)

    // roundRect(ctx, labelX, labelY, labelWidth, labelHeight, 11)
    // ctx.fill()

    // 绘制白色图标圆圈
    // const iconX = labelX + 3
    // const iconY = labelY + (labelHeight - 35) / 2
    // ctx.setFillStyle('#FFFFFF')
    // ctx.beginPath()
    // ctx.arc(iconX + 17.5, iconY + 17.5, 17.5, 0, 2 * Math.PI)
    // ctx.fill()

    // 绘制图标
    // const iconImg = HOME_IMG_PATH + 'Vector.png'
    // ctx.drawImage(iconImg, iconX + 6.5, iconY + 5, 22, 25)

    // 绘制"营养严选"文字
    // ctx.setFontSize(20)
    // ctx.setFillStyle('#FFFFFF')
    // ctx.setTextAlign('left')
    // ctx.setTextBaseline('middle')
    // ctx.fillText('营养严选', iconX + 35 + 7, labelY + labelHeight/2)

    // 绘制"第X次"标签
    const timeLabelSize = 0.031;
    ctx.setFontSize(timeLabelSize * canvasWidth.value);
    ctx.setFillStyle("#00CBCC");
    ctx.setTextAlign("left");
    const currentReversedIndex = getReversedIndex(selectedIndex.value);
    const timeLabelText = `第${currentReversedIndex || 0}次`;
    // 计算数字部分的字符长度
    const indexLength = String(currentReversedIndex).length;

    // 根据数字字符长度动态计算x坐标
    let dynamicXPosition;
    switch (indexLength) {
      case 3: // 三位数，如 100
        dynamicXPosition = 0.292;
        break;
      case 2: // 两位数，如 10
        dynamicXPosition = 0.3;
        break;
      case 1: // 一位数，如 1
      default:
        dynamicXPosition = 0.31;
        break;
    }

    ctx.fillText(
      timeLabelText,
      canvasWidth.value * dynamicXPosition,
      canvasWidth.value * 1.115
    );
    // const labelTextWidth = ctx.measureText(timeLabelText).width + 18
    // const timeLabelX = iconX + 35 + 40

    // ctx.setFillStyle('#EAFFFF')
    // roundRect(ctx, timeLabelX, labelY + 7, labelTextWidth, 26, 22)
    // ctx.fill()

    // ctx.setFontSize(18)
    // ctx.setFillStyle('#00CBCC')
    // ctx.fillText(timeLabelText, timeLabelX + 9, labelY + labelHeight/2)

    // 9. 绘制卡片内容
    // const contentX = cardX + 15
    // const contentY = cardY + 37

    // // 时间
    // const timeText = formatDate(selectItemObj.value?.itemList?.[0]?.jcTime) || '检测时间'
    // ctx.setFontSize(26)
    // ctx.setFillStyle('#00CBCC')
    // ctx.fillText(timeText, contentX, contentY + 26)
    const timeSize = 0.044905008635578586;
    ctx.setFontSize(timeSize * canvasWidth.value);
    ctx.setFillStyle("#00CBCC");
    ctx.setTextAlign("left");
    const timeText =
      formatDate(
        selectItemObj.value?.itemList?.[selectedIndex.value]?.jcTime
      ) || "检测时间";
    ctx.fillText(
      timeText,
      canvasWidth.value * 0.09153713298791019,
      canvasWidth.value * 1.2
    );

    // // 描述
    // const descText = selectItemObj.value?.itemList?.[0]?.content?.replace(/<[^>]+>/g, '').substring(0, 40) + '...' || '暂无描述'
    // ctx.setFontSize(24)
    // ctx.setFillStyle('#000000')
    // drawText(ctx, descText, contentX, contentY + 26 + 29, 24, cardWidth - 30, 2)
    const descSize = 0.04145077720207254;
    ctx.setFontSize(descSize * canvasWidth.value);
    ctx.setFillStyle("#000000");
    ctx.setTextAlign("left");
    // let descText = selectItemObj.value?.itemList?.[selectedIndex.value]?.content?.replace(/<[^>]*>/g, '') || '';
    let descText =
      selectItemObj.value?.itemList?.[selectedIndex.value]?.title?.replace(
        /<[^>]*>/g,
        ""
      ) || "";
    if (descText.length > 10) {
      descText = descText.substring(0, 12) + "...";
    }
    ctx.fillText(
      descText,
      canvasWidth.value * 0.09153713298791019,
      canvasWidth.value * 1.26
    );

    // // 10. 绘制二维码区域
    // const qrCodeX = cardX + cardWidth + 20
    // const qrCodeY = cardY

    // // 绘制二维码图片
    const qrCodeWidth = 0.31 * canvasWidth.value;
    const qrCodeHeight = 0.31 * canvasWidth.value;
    const qrCodeX = 0.63 * canvasWidth.value;
    const qrCodeY = 0.97 * canvasWidth.value;
    const qrCodeImg = await generateMiniProgramQrCode({
      path: `pages/testing-result/index`,
      name: `id=${productId.value}`,
    });
    // const qrCodeImgInfo = await getImageInfo(qrCodeImg)
    // ctx.drawImage(qrCodeImg, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight)
    try {
      const qrCodePath = await base64ToPath(qrCodeImg);
      ctx.drawImage(qrCodePath, qrCodeX, qrCodeY, qrCodeWidth, qrCodeHeight);
    } catch (error) {
      console.error("绘制二维码失败:", error);
      // 错误处理：绘制占位符
    }
    // const qrCodeImg = HOME_IMG_PATH + 'image 788 2.png'
    // ctx.drawImage(qrCodeImg, qrCodeX, qrCodeY, 162, 175)

    // // 绘制"微信长按识别"文字
    // ctx.setFontSize(18)
    // ctx.setFillStyle('#626262')
    // ctx.setTextAlign('center')
    // ctx.fillText('微信长按识别', qrCodeX + 81, qrCodeY + 175 + 32)

    // // 11. 绘制底部标语
    // const sloganY = cardY + cardHeight + 57
    // const sloganWidth = 579 - 80

    // ctx.setFillStyle('#F0FFFF')
    // ctx.setStrokeStyle('#A5E3E4')
    // ctx.setLineWidth(1)

    // roundRect(ctx, 40, sloganY, sloganWidth, 49, 41.5)
    // ctx.fill()
    // ctx.stroke()

    // 绘制标语文字
    // ctx.setFontSize(26)
    // ctx.setFillStyle('#00CBCC')
    // ctx.setTextAlign('center')
    // ctx.setTextBaseline('middle')
    // ctx.fillText('只做有临床数据的营养补剂', 40 + sloganWidth/2, sloganY + 24.5)

    // 绘制完成
    ctx.draw(false, () => {
      setTimeout(() => {
        // 将canvas转换为图片
        uni.canvasToTempFilePath(
          {
            canvasId: "shareCanvas",
            success: (res) => {
              canvasImage.value = res.tempFilePath;
              isDrawing.value = false;
            },
            fail: (err) => {
              console.error("canvas转图片失败:", err);
              isDrawing.value = false;
              uni.showToast({
                title: "图片生成失败",
                icon: "none",
              });
            },
          },
          _this
        );
      }, 300);
    });
  };

  // 辅助函数：绘制圆角矩形
  const roundRect = (ctx, x, y, width, height, radius) => {
    if (radius < 0) radius = 0;
    if (radius > width / 2) radius = width / 2;
    if (radius > height / 2) radius = height / 2;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 2);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
    ctx.closePath();
  };

  // 辅助函数：绘制多行文本
  const drawText = (ctx, text, x, y, fontSize, maxWidth, maxLines = 1) => {
    ctx.setFontSize(fontSize);
    const lines = [];
    let currentLine = "";
    const words = text.split("");

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        lines.push(currentLine);
        currentLine = words[i];
        if (lines.length >= maxLines) {
          currentLine =
            currentLine.substring(0, currentLine.length - 1) + "...";
          break;
        }
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }

    // 绘制每一行
    lines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * (fontSize * 1.5));
    });
  };

  // // 绘制产品图片
  if (selectItemObj.value?.cpImg) {
    try {
      const productImageInfo = await getImageInfo(selectItemObj.value.cpImg);
      ctx.drawImage(
        productImageInfo.path,
        productImgX,
        productImgY,
        productImgWidth,
        productImgHeight
      );
      // await new Promise((resolve) => {
      //     ctx.draw(true,() => {
      //         resolve()
      //     })
      // })
      continueDrawing();
    } catch (error) {
      console.error("获取产品图片失败:", error);
      continueDrawing();
    }
  } else {
    continueDrawing();
  }
};

// 保存图片到相册
const saveImage = () => {
  if (!canvasImage.value) {
    uni.showToast({
      title: "图片生成中，请稍候",
      icon: "none",
    });
    return;
  }

  // 检查权限
  uni.authorize({
    scope: "scope.writePhotosAlbum",
    success: () => {
      uni.saveImageToPhotosAlbum({
        filePath: canvasImage.value,
        success: () => {
          uni.showToast({
            title: "保存成功",
            icon: "success",
            duration: 2000,
          });
          show.value = false;
        },
        fail: (err) => {
          console.error("保存图片失败:", err);
          uni.showToast({
            title: "保存失败，请重试",
            icon: "none",
          });
        },
      });
    },
    fail: (err) => {
      console.error("授权失败:", err);
      uni.showModal({
        title: "提示",
        content: "需要您授权保存图片到相册",
        confirmText: "去授权",
        success: (res) => {
          if (res.confirm) {
            uni.openSetting({
              success: (settingRes) => {
                console.log("设置结果:", settingRes);
              },
            });
          }
        },
      });
    },
  });
};

// 分享图片
const shareImage = () => {
  if (!canvasImage.value) {
    uni.showToast({
      title: "图片生成中，请稍候",
      icon: "none",
    });
    return;
  }

  // 获取当前页面信息
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];

  // 设置分享参数
  uni.showShareMenu({
    withShareTicket: true,
    menus: ["shareAppMessage", "shareTimeline"],
  });

  // 设置页面分享信息
  currentPage.onShareAppMessage = () => {
    return {
      title: `多重检测报告 - ${
        selectItemObj.value?.itemList?.[0]?.title || ""
      }`,
      path: `/pages/testing-result/index?id=${productId.value}`,
      imageUrl: canvasImage.value,
    };
  };

  // 分享到朋友圈
  currentPage.onShareTimeline = () => {
    return {
      title: `多重检测报告 - ${
        selectItemObj.value?.itemList?.[0]?.title || ""
      }`,
      query: `id=${productId.value}`,
      imageUrl: canvasImage.value,
    };
  };

  show.value = false;
};

// 对外暴露方法
defineExpose({
  open,
  close,
});
</script>

<style scoped lang="scss">
.testing-result {
  height: 100%;
  border-radius: 30rpx 30rpx 0 0;
  background-repeat: no-repeat;
  background-size: 100% auto;
}

.product-detail-popup-close {
  position: absolute;
  top: -80rpx;
  right: 20rpx;
  width: 45rpx;
  height: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 10;
  border: 2px solid #ffffff;
}

.header {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #121212;
}

.warp {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
  padding: 0 30rpx;
  box-sizing: border-box;

  .warp-top {
    width: 579rpx;
    background: transparent;
    margin-bottom: 48rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 900rpx;

    .loading-tip {
      width: 100%;
      height: 900rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #ffffff;
      border-radius: 28rpx;
    }
  }

  .warp-bottom {
    width: 579rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20rpx;

    .warp-bottom-left {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 278rpx;
      height: 74rpx;
      background: #ffffff;
      box-shadow: 0rpx 8rpx 24rpx 0rpx rgba(103, 61, 17, 0.08);
      border-radius: 106rpx 106rpx 106rpx 106rpx;
      font-weight: bold;
      font-size: 32rpx;
      color: #00cbcc;
      line-height: 40rpx;
      cursor: pointer;
    }

    .warp-bottom-right {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 278rpx;
      height: 74rpx;
      background: #00cbcc;
      box-shadow: 0rpx 8rpx 24rpx 0rpx rgba(103, 61, 17, 0.08);
      border-radius: 106rpx 106rpx 106rpx 106rpx;
      font-weight: bold;
      font-size: 32rpx;
      color: #ffffff;
      line-height: 40rpx;
      cursor: pointer;
      position: relative;

      button {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
      }
    }
  }
}

.content {
  position: relative;
  z-index: 89;
  // position: relative;
  // z-index: 89;
  // background: #fff;
  // border-radius: 30rpx 30rpx 0 0;
  // overflow: hidden;
  // height: calc(100vh - 494rpx);
}

.testing-jump-img {
  position: fixed;
  bottom: 300rpx;
  right: 30rpx;
  z-index: 99;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 2.35rpx 4.71rpx 11.88rpx 0rpx rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  image {
    height: 26rpx;
    width: 28rpx;
  }
}

.choose-img {
  width: 212rpx;
  height: 61rpx;
  position: absolute;
  right: 37rpx;
  top: 27rpx;
  z-index: 1;
}

.content-img {
  width: 100%;
  height: 494rpx;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 80;
}

.content-title {
  font-weight: 400;
  font-size: 26rpx;
  color: #484848;
  line-height: 40rpx;
  padding: 35rpx 35rpx 19rpx;
  // background: #fff;
}

.testing-box-bottom {
  position: fixed;
  bottom: 110rpx;
  right: 30rpx;
  z-index: 99;
  text-align: center;
  background: #ffffff;
  box-shadow: 2rpx 5rpx 18rpx 0rpx rgba(0, 0, 0, 0.07);
  border-radius: 20rpx;
  overflow: hidden;
  cursor: pointer;

  image {
    width: 120rpx;
    height: 120rpx;
    display: block;
  }

  .testing-box-bottom-name {
    background: #00cbcc;
    border-radius: 0rpx 0rpx 0rpx 0rpx;
    font-weight: 500;
    font-size: 22rpx;
    color: #ffffff;
    line-height: 35rpx;
    text-align: center;
    padding: 5rpx 0;
  }
}

.content-scroll {
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.content-list {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  padding: 0 32rpx;
  gap: 18rpx;
}

.list-item {
  flex-shrink: 0;
  width: 249rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f4fdff 100%);
  border-radius: 12rpx;
  border: 1rpx solid #bde9e9;
  padding: 7rpx 15rpx 14rpx;
  box-sizing: border-box;
  cursor: pointer;

  &.selected {
    border: 1rpx solid #00cbcc;
    box-shadow: 0rpx 4rpx 12rpx 0rpx rgba(0, 203, 204, 0.2);
  }
}

.item-first-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.item-time {
  font-weight: 400;
  font-size: 26rpx;
  color: #00cbcc;
  line-height: 40rpx;
  margin-right: 9rpx;
}

.count-container {
  height: 26rpx;
  padding: 3rpx 10rpx;
  font-size: 16rpx;
  color: #00cbcc;
  line-height: 26rpx;
  background: #eaffff;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-second-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8rpx;
}

.item-new {
  width: 28rpx;
  height: 28rpx;
  background: #ff9d18;
  border-radius: 6rpx;
  font-size: 20rpx;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  padding: 0;
}

.item-text {
  font-weight: 400;
  font-size: 24rpx;
  color: #000000;
  line-height: 29rpx;
  flex: 1;
  word-break: break-all;
}

.choose-us-scroll {
  background-color: #fff;
  height: calc(80vh - 425rpx);
  position: relative;
}

.choose-content {
  padding: 100rpx 35rpx 50rpx;
  box-sizing: border-box;
  min-height: 100%;
}
</style>
