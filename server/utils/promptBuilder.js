function getStoryboardCount(duration) {
  const value = Number.parseInt(duration, 10);
  if (value === 15) return 3;
  if (value === 30) return 5;
  return 7;
}

function getScriptLengthRule(duration) {
  const value = Number.parseInt(duration, 10);
  if (value === 15) return '口播文案控制在 120 到 180 个中文字符，节奏紧凑但信息完整。';
  if (value === 30) return '口播文案控制在 260 到 380 个中文字符，必须像一段完整可录制的视频口播，而不是摘要。';
  return '口播文案控制在 480 到 680 个中文字符，必须包含更充分的解释、例子、步骤和结尾引导，但不要为了凑字数重复空话。';
}

export function buildCreationPrompt({ topic, platform, style, duration, audience, creativeRequirement }) {
  const storyboardCount = getStoryboardCount(duration);
  const scriptLengthRule = getScriptLengthRule(duration);
  const requirementText = creativeRequirement?.trim()
    ? `\n自由创作要求：${creativeRequirement.trim()}`
    : '';

  return `
你是一个专业的中文短视频内容策划专家，请根据以下信息生成完整短视频创作方案。

视频主题：${topic}
发布平台：${platform}
内容风格：${style}
视频时长：${duration} 秒
目标受众：${audience}
${requirementText}

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
1. titles 必须生成 5 个中文短视频标题，标题要有点击欲望，但不能夸大事实。
2. selectedTitle 必须从 titles 中选择一个最适合发布的标题。
3. speechScript 必须是完整口播文案，不要只写几句话，不要写提纲，不要分点罗列。
4. ${scriptLengthRule}
5. speechScript 必须包含：开头 3 秒钩子、问题解释、核心观点、至少 1 个具体例子或建议、结尾互动引导。
6. speechScript 要口语化、自然、有节奏，适合真人直接照着录制。
7. speechScript 必须围绕“${topic}”本身展开，直接解释现象、原因、影响和行动建议，不要写成泛泛的内容运营方法论。
8. 如果主题是网络热梗、互联网流行语、谐音梗、评论区用语或短句梗，不要按字面意思严肃解释；必须先说明它是一个梗，再解释真实语境、情绪含义、使用场景、使用边界，并给出自然例子。
9. 除非主题本身和运营、营销有关，否则不要使用“痛点、场景、转化、用户需求、平台适配、选题”等生硬术语。
10. storyboard 必须生成 ${storyboardCount} 个镜头，并且必须是数组。
11. 每个 storyboard 对象必须包含 sceneNo、timeRange、visual、voiceover、subtitle、camera。
12. storyboard 的 voiceover 要从 speechScript 中按顺序拆分，不能过短，每个镜头都要有具体口播内容。
13. tags 必须生成 8 到 10 个中文标签，标签要以 # 开头。
14. publishAdvice 必须包含推荐发布时间、封面文案、互动引导语和平台发布建议。
15. 内容必须适合 ${platform}，并符合 ${style} 的表达特点。
16. 如果提供了自由创作要求，必须优先遵循；如果自由要求与基础风格冲突，以自由创作要求为准。
`.trim();
}
