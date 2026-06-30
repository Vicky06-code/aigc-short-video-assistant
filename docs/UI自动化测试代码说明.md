# UI 自动化测试代码说明

本项目已在 `client/tests` 下加入 Playwright UI 自动化测试代码，覆盖登录注册、智能创作、历史记录、工作台和个人中心等核心流程。

## 目录结构

```text
client/
├── playwright.config.js
└── tests/
    ├── pages/          # 页面对象封装
    ├── specs/          # 按业务模块拆分的测试用例
    └── utils/          # 测试数据与接口辅助方法
```

## 运行前准备

1. 确认 MySQL 已启动，并已执行 `database/init.sql`。
2. 确认后端 `.env` 配置正确。
3. 启动后端服务：`cd server && npm run dev`
4. 安装前端依赖：`cd client && npm install`
5. 首次安装 Playwright 浏览器：`npx playwright install`

## 运行命令

```bash
cd client
npm run test:e2e
```

可视化调试：

```bash
npm run test:e2e:ui
```

有界面运行：

```bash
npm run test:e2e:headed
```

## 说明

- 测试默认访问 `http://localhost:5173`。
- 后端接口通过 Vite 代理访问 `/api`，因此测试前需要保证后端 `http://localhost:3000` 可用。
- 测试会自动创建临时用户，并通过真实接口完成登录、生成、保存、查询等流程。
- 生成测试优先使用模板模式，避免真实 AI API 网络波动影响自动化测试稳定性。
