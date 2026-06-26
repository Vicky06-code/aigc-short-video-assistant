import axios from 'axios';
import { buildCreationPrompt } from '../utils/promptBuilder.js';
import { logInfo } from '../utils/logger.js';

function stripJsonFence(content) {
  const cleanContent = content
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const jsonStart = cleanContent.indexOf('{');
  const jsonEnd = cleanContent.lastIndexOf('}');
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    return cleanContent.slice(jsonStart, jsonEnd + 1);
  }

  return cleanContent;
}

function parseModelJson(content) {
  const cleanContent = stripJsonFence(content);
  return JSON.parse(cleanContent);
}

function getExpectedStoryboardCount(duration) {
  const value = Number(duration);
  if (value === 15) return 3;
  if (value === 30) return 5;
  if (value === 60) return 7;
  return 5;
}

function normalizeStoryboard(storyboard) {
  const items = Array.isArray(storyboard)
    ? storyboard
    : Object.values(storyboard || {});

  return items.map((item, index) => ({
    sceneNo: Number(item.sceneNo || item.scene || index + 1),
    timeRange: String(item.timeRange || item.time || ''),
    visual: String(item.visual || item.picture || item.sceneDescription || ''),
    voiceover: String(item.voiceover || item.voiceOver || item.script || item.narration || ''),
    subtitle: String(item.subtitle || item.caption || item.voiceover || item.voiceOver || ''),
    camera: String(item.camera || item.shot || item.cameraAdvice || '')
  }));
}

function validateAiResult(result, input) {
  if (!Array.isArray(result?.titles) || result.titles.length !== 5) {
    throw new Error('AI 返回的 titles 结构不正确');
  }
  if (!result.selectedTitle || typeof result.speechScript !== 'string') {
    throw new Error('AI 返回的标题或口播文案不完整');
  }
  result.storyboard = normalizeStoryboard(result.storyboard);
  const expectedStoryboardCount = getExpectedStoryboardCount(input.duration);
  if (result.storyboard.length !== expectedStoryboardCount) {
    throw new Error('AI 返回的 storyboard 结构不正确');
  }
  const invalidStoryboard = result.storyboard.some((item) => (
    !item.sceneNo || !item.timeRange || !item.visual || !item.voiceover || !item.subtitle || !item.camera
  ));
  if (invalidStoryboard) {
    throw new Error('AI 返回的 storyboard 字段不完整');
  }
  if (!Array.isArray(result.tags) || result.tags.length < 8 || result.tags.length > 10) {
    throw new Error('AI 返回的 tags 数量不正确');
  }
  if (!result.publishAdvice?.bestTime || !result.publishAdvice?.platformAdvice) {
    throw new Error('AI 返回的 publishAdvice 不完整');
  }

  return result;
}

function getMinSpeechLength(duration) {
  const value = Number(duration);
  if (value === 15) return 120;
  if (value === 30) return 260;
  if (value === 60) return 520;
  return 180;
}

function buildMessages(prompt, retryReason = '') {
  const messages = [
    {
      role: 'system',
      content: '你是专业的中文短视频 AIGC 创作助手，只能返回严格 JSON。口播文案必须是完整可直接录制的成片文案，不能只写摘要。'
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  if (retryReason) {
    messages.push({
      role: 'user',
      content: `上一版结果不符合要求：${retryReason}。请重新生成完整 JSON，重点扩写 speechScript，让它像真实短视频口播稿，包含开头吸引、原因解释、案例或建议、结尾引导。不要返回 Markdown，不要解释。`
    });
  }

  return messages;
}

function getAiConfig() {
  return {
    provider: process.env.AI_PROVIDER || 'deepseek',
    apiKey: process.env.AI_API_KEY,
    baseUrl: (process.env.AI_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, ''),
    model: process.env.AI_MODEL || 'deepseek-chat'
  };
}

async function requestAiJson(config, input, prompt, retryReason = '') {
  const response = await axios.post(
    `${config.baseUrl}/chat/completions`,
    {
      model: config.model,
      messages: buildMessages(prompt, retryReason),
      temperature: 0.7
    },
    {
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`${config.provider} API 未返回有效内容`);
  }

  return validateAiResult(parseModelJson(content), input);
}

export async function generateWithAi(input) {
  const config = getAiConfig();

  if (!config.apiKey || config.apiKey === 'your_api_key_here') {
    throw new Error('AI_API_KEY 未配置');
  }

  const prompt = buildCreationPrompt(input);
  const minLength = getMinSpeechLength(input.duration);

  logInfo('AI generation requested', {
    provider: config.provider,
    model: config.model,
    platform: input.platform,
    duration: input.duration
  });

  let firstResult;
  try {
    firstResult = await requestAiJson(config, input, prompt);
  } catch (error) {
    logInfo('AI result invalid, requesting repaired JSON', {
      reason: error.message,
      duration: input.duration
    });

    return requestAiJson(
      config,
      input,
      prompt,
      `${error.message}。请严格按指定 JSON 结构重新生成，storyboard 必须是数组，镜头数量必须正确，每个镜头字段必须完整`
    );
  }

  if (firstResult.speechScript.length >= minLength) {
    return firstResult;
  }

  logInfo('AI speech script too short, requesting expanded version', {
    length: firstResult.speechScript.length,
    minLength,
    duration: input.duration
  });

  const expandedResult = await requestAiJson(
    config,
    input,
    prompt,
    `speechScript 当前约 ${firstResult.speechScript.length} 字，至少需要 ${minLength} 字`
  );

  if (expandedResult.speechScript.length < minLength) {
    throw new Error(`AI 返回的口播文案仍然过短，当前约 ${expandedResult.speechScript.length} 字，至少需要 ${minLength} 字`);
  }

  return expandedResult;
}
