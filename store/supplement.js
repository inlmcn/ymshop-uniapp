// store/supplement.js
import { defineStore } from "pinia";

export const useSupplementStore = defineStore("supplement", {
  state: () => ({
    confirmList: [], // 左边确认订单页
    adjustList: [], // 中间补剂调整页
    selectList: [], // 右边补剂选择页
    // 汇总数据
  }),
  actions: {
    setConfirmList(list) {
      this.confirmList = list;
    },
    setAdjustList(list) {
      this.adjustList = list;
    },
    setSelectList(list) {
      this.selectList = list;
    },
  },
});
