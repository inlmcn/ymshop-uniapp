import { requestUtil } from "@/utils/request";

/**
 * 获得商品分类列表
 */
export function getCategoryList(data) {
  return requestUtil.get("/product/category/list", data);
}

export function getCategoryProductList(data) {
  return requestUtil.get("/product/category/plist", data);
}

/**
 * 商品列表
 */
export function getProductList(data) {
  return requestUtil.get("/product/products", data);
}

/**
 * 商品标签
 */
export function getProductLabel(data) {
  return requestUtil.get("/product/label", data);
}

/**
 * 推广商品列表
 */
export function getDistributorProductList(data) {
  return requestUtil.get("/app/distributor/product/page", data);
}

/**
 * 商品详情
 */
export function getProductDetail(data) {
  return requestUtil.get(`/product/detail`, data);
}

/**
 * 添加收藏
 */
export function getProductAddCollect(data) {
  return requestUtil.post(`/relation/collect/add`, data);
}

/**
 * 取消收藏
 */
export function getProductDelCollect(data) {
  return requestUtil.delete(`/relation/collect/del`, data);
}

// ================= 👆 我不知道上面的命名方式是什么命名方式，屎山我也不敢动
// ================= 👆 后面的兄弟要骂娘骂上面人的娘，我是没看过这种傻逼命名方式
// ================= 👆 shaw只是init仓库，也别骂他娘
// ================= 👇 下面的才是我写的
/**
 * 分页获取收藏
 * @param data 分页信息
 * @returns {*}
 */
export const collectPage = (data) =>
  requestUtil.get(`/relation/collect/user`, { ...data, type: "collect" });

/**
 * 收藏
 * @param data  {{ productId:any,type?:'collect' }}
 * productId：产品ID
 * type：collect
 * @returns {*}
 */
export const collectSingle = (data) =>
  requestUtil.post(`/relation/collect/add`, { ...data, type: "collect" });

/**
 * 取消多个收藏
 * @param data {{ productId:any,type?:'collect' }}
 * @returns {*}
 */
export const unCollectByList = (data) =>
  requestUtil.post(`/relation/collect/batchDel`, { ...data, type: "collect" });

/**
 * 取消单个收藏
 * @param data  {{ productId:any,type?:'collect' }}
 * @returns {*}
 */
export const unCollectSingle = (data) =>
  requestUtil.delete(`/relation/collect/del`, { ...data, type: "collect" });

/**
 * 分页获取足迹信息
 * @param data  {{ productId:any,type?:'collect' }}
 * @returns {*}
 */
export const footprintPage = (data) =>
  requestUtil.get(`/relation/collect/user`, { ...data, type: "foot" });

/**
 * 删除多个足迹
 * @param data {{ productId:any,type?:'collect' }}
 * @returns {*}
 */
export const unFootprintByList = (data) =>
  requestUtil.post(`/relation/collect/batchDel`, { ...data, type: "foot" });

/**
 * 取消单个收藏
 * @param data  {{ productId:any,type?:'collect' }}
 * @returns {*}
 */
export const unFootprintSingle = (data) =>
  requestUtil.delete(`/relation/collect/del`, { ...data, type: "foot" });

/**
 * 获取热门搜索
 * @returns {*}
 */
export const hotSearch = (start, end) =>
  requestUtil.get(`/product/search/popular/${start}/${end}`);

/**
 * 历史搜索记录
 * @returns {*}
 */
export const historySearch = () => requestUtil.get(`/product/search/history`);

/**
 * 清空历史搜索记录
 * @param data
 * @returns {*}
 */
export const clearHistorySearch = () =>
  requestUtil.delete(`/product/search/history/del`);

/**
 * 活动商品列表
 */
export function getActivityProList(data) {
  return requestUtil.post(`/product/campaign/product-page`, data);
}
/**
 * 查看产品的文献和报告
 */
export function getProductDocument(data) {
  return requestUtil.get(`/product/document/${data}`);
}


/**
 * 热门商品
 */
export function getProductHot(top) {
  return requestUtil.get(`/product/hot?top=`+top);
}


export function getCouponLinkByClId(clid) {
  return requestUtil.get(`/product/campaign/getLink?id=`+clid);
}


export function receiveAllClId(clid) {
  return requestUtil.get(`/product/coupon/relation/receiveClid/`+clid);
}


export function getPopUpInfo(clid) {
  return requestUtil.get(`/shop/popup/getInfo?showPageType=`+clid);
}

export function addPopupLogs(id) {
  return requestUtil.get(`/shop/popup/addPopupLogs?popupId=`+id);
}

export function gethotsaleList(data){
	return requestUtil.get(`/order/getHotProductInfo`,data)
}

export function getproductcardList(id){
	return requestUtil.get(`/product/getProductCardInfoList/${id}`)
}

//获取销售数量
export function getproductSales(data){
	return requestUtil.get(`/order/getProductSales`,data)
}