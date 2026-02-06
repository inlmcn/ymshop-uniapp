# 贡献指南

欢迎为 ymshop-uniapp 项目做出贡献！以下是参与项目开发的指南。

## 开发环境设置

1. 克隆项目到本地：
```bash
git clone https://github.com/inlmcn/ymshop-uniapp.git
cd ymshop-uniapp
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器（H5）：
```bash
npm run dev:h5
```

4. 启动微信小程序开发：
```bash
npm run dev
```

## 技术栈

- **框架**: uni-app (基于 Vue 3)
- **状态管理**: Pinia
- **构建工具**: Vite
- **语言**: TypeScript / JavaScript
- **样式**: Sass
- **组件库**: uv-ui (uni-app 组件库)

## 代码规范

### Git 提交规范

请遵循约定式提交规范 (Conventional Commits)：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动

示例：
```
feat: 添加商品搜索功能
fix: 修复订单列表加载错误
docs: 更新 API 文档
```

### 代码规范

- 使用 TypeScript 编写类型安全的代码
- 组件采用单文件组件 (SFC) 格式
- 遵循 Vue 3 Composition API 模式
- 使用 ESLint 和 Prettier 保持代码风格一致

## 项目结构

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

## 开发流程

### 添加新功能

1. 从 `main` 分支创建新功能分支：
```bash
git checkout -b feature/your-feature-name
```

2. 编写代码并添加必要的测试

3. 提交更改：
```bash
git add .
git commit -m "feat: 添加你的功能描述"
```

4. 推送到远程仓库：
```bash
git push origin feature/your-feature-name
```

5. 在 GitHub 上创建 Pull Request

### 修复 Bug

1. 从 `main` 分支创建修复分支：
```bash
git checkout -b fix/bug-description
```

2. 修复问题并添加测试（如果适用）

3. 提交更改：
```bash
git add .
git commit -m "fix: 修复问题描述"
```

4. 推送到远程仓库并创建 Pull Request

## 测试

运行单元测试：
```bash
npm run test
```

运行带覆盖率报告的测试：
```bash
npm run coverage
```

## 代码审查

- 所有 Pull Request 都需要至少一位维护者审查
- 请确保代码符合项目规范
- 添加适当的注释和文档
- 确保测试通过

## 问题报告

如果发现 bug 或有功能建议，请在 GitHub Issues 中提交：

1. 搜索现有 Issue，避免重复提交
2. 提供详细的复现步骤
3. 描述期望结果和实际结果
4. 提供相关环境信息（浏览器、设备、操作系统等）

## 联系方式

如有疑问，请在 GitHub Issues 中提出或联系项目维护者。

感谢您对项目的贡献！