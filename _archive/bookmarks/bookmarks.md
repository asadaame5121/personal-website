---
layout: layouts/base.njk
title: asadaameのブックマークコレクション
description: asadaameが収集したウェブサイトのコレクション
---

<div class="bookmarks-container">
  <div class="bookmarks-header">
    <h1>asadaameのブックマークコレクション</h1>
    <p>Obsidianのクリッピングから収集したウェブサイトのコレクションです。</p>
    <div class="bookmarks-controls">
      <div class="bookmarks-search">
        <input type="text" id="bookmark-search" placeholder="検索..." aria-label="ブックマークを検索">
      </div>
      <div class="bookmarks-view-toggle">
        <button id="grid-view-btn" class="view-btn active" aria-label="グリッド表示">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
        <button id="list-view-btn" class="view-btn" aria-label="リスト表示">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
        </button>
      </div>
      <div class="bookmarks-sort">
        <select id="bookmark-sort" aria-label="ブックマークの並び替え">
          <option value="newest">新しい順</option>
          <option value="oldest">古い順</option>
          <option value="az">タイトル (A-Z)</option>
          <option value="za">タイトル (Z-A)</option>
        </select>
      </div>
    </div>
  </div>

  <div class="bookmarks-content">
    <div class="bookmarks-sidebar">
      <div class="tags-filter">
        <h3>タグ</h3>
        <ul id="tags-list">
          {% for tag, count in bookmarks_sample.tags %}
          <li>
            <a href="#" class="tag-filter" data-tag="{{ tag }}">
              {{ tag }} <span class="tag-count">{{ count }}</span>
            </a>
          </li>
          {% endfor %}
        </ul>
      </div>
    </div>

    <div class="bookmarks-main">
      <div id="active-filters" class="active-filters">
        <!-- アクティブなフィルターがここに表示されます -->
      </div>

      <div id="bookmarks-container">
        {% set bookmarks = bookmarks_sample.bookmarks %}
        {% set view = "grid" %}
        {% include "bookmark-list.njk" %}
      </div>
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    // ビュー切り替え
    const gridBtn = document.getElementById('grid-view-btn');
    const listBtn = document.getElementById('list-view-btn');
    const bookmarksContainer = document.getElementById('bookmarks-container');
    
    gridBtn.addEventListener('click', function() {
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
      updateView('grid');
    });
    
    listBtn.addEventListener('click', function() {
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
      updateView('list');
    });
    
    function updateView(viewType) {
      // ここでビューを更新する処理を実装
      // 実際の実装ではAjaxリクエストやクライアントサイドレンダリングを使用
      console.log('View changed to:', viewType);
    }
    
    // 検索機能
    const searchInput = document.getElementById('bookmark-search');
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      filterBookmarks(searchTerm);
    });
    
    function filterBookmarks(term) {
      // 検索語に基づいてブックマークをフィルタリング
      console.log('Filtering bookmarks by:', term);
    }
    
    // タグフィルタリング
    const tagFilters = document.querySelectorAll('.tag-filter');
    tagFilters.forEach(filter => {
      filter.addEventListener('click', function(e) {
        e.preventDefault();
        const tag = this.getAttribute('data-tag');
        filterByTag(tag);
      });
    });
    
    function filterByTag(tag) {
      // タグに基づいてブックマークをフィルタリング
      console.log('Filtering by tag:', tag);
    }
    
    // ソート機能
    const sortSelect = document.getElementById('bookmark-sort');
    sortSelect.addEventListener('change', function() {
      const sortValue = this.value;
      sortBookmarks(sortValue);
    });
    
    function sortBookmarks(sortType) {
      // 選択された方法でブックマークをソート
      console.log('Sorting bookmarks by:', sortType);
    }
  });
</script>

<style>
  .bookmarks-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  
  .bookmarks-header {
    margin-bottom: 2rem;
  }
  
  .bookmarks-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    margin-top: 1rem;
  }
  
  .bookmarks-search {
    flex-grow: 1;
  }
  
  .bookmarks-search input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .bookmarks-view-toggle {
    display: flex;
    gap: 0.5rem;
  }
  
  .view-btn {
    background: none;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
    cursor: pointer;
  }
  
  .view-btn.active {
    background-color: #f0f0f0;
    border-color: #aaa;
  }
  
  .bookmarks-sort select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .bookmarks-content {
    display: flex;
    gap: 2rem;
  }
  
  .bookmarks-sidebar {
    width: 250px;
    flex-shrink: 0;
  }
  
  .bookmarks-main {
    flex-grow: 1;
  }
  
  .tags-filter h3 {
    margin-top: 0;
  }
  
  #tags-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  #tags-list li {
    margin-bottom: 0.5rem;
  }
  
  .tag-filter {
    display: flex;
    justify-content: space-between;
    text-decoration: none;
    color: #333;
    padding: 0.25rem 0;
  }
  
  .tag-count {
    background-color: #f0f0f0;
    border-radius: 10px;
    padding: 0.1rem 0.5rem;
    font-size: 0.8rem;
    color: #666;
  }
  
  .active-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  /* グリッド表示のスタイル */
  .bookmarks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .bookmark-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .bookmark-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .bookmark-thumbnail {
    height: 150px;
    background-color: #f5f5f5;
    overflow: hidden;
  }
  
  .bookmark-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .bookmark-thumbnail-placeholder {
    width: 100%;
    height: 100%;
    background-color: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .bookmark-content {
    padding: 1rem;
  }
  
  .bookmark-title {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }
  
  .bookmark-title a {
    text-decoration: none;
    color: #333;
  }
  
  .bookmark-favorite {
    color: gold;
    margin-left: 0.5rem;
  }
  
  .bookmark-description {
    margin-bottom: 1rem;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .bookmark-meta {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    font-size: 0.8rem;
  }
  
  .bookmark-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .bookmark-tag {
    background-color: #f0f0f0;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    text-decoration: none;
    color: #666;
  }
  
  .bookmark-date {
    color: #999;
  }
  
  /* リスト表示のスタイル */
  .bookmarks-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .bookmark-item {
    display: flex;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .bookmark-item-content {
    flex-grow: 1;
    padding: 1rem;
  }
  
  .bookmark-item-thumbnail {
    width: 150px;
    flex-shrink: 0;
  }
  
  .bookmark-item-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* レスポンシブ対応 */
  @media (max-width: 768px) {
    .bookmarks-content {
      flex-direction: column;
    }
    
    .bookmarks-sidebar {
      width: 100%;
      margin-bottom: 1.5rem;
    }
    
    .bookmark-item {
      flex-direction: column;
    }
    
    .bookmark-item-thumbnail {
      width: 100%;
      height: 150px;
    }
  }
</style>
