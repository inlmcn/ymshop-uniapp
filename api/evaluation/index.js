import { requestUtil } from "@/utils/request";

/**
 * 获取问卷详情
 * @param {string} code - 问卷代码
 * @returns {Promise}
 */
export function getQuestionnaireDetail(data = { pageUrl: '' }) {
  return requestUtil.get("/qaire/getDetail", data);
}

/**
 * 获取问卷问题列表
 * @param {number} qid - 问卷ID
 * @returns {Promise}
 */
export function getQuestionnaireTitleList(qid) {
  return requestUtil.get("/qaire/getTitleList", { qid });
}

/**
 * 修改用户昵称
 */
export function updateNickname(data) {
  return requestUtil.put(`/member/user/update-nickname?nickname=${data.nickname}`, data);
}

// 提交问卷
export function addReport(data) {
  return requestUtil.post("/qaire/addReport", data);
}

// 问卷结果详情
export function getReportAi(id) {
  return requestUtil.get("/qaire/getReportAi?id=" + id);
}
export function getReportAi2(id) {
  return requestUtil.get("/qaire/getReportAi2?id=" + id);
}

// /app-api/news/detail/18
export function getNewsDetail(id) {
  return requestUtil.get("/news/detail/" + id);
}

// /app-api/qaire/pageuid
export function getPageUid(params) {
  return requestUtil.get(`/qaire/pageuid?pageNo=${params.pageNo}&pageSize=${params.pageSize}`);
}

// /app-api/qaire/userReportCount
export function getUserReportCount(params) {
  return requestUtil.get(`/qaire/userReportCount`, params);
}

//获得用户测评角标
export function getReportCorner(){
	return requestUtil.get(`/order/getReportCorner`)
}

// /app-api/qaire/addReportTemp
export function addReportTemp(data) {
  return requestUtil.post(`/qaire/addReportTemp`, data);
}

// /app-api/product/reply/pids/count
export function getReplyCount(pids) {
  return requestUtil.get(`/product/reply/pids/count?pids=${pids}`);
}

// /app-api/system/dict-data/get-value
export function getDictValue(data) {
  return requestUtil.get(`/system/dict-data/get-value`, data);
}

// /app-api/qaire/pageFriend
export function getPageFriend(params) {
  return requestUtil.get(`/qaire/pageFriend`, params);
}

// /app-api/qaire/oenCount
export function getOenCount(params) {
  return requestUtil.get(`/qaire/oenCount`, params);
}