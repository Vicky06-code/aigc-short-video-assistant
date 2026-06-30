export const defaultPassword = 'Test123456';

export function uniqueUser(prefix = 'e2e') {
  const id = Math.random().toString(36).slice(2, 8);
  const safePrefix = prefix.slice(0, 10);
  return {
    username: `${safePrefix}_${id}`,
    email: `${safePrefix}_${Date.now()}_${id}@example.com`,
    password: defaultPassword
  };
}

export function creationPayload(overrides = {}) {
  return {
    topic: '大学生如何提高学习效率',
    platform: '小红书',
    style: '知识科普',
    duration: 30,
    audience: '大学生',
    creativeRequirement: '语言自然，有具体方法，结尾给出互动问题。',
    ...overrides
  };
}
