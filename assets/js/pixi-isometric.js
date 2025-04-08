/**
 * PixiJS を使用したアイソメトリックマップ実装
 * Kenneyのタイルセットを使用して斜め上から見た立体的なマップを表示
 */

class PixiIsometricMap {
  constructor(options = {}) {
    this.options = Object.assign({
      container: document.body,
      width: globalThis.innerWidth,
      height: globalThis.innerHeight,
      tileWidth: 64,  // タイルの幅
      tileHeight: 32, // タイルの高さ（アイソメトリック表示のため幅の半分）
      mapWidth: 60,
      mapHeight: 40,
      onTileClick: null,
      tileOverlap: 4,  // タイル同士の重なり具合を調整するパラメータ（値が大きいほど密着する）
    }, options);

    this.container = typeof this.options.container === 'string'
      ? document.querySelector(this.options.container)
      : this.options.container;

    this.app = null;
    this.mapContainer = null;
    this.tiles = [];
    this.textures = {};

    this.init();
  }

  /**
   * 初期化
   */
  init() {
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
    // マップを中央に配置
    this.mapContainer.x = this.options.width / 2;
    this.mapContainer.y = this.options.height / 4;
    this.app.stage.addChild(this.mapContainer);

    // テクスチャーの読み込み
    this.loadTextures().then(() => {
      // マップの生成
      this.generateMap();
    });

    // ウィンドウリサイズ対応
    globalThis.addEventListener('resize', () => this.onResize());
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

    // タイルの作成（アイソメトリック配置）
    for (let y = 0; y < this.options.mapHeight; y++) {
      for (let x = 0; x < this.options.mapWidth; x++) {
        const tileType = mapData[y][x];
        // 高さの計算（タイルの種類によって異なる高さを設定）
        let height = 0;
        if (tileType === 'grass') height = 0.5;
        if (tileType === 'building') height = 1.5;
        if (tileType === 'tree') height = 1;
        if (tileType === 'stone') height = 0.7;
        
        this.createIsometricTile(x, y, tileType, height);
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
   * アイソメトリックタイルの作成
   */
  createIsometricTile(x, y, type, height = 0) {
    // テクスチャーの取得
    const texture = this.textures[type] || this.textures.water;

    // スプライトの作成
    const tile = new PIXI.Sprite(texture);
    
    // アイソメトリック座標の計算（タイルを密着させるための調整）
    // X方向の計算：タイルを横方向に密着させる
    const isoX = (x - y) * (this.options.tileWidth / 2 - this.options.tileOverlap);
    // Y方向の計算：タイルを縦方向に密着させる
    const isoY = (x + y) * (this.options.tileHeight / 2 - this.options.tileOverlap / 2) - height * this.options.tileHeight;
    
    tile.x = isoX;
    tile.y = isoY;
    // タイルの表示サイズを調整（幅と高さを正確に設定）
    tile.width = this.options.tileWidth;
    tile.height = this.options.tileWidth; // 正方形のタイル
    
    // 高さに応じてzIndexを設定（手前のタイルが上に表示されるように）
    tile.zIndex = x + y + height * 1000;
    
    // クリック可能に
    tile.interactive = true;
    tile.buttonMode = true;

    // データの設定
    tile.tileData = {
      x, y, type, height,
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

    // クリックイベントの設定
    tile.on('pointerdown', () => this.onTileClick(tile));

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
   * リサイズ時の処理
   */
  onResize() {
    // キャンバスのリサイズ
    this.app.renderer.resize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    
    // マップの位置を調整
    this.mapContainer.x = this.app.renderer.width / 2;
    this.mapContainer.y = this.app.renderer.height / 4;
  }

  /**
   * 破棄
   */
  destroy() {
    // イベントリスナーの削除
    globalThis.removeEventListener('resize', this.onResize);
    
    // アプリケーションの破棄
    this.app.destroy(true, true);
  }
}

// グローバルに公開
globalThis.PixiIsometricMap = PixiIsometricMap;
