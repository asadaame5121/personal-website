/**
 * ソーシャルブックマーク機能のJavaScript
 * 
 * 機能：
 * - ブックマークのフィルタリング（検索、タグ）
 * - ブックマークのソート（日付、アルファベット順）
 * - 表示形式の切り替え（グリッド/リスト）
 */

class BookmarkManager {
  constructor() {
    // DOM要素
    this.bookmarksContainer = document.getElementById('bookmarks-container');
    this.searchInput = document.getElementById('bookmark-search');
    this.sortSelect = document.getElementById('bookmark-sort');
    this.gridViewBtn = document.getElementById('grid-view-btn');
    this.listViewBtn = document.getElementById('list-view-btn');
    this.tagFilters = document.querySelectorAll('.tag-filter');
    this.activeFiltersContainer = document.getElementById('active-filters');
    
    // 状態管理
    this.bookmarks = []; // すべてのブックマーク
    this.filteredBookmarks = []; // フィルタリング後のブックマーク
    this.activeFilters = {
      search: '',
      tags: []
    };
    this.currentView = 'grid'; // 'grid' または 'list'
    this.currentSort = 'newest'; // デフォルトのソート
    
    // 初期化
    this.init();
  }
  
  /**
   * 初期化処理
   */
  init() {
    // ブックマークデータの取得
    this.fetchBookmarks();
    
    // イベントリスナーの設定
    this.setupEventListeners();
  }
  
  /**
   * ブックマークデータの取得
   */
  fetchBookmarks() {
    // ページに埋め込まれたデータを使用
    // 実際の実装では、JSON APIからデータを取得することもある
    const bookmarkElements = document.querySelectorAll('.bookmark-card, .bookmark-item');
    this.bookmarks = Array.from(bookmarkElements).map(el => {
      return {
        element: el,
        title: el.querySelector('.bookmark-title a').textContent.trim(),
        description: el.querySelector('.bookmark-description').textContent.trim(),
        tags: el.getAttribute('data-tags').split(','),
        date: el.querySelector('.bookmark-date').textContent.trim(),
        isFavorite: el.querySelector('.bookmark-favorite') !== null
      };
    });
    
    this.filteredBookmarks = [...this.bookmarks];
  }
  
  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // 検索
    this.searchInput.addEventListener('input', () => {
      this.activeFilters.search = this.searchInput.value.toLowerCase();
      this.applyFilters();
    });
    
    // ソート
    this.sortSelect.addEventListener('change', () => {
      this.currentSort = this.sortSelect.value;
      this.sortBookmarks();
    });
    
    // ビュー切り替え
    this.gridViewBtn.addEventListener('click', () => this.changeView('grid'));
    this.listViewBtn.addEventListener('click', () => this.changeView('list'));
    
