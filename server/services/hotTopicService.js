import axios from 'axios';
import { logWarn } from '../utils/logger.js';

const fallbackPools = [
  ['AI 工具效率', '高考志愿选择', '大学生暑期成长', '职场新人沟通', '国产品牌出海', '年轻人副业规划'],
  ['毕业季租房避坑', '短视频账号定位', '新能源车使用体验', '情绪管理方法', '个人 IP 打造', '健康饮食习惯'],
  ['暑期旅行计划', 'AI 手机应用', '小红书爆款笔记', 'B站知识区创作', '年轻人存钱方法', '职场效率工具'],
  ['消费降级与理性购物', '学习效率提升', '内容团队 AI 工作流', '面试表达技巧', '本地生活探店', '普通人拍视频'],
  ['热点事件复盘', '产品测评方法', '生活方式变化', '大学生实习准备', '职场反内耗', '社交媒体增长']
];

const platforms = ['抖音', '小红书', 'B站', '视频号'];
const styles = ['热点解读', '知识科普', '教程教学', '生活分享', '职场干货', '测评体验'];
const audiences = ['内容创作者', '大学生', '职场新人', '品牌运营人员', '普通用户', '新手博主'];
const tagTypes = ['danger', 'success', 'warning', 'primary', 'info'];

function getDayIndex(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / 86400000);
}

function cleanHotWord(word) {
  return String(word || '')
    .replace(/\\u003c[^>]+\\u003e/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[#"<>]/g, '')
    .trim();
}

function unique(items) {
  return [...new Set(items.map(cleanHotWord).filter((item) => item.length >= 2))];
}

async function fetchBaiduHotWords() {
  const response = await axios.get('https://top.baidu.com/board?tab=realtime', {
    timeout: 6000,
    headers: {
      'User-Agent': 'Mozilla/5.0 AIGCShortVideoAssistant/1.0'
    }
  });

  const html = String(response.data || '');
  const words = [];
  const patterns = [
    /"word":"([^"]+)"/g,
    /"query":"([^"]+)"/g,
    /class="c-single-text-ellipsis">([^<]+)</g
  ];

  patterns.forEach((pattern) => {
    let match = pattern.exec(html);
    while (match) {
      words.push(match[1]);
      match = pattern.exec(html);
    }
  });

  return unique(words).slice(0, 8);
}

function getFallbackWords(date = new Date()) {
  const dayIndex = getDayIndex(date);
  const pool = fallbackPools[dayIndex % fallbackPools.length];
  return pool.map((word, index) => pool[(index + dayIndex) % pool.length]);
}

function buildTopicItem(word, index, source) {
  const platform = platforms[index % platforms.length];
  const style = styles[index % styles.length];
  const audience = audiences[index % audiences.length];

  return {
    topic: `${word}如何做成短视频选题`,
    rawTopic: word,
    reason: source === 'baidu'
      ? `来自今日热榜的高关注话题，适合快速拆解事件背景、用户关注点和可拍摄角度。`
      : `根据日期轮换的备用热点选题，适合在热榜接口不可用时保持每日内容灵感更新。`,
    platform,
    platformLabel: platform,
    style,
    styleLabel: style,
    audience,
    heat: String(Math.max(70, 98 - index * 5)),
    tagType: tagTypes[index % tagTypes.length],
    creativeRequirement: `结合今日热点“${word}”，先解释为什么大家关注，再给出适合短视频表达的切入角度。`
  };
}

export async function getDailyHotTopics() {
  const today = new Date();

  try {
    const hotWords = await fetchBaiduHotWords();
    if (hotWords.length >= 3) {
      return {
        source: 'baidu',
        date: today.toISOString().slice(0, 10),
        topics: hotWords.slice(0, 6).map((word, index) => buildTopicItem(word, index, 'baidu'))
      };
    }
  } catch (error) {
    logWarn('Fetch hot topics failed, fallback to local rotating pool', { message: error.message });
  }

  const fallbackWords = getFallbackWords(today);
  return {
    source: 'fallback',
    date: today.toISOString().slice(0, 10),
    topics: fallbackWords.slice(0, 6).map((word, index) => buildTopicItem(word, index, 'fallback'))
  };
}
