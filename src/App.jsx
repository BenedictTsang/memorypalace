import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Brain, Eye, CheckCircle, RotateCcw, MapPin, Box, ArrowRight, 
  Trophy, Home, ShoppingBag, Lock, Coins, Hammer, Star, 
  Sofa, Tv, Bed, Lamp, Book, Coffee, Music, Sun, 
  Menu, ChevronLeft, ChevronRight, User,
  ArrowUp, ArrowDown, ArrowLeft, MousePointer, ShieldCheck,
  Grid, Layout, Package, Check, X, Move, Trash2, Settings,
  PenTool, Download, Image as ImageIcon, Wand2, RefreshCw, Loader2, Upload, DollarSign,
  History, RotateCcw as UndoIcon, Clock
} from 'lucide-react';

// ==========================================
// 0. 模擬追蹤工具 (MOCK TRACKING HOOK)
// ==========================================
const useTracking = () => {
  const logEvent = useCallback((eventName, params = {}) => {
    const time = new Date().toLocaleTimeString();
    console.groupCollapsed(`%c📊 TRACKING: ${eventName} @ ${time}`, 'color: #10b981; font-weight: bold; background: #ecfdf5; padding: 2px 5px; border-radius: 4px;');
    console.log('%c事件名稱:', 'color: #6b7280; font-weight: bold;', eventName);
    console.log('%c參數細節:', 'color: #6b7280; font-weight: bold;', params);
    if (params.value) {
      console.log(`%c💰 消費金額: $${params.value}`, 'color: #f59e0b; font-weight: bold;');
    }
    console.groupEnd();
  }, []);
  return { logEvent };
};

// ==========================================
// 1. 遊戲化數據與配置 (GAME DATA)
// ==========================================

const HOUSE_LEVELS = [
  { level: 0, name: '唐樓板間房', cost: 0, capacity: 3, size: 10 }, 
  { level: 1, name: '溫馨公屋', cost: 100, capacity: 4, size: 11 },
  { level: 2, name: '現代居屋', cost: 300, capacity: 5, size: 12 },
  { level: 3, name: '豪華洋房', cost: 800, capacity: 6, size: 14 }
];

// --- 傢俱 3D 模型定義 (Low Poly Models) ---
const FURNITURE_MODELS = {
  hk_stool: [ 
    { x: 0.2, y: 0.2, z: 0, w: 0.1, d: 0.1, h: 0.4, color: '#94a3b8' }, 
    { x: 0.7, y: 0.2, z: 0, w: 0.1, d: 0.1, h: 0.4, color: '#94a3b8' }, 
    { x: 0.2, y: 0.7, z: 0, w: 0.1, d: 0.1, h: 0.4, color: '#94a3b8' }, 
    { x: 0.7, y: 0.7, z: 0, w: 0.1, d: 0.1, h: 0.4, color: '#94a3b8' }, 
    { x: 0.15, y: 0.15, z: 0.4, w: 0.7, d: 0.7, h: 0.05, color: '#ef4444' }, 
  ],
  hk_table: [
    { x: 0.1, y: 0.1, z: 0, w: 0.1, d: 0.1, h: 0.7, color: '#cbd5e1' }, 
    { x: 1.8, y: 0.1, z: 0, w: 0.1, d: 0.1, h: 0.7, color: '#cbd5e1' }, 
    { x: 0.1, y: 1.8, z: 0, w: 0.1, d: 0.1, h: 0.7, color: '#cbd5e1' }, 
    { x: 1.8, y: 1.8, z: 0, w: 0.1, d: 0.1, h: 0.7, color: '#cbd5e1' }, 
    { x: 0, y: 0, z: 0.7, w: 2, d: 2, h: 0.05, color: '#b45309' }, 
  ],
  hk_bed: [
    { x: 0, y: 0, z: 0.3, w: 2, d: 3, h: 0.1, color: '#78350f' }, 
    { x: 0, y: 0, z: 0, w: 0.2, d: 0.2, h: 0.3, color: '#522a07' }, 
    { x: 1.8, y: 0, z: 0, w: 0.2, d: 0.2, h: 0.3, color: '#522a07' }, 
    { x: 0, y: 2.8, z: 0, w: 0.2, d: 0.2, h: 0.3, color: '#522a07' }, 
    { x: 1.8, y: 2.8, z: 0, w: 0.2, d: 0.2, h: 0.3, color: '#522a07' }, 
    { x: 0, y: 0, z: 0.3, w: 2, d: 0.1, h: 0.6, color: '#522a07' }, 
    { x: 0, y: 2.9, z: 0.3, w: 2, d: 0.1, h: 0.3, color: '#522a07' }, 
  ],
  default: [
    { x: 0, y: 0, z: 0, w: 1, d: 1, h: 0.5, color: '#cbd5e1' }
  ]
};

const FURNITURE_CATALOG = [
  { id: 'hk_stool', name: '經典摺櫈', icon: Box, cost: 0, desc: '十大武器之首，隨開隨坐', type: 'basic', size: [1, 1], height: 10, color: '#ef4444' },
  { id: 'hk_table', name: '木紋摺枱', icon: Layout, cost: 0, desc: '開飯做功課一枱多用', type: 'table', size: [2, 2], height: 15, color: '#b45309' },
  { id: 'hk_bed', name: '硬板單人床', icon: Bed, cost: 0, desc: '夏天鋪張竹蓆最涼爽', type: 'bed', size: [2, 3], height: 8, color: '#78350f' },
  { id: 'sofa', name: '懶人沙發', icon: Sofa, cost: 120, desc: '坐下去就不想起來', type: 'comfort', size: [2, 1], height: 12, color: '#3b82f6' },
  { id: 'tv', name: '彩色電視', icon: Tv, cost: 200, desc: '巨大的顯像管螢幕', type: 'tech', size: [1, 2], height: 20, color: '#1f2937' },
  { id: 'bookshelf', name: '實木書櫃', icon: Book, cost: 150, desc: '智慧的象徵', type: 'study', size: [2, 1], height: 40, color: '#92400e' },
  { id: 'bed_soft', name: '彈簧雙人床', icon: Bed, cost: 300, desc: '終於有床褥了', type: 'comfort', size: [3, 4], height: 15, color: '#ec4899' }, 
  { id: 'piano', name: '古典鋼琴', icon: Music, cost: 500, desc: '優雅的樂章', type: 'art', size: [2, 3], height: 25, color: '#000000' },
];

const EMPTY_LOCATIONS = [
  { name: '門口走廊', desc: '狹窄的通道', icon: MapPin },
  { name: '窗邊角落', desc: '可以看到隔壁晾的衣服', icon: MapPin },
  { name: '牆上日曆', desc: '撕去的一頁頁時光', icon: MapPin },
  { name: '天花板風扇', desc: '緩慢轉動著', icon: MapPin },
  { name: '廚房灶頭', desc: '充滿油煙味的地方', icon: MapPin },
  { name: '鐵閘門', desc: '拉動時會發出巨響', icon: MapPin },
];

