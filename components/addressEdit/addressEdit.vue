<template>
	<!-- 弹层内容：地址编辑 -->
	<view class="address-edit-popup">
		<!-- 弹窗头部 -->
		<view class="popup-header">
			<text class="header-title">地址编辑</text>
			<view class="close-btn" @tap="closePopup">
				<uv-icon name="close" color="#666666" size="32rpx" />
			</view>
		</view>
		<!-- 主体滚动区 -->
		<scroll-view class="popup-body" scroll-y>
			<!-- 表单卡片：收货信息 -->
			<view class="card shipping-info">
				<!-- 海关提示条 -->
				<view class="customs-tip">
					<uv-icon name="info-circle" color="#00CBCC" size="26rpx" />
					<text class="tip-text">为确保海关顺利清关，支付人姓名请和身份证信息保持一致</text>
				</view>

				<!-- 收货人 -->
				<view class="form-row">
					<view class="label required">收货人</view>
					<view class="content">
						<uv-input v-model="localForm.realName" placeholder="请填写真实姓名" border="none" fontSize="28rpx" />
					</view>
				</view>

				<!-- 手机号 -->
				<view class="form-row">
					<view class="label required">手机号</view>
					<view class="content">
						<uv-input v-model="localForm.phone" placeholder="请填写手机号码" type="number" maxlength="11"
							border="none" fontSize="28rpx" />
					</view>
				</view>

				<!-- 所在地区 -->
				<view class="form-row" @tap="openAddressSelect">
					<view class="label required">所在地区</view>
					<view class="content select">
						<view class="select-text"
							v-if="localForm.address.province && localForm.address.city && localForm.address.district">
							{{ localForm.address.province }} {{ localForm.address.city }} {{ localForm.address.district
							}}
						</view>
						<view class="placeholder" v-else>
							请选择省市区
						</view>
						<uv-icon name="arrow-right" color="#868686" size="20rpx" />
					</view>
				</view>

				<!-- 详细地址 -->
				<view class="form-row">
					<view class="label required">详细地址</view>
					<view class="content">
						<uv-input v-model="localForm.detail" placeholder="如街道、楼牌号等" border="none" fontSize="28rpx" />
					</view>
				</view>
			</view>

			<!-- 粘贴识别提示 -->
			<view class="paste-tip">
				<view class="tip-header">
					<view class="tip-title">快速填写</view>
					<view class="paste-btn" @tap="pasteFromClipboard">
						<uv-icon name="file-text" color="#00CBCC" size="24rpx" />
						<text class="paste-btn-text">粘贴识别</text>
					</view>
				</view>
				<uv-textarea v-model="quickInputText" placeholder="粘贴地址信息可自动识别并填写，如：王xx，188xxxxxxxx，湖南省长沙市xx区xx街道xx"
					height="100rpx" border="none" @blur="handleQuickInput"
					:textStyle="{ color: '#303133', fontSize: '28rpx' }"
					:placeholderStyle="{ color: '#c0c4cc', fontSize: '26rpx' }" />
			</view>

			<!-- 一键获取微信地址按钮 -->
			<!-- #ifdef MP-WEIXIN -->
			<view class="wx-btn-container">
				<view class="wx-btn" @click="chooseWeixinAddress">
					<text class="btn-text">一键获取微信地址</text>
					<image class="wx-icon" :src="wxechatdr" mode="aspectFit" />
				</view>
			</view>
			<!-- #endif -->

			<!-- 支付人信息卡片 -->
			<view class="card payer-info">
				<view class="form-row">
					<view class="label required">支付人</view>
					<view class="content">
						<uv-input v-model="localForm.payerName" placeholder="请填写支付人姓名" border="none" fontSize="28rpx" />
					</view>
				</view>
				<view class="form-row">
					<view class="label required">身份证号</view>
					<view class="content">
						<uv-input v-model="localForm.idCard" placeholder="请填写身份证号码" border="none" fontSize="28rpx"
							maxlength="18" />
					</view>
				</view>
			</view>
			<!-- 温馨提示 -->
			<view class="warm-tip card">
				温馨提示：您的身份证信息仅用于向中华人民共和国海关申报清关使用，平台会进行加密处理，确保信息安全。
				为了确保清关顺利，请保证支付人信息与微信实名信息一致。下单后即刻生成清关信息，因此无法在下单后修改地址。
			</view>
			<!-- 默认地址开关 -->
			<view class="card default-address">
				<view class="default-row">
					<view class="default-text">
						<view class="label">设为默认地址</view>
						<view class="sub-label">提醒：下单会优先使用该地址</view>
					</view>
					<view class="switch-container">
						<uv-switch v-model="defaultChecked" size="48rpx" activeColor="#00CBCC" />
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 地址选择弹层组件 -->
		<AddressSelect ref="addressSelectRef" @confirm="addressSelectConfirm" />

		<!-- 底部保存按钮 -->
		<view class="bottom-action">
			<view type="primary" :loading="submitLoading" @click="onSave" class="save-btn">
				保存地址并使用
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, watch, unref } from 'vue'

