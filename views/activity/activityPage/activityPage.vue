<template>
  <!--  <uv-navbar-->
  <!--      :fixed="true"-->
  <!--      :placeholder="true"-->
  <!--      :title="data.name"-->
  <!--      @leftClick="goHome"-->
  <!--  />-->
  <uv-skeleton v-if="isLoading" :rows="3" :rowsHeight="200" title :animate="true"></uv-skeleton>
  <div class="page" v-else>
    <div class="activity-page-rule" v-if="data.rule && data.rule.length>0" @click="jumpActivityPageRule">规则</div>
    <div class="poster" @click="jumpPage()">
      <image :src="data.poster" mode="widthFix"/>
    </div>
    <uv-sticky bgColor="#fff">
      <scroll-view scroll-x enable-flex style="flex-direction: row" class="scroll-menus-wrap">
        <div class="scroll-menus">
          <div
              class="menu"
              :class="{ active: idx === curIdx }"
              @click="changeMenu(idx)"
              v-for="(menu, idx) in data.menus"
              :key="idx"
          >
            <div class="menu-text" :style="{ color: menu.bg || 'block' }"> {{ menu.name }}</div>
          </div>
        </div>
      </scroll-view>
    </uv-sticky>
    <div>
      <div class="product-section">
        <template v-if="data.menus[curIdx] && data.menus[curIdx].immediate && !data.menus[curIdx].error">
          <div
              class="product-card"
              v-for="(product, index) in data.menus[curIdx].products"
              :key="product.id"
          >
            <div class="product-image" @click="jumpDetail(product.id)">
              <image :src="product.mediaUrl" class="product-img"/>
            </div>
            <div class="product-info">
              <div class="product-content">
                <div class="product-title" @click="jumpDetail(product.id)">
                  <text class="title uv-line-1">{{ product.name }}</text>
                </div>
                <div class="product-tags" @click="jumpDetail(product.id)"
                     v-if="product.tags && product.tags.length > 0">
                  <text class="tag" v-for="(tag,tagIdx) in product.tags" :key="tagIdx">{{ tag.tagName }}</text>
                </div>
                <div
                    class="product-activity"
                    @click="jumpDetail(product.id)"
                    v-if="product.promotion && product.promotion.length > 0"
                >
                  <text
                      class="tag"
                      v-for="(promotion, promotionIdx) in product.promotion"
                      :key="promotionIdx"
                  >
                    {{ promotion.couponText }}
                  </text>
                </div>
              </div>
              <div class="product-footer">
                <div class="product-price" @click="jumpDetail(product.id)">
                  <div class="price">
                    <text class="unit">¥</text>
                    <text>{{ product.price }}</text>
                  </div>
                  <del class="oprice" v-if="product.oprice">¥ {{ product.oprice || 0 }}</del>
                </div>
                <div class="product-cart-num-wrap">
                  <div
                      v-if=" getCartNum(product.id)"
                      class="reduce-cart"
                      @click.stop="reduceToCart(product.id)"
                  >
                    <image
                        :src="INDEX_IMG_PATH + 'ActivityReduction.png'"
                        class="icon-reduce-cart"
                    ></image>
                  </div>
                  <div v-if="getCartNum(product.id) > 0" class="product-cart-num">
                    {{ getCartNum(product.id) }}
                  </div>
                  <div class="add-cart" @click.stop="addToCart(product.id, index, product,product.onSale)">
                    <image
                        :src="INDEX_IMG_PATH + 'ActivityPlus.png'"
                        class="icon-add-cart"
                    ></image>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <uv-loading-icon
            v-else-if="!data.menus[curIdx].immediate"
            mode="semicircle"
            text="加载中..."
            vertical
        ></uv-loading-icon>
        <template v-else-if="data.menus[curIdx].error">
          {{ data.menus[curIdx].error }}
        </template>
      </div>
    </div>
  </div>
  <div class="page-footer">
    <div class="page-footer-section" @click="openCartPopup">
      <div class="page-footer-section-left">
        <uv-badge
            absolute
            :offset="[0, 0]"
            numberType="ellipsis"
            max="99"
            type="error"
            bg-color="#FE4C4F"
            :value="cartNum"
        ></uv-badge>
        <image
            :src="ACTIVITY_IMG_PATH + 'activity/31gouwuche%201@2x.png'"
            id="iconCart"
            class="icon-cart"
        ></image>
      </div>
      <div class="cart-total">
        <div>
          <text class="total-text">总计：</text>
          <text class="unit">¥</text>
          <text class="total-price">{{ totalProductTotalPrice }}</text>
        </div>
        <!--        <div>-->
        <!--          <text class="discount-price">共减免：¥10000</text>-->
        <!--        </div>-->
      </div>
      <div>
        <div v-if="isLoading" class="btn-submit disable">加载中</div>
        <div v-else class="btn-submit" :class="{disable:data.status!==1}" @click.stop="submit">去结算，享优惠</div>
      </div>
    </div>
  </div>
  <Popup
      ref="cartPopupRef"
      mode="bottom"
      class="cart-popup"
      backgroundColor="#FFFBFB"
      :show-closeable="true"
  >
    <template #leftOption>
      <div class="popup-title">购物车</div>
    </template>
    <scroll-view scroll-y class="scroll-view">
      <uv-checkbox-group
          v-model="shoppingSelect"
          shape="circle"
          activeColor="#FE4C4F"
          @change="handleSingleSelect"
      >
        <div class="shopping-checkbox">
          <!-- 购物车信息 -->
          <div v-for="item in cartList" :key="item.id">
            <div class="shopping-item">
              <div class="shopping-item-checkbox">
                <uv-checkbox :name="item.id"/>
              </div>
              <div class="good">
                <div class="product-card inner">
                  <div class="product-image">
                    <image :src="item.productInfo.mediaUrl"/>
                  </div>
                  <div class="product-info">
                    <div class="product-content">
                      <div class="product-title">
                        <text class="title uv-line-1">{{ item.productInfo.name }}</text>
                      </div>
                      <div class="product-unit" v-if="item.productInfo.unitName">
                        <text class="product-unit-text">{{ item.productInfo.unitName }}</text>
                      </div>
                      <div
                          class="product-activity"
                          v-if="item.productInfo.promotion && item.productInfo.promotion.length > 0"
                      >
                        <text
                            class="tag"
                            v-for="(promotion, promotionIdx) in item.productInfo.promotion"
                            :key="promotionIdx"
                        >
                          {{ promotion.couponText }}
                        </text>
                      </div>
                    </div>
                    <div class="product-footer">
                      <div class="product-price">
                        <div class="price">
                          <text class="unit">¥</text>
                          <text>{{ item.productInfo.price }}</text>
                        </div>
                        <del class="oprice" v-if="item.productInfo.oprice">¥ {{ item.productInfo.oprice }}</del>
                      </div>
                      <div class="cart-num flex flex-ai__center flex-jc__sb border">
                        <div
                            class="button"
                            :class="item.cartNum <= item.productInfo.onSale && 'disabled'"
                            @click.stop="handleCartNumberChange(item.id, -1)"
                        >
                          <uv-icon name="minus" color="#333" size="18rpx"></uv-icon>
                        </div>
                        <div class="input">
                          <input
                              type="number"
                              inputmode="numeric"
                              v-model="item.cartNum"
                              readonly
                          />
                        </div>
                        <div class="button" @click.stop="handleCartNumberChange(item.id, 1)">
                          <uv-icon name="plus" color="#333" size="18rpx"></uv-icon>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </uv-checkbox-group>
    </scroll-view>
  </Popup>
  <div class="fly-container">
    <div
        class="fly-item"
        v-for="(fly, fIdx) in flyingItems"
        :style="{
        transform: `translateX(${fly.tranX}px)`,
        left: fly.left + 'px',
        top: fly.top + 'px',
        opacity: fly.opacity
      }"
        :key="fIdx"
    >
      <div
          class="fly-item-inner"
          @transitionend="onTransitionend(fIdx)"
          :style="{
          transform: `translateY(${fly.tranY}px)`
        }"
      ></div>
    </div>
  </div>
  <CustomToast ref="customToastRef"/>
