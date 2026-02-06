<template>
  <view class="questionnaire-page" :style="{ paddingBottom: safeAreaBottom ? safeAreaBottom + 'px' : '10px' }">
    <page-container :duration="0" :show="isShow" :overlay="false" @beforeleave="beforeleave"></page-container>
    <Navbar title="营养测评" :isAutoBack="false" @goBack="goPrevPage" />
    <view class="questionnaire-steps" :style="{ top: barHeight }">
      <view class="questionnaire-step-prev" @click="prevStep" :style="{ opacity: currentStep === 1 ? '0.3' : '1' }"> 上一页 </view>
      <view class="questionnaire-steps-progress">
        <view :style="{ width: (currentStepIndex / maxStep) * 100 + '%' }"></view>
      </view>
    </view>

    <scroll-view :style="getScrollStyle()" :scroll-top="scrollTop" scroll-y>
      <view style="height: 130rpx"></view>
      <!-- 使用新创建的组件替换原来的 questionnaire-content 部分 -->
      <QuestionnaireContent :maxNum="maxNum" :maxStep="maxStep" :currentStepIndex="currentStepIndex" :step-list="stepList" :current-step="currentStep" @nextStep="nextStep" @change-options="changeOptions" @submit="submit" />
    </scroll-view>

    <!-- 提交弹窗 -->
    <!-- <uv-popup type="center" :closeOnClickOverlay="false" :closeable="false" :safe-area-inset-bottom="true" bgColor="rgba(0,0,0,0)" border-radius="20rpx" padding="40rpx" ref="popupRef">
      <view class="popup-content">
        <image @click="authUserInfo" :src="EVALUATION_IMG_PATH + 'questionnaire_submit_back2.png'" mode="widthFix" />
        <view class="nickname-input" @click="authUserInfo" :class="{ xon: authSuccess }">{{ newUserInfo.nickname || "[输入你的名字]" }} </view>
        <view class="popup-content-tip">该称呼将会出现在营养建议和产品包装上</view>
        <view class="submit-btn" @click="submitForm">提交问卷</view>
      </view>
    </uv-popup> -->

    <!-- 优惠券弹窗 -->
    <uv-popup type="center" :closeable="false" :safe-area-inset-bottom="true" bgColor="rgba(0,0,0,0)" border-radius="20rpx" padding="40rpx" ref="couponRef">
      <view class="popup-content">
        <!-- 图片 -->
        <image style="width: 80vw" :src="EVALUATION_IMG_PATH + 'coupon_back.png'" mode="widthFix" />

        <view class="popup-content-close" @click="closeGoupon">
          <uv-icon name="close" color="#ffffff" size="22" bold></uv-icon>
        </view>
      </view>
    </uv-popup>

    <!-- <editUserModal :isShow="showEditUserModal" @closeEdit="closeUserEdit" @editSuccess="editUserSuccess"> </editUserModal> -->
    <SubmitModal ref="popupRef" @submit="sendSubmit"> </SubmitModal>

    <healthPartnersHit ref="healthPartnersHitRef" @close="healthPartnersHitClose" />
    <healthPartnersHit mode="tip" ref="healthPartnersHitRef2" code="evaluation_qrcode"/>

    <!-- 预加载图片 -->
    <image style="display: none" :src="EVALUATION_IMG_PATH + 'qrcode_back2.png'" mode="widthFix" />
  </view>
</template>

