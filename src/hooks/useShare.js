/**
 * @name: useShare
 * @author: kahu4
 * @date: 2023-11-10 09:45
 * @description：useShare
 * @update: 2023-11-10 09:45
 * */

import {
	ref,
	unref
} from "vue";
import {
	useRouter
} from "@/hooks/useRouter";
import {
	VUE_H5_DOMAIN_NAME,
	VUE_SHARE_TITLE
} from "@/config";
import {
	h5InWeChat
} from "@/utils";
import {
	useShearPlate
} from "@/hooks/useShearPlate";
import {
	useInterface
} from "@/hooks/useInterface";
import stringify from "@/utils/querystring";
import {
	getUrlQuery
} from "@/utils/utils";
import {
	getDictValue
} from "@/api/evaluation";
import cookie from "@/utils/cookie";
import { checkTheUser } from "@/api/auth";
import { useMainStore } from "@/store/modules/useMainStore";
import {storeToRefs} from "pinia";
import { getShareTitleByPageUrl } from "@/api/global";

// 聚合处理的分享页面
const SHARE_INDEX = 'pages/share/index'
const {
	setData
} = useShearPlate();
const {
	toast
} = useInterface()

// 分享key
export const SharePathKey = {
	HOME: 'h', // 首页
	GOODS_DETAIL: 'g', // 商品分享
	DISTRIBUTION_GOODS: 'dg', // 分销商品分享
	INVITATION_USER: 'u', // 邀请用户
	DISTRIBUTION_USER: 'd', //  邀请分销商
	GROUP_BY: 'gb', // 拼团
	FRIENDS_PAY: 'p', // 好友帮付
	EVALUATION: 'evaluation', // 测评
	DETAILS: 'details', // 详情
	USER: 'user', //USer
	PRODUCT: 'product', //产品列表
	CONFIRM_ORDER: 'co', // 确认订单

	COMMON: 'common', // 公共页面 - 严选原料 & 科学循证 & 多重检测 & 有效配方 & 100元券包
}
// 分享页面路径
export const SharePathMap = {
	[SharePathKey.HOME]: '/root/index/index',
	[SharePathKey.GOODS_DETAIL]: '/pages/goodsDetail/goodsDetail',
	[SharePathKey.DISTRIBUTION_GOODS]: '/pages/goodsDetail/goodsDetail',
	[SharePathKey.INVITATION_USER]: '/root/index/index',
	[SharePathKey.DISTRIBUTION_USER]: '/views/distribution/center/index',
	[SharePathKey.GROUP_BY]: '/views/activity/groupBy/detail',
	[SharePathKey.FRIENDS_PAY]: '/pages/friendsPay/friendsPay',
	[SharePathKey.EVALUATION]: '/root/review/index',
	[SharePathKey.DETAILS]: '/pages/product/detail',
	[SharePathKey.USER]: '/root/user/user',
	[SharePathKey.PRODUCT]: '/root/product/index',
	[SharePathKey.CONFIRM_ORDER]: '/pages/orderList/confirmOrder',
}


/**
 * 分享hooks
 * 只需要在需要分享的页面use此hooks，会自动生成shareAppMessage、shareTimeline
 * 1.在此工具方法内部分享聚合模块添加方法，聚合分享内容，参数需要使用packageParameter封装
 * 2.在useShareInner模块的analysisParameter方法内部case聚合key，做相应的跳转，默认是跳转packageParameter封装的url内容，参数是packageParameter的data
 * 3.微信分享：页面中调用步骤1封装的聚合方法，将shareAppMessage、shareTimeline丢入钩子函数即可
 * 4.h5分享：页面中调用步骤1封装的聚合方法，然后调用本hook中的shareH5方法
 *   -h5分享在微信内部可以拉起微信分享、外部只能复制链接
 * 5.若要使用shareInfo的path和query去生成拉起小程序的二维码，请严格使用SharePathKey配合SharePathMap传参，注意参数长度，参数名称尽量简短。
 */
