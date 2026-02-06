<template>
  <view>
    <view class="product-window" :class="{ on: isShow }">
      <view class="icon-guanbi" @click="closeAttr">
        <uv-icon name="close" size="40rpx" color="#999"></uv-icon>
      </view>

      <view class="trip-msg">
        <view class="title"> 获取您的昵称、头像 </view>
        <view class="trip"> 提供具有辨识度的用户中心界面 </view>
      </view>
      <form @submit="formSubmit">
        <view class="edit">
          <view class="nickname edit-box">
            <view class="left">
              <view class="head">昵称</view>
              <view class="input">
                <input type="nickname" placeholder-class="pl-sty" placeholder="请输入昵称" name="nickname" :maxlength="16" v-model="userInfo.nickname" />
              </view>
            </view>
          </view>
          <view
            class="avatar edit-box"
            @click.stop="
              () => {
                !mp_is_new ? uploadpic() : null;
              }
            "
          >
            <button v-if="mp_is_new" open-type="chooseAvatar" @chooseavatar="onChooseAvatar"></button>
            <view class="left">
              <view class="head">头像</view>
              <view class="avatar-box" v-if="!mp_is_new">
                <image :src="userInfo.avatar" v-if="userInfo.avatar"></image>
                <image :src="avatarUrl" v-else-if="avatarUrl"></image>
                <image v-else :src="COMMON_IMG_PATH + 'default_top.png'" />
              </view>
              <view v-else class="avatar-box">
                <image v-if="userInfo.avatar" :src="userInfo.avatar"></image>
                <image :src="avatarUrl" v-else-if="avatarUrl"></image>
                <image v-else :src="COMMON_IMG_PATH + 'default_top.png'" />
              </view>
            </view>
            <view class="right">
              <uv-icon name="arrow-right" size="14px" />
            </view>
          </view>
        </view>

        <view class="bottom">
          <button class="save" formType="submit" :class="{ open: userInfo.avatar }">保存</button>
        </view>
      </form>

      <view class="product-window-bottom" :style="{ height: bottomHeight + 'px' }"></view>
    </view>
    <canvas canvas-id="canvas" v-if="canvasStatus" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px', position: 'absolute', left: '-1000px', top: '-1000px' }"></canvas>
    <view class="mask" @touchmove.prevent v-if="isShow" @click="closeAttr"></view>
  </view>
</template>

