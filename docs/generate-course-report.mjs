import fs from 'node:fs';
import path from 'node:path';

const outputDir = path.resolve('docs');
const outputFile = path.join(outputDir, '软件前沿技术课程大作业报告-AIGC智能短视频创作助手.docx');

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function run(text, options = {}) {
  const bold = options.bold ? '<w:b/>' : '';
  const color = options.color ? `<w:color w:val="${options.color}"/>` : '';
  const size = options.size ? `<w:sz w:val="${options.size}"/><w:szCs w:val="${options.size}"/>` : '';
  const font = options.font || 'SimSun';
  return `<w:r><w:rPr><w:rFonts w:ascii="${font}" w:eastAsia="${font}" w:hAnsi="${font}" w:cs="${font}"/>${bold}${color}${size}</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
}

function paragraph(text, style = 'Normal', options = {}) {
  const align = options.align ? `<w:jc w:val="${options.align}"/>` : '';
  const indent = options.indent ? `<w:ind w:firstLine="${options.indent}"/>` : '';
  const spacing = options.noLine ? '' : '<w:spacing w:line="400" w:lineRule="exact"/>';
  const pStyle = style ? `<w:pStyle w:val="${style}"/>` : '';
  return `<w:p><w:pPr>${pStyle}${spacing}${align}${indent}</w:pPr>${run(text, options)}</w:p>`;
}

function emptyLine() {
  return '<w:p><w:pPr><w:spacing w:line="400" w:lineRule="exact"/></w:pPr></w:p>';
}

function pageBreak() {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}

function bullet(text) {
  return paragraph(`• ${text}`, 'Normal', { indent: '420' });
}

function numbered(index, text) {
  return paragraph(`${index}. ${text}`, 'Normal', { indent: '420' });
}

function table(rows) {
  const cellWidth = Math.floor(9000 / rows[0].length);
  const rowXml = rows.map((row, rowIndex) => {
    const cells = row.map((cell) => `
      <w:tc>
        <w:tcPr><w:tcW w:w="${cellWidth}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>
        ${paragraph(cell, 'Normal', { bold: rowIndex === 0, font: rowIndex === 0 ? 'SimHei' : 'SimSun' })}
      </w:tc>`).join('');
    return `<w:tr>${cells}</w:tr>`;
  }).join('');
  return `<w:tbl>
    <w:tblPr>
      <w:tblW w:w="9000" w:type="dxa"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="666666"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="666666"/>
        <w:bottom w:val="single" w:sz="6" w:space="0" w:color="666666"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="666666"/>
        <w:insideH w:val="single" w:sz="6" w:space="0" w:color="666666"/>
        <w:insideV w:val="single" w:sz="6" w:space="0" w:color="666666"/>
      </w:tblBorders>
    </w:tblPr>
    ${rowXml}
  </w:tbl>${emptyLine()}`;
}

const body = [];

body.push(paragraph('《软件前沿技术》课程大作业报告', 'Title', { align: 'center', font: 'SimHei', size: '36', bold: true }));
body.push(emptyLine());
body.push(paragraph('作品名称：基于 AIGC 的智能短视频内容创作辅助系统', 'Normal', { align: 'center', font: 'SimHei', size: '28', bold: true }));
body.push(emptyLine());
body.push(emptyLine());
body.push(paragraph('学生姓名：________________', 'Normal', { align: 'center' }));
body.push(paragraph('学号：____________________', 'Normal', { align: 'center' }));
body.push(paragraph('班级：____________________', 'Normal', { align: 'center' }));
body.push(paragraph('提交日期：2026 年 6 月 30 日', 'Normal', { align: 'center' }));
body.push(pageBreak());

body.push(paragraph('一、作业作品背景', 'Heading1'));
body.push(paragraph('1.1 选题背景', 'Heading2'));
body.push(paragraph('短视频已经成为信息传播、品牌营销、知识分享和个人表达的重要形式。对于普通创作者和运营人员来说，真正困难的部分往往不是剪辑工具本身，而是选题、标题、口播文案、分镜脚本、标签和发布时间这些前置策划工作。一次完整的短视频生产需要把平台特点、目标受众、内容风格和视频时长综合起来考虑，如果完全依赖人工经验，效率较低，也容易出现内容结构散、标题吸引力不足、分镜不可执行等问题。', 'Normal', { indent: '420' }));
body.push(paragraph('本作品选择“基于 AIGC 的智能短视频内容创作辅助系统”作为课程大作业主题，是因为 AIGC 正是软件前沿技术中最典型、最容易与真实业务结合的方向之一。系统并不是简单地做一个文本生成页面，而是围绕真实内容生产流程，把用户输入、AI 生成、结果保存、历史复用、导出和多语言展示连接成一个完整的 Web 应用。', 'Normal', { indent: '420' }));
body.push(paragraph('1.2 需求分析', 'Heading2'));
body.push(paragraph('在项目设计阶段，我将目标用户定位为短视频创作者、内容运营人员、品牌营销人员和新媒体团队。系统需要解决的核心问题包括：如何快速生成可拍摄的短视频方案；如何让生成结果适配抖音、小红书、B站、视频号等不同平台；如何保存历史方案并继续复用；如何在 AI 服务异常时仍然保证系统可以演示和运行。', 'Normal', { indent: '420' }));
body.push(paragraph('因此，本作品不仅实现了智能生成，还特别保留了模板规则生成模式。当真实大模型接口不可用时，系统可以自动切换到模板生成，保证基本功能不受影响。这种设计更接近线上产品中的降级策略，而不是只追求单次演示效果。', 'Normal', { indent: '420' }));
body.push(paragraph('1.3 作品目标', 'Heading2'));
body.push(bullet('实现一个前后端分离、可运行、可展示、可部署的短视频创作辅助系统。'));
body.push(bullet('支持用户注册、登录、JWT 鉴权、个人中心和密码重置。'));
body.push(bullet('支持根据主题、平台、风格、时长、受众和创作要求生成完整短视频方案。'));
body.push(bullet('支持模板模式和 AI 模式双生成能力，AI 异常时能够自动回退。'));
body.push(bullet('支持历史记录持久化、搜索筛选、详情查看、删除、批量删除和文档导出。'));
body.push(bullet('优化界面体验，使系统更像面向真实用户的产品，而不是单纯课程展示页面。'));

body.push(paragraph('二、技术选型与总体设计', 'Heading1'));
body.push(paragraph('2.1 技术选型', 'Heading2'));
body.push(table([
  ['层次', '技术', '选择原因'],
  ['前端', 'Vue3 + Vite + Element Plus + Axios + Vue Router', '开发效率高，组件生态成熟，适合快速构建后台式产品界面。'],
  ['后端', 'Node.js + Express', '接口开发轻量，便于组织 MVC 分层，也方便调用第三方 AI API。'],
  ['数据库', 'MySQL', '适合保存用户、创作记录和密码验证码等结构化数据。'],
  ['鉴权', 'JWT', '适合前后端分离项目，前端可自动携带 token 访问受保护接口。'],
  ['AI 生成', '规则模板 + DeepSeek API 预留/接入', '模板模式保证稳定，AI 模式提升生成质量，结构上方便扩展其他模型。']
]));
body.push(paragraph('2.2 系统架构设计', 'Heading2'));
body.push(paragraph('系统采用前后端分离架构。前端负责页面展示、表单交互、路由守卫、状态保存和用户操作反馈；后端负责身份认证、参数校验、AI 或模板生成、历史记录持久化和统一错误处理；数据库负责保存用户信息、创作方案和密码重置验证码。整体调用流程为：用户在前端登录后填写创作表单，Axios 自动携带 JWT 调用后端接口，后端根据生成模式选择模板生成或 AI 生成，返回统一 JSON 结构，前端展示结果并允许保存到 MySQL。', 'Normal', { indent: '420' }));
body.push(paragraph('2.3 后端分层设计', 'Heading2'));
body.push(bullet('routes 层负责定义接口路径，例如 /api/auth、/api/creation、/api/hot-topics。'));
body.push(bullet('controllers 层负责接收请求、读取用户身份、组织响应。'));
body.push(bullet('services 层负责业务逻辑，例如生成方案、保存历史、调用 AI、获取热点。'));
body.push(bullet('models 层负责用户和密码验证码等数据访问。'));
body.push(bullet('utils 层负责模板生成、Prompt 构建、密码规则、邮件发送和日志输出。'));
body.push(paragraph('2.4 数据库设计', 'Heading2'));
body.push(paragraph('数据库包含 users、creations、password_reset_codes 三张核心表。users 表保存用户名、邮箱、加密密码和时间字段；creations 表保存用户每次生成的完整方案，包括标题 JSON、口播文案、分镜 JSON、标签 JSON、发布建议 JSON 和生成模式；password_reset_codes 表保存邮箱验证码的哈希值、过期时间和使用状态。creations.user_id 与 users.id 建立外键关系，用户删除后对应创作记录可自动清理。', 'Normal', { indent: '420' }));
body.push(paragraph('2.5 AI 生成设计', 'Heading2'));
body.push(paragraph('AI 生成模块采用“双模式”策略。模板模式不依赖网络，通过规则库、随机组合和平台参数生成内容；AI 模式通过服务端环境变量配置 DeepSeek API，将用户输入组装成严格 JSON Prompt。为了保证系统稳定，AI 返回会经过结构校验，例如标题数量必须为 5 个、标签数量为 8 到 10 个、分镜数量必须与视频时长匹配。若 API Key 缺失、接口请求失败、JSON 解析失败或结构不符合要求，系统会自动回退到模板生成。', 'Normal', { indent: '420' }));

body.push(paragraph('三、系统功能实现', 'Heading1'));
body.push(paragraph('3.1 用户认证模块', 'Heading2'));
body.push(paragraph('用户认证模块实现了注册、登录、JWT 鉴权、当前用户信息获取、修改用户名、修改密码和邮箱验证码重置密码。注册时系统会检查用户名和邮箱是否重复，并使用 bcryptjs 对密码加密后保存。登录成功后后端生成有效期为 7 天的 JWT，前端保存 token 和用户信息，后续请求由 Axios 拦截器自动携带 Authorization 请求头。', 'Normal', { indent: '420' }));
body.push(paragraph('密码安全方面，系统增加了密码规则校验，要求密码为 8 到 20 位并同时包含字母和数字。忘记密码功能通过邮箱验证码完成，验证码不明文入库，而是保存哈希值，并设置有效期和使用状态，从而降低验证码泄露风险。', 'Normal', { indent: '420' }));
body.push(paragraph('3.2 智能创作模块', 'Heading2'));
body.push(paragraph('智能创作页支持输入视频主题、发布平台、内容风格、视频时长、目标受众和自由创作要求。平台包括抖音、小红书、B站和视频号；内容风格覆盖知识科普、生活分享、产品种草、剧情口播、热点解读、教程教学、测评体验、职场干货、情感共鸣和搞笑娱乐；视频时长支持 15s、30s、60s 和 90s。', 'Normal', { indent: '420' }));
body.push(paragraph('生成结果包括 5 个标题、1 段口播文案、分镜脚本、热门标签、推荐发布时间、封面文案、互动引导语和平台发布建议。分镜数量会根据时长变化：15 秒生成 3 个镜头，30 秒生成 5 个镜头，60 秒生成 7 个镜头，90 秒生成 9 个镜头。页面提供加载状态、重新生成、保存方案、一键复制全部内容和未保存离开确认，增强真实使用体验。', 'Normal', { indent: '420' }));
body.push(paragraph('3.3 历史记录模块', 'Heading2'));
body.push(paragraph('历史记录模块将用户生成并保存的方案持久化到 MySQL，而不是只保存在浏览器本地。用户可以在历史页按关键词、平台、风格和排序条件筛选记录，并通过分页查看。每条记录支持查看详情、复用到创作页、删除；同时支持批量删除和清空全部历史记录。详情弹窗展示标题、口播文案、分镜脚本、标签和发布建议，方便用户回看和二次加工。', 'Normal', { indent: '420' }));
body.push(paragraph('3.4 导出模块', 'Heading2'));
body.push(paragraph('为了方便真实用户整理内容，系统支持在创作页一键复制生成结果，也支持在历史记录详情中导出 Word 文档和 PDF。导出内容包含基础信息、标题推荐、口播文案、分镜脚本、标签和发布建议。这样用户可以将系统生成的方案直接交给拍摄、剪辑或运营人员继续使用。', 'Normal', { indent: '420' }));
body.push(paragraph('3.5 工作台与热点模块', 'Heading2'));
body.push(paragraph('工作台展示累计生成次数、历史记录数量、AI 模式生成次数、模板模式生成次数和最近生成时间。今日热门话题模块按平台分类展示选题机会，优先读取实时热榜，接口不可用时使用每日轮换的备用话题。用户点击“使用选题”可以直接跳转到创作页并带入对应参数，形成从热点发现到内容生成的闭环。', 'Normal', { indent: '420' }));
body.push(paragraph('3.6 多语言与界面体验', 'Heading2'));
body.push(paragraph('系统支持简体中文、繁体中文、英语和德语切换。登录页、注册页、工作台、智能创作页、历史记录页和个人中心都接入了统一 i18n 文案。界面采用蓝紫色科技风格，使用 Element Plus 表单、表格、标签、弹窗、抽屉、消息提示等组件，整体布局为左侧菜单、顶部导航和主内容区域，符合 Web 产品常见操作习惯。', 'Normal', { indent: '420' }));

body.push(paragraph('四、开发过程', 'Heading1'));
body.push(paragraph('4.1 第一阶段：项目骨架搭建', 'Heading2'));
body.push(paragraph('项目最初按照 client、server、database 三个目录组织。client 使用 Vite 初始化 Vue3 项目，server 使用 Express 搭建 API 服务，database 提供 init.sql 用于初始化数据库。README 记录运行步骤、环境变量和部署方式，使项目在迁移到其他电脑时可以重新安装依赖并运行。', 'Normal', { indent: '420' }));
body.push(paragraph('4.2 第二阶段：用户认证系统', 'Heading2'));
body.push(paragraph('第二阶段完成 users 表、注册登录接口、bcrypt 密码加密、JWT 中间件和前端登录注册页面。为了保护内部页面，前端路由守卫会判断 localStorage 中是否存在 token，未登录访问系统页面会跳转到登录页，登录后访问登录或注册页会自动进入工作台。', 'Normal', { indent: '420' }));
body.push(paragraph('4.3 第三阶段：AIGC 生成核心模块', 'Heading2'));
body.push(paragraph('第三阶段实现 /api/creation/generate 接口，按照 routes、controller、service、templateGenerator 分层组织。模板生成器根据 topic、platform、style、duration 和 audience 生成标题、口播、分镜、标签和发布建议，为后续接入真实大模型预留了统一返回结构。', 'Normal', { indent: '420' }));
body.push(paragraph('4.4 第四阶段：前端完整界面', 'Heading2'));
body.push(paragraph('第四阶段完善登录页、注册页、工作台、智能创作页、历史记录页和个人中心，并新增 MainLayout 统一后台布局。智能创作页将输入区和结果区分离，结果按模块卡片展示；分镜脚本使用表格展示；标签使用 Tag 组件展示。', 'Normal', { indent: '420' }));
body.push(paragraph('4.5 第五阶段：历史记录持久化', 'Heading2'));
body.push(paragraph('第五阶段新增 creations 表和历史记录接口，实现保存、查询、详情、删除、批量删除和清空。前端历史页接入接口后，刷新页面数据仍然存在，解决了 LocalStorage 数据不可靠、不能跨设备使用的问题。', 'Normal', { indent: '420' }));
body.push(paragraph('4.6 第六阶段：真实 AI API 与兜底机制', 'Heading2'));
body.push(paragraph('第六阶段新增 aiService 和 promptBuilder，通过环境变量配置 AI_PROVIDER、AI_API_KEY、AI_BASE_URL、AI_MODEL 和 GENERATION_MODE。AI 模式下系统调用大模型生成严格 JSON，失败时自动回退模板模式，并在返回值中标记 generationMode，前端可以显示“AI 智能生成”“快速生成”或“AI 不可用已切换”。', 'Normal', { indent: '420' }));
body.push(paragraph('4.7 第七阶段：产品化优化', 'Heading2'));
body.push(paragraph('后续迭代重点放在真实用户体验上，包括页面文案去课程化、语言切换、今日热门话题、热点按平台分类、模板随机生成、导出 Word/PDF、忘记密码、密码规则、90 秒视频时长、英文界面细节修复等。通过这些优化，系统从“能跑的作业”逐步接近“可以上线试用的产品原型”。', 'Normal', { indent: '420' }));

body.push(paragraph('五、测试与优化', 'Heading1'));
body.push(paragraph('5.1 功能测试', 'Heading2'));
body.push(numbered(1, '注册测试：输入合法用户名、邮箱和密码后能够创建用户，重复用户名或邮箱会返回错误提示。'));
body.push(numbered(2, '登录测试：输入正确邮箱和密码后返回 token 和用户信息，错误密码无法登录。'));
body.push(numbered(3, '鉴权测试：未登录访问 /dashboard、/create、/history、/profile 会跳转登录页；未携带 token 请求生成接口会返回 401。'));
body.push(numbered(4, '生成测试：模板模式和 AI 模式均可返回统一结构，AI 异常时自动回退模板模式。'));
body.push(numbered(5, '历史测试：保存后的方案可以在历史记录中查询，详情、删除、批量删除和清空功能正常。'));
body.push(numbered(6, '导出测试：历史详情可导出 Word 和 PDF，创作页可复制全部内容。'));
body.push(paragraph('5.2 接口测试', 'Heading2'));
body.push(paragraph('后端接口统一返回 success、data 或 message 字段，便于前端集中处理。数据库操作使用 mysql2 参数化查询，避免通过字符串拼接造成 SQL 注入风险。错误处理统一经过 errorHandler，中间件会根据数据库连接异常、鉴权失败、参数错误等情况返回清晰提示。', 'Normal', { indent: '420' }));
body.push(paragraph('5.3 体验优化', 'Heading2'));
body.push(bullet('生成按钮增加 loading 状态，生成过程中禁止重复点击。'));
body.push(bullet('生成成功后自动滚动到结果区域，减少用户寻找结果的成本。'));
body.push(bullet('离开创作页前，如果存在未保存结果，会弹出二次确认。'));
body.push(bullet('历史记录增加空状态、搜索筛选、分页和删除确认，避免误操作。'));
body.push(bullet('英文模式下修复热门话题区域仍显示中文和编号的问题，使多语言体验更完整。'));
body.push(paragraph('5.4 安全优化', 'Heading2'));
body.push(paragraph('系统在安全方面主要做了四类处理：第一，密码使用 bcrypt 加密存储；第二，受保护接口统一经过 JWT 中间件；第三，数据库查询使用参数化语句；第四，真实 API Key 只保存在 server/.env 中，.env 不提交到 GitHub。对于密码重置验证码，系统保存哈希值和过期时间，而不是直接保存明文验证码。', 'Normal', { indent: '420' }));

body.push(paragraph('六、作品运行效果展示', 'Heading1'));
body.push(paragraph('6.1 登录与注册页面', 'Heading2'));
body.push(paragraph('登录页和注册页采用统一的科技风背景和卡片式表单。注册页包含用户名、邮箱、密码、确认密码，并提供 Element Plus 表单校验；登录页包含邮箱、密码和忘记密码入口。登录成功后进入工作台，退出登录后返回登录页。', 'Normal', { indent: '420' }));
body.push(paragraph('6.2 工作台页面', 'Heading2'));
body.push(paragraph('工作台展示系统核心数据和常用入口。顶部展示产品定位和今日创作提示，中部展示累计生成、历史记录、AI 生成、快速生成和最近生成时间。今日热门话题按平台分类，包括全部平台、抖音、小红书、B站和视频号，用户可以直接选择热点进入创作流程。', 'Normal', { indent: '420' }));
body.push(paragraph('6.3 智能创作页面', 'Heading2'));
body.push(paragraph('智能创作页左侧为创作输入，右侧为生成结果。用户填写主题、平台、风格、时长、受众和创作要求后点击生成，系统会展示标题推荐、口播文案、分镜脚本、标签和发布建议。结果区域还显示生成模式和质量检查信息，用户可以保存方案、重新生成或一键复制。', 'Normal', { indent: '420' }));
body.push(paragraph('6.4 历史记录页面', 'Heading2'));
body.push(paragraph('历史记录页使用表格展示主题、平台、风格、时长、生成模式和创建时间。顶部提供搜索框、平台筛选、风格筛选和排序选项。点击查看后弹出详情，用户可以复用方案、导出 Word、导出 PDF 或删除记录。', 'Normal', { indent: '420' }));
body.push(paragraph('6.5 个人中心页面', 'Heading2'));
body.push(paragraph('个人中心展示当前登录用户信息和创作统计，支持修改用户名、修改密码和退出登录。该页面更偏向真实账号管理，而不是展示技术栈信息，符合面向真实用户的产品定位。', 'Normal', { indent: '420' }));

body.push(paragraph('七、部署准备', 'Heading1'));
body.push(paragraph('系统已经按照可部署项目组织。后端通过 .env 配置端口、数据库、JWT、邮箱和 AI 参数；前端通过 Vite build 生成 dist 目录。部署到服务器时，可以使用 PM2 启动 Express 服务，使用 Nginx 托管前端静态文件，并将 /api 反向代理到后端服务。数据库可通过 database/init.sql 初始化。', 'Normal', { indent: '420' }));
body.push(paragraph('生产环境需要特别注意以下事项：JWT_SECRET 必须更换为强随机字符串；数据库账号应设置最小权限；CORS 应限制为正式域名；API Key 不得写入代码仓库；AI 调用需要增加额度监控、超时处理和日志审计；数据库需要定期备份。', 'Normal', { indent: '420' }));

body.push(paragraph('八、总结与展望', 'Heading1'));
body.push(paragraph('本次课程大作业从一个 MVP 项目开始，逐步完成了用户认证、智能生成、历史记录、真实 AI API、导出、多语言、热点选题和部署准备等功能。通过开发过程可以看到，AIGC 应用不仅是调用模型接口，更重要的是围绕真实用户流程设计数据结构、错误兜底、页面交互和结果复用。', 'Normal', { indent: '420' }));
body.push(paragraph('目前系统已经具备完整演示和本地运行能力，也具备一定上线原型价值。后续可以继续优化的方向包括：接入更多模型供应商；增加封面图生成；增加团队协作空间；增加内容评分和平台适配分析；增加作品状态流转；对前端进行路由级代码分割以优化首屏体积；对 AI 生成结果增加人工编辑和版本管理。', 'Normal', { indent: '420' }));
body.push(paragraph('通过本项目，我对 Vue3 前端工程化、Express 后端分层、MySQL 数据持久化、JWT 鉴权、AIGC Prompt 设计和真实产品迭代有了更完整的实践理解。相比单纯完成页面或接口，这个项目更强调从需求、架构、开发、测试到部署的完整软件工程过程。', 'Normal', { indent: '420' }));

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${body.join('\n')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="312"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:line="400" w:lineRule="exact"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="SimSun" w:eastAsia="SimSun" w:hAnsi="SimSun" w:cs="SimSun"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:qFormat/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:line="400" w:lineRule="exact"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="SimHei" w:eastAsia="SimHei" w:hAnsi="SimHei" w:cs="SimHei"/><w:b/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="240" w:after="120" w:line="400" w:lineRule="exact"/><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="SimHei" w:eastAsia="SimHei" w:hAnsi="SimHei" w:cs="SimHei"/><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="160" w:after="80" w:line="400" w:lineRule="exact"/><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="SimHei" w:eastAsia="SimHei" w:hAnsi="SimHei" w:cs="SimHei"/><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="120" w:after="60" w:line="400" w:lineRule="exact"/><w:outlineLvl w:val="2"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="SimSun" w:eastAsia="SimSun" w:hAnsi="SimSun" w:cs="SimSun"/><w:b/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr>
  </w:style>
</w:styles>`;

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`;

const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>`;

const settingsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:zoom w:percent="100"/>
  <w:defaultTabStop w:val="420"/>
</w:settings>`;

function crc32(buffer) {
  let table = crc32.table;
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i += 1) {
      let c = i;
      for (let j = 0; j < 8; j += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c >>> 0;
    }
    crc32.table = table;
  }
  let crc = 0xffffffff;
  for (const byte of buffer) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dosDate };
}

function u16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const dt = dosDateTime();

  for (const file of files) {
    const name = Buffer.from(file.name, 'utf8');
    const data = Buffer.from(file.content, 'utf8');
    const crc = crc32(data);

    const localHeader = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(dt.time), u16(dt.date),
      u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name
    ]);
    localParts.push(localHeader, data);

    const centralHeader = Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dt.time), u16(dt.date),
      u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(offset), name
    ]);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const central = Buffer.concat(centralParts);
  const local = Buffer.concat(localParts);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(central.length), u32(local.length), u16(0)
  ]);
  return Buffer.concat([local, central, end]);
}

fs.mkdirSync(outputDir, { recursive: true });
const docx = createZip([
  { name: '[Content_Types].xml', content: contentTypesXml },
  { name: '_rels/.rels', content: relsXml },
  { name: 'word/_rels/document.xml.rels', content: docRelsXml },
  { name: 'word/document.xml', content: documentXml },
  { name: 'word/styles.xml', content: stylesXml },
  { name: 'word/settings.xml', content: settingsXml }
]);

fs.writeFileSync(outputFile, docx);
console.log(outputFile);
