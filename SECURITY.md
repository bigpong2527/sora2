# 🔒 安全政策和最佳实践

## 概述

本项目遵循安全的开发实践，确保 API 密钥和敏感信息得到妥善保护。

---

## 密钥管理

### ✅ 安全做法

1. **不在代码中硬编码密钥**
   - API 密钥必须通过用户界面配置
   - 密钥保存在浏览器本地存储中（不上传服务器）

2. **环境变量管理**
   ```bash
   # 使用 .env.local (已在 .gitignore 中)
   VITE_API_KEY=sk-your-key-here
   ```

3. **本地存储保护**
   - 密钥仅保存在浏览器本地存储中
   - 建议在公共设备上使用完毕后清除

### ❌ 禁止行为

- ❌ 不要在源代码中提交 API 密钥
- ❌ 不要在 Git 历史中泄露密钥
- ❌ 不要在文档中提交实际的密钥
- ❌ 不要在日志中记录敏感信息

---

## 密钥暴露处理

如果密钥意外暴露：

1. **立即撤销密钥**
   - 访问 https://dashboard.tu-zi.com
   - 立即撤销暴露的密钥
   - 生成新密钥

2. **检查滥用情况**
   - 查看 API 使用日志
   - 检查是否有异常请求

3. **更新项目**
   ```bash
   # 如果密钥在 Git 历史中，需要完全删除
   git filter-branch --tree-filter 'find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "sk-" | xargs sed -i "s/sk-[a-zA-Z0-9]*/sk-xxx/g"'
   ```

---

## 代码审查检查清单

在提交代码之前，请检查：

- [ ] 没有硬编码的 API 密钥
- [ ] 没有个人访问令牌
- [ ] 没有数据库密码
- [ ] 没有私有证书
- [ ] 环境变量示例使用占位符

---

## 依赖安全

### 安全的依赖

所有依赖都从官方 npm 注册表获取：

```bash
# 检查依赖安全性
npm audit

# 自动修复漏洞
npm audit fix
```

### 依赖版本管理

- 使用 `package-lock.json` 锁定版本
- 定期更新依赖
- 定期运行 `npm audit`

---

## 通信安全

### HTTPS

- 所有 API 调用都使用 HTTPS
- 生产环境必须使用 HTTPS

```typescript
// ✅ 安全的 API 端点
const API_BASE_URL = 'https://api.tu-zi.com/v1';

// ❌ 不安全的 API 端点
const API_BASE_URL = 'http://api.tu-zi.com/v1';
```

### 认证

- 使用 Bearer Token 认证
- 密钥不会在 URL 中传输
- 所有请求都包含授权头

```typescript
headers: {
  'Authorization': `Bearer ${apiKey}`
}
```

---

## Git 钩子

项目包含 pre-commit 钩子来防止提交敏感信息：

```bash
# 自动运行检查
# 尝试提交包含 sk-* 的代码时会被阻止
git commit -m "message"
```

### 绕过钩子（不推荐）

```bash
# ⚠️ 仅在必要时使用
git commit --no-verify
```

---

## 环境变量配置

### 本地开发

创建 `.env.local` 文件：

```env
# .env.local (不提交到 Git)
VITE_API_BASE_URL=https://api.tu-zi.com/v1
VITE_POLLING_INTERVAL=10000
```

### 生产部署

使用环境变量或 CI/CD 密钥管理系统：

```bash
# Docker 环境变量
docker run -e VITE_API_KEY=sk-xxx sora-generator

# CI/CD 密钥
export VITE_API_KEY=${{ secrets.API_KEY }}
```

---

## 安全性报告

如果发现安全漏洞，请：

1. **不要** 在 Issue 中公开讨论
2. 邮件报告给维护者
3. 提供漏洞的详细信息和重现步骤
4. 等待修复后再公开

---

## 浏览器安全

### 本地存储安全

虽然本地存储提供基本隔离，但仍需注意：

- 同一域名下的任何脚本都可以访问本地存储
- 不要在公共计算机上保存密钥
- 建议使用密钥后清除本地存储

**清除本地存储的方法:**

```javascript
// 浏览器控制台
localStorage.removeItem('sora_api_key');
localStorage.removeItem('sora_tasks');

// 或完全清除
localStorage.clear();
```

### XSS 防护

项目使用 React 的安全机制：

- ✅ 自动转义用户输入
- ✅ 使用安全的 DOM API
- ✅ 没有 `dangerouslySetInnerHTML`

---

## 更新日志

### 已实施的安全措施

- [x] API 密钥不硬编码
- [x] HTTPS 通信
- [x] Pre-commit 钩子
- [x] `.gitignore` 配置
- [x] 环境变量支持
- [x] XSS 防护

### 未来计划

- [ ] CORS 政策优化
- [ ] Content Security Policy (CSP)
- [ ] Subresource Integrity (SRI)
- [ ] 加密本地存储

---

## 相关资源

- [OWASP 安全编码实践](https://cheatsheetseries.owasp.org/)
- [npm 安全最佳实践](https://docs.npmjs.com/about/security)
- [Node.js 安全建议](https://nodejs.org/en/docs/guides/security/)

---

## 问题和建议

如有安全相关问题，请通过以下方式联系：

- 📧 邮件报告
- 🔒 保密讨论

感谢你帮助我们保持项目的安全！
