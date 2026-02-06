# API 文档

本文档详细介绍了 ymshop-uniapp 项目的 API 结构和使用方法。

## API 架构

### 整体设计

API 层采用模块化设计，遵循单一职责原则：

```
api/
├── base.ts                    # 基础 API 类定义
├── index.ts                   # API 统一导出
└── modules/
    ├── order.ts              # 订单相关 API
    ├── cart.ts               # 购物车相关 API
    ├── user.ts               # 用户相关 API
    └── product.ts            # 商品相关 API
```

### 基础类设计

#### BaseApi 类

```typescript
abstract class BaseApi {
  protected request: ApiRequestManager;  // 请求管理器
  protected cache: ApiCache;             // 缓存管理器
  protected baseUrl: string;             // 基础 URL
  
  protected async requestWithCache<T>(
    options: ApiRequestOptions,
    cacheKey?: string,
    cacheTime?: number
  ): Promise<T>;
  
  protected async requestWithoutCache<T>(
    options: ApiRequestOptions
  ): Promise<T>;
}
```

#### PaginatedApi 类

```typescript
abstract class PaginatedApi<T> extends BaseApi {
  async getList(
    params?: PaginationParams
  ): Promise<PaginationResponse<T>>;
  
  async getNextPage(): Promise<PaginationResponse<T> | null>;
}
```

## API 模块详解

### 1. 订单模块 (Order API)

#### 导入方式

```typescript
import { orderApi } from '@/api';
```

#### 接口列表

##### 获取订单列表
```typescript
async getList(params?: OrderListParams): Promise<OrderPaginationResponse>

// 参数
interface OrderListParams {
  page?: number;
  size?: number;
  status?: OrderStatus;  // 订单状态过滤
  sort?: string;         // 排序字段
}

// 返回值
interface OrderPaginationResponse {
  data: OrderItem[];
  pagination: {
    page: number;
    size: number;
    total: number;
    hasNext: boolean;
  };
}
```

##### 获取订单详情
```typescript
async getById(id: string): Promise<OrderDetail>

// 返回值
interface OrderDetail {
  id: string;
  orderNo: string;
  status: OrderStatus;
  amount: number;
  createTime: string;
  items: OrderItem[];
  // ... 更多字段
}
```

##### 创建订单
```typescript
async create(orderData: CreateOrderRequest): Promise<CreateOrderResponse>

// 参数
interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
}

// 返回值
interface CreateOrderResponse {
  orderId: string;
  orderNo: string;
  paymentInfo: PaymentInfo;
}
```

##### 取消订单
```typescript
async cancel(orderId: string): Promise<CancelOrderResponse>

// 返回值
interface CancelOrderResponse {
  success: boolean;
  message: string;
}
```

##### 申请退款
```typescript
async refund(orderId: string, reason: string): Promise<RefundResponse>

// 返回值
interface RefundResponse {
  success: boolean;
  refundId: string;
  message: string;
}
```

### 2. 购物车模块 (Cart API)

#### 导入方式

```typescript
import { cartApi } from '@/api';
```

#### 接口列表

##### 获取购物车列表
```typescript
async getList(): Promise<CartItem[]>

// 返回值
interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  thumbnail: string;
  checked: boolean;
}
```

##### 添加商品到购物车
```typescript
async addItem(product: AddToCartRequest): Promise<CartOperationResponse>

// 参数
interface AddToCartRequest {
  productId: string;
  quantity: number;
  skuId?: string;
}

// 返回值
interface CartOperationResponse {
  success: boolean;
  cartId: string;
  message: string;
}
```

##### 更新购物车商品数量
```typescript
async updateQuantity(cartItemId: string, quantity: number): Promise<CartOperationResponse>
```

##### 删除购物车商品
```typescript
async removeItem(cartItemId: string): Promise<CartOperationResponse>
```

##### 清空购物车
```typescript
async clear(): Promise<CartOperationResponse>
```

##### 批量操作
```typescript
async batchUpdate(items: CartBatchUpdate[]): Promise<CartOperationResponse>

// 参数
interface CartBatchUpdate {
  id: string;
  quantity?: number;
  checked?: boolean;
}
```

### 3. 用户模块 (User API)

#### 导入方式

```typescript
import { userApi } from '@/api';
```

#### 接口列表

##### 用户登录
```typescript
async login(credentials: LoginRequest): Promise<LoginResponse>

// 参数
interface LoginRequest {
  username: string;
  password: string;
}

// 返回值
interface LoginResponse {
  token: string;
  userInfo: UserInfo;
  refreshToken: string;
}
```

##### 获取用户信息
```typescript
async getUserInfo(): Promise<UserInfo>

// 返回值
interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  email?: string;
  phone?: string;
  // ... 更多用户信息
}
```

##### 更新用户信息
```typescript
async updateUserInfo(userInfo: Partial<UserInfo>): Promise<ApiResponse<UserInfo>>
```

