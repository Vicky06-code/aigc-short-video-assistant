# 基于 AIGC 的智能短视频内容创作辅助系统

这是一个课程大作业 MVP 项目，目标是在 8 天内完成可运行、可展示、可部署的智能短视频创作辅助系统。

## 技术栈

- 前端：Vue3 + Vite + Element Plus + Axios
- 后端：Node.js + Express
- 数据库：MySQL
- 鉴权：JWT
- AIGC：当前使用规则模板模拟生成，后续可替换为 DeepSeek/OpenAI API

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

## 已完成阶段

### 第一阶段：项目骨架

- 前端 Vite + Vue3 + Element Plus 基础工程
- 后端 Express 基础工程
- MySQL 初始化 SQL
- README 运行说明

### 第二阶段：用户认证

- 用户注册：用户名唯一、邮箱唯一、bcrypt 加密密码
- 用户登录：邮箱 + 密码登录，成功后返回 7 天有效期 JWT
- JWT 中间件：统一校验 `Authorization: Bearer <token>`
- 当前用户接口：`GET /api/auth/profile`
- 统一错误处理：返回 `{ success: false, message }`
- 前端登录页、注册页、路由守卫、Axios 封装

### 第三阶段：AIGC 创作生成

- 新增接口：`POST /api/creation/generate`
- 接口必须登录后访问
- 新增 `server/services/creationService.js`
- 新增 `server/utils/templateGenerator.js`
- 规则模板生成 5 个标题、口播文案、分镜脚本、标签、发布建议
- 按时长控制脚本长度和分镜数量：15 秒 3 个、30 秒 5 个、60 秒 7 个
- 按平台输出差异化发布建议
- 新增前端创作页：`client/src/views/Create.vue`
- 使用 Element Plus 表单、卡片、表格和标签展示结果

### 第四阶段：完整前端界面

- 新增统一后台布局：`client/src/layouts/MainLayout.vue`
- 新增工作台页面：`client/src/views/Dashboard.vue`
- 完善智能创作页、历史记录页和个人中心页
- 登录页和注册页接入 Element Plus 表单校验
- 新增可复用结果展示组件：`ResultCard`、`StoryboardTable`、`TagList`
- 登录后使用顶部栏 + 左侧菜单 + 内容区布局
- Axios 统一处理 token 携带、401 清理登录态和错误提示
- 全局样式升级为蓝紫渐变、卡片化后台风格

### 第五阶段：创作记录管理

- 生成结果可保存到 MySQL，不再依赖 LocalStorage
- 新增 `server/services/historyService.js`
- 新增保存、历史列表、详情、删除、清空全部历史记录接口
- 历史记录页支持搜索、平台筛选、风格筛选和时间排序
- 历史详情使用 Drawer 展示标题、口播、分镜、标签和发布建议
- 创作页生成后可点击“保存创作方案”
- 个人中心展示累计生成次数、最近生成时间、历史记录数量

## 数据库初始化

先在 MySQL 中执行：

```bash
mysql -u root -p < database/init.sql
```

如果你的 MySQL 用户名、密码或端口不同，请同步修改后端 `.env`。

第五阶段更新了 `creations` 表字段。如果本地已经初始化过旧表，可以在开发环境中删除旧库后重新执行 `database/init.sql`：

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

### 历史记录预留接口

以下接口同样需要 JWT：

- `POST /api/creation/save`：保存创作方案
- `GET /api/creation/history`：查询当前用户历史记录
- `GET /api/creation/detail/:id`：查询单条完整记录
- `DELETE /api/creation/:id`：删除单条记录
- `DELETE /api/creation/all`：清空当前用户全部历史记录

### 保存创作方案

```text
POST /api/creation/save
Authorization: Bearer <token>
```

请求体：

```json
{
  "topic": "大学生如何提高学习效率",
  "platform": "抖音",
  "style": "知识科普",
  "duration": 30,
  "audience": "大学生",
  "titles": [],
  "speechScript": "",
  "storyboard": [],
  "tags": [],
  "publishAdvice": {}
}
```

成功返回：

```json
{
  "success": true,
  "message": "保存成功",
  "data": {
    "id": 1
  }
}
```

## 前端使用

登录成功后会进入创作页，也可以直接访问：

```text
http://localhost:5173/create
```

页面支持：

- 输入视频主题、平台、风格、时长、目标受众
- 点击按钮生成创作方案
- 分模块展示标题推荐、口播文案、分镜脚本、标签和发布建议
- 分镜脚本使用 Element Plus 表格展示

## 前端路由

- `/login`：登录页，不使用后台布局
- `/register`：注册页，不使用后台布局
- `/`：默认重定向到 `/dashboard`
- `/dashboard`：工作台
- `/create`：智能创作
- `/history`：历史记录
- `/profile`：个人中心

## AIGC 替换说明

当前生成入口位于：

```text
server/services/creationService.js
server/utils/templateGenerator.js
```

后续接入真实 DeepSeek/OpenAI API 时，建议保留 `generateCreationPlan` 作为统一入口，在 service 层内部替换为真实 API 调用，并保持返回字段结构不变。