import UvIcon from '@/uni_modules/uv-icon/components/uv-icon/uv-icon.vue'
import UvInput from '@/uni_modules/uv-input/components/uv-input/uv-input.vue'
import UvTextarea from '@/uni_modules/uv-textarea/components/uv-textarea/uv-textarea.vue'
import UvButton from '@/uni_modules/uv-button/components/uv-button/uv-button.vue'
import UvSwitch from '@/uni_modules/uv-switch/components/uv-switch/uv-switch.vue'
import AddressSelect from '@/components/AddressSelect/index.vue'
import { checkPhone, parseAddress } from '@/utils/utils'
import { useInterface } from '@/hooks/useInterface'
import { getAddressCityList, getUserAuth } from '@/api/address'
import { wxechatdr } from '@/utils/images'

const emits = defineEmits(['close', 'save', 'update:modelValue'])

const props = defineProps({
	// v-model 传入的地址对象
	modelValue: {
		type: Object,
		default: () => ({
			id: undefined,
			realName: undefined,
			phone: undefined,
			detail: undefined,
			isDefault: undefined,
			payerName: undefined,
			idCard: undefined,
			address: {
				cityId: undefined,
				city: undefined,
				district: undefined,
				province: undefined,
			}
		})
	}
})

const { toast } = useInterface()

// 快速输入的文本
const quickInputText = ref('')

// 本地表单副本，避免直接改 props
const localForm = ref({})
const defaultChecked = ref(false)
const submitLoading = ref(false)

// 初始化本地表单数据
function initLocalForm(modelValue) {
	const defaultForm = {
		id: undefined,
		realName: undefined,
		phone: undefined,
		detail: undefined,
		isDefault: undefined,
		payerName: undefined,
		idCard: undefined,
		address: {
			cityId: undefined,
			city: undefined,
			district: undefined,
			province: undefined,
		}
	}

	// 深拷贝并合并默认值
	localForm.value = JSON.parse(JSON.stringify({
		...defaultForm,
		...modelValue,
		address: {
			...defaultForm.address,
			...(modelValue?.address || {})
		}
	}))

	// 兼容回显：若父组件传入 cardName/cardId，则用于初始化显示
	localForm.value.payerName = modelValue.cardName
	localForm.value.idCard = modelValue.cardId
	defaultChecked.value = !!modelValue?.isDefault
}

// 监听 props 变化，重新初始化本地数据
watch(() => props.modelValue, (newVal, oldVal) => {
	// 避免循环更新：只有当外部传入的值真正变化时才更新本地表单
	if (newVal && newVal !== oldVal) {
		// 检查是否是本地更新触发的父组件变化
		const localValue = { ...localForm.value, isDefault: defaultChecked.value ? 1 : 0 }
		const isLocalUpdate = JSON.stringify(newVal) === JSON.stringify(localValue)

		if (!isLocalUpdate) {
			initLocalForm(newVal)
		}
	}
}, { deep: true, immediate: true })

