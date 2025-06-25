---
layout: layout-grid.jsx
title: DropGarden
url: /
renderOrder: 1
templateEngine: [njk, md]
description: 個人的なノート、リソース、用語集、書籍メモなどを織り交ぜたデジタルガーデン
---

{% block content %}
<h1 class="text-3xl font-bold mb-6 text-mono-black">DropGarden</h1>

<div class="prose max-w-none mb-8">
  <p>
    ここはドロップガーデン。日々の記録やアイデア、読書記録などを整理・共有するための個人的なデジタルガーデンです。
  </p>
</div>

<!-- カード形式でコンテンツを表示 -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <!-- Daily Log カード -->
  <div class="bg-mono-white rounded-lg shadow border border-mono-lightgray overflow-hidden">
    <div class="bg-mono-accent text-mono-white px-4 py-2">
      <h2 class="text-xl font-bold">Daily Log</h2>
    </div>
    <div class="p-4">
      {{ comp.dailylog ()| await | safe }}
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

<!-- Clipping Share カード -->
<div class="bg-mono-white rounded-lg shadow border border-mono-lightgray overflow-hidden mb-6">
  <div class="bg-mono-accent text-mono-white px-4 py-2">
    <h2 class="text-xl font-bold">Clipping Share</h2>
  </div>
  <div class="p-4">
    {{ comp.clippinglist() | await | safe }}
    <div class="mt-4">
      <a href="/clippingshare" class="text-mono-accent hover:text-mono-black font-medium">すべて見る →</a>
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
