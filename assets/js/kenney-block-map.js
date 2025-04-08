/**
 * Kenney Block Packを使用したタイルマップ実装
 * 2Dマップを表示し、カテゴリーと記事をナビゲーションできるようにする
 */

class KenneyBlockMap {
  constructor(options = {}) {
    this.options = Object.assign({
      container: document.body,
      width: globalThis.innerWidth,
      height: globalThis.innerHeight,
      tileSize: 64, // Kenney Block Packのタイルサイズは64x64
      mapWidth: 30,
      mapHeight: 20,
      onTileClick: null,
    }, options);

    this.container = typeof this.options.container === 'string'
      ? document.querySelector(this.options.container)
      : this.options.container;

    this.app = null;
    this.mapContainer = null;
    this.tiles = [];
    this.textures = {};
    this.categories = ['Resources', 'Article', 'Glossary']; // カテゴリー

    this.init();
  }

  /**
   * 初期化
   */
  async init() {
    // PixiJS v8用のアプリケーションの作成
    this.app = new PIXI.Application({
      width: this.options.width,
      height: this.options.height,
      backgroundColor: 0x87CEEB, // 空色の背景
      resolution: globalThis.devicePixelRatio || 1,
      autoDensity: true,
    });

    // v8ではレンダラーを明示的に作成してコンテナに追加する
    await this.app.init();
    this.container.appendChild(this.app.canvas);

    // マップコンテナの作成
    this.mapContainer = new PIXI.Container();
    this.app.stage.addChild(this.mapContainer);

    // 中央に配置
    this.mapContainer.x = this.options.width / 2;
    this.mapContainer.y = this.options.height / 2;

    // テクスチャーの読み込み
    await this.loadTextures();

    // マップの生成
    this.generateMap();

    // イベントリスナーの設定
    this.setupEventListeners();
  }

  /**
   * テクスチャーの読み込み
   */
  async loadTextures() {
    // PixiJS v8ではAssets APIを使用
    await PIXI.Assets.init();
    
    // スプライトシートとJSONデータの読み込み
    // PixiJS v8では完全なURLを使用する必要がある
    // Denoではwindowの代わりにglobalThisを使用
    const baseUrl = globalThis.location.origin;
    
    // metaセクションを追加したJSONファイルを使用してスプライトシートを読み込む
    await PIXI.Assets.init();
    
    // スプライトシートの読み込み
    const spritesheet = await PIXI.Assets.load(baseUrl + '/assets/images/blockPack_spritesheet_simple.json');
    
    // ベーステクスチャを取得
    const baseTexture = spritesheet.baseTexture;
      
    // PixiJS v8でのテクスチャ作成方法
    this.textures = {
      // 基本的な地形
      water: spritesheet.textures["tileWater_1.png"],
      grass: spritesheet.textures["tileGrass.png"],
      dirt: spritesheet.textures["tileDirt.png"],
      stone: spritesheet.textures["tileStone.png"],
      
      // 自然物
      tree: spritesheet.textures["foliageTree_green.png"],
      
      // 特殊タイル
      treasure: spritesheet.textures["box_treasure.png"],
      character: spritesheet.textures["character_man.png"]
    };
  }

  /** 
   * マップの生成
   */
  generateMap() {
    // 大陸型の配置を生成
    const continentMap = this.createContinentMap();
    
    // タイルの配置
    for (let y = 0; y < this.options.mapHeight; y++) {
      for (let x = 0; x < this.options.mapWidth; x++) {
        const tileInfo = continentMap[y][x];
        this.createTile(x, y, tileInfo);
      }
    }
  };