    // タグフィルタリング
    this.tagFilters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        e.preventDefault();
        const tag = filter.getAttribute('data-tag');
        this.toggleTagFilter(tag);
      });
    });
  }
  
  /**
   * タグフィルターの切り替え
   * @param {string} tag - フィルタリングするタグ
   */
  toggleTagFilter(tag) {
    const index = this.activeFilters.tags.indexOf(tag);
    
    if (index === -1) {
      // タグを追加
      this.activeFilters.tags.push(tag);
    } else {
      // タグを削除
      this.activeFilters.tags.splice(index, 1);
    }
    
    this.updateActiveFiltersUI();
    this.applyFilters();
  }
  
  /**
   * アクティブなフィルターのUI更新
   */
  updateActiveFiltersUI() {
    this.activeFiltersContainer.innerHTML = '';
    
    // 検索フィルター
    if (this.activeFilters.search) {
      const searchFilter = document.createElement('div');
      searchFilter.className = 'active-filter';
      searchFilter.innerHTML = `
        <span>検索: ${this.activeFilters.search}</span>
        <button class="remove-filter" data-type="search">×</button>
      `;
      this.activeFiltersContainer.appendChild(searchFilter);
    }
    
    // タグフィルター
    this.activeFilters.tags.forEach(tag => {
      const tagFilter = document.createElement('div');
      tagFilter.className = 'active-filter';
      tagFilter.innerHTML = `
        <span>タグ: ${tag}</span>
        <button class="remove-filter" data-type="tag" data-tag="${tag}">×</button>
      `;
      this.activeFiltersContainer.appendChild(tagFilter);
    });
    
    // フィルター削除ボタンのイベント設定
    document.querySelectorAll('.remove-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        
        if (type === 'search') {
          this.searchInput.value = '';
          this.activeFilters.search = '';
        } else if (type === 'tag') {
          const tag = btn.getAttribute('data-tag');
          const index = this.activeFilters.tags.indexOf(tag);
          if (index !== -1) {
            this.activeFilters.tags.splice(index, 1);
          }
        }
        
        this.updateActiveFiltersUI();
        this.applyFilters();
      });
    });
  }
  
  /**
   * フィルターの適用
   */
  applyFilters() {
    this.filteredBookmarks = this.bookmarks.filter(bookmark => {
      // 検索フィルター
      if (this.activeFilters.search) {
        const searchTerm = this.activeFilters.search.toLowerCase();
        const matchesSearch = 
          bookmark.title.toLowerCase().includes(searchTerm) || 
          bookmark.description.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }
      
      // タグフィルター
      if (this.activeFilters.tags.length > 0) {
        const hasAllTags = this.activeFilters.tags.every(tag => 
          bookmark.tags.includes(tag)
        );
        
        if (!hasAllTags) return false;
      }
      
      return true;
    });
    
    // ソートとレンダリング
    this.sortBookmarks();
  }
  
  /**
   * ブックマークのソート
   */
  sortBookmarks() {
    switch (this.currentSort) {
      case 'newest':
        this.filteredBookmarks.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        this.filteredBookmarks.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'az':
        this.filteredBookmarks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'za':
        this.filteredBookmarks.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    
    this.renderBookmarks();
  }
  
  /**
   * ブックマークのレンダリング
   */
  renderBookmarks() {
    // すべての要素を非表示
    this.bookmarks.forEach(bookmark => {
      bookmark.element.style.display = 'none';
    });
    
    // フィルタリングされた要素を表示
    this.filteredBookmarks.forEach(bookmark => {
      bookmark.element.style.display = '';
    });
    
    // 結果がない場合のメッセージ
    if (this.filteredBookmarks.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = '該当するブックマークがありません。';
      this.bookmarksContainer.appendChild(noResults);
    } else {
      const noResults = this.bookmarksContainer.querySelector('.no-results');
      if (noResults) {
        noResults.remove();
      }
    }
  }
  
  /**
   * 表示形式の変更
   * @param {string} view - 'grid' または 'list'
   */
  changeView(view) {
    if (this.currentView === view) return;
    
    this.currentView = view;
    
    // ボタンのアクティブ状態を更新
    if (view === 'grid') {
      this.gridViewBtn.classList.add('active');
      this.listViewBtn.classList.remove('active');
    } else {
      this.gridViewBtn.classList.remove('active');
      this.listViewBtn.classList.add('active');
    }
    
    // ビューの切り替え
    // 実際の実装では、サーバーサイドでレンダリングするか、
    // クライアントサイドでHTMLを生成する
    
    // この例では簡易的に実装
    if (view === 'grid') {
      this.bookmarksContainer.classList.remove('bookmarks-list');
      this.bookmarksContainer.classList.add('bookmarks-grid');
    } else {
      this.bookmarksContainer.classList.remove('bookmarks-grid');
      this.bookmarksContainer.classList.add('bookmarks-list');
    }
  }
}

// DOMの読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
  new BookmarkManager();
});

// CSSスタイルの追加
const style = document.createElement('style');
style.textContent = `
  .active-filter {
    display: inline-flex;
    align-items: center;
    background-color: #f0f0f0;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .remove-filter {
    background: none;
    border: none;
    color: #666;
    margin-left: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .no-results {
    padding: 2rem;
    text-align: center;
    color: #666;
  }
`;
document.head.appendChild(style);