##### 获取收货地址列表
```typescript
async getAddressList(): Promise<Address[]>

// 返回值
interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}
```

##### 添加收货地址
```typescript
async addAddress(address: Address): Promise<ApiResponse<Address>>
```

##### 更新收货地址
```typescript
async updateAddress(addressId: string, address: Address): Promise<ApiResponse<Address>>
```

##### 删除收货地址
```typescript
async deleteAddress(addressId: string): Promise<ApiResponse<boolean>>
```

### 4. 商品模块 (Product API)

#### 导入方式

```typescript
import { productApi } from '@/api';
```

#### 接口列表

##### 获取商品列表
```typescript
async getList(params: ProductListParams): Promise<ProductPaginationResponse>

// 参数
interface ProductListParams {
  page?: number;
  size?: number;
  category?: string;
  keyword?: string;
  sortBy?: 'price' | 'sales' | 'createTime';
  sortOrder?: 'asc' | 'desc';
}

// 返回值
interface ProductPaginationResponse {
  data: ProductItem[];
  pagination: {
    page: number;
    size: number;
    total: number;
    hasNext: boolean;
  };
}
```

##### 获取商品详情
```typescript
async getById(productId: string): Promise<ProductDetail>

// 返回值
interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  attributes: ProductAttribute[];
  // ... 更多商品信息
}
```

## API 使用示例

### 基础用法

```typescript
import { orderApi } from '@/api';

// 获取订单列表
const fetchOrders = async () => {
  try {
    const response = await orderApi.getList({
      page: 1,
      size: 10,
      status: 'paid'
    });
    
    console.log('订单列表:', response.data);
  } catch (error) {
    console.error('获取订单列表失败:', error);
  }
};
```

### 使用缓存

```typescript
// API 模块默认启用缓存
const getCachedOrders = async () => {
  // 第一次调用会发起网络请求
  const response1 = await orderApi.getList({ page: 1 });
  
  // 后续相同参数的调用会返回缓存结果
  const response2 = await orderApi.getList({ page: 1 });
  
  return response2;
};
```

### 错误处理

```typescript
import { handleApiError } from '@/utils';

const handleOrderOperations = async () => {
  try {
    const result = await orderApi.create({
      items: [{ productId: '123', quantity: 1 }],
      shippingAddress: { /* 地址信息 */ },
      paymentMethod: 'wechat'
    });
    
    console.log('订单创建成功:', result);
  } catch (error) {
    // 使用统一的错误处理
    handleApiError(error);
  }
};
```

### 类型安全的使用

```typescript
import type { OrderItem, OrderDetail } from '@/types';

const useOrderData = () => {
  const orders = ref<OrderItem[]>([]);
  const loading = ref(false);
  
  const fetchOrderDetails = async (orderId: string): Promise<OrderDetail> => {
    loading.value = true;
    try {
      const detail = await orderApi.getById(orderId);
      return detail;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    orders,
    loading,
    fetchOrderDetails
  };
};
```

## API 扩展

### 自定义 API 模块

如果需要添加新的 API 模块，可以参考以下步骤：

1. 在 `api/modules/` 目录下创建新模块文件
2. 继承基础 API 类以获得统一的功能
3. 在 `api/index.ts` 中导出新模块

```typescript
// api/modules/notification.ts
import { BaseApi } from '../base';

class NotificationApi extends BaseApi {
  async getList(params: NotificationParams) {
    return this.requestWithCache<NotificationResponse>({
      url: '/notifications',
      method: 'GET',
      params
    }, `notifications_${params.page}`);
  }
  
  async markAsRead(notificationId: string) {
    return this.requestWithoutCache<ApiResponse<boolean>>({
      url: `/notifications/${notificationId}/read`,
      method: 'POST'
    });
  }
}

export const notificationApi = new NotificationApi();
```

```typescript
// api/index.ts
export * from './modules/order';
export * from './modules/cart';
export * from './modules/user';
export * from './modules/product';
export * from './modules/notification'; // 添加新模块
```

## 性能优化

### 请求缓存
- 所有 GET 请求默认启用缓存
- 缓存时间可配置，默认为 5 分钟
- 支持手动清除特定缓存

### 请求去重
- 相同参数的并发请求会被合并
- 避免重复的网络请求

### 分页优化
- 支持预加载下一页数据
- 智能判断是否还有更多数据

## 错误处理

### HTTP 状态码处理
- 2xx: 请求成功
- 4xx: 客户端错误（如参数错误、未授权）
- 5xx: 服务端错误

### 业务错误码
- 10001: 参数错误
- 10002: 用户未登录
- 10003: 权限不足
- 10004: 资源不存在
- 10005: 操作失败

### 错误拦截
- 自动处理认证失败
- 统一错误提示
- 错误日志上报

---

此 API 文档将随着项目发展持续更新。