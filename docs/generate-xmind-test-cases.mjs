import fs from 'node:fs';
import path from 'node:path';

const outputDir = path.resolve('docs');
const outputFile = path.join(outputDir, 'AIGC智能短视频创作助手-测试用例.xmind');

function topic(title, children = [], notes = '') {
  const item = {
    id: cryptoRandomId(),
    title
  };
  if (notes) {
    item.notes = { plain: { content: notes } };
  }
  if (children.length) {
    item.children = { attached: children };
  }
  return item;
}

function cryptoRandomId() {
  return `t-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function caseNode(id, precondition, steps, expected) {
  return topic(id, [
    topic(`前置条件：${precondition}`),
    topic('测试步骤', steps.map((step, index) => topic(`${index + 1}. ${step}`))),
    topic(`预期结果：${expected}`)
  ]);
}

const testTree = topic('AIGC智能短视频创作助手测试用例', [
  topic('1. 用户认证模块', [
    topic('1.1 用户注册', [
      caseNode('TC-AUTH-001 正常注册', '用户未登录，邮箱未注册', [
        '打开注册页',
        '输入用户名、邮箱、符合规则的密码和确认密码',
        '点击注册按钮'
      ], '注册成功，提示“注册成功”，跳转登录页，数据库 users 表新增用户且密码为加密值'),
      caseNode('TC-AUTH-002 重复邮箱注册', '数据库已存在相同邮箱用户', [
        '打开注册页',
        '输入已存在邮箱',
        '输入其他合法信息并提交'
      ], '注册失败，提示邮箱已存在，不新增用户'),
      caseNode('TC-AUTH-003 密码规则校验', '用户在注册页', [
        '输入少于 8 位或不包含字母数字组合的密码',
        '点击注册'
      ], '前端阻止提交并提示密码规则')
    ]),
    topic('1.2 用户登录', [
      caseNode('TC-AUTH-004 正常登录', '用户已注册', [
        '打开登录页',
        '输入正确邮箱和密码',
        '点击登录'
      ], '登录成功，localStorage 保存 token 和用户信息，进入 Dashboard'),
      caseNode('TC-AUTH-005 密码错误', '用户已注册', [
        '输入正确邮箱和错误密码',
        '点击登录'
      ], '登录失败，提示账号或密码错误，不写入 token')
    ]),
    topic('1.3 JWT 鉴权与退出', [
      caseNode('TC-AUTH-006 未登录访问系统页面', '清空 localStorage token', [
        '直接访问 /dashboard、/create、/history 或 /profile'
      ], '自动跳转 /login，并携带 redirect 参数'),
      caseNode('TC-AUTH-007 Token 失效处理', 'localStorage 中存在无效 token', [
        '访问需要鉴权的接口',
        '观察前端响应'
      ], '接口返回 401，前端清除登录信息并跳转登录页'),
      caseNode('TC-AUTH-008 退出登录', '用户已登录', [
        '进入个人中心',
        '点击退出登录'
      ], '清除本地登录状态并返回登录页')
    ]),
    topic('1.4 忘记密码', [
      caseNode('TC-AUTH-009 发送验证码', '用户邮箱已注册且邮箱服务配置正确', [
        '登录页点击忘记密码',
        '输入邮箱并发送验证码'
      ], '后端生成验证码哈希记录并发送邮件，前端显示倒计时'),
      caseNode('TC-AUTH-010 验证码重置密码', '用户收到有效验证码', [
        '输入邮箱、验证码和新密码',
        '点击确认重置'
      ], '密码更新成功，验证码标记为已使用，用户可用新密码登录')
    ])
  ]),

  topic('2. 工作台 Dashboard 模块', [
    topic('2.1 数据统计', [
      caseNode('TC-DASH-001 统计卡片展示', '用户已登录且存在历史记录', [
        '进入 /dashboard',
        '查看累计生成次数、历史记录数量、AI 模式次数、模板模式次数、最近生成时间'
      ], '统计数据与当前用户历史记录接口返回一致')
    ]),
    topic('2.2 今日热门话题', [
      caseNode('TC-DASH-002 热点列表加载', '用户已登录，后端服务正常', [
        '进入工作台',
        '等待热门话题区域加载'
      ], '展示日期、热榜来源、平台筛选和热点卡片'),
      caseNode('TC-DASH-003 平台分类筛选', '热门话题已加载', [
        '点击抖音、小红书、B站、视频号筛选项'
      ], '列表仅展示对应平台话题，数量徽标正确'),
      caseNode('TC-DASH-004 使用热点选题', '热门话题已加载', [
        '点击某条热点的“使用选题”按钮'
      ], '跳转到 /create，并自动带入 topic、platform、style、audience 等参数'),
      caseNode('TC-DASH-005 英文模式显示', '语言切换为 English', [
        '进入工作台',
        '查看热门话题卡片'
      ], '标题、说明、平台、风格、受众和按钮均显示英文，不出现中文说明和 #1 编号')
    ]),
    topic('2.3 快速开始', [
      caseNode('TC-DASH-006 快速开始入口', '用户已登录', [
        '点击工作台快速开始按钮'
      ], '进入创作页并填充示例选题')
    ])
  ]),

  topic('3. 智能创作模块', [
    topic('3.1 表单输入', [
      caseNode('TC-CREATE-001 必填校验', '用户已登录并进入创作页', [
        '不填写主题或受众',
        '点击生成'
      ], '前端表单提示必填项，禁止请求生成接口'),
      caseNode('TC-CREATE-002 平台选择', '用户在创作页', [
        '分别选择抖音、小红书、B站、视频号',
        '点击生成'
      ], '请求参数 platform 正确，发布建议随平台变化'),
      caseNode('TC-CREATE-003 风格选择', '用户在创作页', [
        '选择知识科普、生活分享、产品种草、剧情口播、热点解读等风格'
      ], '请求参数 style 正确，生成内容风格与选择一致'),
      caseNode('TC-CREATE-004 视频时长选择', '用户在创作页', [
        '选择 15s、30s、60s、90s 并生成'
      ], '分镜数量分别为 3、5、7、9，口播文案长度随时长增加')
    ]),
    topic('3.2 生成结果展示', [
      caseNode('TC-CREATE-005 正常生成', '用户已填写合法表单', [
        '点击生成创作方案'
      ], '展示标题推荐、口播文案、分镜脚本、标签、发布建议和生成模式'),
      caseNode('TC-CREATE-006 Loading 状态', '用户点击生成', [
        '观察按钮和页面状态'
      ], '生成过程中按钮显示“正在生成”并禁止重复点击'),
      caseNode('TC-CREATE-007 重新生成', '已有生成结果', [
        '点击重新生成'
      ], '重新请求生成接口并刷新结果'),
      caseNode('TC-CREATE-008 一键复制全部内容', '已有生成结果', [
        '点击一键复制全部内容'
      ], '剪贴板包含标题、文案、分镜、标签和发布建议')
    ]),
    topic('3.3 保存与离开确认', [
      caseNode('TC-CREATE-009 保存创作方案', '已有生成结果且未保存', [
        '点击保存创作方案'
      ], '调用 /api/creation/save，数据库 creations 表新增记录，按钮显示已保存'),
      caseNode('TC-CREATE-010 未保存离开确认', '已有生成结果且未保存', [
        '点击左侧菜单切换到其他模块'
      ], '弹出二次确认，取消则停留当前页，确认则离开'),
      caseNode('TC-CREATE-011 已保存后离开', '当前方案已保存', [
        '点击其他模块'
      ], '不弹确认框，直接切换页面')
    ])
  ]),

  topic('4. AI / 模板双模式模块', [
    topic('4.1 模板模式', [
      caseNode('TC-MODE-001 模板模式生成', '生成模式选择快速生成或环境变量为 template', [
        '填写创作表单并点击生成'
      ], '不依赖外部 API，返回 generationMode=template，结构完整'),
      caseNode('TC-MODE-002 模板随机性', '连续使用相同参数生成多次', [
        '重复点击重新生成'
      ], '标题、口播或标签存在差异，不是完全固定内容')
    ]),
    topic('4.2 AI 模式', [
      caseNode('TC-MODE-003 AI 模式生成', '服务器配置有效 AI_API_KEY，生成模式选择 AI', [
        '填写表单并点击生成'
      ], '调用大模型接口，返回 generationMode=ai，结果结构完整'),
      caseNode('TC-MODE-004 AI Key 缺失', 'GENERATION_MODE=ai 但 AI_API_KEY 缺失', [
        '点击生成'
      ], '系统不崩溃，自动回退模板模式并提示 AI 不可用'),
      caseNode('TC-MODE-005 AI JSON 异常回退', '模拟 AI 返回非 JSON 或字段缺失', [
        '调用生成接口'
      ], '后端校验失败后回退模板模式，返回 generationMode=fallback_template')
    ])
  ]),

  topic('5. 历史记录模块', [
    topic('5.1 列表查询', [
      caseNode('TC-HIS-001 查询当前用户历史', '用户已保存多条方案', [
        '进入 /history'
      ], '按 created_at 倒序展示当前用户记录，不显示其他用户数据'),
      caseNode('TC-HIS-002 关键词搜索', '历史列表存在多条不同主题', [
        '在搜索框输入关键词'
      ], '列表仅显示主题匹配的记录'),
      caseNode('TC-HIS-003 平台与风格筛选', '历史列表存在多平台多风格记录', [
        '选择平台筛选和风格筛选'
      ], '列表按照筛选条件展示'),
      caseNode('TC-HIS-004 分页展示', '历史记录数量超过每页条数', [
        '点击分页按钮'
      ], '当前页记录正确变化，总数不变')
    ]),
    topic('5.2 详情与复用', [
      caseNode('TC-HIS-005 查看详情', '历史列表存在记录', [
        '点击查看按钮'
      ], '弹窗展示完整标题、口播、分镜、标签和发布建议'),
      caseNode('TC-HIS-006 复用方案', '打开历史详情或点击复用', [
        '点击复用到创作页'
      ], '跳转创作页并带入历史记录参数')
    ]),
    topic('5.3 删除操作', [
      caseNode('TC-HIS-007 删除单条记录', '历史列表存在记录', [
        '点击删除',
        '确认删除'
      ], '删除成功，列表刷新，数据库对应记录删除'),
      caseNode('TC-HIS-008 删除取消', '点击删除后弹出确认框', [
        '点击取消'
      ], '记录不删除'),
      caseNode('TC-HIS-009 批量删除', '勾选多条历史记录', [
        '点击批量删除并确认'
      ], '选中记录全部删除，未选中记录保留'),
      caseNode('TC-HIS-010 清空全部', '当前用户存在历史记录', [
        '点击清空全部并确认'
      ], '当前用户所有历史记录被清空，其他用户记录不受影响')
    ])
  ]),

  topic('6. 导出模块', [
    topic('6.1 Word 导出', [
      caseNode('TC-EXPORT-001 导出 Word', '历史详情弹窗已打开', [
        '点击导出 Word'
      ], '浏览器下载 .doc 文件，内容包含完整创作方案')
    ]),
    topic('6.2 PDF 导出', [
      caseNode('TC-EXPORT-002 导出 PDF', '历史详情弹窗已打开且浏览器允许弹窗', [
        '点击导出 PDF'
      ], '打开打印窗口或生成可保存 PDF 的页面'),
      caseNode('TC-EXPORT-003 弹窗被拦截', '浏览器禁止弹窗', [
        '点击导出 PDF'
      ], '前端提示弹窗被拦截或导出失败')
    ]),
    topic('6.3 复制导出', [
      caseNode('TC-EXPORT-004 创作页复制', '创作页已有生成结果', [
        '点击一键复制全部内容'
      ], '剪贴板内容结构清晰，可直接粘贴到文档')
    ])
  ]),

  topic('7. 个人中心模块', [
    topic('7.1 用户信息', [
      caseNode('TC-PRO-001 展示用户信息', '用户已登录', [
        '进入个人中心'
      ], '显示用户名、邮箱、头像和创作统计')
    ]),
    topic('7.2 修改用户名', [
      caseNode('TC-PRO-002 修改用户名成功', '新用户名未被占用', [
        '点击修改用户名',
        '输入新用户名并保存'
      ], '用户信息更新，localStorage 同步更新'),
      caseNode('TC-PRO-003 用户名重复', '新用户名已存在', [
        '输入重复用户名并保存'
      ], '保存失败并提示重复')
    ]),
    topic('7.3 修改密码', [
      caseNode('TC-PRO-004 修改密码成功', '用户已登录且旧密码正确', [
        '输入旧密码、新密码和确认密码',
        '点击保存'
      ], '密码修改成功，下次需使用新密码登录'),
      caseNode('TC-PRO-005 旧密码错误', '用户已登录', [
        '输入错误旧密码并提交'
      ], '修改失败，提示旧密码不正确')
    ])
  ]),

  topic('8. 多语言模块', [
    topic('8.1 语言切换', [
      caseNode('TC-I18N-001 简体中文', '系统任意页面', [
        '切换语言为简体中文'
      ], '菜单、按钮、表单、提示信息显示简体中文'),
      caseNode('TC-I18N-002 繁体中文', '系统任意页面', [
        '切换语言为繁体中文'
      ], '主要页面文案显示繁体中文'),
      caseNode('TC-I18N-003 英语', '系统任意页面', [
        '切换语言为 English'
      ], '页面文案显示英文，表单提示不遮挡，热门话题不出现中文内容'),
      caseNode('TC-I18N-004 德语', '系统任意页面', [
        '切换语言为 Deutsch'
      ], '页面文案显示德语，主要布局不溢出')
    ])
  ]),

  topic('9. 安全与异常模块', [
    topic('9.1 参数校验', [
      caseNode('TC-SEC-001 空参数生成', '用户已登录', [
        '通过接口提交空 topic 或非法 duration'
      ], '后端返回 success=false 和明确错误信息'),
      caseNode('TC-SEC-002 非法历史 ID', '用户已登录', [
        '访问不存在的 /creation/detail/:id'
      ], '返回记录不存在或无权限')
    ]),
    topic('9.2 权限隔离', [
      caseNode('TC-SEC-003 用户只能查看自己的历史', '存在用户 A 和用户 B', [
        '用户 A 登录后访问用户 B 的历史记录 ID'
      ], '接口拒绝访问或返回不存在'),
      caseNode('TC-SEC-004 用户只能删除自己的记录', '存在用户 A 和用户 B', [
        '用户 A 调用删除用户 B 记录接口'
      ], '删除失败，用户 B 数据不受影响')
    ]),
    topic('9.3 数据库异常', [
      caseNode('TC-ERR-001 数据库连接失败', '停止 MySQL 或配置错误 DB 参数', [
        '访问登录、历史或保存接口'
      ], '后端返回统一错误格式，服务不崩溃')
    ]),
    topic('9.4 网络异常', [
      caseNode('TC-ERR-002 前端请求超时或后端不可用', '停止后端服务', [
        '前端调用登录或生成接口'
      ], '页面显示统一错误提示，不出现未捕获异常')
    ])
  ]),

  topic('10. 部署与兼容性模块', [
    topic('10.1 本地启动', [
      caseNode('TC-DEP-001 后端启动', '已安装依赖并配置 .env', [
        '进入 server 目录执行 npm run dev'
      ], '后端监听 http://localhost:3000，/api/health 返回正常'),
      caseNode('TC-DEP-002 前端启动', '已安装依赖', [
        '进入 client 目录执行 npm run dev'
      ], 'Vite 监听 http://localhost:5173，页面可访问')
    ]),
    topic('10.2 生产构建', [
      caseNode('TC-DEP-003 前端构建', 'client 依赖安装完成', [
        '执行 npm run build'
      ], '构建成功，生成 dist 目录，无阻塞错误'),
      caseNode('TC-DEP-004 数据库初始化', 'MySQL 可用', [
        '执行 npm run db:init 或导入 database/init.sql'
      ], '创建 aigc_short_video 数据库和核心表')
    ])
  ])
]);

const content = [
  {
    id: 'sheet-main',
    class: 'sheet',
    title: '测试用例',
    rootTopic: testTree,
    topicPositioning: 'fixed',
    relationships: [],
    summaries: []
  }
];

const metadata = {
  creator: {
    name: 'Codex',
    version: '1.0'
  },
  activeSheetId: 'sheet-main'
};

const manifest = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0">
  <file-entry full-path="content.json" media-type="application/json"/>
  <file-entry full-path="metadata.json" media-type="application/json"/>
  <file-entry full-path="manifest.json" media-type="application/json"/>
</manifest>`;

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

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dosDate };
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
    centralParts.push(Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(dt.time), u16(dt.date),
      u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0),
      u16(0), u16(0), u32(0), u32(offset), name
    ]));
    offset += localHeader.length + data.length;
  }

  const local = Buffer.concat(localParts);
  const central = Buffer.concat(centralParts);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(central.length), u32(local.length), u16(0)
  ]);
  return Buffer.concat([local, central, end]);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, createZip([
  { name: 'content.json', content: JSON.stringify(content, null, 2) },
  { name: 'metadata.json', content: JSON.stringify(metadata, null, 2) },
  { name: 'manifest.json', content: JSON.stringify({ fileEntries: {} }, null, 2) },
  { name: 'META-INF/manifest.xml', content: manifest }
]));

console.log(outputFile);
