# 开发指南

本文档详细介绍了 ymshop-uniapp 项目的架构、开发模式和最佳实践。

## 项目架构

### 整体架构图

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Presentation  │    │    Business      │    │   Data Layer    │
│                 │    │                  │    │                 │
│  Pages          │◄──►│  Components      │◄──►│  API Modules    │
│  Layouts        │    │  Hooks          │    │  Stores         │
│  Components     │    │  Composables    │    │  Utils          │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 核心技术栈

- **uni-app**: 跨平台开发框架，支持编译到多个平台
- **Vue 3**: 响应式前端框架，使用 Composition API
- **Pinia**: 状态管理库，提供类型安全的状态管理
- **TypeScript**: 提供静态类型检查
- **Vite**: 快速的构建工具
- **Sass**: CSS 预处理器
- **uv-ui**: uni-app 官方组件库

## 开发模式

### 组件设计模式

#### 1. 基础组件 (Base Components)
- 存放位置：`src/components/base/`
- 特点：不包含业务逻辑，只提供基础功能
- 示例：按钮、输入框、下拉菜单等

#### 2. 通用组件 (Common Components)
- 存放位置：`src/components/common/`
- 特点：可跨业务复用，有一定业务抽象
- 示例：懒加载图片、虚拟滚动列表等

#### 3. 业务组件 (Business Components)
- 存放位置：`src/components/business/`
- 特点：特定业务场景，封装业务逻辑
- 示例：订单卡片、商品列表项等

### 状态管理模式

使用 Pinia 进行状态管理，按业务模块划分 Store：

```
stores/
├── index.ts          # Store 入口文件
└── modules/
    ├── useMainStore.ts      # 主要状态
    ├── useShoppingCart.ts   # 购物车状态
    └── useUserStore.ts      # 用户状态
```

### API 设计模式

API 模块化设计：

```
api/
├── base.ts           # 基础 API 类
├── index.ts          # API 入口
└── modules/
    ├── order.ts      # 订单相关 API
    ├── cart.ts       # 购物车相关 API
    └── user.ts       # 用户相关 API
```

API 基类提供统一的请求处理：

```typescript
class BaseApi {
  protected request = new ApiRequestManager();
  protected cache = new ApiCache();
}

class OrderApi extends BaseApi {
  // 订单相关 API 方法
}
```

## 最佳实践

### 1. TypeScript 使用

#### 接口定义
```typescript
// 定义清晰的接口
export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  // ...
}
```

#### 泛型使用
```typescript
// 在 API 调用中使用泛型
const getOrderList = (): Promise<ApiResponse<OrderItem[]>> => {
  // ...
};
```

### 2. 性能优化

#### 虚拟滚动
对于长列表使用虚拟滚动组件：
```vue
<VirtualList
  :items="largeItemList"
  :item-height="100"
  @load-more="loadMoreItems"
/>
```

#### 图片懒加载
```vue
<LazyImage
  :src="imageUrl"
  placeholder="loading-placeholder.png"
  :width="200"
  :height="200"
/>
```

#### API 缓存
```typescript
// 使用内置缓存机制
const cachedResult = await api.getOrderList({ cache: true });
```

### 3. 错误处理

#### 全局错误捕获
```typescript
// 使用全局错误处理器
import { errorHandler } from '@/utils';

try {
  await someOperation();
} catch (error) {
  errorHandler.captureError({
    message: error.message,
    type: 'api'
  });
}
```

#### API 错误处理
```typescript
// API 模块内置错误处理
const result = await orderApi.getOrderList().catch(handleApiError);
```

### 4. 组件通信

#### Props 验证
```typescript
interface Props {
  title: string;
  count?: number;
  items: Array<OrderItem>;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
});
```

#### 事件发射
```typescript
const emit = defineEmits<{
  'update:item': [OrderItem]
  'delete:item': [string]
}>();
```

## 跨平台适配

### 条件编译
使用 uni-app 的条件编译功能处理平台差异：

```html
<!-- #ifdef MP-WEIXIN -->
<!-- 微信小程序特有内容 -->
<!-- #endif -->

<!-- #ifdef H5 -->
<!-- H5 特有内容 -->
<!-- #endif -->
```

### 平台检测
```typescript
import { UNI_PLATFORM } from '@dcloudio/uni-helpers'

if (UNI_PLATFORM === 'mp-weixin') {
  // 微信小程序特定逻辑
}
```

## 代码组织

### 按功能模块组织
- 每个主要功能模块应该有自己的目录
- 相关的 API、组件、Store 放在一起
- 保持模块间的低耦合

### 文件命名规范
- 组件文件：大驼峰命名，如 `OrderCard.vue`
- 工具函数：小驼峰命名，如 `apiHelper.ts`
- 类型定义：小驼峰命名，如 `order.d.ts`
- 样式文件：短横线命名，如 `common.scss`

## 环境配置

### 开发环境
```bash
npm run dev:h5      # H5 开发
npm run dev         # 微信小程序开发
```

### 生产环境
```bash
npm run build:h5    # 构建 H5
npm run build       # 构建微信小程序
```

## 调试技巧

### 使用 vConsole
```typescript
// 在开发环境下启用 vConsole
if (process.env.NODE_ENV === 'development') {
  import('vconsole').then(VConsole => {
    new VConsole.default();
  });
}
```

### 性能监控
```typescript
import { performanceMonitor } from '@/utils';

// 监控函数执行时间
performanceMonitor.measure('load-order-list', () => {
  // 加载订单列表的逻辑
});
```

## 部署说明

### 构建命令
```bash
# 构建不同平台
npm run build               # 默认构建（通常是微信小程序）
npm run build:h5           # 构建 H5
npm run build:app          # 构建 App
npm run build:mp-alipay    # 构建支付宝小程序
```

### 发布流程
1. 确保代码通过所有测试
2. 运行 `npm run lint` 检查代码规范
3. 运行 `npm run type-check` 检查类型错误
4. 执行构建命令
5. 上传构建产物到对应平台

## 维护指南

### 代码审查清单
- [ ] 代码是否遵循项目规范
- [ ] 是否有足够的类型注解
- [ ] 是否有适当的错误处理
- [ ] 是否考虑了性能影响
- [ ] 是否有适当的注释
- [ ] 是否更新了相关文档

### 版本升级
- 升级依赖时注意兼容性
- 测试跨平台功能
- 更新版本号遵循语义化版本规范

---

此开发指南将持续更新，以反映项目最佳实践的变化。