# Sora-2 视频生成器

一个现代化的Sora-2视频生成应用，提供流畅的用户体验和稳定的功能。

## 🎯 核心特性

- **两种模型选择**: Sora-2 (15秒) 和 Sora-2 Pro (25秒)
- **智能任务队列**: 自动轮询未完成任务，支持后台恢复
- **浏览器存储**: 自动保存API密钥和任务记录
- **额度查询**: 实时查询API使用额度
- **参考图支持**: 可上传参考图像作为生成条件
- **任务历史**: 完整的任务历史记录和下载
- **现代化UI**: 简洁优雅的界面设计，移动端友好

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:3000` 打开

### 生产构建

```bash
npm run build
npm run preview
```

## 📋 配置

1. 获取API密钥
   - 访问 [Tu-Zi Dashboard](https://dashboard.tu-zi.com)
   - 获取您的API密钥

2. 在应用中配置
   - 点击顶部右角的"配置"按钮
   - 粘贴您的API密钥
   - 点击"保存"

密钥将被安全地保存在浏览器的本地存储中。

## 💡 使用指南

### 生成视频

1. 输入视频提示词 (Prompt)
   - 越详细的提示词，生成效果越好
   - 例如：`A cinematic shot of a golden retriever puppy playing in a field of flowers`

2. (可选) 上传参考图
   - 点击上传区域或拖拽图片
   - 支持 PNG、JPEG、WebP 格式

3. 选择视频模型
   - **Sora-2**: 标准版本，15秒视频
   - **Sora-2 Pro**: 专业版本，25秒视频

4. 点击"生成视频"
   - 应用将提交任务
   - 自动开始轮询任务状态
   - 实时显示生成进度

### 查询额度

1. 点击顶部右角的"额度"按钮
2. 查看：
   - 总额度 (USD)
   - 已使用额度 (USD)
   - 剩余额度 (USD)
   - 使用率百分比

### 任务管理

- **任务列表**: 显示所有任务及其状态
  - 待处理 (Pending)
  - 处理中 (Processing)
  - 已完成 (Completed)
  - 已失败 (Failed)

- **进度跟踪**: 实时显示生成进度
- **视频预览**: 完成后直接预览视频
- **下载视频**: 一键下载生成的视频

## 🔄 自动轮询机制

- 应用自动轮询尚未完成的任务，间隔10秒
- 轮询超时设置为20分钟
- 刷新页面后自动恢复未完成的任务
- 任务信息持久化保存在浏览器

## 🛠 技术栈

- **前端框架**: React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: Lucide React
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **API**: Tu-Zi API

## 📦 项目结构

```
src/
├── components/           # React 组件
│   ├── ConfigModal.tsx   # API配置模态框
│   ├── BalanceChecker.tsx # 额度查询
│   ├── VideoGenerator.tsx # 视频生成表单
│   └── TaskList.tsx      # 任务列表
├── services/             # 业务逻辑
│   ├── api.ts            # API客户端
│   ├── storage.ts        # 浏览器存储
│   └── taskQueue.ts      # 任务队列管理
├── App.tsx               # 主应用组件
├── main.tsx              # 应用入口
└── index.css             # 全局样式

```

## 🔐 安全性

- API密钥保存在浏览器本地存储（未上传到服务器）
- 建议在公共设备上使用后清除密钥
- 密钥在模态框中可以隐藏显示

## 🐛 常见问题

### Q: 为什么任务显示"已失败"？
A: 可能原因：
- API密钥无效或已过期
- 提示词包含不适当内容
- 账户余额不足
- API服务暂时不可用

### Q: 页面刷新后任务还会继续吗？
A: 是的，应用会自动恢复并继续轮询未完成的任务。

### Q: 如何删除本地存储的数据？
A: 在浏览器开发者工具中：
- 打开 DevTools (F12)
- 进入 Application → Local Storage
- 找到此域名并删除 `sora_api_key` 和 `sora_tasks`

## 📈 性能优化

- 任务列表限制为100条（超出自动删除最旧任务）
- 样式预生成，无运行时编译
- 使用React.memo优化组件渲染
- 异步加载和轮询

## 🚢 部署

### Vercel (推荐)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📝 许可证

MIT

## 👨‍💻 贡献

欢迎提交Issue和Pull Request！

## 📞 支持

如有问题，请：
1. 检查 API 密钥是否正确
2. 确保网络连接正常
3. 查看浏览器控制台的错误信息
4. 访问 [Tu-Zi API文档](https://docs.tu-zi.com)
