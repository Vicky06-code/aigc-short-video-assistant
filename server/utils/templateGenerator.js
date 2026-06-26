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

function getTopicInsight(topic, audience) {
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
  return [
    `${topic}的 3 个关键判断，${audience}建议收藏`,
    `为什么大家都在关注${topic}？背后原因一次讲清楚`,
    `${audience}必须了解的${topic}方法，看完就能用`,
    `${topic}实用指南：从问题到解决只差这几步`,
    `适合${platform}发布的${style}选题：${topic}`
  ];
}

export function selectTitle(titles) {
  return titles[0];
}

function paragraphJoin(parts) {
  return parts.filter(Boolean).join('');
}

export function generateSpeechScript({ topic, platform, style, duration, audience }) {
  const tone = styleToneMap[style];
  const platformTip = platformAdviceMap[platform].advice;
  const insight = getTopicInsight(topic, audience);

  const shortScript = paragraphJoin([
    `${insight.hook}`,
    `${insight.reason}`,
    `${insight.advice}`,
    `如果你想继续看这类选题，先收藏，评论区告诉我你最关心哪一点。`
  ]);

  const mediumScript = paragraphJoin([
    `${insight.hook}`,
    `很多人第一反应是紧张，或者马上问“现在要不要行动”，但越是这种时候，越要先把原因讲清楚。`,
    `${insight.reason}`,
    `${insight.example}`,
    `${insight.advice}`,
    `这类${style}内容发布到${platform}时，表达要更具体，少讲空泛判断，多给观众一个能马上参考的标准。${platformTip}`,
    `如果你想继续看这类解释，可以先收藏，也可以在评论区告诉我你最想弄明白的点。`
  ]);

  const longScript = paragraphJoin([
    `${insight.hook}`,
    `我建议你先别只看一句结论，因为越是和钱、时间、选择有关的话题，越容易被情绪放大。`,
    `${insight.reason}`,
    `先说第一个判断：它是不是短期波动。如果只是短期消息刺激，没必要立刻跟风；但如果上游供给、市场需求和库存都在变化，那影响就可能持续一段时间。`,
    `第二个判断：它和你有没有直接关系。${insight.example}`,
    `第三个判断：你有没有替代方案。如果不是马上必须买、必须做、必须选择，就可以把时间拉长一点，别在信息最吵的时候做决定。`,
    `${insight.advice}`,
    `用${style}的方式讲这类内容，重点不是制造焦虑，而是把原因、影响和选择讲明白，${tone}。`,
    `如果发到${platform}，还要注意：${platformTip}`,
    `最后总结一句：遇到${topic}这种话题，先问三个问题：为什么发生，影响谁，我现在要不要行动。能回答这三个问题，你就不会只被标题牵着走。`,
    `如果你觉得这条内容有用，可以先收藏起来，下次遇到类似变化时再对照看。评论区也可以告诉我，你还想让我拆解哪个具体问题。`
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

  const visuals = [
    `大字标题抛出“${topic}”的核心问题`,
    `展示${audience}常见困惑或真实使用场景`,
    '用列表、便签或屏幕录制呈现核心判断',
    '切换到案例画面，展示错误做法和正确做法',
    '用对比画面强调方法带来的变化',
    '总结步骤，突出可执行动作',
    '用评论问题和关注提示收尾'
  ];

  const cameras = [
    '近景口播，开头快速推进',
    '中景实拍，搭配屏幕字幕',
    '俯拍桌面或屏幕录制',
    '快切 B-roll，节奏略快',
    '分屏对比，突出反差',
    '稳定中近景，语速放缓',
    '正面口播，眼神看镜头'
  ];

  return Array.from({ length: count }, (_, index) => {
    const start = index * step;
    const end = index === count - 1 ? duration : Math.min(duration, (index + 1) * step);
    const voiceover = scriptParts[index] || `围绕${topic}继续补充重点。`;

    return {
      sceneNo: index + 1,
      timeRange: `${start}-${end}s`,
      visual: visuals[index],
      voiceover,
      subtitle: voiceover.length > 28 ? `${voiceover.slice(0, 28)}...` : voiceover,
      camera: `${cameras[index]}，适配${platform}${style}内容`
    };
  });
}

export function generateTags({ topic, platform, style, audience }) {
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
    '#运营增长',
    '#新媒体运营',
    '#AIGC'
  ];

  return [...new Set(tags)].slice(0, 10);
}

export function generatePublishAdvice({ topic, platform, style, audience }) {
  const platformInfo = platformAdviceMap[platform];

  return {
    bestTime: platformInfo.bestTime,
    coverText: `${topic}：${audience}一定要看`,
    interactionGuide: `你还想看哪个${style}选题？评论区告诉我，我继续拆给你。`,
    platformAdvice: platformInfo.advice
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
