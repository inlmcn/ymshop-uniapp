import { requestUtil } from "@/utils/request";

// 删除用户地址
export function getAddressDel(data) {
  return requestUtil.delete(`/address/del/${data.id}`, undefined, {
    login: true,
  });
}

// 设置默认地址
export function getAddressDefault(data) {
  return requestUtil.post(`/address/default/set/{id}`, data, { login: true });
}

// 添加或修改地址
export function getAddressAddAndEdit(data) {
  return requestUtil.post(`/address/addAndEdit`, data, { login: true });
}

// 用户地址列表
export function getAddressList(data) {
  return requestUtil.get(`/address/list`, data);
}

// 城市列表
export function getAddressCityList(data) {
  return requestUtil.get(`/address/city_list`, data, { login: true });
}
export function getUserAuth(data) {
  return requestUtil.get(`/member/user/getUserAuth`, data, { login: true });
}

/**
 * 获取门店列表
 * @param data
 * @param data.lon
 * @param data.lat
 * @return {*}
 */
export function getShopList(data) {
  return requestUtil.get("/mall/shop/list", data);
}
