const platformTips = {
  抖音: { rhythm: '开头 3 秒强钩子，节奏快，结尾强互动', time: '12:00-13:00 或 19:00-22:00' },
  小红书: { rhythm: '突出真实体验和可收藏步骤，封面信息清晰', time: '11:30-13:30 或 20:00-22:30' },
  B站: { rhythm: '逻辑完整，适合加入案例和知识点拆解', time: '18:00-21:00' },
  视频号: { rhythm: '表达稳重，强调实用价值和转发场景', time: '07:30-09:00 或 20:00-21:30' }
};

const styleOpenings = {
  知识科普: '很多人以为这件事很复杂，其实掌握一个方法就够了。',
  生活分享: '今天想和你分享一个我最近亲测有效的小经验。',
  产品种草: '如果你正在纠结要不要尝试它，先看完这 30 秒。',
  剧情口播: '同样的问题，为什么有人轻松解决，有人却一直卡住？'
};

export function generateVideoPlan({ topic, platform, style, duration, audience }) {
  const tip = platformTips[platform] || platformTips.抖音;
  const opening = styleOpenings[style] || styleOpenings.知识科普;

  return {
    titles: [
      `${audience}一定要知道的${topic}`,
      `${duration}讲清楚：${topic}`,
      `别再盲目做了，${topic}这样更有效`,
      `${platform}爆款选题：${topic}的正确打开方式`,
      `新手也能学会的${topic}创作思路`
    ],
    script:
      `${opening}\n` +
      `这条视频围绕“${topic}”，专门讲给${audience}听。\n` +
      `第一步，先抓住最核心的痛点；第二步，用一个简单案例降低理解成本；第三步，给出可执行的方法。\n` +
      `如果你准备在${platform}发布，建议突出“${tip.rhythm}”。看完后，马上把这个思路用到你的下一条内容里。`,
    storyboard: [
      { time: '0-3秒', content: `用问题或反差开场，直接点出“${topic}”的痛点。` },
      { time: '4-12秒', content: `展示${audience}常见困惑，配合字幕强调关键词。` },
      { time: '13-24秒', content: `给出 2-3 个步骤，画面切换为演示、列表或实拍。` },
      { time: '25秒以后', content: `总结方法，抛出评论问题，引导收藏和关注。` }
    ],
    shotSuggestions:
      `建议采用近景口播 + 屏幕文字 + 场景 B-roll。${platform}发布时应注意：${tip.rhythm}。`,
    tags: [`#${topic}`, `#${platform}`, `#${style}`, '#短视频脚本', '#AIGC创作'],
    publishTime: tip.time,
    coverText: `${topic}，${duration}讲明白`,
    callToAction: `你还想看哪个${style}选题？评论区告诉我，我来继续拆解。`
  };
}
