import { useRouter } from "@/hooks/useRouter";
const { goBack } = useRouter();
import { useMainStore } from "@/store/modules/useMainStore";

/**
 * 判断给定日期是否已超过24小时
 * @param {string|Date} date - 需要比较的日期
 * @returns {boolean} 如果超过24小时返回true，否则返回false
 */
const isOverToday = (date) => {
  const today = new Date().getTime();
  const compareDate = new Date(date).getTime();
  return today - compareDate >= 24 * 60 * 60 * 1000;
};

// 返回类型标识：1-返回上一页，2-跳转到首页
let backType = 1;
// 健康合作伙伴弹窗引用
let healthPartnersHitRef = null;
let isShowed = false;

/**
 * 初始化健康合作伙伴弹窗引用
 * @param {Object} ref - 弹窗组件的引用
 */
export const initHealthPartnersHit = (ref) => {
  healthPartnersHitRef = ref;
};

let showFn = () => {};
export const changeShow = (fn) => {
  showFn = fn;
};

/**
 * 页面离开前的处理函数
 * 检查是否需要显示健康合作伙伴弹窗，如果不需要则直接返回上一页
 */
export const beforeleave = (mode) => {
  const mainStore = useMainStore();
  console.log(mainStore.user);
  let prevOpenModalTime = uni.getStorageSync("prevOpenModalTime") || null;
  console.log("beforeleave");
  backType = 1;
  // 如果24小时内已经显示过弹窗或者用户已有企业微信，则直接返回
  if (
    (prevOpenModalTime && !isOverToday(prevOpenModalTime)) ||
    mainStore.user.wecomName
  ) {
    if(isShowed){
      healthPartnersHitClose();
      return;
    }
    uni.showModal({
      title: mode === 'detail' ? '提示' : "只差一步，继续测评",
      content: mode === 'detail' ? '您确定要退出吗?' : "马上就可以解锁您的专属健康方案，再坚持一下吧!",
      confirmText: "继续",
      cancelText: "退出",
      confirmColor: "#00cbcc",
      cancelColor: "#999999",
      success: (res) => {
        if (res.confirm) {
          console.log("停留当前页面");
          showFn(false);
          setTimeout(() => {
            showFn(true);
          });
        } else {
          healthPartnersHitClose();
        }
      },
    });
    return;
  }
  isShowed = true;
  // 记录当前时间作为上次打开弹窗的时间
  prevOpenModalTime = new Date().getTime();
  uni.setStorageSync("prevOpenModalTime", prevOpenModalTime);
  // 显示健康合作伙伴弹窗
  healthPartnersHitRef.value.open();
};

/**
 * 返回上一页的通用处理函数
 * @param {number} type - 返回类型：1-返回上一页，2-跳转到首页
 * @param {Function} fn - 自定义回调函数
 */
export const goPrevPage = (type, fn) => {
  const mainStore = useMainStore();
  let prevOpenModalTime = uni.getStorageSync("prevOpenModalTime") || null;
  console.log("goPrevPage");
  backType = type;
  isShowed = false;
  // 如果24小时内已经显示过弹窗或者用户已有企业微信，则执行回调函数
  if (
    (prevOpenModalTime && !isOverToday(prevOpenModalTime)) ||
    mainStore.user.wecomName
  ) {
    fn();
    return;
  }
  isShowed = true;
  // 记录当前时间作为上次打开弹窗的时间
  prevOpenModalTime = new Date().getTime();
  uni.setStorageSync("prevOpenModalTime", prevOpenModalTime);
  // 显示健康合作伙伴弹窗
  healthPartnersHitRef.value.open();
};

/**
 * 健康合作伙伴弹窗关闭后的处理函数
 * 根据backType决定是返回上一页还是跳转到首页
 */
export const healthPartnersHitClose = () => {
  console.log("healthPartnersHitClose");
  if (backType === 1) {
    goBack();
  } else if (backType === 2) {
    uni.switchTab({
      url: "/root/index/index",
    });
  }
};

/**
 * 获取滚动区域样式
 * 计算除去状态栏和导航栏高度后的可视区域高度
 * @returns {Object} 包含高度样式的对象
 */
export const getScrollStyle = () => {
  const res = uni.getSystemInfoSync();
  return { height: `calc(100vh - ${res.statusBarHeight + 60}px)` };
};
