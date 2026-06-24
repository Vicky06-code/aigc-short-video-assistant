# 基于 AIGC 的智能短视频内容创作辅助系统

这是一个课程大作业 MVP 项目，目标是在 8 天内完成可运行、可展示、可部署的智能短视频创作辅助系统。

## 技术栈

- 前端：Vue3 + Vite + Element Plus + Axios
- 后端：Node.js + Express
- 数据库：MySQL
- 鉴权：JWT
- AIGC：当前使用规则模板模拟生成，后续可替换为真实大模型 API

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
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   ├── app.js
│   ├── db.js
│   ├── package.json
│   └── .env.example
├── database/
│   └── init.sql
└── README.md
```

## 第二阶段完成内容

- 用户注册：用户名唯一、邮箱唯一、bcrypt 加密密码
- 用户登录：邮箱 + 密码登录，成功后返回 7 天有效期 JWT
- JWT 中间件：统一校验 `Authorization: Bearer <token>`
- 当前用户接口：`GET /api/auth/profile`
- 统一错误处理：返回 `{ success: false, message }`
- 前端登录页：`client/src/views/Login.vue`
- 前端注册页：`client/src/views/Register.vue`
- Axios 封装：`client/src/utils/request.js`
- 路由守卫：未登录访问系统主页自动跳转登录页
- localStorage 保存 `token` 和用户信息

## 数据库初始化

先在 MySQL 中执行：

```bash
mysql -u root -p < database/init.sql
```

`users` 表字段：

- `id`
- `username`
- `email`
- `password`
- `created_at`

如果你的 MySQL 用户名、密码或端口不同，请同步修改后端 `.env`。

## 后端运行

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

后端默认运行在：

```text
http://localhost:3000
```

健康检查：

```text
GET http://localhost:3000/api/health
```

## 前端运行

另开一个终端：

```bash
cd client
npm install
npm run dev
```

前端默认运行在：

```text
http://localhost:5173
```

Vite 已配置 `/api` 代理到 `http://localhost:3000`。

## 认证 API

### 注册

```text
POST /api/auth/register
```

请求体：

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

请求体：

```json
{
  "email": "demo@example.com",
  "password": "123456"
}
```

成功返回：

```json
{
  "success": true,
  "token": "...",
  "user": {
    "id": 1,
    "username": "demo",
    "email": "demo@example.com"
  }
}
```

### 当前用户

```text
GET /api/auth/profile
Authorization: Bearer <token>
```

错误返回统一格式：

```json
{
  "success": false,
  "message": "错误信息"
}
```

## 创作 API

以下接口需要请求头：

```text
Authorization: Bearer <token>
```

- `POST /api/creations/generate`：生成并保存创作方案
- `GET /api/creations`：查询历史记录
- `GET /api/creations/:id`：查询详情
- `DELETE /api/creations/:id`：删除记录

## AIGC 替换说明

当前生成逻辑位于：

```text
server/utils/aigcGenerator.js
```

后续接入真实大模型 API 时，建议保留 `generateVideoPlan` 作为统一入口，在该函数内部替换为 API 调用，并保持返回字段结构不变。
