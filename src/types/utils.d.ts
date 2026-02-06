/**
 * 工具函数类型定义
 */

// 请求选项类型
export interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  header?: Record<string, string>;
  timeout?: number;
  [key: string]: any;
}

// API响应处理选项
export interface ApiResponseOptions {
  showError?: boolean;
  showLoading?: boolean;
  loadingText?: string;
}

// 分页参数类型
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

// 上传文件选项
export interface UploadFileOptions {
  url?: string;
  fileType?: 'image' | 'video' | 'audio';
  formData?: Record<string, any>;
}

// 下载文件选项
export interface DownloadFileOptions {
  successMessage?: string;
  failMessage?: string;
}

// 路由参数类型
export interface RouteParams {
  url: string;
  type?: 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch' | 'navigateBack';
  delta?: number;
  animationType?: string;
  animationDuration?: number;
  [key: string]: any;
}

// Toast选项类型
export interface ToastOptions {
  title: string;
  icon?: 'success' | 'error' | 'loading' | 'none';
  image?: string;
  duration?: number;
  mask?: boolean;
}

// 本地存储选项
export interface StorageOptions {
  encrypt?: boolean;
  expire?: number; // 过期时间（秒）
}