</template>
<script setup lang="js">
import UvSkeleton from '@/uni_modules/uv-skeleton/components/uv-skeleton/uv-skeleton.vue'
import {ref, reactive, computed} from 'vue'
import {onLoad, onReady, onShareAppMessage, onShareTimeline} from '@dcloudio/uni-app'
import {ACTIVITY_IMG_PATH, INDEX_IMG_PATH} from '@/utils/imgpath'
import Popup from '@/components/Popup.vue'
import UvCheckboxGroup from '@/uni_modules/uv-checkbox/components/uv-checkbox-group/uv-checkbox-group.vue'
import {useRouter} from '@/hooks/useRouter'
import * as Api from '@/api/activity/activityPage'
import {getCartAdd, deleteCartByIds} from '@/api/cart'
import {useShoppingCartStore} from '@/store/modules/useShoppingCart'
import {useActivityPageStore} from '@/store/modules/useActivityPageStore'
import CustomToast from '@/components/CustomToast/index.vue';
import {useShare} from "@/hooks/useShare";
import {useMainStore} from "@/store/modules/useMainStore";

const mainStore = useMainStore();

const shoppingCartStore = useShoppingCartStore()
const activityPageStore = useActivityPageStore()
const {shareAppMessage, shareTimeline, shareInfo} = useShare()
const {push} = useRouter()
const isLoading = ref(true)
function useActivityPage(initData = {}) {
  let activityPage = reactive({
    name: initData.name || '',
    startTime: initData.startTime || '',
    endTime: initData.endTime || '',
    poster: initData.poster || '',
    rule: initData.rule || '',
    jumpUrl: initData.jumpUrl || '',
    menus: initData.menus || [],
    id: initData.id || 0,
    status: initData.status || 0,
    shareImg: initData.shareImg || ''
  })
  let curIdx = ref(0)

  function fmtProduct(voProducts) {
    if (!voProducts) {
      return []
    }
    return voProducts.map((voProduct) => {
      let product = {
        name: voProduct.productName,
        price: voProduct.price,
        oprice: voProduct.otPrice,
        mediaUrl: voProduct.image,
        tags: voProduct.tags,
        promotion: voProduct?.discountInformationVOS?.map((voDiscount) => voDiscount) || [],
        cartNum: 0,
        id: voProduct.productId,
        onSale: voProduct.onSale,
        unique: voProduct.unique,
        unitName: voProduct.unitName
      }
      console.log('fmtProduct----->', product)
      return product
    })
  }

  function setActivityPage(voActivityPage) {
    activityPage.name = voActivityPage.activityName
    activityPage.poster = voActivityPage.activityImg
    activityPage.shareImg = voActivityPage.shareImg
    activityPage.status = voActivityPage.status
    activityPage.rule = voActivityPage.content
    activityPage.jumpUrl = voActivityPage.jumpUrl
    activityPage.menus = voActivityPage.menuVOList.map((voMenu) => {
      // 是否加载了商品列表 true：表示立即加载了
      let immediate = false
      let products = []
      if (voMenu.menuProductVOS && Array.isArray(voMenu.menuProductVOS)) {
        immediate = true
        products = fmtProduct(voMenu.menuProductVOS)
      }
      let menu = {
        immediate,
        name: voMenu.menuName,
        bg: voMenu.background,
        products: products,
        menuId: voMenu.id,
        error: null
      }
      return menu
    })
  }

  /**
   * 获取菜单下商品列表
   * @param menuId
   * @returns {Promise<void>}
   */
  async function getProductList(menuId) {
    let res = await Api.getActivityPageMenu(activityPage.id, menuId)
    console.log('菜单下的商品数据---》', res)
    if (res && res.menuProductVOS) {
      return res.menuProductVOS
    }
    return []
  }

  async function setProducts(menuIdx) {
    try {
      let voProducts = await getProductList(activityPage.menus[menuIdx].menuId)
      activityPage.menus[menuIdx].products = fmtProduct(voProducts)
      activityPage.menus[menuIdx].immediate = true
    } catch (e) {
      activityPage.menus[menuIdx].error = '数据加载异常咯~'
    }
  }

  /**
   * 切换菜单
   * @param menuIdx
   * @returns {Promise<void>}
   */
  async function changeMenu(menuIdx) {
    console.log('切换菜单', menuIdx)
    curIdx.value = menuIdx
    // 检查当前菜单下的商品是否已经加载了
    if (!activityPage.menus[menuIdx].immediate) {
      console.log('data.menus[index]', activityPage.menus[menuIdx])
      await setProducts(menuIdx)
    }
  }

  return {
    activityPage,
    setActivityPage,
    changeMenu,
    curIdx
  }
}

