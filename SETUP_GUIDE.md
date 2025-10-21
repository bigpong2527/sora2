# 完整设置指南

## 🎯 5分钟快速设置

### 1. 克隆或进入项目
```bash
cd /Users/pengwu/Downloads/sora
```

### 2. 安装依赖 (3分钟)
```bash
npm install
```

### 3. 启动服务器 (30秒)
```bash
npm run dev
```

### 4. 获取API密钥 (1分钟)
- 访问: https://dashboard.tu-zi.com
- 复制你的 API Key (格式: `sk-xxx...`)

### 5. 配置应用 (30秒)
- 点击 "配置" 按钮
- 粘贴 API 密钥
- 点击 "保存"

**完成！现在可以生成视频了。**

---

## 📋 详细步骤

### 步骤 1: 环境检查

确保已安装：
- Node.js 18+
  ```bash
  node --version  # 应该是 v18.0.0 或更高
  ```
- npm 9+
  ```bash
  npm --version   # 应该是 9.0.0 或更高
  ```

### 步骤 2: 依赖安装

```bash
npm install
```

这将安装：
- React 18 (UI框架)
- TypeScript (类型安全)
- Tailwind CSS (样式)
- Lucide React (图标)
- Axios (HTTP客户端)
- Vite (构建工具)

**预计时间**: 2-5分钟（取决于网络速度）

### 步骤 3: 开发环境启动

```bash
npm run dev
```

