# AIGC 智能短视频内容创作辅助系统

面向内容创作者、品牌营销人员和短视频运营团队的智能创作辅助系统。系统提供从选题输入、标题生成、口播文案、分镜脚本、标签建议、发布时间建议到历史记录管理的一站式工作流，目标是支持真实业务场景下的短视频内容策划、生产和复用。

## 产品定位

本项目定位为一个可继续上线迭代的 Web 产品原型：

- 面向真实用户：创作者、内容运营、品牌营销、新媒体团队
- 面向真实流程：创意输入、AI 生成、方案保存、历史复用、账号管理
- 面向真实部署：前后端分离、MySQL 持久化、JWT 鉴权、环境变量配置、可接入真实大模型 API
- 面向可扩展架构：模板生成可作为稳定降级能力，AI 生成可接入 DeepSeek/OpenAI 等模型服务

## 技术栈

- 前端：Vue3 + Vite + Element Plus + Axios + Vue Router
- 后端：Node.js + Express
- 数据库：MySQL
- 鉴权：JWT
- AIGC：规则模板生成 + DeepSeek API AI 生成

## 核心功能

- 用户注册、登录、JWT 鉴权、个人资料维护
- 智能短视频方案生成
- 模板模式与 AI 模式双生成能力
- AI 调用失败后的模板降级
- 创作方案保存到 MySQL
- 历史记录搜索、筛选、分页、查看详情、删除、批量删除
- 多语言切换：简体中文、繁体中文、英语、德语
- 一键复制生成结果
- 快速体验入口，自动填充真实业务示例

## 目录结构

```text
aigc-short-video-assistant/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── i18n/
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
│   ├── scripts/
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

后端启动前创建 `.env`：

```bash
cd server
cp .env.example .env
```

示例：

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

安全要求：

- 真实 API Key 只写入 `server/.env`
- `.env` 不提交到 GitHub
- 生产环境必须更换 `JWT_SECRET`

## 数据库初始化

推荐使用项目脚本初始化：

```bash
cd server
npm run db:init
```

也可以使用 MySQL CLI：

```bash
mysql -u root -p < database/init.sql
```

主要数据表：

- `users`：用户信息，密码使用 bcrypt 加密
- `creations`：创作记录，保存标题、口播、分镜、标签、发布建议和生成模式

## 本地运行

后端：

```bash
cd server
npm install
npm start
```

默认地址：

```text
http://localhost:3000
```

前端：

```bash
cd client
npm install
npm run dev
```

默认地址：

```text
http://localhost:5173
```

## 生成模式

模板模式：

```env
GENERATION_MODE=template
```

适用场景：

- 无外部模型服务时稳定生成
- AI 服务异常时自动降级
- 对成本和响应稳定性要求较高的场景

AI 模式：

```env
GENERATION_MODE=ai
AI_PROVIDER=deepseek
AI_API_KEY=your_deepseek_api_key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
```

适用场景：

- 追求更自然、更丰富的生成结果
- 面向真实内容生产和运营提效
- 后续可扩展到 OpenAI、通义千问、智谱等模型

## 主要 API

认证接口：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `PUT /api/auth/password`

创作接口：

- `POST /api/creation/generate`
- `POST /api/creation/save`
- `GET /api/creation/history`
- `GET /api/creation/detail/:id`
- `DELETE /api/creation/:id`
- `DELETE /api/creation/batch`
- `DELETE /api/creation/all`

统一成功响应：

```json
{
  "success": true,
  "data": {}
}
```

统一失败响应：

```json
{
  "success": false,
  "message": "错误信息"
}
```

## 前端页面

- `/login`：登录
- `/register`：注册
- `/dashboard`：工作台，含数据统计和快速体验入口
- `/create`：智能创作，支持生成、重新生成、保存、一键复制
- `/history`：历史记录，支持搜索、筛选、排序、分页、详情、删除、批量删除
- `/profile`：个人中心，支持用户信息、修改用户名、修改密码、退出登录

## 生产部署建议

1. 服务器安装 Node.js、MySQL、Nginx。
2. 执行数据库初始化。
3. 配置 `server/.env`，生产环境设置强随机 `JWT_SECRET`。
4. 后端建议使用 PM2：

```bash
cd server
npm install
pm2 start app.js --name aigc-short-video-server
```

5. 前端构建：

```bash
cd client
npm install
npm run build
```

6. 使用 Nginx 托管 `client/dist`，并将 `/api` 反向代理到后端服务。

## 线上化注意事项

- 配置 HTTPS
- 限制 CORS 白名单
- 生产环境使用更严格的日志策略
- AI API 增加超时、重试、额度和错误监控
- 重要操作增加审计日志
- 数据库定期备份
- 前端可继续做路由级代码分割以优化首屏体积

## 常见问题

- 页面无法访问 `localhost:5173`：前端开发服务器未启动。
- 注册提示数据库不存在：执行 `cd server && npm run db:init`。
- 登录后请求返回 401：token 过期或登录状态失效，重新登录。
- AI 模式无结果：检查 `AI_API_KEY`，也可以临时切换 `GENERATION_MODE=template` 使用稳定降级。
- 换电脑运行：需要重新执行 `npm install`，`node_modules` 不提交到 GitHub。

## 后续规划

- 支持 TXT、JSON、Word、PDF 导出
- 支持团队空间和多人协作
- 支持封面图生成
- 支持内容评分和平台适配度分析
- 支持作品状态流转和审核
- 支持更多大模型 Provider
