<template>
    <view class="submit-modal">
        <!-- 提交弹窗 -->
        <uv-popup type="center" :closeOnClickOverlay="false" :closeable="false" :safe-area-inset-bottom="true"
            bgColor="rgba(0,0,0,0)" border-radius="20rpx" padding="40rpx" ref="popupRef">
            <view class="submit-modal-content">
                <view class="submit-modal-userinfo">
                    <!-- 图片 -->
                    <image :src="EVALUATION_IMG_PATH + 'update-userinfo-back2.png'" mode="scaleToFill" />
                    <view class="submit-modal-userinfo-title">
                        <image :src="EVALUATION_IMG_PATH + 'update-logo.png'" mode="widthFix" />
                        <text>Hello, 怎么称呼您?</text>
                    </view>
                    <view class="submit-modal-userinfo-inner">
                        <uv-form  :model="userInfo" :labelStyle="{ fontWeight: '500', fontSize: '32rpx', color: '#2F2F2F' }">
                            <uv-form-item label="昵称" prop="nickname" borderBottom>
                                <uv-input 
                                    v-model="userInfo.nickname" 
                                    type="nickname"
                                    placeholder="昵称不能为空，限16个字符或汉字" 
                                    border="none" 
                                    fontSize="28rpx"
                                    placeholderStyle="color: #7A7A7A"
                                    :maxlength="16"
                                />
                            </uv-form-item>
                            <uv-form-item label="头像" prop="avatar">
                                <view class="submit-modal-userinfo-avatar">
                                    <button v-if="mp_is_new" open-type="chooseAvatar" @chooseavatar="onChooseAvatar"></button>
                                    <view v-if="!mp_is_new"  @click.stop="uploadpic" class="submit-modal-userinfo-avatar-btn">
                                        <image :src="avatarUrl" v-if="avatarUrl"></image>
                                        <image :src="userInfo.avatar" v-else-if="userInfo.avatar"></image>
                                        <image v-else :src="EVALUATION_IMG_PATH + 'up-avatar-back.png'" />
                                    </view>
                                    <view v-else>
                                        <image :src="avatarUrl" v-if="avatarUrl"></image>
                                        <image v-else-if="userInfo.avatar" :src="userInfo.avatar"></image>
                                        <image v-else :src="EVALUATION_IMG_PATH + 'up-avatar-back.png'" />
                                    </view>
                                </view>

                                <template #right>
                                    <button v-if="mp_is_new" 
                                            open-type="chooseAvatar" 
                                            class="avatar-arrow-btn"
                                            @chooseavatar="onChooseAvatar">
                                        <uv-icon name="arrow-right"></uv-icon>
                                    </button>
                                    <uv-icon v-else name="arrow-right" @click.stop="uploadpic"></uv-icon>
                                </template>
                            </uv-form-item>
                        </uv-form>
                    </view>
                </view>

                <!-- 提交按钮 -->
                <view class="submit-modal-btn" @click="submitForm">提交问卷</view>
            </view>
        </uv-popup>

        <canvas canvas-id="canvas" v-if="canvasStatus"
            :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px', position: 'absolute', left: '-1000px', top: '-1000px' }"></canvas>
    </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import { requestUtil } from "@/utils/request";
import { useMainStore } from "@/store/modules/useMainStore";
import { updateNickname } from "@/api/user";
import { getPageUid } from "@/api/evaluation";
import { VUE_APP_UPLOAD_URL } from "@/config";

const store = useMainStore();

