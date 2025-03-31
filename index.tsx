import { useEffect, useRef } from "preact/hooks";
import * as THREE from "three";

interface IndexProps {
  categories: string[];
  articles: {
    title: string;
    category: string;
    date: string;
    url: string;
  }[];
}

export default function Index({ categories = ['Resources', 'Article', 'Grossary', 'Person', 'Others'], articles = [] }: IndexProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const tilesRef = useRef<THREE.Mesh[][]>([]);
  const animationFrameRef = useRef<number>(0);

  // カテゴリーごとの記事数を計算
  const categoryCount = categories.reduce((acc, category) => {
    acc[category] = articles.filter(article => article.category === category).length || 1;
    return acc;
  }, {} as Record<string, number>);

  // 3Dシーンの初期化
  useEffect(() => {
    if (!canvasRef.current) return;

    // シーン作成
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // レンダラー設定
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // カメラ設定（等角投影）
    const aspect = window.innerWidth / (window.innerHeight - 100); // フッター高さを考慮
    const frustumSize = 10;
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 光源設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // グリッド作成
    const gridSize = 5;
    const tileSize = 1;
    const spacing = 0.1;
    const tiles: THREE.Mesh[][] = [];

    for (let x = 0; x < gridSize; x++) {
      tiles[x] = [];
      for (let z = 0; z < gridSize; z++) {
        // タイルの高さを決定（カテゴリータイルは左端列）
        let height = 0.5;
        let color = 0x6B8E23; // 通常タイル: 緑色

        if (x === 0 && z < categories.length) {
          // カテゴリータイル
          const category = categories[z];
          height = Math.log(categoryCount[category] + 1) * 0.5;
          color = 0x4682B4; // カテゴリータイル: 青色
        }

        // タイルのジオメトリとマテリアル
        const geometry = new THREE.BoxGeometry(tileSize, height, tileSize);
        const material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.1,
          roughness: 0.7
        });

        // タイルメッシュ作成
        const tile = new THREE.Mesh(geometry, material);
        
        // タイルの位置設定
        const posX = x * (tileSize + spacing) - (gridSize * (tileSize + spacing)) / 2 + tileSize / 2;
        const posY = height / 2;
        const posZ = z * (tileSize + spacing) - (gridSize * (tileSize + spacing)) / 2 + tileSize / 2;
        
        tile.position.set(posX, posY, posZ);
        
        // タイルをシーンに追加
        scene.add(tile);
        tiles[x][z] = tile;
      }
    }
    
    tilesRef.current = tiles;

    // ウィンドウリサイズ対応
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !canvasRef.current) return;
      
      const aspect = window.innerWidth / (window.innerHeight - 100); // フッター高さを考慮
      const frustumSize = 10;
      
      cameraRef.current.left = frustumSize * aspect / -2;
      cameraRef.current.right = frustumSize * aspect / 2;
      cameraRef.current.top = frustumSize / 2;
      cameraRef.current.bottom = frustumSize / -2;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(window.innerWidth, window.innerHeight - 100);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // アニメーションループ
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      animationFrameRef.current = requestAnimationFrame(animate);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    animate();

    // クリーンアップ関数
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      
      // メモリリーク防止
      tilesRef.current.forEach(row => {
        row.forEach(tile => {
          if (tile.geometry) tile.geometry.dispose();
          if (tile.material instanceof THREE.Material) tile.material.dispose();
        });
      });
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [categories, articles]);

  // タイルクリック処理
  const handleCanvasClick = (event: MouseEvent) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x, y }, cameraRef.current);
    
    const intersects = raycaster.intersectObjects(sceneRef.current.children);
    
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      
      // タイルを見つける
      tilesRef.current.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
          if (tile === clickedObject) {
            if (rowIndex === 0) {
              // カテゴリータイルクリック処理
              console.log(`カテゴリー: ${categories[colIndex]}`);
              // ここにカテゴリー情報表示ロジックを追加
            } else {
              // 通常タイルクリック処理
              const currentHeight = tile.scale.y;
              // 高さをアニメーションで変更
              const targetHeight = currentHeight === 1 ? 1.5 : 1;
              
              // アニメーション
              const animate = () => {
                const diff = targetHeight - tile.scale.y;
                if (Math.abs(diff) < 0.01) {
                  tile.scale.y = targetHeight;
                  return;
                }
                
                tile.scale.y += diff * 0.1;
                requestAnimationFrame(animate);
              };
              
              animate();
            }
          }
        });
      });
    }
  };

  return (
    <div className="index-container">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ width: '100%', height: 'calc(100vh - 100px)' }}
      />
      <style>{`
        .index-container {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
