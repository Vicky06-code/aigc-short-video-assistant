# 基于 AIGC 的智能短视频内容创作辅助系统

这是一个课程大作业 MVP 项目，目标是在 8 天内完成可运行、可展示、可部署的智能短视频创作辅助系统。

## 技术栈

- 前端：Vue3 + Vite + Element Plus + Axios
- 后端：Node.js + Express
- 数据库：MySQL
- 鉴权：JWT
- AIGC：模板规则生成 + DeepSeek API AI 生成

## 已完成阶段

- 第一阶段：项目骨架
- 第二阶段：用户注册、登录、JWT 鉴权
- 第三阶段：规则模板版 AIGC 创作生成
- 第四阶段：完整后台式前端界面
- 第五阶段：创作历史记录持久化到 MySQL
- 第六阶段：真实 AI API + 模板兜底双模式生成

## 目录结构

```text
aigc-short-video-assistant/
├── client/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   ├── db.js
│   ├── package.json
│   └── .env.example
├── database/
│   └── init.sql
└── README.md
```

## 环境变量

复制后端环境变量示例：

```bash
cd server
cp .env.example .env
```

`.env.example` 示例：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=aigc_short_video
JWT_SECRET=please_change_this_secret
JWT_EXPIRES_IN=7d

AI_PROVIDER=deepseek
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
GENERATION_MODE=template
```

安全说明：

- 真实 API Key 只能写在 `server/.env`
- `.env` 已加入 `.gitignore`
- 不要把真实 API Key 提交到 GitHub

## 生成模式

### 模板模式

```env
GENERATION_MODE=template
```

特点：

- 不依赖网络
- 不需要 API Key
- 生成稳定
- 适合答辩现场兜底演示

### AI 模式

```env
GENERATION_MODE=ai
AI_PROVIDER=deepseek
AI_API_KEY=你的 DeepSeek API Key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
```

特点：

- 调用 DeepSeek 真实大模型 API
- 输出更自然
- 如果 API Key 缺失、接口失败或 JSON 解析失败，会自动回退模板模式

答辩建议：

- 平时开发和录屏可以使用 AI 模式
- 答辩现场建议保留模板模式作为兜底

## 数据库初始化

```bash
mysql -u root -p < database/init.sql
```

如果本地已经初始化过旧表，开发环境可以删除旧库后重建：

```sql
DROP DATABASE aigc_short_video;
```

然后重新执行：

```bash
mysql -u root -p < database/init.sql
```

## 后端运行

```bash
cd server
npm install
npm start
```

后端默认地址：

```text
http://localhost:3000
```

## 前端运行

```bash
cd client
npm install
npm run dev
```

前端默认地址：

```text
http://localhost:5173
```

## 认证 API

### 注册

```text
POST /api/auth/register
```

```json
{
  "username": "demo",
  "email": "demo@example.com",
  "password": "123456"
}
```

### 登录

```text
POST /api/auth/login
```

```json
{
  "email": "demo@example.com",
  "password": "123456"
}
```

### 当前用户

```text
GET /api/auth/profile
Authorization: Bearer <token>
```

## 创作生成 API

### 生成创作方案

```text
POST /api/creation/generate
Authorization: Bearer <token>
```

请求体：

```json
{
  "topic": "大学生如何提高学习效率",
  "platform": "抖音",
  "style": "知识科普",
  "duration": 30,
  "audience": "大学生"
}
```

成功返回：

```json
{
  "success": true,
  "generationMode": "template",
  "data": {
    "titles": [],
    "selectedTitle": "",
    "speechScript": "",
    "storyboard": [],
    "tags": [],
    "publishAdvice": {
      "bestTime": "",
      "coverText": "",
      "interactionGuide": "",
      "platformAdvice": ""
    }
  }
}
```

`generationMode` 可选值：

- `template`：模板规则生成
- `ai`：AI 智能生成
- `fallback_template`：AI 调用失败，已自动切换为模板生成

## 历史记录 API

以下接口都需要 JWT：

- `POST /api/creation/save`：保存创作方案
- `GET /api/creation/history`：查询当前用户历史记录
- `GET /api/creation/detail/:id`：查询单条完整记录
- `DELETE /api/creation/:id`：删除单条记录
- `DELETE /api/creation/all`：清空当前用户全部历史记录

## 前端路由

- `/login`：登录页
- `/register`：注册页
- `/dashboard`：工作台
- `/create`：智能创作
- `/history`：历史记录
- `/profile`：个人中心

## AI 接入说明

AI 相关代码位于：

```text
server/services/aiService.js
server/services/creationService.js
server/utils/promptBuilder.js
```

模板兜底生成位于：

```text
server/utils/templateGenerator.js
```

后续扩展 OpenAI 时，可以在 `aiService.js` 中根据 `AI_PROVIDER` 增加新的 provider 分支，保持 `generateCreationPlan` 返回结构不变即可。
