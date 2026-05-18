# 0号树洞 - Tree App

> 一个极简黑白风格的情感树洞App

## 📱 功能特点

- 今日运势（基于生日的星座运势）
- 恋爱助手（提供聊天回复建议）
- 情感陪伴（虚拟角色对话）
- 情感树洞（匿名倾诉，离开即清空）
- 塔罗世界（塔罗牌占卜与图鉴）
- 个人中心（信息编辑与数据管理）
- 会员系统（免费版与会员版）

## 🎨 设计风格

- **主色调**：极简黑白灰
- **仅有的彩色**：功能图标点缀少量色彩
- **整体风格**：简约、高级、素雅

## 🛠️ 技术栈

- **框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **状态管理**：Pinia + 持久化存储
- **路由**：Vue Router
- **移动端**：Capacitor

## 📂 项目结构

```
tree-app/
├── src/
│   ├── assets/          # 资源文件
│   ├── components/      # 组件
│   ├── router/          # 路由配置
│   │   └── index.ts
│   ├── stores/          # Pinia 状态管理
│   │   ├── user.ts      # 用户信息
│   │   └── tarot.ts     # 塔罗牌数据
│   ├── views/           # 页面组件
│   │   ├── SplashView.vue            # 闪屏页
│   │   ├── RegisterView.vue          # 注册页
│   │   ├── HomeView.vue              # 首页
│   │   ├── FortuneView.vue           # 今日运势
│   │   ├── LoveAssistantView.vue     # 恋爱助手
│   │   ├── EmotionCompanionView.vue  # 情感陪伴
│   │   ├── TreeHoleView.vue          # 情感树洞
│   │   ├── TarotView.vue             # 塔罗世界
│   │   ├── TarotDetailView.vue       # 塔罗牌详情
│   │   ├── ProfileView.vue           # 个人中心
│   │   └── PaymentView.vue           # 付费提醒
│   ├── App.vue         # 根组件
│   ├── main.ts         # 入口文件
│   └── style.css       # 全局样式（Tailwind）
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd tree-app
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问：http://localhost:5173/

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出在 `dist/` 目录

### 4. 预览生产版本

```bash
npm run preview
```

## 📱 Capacitor 移动端开发（可选）

### 初始化 Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "0号树洞" com.tree.app
```

### 添加平台

```bash
# iOS
npm install @capacitor/ios
npx cap add ios

# Android
npm install @capacitor/android
npx cap add android
```

### 同步项目

```bash
npx cap sync
```

## 📦 主要依赖说明

- `vue` - Vue 3 框架
- `vue-router` - 路由管理
- `pinia` - 状态管理
- `pinia-plugin-persistedstate` - Pinia 持久化
- `tailwindcss` / `autoprefixer` / `postcss` - 样式工具
- `@capacitor/*` - 移动端支持

## 🎯 使用指南

### 首次使用

1. 打开 App，进入闪屏页
2. 点击「进入聊聊」，填写注册信息
3. 进入首页，开始使用各项功能

### 功能导航

- **首页**：今日运势卡片 + 四个功能入口
- **个人中心**：右上角头像图标
- **返回**：各页面左上角均有返回按钮

## 📝 注意事项

1. 所有数据本地存储，刷新页面数据不会丢失
2. 情感树洞消息离开即清空，不会保存
3. 塔罗牌结果仅供娱乐参考，不构成决策建议

## 🔧 自定义配置

### 修改端口

编辑 `vite.config.ts`：
```typescript
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000 // 修改为你想要的端口
  }
})
```

### Tailwind 主题定制

编辑 `tailwind.config.js` 扩展主题配置。

## 📄 License

MIT License
