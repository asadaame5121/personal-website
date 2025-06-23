/**
 * MiniWorldSprites を使用したタイルマップ実装
 * 2Dマップを表示し、カテゴリーと記事をナビゲーションできるようにする
 */

class MiniWorldMap {
  constructor(options = {}) {
    this.options = Object.assign({
      container: document.body,
      width: globalThis.innerWidth,
      height: globalThis.innerHeight,
      tileSize: 32, // MiniWorldSpritesのタイルサイズは32x32
      mapWidth: 60,
      mapHeight: 40,
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
  loadTextures() {
    return new Promise((resolve) => {
      const _loader = PIXI.Loader.shared;
      
      // 地面のテクスチャー
      _loader.add('grass', '/assets/images/MiniWorldSprites/Ground/Grass.png');
      _loader.add('texturedGrass', '/assets/images/MiniWorldSprites/Ground/TexturedGrass.png');
      _loader.add('deadGrass', '/assets/images/MiniWorldSprites/Ground/DeadGrass.png');
      _loader.add('shore', '/assets/images/MiniWorldSprites/Ground/Shore.png');
      _loader.add('cliff', '/assets/images/MiniWorldSprites/Ground/Cliff.png');
      
      // 自然のテクスチャー
      _loader.add('trees', '/assets/images/MiniWorldSprites/Nature/Trees.png');
      _loader.add('rocks', '/assets/images/MiniWorldSprites/Nature/Rocks.png');
      _loader.add('pineTrees', '/assets/images/MiniWorldSprites/Nature/PineTrees.png');
      
      // 建物のテクスチャー
      _loader.add('houses', '/assets/images/MiniWorldSprites/Buildings/Wood/Houses.png');
      _loader.add('towers', '/assets/images/MiniWorldSprites/Buildings/Wood/Tower.png');
      _loader.add('huts', '/assets/images/MiniWorldSprites/Buildings/Wood/Huts.png');

      _loader.load((_loader, resources) => {
        // テクスチャーの設定
        // 画像サイズが想定と異なるため、直接テクスチャを使用
        this.textures = {
          // 基本的な地形
          water: resources.shore.texture,
          sand: resources.shore.texture,
          grass: resources.grass.texture,
          texturedGrass: resources.texturedGrass.texture,
          deadGrass: resources.deadGrass.texture,
          
          // 自然物
          tree: resources.trees.texture,
          pineTree: resources.pineTrees.texture,
          rock: resources.rocks.texture,
          
          // 建物
          house: resources.houses.texture,
          tower: resources.towers.texture,
          hut: resources.huts.texture
        };
        
        resolve();
      });
    });
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
  }

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
                texture: 'house',
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
              
              // ランダムに木や岩を配置
              if (Math.random() < 0.1) {
                map[y][x].texture = 'tree';
                map[y][x].height = 1.0;
              } else if (Math.random() < 0.05) {
                map[y][x].texture = 'rock';
                map[y][x].height = 0.7;
              }
            }
          } else if (map[y][x].type === 'water') {
            // カテゴリーエリアの境界付近は砂浜にする
            if (distance < radius + 2) {
              map[y][x] = {
                type: 'sand',
                texture: 'sand',
                height: 0.1,
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
          // Topicnoteエリア
          if (distance < topicnoteRadius * 0.3) {
            // Topicnoteの中心
            map[y][x] = {
              type: 'topicnote',
              texture: 'tower',
              height: 1.5,
              category: 'Topicnote'
            };
          } else {
            // Topicnoteエリア
            map[y][x] = {
              type: 'topicnote',
              texture: 'texturedGrass',
              height: 0.3,
              category: 'Topicnote'
            };
            
            // ランダムに小さな建物を配置
            if (Math.random() < 0.2) {
              map[y][x].texture = 'hut';
              map[y][x].height = 0.8;
            }
          }
        }
      }
    }
    
    return map;
  }

  /**
   * タイルの作成
   */
  createTile(x, y, tileInfo) {
    const tileSize = this.options.tileSize;
    
    // スプライトの作成
    const sprite = new PIXI.Sprite(this.textures[tileInfo.texture]);
    sprite.width = tileSize;
    sprite.height = tileSize;
    
    // 位置の設定
    sprite.x = (x - this.options.mapWidth / 2) * tileSize;
    sprite.y = (y - this.options.mapHeight / 2) * tileSize;
    
    // データの設定
    sprite.tileData = {
      x,
      y,
      type: tileInfo.type,
      category: tileInfo.category,
      height: tileInfo.height
    };
    
    // インタラクティブに設定
    sprite.interactive = true;
    sprite.buttonMode = true;
    
    // クリックイベント
    sprite.on('pointerdown', () => {
      if (this.options.onTileClick) {
        this.options.onTileClick(sprite.tileData);
      }
    });
    
    // マップに追加
    this.mapContainer.addChild(sprite);
    this.tiles.push(sprite);
  }

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
  }
}

// グローバルに公開
globalThis.MiniWorldMap = MiniWorldMap;