const {activityPage: data, setActivityPage, changeMenu, curIdx} = useActivityPage()

/**
 * 使用小球动画
 */
function useFlyAnimate() {
  const flyingItems = ref([])
  const endPoint = reactive({
    x: 0,
    y: 0
  })

  function setEndPoint(x, y) {
    endPoint.x = x
    endPoint.y = y
  }

  function startAnimate(startPoint = {x: 0, y: 0}) {
    let newFlyerId = `flyer_${Date.now()}`
    let newFlyer = {
      id: newFlyerId,
      left: startPoint.x,
      top: startPoint.y,
      tranX: 0,
      tranY: 0
    }
    flyingItems.value.push(newFlyer)
    console.log('flyingItems', flyingItems)
    animateFly(flyingItems.value.length - 1, startPoint, endPoint)
  }

  function animateFly(fIdx, start, end) {
    flyingItems.value[fIdx].opacity = 1
    flyingItems.value[fIdx].left = start.x
    flyingItems.value[fIdx].top = start.y
    setTimeout(() => {
      flyingItems.value[fIdx].tranX = end.x - start.x - 8
      // 调整小球位置 往上一点
      flyingItems.value[fIdx].tranY = end.y - start.y - 30
      // 预防onTransitionend不执行，1.5s之后手动清除小球
      flyingItems.value[fIdx].timer = setTimeout(function () {
        clearFly(fIdx)
      }, 1500)
    }, 30)
  }

  /**
   * 结束小球动画
   * @param idx
   */
  function endAnimate(idx) {
    console.log('-----------触发动画结束-----------', idx)
    flyingItems.value[idx].opacity = 0
    flyingItems.value[idx].left = 0
    flyingItems.value[idx].top = 0
    flyingItems.value[idx].tranX = 0
    flyingItems.value[idx].tranY = 0
    if (flyingItems.value[idx].timer) {
      clearTimeout(flyingItems.value[idx].timer)
      flyingItems.value[idx].timer = null
    }
  }

  function clearFly(idx) {
    flyingItems.value[idx].opacity = 0
  }

  return {
    flyingItems,
    setEndPoint,
    startAnimate,
    endAnimate
  }
}

