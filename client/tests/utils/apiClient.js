import { expect } from '@playwright/test';
import { creationPayload, uniqueUser } from './testData.js';

export async function registerUser(request, user = uniqueUser()) {
  const response = await request.post('/api/auth/register', {
    data: {
      username: user.username,
      email: user.email,
      password: user.password
    }
  });

  // Existing users are acceptable when a caller passes fixed test data.
  expect([200, 201, 400, 409]).toContain(response.status());
  return user;
}

export async function loginUser(request, user) {
  const response = await request.post('/api/auth/login', {
    data: {
      email: user.email,
      password: user.password
    }
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBeTruthy();
  expect(body.token).toBeTruthy();
  return body;
}

export async function createLoggedInUser(request) {
  const user = uniqueUser();
  await registerUser(request, user);
  const login = await loginUser(request, user);
  return { user, token: login.token, profile: login.user };
}

export async function loginByLocalStorage(page, auth) {
  await page.addInitScript(({ token, profile }) => {
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('user', JSON.stringify(profile));
  }, auth);
}

export async function generateByApi(request, token, input = creationPayload()) {
  const response = await request.post('/api/creation/generate', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      ...input,
      generationMode: 'template'
    }
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBeTruthy();
  expect(body.data?.titles?.length).toBeGreaterThanOrEqual(5);
  return { input, result: body.data, generationMode: body.generationMode || 'template' };
}

export async function saveCreationByApi(request, token, generated) {
  const response = await request.post('/api/creation/save', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      ...generated.input,
      titles: generated.result.titles,
      speechScript: generated.result.speechScript,
      storyboard: generated.result.storyboard,
      tags: generated.result.tags,
      publishAdvice: generated.result.publishAdvice,
      generationMode: generated.generationMode
    }
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBeTruthy();
  return body.data;
}
