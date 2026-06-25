<template>
  <div class="page-grid">
    <section class="dashboard-hero">
      <div>
        <h2>基于 AIGC 的智能短视频内容创作辅助系统</h2>
        <p>
          面向课程答辩展示的短视频创作工具，支持从主题输入到标题推荐、口播文案、分镜脚本、
          热门标签和发布建议的一站式生成。
        </p>
      </div>
      <div class="hero-panel">
        <strong>今日创作提示</strong>
        <span>{{ todayTip }}</span>
      </div>
    </section>

    <section class="feature-grid">
      <article v-for="item in features" :key="item.title" class="feature-card" @click="go(item.path)">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </article>
    </section>

    <section class="panel-card">
      <div class="section-title">
        <h2>系统简介</h2>
        <p>
          当前版本使用规则模板模拟 AIGC，后端 service 层已预留 DeepSeek/OpenAI API 替换入口。
          系统按 MVP 思路持续迭代，优先保证可运行、可演示、可扩展。
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const todayTip = '先用一个具体问题切入主题，再把解决方法拆成 3 个步骤，生成内容会更像真实短视频方案。';

const features = [
  { title: '智能创作', description: '输入主题、平台、风格、时长和受众，生成完整创作方案。', path: '/create' },
  { title: '历史记录', description: '预留生成结果管理区域，方便后续保存、查看和删除。', path: '/history' },
  { title: '结果导出', description: '生成结构化内容，后续可扩展复制、TXT 和 JSON 导出。', path: '/create' },
  { title: 'AIGC 说明', description: '当前采用规则模板模拟，后续可替换真实大模型 API。', path: '/profile' }
];

function go(path) {
  router.push(path);
}
</script>