输出应该如下：
```
> sora-2-generator@1.0.0 dev
> vite

  VITE v5.4.21  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

浏览器会自动打开 http://localhost:3000

### 步骤 4: API密钥获取

访问 https://dashboard.tu-zi.com：

1. 登录你的账户
2. 进入 "API密钥" 或 "Settings"
3. 找到 API Key (通常在你的profile中)
4. 复制完整的密钥 (通常格式: `sk-xxxxxxxxxxxx`)

### 步骤 5: 应用配置

1. 打开浏览器中的应用 (http://localhost:3000)
2. 点击右上角 **蓝色的"配置"按钮**
3. 在弹出的模态框中：
   - 找到 "Tu-Zi API密钥" 输入框
   - 粘贴你的 API 密钥
   - 可选：点击 "显示" 验证密钥是否正确
   - 点击 **"保存"** 按钮
4. 确认看到绿色 "✓ 密钥已保存" 提示
5. 点击 "关闭"

完成后，页面顶部应显示：`API密钥已设置`

---

## 🎬 首次生成视频

### 步骤 1: 准备提示词

在左侧的 "视频生成" 区域输入提示词。

**优质提示词示例**:
```
A cinematic close-up of a golden retriever puppy playing
with a red ball in a sunny meadow, with wildflowers in
the background. The camera slowly pans to show mountains
in the distance. Warm, golden hour lighting.
```

**提示词小贴士**:
- 越详细越好（200字以上最佳）
- 描述场景、角色、光线、情感
- 用英文通常效果更好
- 避免否定词（如"不要"）
- 具体描述而不是抽象概念

### 步骤 2: (可选) 上传参考图

如果你有参考图片：
1. 在 "参考图 (可选)" 区域点击上传
2. 选择 PNG、JPEG 或 WebP 格式的图片
3. 看到预览后即可（会自动上传）

### 步骤 3: 选择视频模型

选择生成时长：
- **Sora-2** (15秒): 标准版本，快速生成
- **Sora-2 Pro** (25秒): 专业版本，更长的视频

### 步骤 4: 生成

点击蓝色的 **"生成视频"** 按钮

**界面变化**:
- 按钮会变成 "提交中..." 并禁用
- 右下方会显示 "任务历史" 卡片
- 实时显示生成进度

### 步骤 5: 等待完成

监控信息显示：
- **任务ID**: 唯一标识符
- **状态**: 待处理 → 处理中 → 已完成
- **进度**: 0% → 100%

**预计等待时间**:
- 取决于模型和API服务负载
- 通常 1-10 分钟

### 步骤 6: 查看和下载

完成后：
1. 视频会在任务卡片中显示
2. 点击视频预览播放
3. 点击 **"下载视频"** 按钮
4. 视频保存到你的下载文件夹

---

## 💰 查询额度

随时检查你的API使用额度：

1. 点击右上角 **绿色的"额度"** 按钮
2. 弹出框显示：
   - 总额度 (USD): 你的账户总限额
   - 已使用 (USD): 已消耗的额度
   - 剩余额度 (USD): 可用的额度
   - 使用率百分比: 进度条显示

**额度用尽时**:
- 应用会拒绝新的生成请求
- 需要升级账户或等待额度重置
- 检查 Tu-Zi Dashboard 的计费设置

---

## 🔄 任务恢复

**自动功能，无需手动操作**

应用会自动：
1. 检测未完成的任务
2. 恢复轮询过程
3. 继续获取最新状态
4. 最终显示结果

### 手动查看历史

所有任务都保存在历史中：
- 任务ID (可复制)
- 生成时间戳
- 当前状态
- 生成进度
- 视频预览和下载链接

---

## ⚙️ 高级配置

### 环境变量

创建 `.env.local` 文件 (可选)：

```env
# 本地开发环境变量
VITE_API_BASE_URL=https://api.tu-zi.com/v1
VITE_POLLING_INTERVAL=10000
VITE_POLLING_TIMEOUT=1200000
```

### 修改轮询间隔

编辑 `src/services/taskQueue.ts`:

```typescript
const POLLING_INTERVAL = 10000;  // 改成你想要的毫秒数
const POLLING_TIMEOUT = 20 * 60 * 1000;  // 轮询超时时间
```

---

## 🚀 生产部署

### 构建生产版本

```bash
npm run build
```

输出：
```
dist/
├── index.html (0.38 kB)
├── assets/
│   ├── index-xxxxx.css (16.72 kB)
│   └── index-xxxxx.js (204.34 kB)
```

### 本地预览

```bash
npm run preview
```

### 部署到 Vercel (推荐)

```bash
npm install -g vercel
vercel
```

按照提示完成部署。

### 部署到 Docker

```bash
docker build -t sora-generator .
docker run -p 3000:3000 sora-generator
```

---

## 🐛 常见问题解决

### Q1: 密钥保存后页面仍显示未设置

**A**:
- 确保密钥不为空且格式正确
- 刷新页面重试
- 检查浏览器是否允许本地存储
- 清除浏览器缓存后重试

### Q2: 生成失败显示"任务未找到"

**A**:
- API密钥可能已过期
- 任务可能已在API端过期（超过24小时）
- 尝试重新生成

### Q3: 页面显示"提交任务失败"

**A**:
- 检查网络连接
- 确认API密钥有效
- 查看浏览器控制台 (F12) 的错误信息
- 确认账户有足够余额

### Q4: 为什么有时生成特别慢

**A**:
- API服务负载高峰期
- 复杂的提示词需要更多处理时间
- 网络延迟

### Q5: 如何清除所有数据

**A**:
- 打开开发者工具 (F12)
- 进入 Application → Local Storage
- 找到此域名
- 删除 `sora_api_key` 和 `sora_tasks`

---

## 📞 获取帮助

### 获取更多支持
1. 查看 [README.md](./README.md)
2. 查看 [PROJECT_COMPLETION.md](./PROJECT_COMPLETION.md)
3. 访问 [Tu-Zi API文档](https://docs.tu-zi.com)
4. 检查浏览器控制台错误信息

### 检查日志

打开浏览器开发者工具 (F12)：
- Console: 查看所有日志和错误
- Network: 查看API请求
- Storage: 查看本地存储数据

---

## ✅ 设置完成检查清单

- [ ] Node.js 18+ 已安装
- [ ] npm 9+ 已安装
- [ ] 依赖已安装 (`npm install`)
- [ ] 开发服务器正在运行 (`npm run dev`)
- [ ] 浏览器可访问 http://localhost:3000
- [ ] API密钥已获取
- [ ] 密钥已保存到应用
- [ ] 可以查询额度
- [ ] 成功生成过一个视频

**全部完成后，你的应用已完全就绪！** 🎉
