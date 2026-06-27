const PLATFORMS = ['抖音', '小红书', 'B站', '视频号'];
const STYLES = [
  '知识科普',
  '生活分享',
  '产品种草',
  '剧情口播',
  '热点解读',
  '教程教学',
  '测评体验',
  '职场干货',
  '情感共鸣',
  '搞笑娱乐'
];
const DURATIONS = [15, 30, 60];

const platformAdviceMap = {
  抖音: {
    bestTime: '12:00-13:00 或 19:00-22:00',
    advice: '抖音发布要把最强钩子放在前 3 秒，标题和字幕尽量短促有冲击力，结尾用评论问题提高互动。'
  },
  小红书: {
    bestTime: '11:30-13:30 或 20:00-22:30',
    advice: '小红书发布要强化标题、封面和收藏价值，内容最好拆成清晰步骤，让用户一眼知道值得收藏。'
  },
  B站: {
    bestTime: '18:00-21:00',
    advice: 'B站发布要重视内容完整度和知识结构，建议用清晰小标题和案例解释，提升完播与收藏。'
  },
  视频号: {
    bestTime: '07:30-09:00 或 20:00-21:30',
    advice: '视频号发布要强调实用性和转发价值，表达更稳重，适合加入生活或工作场景。'
  }
};

const styleToneMap = {
  知识科普: '用清晰逻辑解释原因、趋势和方法，让观众听完能获得一个明确认知',
  生活分享: '用真实体验和具体场景拉近距离，让表达更像朋友之间的建议',
  产品种草: '突出痛点、卖点、使用场景和行动建议，但不要写得像硬广',
  剧情口播: '用冲突、悬念和反转推动表达，让观众愿意继续听下去',
  热点解读: '先交代热点发生了什么，再解释背后原因和普通人应该怎么看',
  教程教学: '把步骤拆清楚，强调操作顺序、注意事项和可直接照做的方法',
  测评体验: '从真实体验出发，讲清优点、缺点、适用人群和选择建议',
  职场干货: '表达要直接、实用，突出职场场景、行动方法和避坑提醒',
  情感共鸣: '用细腻表达唤起共同感受，避免说教，多讲真实处境和情绪变化',
  搞笑娱乐: '节奏轻松，允许夸张和反差，但结尾仍要回到主题本身'
};

const hookLibrary = {
  知识科普: [
    '你以为这只是一个普通现象，但背后其实有一套很清晰的逻辑。',
    '先别急着下判断，这个问题如果拆开看，会发现关键点并不复杂。',
    '很多人只看到了结果，但真正值得讲的是它为什么会发生。'
  ],
  生活分享: [
    '这件事我一开始也没太在意，后来发现它真的会影响日常选择。',
    '如果你也遇到过类似情况，这条内容应该会很有共鸣。',
    '今天不讲大道理，就用一个真实场景把这件事说清楚。'
  ],
  产品种草: [
    '如果你正在纠结要不要入手，先别急着下单。',
    '这类东西到底值不值得买，关键不是看参数，而是看适不适合你。',
    '我会直接讲优点、缺点和适合人群，帮你少走一点弯路。'
  ],
  剧情口播: [
    '如果这件事发生在你身上，你第一反应可能也会和我一样。',
    '故事要从一个看起来很普通的决定说起，但后面的反转才是重点。',
    '一开始所有人都觉得没问题，直到真正的变化出现。'
  ],
  热点解读: [
    '这个话题最近突然被很多人讨论，但真正值得关注的不是热度本身。',
    '别只看标题，这个热点背后至少有三个信号。',
    '如果你只知道它火了，那还不够，关键是要知道它为什么火。'
  ],
  教程教学: [
    '这件事其实可以按步骤做，不需要一上来就追求完美。',
    '我把方法拆成几个动作，你照着做就能先跑起来。',
    '别被复杂教程吓到，先掌握最关键的流程就够了。'
  ],
  测评体验: [
    '我会从真实使用角度讲，不只说好听的，也会说它的问题。',
    '这次不看宣传话术，只看实际体验到底怎么样。',
    '如果你正在犹豫，我会用几个具体场景帮你判断。'
  ],
  职场干货: [
    '职场里很多问题不是能力不够，而是判断顺序错了。',
    '这条内容适合想提高效率、少踩坑的人认真听完。',
    '我直接讲可执行的方法，不绕概念。'
  ],
  情感共鸣: [
    '有些问题看起来很小，但真的会让人反复消耗。',
    '如果你最近也有这种感觉，先别急着否定自己。',
    '这不是矫情，而是很多人都会经历的一种状态。'
  ],
  搞笑娱乐: [
    '这件事说严肃也严肃，说离谱也是真的离谱。',
    '先声明，我不是在夸张，但这个画面感真的很强。',
    '如果把这件事拍成短视频，开头三秒就已经有戏了。'
  ]
};