<script>
import { COMMON_IMG_PATH } from "@/utils/imgpath.js";
import { requestUtil } from "@/utils/request";
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      COMMON_IMG_PATH,
      avatarUrl: "",
      mp_is_new: false,
      userInfo: {
        avatar: "",
        nickname: "",
      },
      mpData: uni.getStorageSync("copyRight"),
      canvasStatus: false,
      bottomHeight: 0,
    };
  },
  mounted() {
    setTimeout(() => {
      const sysInfo = uni.getSystemInfoSync();
      if (this.compareVersion(sysInfo.SDKVersion, "2.21.3") >= 0) {
        this.mp_is_new = true;
      } else {
        this.mp_is_new = false;
      }
      this.bottomHeight = (sysInfo.safeAreaInsets.bottom > 0 ? sysInfo.safeAreaInsets.bottom : 10) + 10;
    });
  },
  methods: {
    /**
     * 小程序比较版本信息
     * @param v1 当前版本
     * @param v2 进行比较的版本
     * @return boolen
     *
     */
    compareVersion(v1, v2) {
      v1 = v1.split(".");
      v2 = v2.split(".");
      const len = Math.max(v1.length, v2.length);

      while (v1.length < len) {
        v1.push("0");
      }
      while (v2.length < len) {
        v2.push("0");
      }

      for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i]);
        const num2 = parseInt(v2[i]);

        if (num1 > num2) {
          return 1;
        } else if (num1 < num2) {
          return -1;
        }
      }

      return 0;
    },
    /*
     * 单图上传压缩版
     * @param object opt
     */
    uploadImageChange(opt, sizeCallback) {
      this.canvasStatus = true;
      if (typeof opt === "string") {
        let url = opt;
        opt = {};
        opt.url = url;
      }
      let count = opt.count || 1,
        sizeType = opt.sizeType || ["compressed"],
        sourceType = opt.sourceType || ["album", "camera"],
        fileType = opt.fileType || "image";
      uni.chooseImage({
        count: count, //最多可以选择的图片总数
        sizeType: sizeType, // 可以指定是原图还是压缩图，默认二者都有
        sourceType: sourceType, // 可以指定来源是相册还是相机，默认二者都有
        success: (res) => {
          uni.getImageInfo({
            src: res.tempFilePaths[0],
            success: (ress) => {
              uni.showLoading({
                title: "请稍后",
              });
              if (res.tempFiles[0].size <= 2097152) {
                uni.hideLoading();
                this.canvasStatus = false;
                this.avatarUrl = ress.path;
                return;
              }
              let canvasWidth,
                canvasHeight,
                xs,
                maxWidth = 750;
              xs = ress.width / ress.height; // 宽高比例
              if (ress.width > maxWidth) {
                canvasWidth = maxWidth; // 这里是最大限制宽度
                canvasHeight = maxWidth / xs;
              } else {
                canvasWidth = ress.width;
                canvasHeight = ress.height;
              }
              sizeCallback &&
                sizeCallback({
                  w: canvasWidth,
                  h: canvasHeight,
                });
              let canvas = uni.createCanvasContext("canvas");
              canvas.width = canvasWidth;
              canvas.height = canvasHeight;
              canvas.clearRect(0, 0, canvasWidth, canvasHeight);
              canvas.drawImage(ress.path, 0, 0, canvasWidth, canvasHeight);
              canvas.save();
              // 这里的画布drawImage是一种异步属性  可能存在未绘制全就执行了draw的问题  so添加延迟
              setTimeout((e) => {
                canvas.draw(true, () => {
                  uni.canvasToTempFilePath({
                    canvasId: "canvas",
                    fileType: "JPEG",
                    destWidth: canvasWidth,
                    destHeight: canvasHeight,
                    quality: 0.7,
                    success: (canvasPath) => {
                      uni.hideLoading();
                      this.canvasStatus = false;
                      this.avatarUrl = canvasPath.tempFilePath;
                    },
                  });
                });
              }, 200);
            },
            fail(err) {
              uni.showToast({
                title: "图片异常，请更换图片",
                icon: "none",
              });
              console.log(err);
            },
          });
        },
        fail: (err) => {
          console.log(err);
        },
      });
    },

    async uploadImg() {
      return await requestUtil.upload({
        url: "/member/user/update-avatar",
        filePath: this.avatarUrl,
        name: "avatarFile",
      });
    },

    /**
     * 上传文件
     *
     */
    uploadpic: function () {
      let that = this;
      this.uploadImageChange("upload/image", (res) => {
        this.canvasWidth = res.w;
        this.canvasHeight = res.h;
      });
    },
    // 微信头像获取
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      this.avatarUrl = avatarUrl;
    },
    closeAttr: function () {
      this.$emit("closeEdit");
    },
    /**
     * 提交修改
     */
    async formSubmit(e) {
      try {
        uni.showLoading({
          title: "请稍后",
          mask: true,
        });
        const res = await this.uploadImg();
        if (res) {
          this.userInfo.avatar = res;
        } else {
          uni.hideLoading();
          uni.showToast({
            title: "头像上传失败",
            icon: "error",
          });
          return;
        }
        this.$emit(
          "editSuccess",
          {
            avatar: this.userInfo.avatar,
            nickname: this.userInfo.nickname,
          });
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>
<style>
.pl-sty {
  color: #999999;
  font-size: 30rpx;
}
</style>
<style scoped lang="scss">
.product-window.on {
  transform: translate3d(0, 0, 0);
}

.mask {
  z-index: 999998;
  background-color: rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  width: 100%;
  left: 0;
  height: 100%;
}

.product-window {
  position: fixed;
  bottom: 0;
  width: 100%;
  left: 0;
  background-color: #fff;
  z-index: 999999;
  border-radius: 20rpx 20rpx 0 0;
  transform: translate3d(0, 100%, 0);
  transition: all 0.3s cubic-bezier(0.25, 0.5, 0.5, 0.9);
  padding: 38rpx 40rpx;
  padding-bottom: 0rpx;
  box-sizing: border-box;

  .icon-guanbi {
    position: absolute;
    top: 40rpx;
    right: 40rpx;
    font-size: 24rpx;
    font-weight: bold;
    color: #999;
  }

  .mp-data {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;

    .mp-name {
      font-size: 28rpx;
      font-weight: bold;
      color: #000000;
    }

    image {
      width: 40rpx;
      height: 50rpx;
      margin-right: 16rpx;
    }
  }

  .trip-msg {
    padding-bottom: 32rpx;
    border-bottom: 1px solid #f5f5f5;

    .title {
      font-size: 30rpx;
      font-weight: bold;
      color: #000;
      margin-bottom: 6rpx;
    }

    .trip {
      font-size: 26rpx;
      color: #777777;
    }
  }

  .edit {
    border-bottom: 1px solid #f5f5f5;

    .avatar {
      border-bottom: 1px solid #f5f5f5;
      position: relative;
      & > button {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 99;
        opacity: 0;
      }
    }

    .nickname {
      .input {
        width: 100%;
      }

      input {
        height: 80rpx;
      }
    }

    .edit-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 30rpx;
      padding: 22rpx 0;

      .left {
        display: flex;
        align-items: center;
        flex: 1;

        .head {
          color: rgba(0, 0, 0, 0.9);
          white-space: nowrap;
          margin-right: 60rpx;
        }

        button {
          flex: 1;
          display: flex;
          align-items: center;
        }
      }

      image {
        width: 80rpx;
        height: 80rpx;
        border-radius: 6rpx;
      }
    }

    .icon-xiangyou {
      color: #cfcfcf;
    }
  }

  .bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    position: static;

    .save {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 368rpx;
      height: 80rpx;
      border-radius: 12rpx;
      margin-top: 52rpx;
      background-color: #00cbcc;
      color: #ffffff;
      font-size: 30rpx;
      font-weight: bold;
    }

    .save.open {
      border: 1px solid #fff;
      background-color: #07c160;
      color: #fff;
    }
  }
}

.avatar-box {
  position: relative;
  button {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9;
    opacity: 0;
  }
  image {
    border-radius: 50%;
  }
}
</style>
