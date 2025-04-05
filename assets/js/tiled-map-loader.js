/**
 * Tiled Map Loader
 * Kenneyのタイルセットを使用したTiledマップを読み込み、表示するためのライブラリ
 */

class TiledMapLoader {
  constructor(options = {}) {
    this.options = Object.assign({
      container: document.body,
      mapUrl: null,
      tilesetUrl: null,
      onLoad: () => {},
      onClick: () => {},
      onHover: () => {},
    }, options);

    this.container = typeof this.options.container === 'string' 
      ? document.querySelector(this.options.container) 
      : this.options.container;
    
    this.mapData = null;
    this.tilesets = {};
    this.layers = [];
    this.tileImages = {};
    this.mapElement = null;
    this.hoveredTile = null;
    
    this.init();
  }

  /**
   * 初期化
   */
  init() {
    if (!this.options.mapUrl) {
      console.error('マップURLが指定されていません');
      return;
    }

    this.mapElement = document.createElement('div');
    this.mapElement.className = 'tiled-map';
    this.mapElement.style.position = 'relative';
    this.container.appendChild(this.mapElement);

    this.loadMap();
  }

  /**
   * マップデータを読み込む
   */
  async loadMap() {
    try {
      const response = await fetch(this.options.mapUrl);
      this.mapData = await response.json();
      
      // マップのサイズを設定
      this.mapElement.style.width = `${this.mapData.width * this.mapData.tilewidth}px`;
      this.mapElement.style.height = `${this.mapData.height * this.mapData.tileheight}px`;
      
      // タイルセットを読み込む
      await this.loadTilesets();
      
      // レイヤーを描画
      this.renderLayers();
      
      // イベントリスナーを設定
      this.setupEventListeners();
      
      // 読み込み完了時のコールバック
      if (typeof this.options.onLoad === 'function') {
        this.options.onLoad(this.mapData);
      }
    } catch (error) {
      console.error('マップの読み込みに失敗しました', error);
    }
  }

