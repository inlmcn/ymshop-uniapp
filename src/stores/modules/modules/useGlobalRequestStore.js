/**
 * @name: globalRequestStore
 * @author: kahu4
 * @date: 2024-02-21 17:32
 * @description：公共方法
 * @update: 2024-02-21 17:32
 * */

import { defineStore } from "pinia";
import store from "@/store";
import { shareToAddIntegral } from "@/api/account/integral";

export const useGlobalRequestStore = defineStore('globalRequestStore', {
    state: () => ({}),
    getters: {},
    actions: {
        /**
         * 分享商品获取积分
         * @return {Promise<boolean>}
         */
        async doShareToAddIntegral() {
            try {
                await shareToAddIntegral()
                return true
            } catch (e) {
                return false
            }
        }
    },
});

export const useGlobalRequestStoreWithOut = () => useGlobalRequestStore(store);
