<!--
    @name: index
    @author: kahu4
    @date: 2023-11-10 14:55
    @description：index
    @update: 2023-11-10 14:55
-->
<script setup>
import Header from "@/components/Header/index.vue"
import dayjs from "dayjs"
import { useMainStore } from "@/store/modules/useMainStore";
import { storeToRefs } from "pinia";
import UvIcon from "@/uni_modules/uv-icon/components/uv-icon/uv-icon.vue";
import UvImage from "@/uni_modules/uv-image/components/uv-image/uv-image.vue";
import UvUpload from "@/uni_modules/uv-upload/components/uv-upload/uv-upload.vue";
import { useInterface } from "@/hooks/useInterface";
import { useRequest } from "@/pages/userInfo/index.utlis";
import { sexColumns, userInfoList, userInfoNextList } from "@/pages/userInfo/index.data";
import { onShow } from "@dcloudio/uni-app";
import UvPicker from "@/uni_modules/uv-picker/components/uv-picker/uv-picker.vue";
import { ref, unref } from "vue";
import UvDatetimePicker from "@/uni_modules/uv-datetime-picker/components/uv-datetime-picker/uv-datetime-picker.vue";
import Model from '@/components/Modal/index.vue'

const {loading, hideLoading} = useInterface()
const {doUpdateAvatar, doUpdateUserInfo} = useRequest()

const userStore = useMainStore()
const {user} = storeToRefs(userStore)

const funcMap = {
  openSex,
  openBirthday
}
const dateModel = ref(new Date().getTime())
const sexPicker = ref()
const birthdayPicker = ref()
const modelRef = ref()

const handleLogout = () => {
  userStore.logout()
  uni.removeStorageSync("prevOpenModalTime");
}

/**
 * 选择用户头像以后
 * @param event
 * @returns {Promise<void>}
 */
async function afterChooseFile(event) {
  await doUpdateAvatar(event.file)
}

function sexChange(event) {
  const sex = event.value[0].value
  user.value.sex = sex
  // 请求
  doUpdateUserInfo()
}

function birthdayChange(event) {
  const timeStamp = event.value
  user.value.birthday = dayjs(timeStamp).format('YYYY-MM-DD');
  // 请求
  doUpdateUserInfo()
}


function handleClickRow(cellRow) {
  if (cellRow.type === 'input') return
  if (cellRow.type === 'text') {
    if (cellRow.func) {
      funcMap[cellRow.func]()
    }
  }
}

function openSex() {
  unref(sexPicker).open()
}

function openBirthday() {
  unref(birthdayPicker).open()
}

onShow(async () => {
  await userStore.getUserInfo()
})

</script>

<template>
  <view class="account-setting">
    <Header
        header-area-bg="#fff"
        system-bar-area-bg="#fff"
    >
      个人信息
    </Header>
    <!-- 头像 -->
    <view class="card">
      <view class="cell-row">
        <view class="label">
          头像
        </view>
        <view class="value">
          <uv-upload
              :capture="['album', 'camera']"
              use-before-read
              @afterRead="afterChooseFile"
          >
            <uv-image
                class="img"
                :src="user&&user.avatar"
                width="90rpx"
                height="90rpx"
                shape="circle"
            >
              <template v-slot:error>
                <uv-icon name="photo"></uv-icon>
              </template>
            </uv-image>
          </uv-upload>
          <uv-icon
              name="arrow-right"
              color="#999"
          />
        </view>
      </view>
    </view>

    <view
        class="card"
        v-if="user"
    >
      <template
          v-for="cellRow in userInfoList"
          :key="cellRow.field"
      >
        <view
            class="cell-row"
            @click="handleClickRow(cellRow)"
        >
          <view class="label">
            {{ cellRow.label }}
          </view>
          <view class="value">
            <template v-if="cellRow.type === 'text'">
              <template v-if="cellRow.map">
                {{ cellRow.map[user[cellRow.field]] }}
              </template>
              <template v-else>
                {{ user[cellRow.field] }}
              </template>
            </template>
            <template v-if="cellRow.type==='input'">
              <input
                  type="text"
                  :placeholder="`请输入${cellRow.label}`"
                  v-model="user[cellRow.field]"
                  @blur="doUpdateUserInfo"
              />
            </template>
            <uv-icon
                v-if="cellRow.icon"
                name="arrow-right"
                color="#999"
            />
          </view>
        </view>
      </template>
    </view>

    <view
        class="card"
        v-if="user"
    >
      <template
          v-for="cellRow in userInfoNextList"
          :key="cellRow.field"
      >
        <view
            class="cell-row"
            @click="handleClickRow(cellRow)"
        >
          <view class="label">
            {{ cellRow.label }}
          </view>
          <view class="value">
            <template v-if="cellRow.type === 'text'">
              <template v-if="cellRow.map">
                {{ cellRow.map[user[cellRow.field]] }}
              </template>
              <template v-else>
                {{ user[cellRow.field] }}
              </template>
            </template>
            <template v-if="cellRow.type==='input'">
              <input
                  type="text"
                  :placeholder="`请输入${cellRow.label}`"
                  v-model="user[cellRow.field]"
              />
            </template>
            <uv-icon
                v-if="cellRow.icon"
                name="arrow-right"
                color="#999"
            />
          </view>
        </view>
      </template>
    </view>

<!--   <view
        class="card button"
        @click="modelRef.show()"
    >
      退出登录
    </view> -->
  </view>

  <!-- 性别 -->
  <uv-picker
      :round="15"
      ref="sexPicker"
      keyName="label"
      :columns="sexColumns"
      color="#999"
      confirmColor="#00CBCC"
      activeColor="#00CBCC"
      @confirm="sexChange"
  />

  <!-- 生日 -->
  <uv-datetime-picker
      :round="15"
      v-model="dateModel"
      :minDate="(new Date('1900-01-01')).getTime()"
      ref="birthdayPicker"
      mode="date"
      @confirm="birthdayChange"
  />

  <!-- 退出弹窗 -->
  <Model
      content="确认要退出登录吗？此操作将会清空登录数据以及用户信息"
      ref="modelRef"
      @confirm="handleLogout"
  />
</template>

<style
    scoped
    lang="scss"
>
.account-setting {
  //@include usePadding(20, 20);

  .card {
    @include usePadding(34, 0);
    background: #fff;
    margin-bottom: 20rpx;
    //border-radius: 15rpx;

    .cell-row {
      @include usePadding(0, 45);
      @include useFlex(space-between, center);
      border-bottom: 1rpx solid #E6E6E6;

      &:last-child {
        border-bottom: 0;
      }

      .label {
        font-size: 28rpx;
        color: #333;
      }

      .value {
        @include useFlex(flex-end, center, row, nowrap, 10rpx);
        font-size: 28rpx;
        color: #999;

        input {
          text-align: right;
        }
      }
    }
  }

  .button {
    @include usePadding(34, 25);
    background: #fff;
    color: #000;
    text-align: center;
  }
}
</style>