export function useShare() {
	let commonImageUrl = uni.getStorageSync('commonImageUrl') || '';
	let commonShareTitle = uni.getStorageSync('commonShareTitle') || '';
	const mainStore = useMainStore()

	getDictValue({
		dictType: "mall_config_dict_type",
		label: "fcp_img",
	}).then((res) => {
		commonImageUrl = res;
		uni.setStorageSync('commonImageUrl', commonImageUrl);
	});
	getDictValue({
		dictType: "mall_config_dict_type",
		label: "share_title",
	}).then((res) => {
		commonShareTitle = res;
		uni.setStorageSync('commonShareTitle', commonShareTitle);
	});

	const shareInfo = ref({
		title: commonShareTitle || VUE_SHARE_TITLE,
		path: SHARE_INDEX,
		imageUrl: '',
		query: '', // 参数
		pathQuery: SHARE_INDEX
	})

	/**
	 * 设置设置参数
	 * @param query packageParameter
	 */
	const setQuery = (query) => {
		shareInfo.value.query = query
		shareInfo.value.pathQuery = `${shareInfo.value.path}?${query}`
	}

	const shareAppMessage = () => Promise.resolve({
		title: shareInfo.value.title,
		path: shareInfo.value.pathQuery,
		imageUrl: shareInfo.value.imageUrl
	})

	const shareTimeline = () => ({
		title: shareInfo.value.title,
		path: shareInfo.value.pathQuery,
		imageUrl: shareInfo.value.imageUrl
	})

	/**
	 * H5分享
	 * @param type 1微信好友 2微信朋友圈
	 */
	const shareH5 = (type = 1) => {
		// h5InWeChat()
		// 判断是否再微信环境
		if (h5InWeChat()) {
			_h5WechatShare(shareInfo.value)
		} else {
			_h5WechatShare(shareInfo.value)
			// _h5WechatShare(shareInfo.value)
		}
	}


	/**
	 * 封装参数
	 * @param type SharePathKey
	 * @param data 跳转的参数
	 */
	const packageParameter = (type, data) => {
		const queryString = stringify({
			t: type,
			...data
		})
		console.log(queryString)
		return `${queryString}`
	}

	//========================= 分享聚合 ==================================
	/**
	 * 默认分享
	 */
	const defaultShare = (invitationCode) => {
		unref(shareInfo).title = commonShareTitle || VUE_SHARE_TITLE
		unref(shareInfo).imageUrl = commonImageUrl
		console.log('=======首页===invitationCode==========:', invitationCode)
		setQuery(packageParameter(SharePathKey.HOME, {code: invitationCode}))
	}
	/**
	 * 我的页面
	 */

	const userIndexShare = (invitationCode) => {
		unref(shareInfo).title = commonShareTitle || VUE_SHARE_TITLE
		unref(shareInfo).imageUrl = commonImageUrl
		console.log('=======我的页面==invitationCode===========:', invitationCode)
		setQuery(packageParameter(SharePathKey.USER, {code: invitationCode}))
	}
	/**
	 * 产品列表
	 */

	const productShare = (invitationCode) => {
		unref(shareInfo).title = commonShareTitle || VUE_SHARE_TITLE
		unref(shareInfo).imageUrl = commonImageUrl
		console.log('=======产品列表===invitationCode==========:', invitationCode)
		setQuery(packageParameter(SharePathKey.PRODUCT, {
			code: invitationCode
		}))
	}
	
	
	/**
	 * 代客下单分享
	 */
	const daikeShare = (invitationCode) => {
		unref(shareInfo).title = commonShareTitle || VUE_SHARE_TITLE
		unref(shareInfo).imageUrl = commonImageUrl
		console.log('=======代客下单==invitationCode===========:', invitationCode)
		setQuery(packageParameter(SharePathKey.CONFIRM_ORDER, {code: invitationCode}))
	}
	
	/**
	 * 商品分享
	 * @param goods
	 */
	const goodsDetailShare = (goods) => {
		unref(shareInfo).title = '只做有临床数据的营养补剂'
		unref(shareInfo).imageUrl = goods.image
		console.log('shareInfo2:', shareInfo.value)
		console.log('goods:', goods)
		setQuery(packageParameter(SharePathKey.GOODS_DETAIL, {
			id: goods.id
		}))

		console.log('shareInfo22:', shareInfo.value)
	}
	/**
	 * 商品详情分享
	 * @param goods
	 */
	const goodsDetailsShare = (goods) => {
		unref(shareInfo).title = '严选有专利/临床原料的营养补剂'
		unref(shareInfo).imageUrl = goods.image
		setQuery(packageParameter(SharePathKey.DETAILS, {
			id: goods.id
		}))
		return shareAppMessage()
	}
	/**
	 * 分销商品分享
	 * @param goods
	 * @param distributorId 分销商ID
	 */
	const distributionGoodsDetailShare = (goods, distributorId) => {
		unref(shareInfo).title = '只做有临床数据的营养补剂'
		unref(shareInfo).imageUrl = goods.image
		setQuery(packageParameter(SharePathKey.DISTRIBUTION_GOODS, {
			id: goods.id,
			uid: distributorId
		}))
	}

	/**
	 * 分享下级
	 * @param id
	 */
	const distributionShare = (id) => {
		unref(shareInfo).title = commonShareTitle || VUE_SHARE_TITLE
		unref(shareInfo).imageUrl = commonImageUrl
		setQuery(packageParameter(SharePathKey.DISTRIBUTION_USER, {
			id
		}))
		return shareInfo.value
	}

	/**
	 * 用户分享
	 * @param invitationCode 邀请人的邀请码
	 */
	const userInvitationShare = (invitationCode) => {
		unref(shareInfo).title = commonShareTitle || VUE_SHARE_TITLE
		unref(shareInfo).imageUrl = commonImageUrl
		setQuery(packageParameter(SharePathKey.INVITATION_USER, {
			code: invitationCode
		}))
		return shareInfo.value
	}

	/**
	 * 测评分享
	 * @param invitationCode 邀请人的邀请码
	 */
	const evaluationShare = (invitationCode) => {
		unref(shareInfo).title = commonShareTitle || VUE_SHARE_TITLE
		unref(shareInfo).imageUrl = commonImageUrl
		setQuery(packageParameter(SharePathKey.EVALUATION, {
			code: invitationCode || ''
		}))
		unref(shareInfo).path = unref(shareInfo).pathQuery
		return shareInfo.value
	}

	/**
	 * 拼团邀请
	 * @param orderInfoData
	 */
	const groupByInvitationShare = (orderInfoData) => {
		//teamworkId
		const img = orderInfoData?.cartInfo?.[0]?.productInfo?.image ||
			'https://hnapi.booseng.com/static/icon/logo.png'
		unref(shareInfo).title = '您的好友邀请您参与拼团'
		unref(shareInfo).imageUrl = img
		setQuery(packageParameter(SharePathKey.GROUP_BY, {
			id: orderInfoData.teamworkId
		}))
		return shareInfo.value
	}

	/**
	 * 好友帮付
	 * @param orderInfoData
	 */
	const friendsPayShare = (orderInfoData) => {
		const img = orderInfoData?.cartInfo?.[0]?.productInfo?.image ||
			'https://hnapi.booseng.com/static/icon/logo.png'
		unref(shareInfo).title = '您的好友邀请您帮忙付款'
		unref(shareInfo).imageUrl = img
		console.log(orderInfoData, img)
		setQuery(packageParameter(SharePathKey.FRIENDS_PAY, {
			id: orderInfoData.orderId,
			u: orderInfoData.uid
		}))
		return shareInfo.value
	}

	/**
	 * 公共页面通用分享
	 */
	const commonPageShare = () => {
		const { user } = storeToRefs(mainStore)
		const invitationCode = unref(user) ? unref(user).invitationCode : "";
		const pages = getCurrentPages()
		const currentPage = pages[pages.length - 1]
		const path = `/${currentPage.route}`

		const baseTitle = commonShareTitle || VUE_SHARE_TITLE

		setQuery(packageParameter(SharePathKey.COMMON, {
			code: invitationCode,
			redirect: path
		}))

		const promise = new Promise((resolve) => {
			getShareTitleByPageUrl(path).then((result) => {
				resolve({
					title:  result?.shareTitle || baseTitle,
					path: shareInfo.value.pathQuery,
					imageUrl: result?.shareImage || commonImageUrl,
				})
			})
		})

		return {
			title: baseTitle,
			path: shareInfo.value.pathQuery,
			imageUrl: commonImageUrl,
			promise
		}
	}

	return {
		shareInfo,
		shareH5,
		setQuery,
		shareAppMessage,
		shareTimeline,
		packageParameter,
		defaultShare,
		goodsDetailShare,
		distributionGoodsDetailShare,
		distributionShare,
		userInvitationShare,
		evaluationShare,
		groupByInvitationShare,
		friendsPayShare,
		goodsDetailsShare,
		userIndexShare,
		productShare,
		commonPageShare
	}
}