// 双向绑定向外更新 - 添加防抖避免频繁更新
let updateTimer = null
watch(localForm, (val) => {
	if (updateTimer) clearTimeout(updateTimer)
	updateTimer = setTimeout(() => {
		emits('update:modelValue', { ...val, isDefault: defaultChecked.value ? 1 : 0 })
	}, 100)
}, { deep: true })

watch(defaultChecked, (val) => {
	if (updateTimer) clearTimeout(updateTimer)
	updateTimer = setTimeout(() => {
		emits('update:modelValue', { ...localForm.value, isDefault: val ? 1 : 0 })
	}, 100)
})

// 关闭弹窗
function closePopup() {
	emits('close')
}

// 关闭
function onClose() {
	emits('close')
}

// 选择地址（省市区）
const addressSelectRef = ref()

/**
 * 打开地址选择器
 */
function openAddressSelect() {
	const { address } = unref(localForm)
	let defaultStr = ''
	if (address?.province && address?.city && address?.district) {
		defaultStr = `${address.province}-${address.city}-${address.district}`
	}
	unref(addressSelectRef)?.open(defaultStr)
}

/**
 * 地址选择确认回调
 * @param {Array} areaList 选择的地区数组
 */
function addressSelectConfirm(areaList) {
	if (!Array.isArray(areaList) || areaList.length < 3) return

	// 更新地址信息
	const { address } = unref(localForm)
	address.province = areaList[0]?.name
	address.city = areaList[1]?.name
	address.cityId = areaList[1]?.id
	address.district = areaList[2]?.name

	// 可选：显示选择成功提示
	toast?.({ title: '地址选择成功' })
}

/**
 * 处理快速输入框失焦事件
 */
async function handleQuickInput() {
  if (!quickInputText.value) return

  // 智能识别地址信息（使用 level.json 数据，从服务器加载）
  const parsed = await parseAddress(quickInputText.value)

  if (!parsed) {
    toast?.({ title: '无法识别地址信息' })
    return
  }

	// 填充识别到的信息
	let hasData = false

	if (parsed.realName) {
		localForm.value.realName = parsed.realName
		hasData = true
	}

	if (parsed.phone) {
		localForm.value.phone = parsed.phone
		hasData = true
	}

	if (parsed.province || parsed.city || parsed.district) {
		if (parsed.province) localForm.value.address.province = parsed.province
		if (parsed.city) localForm.value.address.city = parsed.city
		if (parsed.district) localForm.value.address.district = parsed.district
		// parseAddress 已返回 cityId，直接使用
		if (parsed.cityId) {
			localForm.value.address.cityId = parsed.cityId
		} else if (parsed.province && parsed.city) {
			// 兜底：如果没有 cityId，尝试获取
			getCityIdByAddress(parsed.province, parsed.city, parsed.district).catch(error => {
				console.warn('获取cityId失败:', error)
			})
		}
		hasData = true
	}

	if (parsed.detail) {
		localForm.value.detail = parsed.detail
		hasData = true
	}

	if (hasData) {
		toast?.({ title: '地址信息识别成功' })
		// 清空快速输入框
		quickInputText.value = ''
	} else {
		// 如果什么都没识别出来，就直接粘贴到详细地址
		localForm.value.detail = quickInputText.value
		toast?.({ title: '已填充到详细地址' })
		quickInputText.value = ''
	}
}

/**
 * 粘贴并智能识别地址信息
 */
