<template>
  <view>
    

  </view>

</template>
<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { checkTheUser } from "@/api/auth";
import { useMainStore } from '@/store/modules/useMainStore'
const mainStore = useMainStore()
onLoad(async (options) => {
  console.log("onLoad options=================================:", options);
  let code='';
  if (options.scene) {
  	//表示扫二维码 或者 小程序链接 过来的
  	let sc = options.scene;
  	if (sc.startsWith('code_')) {
  		code = sc.substring(5);
  	}
  }
  checkTheUserInit(code)
});

async function checkTheUserInit(invitationCode) {
	//进行注册绑定关系操作
	wx.login({
		async success(res) {
			if (res.code) {
				console.log('微信code===========----' + res.code)
				let data = {};
				data.phoneCode = '888812';
				data.loginCode = res.code;
				data.invitationCode = invitationCode;
				const loginRes = await checkTheUser(data);
				await mainStore.setAccessToken(loginRes)
				//跳转到首页
				uni.switchTab({ url: '/root/index/index' })
			}
		}
	});
}
</script>