let flyAnimate = useFlyAnimate()
const {flyingItems} = flyAnimate

function onTransitionend(idx) {
  flyAnimate.endAnimate(idx)
}

/**
 * 购物车相关逻辑
 * @returns {{shoppingSelect: Ref<UnwrapRef<*[]>, UnwrapRef<*[]> | *[]>, cartList: Ref<UnwrapRef<*[]>, UnwrapRef<*[]> | *[]>, addToCart: (function(*, *, *, number=, boolean=): Promise<void>)|*, reduceToCart: reduceToCart, getCartNum: (function(*): (*|number))|*, cartNum: ComputedRef<number>, handleCartNumberChange: handleCartNumberChange, totalProductTotalPrice: ComputedRef<string|number>}}
 */
function useCart() {
  // 购物车相关逻辑
  const shoppingSelect = ref([])
  const cartList = ref([])

  /**
   * 将商品加入到购物车
   */
  function addToCart(id, productIdx, product, initValue = 1, animation = true) {
    let index = cartList.value.findIndex((row) => row.id === id)
    if (index === -1) {
      console.log('product', product)
      cartList.value.push({
        id: id,
        productInfo: {
          price: product.price,
          oprice: product.oprice,
          mediaUrl: product.mediaUrl,
          id: product.id,
          skuId: product.id,
          name: product.name,
          tags: product.tags,
          promotion: product.promotion,
          onSale: product.onSale,
          unitName: product.unitName
        },
        cartNum: initValue,
        truePrice: product.price,
        unique: product.unique
      })
      shoppingSelect.value.push(id)
    } else {
      cartList.value[index].cartNum++
    }
    console.log('====处理加入购物车逻辑====')
    if (animation) {
      execAnimate(productIdx)
    }
  }

  async function execAnimate(productIdx){
    let doms = await querySelectorAll('.add-cart')
    let curDom = doms[0][productIdx]
    console.log('curDom', curDom)
    if (!curDom) {
      return
    }
    flyAnimate.startAnimate({
      x: curDom.left,
      y: curDom.top
    })
  }


  function reduceToCart(id) {
    let index = cartList.value.findIndex((row) => row.id === id)
    if (index < 0) {
      return
    }
    let curProduct = cartList.value[index]
    if (!curProduct) {
      return
    }
    curProduct.cartNum--
    let onSale = curProduct.productInfo.onSale || 1
    if (curProduct.cartNum < onSale) {
      shoppingSelect.value.splice(shoppingSelect.value.indexOf(id), 1)
      curProduct.cartNum = 0
      cartList.value.splice(index, 1)
    }
  }

  /**
   * 获取当前商品加购数量
   * @param productId
   * @returns {*|number}
   */
  function getCartNum(productId) {
    let index = cartList.value.findIndex((row) => row.id === productId)
    if (index < 0) {
      return 0
    }
    return cartList.value[index].cartNum
  }

  /**
   * 购物车商品总数量
   */
  const cartNum = computed(() => {
    if (cartList.value && cartList.value.length > 0 && shoppingSelect.value.length > 0) {
      let cartNum = 0
      cartList.value.forEach((item) => {
        if (shoppingSelect.value.indexOf(item.id) > -1) {
          cartNum += item.cartNum || 0
        }
      })
      return cartNum
    }
    return 0
  })

  /**
   * 更新购物车商品数量
   * @param productId
   * @param value
   */
  function handleCartNumberChange(productId, value) {
    // 更新购物车商品数量
    let index = cartList.value.findIndex((row) => row.id === productId)
    if (index >= 0) {
      cartList.value[index].cartNum += value
      let onSale = cartList.value[index].productInfo.onSale || 1
      if (cartList.value[index].cartNum < onSale) {
        cartList.value.splice(index, 1)
      }
    }
    if (cartNum.value <= 0) {
      setTimeout(() => {
        cartPopupRef.value.close()
      }, 500)
    }
  }

  /**
   * 选中商品总价格
   */
  const totalProductTotalPrice = computed(() => {
    if (cartList.value && cartList.value.length > 0 && shoppingSelect.value.length > 0) {
      let totalPrice = 0
      cartList.value.forEach((item) => {
        if (shoppingSelect.value.indexOf(item.id) > -1) {
          totalPrice += (item.truePrice || 0) * (item.cartNum || 0)
        }
      })
      return Number(totalPrice).toFixed(2)
    }
    return 0
  })


  return {
    shoppingSelect,
    cartList,
    addToCart,
    reduceToCart,
    getCartNum,
    cartNum,
    handleCartNumberChange,
    totalProductTotalPrice
  }
}

