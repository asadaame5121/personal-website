// assets/js/clipping.js
class ClippingManager {
  constructor() {
    // DOM要素
    this.clippingsContainer = document.getElementById('clippings-container');
    this.searchInput = document.getElementById('clipping-search');
    this.sortSelect = document.getElementById('clipping-sort');
    this.gridViewBtn = document.getElementById('grid-view');
    this.listViewBtn = document.getElementById('list-view');
    this.tagButtons = document.querySelectorAll('.tag-btn');
    this.noResultsEl = document.getElementById('no-results');
    
    // クリッピングアイテム
    this.clippings = Array.from(document.querySelectorAll('.clipping-item')).map(el => ({
      element: el,
      id: el.dataset.id,
      title: el.dataset.title,
      tags: el.dataset.tags.split(','),
      date: new Date(el.dataset.date),
      source: el.dataset.source
    }));
    
    // 現在の状態
    this.currentTag = 'all';
    this.currentSort = 'date-desc';
    this.currentView = 'grid';
    this.searchTerm = '';
    
    // イベントリスナーの設定
    this.setupEventListeners();
    
    // 初期表示
    this.renderClippings();
  }
  
  setupEventListeners() {
    // 検索
    this.searchInput.addEventListener('input', () => {
      this.searchTerm = this.searchInput.value.toLowerCase();
      this.renderClippings();
    });
    
    // ソート
    this.sortSelect.addEventListener('change', () => {
      this.currentSort = this.sortSelect.value;
      this.renderClippings();
    });
    
    // 表示切替
    this.gridViewBtn.addEventListener('click', () => this.setView('grid'));
    this.listViewBtn.addEventListener('click', () => this.setView('list'));
    
    // タグフィルター
    this.tagButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setActiveTag(btn.dataset.tag);
      });
    });
  }
  
  setView(view) {
    this.currentView = view;
    
    if (view === 'grid') {
      this.clippingsContainer.className = 'grid-view';
      this.gridViewBtn.classList.add('active');
      this.listViewBtn.classList.remove('active');
    } else {
      this.clippingsContainer.className = 'list-view';
      this.listViewBtn.classList.add('active');
      this.gridViewBtn.classList.remove('active');
    }
  }
  
  setActiveTag(tag) {
    this.currentTag = tag;
    
    // タグボタンのアクティブ状態を更新
    this.tagButtons.forEach(btn => {
      if (btn.dataset.tag === tag) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    this.renderClippings();
  }
  
  renderClippings() {
    // すべてのクリッピングを非表示に
    this.clippings.forEach(clipping => {
      clipping.element.style.display = 'none';
    });
    
    // フィルタリングとソート
    const filteredClippings = this.clippings
      .filter(clipping => {
        // タグフィルター
        if (this.currentTag !== 'all' && !clipping.tags.includes(this.currentTag)) {
          return false;
        }
        
        // 検索フィルター
        if (this.searchTerm) {
          const titleMatch = clipping.title.toLowerCase().includes(this.searchTerm);
          const descriptionMatch = clipping.element.querySelector('.clipping-description').textContent.toLowerCase().includes(this.searchTerm);
          return titleMatch || descriptionMatch;
        }
        
        return true;
      })
      .sort((a, b) => {
        // ソート
        switch (this.currentSort) {
          case 'date-desc':
            return b.date - a.date;
          case 'date-asc':
            return a.date - b.date;
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          default:
            return 0;
        }
      });
    
    // 結果の表示
    if (filteredClippings.length === 0) {
      this.noResultsEl.style.display = 'block';
    } else {
      this.noResultsEl.style.display = 'none';
      
      filteredClippings.forEach(clipping => {
        clipping.element.style.display = 'block';
      });
    }
  }
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
  new ClippingManager();
});