const explanationLibrary = [
  '它背后通常有三个层面的原因：外部环境变化、用户选择变化，以及信息传播速度变快。',
  '判断这类问题时，不要只看单个事件，而要看它是否正在形成连续影响。',
  '真正影响结果的不是某一个单点，而是多个因素叠加后，让原本的小变化变得明显。',
  '你可以把它理解成一个信号：当越来越多人开始讨论，说明它已经影响到具体决策。'
];

const actionLibrary = [
  '第一步，先确认它和你有没有直接关系；第二步，判断现在是否必须行动；第三步，再决定投入多少时间或成本。',
  '更稳妥的做法是先收集信息，再做小范围尝试，最后根据反馈调整。',
  '如果你现在还不确定，先不要被情绪推着走，可以给自己设一个观察周期，再做决定。',
  '建议你先把目标拆小，用一个能马上执行的动作开始，而不是停留在焦虑里。'
];

const endingLibrary = [
  '如果这条内容对你有帮助，可以先收藏，下次遇到类似问题时直接对照看。',
  '你也可以在评论区告诉我，你更想听原因拆解，还是具体操作方法。',
  '如果你想继续看这类内容，关注我，下一条继续把复杂问题讲简单。',
  '最后别忘了，真正有用的内容不是制造焦虑，而是帮你做出更清楚的判断。'
];

const visualLibrary = {
  default: [
    '大字标题抛出核心问题，背景用主题相关素材',
    '展示目标受众常见困惑，叠加关键词字幕',
    '用三栏卡片呈现原因、影响、建议',
    '切换到具体案例画面，突出前后对比',
    '用清单画面总结关键步骤',
    '展示评论区提问或收藏动作，引导互动',
    '正面口播收尾，屏幕保留核心结论'
  ],
  测评体验: [
    '开箱或使用场景特写，快速给出第一感受',
    '展示真实使用过程，标出优点和槽点',
    '用对比镜头呈现不同选择的差异',
    '切到细节特写，说明适合和不适合的人',
    '用评分卡或清单总结体验结论',
    '展示购买或避坑建议',
    '口播收尾，提醒按需求选择'
  ],
  教程教学: [
    '标题页展示本期要完成的目标',
    '屏幕录制或桌面俯拍展示第一步',
    '用箭头和编号标出关键操作',
    '演示常见错误和正确做法',
    '快速回放完整流程',
    '列出注意事项和检查清单',
    '结尾展示完成效果和下一步建议'
  ],
  情感共鸣: [
    '生活化场景开头，营造真实情绪',
    '人物近景口播，表达内心状态',
    '切换到细节画面，比如手机、桌面、夜晚灯光',
    '用字幕强调一句共鸣观点',
    '展示情绪转折或自我调整动作',
    '给出温和建议，不说教',
    '安静收尾，留下互动问题'
  ],
  搞笑娱乐: [
    '夸张表情或反差画面开场',
    '用大字吐槽点明冲突',
    '快切几个典型场景制造节奏',
    '加入反转画面或停顿梗',
    '用对比字幕强化笑点',
    '回到主题给出轻松总结',
    '用评论梗引导互动'
  ]
};