async function pasteFromClipboard() {
	// #ifdef H5
	try {
		const text = await navigator.clipboard.readText()
		if (!text) {
			toast?.({ title: '剪贴板内容为空' })
			return
		}

		// 智能识别地址信息
		const parsed = await parseAddress(text)

		if (!parsed) {
			toast?.({ title: '无法识别地址信息' })
			return
		}

		// 填充识别到的信息
		let hasData = false

		if (parsed.realName) {
			localForm.value.realName = parsed.realName
			hasData = true
		}

		if (parsed.phone) {
			localForm.value.phone = parsed.phone
			hasData = true
		}

		if (parsed.province || parsed.city || parsed.district) {
			if (parsed.province) localForm.value.address.province = parsed.province
			if (parsed.city) localForm.value.address.city = parsed.city
			if (parsed.district) localForm.value.address.district = parsed.district
			// parseAddress 已返回 cityId，直接使用
			if (parsed.cityId) {
				localForm.value.address.cityId = parsed.cityId
			} else if (parsed.province && parsed.city) {
				// 兜底：如果没有 cityId，尝试获取
				try {
					await getCityIdByAddress(parsed.province, parsed.city, parsed.district)
				} catch (error) {
					console.warn('获取cityId失败:', error)
				}
			}
			hasData = true
		}

		if (parsed.detail) {
			localForm.value.detail = parsed.detail
			hasData = true
		}

		if (hasData) {
			toast?.({ title: '地址信息识别成功' })
		} else {
			// 如果什么都没识别出来，就直接粘贴到详细地址
			localForm.value.detail = text
			toast?.({ title: '已粘贴到详细地址' })
		}
	} catch (e) {
		console.error('粘贴识别失败:', e)
		toast?.({ title: '无法读取剪贴板' })
	}
	// #endif

	// #ifdef MP-WEIXIN || APP-PLUS
	// 小程序和APP端使用uni.getClipboardData
	uni.getClipboardData({
		success: async (res) => {
			const text = res.data
			if (!text) {
				toast?.({ title: '剪贴板内容为空' })
				return
			}

			// 智能识别地址信息
			const parsed = await parseAddress(text)

			if (!parsed) {
				toast?.({ title: '无法识别地址信息' })
				return
			}

			// 填充识别到的信息
			let hasData = false

			if (parsed.realName) {
				localForm.value.realName = parsed.realName
				hasData = true
			}

			if (parsed.phone) {
				localForm.value.phone = parsed.phone
				hasData = true
			}

			if (parsed.province || parsed.city || parsed.district) {
				if (parsed.province) localForm.value.address.province = parsed.province
				if (parsed.city) localForm.value.address.city = parsed.city
				if (parsed.district) localForm.value.address.district = parsed.district
				// parseAddress 已返回 cityId，直接使用
				if (parsed.cityId) {
					localForm.value.address.cityId = parsed.cityId
				} else if (parsed.province && parsed.city) {
					// 兜底：如果没有 cityId，尝试获取
					try {
						await getCityIdByAddress(parsed.province, parsed.city, parsed.district)
					} catch (error) {
						console.warn('获取cityId失败:', error)
					}
				}
				hasData = true
			}

			if (parsed.detail) {
				localForm.value.detail = parsed.detail
				hasData = true
			}

			if (hasData) {
				toast?.({ title: '地址信息识别成功' })
			} else {
				// 如果什么都没识别出来，就直接粘贴到详细地址
				localForm.value.detail = text
				toast?.({ title: '已粘贴到详细地址' })
			}
		},
		fail: (e) => {
			console.error('获取剪贴板失败:', e)
			toast?.({ title: '无法读取剪贴板' })
		}
	})
	// #endif
}

// 微信一键获取地址
async function chooseWeixinAddress() {
	// #ifdef MP-WEIXIN
	uni.chooseAddress({
		success: async (res) => {
			localForm.value.realName = res.userName
			localForm.value.phone = res.telNumber
			localForm.value.detail = res.detailInfo
			localForm.value.address = {
				province: res.provinceName,
				city: res.cityName,
				district: res.countyName,
				cityId: undefined
			}

			// 尝试通过地址选择器获取cityId
			try {
				await getCityIdByAddress(res.provinceName, res.cityName, res.countyName)
			} catch (error) {
				console.warn('获取cityId失败:', error)
			}

			toast?.({ title: '已导入微信地址' })
		},
		fail(err) {
			console.log('chooseAddress fail', err)
		}
	})
	// #endif
}

