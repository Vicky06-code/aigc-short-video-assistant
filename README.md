# 基于 AIGC 的智能短视频内容创作辅助系统

这是一个课程大作业 MVP 项目骨架，目标是在 8 天内完成可运行、可展示、可部署的智能短视频创作辅助系统。

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
│   ├── utils/
│   ├── app.js
│   ├── db.js
│   ├── package.json
│   └── .env.example
├── database/
│   └── init.sql
└── README.md
```

## 已完成功能骨架

- 用户注册、登录接口
- JWT 鉴权中间件
- 创作方案生成接口
- 创作历史列表、详情、删除接口
- 规则模板版 AIGC 生成器
- Vue 前端登录、注册、创作台、历史记录、详情页面
- 复制结果、导出 TXT、导出 JSON 的前端能力
- MySQL 初始化 SQL

## 环境要求

- Node.js 18 或更高版本
- MySQL 8 或兼容版本
- npm

## 数据库初始化

先在 MySQL 中执行：

```bash
mysql -u root -p < database/init.sql
```

如果你的 MySQL 用户名、密码或端口不同，请后续同步修改后端 `.env`。

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

## API 概览

### 用户模块

- `POST /api/auth/register`：用户注册
- `POST /api/auth/login`：用户登录，返回 JWT

### 创作模块

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

后续接入真实大模型 API 时，建议保留 `generateVideoPlan` 作为统一入口，在该函数内部替换为 API 调用，并保持返回字段结构不变，前端和数据库即可少改或不改。

## 第 1 阶段完成情况

已完成完整项目骨架、基础页面、后端接口分层、数据库 SQL 和运行文档。下一阶段建议开始安装依赖并联调注册、登录、生成、历史记录全流程。
