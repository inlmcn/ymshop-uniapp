import { requestUtil } from '@/utils/request'

// /product/documentJc?documentPf=219
// 参数
// mpImg 视频
// content 内容
// originalLink 链接
export function getDocumentJc(data) {
  return requestUtil.get("/product/documentJc", data);
}

// app-api/product/documentPf
export function getDocumentPf(data) {
  return requestUtil.get("/product/documentPf", data);
}

//获取严选原料列表
export function getDocumentYl(data){
	return requestUtil.get("/product/getFinestMaterialsList",data)
}

//获取严选严料详情
export function getDocumentyldetail(id){
	return requestUtil.get("/product/getFinestMaterialsDetail/"+id)
}
