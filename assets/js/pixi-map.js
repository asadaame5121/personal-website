/**
 * PixiJS を使用したタイルマップ実装
 * Kenneyのタイルセットを使用して2Dマップを表示
 */

class PixiMap {
  constructor(options = {}) {
    this.options = Object.assign({
      container: document.body,
      width: globalThis.innerWidth,
      height: globalThis.innerHeight,
      tileSize: 64,
      mapWidth: 60,
      mapHeight: 40,
      onTileClick: null,
      onTileHover: null,
    }, options);

    this.container = typeof this.options.container === 'string'
      ? document.querySelector(this.options.container)
      : this.options.container;

    this.app = null;
    this.mapContainer = null;
    this.tiles = [];
    this.textures = {};
    this.hoveredTile = null;
    this.tooltip = null;

    this.init();
  }

  /**
   * 初期化
   */
  async init() {
    // PixiJSアプリケーションの作成
    this.app = new PIXI.Application({
      width: this.options.width,
      height: this.options.height,
      backgroundColor: 0x1a3a5f, // 海洋の深いブルー
      resolution: globalThis.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.container.appendChild(this.app.view);

    // マップコンテナの作成
    this.mapContainer = new PIXI.Container();
    this.app.stage.addChild(this.mapContainer);

    // ドラッグ機能の追加
    this.setupDragInteraction();

    // ズーム機能の追加
    this.setupZoomInteraction();

    // テクスチャーの読み込み
    await this.loadTextures();

    // マップの生成
    this.generateMap();

    // ツールチップの作成
    this.createTooltip();

    // ウィンドウリサイズ対応
    window.addEventListener('resize', () => this.onResize());
  }

  /**
   * テクスチャーの読み込み
   */
  loadTextures() {
    return new Promise((resolve) => {
      // テクスチャーの読み込み
      const textureFiles = [
        { name: 'water', path: '/assets/images/Tiles/water_center_N.png' },
        { name: 'grass', path: '/assets/images/Tiles/grass_center_N.png' },
        { name: 'sand', path: '/assets/images/Tiles/sand_center_N.png' },
        { name: 'dirt', path: '/assets/images/Tiles/dirt_center_N.png' },
        { name: 'stone', path: '/assets/images/Tiles/stone_center_N.png' },
        { name: 'building', path: '/assets/images/Tiles/building_center_N.png' },
        { name: 'tree', path: '/assets/images/Tiles/tree_center_N.png' },
      ];

      // テクスチャーの読み込み
      const pixiLoader = PIXI.Loader.shared;
      textureFiles.forEach(file => {
        pixiLoader.add(file.name, file.path);
      });

      pixiLoader.load((_loader, resources) => {
        // テクスチャーの保存
        textureFiles.forEach(file => {
          this.textures[file.name] = resources[file.name].texture;
        });

        resolve();
      });
    });
  }

  /**
   * マップの生成
   */
  generateMap() {
    // 大陸型配置の設定
    const continentConfig = {
      center: { x: Math.floor(this.options.mapWidth / 2), y: Math.floor(this.options.mapHeight / 2) },
      topicnoteSize: 6, // 中央のTopicnoteエリアのサイズ
      categories: [
        { name: 'Resources', position: { x: this.options.mapWidth / 4, y: this.options.mapHeight / 4 } },
        { name: 'Article', position: { x: this.options.mapWidth * 3 / 4, y: this.options.mapHeight / 4 } },
        { name: 'Glossary', position: { x: this.options.mapWidth / 2, y: this.options.mapHeight * 3 / 4 } }
      ]
    };

    // マップデータの生成
    const mapData = this.generateContinentMap(continentConfig);

    // タイルの作成
    for (let y = 0; y < this.options.mapHeight; y++) {
      for (let x = 0; x < this.options.mapWidth; x++) {
        const tileType = mapData[y][x];
        this.createTile(x, y, tileType);
      }
    }
  }

  /**
   * 大陸型マップデータの生成
   */
  generateContinentMap(config) {
    const mapData = [];

    // マップを初期化（すべて海）
    for (let y = 0; y < this.options.mapHeight; y++) {
      mapData[y] = [];
      for (let x = 0; x < this.options.mapWidth; x++) {
        mapData[y][x] = 'water';
      }
    }

    // 各カテゴリーからの距離を計算する関数
    const distanceToCategory = (x, y, category) => {
      const dx = x - category.position.x;
      const dy = y - category.position.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // 中央からの距離を計算する関数
    const distanceToCenter = (x, y) => {
      const dx = x - config.center.x;
      const dy = y - config.center.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // 大陸の形状を生成
    for (let y = 0; y < this.options.mapHeight; y++) {
      for (let x = 0; x < this.options.mapWidth; x++) {
        // 中央のTopicnoteエリア
        const centerDist = distanceToCenter(x, y);
        if (centerDist < config.topicnoteSize / 2) {
          mapData[y][x] = 'sand';
          continue;
        }

        // カテゴリーエリア
        let minDist = Infinity;
        let _closestCategory = null;

        for (const category of config.categories) {
          const dist = distanceToCategory(x, y, category);
          if (dist < minDist) {
            minDist = dist;
            _closestCategory = category;
          }
        }

        // カテゴリーからの距離に基づいて地形を決定
        if (minDist < this.options.mapWidth / 6) {
          // カテゴリーの中心に近い場合は建物
          if (minDist < 2) {
            mapData[y][x] = 'building';
          }
          // それ以外は草地
          else {
            mapData[y][x] = 'grass';
          }
        }
        // カテゴリー間の境界に川を配置
        else if (minDist < this.options.mapWidth / 5 && minDist > this.options.mapWidth / 6) {
          mapData[y][x] = 'water';
        }
        // 外側は海
        else {
          mapData[y][x] = 'water';
        }

        // ランダムな要素を追加（木など）
        if (mapData[y][x] === 'grass' && Math.random() < 0.05) {
          mapData[y][x] = 'tree';
        }
        // 石を追加
        if (mapData[y][x] === 'grass' && Math.random() < 0.03) {
          mapData[y][x] = 'stone';
        }
      }
    }

    return mapData;
  }

  /**
   * タイルの作成
   */
  createTile(x, y, type) {
    // テクスチャーの取得
    const texture = this.textures[type] || this.textures.water;

    // スプライトの作成
    const tile = new PIXI.Sprite(texture);
    tile.x = x * this.options.tileSize;
    tile.y = y * this.options.tileSize;
    tile.width = this.options.tileSize;
    tile.height = this.options.tileSize;
    tile.interactive = true;
    tile.buttonMode = true;

    // データの設定
    tile.tileData = {
      x, y, type,
      properties: {}
    };

    // タイルの種類に応じてプロパティを設定
    if (type === 'building') {
      // カテゴリータイル
      const categories = ['Resources', 'Article', 'Glossary'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      tile.tileData.properties.category = category;
      tile.tileData.properties.title = `${category}カテゴリー`;
    } else if (type === 'sand') {
      // Topicnoteエリア
      tile.tileData.properties.type = 'topicnote';
      tile.tileData.properties.title = 'Topicnote';
    }

    // イベントの設定
    tile.on('pointerdown', () => this.onTileClick(tile));
    tile.on('pointerover', () => this.onTileHover(tile, true));
    tile.on('pointerout', () => this.onTileHover(tile, false));

    // マップに追加
    this.mapContainer.addChild(tile);
    this.tiles.push(tile);

    return tile;
  }

  /**
   * タイルクリック時の処理
   */
  onTileClick(tile) {
    if (this.options.onTileClick) {
      this.options.onTileClick(tile.tileData);
    }

    console.log('タイルがクリックされました', tile.tileData);

    // カテゴリータイルの場合、該当ページへ遷移
    if (tile.tileData.properties.category) {
      globalThis.location.href = `/${tile.tileData.properties.category.toLowerCase()}/`;
    }
  }

  /**
   * タイルホバー時の処理
   */
  onTileHover(tile, isOver) {
    if (isOver) {
      // ホバー効果
      tile.scale.set(1.05, 1.05);
      tile.alpha = 0.8;
      this.hoveredTile = tile;

      // ツールチップの表示
      this.showTooltip(tile);

      if (this.options.onTileHover) {
        this.options.onTileHover(tile.tileData, 'enter');
      }
    } else {
      // ホバー効果の解除
      tile.scale.set(1, 1);
      tile.alpha = 1;
      this.hoveredTile = null;

      // ツールチップの非表示
      this.hideTooltip();

      if (this.options.onTileHover) {
        this.options.onTileHover(tile.tileData, 'leave');
      }
    }
  }

  /**
   * ドラッグ機能の設定
   */
  setupDragInteraction() {
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    // ドラッグ開始
    this.app.stage.on('pointerdown', (event) => {
      if (event.target === this.app.stage) {
        isDragging = true;
        prevX = event.data.global.x;
        prevY = event.data.global.y;
      }
    });

    // ドラッグ中
    this.app.stage.on('pointermove', (event) => {
      if (isDragging) {
        const dx = event.data.global.x - prevX;
        const dy = event.data.global.y - prevY;

        this.mapContainer.x += dx;
        this.mapContainer.y += dy;

        prevX = event.data.global.x;
        prevY = event.data.global.y;
      }
    });

    // ドラッグ終了
    this.app.stage.on('pointerup', () => {
      isDragging = false;
    });

    this.app.stage.on('pointerupoutside', () => {
      isDragging = false;
    });

    // ステージをインタラクティブに
    this.app.stage.interactive = true;
  }

  /**
   * ズーム機能の設定
   */
  setupZoomInteraction() {
    // ホイールイベントの設定
    this.container.addEventListener('wheel', (event) => {
      event.preventDefault();

      // ズーム量の計算
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;

      // マウス位置を基準にズーム
      const mouseX = event.clientX - this.container.getBoundingClientRect().left;
      const mouseY = event.clientY - this.container.getBoundingClientRect().top;

      const worldPos = {
        x: (mouseX - this.mapContainer.x) / this.mapContainer.scale.x,
        y: (mouseY - this.mapContainer.y) / this.mapContainer.scale.y
      };

      // スケールの更新
      this.mapContainer.scale.x *= zoomFactor;
      this.mapContainer.scale.y *= zoomFactor;

      // 位置の更新
      this.mapContainer.x = mouseX - worldPos.x * this.mapContainer.scale.x;
      this.mapContainer.y = mouseY - worldPos.y * this.mapContainer.scale.y;
    });
  }

  /**
   * ツールチップの作成
   */
  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'pixi-tooltip';
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.tooltip.style.color = 'white';
    this.tooltip.style.padding = '5px 10px';
    this.tooltip.style.borderRadius = '4px';
    this.tooltip.style.fontSize = '14px';
    this.tooltip.style.pointerEvents = 'none';
    this.tooltip.style.zIndex = '1000';
    this.tooltip.style.maxWidth = '200px';
    this.tooltip.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    this.tooltip.style.display = 'none';
    
    document.body.appendChild(this.tooltip);
  }

  /**
   * ツールチップの表示
   */
  showTooltip(tile) {
    // ツールチップに表示する情報を取得
    let tooltipContent = '';
    
    if (tile.tileData.properties.category) {
      tooltipContent = `カテゴリー: ${tile.tileData.properties.category}`;
    } else if (tile.tileData.properties.title) {
      tooltipContent = tile.tileData.properties.title;
    } else if (tile.tileData.properties.type) {
      tooltipContent = `タイプ: ${tile.tileData.properties.type}`;
    } else {
      tooltipContent = `タイル: ${tile.tileData.type}`;
    }
    
    // ツールチップの内容を設定
    this.tooltip.textContent = tooltipContent;
    this.tooltip.style.display = 'block';
    
    // マウスの位置に合わせてツールチップを配置
    document.addEventListener('mousemove', this.updateTooltipPosition);
  }

  /**
   * ツールチップの位置を更新
   */
  updateTooltipPosition = (e) => {
    this.tooltip.style.left = `${e.pageX + 10}px`;
    this.tooltip.style.top = `${e.pageY + 10}px`;
  }

  /**
   * ツールチップの非表示
   */
  hideTooltip() {
    this.tooltip.style.display = 'none';
    document.removeEventListener('mousemove', this.updateTooltipPosition);
  }

  /**
   * リサイズ時の処理
   */
  onResize() {
    this.app.renderer.resize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  }

  /**
   * 破棄
   */
  destroy() {
    // イベントリスナーの削除
    globalThis.removeEventListener('resize', this.onResize);
    document.removeEventListener('mousemove', this.updateTooltipPosition);
    
    // ツールチップの削除
    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }
    
    // アプリケーションの破棄
    this.app.destroy(true, true);
  }
}

// グローバルに公開
globalThis.PixiMap = PixiMap;