/**
 * 通过省市区名称获取cityId
 * @param {string} provinceName 省份名称
 * @param {string} cityName 城市名称  
 * @param {string} districtName 区县名称
 */
async function getCityIdByAddress(provinceName, cityName, districtName) {
	try {
		// 获取地址数据
		const addressData = await getAddressCityList()
		if (!addressData || !Array.isArray(addressData)) return

		// 查找省份
		const province = addressData.find(p => p.name === provinceName)
		if (!province || !province.children) return

		// 查找城市
		const city = province.children.find(c => c.name === cityName)
		if (!city) return

		// 更新cityId
		localForm.value.address.cityId = city.id
		console.log('成功获取cityId:', city.id)
	} catch (error) {
		console.error('获取cityId失败:', error)
	}
}

// 身份证号验证
function checkIdCard(idCard) {
	if (!idCard) return false
	// 简单的身份证号格式验证（18位数字或17位数字+X）
	const idCardReg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
	return idCardReg.test(idCard)
}

// 校验
function checkForm(form) {
	// 检查地址信息 - 支持两种情况：有cityId或有完整省市区名称
	const hasValidAddress = form.address?.cityId ||
		(form.address?.province && form.address?.city && form.address?.district)

	if (!hasValidAddress) {
		toast?.({ title: '请选择收货地址' })
		return false
	}
	if (!form.detail) {
		toast?.({ title: '请输入详细地址' })
		return false
	}
	if (!form.realName) {
		toast?.({ title: '请输入姓名' })
		return false
	}
	if (!checkPhone(form.phone)) {
		toast?.({ title: '请输入正确手机号' })
		return false
	}
	if (!form.payerName) {
		toast?.({ title: '请输入支付人姓名' })
		return false
	}
	if (!checkIdCard(form.idCard)) {
		toast?.({ title: '请输入正确的身份证号码' })
		return false
	}
	return true
}

// 保存
async function onSave() {
	if (submitLoading.value) return
	if (!checkForm(localForm.value)) return
	try {
		submitLoading.value = true
		// 验证实名
		const params = {
			name: localForm.value.payerName,
			idCard: localForm.value.idCard,
		}
		const authData = await getUserAuth(params)
		// 检查实名状态
		if (authData !== '实名认证成功') {
			toast?.({ title: '实名认证失败，请先完成实名认证' })
			return
		}
		// 由父级决定是否调用接口，这里只向外抛出数据
		emits('save', { ...localForm.value, isDefault: defaultChecked.value ? 1 : 0 })
	} finally {
		submitLoading.value = false
	}
}
</script>

<style lang="scss" scoped>
/* 弹窗头部 */
.popup-header {
	background: #FFFFFF;
	padding: 32rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1rpx solid #F0F0F0;
}

.header-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
}

