/**
 * API辅助函数
 */

import { requestUtil } from './request';

/**
 * 统一处理API响应
 * @param {Promise} apiCall - API调用
 * @param {Object} options - 选项
 * @returns {Promise}
 */
export async function handleApiResponse(apiCall, options = {}) {
  const { 
    showError = true, 
    showLoading = false, 
    loadingText = '加载中...' 
  } = options;
  
  try {
    if (showLoading) {
      uni.showLoading({ title: loadingText });
    }
    
    const response = await apiCall;
    
    return response;
  } catch (error) {
    if (showError) {
      uni.showToast({
        title: error.msg || '请求失败',
        icon: 'none'
      });
    }
    
    throw error;
  } finally {
    if (showLoading) {
      uni.hideLoading();
    }
  }
}

/**
 * 分页获取数据
 * @param {Function} apiFunc - API函数
 * @param {Object} params - 参数
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise<Object>}
 */
export async function fetchPagedList(apiFunc, params = {}, page = 1, pageSize = 10) {
  const queryParams = {
    ...params,
    page,
    pageSize
  };
  
  return await handleApiResponse(
    apiFunc(queryParams),
    { showError: true, showLoading: false }
  );
}

/**
 * 上传文件
 * @param {string} filePath - 文件路径
 * @param {Object} options - 上传选项
 * @returns {Promise}
 */
export async function uploadFile(filePath, options = {}) {
  const {
    url = '/upload/file',
    fileType = 'image',
    formData = {}
  } = options;
  
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${requestUtil.baseUrl()}${url}`,
      filePath: filePath,
      name: 'file',
      fileType: fileType,
      formData: formData,
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (res.statusCode === 200 && data.code === 0) {
            resolve(data.data);
          } else {
            reject(new Error(data.msg || '上传失败'));
          }
        } catch (e) {
          reject(new Error('服务器响应格式错误'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 下载文件
 * @param {string} url - 文件URL
 * @param {Object} options - 下载选项
 * @returns {Promise<string>} - 本地临时文件路径
 */
export async function downloadFile(url, options = {}) {
  const { 
    successMessage = '下载完成',
    failMessage = '下载失败' 
  } = options;
  
  return new Promise((resolve, reject) => {
    const downloadTask = uni.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          uni.showToast({
            title: successMessage,
            icon: 'success'
          });
          resolve(res.tempFilePath);
        } else {
          uni.showToast({
            title: failMessage,
            icon: 'none'
          });
          reject(new Error(failMessage));
        }
      },
      fail: (err) => {
        uni.showToast({
          title: failMessage,
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}