import { requestUtil } from "@/utils/request";

export const getMultipleList = (data) => requestUtil.get(`/product/documentJc`, data)

export const getShowImg = () => requestUtil.get(`/news/detail/32`)