.close-btn {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 弹窗主体 */
.address-edit-popup {
	background: #F5F5F5;
	border-radius: 20rpx 20rpx 0 0;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	height: 100%;
	position: relative;
}

/* 主体滚动区 */
.popup-body {
	background: #F5F5F5;
	flex: 1;
	padding: 0;
	padding-bottom: 160rpx;
	/* 为底部按钮预留空间 */
	overflow: hidden;
}

.card {
	background: #FFFFFF;
	border-radius: 20rpx;
	margin: 24rpx 32rpx 16rpx 32rpx;
	padding: 0;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.shipping-info {
	position: relative;

	.customs-tip {
		background: #00CBCC;
		border-radius: 20rpx 20rpx 0 0;
		padding: 14rpx 34rpx;
		display: flex;
		align-items: center;
		gap: 12rpx;

		.tip-text {
			font-size: 22rpx;
			color: #FFFFFF;
			line-height: 1.36;
		}
	}
}

.form-row {
	display: flex;
	align-items: center;
	padding: 32rpx 32rpx 38rpx;
	position: relative;
	border-bottom: 1rpx solid #F0F0F0;

	.row-icon {
		flex: 0 0 auto;
		margin-right: 0;
		position: absolute;
		left: 0;
		top: 64rpx;
		width: 626rpx;
		height: 1rpx;

		.divider-line {
			width: 100%;
			height: 1rpx;
			background: #AFAFAF;

			&.disabled {
				opacity: 0.4;
			}
		}
	}

	.label {
		flex: 0 0 118rpx;
		font-size: 28rpx;
		color: #404040;
		line-height: 30rpx;
		font-weight: 400;
		margin-right: 32rpx;
		position: relative;

		&.required::before {
			content: '*';
			color: #FF4444;
			font-size: 28rpx;
			position: absolute;
			left: -16rpx;
			top: 0;
		}
	}

	.content {
		flex: 1;

		.value-text {
			font-size: 28rpx;
			color: #303133;
			line-height: 30rpx;
		}
	}

	.content.select {
		display: flex;
		justify-content: space-between;
		align-items: center;

		.select-text {
			font-size: 28rpx;
			color: #303133;
		}

		.placeholder {
			font-size: 28rpx;
			color: #c0c4cc;
		}
	}
}

.paste-tip {
	background: #FFFFFF;
	border-radius: 20rpx;
	padding: 24rpx 32rpx;
	margin: 16rpx 32rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

	.tip-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;

		.tip-title {
			font-size: 28rpx;
			color: #404040;
		}

		.paste-btn {
			display: flex;
			align-items: center;
			gap: 8rpx;
			padding: 8rpx 20rpx;
			background: #E6F9F9;
			border-radius: 30rpx;

			.paste-btn-text {
				font-size: 24rpx;
				color: #00CBCC;
			}
		}
	}
}

.wx-btn-container {
	margin: 16rpx 32rpx;
	display: flex;
	justify-content: center;

	.wx-btn {
		background: #FFFFFF;
		border-radius: 27rpx;
		width: 256rpx;
		height: 54rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7.6rpx;
		box-shadow: 0px 7.6rpx 22.8rpx 0px rgba(103, 61, 17, 0.08);
		border: 1.48rpx solid #000000;

		.btn-text {
			font-size: 22rpx;
			color: #000000;
			font-weight: 500;
			line-height: 1.98;
		}

		.wx-icon {
			width: 30rpx;
			height: 30rpx;
		}
	}
}

.payer-info {
	.form-row {
		.label {
			color: #404040;
		}

		.row-icon .divider-line {
			opacity: 0.4;
		}
	}
}

.default-address {
	.default-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32rpx;

		.default-text {
			.label {
				font-size: 28rpx;
				color: #404040;
				line-height: 30rpx;
			}

			.sub-label {
				font-size: 24rpx;
				color: #979797;
				margin-top: 8rpx;
				line-height: 30rpx;
			}
		}

		.switch-container {
			display: flex;
			align-items: center;
		}
	}
}

.warm-tip {
	padding: 32rpx;
	font-size: 22rpx;
	color: #00aaab;
	line-height: 1.6;
	background: #FFFFFF;
}

/* 底部保存按钮区域 */
.bottom-action {
	background: #FFFFFF;
	padding: 32rpx;
	border-top: 1rpx solid #F0F0F0;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 100;

	.save-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		width: 100%;
		height: 80rpx;
		border-radius: 40rpx;
		background: #00CBCC;
		font-size: 28rpx;
		font-weight: 600;
		color: #FFFFFF;
		border: none;

		&:active {
			background: #00B5B8;
		}
	}
}
</style>