const WORD_BANK = ['巨大西瓜', '燃燒吉他', '粉紅大象', '愛因斯坦', '飛天掃帚', '黃金馬桶', '冰淇淋山', '武士刀', '外星人', '鑽石項鍊'];

// ==========================================
// 2. 狀態管理與邏輯 (HOOKS & LOGIC)
// ==========================================

const useGameProgress = () => {
  const { logEvent } = useTracking(); 
  const isAdmin = true; 
  const ADMIN_FUNDS = 9999999999;

  const [coins, setCoins] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mp_coins');
      if (isAdmin) return ADMIN_FUNDS;
      return saved ? parseInt(saved) : 0;
    }
    return isAdmin ? ADMIN_FUNDS : 0;
  });

  const [houseLevel, setHouseLevel] = useState(() => {
    if (typeof window !== 'undefined') return parseInt(localStorage.getItem('mp_level') || '0');
    return 0;
  });

  const [inventory, setInventory] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mp_inventory');
      return saved ? JSON.parse(saved) : ['hk_stool', 'hk_table', 'hk_bed'];
    }
    return ['hk_stool', 'hk_table', 'hk_bed'];
  });

  const [customCatalog, setCustomCatalog] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('mp_custom_catalog');
        return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [customModels, setCustomModels] = useState(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('mp_custom_models');
        return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [placements, setPlacements] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mp_placements_v2');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [history, setHistory] = useState(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('mp_history');
          return saved ? JSON.parse(saved) : [];
      }
      return [];
  });

  const fullCatalog = useMemo(() => [...FURNITURE_CATALOG, ...customCatalog], [customCatalog]);
  const fullModels = useMemo(() => ({ ...FURNITURE_MODELS, ...customModels }), [customModels]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mp_coins', coins);
      localStorage.setItem('mp_level', houseLevel);
      localStorage.setItem('mp_inventory', JSON.stringify(inventory));
      localStorage.setItem('mp_placements_v2', JSON.stringify(placements));
      localStorage.setItem('mp_custom_catalog', JSON.stringify(customCatalog));
      localStorage.setItem('mp_custom_models', JSON.stringify(customModels));
      localStorage.setItem('mp_history', JSON.stringify(history));
    }
  }, [coins, houseLevel, inventory, placements, customCatalog, customModels, history]);

  const currentLoci = useMemo(() => {
    const capacity = HOUSE_LEVELS[houseLevel].capacity;
    const sortedPlacements = [...placements].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    return Array(capacity).fill(null).map((_, index) => {
      if (index < sortedPlacements.length) {
        const p = sortedPlacements[index];
        const itemInfo = fullCatalog.find(f => f.id === p.furnitureId);
        if (itemInfo) {
          return { 
            id: `loc-${index}`, 
            name: itemInfo.name, 
            icon: itemInfo.icon, 
            description: itemInfo.desc,
            isFurniture: true,
            furnitureId: itemInfo.id,
            placementId: p.id,
            spriteImages: itemInfo.spriteImages,
            spriteFilter: itemInfo.spriteFilter 
          };
        }
      }
      return { 
        id: `loc-${index}`, 
        name: EMPTY_LOCATIONS[index]?.name || '未開發區域', 
        icon: EMPTY_LOCATIONS[index]?.icon || MapPin, 
        description: EMPTY_LOCATIONS[index]?.desc || '這裡需要擴建',
        isFurniture: false
      };
    });
  }, [placements, houseLevel, fullCatalog]);

  const recordHistory = (actionName, newPlacements) => {
      const snapshot = {
          id: Date.now(),
          name: actionName,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          data: newPlacements
      };
      setHistory(prev => [snapshot, ...prev].slice(0, 30)); 
  };

  const restoreHistory = (snapshot) => {
      setPlacements(snapshot.data);
      logEvent('restore_history', { snapshot_id: snapshot.id, snapshot_name: snapshot.name });
  };

  const buyItem = (item) => {
    if (coins >= item.cost && !inventory.includes(item.id)) {
      if (isAdmin) {
        setInventory(i => [...i, item.id]);
        setCoins(ADMIN_FUNDS); 
      } else {
        setCoins(c => c - item.cost);
        setInventory(i => [...i, item.id]);
      }
      logEvent('spend_virtual_currency', { item_name: item.name, value: item.cost });
      return true;
    }
    return false;
  };

  const addPlacement = (furnitureId, x, y, rotation) => {
    const newP = { id: crypto.randomUUID(), furnitureId, x, y, rotation };
    const nextPlacements = [...placements, newP];
    setPlacements(nextPlacements);
    recordHistory('新增傢俱', nextPlacements);
    logEvent('place_furniture', { furnitureId, x, y });
  };

  const updatePlacement = (id, x, y, rotation) => {
    const nextPlacements = placements.map(p => p.id === id ? { ...p, x, y, rotation } : p);
    setPlacements(nextPlacements);
    recordHistory('移動傢俱', nextPlacements);
  };

  const removePlacement = (placementId) => {
    const nextPlacements = placements.filter(p => p.id !== placementId);
    setPlacements(nextPlacements);
    recordHistory('移除傢俱', nextPlacements);
  };

  const upgradeHouse = () => {
    const nextLevel = houseLevel + 1;
    if (nextLevel < HOUSE_LEVELS.length) {
      if (coins >= HOUSE_LEVELS[nextLevel].cost) {
        if (isAdmin) {
          setHouseLevel(l => l + 1);
          setCoins(ADMIN_FUNDS); 
        } else {
          setCoins(c => c - HOUSE_LEVELS[nextLevel].cost);
          setHouseLevel(l => l + 1);
        }
        logEvent('level_up', { new_level: nextLevel, house_name: HOUSE_LEVELS[nextLevel].name });
        return true;
      }
    }
    return false;
  };

  const addNewFurniture = (newFurniture, modelData = null) => {
      setCustomCatalog(prev => [...prev, newFurniture]);
      if (modelData) {
          setCustomModels(prev => ({ ...prev, [newFurniture.id]: modelData }));
      }
      setInventory(prev => [...prev, newFurniture.id]);
      logEvent('unlock_custom_furniture', { name: newFurniture.name, type: newFurniture.type });
  };

  return { 
    coins, setCoins, houseLevel, upgradeHouse, 
    inventory, buyItem, addPlacement, updatePlacement, removePlacement, placements,
    currentLoci, isAdmin, fullCatalog, fullModels, addNewFurniture,
    history, restoreHistory
  };
};

// ==========================================
// 3. 視覺組件 (ISOMETRIC COMPONENTS)
// ==========================================

