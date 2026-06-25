const PLATFORMS = ['抖音', '小红书', 'B站', '视频号'];
const STYLES = ['知识科普', '生活分享', '产品种草', '剧情口播'];
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
  知识科普: '用清晰逻辑解释原因和方法',
  生活分享: '用真实体验拉近距离',
  产品种草: '突出痛点、卖点和使用场景',
  剧情口播: '用冲突和反转推动表达'
};

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
      audience: input.audience?.trim()
    }
  };
}

export function generateTitles({ topic, platform, style, audience }) {
  return [
    `${topic}的 3 个关键方法，${audience}建议收藏`,
    `为什么你总是做不好${topic}？可能是方法错了`,
    `${audience}都懂的${topic}技巧，看完马上能用`,
    `${topic}实用干货：从新手到上手只差这几步`,
    `适合${platform}发布的${style}选题：${topic}`
  ];
}

export function selectTitle(titles) {
  return titles[0];
}

export function generateSpeechScript({ topic, platform, style, duration, audience }) {
  const tone = styleToneMap[style];
  const platformTip = platformAdviceMap[platform].advice;

  const shortScript =
    `你是不是也想做好${topic}？其实关键不是更努力，而是方法更清楚。` +
    `对${audience}来说，先找到一个具体目标，再拆成每天能完成的小动作。` +
    `想继续看这种${style}内容，记得收藏。`;

  const mediumScript =
    `你有没有发现，很多人想做好${topic}，但坚持几天就放弃了？` +
    `问题通常不是能力不够，而是步骤太模糊。${audience}可以先明确一个结果，再拆成三个动作：` +
    `第一，找到最影响效率的环节；第二，给自己设置固定执行时间；第三，每天复盘一次。` +
    `${tone}，会让内容更容易被理解。觉得有用，先收藏起来。`;

  const longScript =
    `如果你正在为${topic}发愁，这条视频请认真看完。很多${audience}不是不努力，` +
    `而是把目标定得太大，导致一开始就很难执行。我们可以换一种方式：先确定最想解决的一个问题，` +
    `再把它拆成 3 个小步骤。第一步，记录当前卡住的位置；第二步，找到一个能马上开始的动作；` +
    `第三步，用一天一次的复盘优化方法。用${style}的表达方式，可以${tone}。` +
    `如果发布到${platform}，还要注意：${platformTip}。想要我继续拆解这个主题，可以在评论区留言。`;

  if (duration === 15) return shortScript.slice(0, 80);
  if (duration === 30) return mediumScript.slice(0, 150);
  return longScript.slice(0, 260);
}

function splitScript(script, count) {
  const clean = script.replace(/\s+/g, '');
  const size = Math.ceil(clean.length / count);
  return Array.from({ length: count }, (_, index) => clean.slice(index * size, (index + 1) * size));
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
    `用大字标题抛出“${topic}”的问题`,
    `展示${audience}常见困惑或真实场景`,
    `用列表或便签呈现第一个关键方法`,
    `切换到操作演示或案例画面`,
    `补充对比画面，强调错误做法和正确做法`,
    `总结方法，突出可执行步骤`,
    `用评论问题和关注提示收尾`
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
      subtitle: voiceover.length > 24 ? `${voiceover.slice(0, 24)}...` : voiceover,
      camera: `${cameras[index]}，适配${platform}${style}内容`
    };
  });
}

export function generateTags({ topic, platform, style, audience }) {
  const topicWords = topic
    .split(/[\s,，、。.!！?？]+/)
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
    '#干货分享',
    '#新媒体运营',
    '#AIGC'
  ];

  return [...new Set(tags)].slice(0, 10);
}

export function generatePublishAdvice({ topic, platform, style, audience }) {
  const platformInfo = platformAdviceMap[platform];

  return {
    bestTime: platformInfo.bestTime,
    coverText: `${topic}，${audience}一定要看`,
    interactionGuide: `你还想看哪个${style}选题？评论区告诉我，我继续拆给你。`,
    platformAdvice: platformInfo.advice
  };
}

export function generateByTemplate(input) {
  const titles = generateTitles(input);
  const selectedTitle = selectTitle(titles);
  const speechScript = generateSpeechScript(input);
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
