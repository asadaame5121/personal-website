export default function ClippingList({ clippings }) {
  return (
    <>
      <div className="clipping-container">
        <div className="clipping-header">
          <h1>ClippingShare</h1>
          <p className="clipping-description">Obsidianで収集した記事やBlueskyでいいねした投稿を共有しています。</p>
          <p className="last-updated">最終更新: {clippings.lastUpdated}</p>
        </div>

        <div className="clipping-controls">
          <div className="search-filter">
            <input type="text" id="clipping-search" placeholder="検索..." aria-label="クリッピングを検索" />
            <select id="clipping-sort" aria-label="並び替え">
              <option value="date-desc">新しい順</option>
              <option value="date-asc">古い順</option>
              <option value="title-asc">タイトル (A-Z)</option>
              <option value="title-desc">タイトル (Z-A)</option>
            </select>
          </div>
          <div className="view-toggle">
            <button id="grid-view" className="active" aria-label="グリッド表示">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button id="list-view" aria-label="リスト表示">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div className="tags-container">
          <button className="tag-btn active" data-tag="all">すべて ({clippings.items.length})</button>
          {clippings.tags.map((tag, index) => (
            tag.count > 1 && (
              <button key={index} className="tag-btn" data-tag={tag.name}>
                {tag.name} ({tag.count})
              </button>
            )
          ))}
        </div>

        <div id="clippings-container" className="grid-view">
          {clippings.items.map((item, index) => (
            <div 
              key={index} 
              className="clipping-item" 
              data-id={item.id} 
              data-source={item.source} 
              data-tags={item.tags.join(',')} 
              data-date={item.created} 
              data-title={item.title}
            >
              <div className="clipping-content">
                {item.source === "bluesky" && (
                  <div className="source-icon bluesky">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm2.71 5.71L8 9.41l-2.71-2.7a.996.996 0 1 0-1.41 1.41l3.41 3.41c.4.4 1.04.4 1.44 0l3.41-3.41a.996.996 0 0 0 0-1.41c-.39-.38-1.03-.38-1.43 0z"/></svg>
                  </div>
                )}
                
                <h2 className="clipping-title">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                </h2>
                
                {item.source === "bluesky" && (
                  <div className="author-info">
                    {item.author.avatar && (
                      <img src={item.author.avatar} alt={item.author.name} className="author-avatar" />
                    )}
                    <span className="author-name">{item.author.name}</span>
                    <span className="author-handle">@{item.author.handle}</span>
                  </div>
                )}
                
                <div className="clipping-description">{item.description}</div>
                
                <div className="clipping-meta">
                  <div className="clipping-tags">
                    {item.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="clipping-date">{item.created}</div>
                  
                  {item.source === "bluesky" && item.stats && (
                    <div className="clipping-stats">
                      <span className="likes">♥ {item.stats.likes}</span>
                      <span className="reposts">🔄 {item.stats.reposts}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div id="no-results" className="no-results" style={{ display: 'none' }}>
          <p>検索条件に一致するクリッピングが見つかりませんでした。</p>
        </div>
      </div>

      <script src="/assets/js/clipping.js"></script>

      <style jsx>{`
        .clipping-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
        }
        
        .clipping-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .clipping-description {
          color: #666;
          margin-bottom: 0.5rem;
        }
        
        .last-updated {
          font-size: 0.8rem;
          color: #888;
        }
        
        .clipping-controls {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          align-items: center;
        }
        
        .search-filter {
          display: flex;
          gap: 0.5rem;
          flex: 1;
        }
        
        #clipping-search {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        #clipping-sort {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .view-toggle {
          display: flex;
          gap: 0.5rem;
        }
        
        .view-toggle button {
          background: none;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .view-toggle button.active {
          background-color: #f0f0f0;
        }
        
        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        .tag-btn {
          background: none;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 0.3rem 0.8rem;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .tag-btn.active {
          background-color: #2E5A30;
          color: white;
          border-color: #2E5A30;
        }
        
        #clippings-container {
          margin-top: 1.5rem;
        }
        
        #clippings-container.grid-view {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        #clippings-container.list-view .clipping-item {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #eee;
        }
        
        .clipping-item {
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s;
          position: relative;
        }
        
        .clipping-item:hover {
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .clipping-content {
          padding: 1.2rem;
        }
        
        .source-icon {
          position: absolute;
          top: 0.8rem;
          right: 0.8rem;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .source-icon.bluesky {
          color: #0085FF;
        }
        
        .clipping-title {
          margin-top: 0;
          margin-bottom: 0.8rem;
          font-size: 1.2rem;
        }
        
        .clipping-title a {
          color: #333;
          text-decoration: none;
        }
        
        .clipping-title a:hover {
          color: #2E5A30;
          text-decoration: underline;
        }
        
        .author-info {
          display: flex;
          align-items: center;
          margin-bottom: 0.8rem;
          gap: 0.5rem;
        }
        
        .author-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }
        
        .author-name {
          font-weight: bold;
        }
        
        .author-handle {
          color: #666;
          font-size: 0.9rem;
        }
        
        .clipping-description {
          margin-bottom: 1rem;
          color: #444;
          line-height: 1.5;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
        
        .clipping-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: #666;
          flex-wrap: wrap;
        }
        
        .clipping-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .tag {
          background-color: #f0f0f0;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        
        .clipping-date {
          font-size: 0.8rem;
        }
        
        .clipping-stats {
          display: flex;
          gap: 0.8rem;
          margin-top: 0.5rem;
        }
        
        .no-results {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        
        @media (max-width: 768px) {
          #clippings-container.grid-view {
            grid-template-columns: 1fr;
          }
          
          .clipping-controls {
            flex-direction: column;
            gap: 1rem;
          }
          
          .search-filter {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
