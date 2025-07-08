---
title: DropGarden
layout: layout-grid.jsx
templateEngine: [njk, md]
---
<!-- ここに他のインデックス用本文や説明文を追加できます -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <!-- Daily Log カード -->
  <div class="bg-mono-white rounded-lg shadow border border-mono-lightgray overflow-hidden">
    <div class="bg-mono-accent text-mono-white px-4 py-2">
      <h2 class="text-xl font-bold">Daily Log</h2>
    </div>
    <div class="p-4">
      <div x-data="{
        logs: [],
        loading: true,
        async fetchLogs() {
          const res = await fetch('/dailylog.json');
          let all = await res.json();
          // 昨日・今日のみ抽出
          const today = new Date();
          const ymd = d => d.toISOString().slice(0, 10);
          const todayStr = ymd(today);
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const yesterdayStr = ymd(yesterday);
          this.logs = all.filter(l => l.date === todayStr || l.date === yesterdayStr);
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
              <div class="card-title text-base-content/80 text-sm mb-1" x-text="l.date"></div>
              <div class="prose max-w-none" x-text="l.content"></div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
  
  <!-- Reading List カード -->
  <div class="bg-mono-white rounded-lg shadow border border-mono-lightgray overflow-hidden">
    <div class="bg-mono-accent text-mono-white px-4 py-2">
      <h2 class="text-xl font-bold">Reading List</h2>
    </div>
    <div class="p-4">
      {{ comp.readinglist ()| await | safe }}
    </div>
  </div>
</div>
<!-- Clippingshare一覧（Alpine.js＋fetch） -->
<div x-data="{
    clippings: [],
    loading: true,
    async fetchClippings() {
      const res = await fetch('/clippingshare.json');
      const all = await res.json();
      this.clippings = Array.isArray(all) ? all.slice(0, 10) : [];
      this.loading = false;
    }
  }"
  x-init="fetchClippings()"
  class="p-4 max-w-xl mx-auto"
>
  <div class="text-lg font-bold mb-2 badge badge-primary">Clippingshare</div>
  <div class="space-y-4">
    <template x-if="loading">
      <div class="alert alert-info">読み込み中…</div>
    </template>
    <template x-if="!loading && clippings.length === 0">
      <div class="alert alert-info">クリッピングはありません</div>
    </template>
    <template x-for="c in clippings" :key="c.id">
      <div class="card bg-base-100 shadow-md">
        <div class="card-body p-4">
          <div class="card-title text-base-content/80 text-sm mb-1" x-text="c.title"></div>
          <div class="prose max-w-none">
            <a :href="c.url" class="underline" x-text="c.url"></a>
            <template x-if="c.comment">
              <div class="mt-2 text-xs text-gray-500" x-text="c.comment"></div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</div>