const IsometricRoom = ({ houseLevel, placements, onCommitPlacement, draggingItem, setDraggingRotation, draggingRotation, isRemoveMode, removalSelectedId, onFurnitureClick, onFurnitureMouseDown, movingPlacementId, fullCatalog, fullModels }) => {
  const [offset, setOffset] = useState({ x: 0, y: 100 });
  const [rotation, setRotation] = useState(0); 
  const [hoveredTile, setHoveredTile] = useState(null); 
  const [isPanDragging, setIsPanDragging] = useState(false);
  const [isRotateDragging, setIsRotateDragging] = useState(false); 
  const lastMouseRef = useRef({ x: 0, y: 0 });
  
  const gridSize = HOUSE_LEVELS[houseLevel].size; 
  const tileWidth = 60;
  const tileHeight = 35; // 30 deg approx
  
  const toIso = (x, y) => {
    const cx = x - gridSize / 2;
    const cy = y - gridSize / 2;
    const rx = cx * Math.cos(rotation) - cy * Math.sin(rotation);
    const ry = cx * Math.sin(rotation) + cy * Math.cos(rotation);
    return {
      x: (rx - ry) * (tileWidth / 2),
      y: (rx + ry) * (tileHeight / 2)
    };
  };

  const drawBoxPrimitive = (globalX, globalY, p, furnitureW, furnitureD, rot, colorOverride, opacityOverride, indexKey, isGhost) => {
    let lx = p.x; let ly = p.y; let lw = p.w; let ld = p.d;

    if (rot === 1) { const oldLx = lx; lx = furnitureD - ly - ld; ly = oldLx; const oldLw = lw; lw = ld; ld = oldLw; } 
    else if (rot === 2) { lx = furnitureW - lx - lw; ly = furnitureD - ly - ld; } 
    else if (rot === 3) { const oldLx = lx; lx = ly; ly = furnitureW - oldLx - lw; const oldLw = lw; lw = ld; ld = oldLw; }

    const worldX = globalX + lx; const worldY = globalY + ly;
    const zScale = 40; const h = p.h * zScale; const zBase = p.z * zScale;
    const p1 = toIso(worldX, worldY); const p2 = toIso(worldX + lw, worldY); const p3 = toIso(worldX + lw, worldY + ld); const p4 = toIso(worldX, worldY + ld);
    p1.y -= zBase; p2.y -= zBase; p3.y -= zBase; p4.y -= zBase;
    const t1 = { x: p1.x, y: p1.y - h }; const t2 = { x: p2.x, y: p2.y - h }; const t3 = { x: p3.x, y: p3.y - h }; const t4 = { x: p4.x, y: p4.y - h };
    const color = colorOverride || p.color; const opacity = opacityOverride || 1;

    return (
        <g key={`part-${indexKey}`} style={{ opacity, pointerEvents: isGhost ? 'none' : 'auto' }}>
            <path d={`M${p2.x} ${p2.y} L${p3.x} ${p3.y} L${t3.x} ${t3.y} L${t2.x} ${t2.y} Z`} fill={color} filter="brightness(0.85)" />
            <path d={`M${p3.x} ${p3.y} L${p4.x} ${p4.y} L${t4.x} ${t4.y} L${t3.x} ${t3.y} Z`} fill={color} filter="brightness(0.7)" />
            <path d={`M${t1.x} ${t1.y} L${t2.x} ${t2.y} L${t3.x} ${t3.y} L${t4.x} ${t4.y} Z`} fill={color} filter="brightness(1.1)" />
        </g>
    );
  };

  const drawSpriteFurniture = (x, y, item, rot, isGhost = false, isValid = true, isSelected = false) => {
      const [w, d] = item.size;
      const effectiveW = rot % 2 === 0 ? w : d;
      const effectiveD = rot % 2 === 0 ? d : w;
      
      const center = toIso(x + effectiveW/2, y + effectiveD/2);
      const imageIndex = rot % 4;
      const imgSrc = item.spriteImages[imageIndex];
      const imgWidth = Math.max(effectiveW, effectiveD) * 70; 
      const imgHeight = imgWidth; 

      let opacity = 1;
      let filter = item.spriteFilter || "";
      
      if (isGhost) {
          opacity = 0.7;
          filter = isValid ? "" : "sepia(1) hue-rotate(-50deg) saturate(3)"; 
      } else if (isSelected) {
          filter = "drop-shadow(0 0 5px red)";
      }

      return (
          <g style={{ opacity, pointerEvents: isGhost ? 'none' : 'auto' }}>
               <image 
                  href={imgSrc} 
                  x={center.x - imgWidth / 2} 
                  y={center.y - imgHeight + 20} 
                  width={imgWidth} 
                  height={imgHeight}
                  style={{ filter }}
               />
          </g>
      );
  };

  const drawComplexFurniture = (x, y, item, rot, isGhost = false, isValid = true, isSelected = false) => {
    if (item.type === 'sprite' && item.spriteImages) {
        return drawSpriteFurniture(x, y, item, rot, isGhost, isValid, isSelected);
    }

    const models = fullModels[item.id] || fullModels.default;
    const furnitureW = item.size[0];
    const furnitureD = item.size[1];
    let colorOverride = null;
    let opacity = 1;

    if (isGhost) {
      colorOverride = isValid ? '#34d399' : '#f87171'; 
      opacity = 0.6;
    } else if (isSelected) {
      colorOverride = '#f87171'; 
    }

    return (
        <g>
            {models.map((prim, idx) => 
                drawBoxPrimitive(x, y, prim, furnitureW, furnitureD, rot, colorOverride, opacity, idx, isGhost)
            )}
        </g>
    );
  };

  const handleMouseDown = (e) => {
    if (e.button === 2) {
      e.preventDefault();
      if (draggingItem) {
        setDraggingRotation(prev => (prev + 1) % 4);
      } else {
        setIsRotateDragging(true);
      }
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      return;
    }
    if (e.button === 0 && !draggingItem) {
      setIsPanDragging(true);
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e) => {
    if (isPanDragging) {
      const deltaX = e.clientX - lastMouseRef.current.x;
      const deltaY = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      setOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    } else if (isRotateDragging) {
      const deltaX = e.clientX - lastMouseRef.current.x;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      setRotation(prev => prev + deltaX * 0.01);
    }
  };

  const handleMouseUp = () => {
    setIsPanDragging(false);
    setIsRotateDragging(false); 
    if (draggingItem && hoveredTile && isValidPlacement(hoveredTile.x, hoveredTile.y, draggingItem, draggingRotation)) {
      onCommitPlacement(draggingItem.id, hoveredTile.x, hoveredTile.y, draggingRotation);
    }
  };

  const handleTileHover = (x, y) => {
    setHoveredTile({ x, y });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (draggingItem) {
      setDraggingRotation(prev => (prev + 1) % 4);
    }
  };

  const isValidPlacement = (x, y, item, rot) => {
    if (!item) return false;
    const [w, d] = item.size;
    const effectiveW = rot % 2 === 0 ? w : d;
    const effectiveD = rot % 2 === 0 ? d : w;

    if (x + effectiveW > gridSize || y + effectiveD > gridSize) return false;

    for (let p of placements) {
      if (p.id === movingPlacementId) continue;
      const existingItem = fullCatalog.find(f => f.id === p.furnitureId);
      if (!existingItem) continue;
      const [ew, ed] = existingItem.size; 
      const pW = p.rotation % 2 === 0 ? ew : ed;
      const pD = p.rotation % 2 === 0 ? ed : ew;

      if (x < p.x + pW && x + effectiveW > p.x && y < p.y + pD && y + effectiveD > p.y) return false;
    }
    return true;
  };

  const renderScene = () => {
    const objects = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const center = toIso(x + 0.5, y + 0.5); 
        const isAlt = (x + y) % 2 === 0;
        const fillColor = isAlt ? '#FFFBF0' : '#F0E4D0';
        const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
        objects.push({
          depth: center.y, type: 'floor',
          render: (
            <path key={`tile-${x}-${y}`}
              d={`M${toIso(x, y).x} ${toIso(x, y).y} L${toIso(x + 1, y).x} ${toIso(x + 1, y).y} L${toIso(x + 1, y + 1).x} ${toIso(x + 1, y + 1).y} L${toIso(x, y + 1).x} ${toIso(x, y + 1).y} Z`}
              fill={fillColor} stroke={isHovered ? '#6366f1' : '#D7C7A5'} strokeWidth={isHovered ? 2 : 1}
              onMouseEnter={() => handleTileHover(x, y)} className="transition-colors duration-75 cursor-pointer"
            />
          )
        });
      }
    }
    placements.forEach(p => {
      const item = fullCatalog.find(f => f.id === p.furnitureId);
      if (!item || p.id === movingPlacementId) return;
      const [w, d] = item.size;
      const effectiveW = p.rotation % 2 === 0 ? w : d;
      const effectiveD = p.rotation % 2 === 0 ? d : w;
      const center = toIso(p.x + effectiveW/2, p.y + effectiveD/2);
      const isSelected = removalSelectedId === p.id;
      objects.push({
        depth: center.y + 10, type: 'furniture',
        render: (
          <g key={p.id} onMouseDown={(e) => {
              if (isRemoveMode) { e.stopPropagation(); onFurnitureClick(p.id); } 
              else { e.stopPropagation(); if (e.button === 0) onFurnitureMouseDown(p); }
            }} className={`cursor-pointer hover:opacity-90 transition-opacity`}>
             {drawComplexFurniture(p.x, p.y, item, p.rotation, false, true, isSelected)}
             {isRemoveMode && <title>點擊選擇移除</title>}
          </g>
        )
      });
    });
    if (draggingItem && hoveredTile) {
      const { x, y } = hoveredTile;
      const center = toIso(x + 0.5, y + 0.5);
      const isValid = isValidPlacement(x, y, draggingItem, draggingRotation);
      const ghostEl = drawComplexFurniture(x, y, draggingItem, draggingRotation, true, isValid);
      objects.push({ depth: center.y + 20, type: 'ghost', render: React.cloneElement(ghostEl, { key: 'ghost-active' }) });
    }
    const avatarX = Math.floor(gridSize / 2);
    const avatarY = Math.floor(gridSize / 2);
    const avatarPos = toIso(avatarX + 0.5, avatarY + 0.5); 
    objects.push({
      depth: avatarPos.y + 5, type: 'avatar',
      render: (
        <g key="avatar" transform={`translate(${toIso(avatarX, avatarY).x}, ${toIso(avatarX, avatarY).y - 10})`} style={{pointerEvents: 'none'}}>
          <ellipse cx="0" cy="0" rx="20" ry="10" fill="rgba(0,0,0,0.15)" />
          <rect x="-12" y="-45" width="24" height="35" rx="12" fill="#6366f1" />
          <rect x="-6" y="-35" width="12" height="15" rx="6" fill="#818cf8" />
          <path d="M-8 -15 L-8 0" stroke="#4f46e5" strokeWidth="8" strokeLinecap="round" />
          <path d="M8 -15 L8 0" stroke="#4f46e5" strokeWidth="8" strokeLinecap="round" />
          <circle cx="0" cy="-55" r="22" fill="#fda4af" stroke="#f43f5e" strokeWidth="2" />
          <circle cx="-6" cy="-55" r="2" fill="#333" />
          <circle cx="6" cy="-55" r="2" fill="#333" />
        </g>
      )
    });
    objects.sort((a, b) => a.depth - b.depth);
    return objects.map(o => o.render);
  };
  
  const renderWalls = () => {
    const wallHeight = 180;
    const corners = [{x:0,y:0}, {x:gridSize,y:0}, {x:gridSize,y:gridSize}, {x:0,y:gridSize}];
    const screenCorners = corners.map(c => ({...c, pos: toIso(c.x, c.y)}));
    let backCornerIdx = 0; let minScreenY = Infinity;
    screenCorners.forEach((c, idx) => { if (c.pos.y < minScreenY) { minScreenY = c.pos.y; backCornerIdx = idx; } });
    const prevIdx = (backCornerIdx - 1 + 4) % 4; const nextIdx = (backCornerIdx + 1) % 4;
    const backCorner = screenCorners[backCornerIdx]; const prevCorner = screenCorners[prevIdx]; const nextCorner = screenCorners[nextIdx];
    return (
      <g style={{pointerEvents: 'none'}}>
        <path d={`M${backCorner.pos.x} ${backCorner.pos.y} L${prevCorner.pos.x} ${prevCorner.pos.y} L${prevCorner.pos.x} ${prevCorner.pos.y - wallHeight} L${backCorner.pos.x} ${backCorner.pos.y - wallHeight} Z`} fill="#F5E6D3" stroke="#C0A080" strokeWidth="2" />
        <path d={`M${backCorner.pos.x} ${backCorner.pos.y} L${nextCorner.pos.x} ${nextCorner.pos.y} L${nextCorner.pos.x} ${nextCorner.pos.y - wallHeight} L${backCorner.pos.x} ${backCorner.pos.y - wallHeight} Z`} fill="#E6D0B3" stroke="#C0A080" strokeWidth="2" />
      </g>
    );
  };

  const renderCompassLabels = () => {
    const labelStyle = { fontSize: "14px", fontWeight: "bold", fill: "#8D6E63", fontFamily: "monospace", textAnchor: "middle", dominantBaseline: "middle" };
    const nPos = toIso(0, gridSize/2); const ePos = toIso(gridSize/2, 0); const sPos = toIso(gridSize, gridSize/2); const wPos = toIso(gridSize/2, gridSize); 
    return (
      <g className="select-none pointer-events-none">
        <text x={nPos.x - 40} y={nPos.y - 15} {...labelStyle}>北 (N)</text>
        <text x={ePos.x + 40} y={ePos.y - 15} {...labelStyle}>東 (E)</text>
        <text x={sPos.x + 40} y={sPos.y + 25} {...labelStyle}>南 (S)</text>
        <text x={wPos.x - 40} y={wPos.y + 25} {...labelStyle}>西 (W)</text>
      </g>
    );
  };

  return (
    <div 
      className={`w-full h-full flex items-center justify-center overflow-hidden bg-slate-50 relative group ${draggingItem ? 'cursor-grabbing' : isRemoveMode ? 'cursor-crosshair' : 'cursor-default'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      <svg viewBox="-400 -300 800 600" className="w-full h-full max-w-[800px] select-none" preserveAspectRatio="xMidYMid meet">
        <g transform={`translate(${offset.x}, ${offset.y})`}>
          {renderWalls()}
          {renderScene()}
          {renderCompassLabels()}
        </g>
      </svg>
      <div className="absolute top-4 right-4 text-xs text-slate-500 bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 pointer-events-none shadow-sm flex flex-col gap-1 items-end">
        {isRemoveMode ? ( <> <div className="flex items-center gap-1 text-red-600 font-bold"><MousePointer size={12}/> 點擊紅色傢俱選擇</div> <div className="flex items-center gap-1 text-gray-600">再點擊側邊欄確認</div> </> ) : draggingItem ? ( <> <div className="flex items-center gap-1 text-indigo-600 font-bold"><Move size={12}/> 放開左鍵放置</div> <div className="flex items-center gap-1 text-orange-600 font-bold"><RotateCcw size={12}/> 按右鍵旋轉方向</div> </> ) : ( <> <div className="flex items-center gap-1"><MousePointer size={12}/> <span className="font-bold">左鍵拖曳</span> 平移 / 移動傢俱</div> <div className="flex items-center gap-1"><RotateCcw size={12}/> <span className="font-bold">右鍵拖曳</span> 旋轉</div> </> )}
      </div>
    </div>
  );
};

// ==========================================
// 4. UI 組件層 (COMPONENTS)
// ==========================================

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false, icon: Icon, onMouseDown }) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    gold: "bg-amber-400 text-amber-900 hover:bg-amber-300 font-bold"
  };
  return (
    <button onClick={onClick} onMouseDown={onMouseDown} disabled={disabled} className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}{children}
    </button>
  );
};

const FurnitureStudio = ({ onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [modelJson, setModelJson] = useState(JSON.stringify(FURNITURE_MODELS.hk_stool, null, 2));
  const [itemName, setItemName] = useState('New Furniture');
  const [price, setPrice] = useState(100);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const generateFromPrompt = (input) => {
    const p = input.toLowerCase(); let model = []; let color = '#cbd5e1'; 
    if (p.includes('紅')) color = '#ef4444'; else if (p.includes('藍')) color = '#3b82f6'; else if (p.includes('木')) color = '#b45309';
    model.push({ x: 0.1, y: 0.1, z: 0, w: 0.8, d: 0.8, h: 0.5, color: color }); return model;
  };
  const handleGenerate = () => { setIsAnalyzing(true); setTimeout(() => { const model = generateFromPrompt(prompt); setHistory(prev => [...prev, { id: Date.now(), model, name: `版本 #${history.length + 1}` }]); setModelJson(JSON.stringify(model, null, 2)); setIsAnalyzing(false); }, 1000); };
  const restoreVersion = (item) => { setModelJson(JSON.stringify(item.model, null, 2)); };
  const handleSave = () => { const newFurniture = { id: `design_${Date.now()}`, name: itemName, icon: PenTool, cost: parseInt(price), desc: "Designer Furniture", type: 'geometric', size: [1, 1], height: 10, color: '#cbd5e1' }; onSave(newFurniture, JSON.parse(modelJson)); onClose(); };
  return ( <div className="h-full flex gap-4 p-2"> <div className="flex-1 flex flex-col gap-4"> <h3 className="font-bold text-lg flex items-center gap-2"><PenTool/> 家具設計室 (Parametric)</h3> <div className="bg-white p-4 rounded-xl border space-y-3"> <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="輸入提示詞 (e.g. 紅色椅子)..." className="border p-2 rounded w-full text-sm"/> <div className="flex gap-2"> <Button onClick={handleGenerate} disabled={isAnalyzing} className="flex-1"> {isAnalyzing ? <Loader2 className="animate-spin" size={14}/> : "生成模型"} </Button> </div> </div> <div className="flex-1 bg-slate-100 rounded-xl flex items-center justify-center border"> <div className="text-slate-400 text-sm">幾何預覽 (JSON驅動)</div> </div> <div className="flex gap-2 justify-end"> <Button variant="ghost" onClick={onClose}>取消</Button> <Button variant="primary" onClick={handleSave} icon={Package}>儲存設計</Button> </div> </div> <div className="w-48 bg-slate-50 border-l p-4 flex flex-col gap-2 overflow-y-auto"> <h4 className="font-bold text-xs text-slate-500 uppercase flex items-center gap-1"><History size={12}/> 版本歷史</h4> {history.length === 0 && <div className="text-xs text-slate-400 italic">暫無生成紀錄</div>} {history.map((h, i) => ( <div key={h.id} onClick={() => restoreVersion(h)} className="p-2 bg-white border rounded cursor-pointer hover:border-indigo-400 text-xs shadow-sm active:scale-95 transition-all"> <div className="font-bold text-indigo-600">{h.name}</div> <div className="text-[10px] text-slate-400">JSON: {JSON.stringify(h.model).length} chars</div> </div> ))} </div> </div> );
};

const FurnitureUploader = ({ onClose, onSave }) => {
    const [images, setImages] = useState([null, null, null, null]);
    const [dims, setDims] = useState({ ns: 1, ew: 1 });
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [refPrice, setRefPrice] = useState(0);
    const [rotation, setRotation] = useState(0); 
    const [correctionPrompt, setCorrectionPrompt] = useState('');
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const [aiMessage, setAiMessage] = useState('');
    const [history, setHistory] = useState([{ id: 'init', name: '#1 初始空白', images: [null, null, null, null], filter: '' }]); 
    const handleImageUpload = (index, e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => { const newImages = [...images]; newImages[index] = ev.target.result; setImages(newImages); addHistory(`#${history.length + 1} 上傳圖片`, newImages, ""); }; reader.readAsDataURL(file); } };
    const addHistory = (label, imgs, filter) => { setHistory(prev => [...prev, { id: Date.now(), name: label, images: imgs, filter: filter }]); };
    const restoreVersion = (version) => { setImages(version.images); };
    useEffect(() => { if (!name) return; let hash = 0; for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash); const autoPrice = (Math.abs(hash) % 50) * 10 + 50; setRefPrice(autoPrice); if (price === 0) setPrice(autoPrice); }, [name]);
    const handleAICorrection = () => { if (!correctionPrompt) return; setIsAIProcessing(true); setAiMessage("AI 正在分析圖片結構..."); const randomFilters = [ "contrast(1.2) brightness(1.1)", "sepia(0.3) contrast(1.1)", "saturate(1.5) hue-rotate(10deg)", "grayscale(0.2) brightness(1.2)" ]; const newFilter = randomFilters[Math.floor(Math.random() * randomFilters.length)]; setTimeout(() => { setIsAIProcessing(false); setAiMessage("修正完成！(已儲存至版本歷史)"); addHistory(`#${history.length + 1} AI: ${correctionPrompt}`, images, newFilter); setCorrectionPrompt(""); setTimeout(() => setAiMessage(""), 3000); }, 1500); };
    const handleSave = () => { if (!name || !images[0]) { alert("請至少輸入名稱並上傳第一張圖片（南方）"); return; } const finalImages = images.map(img => img || images[0]); const newFurniture = { id: `custom_${Date.now()}`, name, icon: ImageIcon, cost: parseInt(price) || refPrice, desc: "管理員上傳的自定義家具", type: 'sprite', size: [parseInt(dims.ew) || 1, parseInt(dims.ns) || 1], spriteImages: finalImages }; onSave(newFurniture); onClose(); };
    
    const tileWidth = 80; const tileHeight = 46; 
    const cx = 2; const cy = 2;
    const toIsoPreview = (x, y) => {
        const ox = x - cx; const oy = y - cy;
        const angle = (rotation * 90) * (Math.PI / 180);
        const rx = ox * Math.cos(angle) - oy * Math.sin(angle);
        const ry = ox * Math.sin(angle) + oy * Math.cos(angle);
        return { x: (rx - ry) * (tileWidth / 2) + 256, y: (rx + ry) * (tileHeight / 2) + 300 };
    };

    return ( <div className="h-full flex gap-4 p-2 overflow-hidden"> <div className="flex-1 flex flex-col gap-4 overflow-y-auto"> <div className="flex gap-4 h-[350px]"> <div className="w-1/2 grid grid-cols-2 gap-2"> {['南方 (正面)', '西方 (左側)', '北方 (背面)', '東方 (右側)'].map((label, idx) => ( <div key={idx} className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center relative bg-gray-50 hover:bg-white transition-colors group"> {images[idx] ? ( <img src={images[idx]} alt={label} className="w-full h-full object-contain p-2" /> ) : ( <div className="text-gray-400 flex flex-col items-center"> <Upload size={24} className="mb-2"/> <span className="text-xs">{label}</span> </div> )} <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(idx, e)} /> {images[idx] && <div className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">{label}</div>} </div> ))} </div> <div className="w-1/2 bg-slate-100 rounded-xl border border-slate-200 relative flex flex-col items-center justify-center overflow-hidden"> <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div> <div className="relative z-10 transition-all duration-300" style={{ transform: 'scale(1.5)' }}> {images[rotation] ? ( <img src={images[rotation]} alt="Preview" className="max-w-[150px] max-h-[150px] drop-shadow-xl" /> ) : ( <div className="text-gray-400 text-xs">暫無預覽圖片</div> )} <div className="mt-4 bg-black/10 px-3 py-1 rounded-full text-xs font-mono text-gray-600 text-center"> 面向: {['南', '西', '北', '東'][rotation]} </div> </div> <div className="absolute bottom-4 flex gap-2"> <Button variant="ghost" onClick={() => setRotation((r) => (r - 1 + 4) % 4)}><RotateCcw size={16} className="scale-x-[-1]"/></Button> <Button variant="ghost" onClick={() => setRotation((r) => (r + 1) % 4)}><RotateCcw size={16}/></Button> </div> </div> </div> <div className="grid grid-cols-2 gap-4"> <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3"> <h3 className="font-bold text-slate-700 flex items-center gap-2"><Settings size={16}/> 規格設定</h3> <div className="flex items-center gap-2"> <label className="text-xs font-bold text-slate-500 w-16">佔地格數</label> <input type="number" min="1" max="5" value={dims.ns} onChange={e => setDims({...dims, ns: e.target.value})} className="w-16 border rounded p-1 text-center text-sm"/> <span className="text-slate-400">x</span> <input type="number" min="1" max="5" value={dims.ew} onChange={e => setDims({...dims, ew: e.target.value})} className="w-16 border rounded p-1 text-center text-sm"/> <span className="text-xs text-slate-400 ml-2">(南北 x 東西)</span> </div> </div> <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3"> <h3 className="font-bold text-slate-700 flex items-center gap-2"><Wand2 size={16}/> AI 修正 (模擬)</h3> <div className="flex gap-2"> <input type="text" placeholder="例如: 去背, 調亮, 風格化..." value={correctionPrompt} onChange={e => setCorrectionPrompt(e.target.value)} className="flex-1 border rounded p-2 text-xs" /> <Button variant="primary" className="px-3 py-1 text-xs" onClick={handleAICorrection} disabled={isAIProcessing}> {isAIProcessing ? <Loader2 className="animate-spin" size={14}/> : "修正"} </Button> </div> {aiMessage && <div className="text-xs text-emerald-600 font-bold">{aiMessage}</div>} </div> </div> <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4"> <div className="flex gap-4"> <div className="flex-1"> <label className="text-xs font-bold text-slate-500 block mb-1">家具名稱</label> <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="給家具取個名字..." className="w-full border rounded p-2 text-sm"/> </div> <div className="w-1/3"> <label className="text-xs font-bold text-slate-500 block mb-1">定價 (參考: ${refPrice})</label> <div className="relative"> <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/> <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border rounded p-2 pl-6 text-sm"/> </div> </div> </div> <div className="pt-2 border-t border-gray-100 flex justify-end gap-2"> <Button variant="ghost" onClick={onClose}>取消</Button> <Button variant="primary" onClick={handleSave} icon={Package}>上架家具</Button> </div> </div> </div> <div className="w-48 bg-slate-50 border-l p-4 flex flex-col gap-2 overflow-y-auto shrink-0"> <h4 className="font-bold text-xs text-slate-500 uppercase flex items-center gap-1"><History size={12}/> 版本歷史</h4> {history.map((h, i) => ( <div key={h.id} onClick={() => restoreVersion(h)} className="p-3 bg-white border rounded-xl cursor-pointer hover:border-indigo-400 text-xs shadow-sm active:scale-95 transition-all group"> <div className="font-bold text-indigo-600 mb-1">{h.name}</div> <div className="grid grid-cols-2 gap-0.5 opacity-50 group-hover:opacity-100"> {h.images.slice(0,4).map((img, idx) => ( <div key={idx} className="w-full h-8 bg-slate-100 rounded overflow-hidden"> {img && <img src={img} className="w-full h-full object-cover" style={{filter: h.filter}}/>} </div> ))} </div> </div> ))} </div> </div> );
};

