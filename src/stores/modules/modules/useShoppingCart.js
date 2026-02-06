import { defineStore } from 'pinia'

export const useShoppingCartStore = defineStore('shoppingCart', {
  state: () => {
    return {
      products: [],
      cartIds: [],
      useIntegral: 0,
      activityId: 0
    }
  },
  getters: {},
  actions: {}
})
