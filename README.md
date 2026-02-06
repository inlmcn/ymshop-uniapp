# ymshop-uniapp - 现代化电商移动应用

一个基于 uni-app 框架构建的现代化电商移动应用，采用 Vue 3、TypeScript 和 Pinia 技术栈，支持多端发布（微信小程序、H5、App等）。

## ✨ 特性

- **现代化技术栈**: Vue 3 + TypeScript + Pinia + Vite
- **跨平台支持**: 一套代码，多端发布
- **性能优化**: 虚拟滚动、图片懒加载、API缓存等
- **类型安全**: 完整的 TypeScript 支持
- **模块化架构**: 清晰的项目结构和组件设计
- **错误监控**: 全局错误捕获和性能监控
- **代码质量**: ESLint + Prettier 保证代码规范

## 🏗️ 项目架构

### 目录结构

```
src/
├── api/              # API 接口管理
│   └── modules/      # 按业务模块划分的 API
├── assets/           # 静态资源
├── components/       # 组件
│   ├── base/         # 基础组件
│   ├── business/     # 业务组件
│   └── common/       # 通用组件
├── composables/      # Vue 3 Composables
├── hooks/            # 自定义 Hooks
├── layouts/          # 页面布局
├── pages/            # 页面组件
├── stores/           # 状态管理 (Pinia)
│   └── modules/      # 按业务模块划分的 Store
├── styles/           # 样式文件
├── utils/            # 工具函数
│   ├── constants/    # 常量定义
│   ├── helpers/      # 辅助函数
│   └── index.ts      # 工具函数统一出口
└── types/            # TypeScript 类型定义
```

### 核心技术栈

- **框架**: [uni-app](https://uniapp.dcloud.io/) (基于 Vue 3)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **语言**: TypeScript / JavaScript
- **UI 框架**: uv-ui (uni-app 组件库)
- **样式**: Sass

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn

### 安装和运行

```bash
# 克隆项目
git clone https://github.com/inlmcn/ymshop-uniapp.git
cd ymshop-uniapp

# 安装依赖
npm install

# 开发模式 - H5
npm run dev:h5

# 开发模式 - 微信小程序
npm run dev:mp-weixin

# 开发模式 - App
npm run dev:app

# 构建 - H5
npm run build:h5

# 构建 - 微信小程序
npm run build:mp-weixin
```

### 代码质量检查

```bash
# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查
npm run lint
```

## 📚 文档

- [重构计划](./RESTRUCTURE_PLAN.md) - 项目的重构历程和规划
- [API 文档](./API_DOCUMENTATION.md) - 详细的 API 接口说明
- [开发指南](./DEVELOPMENT_GUIDE.md) - 项目开发的最佳实践
- [性能优化指南](./PERFORMANCE_GUIDE.md) - 性能优化策略和实现
- [贡献指南](./CONTRIBUTING.md) - 如何为项目做贡献

## 🔧 功能特性详解

### 1. 性能优化

#### 虚拟滚动
- 处理长列表数据，仅渲染可视区域内的元素
- 大幅减少 DOM 节点数量，提升渲染性能

#### 图片懒加载
- 仅在图片进入视口时加载
- 支持 WebP 格式和响应式图像

#### API 缓存与去重
- 智能缓存 API 响应
- 防止相同请求并发发送

### 2. 类型安全

- 完整的 TypeScript 类型定义
- 接口和类型声明文件
- 组件 Props 类型验证

### 3. 错误处理与监控

- 全局错误捕获机制
- API 请求监控
- 性能指标监控
- 用户行为追踪

### 4. 代码质量

- ESLint 代码规范检查
- Prettier 代码格式化
- 统一的组件设计模式
- 模块化状态管理

## 🤝 贡献

我们欢迎各种形式的贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解详细信息。

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

[MIT License](./LICENSE)

## 📞 支持

如果您有任何问题或建议，请通过以下方式联系我们：

- 创建 [Issue](https://github.com/inlmcn/ymshop-uniapp/issues)
- 提交 [Pull Request](https://github.com/inlmcn/ymshop-uniapp/pulls)

---

由 ❤️ 构建，致力于提供最佳的移动电商体验。