export const useShareInner = () => {

	const {
		push,
		pushToTab
	} = useRouter()

	const params = ref({
		t: ""
	})

	/**
	 * 处理share参数
	 * @param options
	 */
	async function analysisParams(options) {
		console.log('分享参数----', options)
		// 从小程序二维码扫码进入
		if (options.scene) {
			params.value = getUrlQuery(decodeURIComponent(options.scene));
		} else {
			params.value = options
		}
		
		//解析看是否传了code 邀请码
		let code = options.code;
		if(code){
			 console.log('===分享码===============code----', code)
			//判断当前账号是否 登录了 
			var token = cookie.get('accessToken')
			checkTheUserInit(code);
			// console.log('是否登录==================token----', token)
			//  if (!token) {
			// 	 console.log('是否登录====未登陆，进行优化校验===========----')
			//  }
		}
		
		await analysisParameter()
	}
	
	const mainStore = useMainStore()
	const {logoSrc} = storeToRefs(mainStore);
	async function checkTheUserInit(invitationCode) {
		//进行注册绑定关系操作
		wx.login({
		  async success(res) {
		    if (res.code) {
		    console.log('微信code===========----'+res.code)
		     let data={};
		     data.phoneCode='888802';
		     data.loginCode = res.code;
		     data.invitationCode=invitationCode;
			 const loginRes = await checkTheUser(data);
			 await mainStore.setAccessToken(loginRes)
		    }
		  }
		});
	}


	/**
	 * 解析参数
	 */
	async function analysisParameter() {
		switch (unref(params).t) {
			case SharePathKey.GOODS_DETAIL:
			case SharePathKey.INVITATION_USER:
			case SharePathKey.DISTRIBUTION_GOODS:
			case SharePathKey.DISTRIBUTION_USER:
			case SharePathKey.GROUP_BY:
			case SharePathKey.FRIENDS_PAY:
			case SharePathKey.EVALUATION:
			case SharePathKey.DETAILS:
			case SharePathKey.USER:
			case SharePathKey.PRODUCT:
			case SharePathKey.CONFIRM_ORDER:
			toSkip()
			break;
			case SharePathKey.COMMON:
				commonPageSkip()
				break;
			default:
				pushToTab({
					url: '/root/index/index'
				})
		}
	}


	/**
	 * 跳转
	 */
	function toSkip() {
		const path = SharePathMap[unref(params).t]
		if (path) {
			if (path && path.indexOf('/root') === 0) {
				// tabbar页面, params 存储起来, 跳转时取
				uni.setStorageSync('shareParams', unref(params))
				push({
					url: path,
				}, {
					data: unref(params),
					type: 'switchTab'
				})
			} else {
				push({
					url: path,
				}, {
					data: unref(params),
					type: 'redirectTo'
				})
			}
		}
	}

	function commonPageSkip() {
		const { redirect, ...rest } = unref(params)

		if (redirect) {
			push({
				url: redirect,
			}, {
				data: rest,
				type: 'redirectTo'
			})
		} else {
			pushToTab({
				url: '/root/index/index',
			})
		}
	}

	return {
		params,
		analysisParams
	}
}


