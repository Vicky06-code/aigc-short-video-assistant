function getStoryboardCount(duration) {
  const value = Number.parseInt(duration, 10);
  if (value === 15) return 3;
  if (value === 30) return 5;
  return 7;
}

export function buildCreationPrompt({ topic, platform, style, duration, audience }) {
  const storyboardCount = getStoryboardCount(duration);

  return `
你是一个中文短视频内容策划专家。请根据以下信息生成短视频创作方案。

视频主题：${topic}
发布平台：${platform}
内容风格：${style}
视频时长：${duration} 秒
目标受众：${audience}

请严格返回 JSON，不要返回 Markdown，不要返回解释文字，不要使用代码块。

JSON 结构必须是：
{
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

硬性要求：
1. titles 必须生成 5 个中文短视频标题。
2. selectedTitle 必须从 titles 中选择一个最适合发布的标题。
3. speechScript 必须是适合中文短视频平台的完整口播文案。
4. storyboard 必须生成 ${storyboardCount} 个镜头。
5. 每个 storyboard 对象必须包含 sceneNo、timeRange、visual、voiceover、subtitle、camera。
6. tags 必须生成 8 到 10 个中文标签，标签要以 # 开头。
7. publishAdvice 必须包含推荐发布时间、封面文案、互动引导语和平台发布建议。
8. 内容必须适合 ${platform}，并符合 ${style} 的表达特点。
`.trim();
}