<script setup>
import { onMounted, computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import editUserModal from "@/components/eidtUserModal/index.vue";
import Navbar from "../components/Navbar.vue";
import SubmitModal from "./components/SubmitModal";
import QuestionnaireContent from "./components/QuestionnaireContent.vue"; // 引入新组件
import { EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import uvPopup from "@/uni_modules/uv-popup/components/uv-popup/uv-popup.vue";
import { getQuestionnaireTitleList, addReport, addReportTemp, getOenCount, getQuestionnaireDetail } from "@/api/evaluation";
import { useMainStore } from "@/store/modules/useMainStore";
import { updateNickname } from "@/api/user";

import healthPartnersHit from "@/components/healthPartners/hit.vue";
import { initHealthPartnersHit, getScrollStyle, beforeleave, goPrevPage, healthPartnersHitClose, changeShow } from "../utils/backUtils";
const healthPartnersHitRef = ref(null);
const healthPartnersHitRef2 = ref(null);
const isShow = ref(true);
changeShow((val) => {
  isShow.value = val;
});

const healthPartnersHitMode = ref("");

const store = useMainStore();

// 控制弹窗显示隐藏
const popupRef = ref();

// 优惠券
const couponRef = ref();

const showEditUserModal = ref(false);

const stepList = ref([]);

const authSuccess = ref(false);

const newUserInfo = ref({});

const fromPage = ref("");

/**
 * 生成时间戳+6位随机数的组合字符串
 * @returns {string} 时间戳+6位随机数的字符串
 */
function timestampWithRandom() {
  const timestamp = Date.now().toString();
  const randomNum = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return timestamp + randomNum;
}

const closeUserEdit = () => {
  showEditUserModal.value = false;
  authSuccess.value = false;
  uni.showToast({
    title: "请先授权",
    icon: "none",
  });
};

const editUserSuccess = async (data) => {
  try {
    await updateNickname({
      birthday: store.user.birthday,
      nickname: data.nickname,
      sex: store.user.sex,
    });
    showEditUserModal.value = false;
    store.getUserInfo();
    newUserInfo.value = data;
    authSuccess.value = true;
    // uni.showToast({
    //   title: "保存成功",
    //   icon: "success",
    // });
    uni.showLoading({
      title: "请稍后",
      mask: true,
    });
    goRequestSubscribeMessage(data);
  } catch (error) {
    console.error(error);
    uni.hideLoading();
  }
};

const sex = ref("");
const getQrmap = () => {
  return stepList.value
    .filter((item) => !item.hide)
    .map((item) => {
      const _checkeds = item.options && item.options.filter((o) => o.checked);
      return {
        id: item.id,
        code: item.code,
        title: item.title,
        types: item.types,
        ttype: item.ttype,
        answer: item.answerContent
          ? item.answerContent
          : _checkeds
              .map((option) => {
                return option.name;
              })
              .join(","),
        // 选项结果带选项id
        answerObj: item.answerContent
          ? "[]"
          : JSON.stringify(
              _checkeds.map((option) => {
                return {
                  id: option.id,
                  name: option.name,
                };
              })
            ),
      };
    });
};

const wecomName = ref("");

const goRequestSubscribeMessage = (data) => {
  uni.showLoading({
    title: "请稍后",
  });
  // uniapp 微信小程序订阅消息
  uni.requestSubscribeMessage({
    tmplIds: ["WCkvssjrYUN6A_8gvl2LCxK0opacL7CG4E3UgtcaFmQ"], // 替换为你的订阅消息模板ID
    success: (res) => {
      // uni.hideLoading()
      // 用户同意或拒绝后的回调
      // 可以根据需要处理 res
      // uni.showToast({
      //   title: '订阅成功',
      //   icon: 'success',
      // });
      this.sendSubmit(data);
    },
    fail: (err) => {
      // uni.hideLoading()
      // uni.showToast({
      //   title: '您已取消订阅',
      //   icon: 'none',
      // });
      // 订阅失败的回调
      // 可以根据需要处理 err
      this.sendSubmit(data);
    },
  });
};

const sendSubmit = async (info) => {
  uni.showLoading({
    title: "提交中",
    mask: true,
  });

  const qrmap = getQrmap();
  const params = {
    keyid: keyid.value,
    nickname: info.nickname,
    avatar: info.avatar,
    qid: qid.value,
    linkab: tag.value,
    // 第一题 如果选择一个选项 就是1=单目标，如果是选择超过了一个选项 就是2=多目标
    mtype: qrmap.length && qrmap[0].answer ? (qrmap[0].answer.split(",").length > 1 ? 2 : 1) : 1,
    qrmap,
  };
  try {
    const data = await addReport(params);
    uni.hideLoading();
    uni.showToast({
      title: "提交成功",
      icon: "success",
    });

    const userInfo = await store.getUserInfo();
    wecomName.value = userInfo.wecomName || "";
	if(pageUrl.value&&pageUrl.value=='/root/review/friendAndOrder'){
		uni.redirectTo({
		  url: `/views/evaluation/questionnaire/detail?id=${data}&qid=${qid.value}&fromPage=${fromPage.value}`,
		});
	}
    if (wecomName.value || fromPage.value === "friend") {
      uni.redirectTo({
        url: `/views/evaluation/questionnaire/detail?id=${data}&qid=${qid.value}&fromPage=${fromPage.value}`,
      });
    } else {
      uni.redirectTo({
        url: `/views/evaluation/questionnaire/qrcode?tag=${tag.value}&sex=${sex.value}&id=${data}&qid=${qid.value}`,
      });
    }
  } catch (error) {
    console.error(error);
    uni.hideLoading();
  }
};

const authUserInfo = () => {
  // #ifdef H5
  sendSubmit(store.user || {});
  // #endif
  // #ifdef MP-WEIXIN
  showEditUserModal.value = true;
  // #endif
};

const submitForm = () => {
  if (!authSuccess.value) {
    authUserInfo();
  } else {
    sendSubmit(newUserInfo.value);
  }
};

const barHeight = computed(() => {
  return uni.getSystemInfoSync().statusBarHeight + 50 + "px";
});

const currentStep = ref(1);

// 没有屏蔽的题数量
const maxStep = computed(() => {
  return stepList.value.filter((item) => !item.hide).length;
});

// 没有屏蔽的题当前索引
const currentStepIndex = computed(() => {
  const list = stepList.value.filter((item) => !item.hide);
  const currentItem = stepList.value[currentStep.value - 1] || {};
  return list.findIndex((item) => item.id === currentItem.id) + 1;
});

const prevStep = () => {
  if (currentStep.value > 1) {
    // 如果上一题被屏蔽，则跳过，直到上一个没有屏蔽的题
    let _currentStep = currentStep.value - 1;
    while (stepList.value[_currentStep - 1] && stepList.value[_currentStep - 1].hide) {
      _currentStep--;
      if (_currentStep <= 1) {
        // 跳转到第一步
        currentStep.value = 1;
        return;
      }
    }
    currentStep.value = _currentStep;
  }

  setTimeout(() => {
    // 回到顶部
    uni.pageScrollTo({
      scrollTop: 0,
      duration: 0,
    });
  });
};

const submit = () => {
  popupRef.value.open();
  // couponRef.value.open();
};

/**
 * 扁平化数组并去重
 * @param {Array} arr - 需要处理的数组
 * @returns {Array} 扁平化并去重后的数组
 */
function flattenAndUnique(arr) {
  // 递归扁平化数组
  const flatten = (array) => {
    return array.reduce((acc, val) => {
      return acc.concat(Array.isArray(val) ? flatten(val) : val);
    }, []);
  };

  // 扁平化数组
  const flattened = flatten(arr);

  // 去重
  if (flattened.length === 0) return flattened;

  // 如果数组元素是基本类型，使用Set去重
  if (typeof flattened[0] === "string" || typeof flattened[0] === "number" || typeof flattened[0] === "boolean") {
    return [...new Set(flattened)];
  }

  // 如果数组元素是对象，使用JSON.stringify去重
  const unique = [];
  const seen = new Set();

  for (const item of flattened) {
    const itemString = JSON.stringify(item);
    if (!seen.has(itemString)) {
      seen.add(itemString);
      unique.push(item);
    }
  }

  return unique;
}

const activates = ref([]); // 激活的题目id
const keyid = ref(timestampWithRandom());
const answerTexts = ref([]);

const nextStep = () => {
  if (currentStep.value === 1 && stepList.value[0].ttype === "2") {
    // 第一题如果是多选，最多选择三个
    if (stepList.value[0].options.filter((item) => item.checked).length > maxNum.value) {
      uni.showToast({
        title: `最多只能选择${maxNum.value}个目标`,
        icon: "none",
      });
      return;
    }
  }
  // 身高的有效输入范围为80~260
  let sg = stepList.value.find((item) => item.imgSize === 5);
  if (sg && sg.answerContent) {
    const height = sg.answerContent;
    if (Number.isNaN(height) || height < 80 || height > 260) {
      uni.showToast({
        title: "请输入80-260之间的身高",
        icon: "none",
      });
      return;
    }
  }
  // 体重的有效输入范围为10~300
  let bw = stepList.value.find((item) => item.imgSize === 6);
  if (bw && bw.answerContent) {
    const weight = bw.answerContent;
    if (Number.isNaN(weight) || weight < 10 || weight > 300) {
      uni.showToast({
        title: "请输入10-300之间的体重",
        icon: "none",
      });
      return;
    }
  }

  // 遍历所有题目，设置激活/屏蔽状态
  stepList.value = stepList.value.map((item) => {
    // 激活条件
    // "activateList": [   //激活条件
    //         "id": 8,
    //         "tid": 24,  //题目id
    //         "types": 1,
    //         "ttid": null,
    //         "ttcode": "Q17",//题目编号
    //         "conditions": 1,  //条件：1=全选、2=部分选中、3=不选
    //         "options": "1|2|3" //题目选项编号多个使用|分开
    // ],
    const activateList = item.activateList;
    if (activateList && activateList.length > 0) {
      // 重置激活状态
      item.ahide = false;
      // 遍历所有激活条件
      activateList.forEach((item2) => {
        // 获取当前激活条件对应的题目
        const tItem = stepList.value.find((o) => o.code === item2.ttcode);
        if (tItem && item2.conditions === 1) {
          //条件：1=全选
          if (item.options.filter((o) => !o.checked).length === 0) {
            // 全选时激活
            item.ahide = false;
            // console.log(`${tItem.title} 全选时激活: ${item.title}`);
          } else {
            item.ahide = true;
            // console.log(`${tItem.title} 未全选中时未激活: ${item.title}`);
          }
        } else if (tItem && item2.conditions === 2) {
          //条件：2=部分选中
          if (item2.options) {
            // 需要选中的
            const _options = item2.options.split("|");
            const _checkeds = tItem.options.filter((o) => o.checked);
            if (_options.length && _checkeds.length && _checkeds.find((o) => _options.includes(String(o.score)))) {
              // 部分选中时激活 （命中一个即可满足条件）
              item.ahide = false;
              // console.log(item2, `${tItem.title} 部分选中时激活: ${item.title}`);
            } else {
              item.ahide = true;
              // console.log(item2, `${tItem.title} 部分未选中时未激活: ${item.title}`);
            }
          }
        } else if (tItem && item2.conditions === 3) {
          //条件：3=不选
          if (item2.options) {
            // 需要不选的选项
            const _options = item2.options.split("|");
            const _checkeds = tItem.options.filter((o) => o.checked);
            if (_options.length && _checkeds.length && _checkeds.find((o) => _options.includes(String(o.score)))) {
              item.ahide = true;
              // console.log(item2, `${tItem.title} 选时不激活: ${item.title}`);
            } else {
              // 不选时激活
              item.ahide = false;
              // console.log(item2, `${tItem.title} 不选时激活: ${item.title}`);
            }
          }
        }
      });
    } else {
      item.ahide = null;
    }

    // 屏蔽条件
    // "blockList": [//屏蔽条件
    //     {
    //         "id": 10,
    //         "tid": 24,//题目id
    //         "types": 2,
    //         "ttid": null,
    //         "ttcode": "Q3",//题目编号
    //         "conditions": 2, //条件：1=全选、2=部分选中、3=不选
    //         "options": "2"//题目选项编号多个使用|分开
    //     }
    // ]
    const blockList = item.blockList;
    if (blockList && blockList.length > 0) {
      // 重置屏蔽状态
      item.bhide = false;
      // 遍历所有屏蔽条件
      blockList.forEach((item2) => {
        // 获取当前屏蔽条件对应的题目
        const tItem = stepList.value.find((o) => o.code === item2.ttcode);
        if (tItem && item2.conditions === 1) {
          //条件：1=全选
          if (item.options.filter((o) => !o.checked).length === 0) {
            // 全选时屏蔽
            item.bhide = true;
            // console.log(`${tItem.title} 全选时屏蔽: ${item.title}`);
          } else {
            item.bhide = false;
            // console.log(`${tItem.title} 未全选中时未屏蔽: ${item.title}`);
          }
        } else if (tItem && item2.conditions === 2) {
          //条件：2=部分选中
          if (item2.options) {
            // 需要选中的
            const _options = item2.options.split("|");
            const _checkeds = tItem.options.filter((o) => o.checked);
            if (_options.length && _checkeds.length && _checkeds.find((o) => _options.includes(String(o.score)))) {
              // 部分选中时屏蔽 （命中一个即可满足条件）
              item.bhide = true;
              // console.log(item2, `${tItem.title} 部分选中时屏蔽: ${item.title}`);
            } else {
              item.bhide = false;
              // console.log(item2, `${tItem.title} 部分未选中时未屏蔽: ${item.title}`);
            }
          }
        } else if (tItem && item2.conditions === 3) {
          //条件：3=不选
          if (item2.options) {
            // 需要不选的选项
            const _options = item2.options.split("|");
            const _checkeds = tItem.options.filter((o) => o.checked);
            if (_options.length && _checkeds.length && _checkeds.find((o) => _options.includes(String(o.score)))) {
              item.bhide = true;
              // console.log(item2, `${tItem.title} 选时未屏蔽: ${item.title}`);
            } else {
              // 不选时激活
              item.bhide = false;
              // console.log(item2, `${tItem.title} 未选时屏蔽: ${item.title}`);
            }
          }
        }
      });
    } else {
      item.bhide = null;
    }
    // 下面针对激活和屏蔽， null 未设置条件,   true 隐藏，  false 不隐藏
    // 未设置激活条件、未设置屏蔽条件  ---->显示 null,null
    // 设置激活条件(满足)，未设置屏蔽条件 ---->显示 false,null
    // 未设置激活条件，设置屏蔽条件(不满足) ---->显示 null,false
    // 设置激活条件(不满足)，设置屏蔽条件(不满足)- ---->隐藏 true,false
    // 设置激活条件(满足)，设置屏蔽条件(不满足)- ---->显示 false,false
    // 设置激活条件(不满足)，未设置屏蔽条件 ---->隐藏 true,null
    // 设置激活条件(满足)，设置屏蔽条件(满足)- ---->隐藏 false,true
    // 设置激活条件(不满足)，设置屏蔽条件(满足)- ---->隐藏 true,true
    // 未设置激活条件，设置屏蔽条件(满足) ---->隐藏 null,true
    if ((item.ahide === null && item.bhide === null) || (item.ahide === false && item.bhide === null) || (item.ahide === null && item.bhide === false) || (item.ahide === false && item.bhide === false)) {
      // 显示
      item.hide = false;
    } else {
      // 隐藏
      item.hide = true;
    }

    // if(item.types === 3){
    //   // 基本信息题目不隐藏
    //   item.hide = false;
    // }

    return item;
  });

  //   1、设置激活条件
  // 他的激活条件为：Q3  部分选择  选项为2

  // Q3对应的就是： 您的性别是？
  // 就是说用户选择了 性别为 女 的时候，这题材显示出来，这个就是激活条件
  // 激活选项又分：全部，部分选择，不选
  // 全部：	全部是针对多选的，比如
  // 部分选中	同理部分选中，只要满足其中一个就显示
  // 不选	如果你 激活题目是Q3 ，那用户做了Q3 的题目，激活

  // 2、设置屏蔽条件
  // 原理和 激活条件 是一样的，只不过他是满足了就不显示。
  // 屏蔽条件的权限大于 激活条件，意思是 这道题目 两个提交都设置了，如果哟冲突，就是激活条件满足要显示，但是屏蔽条件也满足，要屏蔽，已屏蔽的为准

  changeActivates();

  setTimeout(() => {
    // 回到顶部
    uni.pageScrollTo({
      scrollTop: 0,
      duration: 0,
    });
  });

  // 如果下一题被屏蔽，则跳过，直到下一个没有屏蔽的题

  if (currentStep.value >= stepList.value.length) {
    changeActivates(true);
    submit();
  } else {
    let _currentStep = currentStep.value + 1;
    while (stepList.value[_currentStep - 1] && stepList.value[_currentStep - 1].hide) {
      _currentStep++;
      if (_currentStep >= stepList.value.length) {
        // 跳转到最后一个没有屏蔽的题
        let lastVisibleIndex = 1;
        for (let i = stepList.value.length - 1; i >= 0; i--) {
          if (!stepList.value[i].hide) {
            lastVisibleIndex = i + 1;
            break;
          }
        }
        _currentStep = lastVisibleIndex;
        changeActivates(true);
        submit();
        return;
      }
    }
    currentStep.value = _currentStep;
  }
};

const activateeds = ref({});

const changeActivates = (isRun) => {
  const qrmap = getQrmap();

  if (stepList.value[0] && stepList.value[0].options) {
    activates.value = stepList.value[0].options
      .filter((o) => o.checked)
      .map((o) => {
        return {
          list: o.activates ? JSON.parse(o.activates) : [],
          id: o.id,
        };
      });
    console.log("activates", activates.value);
  }

  if (activates.value && activates.value.length) {
    activates.value.forEach((aobj, aIndex) => {
      const noAnswers = qrmap.filter((item) => {
        return aobj.list.includes(item.id) && !item.answer;
      });
      console.log("noAnswers", noAnswers);

      // 判断activates 里面的题目都作答完了，完了调用异步ai接口
      if ((isRun && !activateeds.value[aobj.id]) || (!isRun && !noAnswers.length)) {
        activateeds.value[aobj.id] = true;
        const _answerText = qrmap
          .filter((item) => {
            return aobj.list.includes(item.id);
          })
          .map((o) => o.answer)
          .join("__");

        // 判断之前选择的答案是否和当前选择的答案一致，不一致要从新请求ai接口
        if (answerTexts.value[aIndex] !== _answerText || isRun) {
          let _versionNumber = versionNumbers.value[aIndex] || 0;
          versionNumbers.value[aIndex] = _versionNumber + 1;

          answerTexts.value[aIndex] = _answerText;

          addReportTemp({
            keyid: keyid.value,
            versionNumber: versionNumbers.value[aIndex],
            activates: aobj.list,
            type: qrmap.length && qrmap[0].answer ? (qrmap[0].answer.split(",").length > 1 ? 2 : 1) : 1,
            oid: aobj.id, //第一题选项的id
            qid: qid.value,
            qrmap: qrmap,
          });
        }
      }
    });
  }
};

const changeOptions = (obj, item) => {
  // 第一题如果是多选，最多选择三个
  if (currentStep.value === 1 && maxNum.value > 1 && stepList.value[0].ttype === "2" && stepList.value[0].options.filter((item) => item.checked).length >= maxNum.value && !obj.checked) {
    uni.showToast({
      title: `最多只能选择${maxNum.value}个目标`,
      icon: "none",
    });
    return;
  }

  // 标记是否为互斥选项且只有一个选项的情况
  let isElse = true;
  // 保存当前选中的选项
  let checkedItem = null;

  // 遍历并更新题目列表中的选项状态
  stepList.value = stepList.value.map((o, oIndex) => {
    if (o.id === item.id) {
      // 处理当前题目的选项
      o.options = o.options.map((o2) => {
        // 多选题处理逻辑
        if (item.ttype === "2") {
          if (o2.id === obj.id) {
            // 切换当前选项的选中状态
            o2.checked = !o2.checked;
            // 保存当前选中的选项
            checkedItem = o2.checked ? o2 : null;
            if (o2.checked && o2.warning === "是") {
              healthPartnersHitRef2.value.open();
            }
          } else if (obj.mutual !== o2.mutual || (maxNum.value === 1 && oIndex === 0)) {
            // 互斥的选项设置false
            o2.checked = false;
          }
          return o2;
        } else {
          // 单选题处理逻辑
          if (o2.id === obj.id && o2.warning === "是") {
            healthPartnersHitRef2.value.open();
          }
          return {
            ...o2,
            checked: o2.id === obj.id,
          };
        }
      });

      // 判断选中的选项是否为互斥的，且当前互斥的组中只有一个选项，则跳转下一题 （比如以上均无）
      if (checkedItem && o.options.filter((o2) => o2.mutual === checkedItem.mutual).length === 1) {
        isElse = false;
      }
      if (o.isSex && o.options.findIndex((o2) => o2.checked) > -1) {
        sex.value = o.options.findIndex((o2) => o2.name === "男" && o2.checked) > -1 ? "1" : "2";
        console.log(sex.value);
      }
    }
    return o;
  });

  // 如果是单选题或互斥选项只有一个的情况，则自动跳转到下一题
  if (item.ttype === "1" || !isElse) {
    nextStep();
  }
};

const safeAreaBottom = ref(0);
// 获取安全区域
const getSafeArea = () => {
  try {
    const systemInfo = uni.getSystemInfoSync();
    if (systemInfo.safeAreaInsets) {
      safeAreaBottom.value = systemInfo.safeAreaInsets.bottom || 0;
    } else {
      // 如果没有safeAreaInsets，则使用默认值0
      safeAreaBottom.value = 0;
    }
  } catch (error) {
    console.error("获取系统信息失败:", error);
    // 出错时使用默认值0
    safeAreaBottom.value = 0;
  }
};

const qid = ref("");
const versionNumbers = ref([]);
const oenCount = ref(0);
const maxNum = ref(0);
const tag = ref("");
const pageUrl = ref('')
onLoad(async (o) => {
  tag.value = o.tag || "0";
  fromPage.value = o.fromPage || "";
  getSafeArea();
  qid.value = o.id;
  pageUrl.value = o.pageUrl || '';
  console.log("pageUrl", pageUrl.value);
  keyid.value = timestampWithRandom();
  versionNumbers.value = [];

  uni.showLoading({
    title: "加载中...",
  });

  // 用户进入问卷  分 首次和非首次
  // 如果是首次  就只能选选择一个目标，默认为第一个
  // 如果是非首次，可以选择多个目标
  const count = await getOenCount();
  console.log("用户进入问卷  分 首次和非首次 ", count);
  //  0=首次  1=非首次
  oenCount.value = count;

  getQuestionnaireTitleList(o.id)
    .then((res) => {
      uni.hideLoading();
      stepList.value = (res || []).map((item, index) => {
        if (index === 0 && oenCount.value === 0) {
          item.options[0].checked = true;
        }
        item.isSex = item.imgSize === 7;
        item.answerContent = "";
        // "imgSize": 1,   //图标大小  1=宽按钮  2=窄按钮 3=大图标 4=小图标 5=选身高 6=选体重
        const isImage = item.options.find((o) => o.image);
        if (item.options.length === 2 && isImage) {
          item.imgSize = 3;
        } else if (item.imgSize === 7) {
          item.imgSize = 1;
        } else if (isImage) {
          item.imgSize = 4;
        } else if (item.ttype === "1" && !item.imgSize) {
          item.imgSize = 1;
        } else if (item.ttype === "2" && !item.imgSize) {
          item.imgSize = 1;
        }
        return item;
      });
    })
    .catch((err) => {
      console.error(err);
      uni.hideLoading();
    });

  getQuestionnaireDetail({ pageUrl:pageUrl.value })
    .then((res) => {
      if (oenCount.value === 0) {
        maxNum.value = res.num1;
      } else {
        maxNum.value = res.num2;
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

onMounted(() => {
  initHealthPartnersHit(healthPartnersHitRef);
});
</script>

<style lang="scss">
.questionnaire-page {
  background-color: #fff;
  min-height: 100vh;
  padding: 0 60rpx;
  box-sizing: border-box;
}

.questionnaire-page {
  background-color: #fff;
  min-height: 100vh;
  padding: 0 60rpx;
}

.questionnaire-steps {
  position: fixed;
  left: 0;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 20rpx 30rpx;
  width: 100%;
  align-items: center;
  background-color: white;
  z-index: 99;
}

.questionnaire-step-prev {
  padding: 10rpx 20rpx;
  border-radius: 40rpx;
  border: 1px solid #000000;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 30rpx;
  text-align: center;
}

.questionnaire-steps-progress {
  width: calc(100% - 160rpx);
  background-color: #f2f3f5;
  height: 20rpx;
  border-radius: 10rpx;
  overflow: hidden;

  view {
    height: 20rpx;
    background-color: #00cbcc;
    border-radius: 10rpx;
    transition: 0.3s width;
  }
}

.questionnaire-content {
  min-height: 50vh;
}

.popup-content {
  position: relative;

  image {
    display: block;
    width: 80vw;
    margin: 0 auto;
  }
}

.popup-content-tip {
  font-weight: bold;
  font-size: 24rpx;
  color: #ffffff;
  text-align: center;
  font-style: normal;
  text-transform: none;
  text-align: center;
  margin-top: -20rpx;
}

.submit-btn {
  width: 362rpx;
  margin: 0 auto;
  line-height: 84rpx;
  background: #00cbcc;
  font-weight: 600;
  font-size: 34rpx;
  color: #ffffff;
  text-align: center;
  font-style: normal;
  text-transform: none;
  text-align: center;
  border-radius: 50rpx;
  margin-top: 20rpx;
}

.popup-content-close {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 99;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nickname-input {
  position: absolute;
  top: 250rpx;
  left: 80rpx;
  font-size: 38rpx;
  color: #c2c2c2;
  font-weight: 500;

  &.xon {
    color: #000000;
    font-weight: 600;
  }
}
</style>