/**
 * 微信内H5分享
 * @param shareInfo
 * @param type
 * @private
 */
const _h5InWechatShare = (shareInfo, type = 1) => {
	const res = {} // todo 从后端拿
	jweixin.config({
		debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
		appId: res.appId, // 必填，公众号的唯一标识
		timestamp: res.timeStamp, // 必填，生成签名的时间戳
		nonceStr: res.nonceStr, // 必填，生成签名的随机串
		signature: res.paySign, // 必填，签名，见附录1
		jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	});
	jweixin.ready(() => {
		if (type === 1) {
			// 好友
			jweixin.updateAppMessageShareData({
				title: shareInfo.title, // 分享标题
				desc: shareInfo.title, // 分享描述
				link: shareInfo.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
				imgUrl: shareInfo.imageUrl, // 分享图标
			})
		} else {
			// 朋友圈
			jweixin.updateTimelineShareData({
				title: shareInfo.title, // 分享标题
				link: shareInfo.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
				imgUrl: shareInfo.imageUrl, // 分享图标
			})
		}
	})
}

/**
 * 微信外h5分享 h5外部直接生成链接
 * @param shareInfo
 * @param type
 * @private
 */
const _h5WechatShare = async (shareInfo, type = 1) => {
	const link = `${VUE_H5_DOMAIN_NAME}${shareInfo.pathQuery}`
	console.log('link:', link)
	//await setData(link)
	setTimeout(() => {
		uni.setClipboardData({
			data: link,
			showToast: false,
			success: () => {
				//uni.showToast({title:'已复制，快去分享链接分享给小伙伴吧~'})
				toast({
					title: '已复制，快去分享链接分享给小伙伴吧~'
				})
			},
			fail: (error) => {
				console.log('error:', error)
			}
		})
	}, 100);

	//toast({title: '已复制，快去分享链接分享给小伙伴吧~'})
}