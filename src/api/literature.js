import { requestUtil } from "@/utils/request";

export const getLiteratureList = (data) => requestUtil.get(`/product/documentYx`, data)

export const getSelectList = () => requestUtil.get(`/product/getHsalthTagsAndProduct`, {})