let {
  shoppingSelect,
  cartList,
  addToCart,
  reduceToCart,
  getCartNum,
  cartNum,
  handleCartNumberChange,
  totalProductTotalPrice
} = useCart()

const cartPopupRef = ref()
function openCartPopup() {
  if (cartNum.value <= 0) {
    return
  }
  cartPopupRef.value.open()
}

function handleSingleSelect(item) {
  console.log('选择的商品', item)
}

// 提交订单相关逻辑
const execute = ref(false)
async function submit() {
  console.log('提交订单 到订单确认页面')
  if (data.status === 0) {
    uni.showToast({
      title: '活动还未开始，您晚点再来吧',
      icon: 'none',
      duration: 2000
    })
    return
  }
  if (data.status === 2) {
    uni.showToast({
      title: '活动已结束，您下次再来吧',
      icon: 'none',
      duration: 2000
    })
    return
  }
  if (cartNum.value <= 0) {
    uni.showToast({
      title: '请选择购买商品~',
      icon: 'none',
      duration: 2000
    })
    return
  }
  if (execute.value) {
    return
  }
  execute.value = true
  uni.showLoading({title: '数据提交中...'})
  try {
    if (shoppingCartStore.cartIds.length > 0) {
      await deleteCartByIds({
        ids: shoppingCartStore.cartIds,
        cartType: 0
      })
    }
    shoppingCartStore.cartIds = []
    shoppingCartStore.activityId = data.id
    console.log('debug---cartList-->', cartList.value)
    await Promise.all(
        cartList.value.map(async (item) => {
          if (shoppingSelect.value.indexOf(item.id) > -1) {
            let cartRes = await getCartAdd({
              isNew: 0,
              cartType: 0,
              teamworkId: '',
              productId: item.id,
              uniqueId: item.unique,
              cartNum: item.cartNum,
              activityId: data.id
            })
            console.log('cartRes 商品添加到购物车 ===>', cartRes)
            shoppingCartStore.cartIds.push(cartRes.cartId)
            return cartRes.cartIds
          }
          return 0
        })
    )
    if (shoppingCartStore.cartIds.length <= 0) {
      uni.showToast({
        title: '商品添加到购物车异常',
        icon: 'none',
        duration: 2000
      })
      return
    }
    uni.navigateTo({
      url: '/pages/orderList/orderPay'
    })
  } catch (err) {
    console.error('加购商品异常---->', err)
    uni.showToast({
      title: '商品添加到购物车异常',
      icon: 'none',
      duration: 2000
    })
  } finally {
    execute.value = false
    uni.hideLoading()
  }
}

const customToastRef = ref()
/**
 * 获取活动详情数据
 * @param opts
 * @returns {Promise<void>}
 */
