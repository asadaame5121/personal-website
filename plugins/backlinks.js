/**
 * バックリンク（逆参照）機能を提供するプラグイン
 * ページ間のリンク関係を解析し、各ページにバックリンクセクションを追加します
 */

export default function() {
  return (site) => {
    // ページ間のリンク関係を格納するマップ
    const linkMap = new Map();
    
    // サイトビルド前にリンク関係を解析
    site.addEventListener("beforeBuild", () => {
      // リンクマップをクリア
      linkMap.clear();
      
      // すべてのページを処理
      for (const page of site.pages) {
        const sourceUrl = page.data.url;
        const sourceTitle = page.data.title || sourceUrl;
        
        // ページのコンテンツからウィキリンクを抽出
        if (page.document) {
          const links = page.document.querySelectorAll("a[data-wikilink]");
          
          for (const link of links) {
            const targetId = link.getAttribute("data-wikilink");
            if (targetId) {
              // リンク先ページのIDを正規化
              const normalizedId = decodeURIComponent(targetId).toLowerCase();
              
              // リンクマップにエントリがなければ作成
              if (!linkMap.has(normalizedId)) {
                linkMap.set(normalizedId, []);
              }
              
              // リンク元ページの情報を追加
              linkMap.get(normalizedId).push({
                url: sourceUrl,
                title: sourceTitle
              });
            }
          }
        }
      }
    });
    
    // ページ処理後にバックリンクセクションを追加
    site.process([".html"], (pages) => {
      for (const page of pages) {
        // ページのIDを取得
        const pageId = page.data.id?.toLowerCase() || "";
        const pageTitle = page.data.title?.toLowerCase() || "";
        const pageFilename = page.src.path.split("/").pop()?.replace(/\.[^.]+$/, "").toLowerCase() || "";
        
        // バックリンクを検索
        let backlinks = [];
        
        // IDによる検索
        if (pageId && linkMap.has(pageId)) {
          backlinks = backlinks.concat(linkMap.get(pageId));
        }
        
        // タイトルによる検索
        if (pageTitle && linkMap.has(pageTitle)) {
          backlinks = backlinks.concat(linkMap.get(pageTitle));
        }
        
        // ファイル名による検索
        if (pageFilename && linkMap.has(pageFilename)) {
          backlinks = backlinks.concat(linkMap.get(pageFilename));
        }
        
        // 重複を除去
        backlinks = backlinks.filter((backlink, index, self) => 
          index === self.findIndex((b) => b.url === backlink.url)
        );
        
        // バックリンクがあれば、ページにバックリンクセクションを追加
        if (backlinks.length > 0 && page.document) {
          const content = page.document.querySelector("main") || page.document.body;
          
          if (content) {
            // バックリンクセクションを作成
            const backlinkSection = page.document.createElement("div");
            backlinkSection.className = "backlinks-container";
            
            const title = page.document.createElement("h3");
            title.className = "backlinks-title";
            title.textContent = "バックリンク";
            backlinkSection.appendChild(title);
            
            const list = page.document.createElement("ul");
            list.className = "backlinks-list";
            
            // バックリンクをリストに追加
            for (const backlink of backlinks) {
              const item = page.document.createElement("li");
              const link = page.document.createElement("a");
              link.href = backlink.url;
              link.textContent = backlink.title;
              item.appendChild(link);
              list.appendChild(item);
            }
            
            backlinkSection.appendChild(list);
            content.appendChild(backlinkSection);
          }
        }
      }
    });
  };
}