const Sidebar = ({ isOpen, toggle, coins, onStart, onShop, currentPhase, isAdmin, inventory, onDragStart, 
  isRemoveMode, toggleRemoveMode, confirmRemove, cancelRemove, hasSelection, onOpenUploader, onOpenStudio,
  globalHistory, onRestoreHistory, fullCatalog
}) => {
  const [tab, setTab] = useState('menu'); 

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-xl z-30 transition-all duration-300 flex flex-col ${isOpen ? 'w-72' : 'w-20'}`}>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {isOpen ? (
          <div className="flex items-center gap-2 font-bold text-indigo-900">
            <div className="bg-indigo-600 text-white p-1 rounded-md"><Brain size={16}/></div>
            <span>Memory Palace</span>
          </div>
        ) : (
          <div className="mx-auto bg-indigo-600 text-white p-2 rounded-lg"><Brain size={20}/></div>
        )}
        <button onClick={toggle} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hidden md:block">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {isOpen && tab !== 'admin' && (
        <div className="flex border-b border-gray-100 text-xs">
          <button onClick={() => setTab('menu')} className={`flex-1 py-3 font-bold ${tab === 'menu' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>主選單</button>
          <button onClick={() => setTab('furniture')} className={`flex-1 py-3 font-bold ${tab === 'furniture' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>我的家具</button>
          <button onClick={() => setTab('history')} className={`flex-1 py-3 font-bold ${tab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>歷史</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto select-none flex flex-col">
        {tab === 'menu' && (
          <div className="p-4 flex flex-col h-full">
             <div className="space-y-3 flex-1">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-3 mb-4">
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600"><Coins size={20}/></div>
                    <div>
                      <div className="text-xs text-gray-500 font-bold uppercase">資金</div>
                      <div className="text-xl font-bold text-gray-800">{isAdmin ? "♾️" : coins}</div>
                    </div>
                </div>
                <Button onClick={onStart} variant="primary" className={`w-full ${!isOpen && 'px-0'}`} disabled={currentPhase !== 'intro'}>{isOpen ? "開始訓練" : <Brain />}</Button>
                <Button onClick={onShop} variant="secondary" className={`w-full ${!isOpen && 'px-0'}`} disabled={currentPhase !== 'intro'}>{isOpen ? "家具商店" : <ShoppingBag />}</Button>
             </div>
             {isAdmin && (
               <div className="mt-auto pt-4 border-t border-gray-100">
                 <Button variant="ghost" className="w-full text-indigo-600" onClick={() => setTab('admin')}>
                   <ShieldCheck size={16} /> 進入管理員頁面
                 </Button>
               </div>
             )}
          </div>
        )}

        {tab === 'furniture' && isOpen && (
          <>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {inventory.length === 0 && <div className="text-center text-gray-400 py-4">倉庫空空如也</div>}
              {inventory.map((itemId, idx) => {
                const item = fullCatalog.find(f => f.id === itemId);
                if (!item) return null;
                return (
                  <div 
                    key={`${item.id}-${idx}`}
                    onMouseDown={() => !isRemoveMode && onDragStart(item)}
                    className={`bg-white border-2 border-dashed rounded-xl p-3 flex items-center gap-3 group transition-all
                      ${isRemoveMode ? 'opacity-50 cursor-not-allowed border-gray-100' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-grab active:cursor-grabbing'}`}
                  >
                    <div className="p-2 bg-gray-100 group-hover:bg-white rounded-lg text-gray-500 group-hover:text-indigo-600 transition-colors">
                      <item.icon size={20}/>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-800">{item.name}</div>
                      <div className="text-xs text-gray-400">尺寸: {item.size[0]}x{item.size[1]}</div>
                    </div>
                    {!isRemoveMode && <div className="ml-auto opacity-0 group-hover:opacity-100 text-xs text-indigo-500 font-bold">拖曳!</div>}
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
              {isRemoveMode && (
                <div className="flex gap-2 mb-2 animate-fade-in">
                   <Button variant="success" className="flex-1 text-xs" onClick={confirmRemove} disabled={!hasSelection} icon={Check}>確認移除</Button>
                   <Button variant="secondary" className="flex-1 text-xs" onClick={cancelRemove} icon={X}>取消移除</Button>
                </div>
              )}
              <Button 
                variant={isRemoveMode ? "danger" : "secondary"} 
                className="w-full"
                onClick={toggleRemoveMode}
                disabled={currentPhase !== 'intro'}
              >
                <Trash2 size={16} /> {isRemoveMode ? "退出拆除模式" : "移除傢俱"}
              </Button>
            </div>
          </>
        )}

        {tab === 'history' && isOpen && (
            <div className="flex-1 p-4 overflow-y-auto">
                {globalHistory.length === 0 ? (
                    <div className="text-center text-gray-400 text-xs py-4">暫無佈置紀錄</div>
                ) : (
                    <div className="space-y-3">
                        <div className="text-xs text-slate-400 font-bold uppercase mb-2">最近 30 筆操作</div>
                        {globalHistory.map((record) => (
                            <div key={record.id} className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:border-indigo-300 transition-all cursor-pointer group" onClick={() => onRestoreHistory(record)}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-700 text-sm">{record.name}</span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10}/> {record.timestamp}</span>
                                </div>
                                <div className="text-xs text-slate-500">物件數: {record.data.length}</div>
                                <div className="text-xs text-indigo-600 mt-2 opacity-0 group-hover:opacity-100 font-bold flex items-center gap-1">
                                    <UndoIcon size={12}/> 點擊還原此狀態
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {tab === 'admin' && isOpen && (
            <div className="p-4 flex flex-col h-full animate-fade-in">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 text-xl font-bold text-slate-800">
                        <ShieldCheck className="text-emerald-500" /> 管理員
                    </div>
                    <div className="space-y-2">
                        <Button variant="secondary" className="w-full justify-start" onClick={onOpenStudio}>
                            <PenTool size={16} /> 家具設計室 (Parametric)
                        </Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={onOpenUploader}>
                            <Upload size={16} /> 上傳新家具 (Upload)
                        </Button>
                        <div className="p-4 bg-slate-100 rounded-xl text-xs text-slate-500">
                            管理員權限：<br/>• 無限資金 (♾️)<br/>• 自定義家具上架
                        </div>
                    </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                    <Button variant="secondary" className="w-full" onClick={() => setTab('history')}>
                        <History size={16} /> 歷史紀錄
                    </Button>
                    <Button variant="ghost" className="w-full text-slate-500" onClick={() => setTab('menu')}>
                        <ArrowLeft size={16} /> 返回主選單
                    </Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default function MemoryPalaceTycoon() {
  const { 
    coins, setCoins, houseLevel, upgradeHouse, 
    inventory, buyItem, addPlacement, updatePlacement, removePlacement, placements,
    currentLoci, isAdmin, fullCatalog, fullModels, addNewFurniture,
    history, restoreHistory
  } = useGameProgress();

  const [phase, setPhase] = useState('intro');
  const [showShop, setShowShop] = useState(false);
  const [showUploader, setShowUploader] = useState(false); 
  const [showStudio, setShowStudio] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [draggingItem, setDraggingItem] = useState(null);
  const [draggingRotation, setDraggingRotation] = useState(0);
  const [movingPlacementId, setMovingPlacementId] = useState(null);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [removalSelectedId, setRemovalSelectedId] = useState(null);
  const [gameItems, setGameItems] = useState([]);
  const [associations, setAssociations] = useState({});
  const [resultData, setResultData] = useState({ score: 0, reward: 0 });

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth < 768) setSidebarOpen(false); else setSidebarOpen(true); };
    if (typeof window !== 'undefined') { handleResize(); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => { if (draggingItem) { setDraggingItem(null); setMovingPlacementId(null); setDraggingRotation(0); } };
    window.addEventListener('mouseup', handleGlobalMouseUp); return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [draggingItem]);

  const startSession = () => {
      const validLoci = currentLoci.filter(l => l.isFurniture);
      if (validLoci.length === 0) { alert("請先佈置家具才能開始訓練！"); return; }
      const itemCount = validLoci.length;
      const shuffled = [...WORD_BANK].sort(() => 0.5 - Math.random()).slice(0, itemCount);
      setGameItems(shuffled); setAssociations({}); setPhase('encoding');
  };

  const handleFinishRecall = (answers) => {
      let score = 0; const validLoci = currentLoci.filter(l => l.isFurniture);
      gameItems.forEach((item, idx) => { if (idx < validLoci.length && answers[validLoci[idx].id] === associations[validLoci[idx].id]) score++; });
      const reward = (score * 10) + (score === gameItems.length ? 50 : 0);
      setResultData({ score, reward }); setCoins(c => c + reward); setPhase('result');
  };

  const handleDragStart = (item) => { if (phase !== 'intro') return; setDraggingItem(item); setDraggingRotation(0); setMovingPlacementId(null); };
  const handleFurnitureMouseDown = (placement) => {
     if (phase !== 'intro' || isRemoveMode) return;
     const item = fullCatalog.find(f => f.id === placement.furnitureId);
     if (item) { setMovingPlacementId(placement.id); setDraggingItem(item); setDraggingRotation(placement.rotation); }
  };
  const handleCommitPlacement = (itemId, x, y, rotation) => {
     if (movingPlacementId) { updatePlacement(movingPlacementId, x, y, rotation); setMovingPlacementId(null); }
     else { addPlacement(itemId, x, y, rotation); }
     setDraggingItem(null);
  };
  const toggleRemoveMode = () => { setIsRemoveMode(!isRemoveMode); setRemovalSelectedId(null); };
  const handleFurnitureClick = (id) => { if (isRemoveMode) setRemovalSelectedId(id === removalSelectedId ? null : id); };
  const confirmRemove = () => { if (removalSelectedId) { removePlacement(removalSelectedId); setRemovalSelectedId(null); } };
  const cancelRemove = () => { setRemovalSelectedId(null); };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-800 selection:bg-indigo-100">
      <Sidebar 
        isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} coins={coins} currentPhase={phase}
        onStart={startSession} onShop={() => setShowShop(true)} isAdmin={isAdmin} inventory={inventory}
        onDragStart={handleDragStart} isRemoveMode={isRemoveMode} toggleRemoveMode={toggleRemoveMode}
        confirmRemove={confirmRemove} cancelRemove={cancelRemove} hasSelection={!!removalSelectedId}
        onOpenUploader={() => { setPhase('intro'); setShowUploader(true); }}
        onOpenStudio={() => { setPhase('intro'); setShowStudio(true); }}
        globalHistory={history}
        onRestoreHistory={restoreHistory}
        fullCatalog={fullCatalog} 
      />
      <main className={`flex-1 transition-all duration-300 relative overflow-y-auto ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {!sidebarOpen && <div className="absolute top-4 left-4 z-20 md:hidden"><button onClick={() => setSidebarOpen(true)} className="p-2 bg-white rounded-lg shadow-md border border-gray-100 text-gray-600"><Menu size={20} /></button></div>}

        {showUploader ? (
          <div className="h-full flex flex-col bg-white p-4">
             <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
               <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-800"><Upload/> 家具上傳中心</h2>
               <Button variant="ghost" onClick={() => setShowUploader(false)}><X/></Button>
             </div>
             <div className="flex-1 overflow-hidden">
               <FurnitureUploader onClose={() => setShowUploader(false)} onSave={addNewFurniture}/>
             </div>
          </div>
        ) : showStudio ? (
          <div className="h-full flex flex-col bg-white p-4">
             <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
               <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-800"><PenTool/> 家具設計室</h2>
               <Button variant="ghost" onClick={() => setShowStudio(false)}><X/></Button>
             </div>
             <div className="flex-1 overflow-hidden">
               <FurnitureStudio onClose={() => setShowStudio(false)} onSave={addNewFurniture}/>
             </div>
          </div>
        ) : (
            <>
            {phase === 'intro' && (
              <div className="h-full flex flex-col">
                <div className="p-8 pb-0 text-center z-10"><h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">My Memory Palace</h1><p className="text-slate-500 text-sm max-w-lg mx-auto">拖曳左側的家具來佈置你的空間。</p></div>
                <div className="flex-1 w-full relative min-h-[400px]">
                  <IsometricRoom 
                    houseLevel={houseLevel} placements={placements} onCommitPlacement={handleCommitPlacement}
                    draggingItem={draggingItem} draggingRotation={draggingRotation} setDraggingRotation={setDraggingRotation}
                    isRemoveMode={isRemoveMode} removalSelectedId={removalSelectedId} onFurnitureClick={handleFurnitureClick}
                    onFurnitureMouseDown={handleFurnitureMouseDown} movingPlacementId={movingPlacementId} fullCatalog={fullCatalog} fullModels={fullModels}
                  />
                  <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none"><div className="inline-block bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-sm text-xs font-mono text-slate-400"><span className="font-bold text-indigo-500">SCALE:</span> 1 Unit = 0.5m (Q-Style)</div></div>
                </div>
              </div>
            )}
            {phase === 'encoding' && <EncodingView items={gameItems} loci={currentLoci.filter(l => l.isFurniture)} associations={associations} onAssociate={(locId, item) => setAssociations(prev => ({...prev, [locId]: item}))} onNext={() => setPhase('recall')} />}
            {phase === 'recall' && <RecallView items={gameItems} loci={currentLoci.filter(l => l.isFurniture)} associations={associations} onFinish={handleFinishRecall} />}
            {phase === 'result' && <ResultView score={resultData.score} total={gameItems.length} coinsEarned={resultData.reward} onConfirm={() => setPhase('intro')} />}
            </>
        )}
      </main>
      {showShop && <ShopView coins={coins} inventory={inventory} houseLevel={houseLevel} onBuy={buyItem} onUpgrade={upgradeHouse} onClose={() => setShowShop(false)} isAdmin={isAdmin} />}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }`}</style>
    </div>
  );
}