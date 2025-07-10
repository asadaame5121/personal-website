---
layout: layout-grid.jsx
title: DropGarden
url: /
renderOrder: 1
templateEngine: [njk, md]
description: 個人的なノート、リソース、用語集、書籍メモなどを織り交ぜたデジタルガーデン
---
{% block head %}
  <link rel="me" href="https://github.com/asadaame5121">
  <link rel="webmention" href="https://webmention.io/asadaame5121.net/webmention" />
{% endblock %}

{% block content %}
<!-- IndieWeb h-card for Webmention/IndieLogin -->
<div class="h-card" style="display:none">
  <a class="u-url u-uid p-name" href="https://asadaame5121.net/">あさだあめ</a>
  <img class="u-photo" src="/assets/images/profile.jpg" alt="あさだあめ" />
  <span class="p-note">本を読んだりするおじさん。</span>
  <a class="u-github" rel="me" href="https://github.com/asadaame5121">GitHub</a>
  <a class="u-fediverse" rel="me" href="https://bsky.app/profile/asadaame5121.bsky.social">Fediverse</a>
</div>
<h1 class="text-3xl font-bold mb-6 text-mono-black">DropGarden</h1>

<div class="prose max-w-none mb-8">
  <p>
    ここはドロップガーデン。日々の記録やアイデア、読書記録などを整理・共有するための個人的なデジタルガーデンです。
  </p>
</div>

<!-- カード形式でコンテンツを表示 -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <!-- Daily Log カード（Alpine.js＋fetch） -->
  <div class="bg-mono-white rounded-lg shadow border border-mono-lightgray overflow-hidden">
    <div class="bg-mono-accent text-mono-white px-4 py-2">
      <h2 class="text-xl font-bold">Daily Log</h2>
    </div>
    <div class="p-4">
      <div x-data="{
        logs: [],
        loading: true,
        async fetchLogs() {
          const res = await fetch('https://asadaame5121externaldata.netlify.app/dailylog.json');
          let all = await res.json();
          // 昨日・今日のみ抽出
          const today = new Date();
const ymd = d => d.toISOString().slice(0, 10);
const todayStr = ymd(today);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayStr = ymd(yesterday);
this.logs = all.filter(l => {
  if (!l.datetime) return false;
  const entryDate = ymd(new Date(l.datetime));
  return entryDate === todayStr || entryDate === yesterdayStr;
});
          this.loading = false;
        }
      }"
      x-init="fetchLogs()"
      class="space-y-4"
      >
        <template x-if="loading">
          <div class="alert alert-info">読み込み中…</div>
        </template>
        <template x-if="!loading && logs.length === 0">
          <div class="alert alert-info">メモはありません</div>
        </template>
        <template x-for="l in logs" :key="l.id">
          <div class="card bg-base-100 shadow-md">
            <div class="card-body p-4">
              <div class="card-title text-base-content/80 text-sm mb-1" x-text="l.datetime ? l.datetime.slice(0,10) : ''"></div>
              <div class="prose max-w-none" x-text="l.content"></div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
  
  <!-- Reading List カード（従来通り） -->
  <div class="bg-mono-white rounded-lg shadow border border-mono-lightgray overflow-hidden">
    <div class="bg-mono-accent text-mono-white px-4 py-2">
      <h2 class="text-xl font-bold">Reading List</h2>
    </div>
    <div class="p-4">
      {{ comp.readinglist ()| await | safe }}
    </div>
  </div>
  <!-- Clippingshareカード（Alpine.js＋fetch, 2カラム分表示） -->
  <div class="bg-mono-white rounded-lg shadow border border-mono-lightgray overflow-hidden md:col-span-2">
    <div class="bg-mono-accent text-mono-white px-4 py-2">
      <h2 class="text-xl font-bold">Clippingshare</h2>
    </div>
    <div class="p-4">
      <div x-data="{
        clippings: [],
        loading: true,
        async fetchClippings() {
          const res = await fetch('https://asadaame5121externaldata.netlify.app/clippingshare.json');
          const all = await res.json();
          this.clippings = Array.isArray(all) ? all.slice(0, 10) : [];
          this.loading = false;
        }
      }"
      x-init="fetchClippings()"
      class="space-y-4"
      >
        <template x-if="loading">
          <div class="alert alert-info">読み込み中…</div>
        </template>
        <template x-if="!loading && clippings.length === 0">
          <div class="alert alert-info">クリッピングはありません</div>
        </template>
        <template x-for="c in clippings" :key="c.id">
  <div class="card bg-base-100 shadow-md">
    <div class="card-body p-4">
      <div class="card-title text-base-content/80 text-sm mb-1">
        <a :href="c.url" class="link link-primary" x-text="c.title"></a>
      </div>
      <div class="prose max-w-none" x-text="c.content"></div>
      <template x-if="c.comment && c.comment.length > 0">
        <div class="mt-2 text-xs text-mono-black/70" x-text="c.comment"></div>
      </template>
      <template x-if="c.source && c.source.length > 0">
        <div class="mt-1 text-xs">
          <span class="text-mono-silver">出典: </span>
          <span x-text="c.source"></span>
        </div>
      </template>
    </div>
  </div>
</template>
      </div>
      <div class="mt-4">
        <a href="/clippingshare" class="text-mono-accent hover:text-mono-black font-medium">すべて見る →</a>
      </div>
    </div>
  </div>
</div>
{% endblock %}

{% block sidebar %}
<div>
  <h3 class="text-lg font-bold mb-2 text-mono-black">タグクラウド</h3>
  <div class="flex flex-wrap gap-2">
    {% for tag in tags %}
    <a href="/tags/{{ tag.name | slug }}" 
       class="text-sm px-2 py-1 bg-mono-white border border-mono-lightgray rounded hover:bg-mono-lightgray text-mono-accent" 
       style="font-size: {{ 0.8 + tag.count * 0.05 }}rem">
      {{ tag.name }}
    </a>
    {% endfor %}
  </div>
</div>
{% endblock %}
