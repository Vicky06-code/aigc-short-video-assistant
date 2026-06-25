# 基于 AIGC 的智能短视频内容创作辅助系统

这是一个课程大作业 MVP 项目，目标是在 8 天内完成可运行、可展示、可部署的智能短视频创作辅助系统。

## 技术栈

- 前端：Vue3 + Vite + Element Plus + Axios + Vue Router
- 后端：Node.js + Express
- 数据库：MySQL
- 鉴权：JWT
- AIGC：规则模板生成 + DeepSeek API AI 生成

## 已完成阶段

- 第一阶段：项目骨架
- 第二阶段：用户注册、登录、JWT 鉴权
- 第三阶段：规则模板版 AIGC 创作生成
- 第四阶段：完整后台式前端界面
- 第五阶段：创作历史记录持久化到 MySQL
- 第六阶段：真实 AI API + 模板兜底双模式生成
- 第七阶段：系统体验优化、安全优化、日志、部署准备、课程演示模式

## 目录结构

```text
aigc-short-video-assistant/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── router/
│   │   ├── styles/
│   │   ├── utils/
│   │   └── views/
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
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

后端启动前需要创建 `.env`：

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

主要数据表：

- `users`：用户表，保存用户名、邮箱、bcrypt 加密密码
- `creations`：创作记录表，保存标题、口播、分镜、标签、发布建议和生成模式

## 后端运行

```bash
cd server
npm install
npm start
```

默认地址：

```text
http://localhost:3000
```

## 前端运行

```bash
cd client
npm install
npm run dev
```

默认地址：

```text
http://localhost:5173
```

前端 Vite 已配置代理，页面请求 `/api` 会转发到后端 `http://localhost:3000`。

## 生成模式

模板模式：

```env
GENERATION_MODE=template
```

特点：

- 不依赖网络
- 不需要 API Key
- 生成稳定
- 适合答辩现场兜底演示

AI 模式：

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
- 如果 API Key 缺失、接口失败或 JSON 解析失败，会自动回退到模板模式

答辩建议：

- 平时录屏和演示可使用 AI 模式
- 答辩现场建议保留模板模式作为兜底
- 工作台点击“课程演示”会自动填充示例并跳转生成

## 主要 API

认证接口：

- `POST /api/auth/register`：注册
- `POST /api/auth/login`：登录
- `GET /api/auth/profile`：当前用户
- `PUT /api/auth/profile`：修改用户名
- `PUT /api/auth/password`：修改密码

创作接口：

- `POST /api/creation/generate`：生成创作方案
- `POST /api/creation/save`：保存创作方案
- `GET /api/creation/history`：查询当前用户历史记录
- `GET /api/creation/detail/:id`：查询单条完整记录
- `DELETE /api/creation/:id`：删除单条记录
- `DELETE /api/creation/batch`：批量删除记录
- `DELETE /api/creation/all`：清空当前用户全部记录

所有内部接口统一返回：

```json
{
  "success": true,
  "data": {}
}
```

失败返回：

```json
{
  "success": false,
  "message": "错误信息"
}
```

## 前端页面

- `/login`：登录页
- `/register`：注册页
- `/dashboard`：工作台，含统计卡片和课程演示入口
- `/create`：智能创作页，支持生成、重新生成、保存、一键复制
- `/history`：历史记录页，支持搜索、筛选、排序、分页、查看详情、删除、批量删除
- `/profile`：个人中心，支持查看信息、修改用户名、修改密码、退出登录

## 部署建议

1. 服务器安装 Node.js、MySQL、Nginx。
2. 导入 `database/init.sql`。
3. 在 `server/.env` 配置数据库、JWT、AI API。
4. 后端执行 `npm install && npm start`，生产环境建议使用 PM2：

```bash
npm install -g pm2
cd server
pm2 start app.js --name aigc-short-video-server
```

5. 前端执行构建：

```bash
cd client
npm install
npm run build
```

6. 将 `client/dist` 交给 Nginx 托管，并把 `/api` 反向代理到后端端口。

## 常见问题

- 页面提示无法访问 `localhost:5173`：前端开发服务器没有启动，进入 `client` 执行 `npm run dev`。
- 注册提示服务器错误：通常是 MySQL 未启动、`.env` 数据库密码不对，或未执行 `database/init.sql`。
- 登录后生成提示 401：token 过期或本地登录状态失效，重新登录即可。
- AI 模式无结果：检查 `AI_API_KEY` 是否配置，或先切换 `GENERATION_MODE=template` 兜底演示。
- 换电脑运行：需要重新执行 `npm install`，因为 `node_modules` 不建议提交到 GitHub。

## 课程展示建议

推荐演示顺序：

1. 注册或登录账号。
2. 打开工作台，展示统计卡片和系统简介。
3. 点击“课程演示”，自动填充示例并生成内容。
4. 展示标题、口播、分镜、标签和发布建议。
5. 点击保存，进入历史记录查看详情。
6. 演示搜索、筛选、分页、删除。
7. 打开个人中心，展示用户信息、系统版本和开发信息。

## 后续可扩展方向

- 支持导出 TXT、JSON、Word 文件
- 支持更多 AI Provider，例如 OpenAI、通义千问、智谱
- 支持封面图生成
- 支持短视频脚本评分
- 支持管理员后台和作品审核