const cameraLibrary = [
  '近景口播，开头快速推进',
  '中景实拍，搭配屏幕字幕',
  '俯拍桌面或屏幕录制',
  '快切 B-roll，节奏略快',
  '分屏对比，突出反差',
  '稳定中近景，语速放缓',
  '正面口播，眼神看镜头'
];

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function pickRandom(list) {
  return list[randomInt(list.length)];
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function takeRandom(list, count) {
  return shuffle(list).slice(0, count);
}

const memeTopicLibrary = [
  {
    pattern: /爱你老几|爱你几|你老几/,
    category: '网络热梗',
    meaning: '它不是在认真讨论“爱谁”或者“排第几”，而是一种带点调侃和反问的网络表达，常用来表达“不必太在意别人评价”或者“先把自己放在前面”。',
    context: '这个梗的传播点在于语气有反差：表面像一句没头没尾的话，实际是在用玩笑感表达边界感、自我态度和情绪释放。',
    example: '比如有人过度评价你的选择，你就可以用这个梗表达：我不需要所有人都认可，我先把自己的感受和判断放在重要位置。',
    caution: '但它更适合朋友间调侃、评论区互动或轻松内容，不适合正式沟通，也不要用来攻击具体的人。',
    titleIdeas: [
      '“爱你老几”到底是什么梗？一句话讲清楚',
      '别再把“爱你老几”理解错了，它其实在表达这件事',
      '为什么年轻人爱说“爱你老几”？背后是情绪和边界感',
      '“爱你老几”爆火：好笑之外，也有一点真实',
      '刷到“爱你老几”别懵，这个热梗是这么用的'
    ],
    tags: ['#爱你老几', '#网络热梗', '#热梗解读', '#互联网语境', '#年轻人表达', '#情绪价值']
  },
  {
    pattern: /尊嘟假嘟|真的假的|真的假的啊/,
    category: '网络热梗',
    meaning: '这是把“真的假的”用更可爱、更夸张的方式说出来，核心不是求证事实，而是表达惊讶、怀疑和情绪反应。',
    context: '它适合用在反转信息、离谱新闻、朋友聊天和评论区互动里，重点是语气轻松。',
    example: '比如看到一个很意外的消息，直接说“尊嘟假嘟”，比普通的“真的假的”更有网感。',
    caution: '正式科普时可以解释它的语境，但不要整段都堆梗，否则会显得刻意。',
    titleIdeas: [
      '“尊嘟假嘟”为什么突然火了？',
      '一个词讲清楚“尊嘟假嘟”的真实语境',
      '别只会跟风用，“尊嘟假嘟”其实是这种情绪',
      '年轻人为什么爱说“尊嘟假嘟”？',
      '“尊嘟假嘟”怎么用才不尴尬？'
    ],
    tags: ['#尊嘟假嘟', '#网络热梗', '#年轻人表达', '#评论区文化', '#热梗解读']
  },
  {
    pattern: /遥遥领先|泼天富贵|显眼包|电子榨菜|搭子|松弛感|情绪价值/,
    category: '网络流行语',
    meaning: '这类词通常不是字面意思，而是在特定平台和社交语境里形成的高频表达。',
    context: '它们能流行，是因为短、好记、能精准概括一种情绪或场景。',
    example: '做这类内容时，重点不是查词典，而是解释它什么时候用、为什么大家愿意用、用错会不会尴尬。',
    caution: '讲热梗要保持轻松，但也要给出使用边界，避免强行装年轻。',
    titleIdeas: [
      '这个热梗到底怎么火的？一次讲清楚',
      '别再乱用了，这个网络流行语真正的语境是这样',
      '为什么大家都在说这个词？背后有一个情绪入口',
      '一个热梗能火，靠的不只是好笑',
      '刷屏热梗怎么用才自然？看完就懂'
    ],
    tags: ['#网络流行语', '#热梗解读', '#互联网语境', '#内容灵感', '#年轻人表达']
  }
];

function getMemeInsight(topic) {
  return memeTopicLibrary.find((item) => item.pattern.test(topic));
}

function getTopicInsight(topic, audience) {
  const meme = getMemeInsight(topic);
  if (meme) {
    return {
      isMeme: true,
      category: meme.category,
      hook: `如果你最近刷到“${topic}”一脸懵，先别按字面意思理解，它更像是一个带情绪的${meme.category}。`,
      reason: `${meme.meaning}${meme.context}`,
      example: `${meme.example}对${audience}来说，真正值得讲的不是这个词有多好笑，而是它为什么能准确戳中当下的表达需求。`,
      advice: `做这类内容时，可以按三个层次讲：第一，它表面是什么意思；第二，它在什么场景里用；第三，什么时候用会自然、什么时候会冒犯。${meme.caution}`,
      titleIdeas: meme.titleIdeas,
      tags: meme.tags
    };
  }

  if (/涨价|价格|变贵|降价|便宜|成本/.test(topic)) {
    return {
      hook: `最近你可能已经发现，${topic}不再只是新闻里的数字变化，而是会影响到真实购买决策。`,
      reason: `价格变化通常不是单一原因造成的，可能和上游产能、原材料成本、库存周期、需求突然增加都有关系。`,
      example: `比如${audience}如果最近准备买电脑、升级设备，原本可以慢慢挑配置，现在就需要先判断自己是不是真的刚需。`,
      advice: `我的建议是：急用就优先买够用的配置，不急就观察一到两个月，同时多看历史价格，不要被短期情绪带着下单。`
    };
  }

  if (/学习|效率|考试|复习|大学生/.test(topic)) {
    return {
      hook: `如果你也在为${topic}发愁，先别急着怪自己不够自律。`,
      reason: `很多时候问题不在努力程度，而在目标太大、反馈太慢、每天的任务不够具体。`,
      example: `比如${audience}想提高效率，不要只写“今天要学习”，而是改成“晚上八点前完成二十道题并订正错题”。`,
      advice: `你可以从今天开始只做一件事：把任务拆到三十分钟内能完成，然后完成后立刻记录结果。`
    };
  }

  if (/品牌|转化|营销|运营|内容/.test(topic)) {
    return {
      hook: `如果你正在做${topic}，真正难的不是发一条视频，而是让用户看完后愿意行动。`,
      reason: `影响结果的关键通常有三个：用户是否立刻看懂价值、内容是否解决具体问题、结尾是否给出明确下一步。`,
      example: `比如${audience}做产品内容时，与其堆功能，不如先展示一个真实使用前后的变化。`,
      advice: `建议先用一个小场景切入，再讲一个核心卖点，最后用评论、私信或领取资料承接行动。`
    };
  }

  return {
    hook: `如果你最近正在关注${topic}，这件事其实值得认真拆开看。`,
    reason: `它之所以被讨论，往往是因为背后有真实变化：有人受到影响，有人正在做选择，也有人还没看清楚原因。`,
    example: `对${audience}来说，最重要的不是跟着情绪走，而是先弄明白它和自己的生活、学习或工作到底有什么关系。`,
    advice: `建议你先看清原因，再判断影响，最后决定自己要不要行动。这样不容易被热闹的信息牵着走。`
  };
}

function normalizeDuration(duration) {
  return Number.parseInt(duration, 10);
}

export function validateCreationInput(input) {
  const errors = [];
  const duration = normalizeDuration(input.duration);

  if (!input.topic?.trim()) errors.push('视频主题不能为空');
  if (!PLATFORMS.includes(input.platform)) errors.push('发布平台不合法');
  if (!STYLES.includes(input.style)) errors.push('内容风格不合法');
  if (!DURATIONS.includes(duration)) errors.push('视频时长不合法');
  if (!input.audience?.trim()) errors.push('目标受众不能为空');

  return {
    valid: errors.length === 0,
    errors,
    value: {
      topic: input.topic?.trim(),
      platform: input.platform,
      style: input.style,
      duration,
      audience: input.audience?.trim(),
      creativeRequirement: input.creativeRequirement?.trim()?.slice(0, 500) || ''
    }
  };
}

export function generateTitles({ topic, platform, style, audience }) {
  const meme = getMemeInsight(topic);
  if (meme) {
    return takeRandom(
      [
        ...meme.titleIdeas,
        `${topic}为什么会刷屏？这不是字面意思那么简单`,
        `${audience}也在用的${topic}，真正语境是什么？`,
        `${style}版${topic}热梗解读，适合发在${platform}`,
        `别尬用${topic}，先搞懂它的语气和边界`,
        `${topic}火了：它到底戳中了什么情绪？`
      ],
      5
    );
  }

  const audiencePrefix = topic.includes(audience) ? '' : `${audience}`;
  const titleTemplates = [
    `${topic}的 3 个关键判断，建议收藏`,
    `为什么大家都在关注${topic}？背后原因一次讲清楚`,
    `${audiencePrefix ? `${audiencePrefix}必须了解的` : ''}${topic}方法，看完就能用`,
    `${topic}实用指南：从问题到解决只差这几步`,
    `${style}版${topic}，适合发在${platform}`,
    `${topic}到底该怎么看？这几个细节很重要`,
    `别再误解${topic}了，真正关键的是这一点`,
    `关于${topic}，很多人忽略了这个信号`,
    `${audiencePrefix ? `${audiencePrefix}看完就懂的` : ''}${topic}入门解释`,
    `${topic}值不值得关注？先看这份判断清单`
  ];

  return takeRandom(titleTemplates, 5);
}

export function selectTitle(titles) {
  return pickRandom(titles);
}

function paragraphJoin(parts) {
  return parts.filter(Boolean).join('');
}

export function generateSpeechScript({ topic, platform, style, duration, audience }) {
  const tone = styleToneMap[style];
  const platformTip = platformAdviceMap[platform].advice;
  const insight = getTopicInsight(topic, audience);

  if (insight.isMeme) {
    const memeEnding = `如果你还想看更多热梗拆解，可以先收藏这条，下次刷到类似表达就不会只停留在“好笑”这一层。`;
    const shortScript = paragraphJoin([
      insight.hook,
      insight.reason,
      `记住一个判断：热梗不是拿来逐字翻译的，要看它在评论区、聊天和短视频里的情绪语境。`,
      memeEnding
    ]);
    const mediumScript = paragraphJoin([
      insight.hook,
      insight.reason,
      insight.example,
      insight.advice,
      `如果发到${platform}，开头可以直接抛出“别按字面理解”，中间用一两个真实聊天场景解释，结尾再提醒使用边界，这样既有网感，也不会显得生硬。`,
      memeEnding
    ]);
    const longScript = paragraphJoin([
      insight.hook,
      `讲这种梗，第一步一定不是查字典，而是还原它出现的场景。`,
      insight.reason,
      `第二步，看它解决了什么表达问题。很多人转发一个梗，不只是因为它好笑，而是因为它替自己说出了一种不好直接说出口的态度。`,
      insight.example,
      `第三步，看它有没有边界。熟人之间开玩笑可以，评论区轻松互动也可以，但如果拿它去怼陌生人、正式沟通或者攻击具体对象，就容易变味。`,
      insight.advice,
      `所以做成${style}内容时，重点不是复读热梗，而是讲清楚它为什么火、适合怎么用、什么时候别乱用。${tone}`,
      `如果发到${platform}，建议前 3 秒直接用大字标题抛出“这个梗别按字面理解”，后面用聊天截图式画面和口播解释语境，收藏率会更高。${platformTip}`,
      memeEnding
    ]);

    if (duration === 15) return shortScript;
    if (duration === 30) return mediumScript;
    return longScript;
  }

  const styleHooks = hookLibrary[style] || hookLibrary.知识科普;
  const hook = `${pickRandom(styleHooks)}${insight.hook}`;
  const explanation = pickRandom(explanationLibrary);
  const action = pickRandom(actionLibrary);
  const ending = pickRandom(endingLibrary);

  const shortScript = paragraphJoin([
    hook,
    `${insight.reason}`,
    `${insight.advice}`,
    ending
  ]);

  const mediumScript = paragraphJoin([
    hook,
    explanation,
    `${insight.reason}`,
    `${insight.example}`,
    `${insight.advice}`,
    action,
    `这类${style}内容发布到${platform}时，表达要更具体，少讲空泛判断，多给观众一个能马上参考的标准。${platformTip}`,
    ending
  ]);

  const longScript = paragraphJoin([
    hook,
    `我建议你先别只看一句结论，因为越是和钱、时间、选择有关的话题，越容易被情绪放大。`,
    `${insight.reason}`,
    explanation,
    `先说第一个判断：它是不是短期波动。如果只是短期消息刺激，没必要立刻跟风；但如果上游供给、市场需求和库存都在变化，那影响就可能持续一段时间。`,
    `第二个判断：它和你有没有直接关系。${insight.example}`,
    `第三个判断：你有没有替代方案。如果不是马上必须买、必须做、必须选择，就可以把时间拉长一点，别在信息最吵的时候做决定。`,
    `${insight.advice}`,
    action,
    `用${style}的方式讲这类内容，重点不是制造焦虑，而是把原因、影响和选择讲明白，${tone}。`,
    `如果发到${platform}，还要注意：${platformTip}`,
    `最后总结一句：遇到${topic}这种话题，先问三个问题：为什么发生，影响谁，我现在要不要行动。能回答这三个问题，你就不会只被标题牵着走。`,
    ending
  ]);

  if (duration === 15) return shortScript;
  if (duration === 30) return mediumScript;
  return longScript;
}

function buildCreativeRequirementNote(creativeRequirement) {
  if (!creativeRequirement) return '';
  return `创作时还要特别注意：${creativeRequirement}。`;
}

function splitScript(script, count) {
  const sentences = script.match(/[^。！？!?]+[。！？!?]?/g) || [script];
  const buckets = Array.from({ length: count }, () => []);

  sentences.forEach((sentence, index) => {
    buckets[index % count].push(sentence);
  });

  return buckets.map((items) => items.join('').trim()).map((text) => text || script.slice(0, Math.ceil(script.length / count)));
}

function sceneCountByDuration(duration) {
  if (duration === 15) return 3;
  if (duration === 30) return 5;
  return 7;
}

export function generateStoryboard({ topic, platform, style, duration, audience }, speechScript) {
  const count = sceneCountByDuration(duration);
  const step = Math.ceil(duration / count);
  const scriptParts = splitScript(speechScript, count);
  const visuals = visualLibrary[style] || visualLibrary.default;
  const visualPlan = takeRandom(visuals, count);
  const cameraPlan = takeRandom(cameraLibrary, count);

  return Array.from({ length: count }, (_, index) => {
    const start = index * step;
    const end = index === count - 1 ? duration : Math.min(duration, (index + 1) * step);
    const voiceover = scriptParts[index] || `围绕${topic}继续补充重点。`;

    return {
      sceneNo: index + 1,
      timeRange: `${start}-${end}s`,
      visual: `${visualPlan[index] || pickRandom(visuals)}，围绕“${topic}”展开`,
      voiceover,
      subtitle: voiceover.length > 28 ? `${voiceover.slice(0, 28)}...` : voiceover,
      camera: `${cameraPlan[index] || pickRandom(cameraLibrary)}，适配${platform}${style}内容`
    };
  });
}

export function generateTags({ topic, platform, style, audience }) {
  const meme = getMemeInsight(topic);
  const topicWords = topic
    .split(/[\s,，、。?!？！]+/)
    .filter(Boolean)
    .slice(0, 2);

  const tags = [
    ...topicWords.map((word) => `#${word}`),
    `#${topic}`,
    `#${audience}`,
    `#${platform}`,
    `#${style}`,
    '#短视频创作',
    '#内容策划',
    '#实用干货',
    '#内容灵感',
    '#新媒体运营',
    style === '热点解读' ? '#热点观察' : '',
    style === '教程教学' ? '#教程分享' : '',
    style === '测评体验' ? '#真实测评' : '',
    style === '职场干货' ? '#职场成长' : '',
    style === '情感共鸣' ? '#情绪价值' : '',
    style === '搞笑娱乐' ? '#轻松一下' : '',
    ...(meme?.tags || []),
    '#AIGC'
  ];

  return [...new Set(tags.filter(Boolean))].slice(0, 10);
}

export function generatePublishAdvice({ topic, platform, style, audience }) {
  const platformInfo = platformAdviceMap[platform];
  const audiencePrefix = topic.includes(audience) ? '' : `${audience}`;
  const styleAdvice = {
    知识科普: '封面突出“原因/方法/误区”，正文用小标题分层解释。',
    生活分享: '封面更生活化，正文加入真实经历和前后变化。',
    产品种草: '封面突出适用人群和核心卖点，正文注意说明缺点和边界。',
    剧情口播: '封面制造冲突，前三秒先抛出悬念或反差。',
    热点解读: '封面突出“发生了什么/意味着什么”，发布时间尽量贴近热点窗口。',
    教程教学: '封面写清“几步完成”，正文用编号字幕提高收藏率。',
    测评体验: '封面直接给结论，正文用优缺点和适用人群建立信任。',
    职场干货: '封面强调具体收益，例如效率、沟通、避坑，结尾引导收藏。',
    情感共鸣: '封面用一句情绪化表达，正文控制语气，避免过度鸡汤。',
    搞笑娱乐: '封面突出反差或笑点，正文节奏要快，结尾用评论梗互动。'
  };
  const coverTexts = [
    `${topic}：${audience}一定要看`,
    `${topic}到底该怎么判断？`,
    `关于${topic}，这几点很关键`,
    `${audiencePrefix ? `${audiencePrefix}看懂` : ''}${topic}，先看这条`,
    `${style}版${topic}，建议收藏`
  ];
  const interactionGuides = [
    `你还想看哪个${style}选题？评论区告诉我，我继续拆给你。`,
    `你对${topic}最关心哪一点？可以打在评论区。`,
    `如果你想看更具体的案例，评论区留言“案例”。`,
    `这条先收藏，下次做相关选题时可以直接参考。`,
    `你觉得这个选题适合发在哪个平台？欢迎一起讨论。`
  ];

  return {
    bestTime: platformInfo.bestTime,
    coverText: pickRandom(coverTexts),
    interactionGuide: pickRandom(interactionGuides),
    platformAdvice: `${platformInfo.advice}${styleAdvice[style] || ''}`
  };
}

export function generateByTemplate(input) {
  const titles = generateTitles(input);
  const selectedTitle = selectTitle(titles);
  const speechScript = `${generateSpeechScript(input)}${buildCreativeRequirementNote(input.creativeRequirement)}`;
  const storyboard = generateStoryboard(input, speechScript);
  const tags = generateTags(input);
  const publishAdvice = generatePublishAdvice(input);

  return {
    titles,
    selectedTitle,
    speechScript,
    storyboard,
    tags,
    publishAdvice
  };
}