  /**
   * タイルセットを読み込む
   */
  async loadTilesets() {
    const promises = this.mapData.tilesets.map(async (tileset) => {
      // 外部タイルセットの場合
      if (tileset.source) {
        const tilesetPath = this.options.mapUrl.substring(0, this.options.mapUrl.lastIndexOf('/') + 1);
        const response = await fetch(`${tilesetPath}${tileset.source}`);
        const tilesetData = await response.json();
        
        tileset = { ...tileset, ...tilesetData };
      }
      
      // 画像パスを取得
      let imagePath;
      if (tileset.image) {
        if (tileset.image.startsWith('/')) {
          imagePath = tileset.image;
        } else {
          const tilesetPath = this.options.mapUrl.substring(0, this.options.mapUrl.lastIndexOf('/') + 1);
          imagePath = `${tilesetPath}${tileset.image}`;
        }
      } else if (this.options.tilesetUrl) {
        imagePath = this.options.tilesetUrl;
      }
      
      // タイルセット画像を読み込む
      if (imagePath) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            this.tilesets[tileset.firstgid] = {
              ...tileset,
              image: img
            };
            resolve();
          };
          img.onerror = () => {
            console.error(`タイルセット画像の読み込みに失敗しました: ${imagePath}`);
            resolve();
          };
          img.src = imagePath;
        });
      }
    });
    
    await Promise.all(promises);
  }

  /**
   * レイヤーを描画
   */
  renderLayers() {
    this.mapData.layers.forEach((layer) => {
      if (layer.visible === false) return;
      
      if (layer.type === 'tilelayer') {
        this.renderTileLayer(layer);
      } else if (layer.type === 'objectgroup') {
        this.renderObjectLayer(layer);
      }
    });
  }

  /**
   * タイルレイヤーを描画
   */
  renderTileLayer(layer) {
    const layerElement = document.createElement('div');
    layerElement.className = `tiled-layer tiled-layer-${layer.name.toLowerCase().replace(/\s+/g, '-')}`;
    layerElement.style.position = 'absolute';
    layerElement.style.top = '0';
    layerElement.style.left = '0';
    layerElement.style.width = '100%';
    layerElement.style.height = '100%';
    layerElement.style.zIndex = this.layers.length;
    
    // 透明度の設定
    if (typeof layer.opacity === 'number' && layer.opacity < 1) {
      layerElement.style.opacity = layer.opacity;
    }
    
    this.mapElement.appendChild(layerElement);
    this.layers.push(layerElement);
    
    // タイルを描画
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        const index = y * layer.width + x;
        const gid = layer.data[index];
        
        if (gid === 0) continue; // 空のタイル
        
        const tileElement = this.createTileElement(gid, x, y, layer);
        if (tileElement) {
          layerElement.appendChild(tileElement);
        }
      }
    }
  }

  /**
   * オブジェクトレイヤーを描画
   */
  renderObjectLayer(layer) {
    const layerElement = document.createElement('div');
    layerElement.className = `tiled-layer tiled-layer-${layer.name.toLowerCase().replace(/\s+/g, '-')}`;
    layerElement.style.position = 'absolute';
    layerElement.style.top = '0';
    layerElement.style.left = '0';
    layerElement.style.width = '100%';
    layerElement.style.height = '100%';
    layerElement.style.zIndex = this.layers.length;
    
    // 透明度の設定
    if (typeof layer.opacity === 'number' && layer.opacity < 1) {
      layerElement.style.opacity = layer.opacity;
    }
    
    this.mapElement.appendChild(layerElement);
    this.layers.push(layerElement);
    
    // オブジェクトを描画
    layer.objects.forEach((object) => {
      const objectElement = document.createElement('div');
      objectElement.className = 'tiled-object';
      objectElement.style.position = 'absolute';
      objectElement.style.left = `${object.x}px`;
      objectElement.style.top = `${object.y}px`;
      objectElement.style.width = `${object.width}px`;
      objectElement.style.height = `${object.height}px`;
      
      // オブジェクトのプロパティを設定
      if (object.properties) {
        object.properties.forEach((prop) => {
          objectElement.dataset[prop.name] = prop.value;
        });
      }
      
      // タイルオブジェクトの場合
      if (object.gid) {
        const tileElement = this.createTileElement(object.gid, 0, 0);
        if (tileElement) {
          tileElement.style.position = 'absolute';
          tileElement.style.left = '0';
          tileElement.style.top = '0';
          objectElement.appendChild(tileElement);
        }
      }
      
      layerElement.appendChild(objectElement);
    });
  }

  /**
   * タイル要素を作成
   */
  createTileElement(gid, x, y, layer = null) {
    // タイルセットを取得
    const tilesetGid = this.getTilesetGid(gid);
    const tileset = this.tilesets[tilesetGid];
    
    if (!tileset) return null;
    
    // ローカルIDを計算
    const localId = gid - tilesetGid;
    
    // タイルの位置を計算
    const tilesPerRow = Math.floor(tileset.imagewidth / tileset.tilewidth);
    const tileX = (localId % tilesPerRow) * tileset.tilewidth;
    const tileY = Math.floor(localId / tilesPerRow) * tileset.tileheight;
    
    // タイル要素を作成
    const tileElement = document.createElement('div');
    tileElement.className = 'tiled-tile';
    tileElement.style.position = 'absolute';
    tileElement.style.left = `${x * this.mapData.tilewidth}px`;
    tileElement.style.top = `${y * this.mapData.tileheight}px`;
    tileElement.style.width = `${this.mapData.tilewidth}px`;
    tileElement.style.height = `${this.mapData.tileheight}px`;
    tileElement.style.backgroundImage = `url(${tileset.image.src})`;
    tileElement.style.backgroundPosition = `-${tileX}px -${tileY}px`;
    
    // データ属性を設定
    tileElement.dataset.x = x;
    tileElement.dataset.y = y;
    tileElement.dataset.gid = gid;
    
    // レイヤー情報を設定
    if (layer) {
      tileElement.dataset.layer = layer.name;
      
      // レイヤーのプロパティを設定
      if (layer.properties) {
        layer.properties.forEach((prop) => {
          tileElement.dataset[prop.name] = prop.value;
        });
      }
    }
    
    // タイルのプロパティを設定
    const tileInfo = tileset.tiles ? tileset.tiles.find(t => t.id === localId) : null;
    if (tileInfo && tileInfo.properties) {
      tileInfo.properties.forEach((prop) => {
        tileElement.dataset[prop.name] = prop.value;
      });
    }
    
    return tileElement;
  }

  /**
   * タイルセットのGIDを取得
   */
  getTilesetGid(gid) {
    const tilesetGids = Object.keys(this.tilesets)
      .map(Number)
      .sort((a, b) => a - b);
    
    for (let i = tilesetGids.length - 1; i >= 0; i--) {
      if (gid >= tilesetGids[i]) {
        return tilesetGids[i];
      }
    }
    
    return null;
  }

  /**
   * イベントリスナーを設定
   */
  setupEventListeners() {
    // クリックイベント
    this.mapElement.addEventListener('click', (event) => {
      const tileElement = event.target.closest('.tiled-tile');
      if (tileElement && typeof this.options.onClick === 'function') {
        const x = parseInt(tileElement.dataset.x, 10);
        const y = parseInt(tileElement.dataset.y, 10);
        const gid = parseInt(tileElement.dataset.gid, 10);
        const layer = tileElement.dataset.layer;
        
        this.options.onClick({
          x, y, gid, layer,
          element: tileElement,
          properties: this.getTileProperties(tileElement)
        });
      }
    });
    
    // ホバーイベント
    this.mapElement.addEventListener('mouseover', (event) => {
      const tileElement = event.target.closest('.tiled-tile');
      if (tileElement && typeof this.options.onHover === 'function') {
        this.hoveredTile = tileElement;
        
        const x = parseInt(tileElement.dataset.x, 10);
        const y = parseInt(tileElement.dataset.y, 10);
        const gid = parseInt(tileElement.dataset.gid, 10);
        const layer = tileElement.dataset.layer;
        
        this.options.onHover({
          x, y, gid, layer,
          element: tileElement,
          properties: this.getTileProperties(tileElement),
          type: 'enter'
        });
      }
    });
    
    this.mapElement.addEventListener('mouseout', (event) => {
      const tileElement = event.target.closest('.tiled-tile');
      if (tileElement && tileElement === this.hoveredTile && typeof this.options.onHover === 'function') {
        this.hoveredTile = null;
        
        const x = parseInt(tileElement.dataset.x, 10);
        const y = parseInt(tileElement.dataset.y, 10);
        const gid = parseInt(tileElement.dataset.gid, 10);
        const layer = tileElement.dataset.layer;
        
        this.options.onHover({
          x, y, gid, layer,
          element: tileElement,
          properties: this.getTileProperties(tileElement),
          type: 'leave'
        });
      }
    });
  }

  /**
   * タイルのプロパティを取得
   */
  getTileProperties(tileElement) {
    const properties = {};
    
    for (const key in tileElement.dataset) {
      if (key !== 'x' && key !== 'y' && key !== 'gid' && key !== 'layer') {
        properties[key] = tileElement.dataset[key];
      }
    }
    
    return properties;
  }
}

// グローバルに公開
window.TiledMapLoader = TiledMapLoader;
