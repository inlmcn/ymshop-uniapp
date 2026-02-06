<template>
  <layout>
    <Header>账号设置</Header>
    <view v-if="user">
      <view class="y-list">
        <uv-upload
            :useBeforeRead="true"
            @afterRead="handleUploadAvatar"
        >
          <view class="upload-warp">
            <uv-list border>
              <uv-list-item
                  border
                  show-arrow
              >
                <view class="y-list-content avatar flex flex-jc__sb">
                  <view class="y-list-label">头像</view>
                  <view class="y-list-avatar">
                    <uv-image
                        class="img"
                        :src="store.user.avatar"
                        width="90rpx"
                        height="90rpx"
                        shape="circle"
                    >
                      <template v-slot:error>
                        <uv-icon name="photo"></uv-icon>
                      </template>
                    </uv-image>
                  </view>
                </view>
              </uv-list-item>
            </uv-list>
          </view>
        </uv-upload>
      </view>
      <view class="y-list">
        <uv-list border>
          <uv-list-item
              border
              clickable
              @click=""
          >
            <view class="y-list-content">
              <view class="y-list-label">ID</view>
              <view class="y-list-select-placeholder">
                {{ store.user.id }}
              </view>
            </view>
          </uv-list-item>
          <uv-list-item
              border
              clickable
              show-arrow
              @click=""
          >
            <view class="y-list-content">
              <view class="y-list-label">昵称</view>
              <view class="y-list-select-placeholder">
                <uv-input
                    placeholder="请输入内容"
                    border="none"
                    v-model="store.user.nickname"
                    @blur="nicknameChange"
                    inputAlign="right"
                ></uv-input>
              </view>
            </view>
          </uv-list-item>
          <uv-list-item
              border
              clickable
              show-arrow
              @click=""
          >
            <view class="y-list-content">
              <view class="y-list-label">性别</view>
              <view class="y-list-select-placeholder">
                {{ store.user.nickname }}
              </view>
            </view>
          </uv-list-item>
          <uv-list-item
              border
              clickable
              show-arrow
              @click="openBirthdayPicker"
          >
            <view class="y-list-content">
              <view class="y-list-label">出生日期</view>
              <view class="y-list-select-placeholder">
                {{ store.user.birthday }}
              </view>
            </view>
          </uv-list-item>
        </uv-list>

      </view>
      <view class="y-list">
        <uv-list border>
          <uv-list-item
              border
              clickable
              show-arrow
              @click=""
          >
            <view class="y-list-content">
              <view class="y-list-label">手机号</view>
              <view class="y-list-select-placeholder">
                {{ store.user.mobile }}
                <!--                <uv-input placeholder="请输入内容" border="none" v-model="store.user.mobile" @blur="mobileChange" inputAlign="right"></uv-input>-->
              </view>
            </view>
          </uv-list-item>
        </uv-list>
      </view>
    </view>
    <view class="form-buttons">
      <uv-button
          round
          block
          type="primary"
          @tap="handleLogout"
      >
        退出登录
      </uv-button>
    </view>
    <uv-datetime-picker
        ref="datetimePickerRef"
        mode="date"
        minDate="1900"
        @confirm="datetimeConfirm"
    >
    </uv-datetime-picker>
  </layout>
</template>

<script setup>

import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { objectURLToBlob } from '@/utils'
import Header from "@/components/Header/index.vue"
import { useMainStore } from '@/store/modules/useMainStore'
import { updateAvatar, updateNickname } from '@/api/user'
import { useGlobalProperties } from "@/hooks";
import { useRouter } from "@/hooks/useRouter";

const store = useMainStore()

const {user} = storeToRefs(store)
const datetimePickerRef = ref(null)
const {$timeFormat} = useGlobalProperties()

const {goBack} = useRouter()

const handleLogout = () => {
  store.logout()
  uni.removeStorageSync("prevOpenModalTime");
}


onLoad((option) => {
  store.getUserInfo()
})

const handleUploadAvatar = async (event) => {
  const imgObj = await objectURLToBlob(event.file.url)
  let file = new File([imgObj], '', {
    type: imgObj.type
  })
  let data = new FormData()
  data.append('avatarFile', file)
  uni.showLoading({
    title: '上传中'
  });
  updateAvatar(data).then(() => {
    uni.hideLoading()
    store.getUserInfo()
  })
}

// 昵称改变
const nicknameChange = () => {
  if (!store.user.nickname) return
  uni.showLoading({
    title: '更新中'
  });
  updateNickname({
    nickname: store.user.nickname,
    birthday: store.user.birthday
  }).then(() => {
    uni.hideLoading()
    store.getUserInfo()
  })
}

// 打开生日窗口
const openBirthdayPicker = () => {
  datetimePickerRef.value.open();
}

//
const datetimeConfirm = (e) => {
  store.user.birthday = $timeFormat(e.value, 'yyyy-mm-dd')
  nicknameChange()
}

</script>

<style lang="scss">
.upload-warp {
  width: 750rpx;
}
</style>