async function loadData(opts) {
  isLoading.value = true
  // 等待加载数据
  data.id = parseInt(opts.acId) || 0
  if (!data.id) {
    isLoading.value = false
    // todo:抛出异常活动不存在
    return
  }
  let res = await Api.getActivityPageDetail(data.id)
  switch (res.status) {
      //未开始
    case 0:
      customToastRef.value.show({
        title: '活动还未开始，您晚点再来吧'
      })
      break
    case 1:
      break
      // 已结束
    case 2:
      customToastRef.value.show({
        title: '活动已结束，您下次再来吧'
      })
      break
  }
  console.log('获取到的活动详情数据--->', res)
  setActivityPage(res)
  uni.setNavigationBarTitle({
    title: data.name
  })
  shareInfo.value.imageUrl = data.shareImg || data.poster
  shareInfo.value.title = data.name
  shareInfo.value.pathQuery = `views/activity/activityPage/activityPage?acId=${data.id}`
  // 清空购物车重新加入
  cartList.value = []
  if (res.shopCartVOS && Array.isArray(res.shopCartVOS)) {
    shoppingCartStore.cartIds = []
    res.shopCartVOS.forEach((voProduct) => {
      shoppingCartStore.cartIds.push(voProduct.id)
      // addToCart(
      //   voProduct.productId,
      //   0,
      //   {
      //     price: voProduct.price,
      //     oprice: voProduct.otPrice,
      //     mediaUrl: voProduct.image,
      //     id: voProduct.productId,
      //     skuId: voProduct.productId,
      //     name: voProduct.productName,
      //     tags: voProduct.tags || [],
      //     promotion: voProduct?.discountInformationVOS?.map((voDiscount) => voDiscount) || [],
      //     onSale: voProduct.onSale || 1,
      //     unique: voProduct.unique,
      //     unitName:voProduct.unitName
      //   }, voProduct.cartNum,
      //   false
      // )
    })
  }

  isLoading.value = false
  console.log('menu数据 --->', data)
}
onLoad(async (opts) => {
  await loadData(opts)
})

onReady(() => {
  console.log('页面准备完毕!')
  setTimeout(() => {
    querySelector('#iconCart').then((rect) => {
      if (rect && rect.length > 0) {
        let dom = rect[0]
        // endPoint.x = dom.left
        // endPoint.y = dom.top
        console.log('rect', rect)
        flyAnimate.setEndPoint(dom.left + dom.width / 2, dom.top + dom.height / 2)
      }
    })
  }, 300)
})

onShareTimeline(() => {
  return shareTimeline()
})
onShareAppMessage(() => {
  return shareAppMessage();
})

// 跳转相关
function jumpDetail(id) {
  push(
      {url: '/pages/product/detail'},
      {
        data: {
          id: id,
          skuId: id
        }
      }
  )
}

function jumpActivityPageRule() {
  activityPageStore.activityPageRule = data.rule
  uni.navigateTo({
    url: '/views/activity/activityPage/activityPageRule'
  })
}

function isTabBarPath(link) {
  let tabBarLinks = ['root/index/index', 'root/product/index', 'root/review/index', 'root/user/user']
  for (const tabBarLink of tabBarLinks) {
    if (link.indexOf(tabBarLink) > -1) {
      return true
    }
  }
  return false
}

function jumpPage() {
  if (!data.jumpUrl) {
    return
  }
  if (isTabBarPath(data.jumpUrl)) {
    let idx = data.jumpUrl.indexOf('?')
    // demo=  /index/index?id=1234&id2=sss
    let payload = {}
    data.jumpUrl.slice(idx + 1).split('&').forEach((item) => {
      let [key, value] = item.split('=')
      payload[key] = value
    })
    mainStore.payload = payload
    uni.reLaunch({
      url: data.jumpUrl
    })
    return
  }
  push({url: data.jumpUrl})
}

function querySelector(selector) {
  return new Promise((resolve, reject) => {
    const query = uni.createSelectorQuery()
    console.log('query', query)
    query
        .select(selector)
        .boundingClientRect()
        .exec((rect) => {
          console.log('exec', rect)
          resolve(rect)
        })
  })
}

function querySelectorAll(selector) {
  return new Promise((resolve, reject) => {
    const query = uni.createSelectorQuery()
    console.log('query', query)
    query
        .selectAll(selector)
        .boundingClientRect()
        .exec((rect) => {
          console.log('exec', rect)
          resolve(rect)
        })
  })
}
</script>

<style scoped lang="scss">
@import './activityPage';
</style>
