import axios from 'axios';
import { buildCreationPrompt } from '../utils/promptBuilder.js';

function stripJsonFence(content) {
  return content
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function parseModelJson(content) {
  const cleanContent = stripJsonFence(content);
  return JSON.parse(cleanContent);
}

function validateAiResult(result) {
  if (!Array.isArray(result?.titles) || result.titles.length !== 5) {
    throw new Error('AI 返回的 titles 结构不正确');
  }
  if (!result.selectedTitle || typeof result.speechScript !== 'string') {
    throw new Error('AI 返回的标题或口播文案不完整');
  }
  if (!Array.isArray(result.storyboard) || result.storyboard.length === 0) {
    throw new Error('AI 返回的 storyboard 结构不正确');
  }
  if (!Array.isArray(result.tags) || result.tags.length < 8 || result.tags.length > 10) {
    throw new Error('AI 返回的 tags 数量不正确');
  }
  if (!result.publishAdvice?.bestTime || !result.publishAdvice?.platformAdvice) {
    throw new Error('AI 返回的 publishAdvice 不完整');
  }

  return result;
}

function getAiConfig() {
  return {
    provider: process.env.AI_PROVIDER || 'deepseek',
    apiKey: process.env.AI_API_KEY,
    baseUrl: (process.env.AI_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, ''),
    model: process.env.AI_MODEL || 'deepseek-chat'
  };
}

export async function generateWithAi(input) {
  const config = getAiConfig();

  if (!config.apiKey || config.apiKey === 'your_api_key_here') {
    throw new Error('AI_API_KEY 未配置');
  }

  const prompt = buildCreationPrompt(input);
  const response = await axios.post(
    `${config.baseUrl}/chat/completions`,
    {
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你是专业的中文短视频 AIGC 创作助手，只能返回严格 JSON。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
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

  return validateAiResult(parseModelJson(content));
}