const props = defineProps({
    isShow: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['submit']);

const avatarUrl = ref("");
const mp_is_new = ref(false);
const userInfo = reactive({
    avatar: "",
    nickname: "",
});
const canvasStatus = ref(false);
const bottomHeight = ref(0);
const popupRef = ref(null);
const canvasHeight = ref(0)
const canvasWidth = ref(0)

const isFirstSubmit = ref(false);

onMounted(() => {
    setTimeout(() => {
        const sysInfo = uni.getSystemInfoSync();
        if (compareVersion(sysInfo.SDKVersion, "2.21.3") >= 0) {
            mp_is_new.value = true;
        } else {
            mp_is_new.value = false;
        }
        bottomHeight.value = (sysInfo.safeAreaInsets.bottom > 0 ? sysInfo.safeAreaInsets.bottom : 10) + 10;
    });
});

/**
 * 小程序比较版本信息
 * @param v1 当前版本
 * @param v2 进行比较的版本
 * @return boolen
 */
const compareVersion = (v1, v2) => {
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
};

/*
 * 单图上传压缩版
 * @param object opt
 */
const uploadImageChange = (opt, sizeCallback) => {
    canvasStatus.value = true;
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
                        canvasStatus.value = false;
                        avatarUrl.value = ress.path;
                        return;
                    }
                    let _canvasWidth,
                        _canvasHeight,
                        xs,
                        maxWidth = 750;
                    xs = ress.width / ress.height; // 宽高比例
                    if (ress.width > maxWidth) {
                        _canvasWidth = maxWidth; // 这里是最大限制宽度
                        _canvasHeight = maxWidth / xs;
                    } else {
                        _canvasWidth = ress.width;
                        _canvasHeight = ress.height;
                    }
                    sizeCallback &&
                        sizeCallback({
                            w: _canvasWidth,
                            h: _canvasHeight,
                        });
                    let canvas = uni.createCanvasContext("canvas");
                    canvas.width = _canvasWidth;
                    canvas.height = _canvasHeight;
                    canvas.clearRect(0, 0, _canvasWidth, _canvasHeight);
                    canvas.drawImage(ress.path, 0, 0, _canvasWidth, _canvasHeight);
                    canvas.save();
                    // 这里的画布drawImage是一种异步属性  可能存在未绘制全就执行了draw的问题  so添加延迟
                    setTimeout((e) => {
                        canvas.draw(true, () => {
                            uni.canvasToTempFilePath({
                                canvasId: "canvas",
                                fileType: "JPEG",
                                destWidth: _canvasWidth,
                                destHeight: _canvasHeight,
                                quality: 0.7,
                                success: (canvasPath) => {
                                    uni.hideLoading();
                                    canvasStatus.value = false;
                                    avatarUrl.value = canvasPath.tempFilePath;
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
};

/**
 * 上传文件
 *
 */
function uploadpic() {
    uploadImageChange("upload/image", (res) => {
        canvasWidth.value = res.w;
        canvasHeight.value = res.h;
    });
}

/** 
 * 更新用户头像
 */
const updateAvatarImg = async () => {
    return await requestUtil.upload({
        url: "/member/user/update-avatar",
        filePath: avatarUrl.value,
        name: "avatarFile",
    });
};

/**
 * 图片上传
 */
async function uploadImgFile() {
    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: VUE_APP_UPLOAD_URL,
            filePath: avatarUrl.value,
            name: 'file',
            formData: {
                user: 'test'
            },
            success: (res) => {
                try {
                    const data = JSON.parse(res.data)
                    resolve(data.data)
                } catch (error) {
                    resolve(res.data?.data || res.data)
                }
            },
            fail: (err) => {
                uni.showToast({
                    title: "头像上传失败",
                    icon: "error",
                });
                reject(err);
            }
        });
    })
}

// 微信头像获取
const onChooseAvatar = (e) => {
    const { avatarUrl: url } = e.detail;
    avatarUrl.value = url;
};

const editUserSuccess = async (data) => {
    try {
        uni.showLoading({
            title: "提交中",
            mask: true,
        });
        emit('submit', data);
    } catch (error) {
        console.error(error);
        uni.hideLoading();
    }
};

/**
 * 提交修改
 */
const submitForm = async () => {
    if(!userInfo.nickname){
        uni.showToast({
            title: "请输入你的名字",
            icon: "none",
        });
        return;
    }
    try {
        uni.showLoading({
            title: "请稍后",
            mask: true,
        });
        
        let avatar = avatarUrl.value || userInfo.avatar || '';

        if (isFirstSubmit.value) {
            await updateNickname({
                birthday: store.user.birthday,
                nickname: userInfo.nickname,
                sex: store.user.sex,
            });

            if (avatarUrl.value) {
                const res = await updateAvatarImg();
                if (res) {
                    userInfo.avatar = res;
                    avatar = res;
                } else {
                    uni.hideLoading();
                    uni.showToast({
                        title: "头像上传失败",
                        icon: "error",
                    });
                    return;
                }
            }

            store.getUserInfo();
        } else {
            if (avatarUrl.value) {
                const res = await uploadImgFile();
                if (res) {
                    avatar = res;
                } else {
                    uni.hideLoading();
                    uni.showToast({
                        title: "头像上传失败",
                        icon: "error",
                    });
                    return;
                }
            }
        }

        editUserSuccess({
            avatar,
            nickname: userInfo.nickname,
        });
    } catch (error) {
        console.error(error);
    }
};

const open = () => {
    uni.showLoading({
        title: "加载中...",
        mask: true
    })

    getPageUid({
        pageNo: 1,
        pageSize: 1,
    })
        .then((res) => {
            uni.hideLoading();
            if (res && res.list && res.list.length) {
                isFirstSubmit.value = false;
                userInfo.avatar = res.list[0].avatar
                // userInfo.nickname = res.list[0].nickname
            } else {
                isFirstSubmit.value = true;

                if (store.user) {
                    userInfo.avatar = store.user.avatar
                    // userInfo.nickname = store.user.nickname
                }
            }
        })
        .catch((err) => {
            if (store.user) {
                userInfo.avatar = store.user.avatar
            }
            console.error(err);
            uni.hideLoading();
        });
    console.log('userInfo', userInfo)
    popupRef.value.open();
}

const close = () => {
    popupRef.value.close();
}

defineExpose({
    open,
    close
})
</script>

<style lang="scss">
.submit-modal-userinfo-form {
    width: 100%;
}

.submit-modal-btn {
    width: 362rpx;
    margin: 0 auto;
    line-height: 84rpx;
    background: #00cbcc;
    font-weight: 600;
    font-size: 28rpx;
    color: #ffffff;
    text-align: center;
    font-style: normal;
    text-transform: none;
    text-align: center;
    border-radius: 50rpx;
    margin-top: 20rpx;
}

.submit-modal-userinfo {
    position: relative;
    width: 620rpx;
    margin-bottom: 50rpx;

    &>image {
        width: 100%;
        height: 520rpx;
        display: block;
    }
}

.submit-modal-userinfo-title {
    position: absolute;
    top: 40rpx;
    left: 0;
    width: 100%;
    text-align: center;

    image {
        width: 300rpx;
        height: 90rpx;
    }

    text {
        font-weight: 600;
        font-size: 38rpx;
        color: #00CBCC;
        line-height: 40rpx;
        text-align: center;
        font-style: normal;
        text-transform: none;
        margin-top: 50rpx;
        display: block;
    }
}

.submit-modal-userinfo-inner {
    position: absolute;
    top: 260rpx;
    padding: 0 50rpx;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    z-index: 9;
}

.submit-modal-userinfo-avatar {
    width: 78rpx;
    height: 78rpx;
    overflow: hidden;
    margin-right: 20rpx;
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

    view,
    image {
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 50%;
    }
}

.avatar-arrow-btn {
    width: max-content;
    height: max-content;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;

    &::after {
        border: none;
    }
}
</style>