  /**
   * 大陸型マップの生成
   */
  createContinentMap() {
    const map = [];
    const width = this.options.mapWidth;
    const height = this.options.mapHeight;
    
    // カテゴリーの中心位置
    const categoryPositions = [
      { x: Math.floor(width * 0.25), y: Math.floor(height * 0.25), name: 'Resources' },
      { x: Math.floor(width * 0.75), y: Math.floor(height * 0.25), name: 'Article' },
      { x: Math.floor(width * 0.5), y: Math.floor(height * 0.75), name: 'Glossary' }
    ];
    
    // Topicnoteの中心位置（マップの中央）
    const topicnoteCenter = { x: Math.floor(width * 0.5), y: Math.floor(height * 0.4) };
    
    // マップの初期化（すべて水で埋める）
    for (let y = 0; y < height; y++) {
      map[y] = [];
      for (let x = 0; x < width; x++) {
        map[y][x] = { 
          type: 'water', 
          texture: 'water',
          height: 0,
          category: null
        };
      }
    }
    
    // カテゴリーエリアの生成
    categoryPositions.forEach(category => {
      const radius = Math.floor(Math.min(width, height) * 0.15); // カテゴリーエリアの半径
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const distance = Math.sqrt(Math.pow(x - category.x, 2) + Math.pow(y - category.y, 2));
          
          if (distance < radius) {
            // カテゴリーエリア内
            if (distance < radius * 0.2) {
              // カテゴリーの中心
              map[y][x] = {
                type: 'category',
                texture: 'treasure',  // house → treasure に変更
                height: 1.0,
                category: category.name
              };
            } else {
              // カテゴリーエリア（記事）
              map[y][x] = {
                type: 'article',
                texture: 'grass',
                height: 0.5,
                category: category.name
              };
              
              // ランダムに木を配置
              if (Math.random() < 0.1) {
                map[y][x].texture = 'tree';
                map[y][x].height = 1.0;
              } else if (Math.random() < 0.05) {
                map[y][x].texture = 'character';  // rock → character に変更
                map[y][x].height = 0.7;
              }
            }
          } else if (map[y][x].type === 'water') {
            // カテゴリーエリアの境界付近は砂浜にする
            if (distance < radius + 2) {
              map[y][x] = {
                type: 'shore',
                texture: 'dirt',
                height: 0.2,
                category: null
              };
            }
          }
        }
      }
    });
    
    // Topicnoteエリアの生成
    const topicnoteRadius = Math.floor(Math.min(width, height) * 0.1);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distance = Math.sqrt(Math.pow(x - topicnoteCenter.x, 2) + Math.pow(y - topicnoteCenter.y, 2));
        
        if (distance < topicnoteRadius) {
          if (distance < topicnoteRadius * 0.3) {
            // Topicnoteの中心
            map[y][x] = {
              type: 'topicnote',
              texture: 'treasure',  // tower → treasure に変更
              height: 1.0,
              category: 'Topicnote'
            };
          } else {
            // Topicnoteエリア
            map[y][x] = {
              type: 'topicnote',
              texture: 'stone',
              height: 0.6,
              category: 'Topicnote'
            };
            
            // ランダムに宝箱を配置
            if (Math.random() < 0.1) {
              map[y][x].texture = 'treasure';
              map[y][x].height = 0.8;
            }
          }
        }
      }
    }
    
    // 川や道の生成
    this.createRivers(map);
    
    return map;
  };

  /**
   * 川や道の生成
   */
  createRivers(map) {
    const width = this.options.mapWidth;
    const height = this.options.mapHeight;
    
    // 川の数
    const riverCount = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < riverCount; i++) {
      // 川の始点と終点
      let startX, startY, endX, endY;
      
      // ランダムに川の方向を決定
      if (Math.random() < 0.5) {
        // 上から下
        startX = Math.floor(Math.random() * width);
        startY = 0;
        endX = Math.floor(Math.random() * width);
        endY = height - 1;
      } else {
        // 左から右
        startX = 0;
        startY = Math.floor(Math.random() * height);
        endX = width - 1;
        endY = Math.floor(Math.random() * height);
      }
      
      // 川のパスを生成
      const riverPath = this.generatePath(startX, startY, endX, endY);
      
      // 川を描画
      riverPath.forEach(point => {
        const { x, y } = point;
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          map[y][x] = {
            type: 'river',
            texture: 'water',
            height: 0.1,
            category: null
          };
          
          // 川の周りを砂浜にする
          for (let ny = Math.max(0, y - 1); ny <= Math.min(height - 1, y + 1); ny++) {
            for (let nx = Math.max(0, x - 1); nx <= Math.min(width - 1, x + 1); nx++) {
              if ((nx !== x || ny !== y) && map[ny][nx].type !== 'river' && map[ny][nx].type !== 'category') {
                map[ny][nx] = {
                  type: 'shore',
                  texture: 'dirt',
                  height: 0.2,
                  category: null
                };
              }
            }
          }
        }
      });
    }
  };

  /**
   * パスの生成（川や道用）
   */
  generatePath(startX, startY, endX, endY) {
    const path = [];
    let x = startX;
    let y = startY;
    
    path.push({ x, y });
    
    while (x !== endX || y !== endY) {
      // ランダムに方向を決定
      const dx = endX - x;
      const dy = endY - y;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // X方向に移動
        x += Math.sign(dx);
      } else {
        // Y方向に移動
        y += Math.sign(dy);
      }
      
      // ランダムな蛇行
      if (Math.random() < 0.2) {
        if (Math.random() < 0.5) {
          x += Math.random() < 0.5 ? 1 : -1;
        } else {
          y += Math.random() < 0.5 ? 1 : -1;
        }
      }
      
      path.push({ x, y });
    }
    
    return path;
  };

  /**
   * タイルの作成
   */
  createTile(x, y, tileInfo) {
    const texture = this.textures[tileInfo.texture];
    if (!texture) return;
    
    const tile = new PIXI.Sprite(texture);
    
    // タイルの位置を設定
    tile.x = (x - this.options.mapWidth / 2) * this.options.tileSize;
    tile.y = (y - this.options.mapHeight / 2) * this.options.tileSize;
    
    // タイルの中心を基準に
    tile.anchor.set(0.5);
    
    // タイルのサイズを設定
    tile.width = this.options.tileSize;
    tile.height = this.options.tileSize;
    
    // タイルの高さに応じて表示順序を調整
    tile.zIndex = y * 100 + tileInfo.height * 10;
    
    // タイルにデータを関連付ける
    tile.tileData = tileInfo;
    
    // クリック可能に
    tile.eventMode = 'static';
    tile.cursor = 'pointer';
    
    // クリックイベント
    tile.on('pointerdown', () => {
      if (this.options.onTileClick) {
        this.options.onTileClick(tileInfo);
      }
    });
    
    // マップコンテナに追加
    this.mapContainer.addChild(tile);
    this.tiles.push(tile);
  };

  /**
   * イベントリスナーの設定
   */
  setupEventListeners() {
    // ウィンドウのリサイズ
    globalThis.addEventListener('resize', () => {
      this.app.renderer.resize(globalThis.innerWidth, globalThis.innerHeight);
      this.mapContainer.x = globalThis.innerWidth / 2;
      this.mapContainer.y = globalThis.innerHeight / 2;
    });
    
    // マップのドラッグ
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let mapStartX = 0;
    let mapStartY = 0;
    
    this.app.stage.eventMode = 'static';
    
    this.app.stage.on('pointerdown', (event) => {
      isDragging = true;
      dragStartX = event.global.x;
      dragStartY = event.global.y;
      mapStartX = this.mapContainer.x;
      mapStartY = this.mapContainer.y;
    });
    
    this.app.stage.on('pointermove', (event) => {
      if (isDragging) {
        const dx = event.global.x - dragStartX;
        const dy = event.global.y - dragStartY;
        
        this.mapContainer.x = mapStartX + dx;
        this.mapContainer.y = mapStartY + dy;
      }
    });
    
    this.app.stage.on('pointerup', () => {
      isDragging = false;
    });
    
    this.app.stage.on('pointerupoutside', () => {
      isDragging = false;
    });
  };
}

// グローバルに公開
globalThis.KenneyBlockMap = KenneyBlockMap;
