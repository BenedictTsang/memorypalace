import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';


import { createClient } from '@supabase/supabase-js'; 


import { 
  Brain, Eye, CheckCircle, RotateCcw, MapPin, Box, ArrowRight, 
  Trophy, Home, ShoppingBag, Lock, Coins, Hammer, Star, 
  Sofa, Tv, Bed, Lamp, Book, Coffee, Music, Sun, 
  Menu, ChevronLeft, ChevronRight, User,
  ArrowUp, ArrowDown, ArrowLeft, MousePointer, ShieldCheck,
  Grid, Layout, Package, Check, X, Move, Trash2, Settings,
  PenTool, Download, Image as ImageIcon, Wand2, RefreshCw, Loader2, Upload, DollarSign,
  History, RotateCcw as UndoIcon, Clock, Cloud, LogIn, LogOut, LayoutGrid, List
} from 'lucide-react';

// ==========================================
// ⚙️ SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://lpyhtbvycxqjjqpwjxyh.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_xfzpWWf8-hMbmwWN1GMBlQ_tdSMB_w5';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);



// ==========================================
// 0. 模擬追蹤工具
// ==========================================
const useTracking = () => {
  const logEvent = useCallback((eventName, params = {}) => {
    const time = new Date().toLocaleTimeString();
    console.groupCollapsed(`%c📊 TRACKING: ${eventName} @ ${time}`, 'color: #10b981; font-weight: bold; background: #ecfdf5; padding: 2px 5px; border-radius: 4px;');
    console.log('%c事件名稱:', 'color: #6b7280; font-weight: bold;', eventName);
    console.log('%c參數細節:', 'color: #6b7280; font-weight: bold;', params);
    if (params.value) console.log(`%c💰 消費金額: $${params.value}`, 'color: #f59e0b; font-weight: bold;');
    console.groupEnd();
  }, []);
  return { logEvent };
};

// ==========================================
// 1. 遊戲化數據與配置
// ==========================================

const HOUSE_LEVELS = [
  { level: 0, name: '唐樓板間房', cost: 0, capacity: 3, size: 10 }, 
  { level: 1, name: '溫馨公屋', cost: 100, capacity: 4, size: 11 },
  { level: 2, name: '現代居屋', cost: 300, capacity: 5, size: 12 },
  { level: 3, name: '豪華洋房', cost: 800, capacity: 6, size: 14 }
];

const FURNITURE_MODELS = {
  hk_stool: [ { x: 0.2, y: 0.2, z: 0, w: 0.1, d: 0.1, h: 0.4, color: '#94a3b8' }, { x: 0.7, y: 0.2, z: 0, w: 0.1, d: 0.1, h: 0.4, color: '#94a3b8' }, { x: 0.2, y: 0.7, z: 0, w: 0.1, d: 0.1, h: 0.4, color: '#94a3b8' }, { x: 0.7, y: 0.7, z: 0, w: 0.1, d: 0.1, h: 0.4, color: '#94a3b8' }, { x: 0.15, y: 0.15, z: 0.4, w: 0.7, d: 0.7, h: 0.05, color: '#ef4444' } ],
  hk_table: [ { x: 0.1, y: 0.1, z: 0, w: 0.1, d: 0.1, h: 0.7, color: '#cbd5e1' }, { x: 1.8, y: 0.1, z: 0, w: 0.1, d: 0.1, h: 0.7, color: '#cbd5e1' }, { x: 0.1, y: 1.8, z: 0, w: 0.1, d: 0.1, h: 0.7, color: '#cbd5e1' }, { x: 1.8, y: 1.8, z: 0, w: 0.1, d: 0.1, h: 0.7, color: '#cbd5e1' }, { x: 0, y: 0, z: 0.7, w: 2, d: 2, h: 0.05, color: '#b45309' } ],
  hk_bed: [ { x: 0, y: 0, z: 0.3, w: 2, d: 3, h: 0.1, color: '#78350f' }, { x: 0, y: 0, z: 0, w: 0.2, d: 0.2, h: 0.3, color: '#522a07' }, { x: 1.8, y: 0, z: 0, w: 0.2, d: 0.2, h: 0.3, color: '#522a07' }, { x: 0, y: 2.8, z: 0, w: 0.2, d: 0.2, h: 0.3, color: '#522a07' }, { x: 1.8, y: 2.8, z: 0, w: 0.2, d: 0.2, h: 0.3, color: '#522a07' }, { x: 0, y: 0, z: 0.3, w: 2, d: 0.1, h: 0.6, color: '#522a07' }, { x: 0, y: 2.9, z: 0.3, w: 2, d: 0.1, h: 0.3, color: '#522a07' } ],
  default: [ { x: 0, y: 0, z: 0, w: 1, d: 1, h: 0.5, color: '#cbd5e1' } ]
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
// 2. 狀態管理與邏輯
// ==========================================

const useGameProgress = () => {
  const { logEvent } = useTracking(); 
  const isAdmin = true; 
  const ADMIN_FUNDS = 9999999999;

  // [NEW] User Session State
  const [user, setUser] = useState(null);
  const [isCloudLoading, setIsCloudLoading] = useState(false);

  const [coins, setCoins] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mp_coins');
      if (isAdmin) return ADMIN_FUNDS;
      return saved ? parseInt(saved) : 0;
    }
    return isAdmin ? ADMIN_FUNDS : 0;
  });

  const [houseLevel, setHouseLevel] = useState(() => parseInt(localStorage.getItem('mp_level') || '0'));
  const [inventory, setInventory] = useState(() => JSON.parse(localStorage.getItem('mp_inventory') || '["hk_stool", "hk_table", "hk_bed"]'));
  const [customCatalog, setCustomCatalog] = useState(() => JSON.parse(localStorage.getItem('mp_custom_catalog') || '[]'));
  const [customModels, setCustomModels] = useState(() => JSON.parse(localStorage.getItem('mp_custom_models') || '{}'));
  const [placements, setPlacements] = useState(() => JSON.parse(localStorage.getItem('mp_placements_v2') || '[]'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('mp_history') || '[]'));

  const fullCatalog = useMemo(() => [...FURNITURE_CATALOG, ...customCatalog], [customCatalog]);
  const fullModels = useMemo(() => ({ ...FURNITURE_MODELS, ...customModels }), [customModels]);

  // [NEW] Check Supabase Auth on Mount
  useEffect(() => {
    if (!supabase) return;
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadFromCloud(session.user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadFromCloud(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // [NEW] Sync to Cloud
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mp_coins', coins);
      localStorage.setItem('mp_level', houseLevel);
      localStorage.setItem('mp_inventory', JSON.stringify(inventory));
      localStorage.setItem('mp_placements_v2', JSON.stringify(placements));
      localStorage.setItem('mp_custom_catalog', JSON.stringify(customCatalog));
      localStorage.setItem('mp_custom_models', JSON.stringify(customModels));
      localStorage.setItem('mp_history', JSON.stringify(history));

      // If logged in, save to cloud
      if (user && supabase) {
        saveToCloud();
      }
    }
  }, [coins, houseLevel, inventory, placements, customCatalog, customModels, history, user]);

  // [NEW] Cloud Operations
  const loadFromCloud = async (userId) => {
    if (!supabase) return;
    setIsCloudLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error && error.code !== 'PGRST116') throw error; // Ignore not found (new user)

      if (data) {
        console.log("Cloud data loaded:", data);
        if (data.coins !== undefined) setCoins(data.coins);
        if (data.house_level !== undefined) setHouseLevel(data.house_level);
        if (data.inventory) setInventory(data.inventory);
        if (data.custom_catalog) setCustomCatalog(data.custom_catalog);
        if (data.placements) setPlacements(data.placements);
        if (data.history) setHistory(data.history);
      }
    } catch (error) {
      console.error('Error loading from cloud:', error);
    } finally {
      setIsCloudLoading(false);
    }
  };

  const saveToCloud = async () => {
    if (!user || !supabase) return;
    try {
      const updates = {
        id: user.id,
        coins,
        house_level: houseLevel,
        inventory,
        custom_catalog: customCatalog,
        placements,
        history,
        updated_at: new Date()
      };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving to cloud:', error);
    }
  };

  // [NEW] Image Upload to Storage Bucket
  const uploadFurnitureImage = async (file) => {
    if (!user || !supabase) {
      // Fallback to Base64 if not logged in
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('furniture').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('furniture').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload failed, falling back to base64', error);
      // Fallback
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
      });
    }
  };

  // Auth Actions
  const signIn = async (email, password) => {
    if(!supabase) return alert("Supabase 未設定");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const signUp = async (email, password) => {
    if(!supabase) return alert("Supabase 未設定");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("註冊成功！請檢查信箱驗證，或直接登入(若已關閉驗證)");
  };

  const signOut = async () => {
    if(!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  // ... (Rest of existing logic: currentLoci, buyItem etc.) ...
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
            id: `loc-${index}`, name: itemInfo.name, icon: itemInfo.icon, description: itemInfo.desc,
            isFurniture: true, furnitureId: itemInfo.id, placementId: p.id,
            spriteImages: itemInfo.spriteImages, spriteFilter: itemInfo.spriteFilter 
          };
        }
      }
      return { id: `loc-${index}`, name: EMPTY_LOCATIONS[index]?.name || '未開發區域', icon: EMPTY_LOCATIONS[index]?.icon || MapPin, description: EMPTY_LOCATIONS[index]?.desc || '這裡需要擴建', isFurniture: false };
    });
  }, [placements, houseLevel, fullCatalog]);

  const recordHistory = (actionName, newPlacements) => {
      const snapshot = { id: Date.now(), name: actionName, timestamp: new Date().toLocaleTimeString(), data: newPlacements };
      setHistory(prev => [snapshot, ...prev].slice(0, 30)); 
  };
  const restoreHistory = (snapshot) => {
      setPlacements(snapshot.data);
      logEvent('restore_history', { snapshot_id: snapshot.id, snapshot_name: snapshot.name });
  };
  const buyItem = (item) => {
    if (coins >= item.cost && !inventory.includes(item.id)) {
      if (isAdmin) { setInventory(i => [...i, item.id]); setCoins(ADMIN_FUNDS); } 
      else { setCoins(c => c - item.cost); setInventory(i => [...i, item.id]); }
      logEvent('spend_virtual_currency', { item_name: item.name, value: item.cost });
      return true;
    } return false;
  };
  const addPlacement = (furnitureId, x, y, rotation) => {
    const newP = { id: crypto.randomUUID(), furnitureId, x, y, rotation };
    const nextPlacements = [...placements, newP];
    setPlacements(nextPlacements); recordHistory('新增傢俱', nextPlacements); logEvent('place_furniture', { furnitureId, x, y });
  };
  const updatePlacement = (id, x, y, rotation) => {
    const nextPlacements = placements.map(p => p.id === id ? { ...p, x, y, rotation } : p);
    setPlacements(nextPlacements); recordHistory('移動傢俱', nextPlacements);
  };
  const removePlacement = (placementId) => {
    const nextPlacements = placements.filter(p => p.id !== placementId);
    setPlacements(nextPlacements); recordHistory('移除傢俱', nextPlacements);
  };
  const upgradeHouse = () => {
    const nextLevel = houseLevel + 1;
    if (nextLevel < HOUSE_LEVELS.length) {
      if (coins >= HOUSE_LEVELS[nextLevel].cost) {
        if (isAdmin) { setHouseLevel(l => l + 1); setCoins(ADMIN_FUNDS); } 
        else { setCoins(c => c - HOUSE_LEVELS[nextLevel].cost); setHouseLevel(l => l + 1); }
        logEvent('level_up', { new_level: nextLevel, house_name: HOUSE_LEVELS[nextLevel].name });
        return true;
      }
    } return false;
  };
  const addNewFurniture = (newFurniture, modelData = null) => {
      setCustomCatalog(prev => [...prev, newFurniture]);
      if (modelData) setCustomModels(prev => ({ ...prev, [newFurniture.id]: modelData }));
      setInventory(prev => [...prev, newFurniture.id]);
      logEvent('unlock_custom_furniture', { name: newFurniture.name, type: newFurniture.type });
  };

  return { 
    coins, setCoins, houseLevel, upgradeHouse, 
    inventory, buyItem, addPlacement, updatePlacement, removePlacement, placements,
    currentLoci, isAdmin, fullCatalog, fullModels, addNewFurniture,
    history, restoreHistory,
    user, signIn, signUp, signOut, uploadFurnitureImage, isCloudLoading
  };
};

// ==========================================
// 3. UI 組件
// ==========================================

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false, icon: Icon, onMouseDown, title }) => {
  const variants = { primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm", secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50", success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm", danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm", ghost: "bg-transparent text-gray-600 hover:bg-gray-100", gold: "bg-amber-400 text-amber-900 hover:bg-amber-300 font-bold" };
  
  return ( 
    <button 
      onClick={onClick} onMouseDown={onMouseDown} disabled={disabled} title={title}
      className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
       {Icon && <Icon size={18} className="flex-shrink-0" />}
       <span className="truncate">{children}</span>
    </button> 
  );
};

// [FIX] Improved Sidebar with better collapsing and layout
const Sidebar = ({ isOpen, toggle, coins, onStart, onShop, currentPhase, isAdmin, inventory, onDragStart, 
  isRemoveMode, toggleRemoveMode, confirmRemove, cancelRemove, hasSelection, onOpenUploader, onOpenStudio,
  globalHistory, onRestoreHistory, fullCatalog, user, onLoginClick, onLogoutClick
}) => {
  const [tab, setTab] = useState('menu'); 

  // 當管理員分頁被關閉時，自動切回 menu
  useEffect(() => {
    if (tab === 'admin' && !isOpen) setTab('menu');
  }, [isOpen, tab]);

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-2xl z-50 flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
      
      {/* 1. Header */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-gray-100 flex-shrink-0">
        <div className={`flex items-center gap-2 font-bold text-indigo-900 overflow-hidden transition-all ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
          <div className="bg-indigo-600 text-white p-1 rounded-md flex-shrink-0"><Brain size={20}/></div>
          <span className="truncate">Memory Palace</span>
        </div>
        <button onClick={toggle} className={`p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-all ${!isOpen && 'mx-auto'}`}>
          {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 2. Tabs (Icon only when collapsed) */}
      <div className="flex border-b border-gray-100 text-xs flex-shrink-0">
        <button onClick={()=>setTab('menu')} title="主選單" className={`flex-1 py-3 flex justify-center items-center ${tab==='menu'?'text-indigo-600 border-b-2 border-indigo-600':'text-gray-400 hover:bg-gray-50'}`}>
           <Home size={18}/>
           {isOpen && <span className="ml-2">主頁</span>}
        </button>
        <button onClick={()=>setTab('furniture')} title="傢俱倉庫" className={`flex-1 py-3 flex justify-center items-center ${tab==='furniture'?'text-indigo-600 border-b-2 border-indigo-600':'text-gray-400 hover:bg-gray-50'}`}>
           <LayoutGrid size={18}/>
           {isOpen && <span className="ml-2">傢俱</span>}
        </button>
        <button onClick={()=>setTab('history')} title="歷史紀錄" className={`flex-1 py-3 flex justify-center items-center ${tab==='history'?'text-indigo-600 border-b-2 border-indigo-600':'text-gray-400 hover:bg-gray-50'}`}>
           <History size={18}/>
           {isOpen && <span className="ml-2">歷史</span>}
        </button>
      </div>

      {/* 3. Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-3">
        
        {/* === TAB: MENU === */}
        {tab === 'menu' && (
          <div className="flex flex-col gap-3 h-full">
             {/* Status Cards */}
             <div className={`transition-all duration-300 ${!isOpen && 'items-center text-center'}`}>
                {/* Coins */}
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 flex items-center gap-3 mb-2 overflow-hidden">
                   <div className="bg-amber-100 p-1.5 rounded-full text-amber-600 flex-shrink-0"><Coins size={18}/></div>
                   {isOpen && <div><div className="text-[10px] text-gray-500 font-bold uppercase">資金</div><div className="font-bold text-sm text-gray-800">{isAdmin ? "♾️" : coins}</div></div>}
                </div>
                
                {/* User */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 overflow-hidden">
                   <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User size={16} className="flex-shrink-0"/>
                      {isOpen && <span className="truncate">{user ? "已登入" : "訪客"}</span>}
                   </div>
                   {isOpen && (user ? 
                     <button onClick={onLogoutClick} className="text-xs w-full py-1 bg-white border rounded text-red-500 hover:bg-red-50">登出</button> :
                     <button onClick={onLoginClick} className="text-xs w-full py-1 bg-white border rounded text-indigo-600 hover:bg-indigo-50">登入同步</button>
                   )}
                </div>
             </div>

             <div className="flex-1 space-y-2">
                <Button onClick={onStart} className={`w-full ${!isOpen && 'px-0 justify-center'}`} disabled={currentPhase !== 'intro'} icon={Brain} title="開始訓練">{isOpen && "開始訓練"}</Button>
                <Button onClick={onShop} variant="secondary" className={`w-full ${!isOpen && 'px-0 justify-center'}`} disabled={currentPhase !== 'intro'} icon={ShoppingBag} title="傢俱商店">{isOpen && "傢俱商店"}</Button>
             </div>
             
             {isAdmin && (
               <div className="mt-auto pt-4 border-t border-gray-100">
                 <Button variant="ghost" className={`w-full ${!isOpen && 'px-0 justify-center'}`} onClick={() => setTab('admin')} icon={ShieldCheck} title="管理員後台">
                   {isOpen && "管理員後台"}
                 </Button>
               </div>
             )}
          </div>
        )}

        {/* === TAB: FURNITURE === */}
        {tab === 'furniture' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
              {inventory.length === 0 && <div className="text-center text-gray-400 py-4 text-xs">空空如也</div>}
              {inventory.map((itemId, idx) => {
                const item = fullCatalog.find(f => f.id === itemId);
                if(!item) return null;
                return (
                  <div 
                    key={`${itemId}-${idx}`} 
                    onMouseDown={() => !isRemoveMode && onDragStart(item)}
                    className={`bg-white border rounded-lg p-2 flex items-center gap-3 cursor-grab hover:border-indigo-400 hover:shadow-sm transition-all group ${!isOpen && 'justify-center'}`}
                    title={item.name}
                  >
                     <div className="p-1.5 bg-gray-100 rounded text-gray-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors flex-shrink-0">
                        {item.icon ? <item.icon size={18}/> : <Box size={18}/>}
                     </div>
                     {isOpen && (
                       <div className="min-w-0">
                         <div className="font-bold text-xs text-gray-700 truncate">{item.name}</div>
                         <div className="text-[10px] text-gray-400 truncate">{item.size[0]}x{item.size[1]}</div>
                       </div>
                     )}
                  </div>
                );
              })}
            </div>

            {/* Removal Controls (Always visible at bottom of tab) */}
            <div className="pt-3 border-t border-gray-100 mt-2 space-y-2">
              {isRemoveMode ? (
                 <div className={`flex gap-1 ${!isOpen && 'flex-col'}`}>
                    <Button variant="success" className="flex-1 text-xs px-2 justify-center" onClick={confirmRemove} disabled={!hasSelection} icon={Check} title="確認">{isOpen && "確認"}</Button>
                    <Button variant="secondary" className="flex-1 text-xs px-2 justify-center" onClick={cancelRemove} icon={X} title="取消">{isOpen && "取消"}</Button>
                 </div>
              ) : (
                 <Button variant="secondary" onClick={toggleRemoveMode} className={`w-full justify-center ${!isOpen && 'px-0'}`} icon={Trash2} title="移除模式">
                    {isOpen && "移除模式"}
                 </Button>
              )}
            </div>
          </div>
        )}

        {/* === TAB: HISTORY === */}
        {tab === 'history' && (
           <div className="space-y-2 h-full overflow-y-auto">
              {globalHistory.length === 0 ? <div className="text-center text-gray-400 text-xs py-4">暫無紀錄</div> : 
                 globalHistory.map(h => (
                   <div key={h.id} onClick={()=>onRestoreHistory(h)} className={`p-2 border rounded-lg bg-white cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors ${!isOpen && 'text-center'}`}>
                      {isOpen ? (
                        <>
                          <div className="font-bold text-xs text-gray-700 truncate">{h.name}</div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1"><Clock size={10}/> {h.timestamp}</div>
                        </>
                      ) : (
                        <div title={`${h.name} (${h.timestamp})`}><UndoIcon size={16} className="mx-auto text-gray-500"/></div>
                      )}
                   </div>
                 ))
              }
           </div>
        )}
        
        {/* === TAB: ADMIN === */}
        {tab === 'admin' && (
           <div className="flex flex-col h-full">
              {isOpen ? (
                <div className="flex-1 space-y-2 animate-fade-in">
                   <h3 className="font-bold text-xs text-slate-400 uppercase mb-2">後台管理</h3>
                   <Button variant="secondary" className="w-full justify-start text-sm" onClick={onOpenStudio} icon={PenTool}>設計室</Button>
                   <Button variant="secondary" className="w-full justify-start text-sm" onClick={onOpenUploader} icon={Upload}>上傳中心</Button>
                </div>
              ) : (
                 <div className="flex-1 space-y-2 flex flex-col items-center">
                    <Button variant="secondary" className="px-2" onClick={onOpenStudio} icon={PenTool} title="設計室"></Button>
                    <Button variant="secondary" className="px-2" onClick={onOpenUploader} icon={Upload} title="上傳中心"></Button>
                 </div>
              )}
              
              <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                 <Button variant="ghost" className={`w-full ${!isOpen && 'px-0 justify-center'}`} onClick={()=>setTab('history')} icon={History} title="歷史紀錄">{isOpen && "歷史紀錄"}</Button>
                 <Button variant="ghost" className={`w-full text-slate-500 ${!isOpen && 'px-0 justify-center'}`} onClick={()=>setTab('menu')} icon={ArrowLeft} title="返回">{isOpen && "返回選單"}</Button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

// ... (IsometricRoom & Helper Functions - No Changes needed, just keeping them for context) ...
const IsometricRoom = ({ houseLevel, placements, onCommitPlacement, draggingItem, setDraggingRotation, draggingRotation, isRemoveMode, removalSelectedId, onFurnitureClick, onFurnitureMouseDown, movingPlacementId, fullCatalog, fullModels }) => {
  const [offset, setOffset] = useState({ x: 0, y: 100 });
  const [rotation, setRotation] = useState(0); 
  const [hoveredTile, setHoveredTile] = useState(null); 
  const [isPanDragging, setIsPanDragging] = useState(false);
  const [isRotateDragging, setIsRotateDragging] = useState(false); 
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const gridSize = HOUSE_LEVELS[houseLevel].size; 
  const tileWidth = 60; const tileHeight = 35; 
  
  const toIso = (x, y) => {
    const cx = x - gridSize / 2; const cy = y - gridSize / 2;
    const rx = cx * Math.cos(rotation) - cy * Math.sin(rotation); const ry = cx * Math.sin(rotation) + cy * Math.cos(rotation);
    return { x: (rx - ry) * (tileWidth / 2), y: (rx + ry) * (tileHeight / 2) };
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
      const [w, d] = item.size; const effectiveW = rot % 2 === 0 ? w : d; const effectiveD = rot % 2 === 0 ? d : w;
      const center = toIso(x + effectiveW/2, y + effectiveD/2);
      const imageIndex = rot % 4; const imgSrc = item.spriteImages ? item.spriteImages[imageIndex] : null;
      if (!imgSrc) return null;
      const imgWidth = Math.max(effectiveW, effectiveD) * 70; const imgHeight = imgWidth; 
      let opacity = 1; let filter = item.spriteFilter || "";
      if (isGhost) { opacity = 0.7; filter = isValid ? "" : "sepia(1) hue-rotate(-50deg) saturate(3)"; } else if (isSelected) { filter = "drop-shadow(0 0 5px red)"; }
      return ( <g style={{ opacity, pointerEvents: isGhost ? 'none' : 'auto' }}> <image href={imgSrc} x={center.x - imgWidth / 2} y={center.y - imgHeight + 20} width={imgWidth} height={imgHeight} style={{ filter }} /> </g> );
  };
  const drawComplexFurniture = (x, y, item, rot, isGhost = false, isValid = true, isSelected = false) => {
    if (item.type === 'sprite' && item.spriteImages) return drawSpriteFurniture(x, y, item, rot, isGhost, isValid, isSelected);
    const models = fullModels[item.id] || fullModels.default; const furnitureW = item.size[0]; const furnitureD = item.size[1]; let colorOverride = null; let opacity = 1;
    if (isGhost) { colorOverride = isValid ? '#34d399' : '#f87171'; opacity = 0.6; } else if (isSelected) { colorOverride = '#f87171'; }
    return ( <g>{models.map((prim, idx) => drawBoxPrimitive(x, y, prim, furnitureW, furnitureD, rot, colorOverride, opacity, idx, isGhost))}</g> );
  };
  const handleMouseDown = (e) => { if (e.button === 2) { e.preventDefault(); if (draggingItem) setDraggingRotation(prev => (prev + 1) % 4); else setIsRotateDragging(true); lastMouseRef.current = { x: e.clientX, y: e.clientY }; return; } if (e.button === 0 && !draggingItem) { setIsPanDragging(true); lastMouseRef.current = { x: e.clientX, y: e.clientY }; } };
  const handleMouseMove = (e) => { if (isPanDragging) { const deltaX = e.clientX - lastMouseRef.current.x; const deltaY = e.clientY - lastMouseRef.current.y; lastMouseRef.current = { x: e.clientX, y: e.clientY }; setOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY })); } else if (isRotateDragging) { const deltaX = e.clientX - lastMouseRef.current.x; lastMouseRef.current = { x: e.clientX, y: e.clientY }; setRotation(prev => prev + deltaX * 0.01); } };
  const handleMouseUp = () => { setIsPanDragging(false); setIsRotateDragging(false); if (draggingItem && hoveredTile && isValidPlacement(hoveredTile.x, hoveredTile.y, draggingItem, draggingRotation)) { onCommitPlacement(draggingItem.id, hoveredTile.x, hoveredTile.y, draggingRotation); } };
  const handleTileHover = (x, y) => { setHoveredTile({ x, y }); };
  const handleContextMenu = (e) => { e.preventDefault(); if (draggingItem) { setDraggingRotation(prev => (prev + 1) % 4); } };
  const isValidPlacement = (x, y, item, rot) => { if (!item) return false; const [w, d] = item.size; const effectiveW = rot % 2 === 0 ? w : d; const effectiveD = rot % 2 === 0 ? d : w; if (x + effectiveW > gridSize || y + effectiveD > gridSize) return false; for (let p of placements) { if (p.id === movingPlacementId) continue; const existingItem = fullCatalog.find(f => f.id === p.furnitureId); if (!existingItem) continue; const [ew, ed] = existingItem.size; const pW = p.rotation % 2 === 0 ? ew : ed; const pD = p.rotation % 2 === 0 ? ed : ew; if (x < p.x + pW && x + effectiveW > p.x && y < p.y + pD && y + effectiveD > p.y) return false; } return true; };
  const renderScene = () => {
    const objects = [];
    for (let x = 0; x < gridSize; x++) { for (let y = 0; y < gridSize; y++) { const center = toIso(x + 0.5, y + 0.5); const isAlt = (x + y) % 2 === 0; const fillColor = isAlt ? '#FFFBF0' : '#F0E4D0'; const isHovered = hoveredTile?.x === x && hoveredTile?.y === y; objects.push({ depth: center.y, type: 'floor', render: ( <path key={`tile-${x}-${y}`} d={`M${toIso(x, y).x} ${toIso(x, y).y} L${toIso(x + 1, y).x} ${toIso(x + 1, y).y} L${toIso(x + 1, y + 1).x} ${toIso(x + 1, y + 1).y} L${toIso(x, y + 1).x} ${toIso(x, y + 1).y} Z`} fill={fillColor} stroke={isHovered ? '#6366f1' : '#D7C7A5'} strokeWidth={isHovered ? 2 : 1} onMouseEnter={() => handleTileHover(x, y)} className="transition-colors duration-75 cursor-pointer" /> ) }); } }
    placements.forEach(p => { const item = fullCatalog.find(f => f.id === p.furnitureId); if (!item || p.id === movingPlacementId) return; const [w, d] = item.size; const effectiveW = p.rotation % 2 === 0 ? w : d; const effectiveD = p.rotation % 2 === 0 ? d : w; const center = toIso(p.x + effectiveW/2, p.y + effectiveD/2); const isSelected = removalSelectedId === p.id; objects.push({ depth: center.y + 10, type: 'furniture', render: ( <g key={p.id} onMouseDown={(e) => { if (isRemoveMode) { e.stopPropagation(); onFurnitureClick(p.id); } else { e.stopPropagation(); if (e.button === 0) onFurnitureMouseDown(p); } }} className={`cursor-pointer hover:opacity-90 transition-opacity`}> {drawComplexFurniture(p.x, p.y, item, p.rotation, false, true, isSelected)} {isRemoveMode && <title>點擊選擇移除</title>} </g> ) }); });
    if (draggingItem && hoveredTile) { const { x, y } = hoveredTile; const center = toIso(x + 0.5, y + 0.5); const isValid = isValidPlacement(x, y, draggingItem, draggingRotation); const ghostEl = drawComplexFurniture(x, y, draggingItem, draggingRotation, true, isValid); objects.push({ depth: center.y + 20, type: 'ghost', render: React.cloneElement(ghostEl, { key: 'ghost-active' }) }); }
    const avatarX = Math.floor(gridSize / 2); const avatarY = Math.floor(gridSize / 2); const avatarPos = toIso(avatarX + 0.5, avatarY + 0.5); 
    objects.push({ depth: avatarPos.y + 5, type: 'avatar', render: ( <g key="avatar" transform={`translate(${toIso(avatarX, avatarY).x}, ${toIso(avatarX, avatarY).y - 10})`} style={{pointerEvents: 'none'}}> <ellipse cx="0" cy="0" rx="20" ry="10" fill="rgba(0,0,0,0.15)" /> <rect x="-12" y="-45" width="24" height="35" rx="12" fill="#6366f1" /> <rect x="-6" y="-35" width="12" height="15" rx="6" fill="#818cf8" /> <path d="M-8 -15 L-8 0" stroke="#4f46e5" strokeWidth="8" strokeLinecap="round" /> <path d="M8 -15 L8 0" stroke="#4f46e5" strokeWidth="8" strokeLinecap="round" /> <circle cx="0" cy="-55" r="22" fill="#fda4af" stroke="#f43f5e" strokeWidth="2" /> <circle cx="-6" cy="-55" r="2" fill="#333" /> <circle cx="6" cy="-55" r="2" fill="#333" /> </g> ) });
    objects.sort((a, b) => a.depth - b.depth); return objects.map(o => o.render);
  };
  const renderWalls = () => { const wallHeight = 180; const corners = [{x:0,y:0}, {x:gridSize,y:0}, {x:gridSize,y:gridSize}, {x:0,y:gridSize}]; const screenCorners = corners.map(c => ({...c, pos: toIso(c.x, c.y)})); let backCornerIdx = 0; let minScreenY = Infinity; screenCorners.forEach((c, idx) => { if (c.pos.y < minScreenY) { minScreenY = c.pos.y; backCornerIdx = idx; } }); const prevIdx = (backCornerIdx - 1 + 4) % 4; const nextIdx = (backCornerIdx + 1) % 4; const backCorner = screenCorners[backCornerIdx]; const prevCorner = screenCorners[prevIdx]; const nextCorner = screenCorners[nextIdx]; return ( <g style={{pointerEvents: 'none'}}> <path d={`M${backCorner.pos.x} ${backCorner.pos.y} L${prevCorner.pos.x} ${prevCorner.pos.y} L${prevCorner.pos.x} ${prevCorner.pos.y - wallHeight} L${backCorner.pos.x} ${backCorner.pos.y - wallHeight} Z`} fill="#F5E6D3" stroke="#C0A080" strokeWidth="2" /> <path d={`M${backCorner.pos.x} ${backCorner.pos.y} L${nextCorner.pos.x} ${nextCorner.pos.y} L${nextCorner.pos.x} ${nextCorner.pos.y - wallHeight} L${backCorner.pos.x} ${backCorner.pos.y - wallHeight} Z`} fill="#E6D0B3" stroke="#C0A080" strokeWidth="2" /> </g> ); };
  const renderCompassLabels = () => { const labelStyle = { fontSize: "14px", fontWeight: "bold", fill: "#8D6E63", fontFamily: "monospace", textAnchor: "middle", dominantBaseline: "middle" }; const nPos = toIso(0, gridSize/2); const ePos = toIso(gridSize/2, 0); const sPos = toIso(gridSize, gridSize/2); const wPos = toIso(gridSize/2, gridSize); return ( <g className="select-none pointer-events-none"> <text x={nPos.x - 40} y={nPos.y - 15} {...labelStyle}>北 (N)</text> <text x={ePos.x + 40} y={ePos.y - 15} {...labelStyle}>東 (E)</text> <text x={sPos.x + 40} y={sPos.y + 25} {...labelStyle}>南 (S)</text> <text x={wPos.x - 40} y={wPos.y + 25} {...labelStyle}>西 (W)</text> </g> ); };

  return (
    <div className={`w-full h-full flex items-center justify-center overflow-hidden bg-slate-50 relative group ${draggingItem ? 'cursor-grabbing' : isRemoveMode ? 'cursor-crosshair' : 'cursor-default'}`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onContextMenu={handleContextMenu}>
      <svg viewBox="-400 -300 800 600" className="w-full h-full max-w-[800px] select-none" preserveAspectRatio="xMidYMid meet">
        <g transform={`translate(${offset.x}, ${offset.y})`}> {renderWalls()} {renderScene()} {renderCompassLabels()} </g>
      </svg>
      <div className="absolute top-4 right-4 text-xs text-slate-500 bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 pointer-events-none shadow-sm flex flex-col gap-1 items-end">
        {isRemoveMode ? ( <> <div className="flex items-center gap-1 text-red-600 font-bold"><MousePointer size={12}/> 點擊紅色傢俱選擇</div> <div className="flex items-center gap-1 text-gray-600">再點擊側邊欄確認</div> </> ) : draggingItem ? ( <> <div className="flex items-center gap-1 text-indigo-600 font-bold"><Move size={12}/> 放開左鍵放置</div> <div className="flex items-center gap-1 text-orange-600 font-bold"><RotateCcw size={12}/> 按右鍵旋轉方向</div> </> ) : ( <> <div className="flex items-center gap-1"><MousePointer size={12}/> <span className="font-bold">左鍵拖曳</span> 平移 / 移動傢俱</div> <div className="flex items-center gap-1"><RotateCcw size={12}/> <span className="font-bold">右鍵拖曳</span> 旋轉</div> </> )}
      </div>
    </div>
  );
};

// ... (AuthModal, FurnitureUploader, FurnitureStudio, ShopView, EncodingView, RecallView, ResultView - Standard implementations) ...
// (為節省長度，保留這些組件的標準邏輯，請參考上一版本複製)
const AuthModal = ({ onClose, onSignIn, onSignUp }) => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [isSignUp, setIsSignUp] = useState(false);
  return ( <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"> <div className="bg-white p-6 rounded-xl shadow-xl w-80"> <h3 className="text-lg font-bold mb-4 flex items-center gap-2"> <Cloud size={20} className="text-indigo-500"/> {isSignUp ? "註冊雲端帳號" : "登入雲端"} </h3> <input className="w-full border p-2 rounded mb-2 text-sm" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/> <input className="w-full border p-2 rounded mb-4 text-sm" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/> <Button className="w-full mb-2" onClick={() => isSignUp ? onSignUp(email, password) : onSignIn(email, password)}>{isSignUp ? "註冊" : "登入"}</Button> <div className="text-center text-xs text-slate-500 cursor-pointer hover:text-indigo-600" onClick={()=>setIsSignUp(!isSignUp)}> {isSignUp ? "已有帳號? 登入" : "沒有帳號? 註冊"} </div> <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}><X size={16}/></button> </div> </div> );
};

const FurnitureStudio = ({ onClose, onSave }) => {
  const [prompt, setPrompt] = useState(''); const [modelJson, setModelJson] = useState(JSON.stringify(FURNITURE_MODELS.hk_stool, null, 2)); const [itemName, setItemName] = useState('New Furniture'); const [price, setPrice] = useState(100); const [isAnalyzing, setIsAnalyzing] = useState(false); const [history, setHistory] = useState([]);
  const generateFromPrompt = (input) => { const p = input.toLowerCase(); let model = []; let color = '#cbd5e1'; if (p.includes('紅')) color = '#ef4444'; else if (p.includes('藍')) color = '#3b82f6'; else if (p.includes('木')) color = '#b45309'; model.push({ x: 0.1, y: 0.1, z: 0, w: 0.8, d: 0.8, h: 0.5, color: color }); return model; };
  const handleGenerate = () => { setIsAnalyzing(true); setTimeout(() => { const model = generateFromPrompt(prompt); setHistory(prev => [...prev, { id: Date.now(), model, name: `版本 #${history.length + 1}` }]); setModelJson(JSON.stringify(model, null, 2)); setIsAnalyzing(false); }, 1000); };
  const restoreVersion = (item) => { setModelJson(JSON.stringify(item.model, null, 2)); };
  const handleSave = () => { const newFurniture = { id: `design_${Date.now()}`, name: itemName, icon: PenTool, cost: parseInt(price), desc: "Designer Furniture", type: 'geometric', size: [1, 1], height: 10, color: '#cbd5e1' }; onSave(newFurniture, JSON.parse(modelJson)); onClose(); };
  return ( <div className="h-full flex gap-4 p-2"> <div className="flex-1 flex flex-col gap-4"> <h3 className="font-bold text-lg flex items-center gap-2"><PenTool/> 家具設計室 (Parametric)</h3> <div className="bg-white p-4 rounded-xl border space-y-3"> <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="輸入提示詞 (e.g. 紅色椅子)..." className="border p-2 rounded w-full text-sm"/> <div className="flex gap-2"> <Button onClick={handleGenerate} disabled={isAnalyzing} className="flex-1"> {isAnalyzing ? <Loader2 className="animate-spin" size={14}/> : "生成模型"} </Button> </div> </div> <div className="flex-1 bg-slate-100 rounded-xl flex items-center justify-center border"> <div className="text-slate-400 text-sm">幾何預覽 (JSON驅動)</div> </div> <div className="flex gap-2 justify-end"> <Button variant="ghost" onClick={onClose}>取消</Button> <Button variant="primary" onClick={handleSave} icon={Package}>儲存設計</Button> </div> </div> <div className="w-48 bg-slate-50 border-l p-4 flex flex-col gap-2 overflow-y-auto"> <h4 className="font-bold text-xs text-slate-500 uppercase flex items-center gap-1"><History size={12}/> 版本歷史</h4> {history.length === 0 && <div className="text-xs text-slate-400 italic">暫無生成紀錄</div>} {history.map((h, i) => ( <div key={h.id} onClick={() => restoreVersion(h)} className="p-2 bg-white border rounded cursor-pointer hover:border-indigo-400 text-xs shadow-sm active:scale-95 transition-all"> <div className="font-bold text-indigo-600">{h.name}</div> <div className="text-[10px] text-slate-400">JSON: {JSON.stringify(h.model).length} chars</div> </div> ))} </div> </div> );
};

const FurnitureUploader = ({ onClose, onSave, onUploadImage }) => {
    const [images, setImages] = useState([null, null, null, null]); const [dims, setDims] = useState({ ns: 1, ew: 1 }); const [name, setName] = useState(''); const [price, setPrice] = useState(0); const [refPrice, setRefPrice] = useState(0); const [rotation, setRotation] = useState(0); const [correctionPrompt, setCorrectionPrompt] = useState(''); const [isAIProcessing, setIsAIProcessing] = useState(false); const [aiMessage, setAiMessage] = useState(''); const [history, setHistory] = useState([{ id: 'init', name: '#1 初始空白', images: [null, null, null, null], filter: '' }]); 
    const handleImageUpload = async (index, e) => { const file = e.target.files[0]; if (file) { const url = await onUploadImage(file); if (url) { const newImages = [...images]; newImages[index] = url; setImages(newImages); addHistory(`#${history.length + 1} 上傳圖片`, newImages, ""); } } };
    const addHistory = (label, imgs, filter) => { setHistory(prev => [...prev, { id: Date.now(), name: label, images: imgs, filter: filter }]); };
    const restoreVersion = (version) => { setImages(version.images); };
    useEffect(() => { if (!name) return; let hash = 0; for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash); const autoPrice = (Math.abs(hash) % 50) * 10 + 50; setRefPrice(autoPrice); if (price === 0) setPrice(autoPrice); }, [name]);
    const handleAICorrection = () => { if (!correctionPrompt) return; setIsAIProcessing(true); setAiMessage("AI 正在分析圖片結構..."); const randomFilters = [ "contrast(1.2) brightness(1.1)", "sepia(0.3) contrast(1.1)", "saturate(1.5) hue-rotate(10deg)", "grayscale(0.2) brightness(1.2)" ]; const newFilter = randomFilters[Math.floor(Math.random() * randomFilters.length)]; setTimeout(() => { setIsAIProcessing(false); setAiMessage("修正完成！(已儲存至版本歷史)"); addHistory(`#${history.length + 1} AI: ${correctionPrompt}`, images, newFilter); setCorrectionPrompt(""); setTimeout(() => setAiMessage(""), 3000); }, 1500); };
    const handleSave = () => { if (!name || !images[0]) { alert("請至少輸入名稱並上傳第一張圖片（南方）"); return; } const finalImages = images.map(img => img || images[0]); const newFurniture = { id: `custom_${Date.now()}`, name, icon: ImageIcon, cost: parseInt(price) || refPrice, desc: "管理員上傳的自定義家具", type: 'sprite', size: [parseInt(dims.ew) || 1, parseInt(dims.ns) || 1], spriteImages: finalImages }; onSave(newFurniture); onClose(); };
    const tileWidth = 80; const tileHeight = 46; const cx = 2; const cy = 2; const toIsoPreview = (x, y) => { const ox = x - cx; const oy = y - cy; const angle = (rotation * 90) * (Math.PI / 180); const rx = ox * Math.cos(angle) - oy * Math.sin(angle); const ry = ox * Math.sin(angle) + oy * Math.cos(angle); return { x: (rx - ry) * (tileWidth / 2) + 256, y: (rx + ry) * (tileHeight / 2) + 300 }; };
    return ( <div className="h-full flex gap-4 p-2 overflow-hidden"> <div className="flex-1 flex flex-col gap-4 overflow-y-auto"> <div className="flex gap-4 h-[350px]"> <div className="w-1/2 grid grid-cols-2 gap-2"> {['南方 (正面)', '西方 (左側)', '北方 (背面)', '東方 (右側)'].map((label, idx) => ( <div key={idx} className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center relative bg-gray-50 hover:bg-white transition-colors group"> {images[idx] ? ( <img src={images[idx]} alt={label} className="w-full h-full object-contain p-2" /> ) : ( <div className="text-gray-400 flex flex-col items-center"> <Upload size={24} className="mb-2"/> <span className="text-xs">{label}</span> </div> )} <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(idx, e)} /> {images[idx] && <div className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">{label}</div>} </div> ))} </div> <div className="w-1/2 bg-slate-100 rounded-xl border border-slate-200 relative flex flex-col items-center justify-center overflow-hidden"> <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div> <div className="relative z-10 transition-all duration-300" style={{ transform: 'scale(1.5)' }}> {images[rotation] ? ( <img src={images[rotation]} alt="Preview" className="max-w-[150px] max-h-[150px] drop-shadow-xl" /> ) : ( <div className="text-gray-400 text-xs">暫無預覽圖片</div> )} <div className="mt-4 bg-black/10 px-3 py-1 rounded-full text-xs font-mono text-gray-600 text-center"> 面向: {['南', '西', '北', '東'][rotation]} </div> </div> <div className="absolute bottom-4 flex gap-2"> <Button variant="ghost" onClick={() => setRotation((r) => (r - 1 + 4) % 4)}><RotateCcw size={16} className="scale-x-[-1]"/></Button> <Button variant="ghost" onClick={() => setRotation((r) => (r + 1) % 4)}><RotateCcw size={16}/></Button> </div> </div> </div> <div className="grid grid-cols-2 gap-4"> <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3"> <h3 className="font-bold text-slate-700 flex items-center gap-2"><Settings size={16}/> 規格設定</h3> <div className="flex items-center gap-2"> <label className="text-xs font-bold text-slate-500 w-16">佔地格數</label> <input type="number" min="1" max="5" value={dims.ns} onChange={e => setDims({...dims, ns: e.target.value})} className="w-16 border rounded p-1 text-center text-sm"/> <span className="text-slate-400">x</span> <input type="number" min="1" max="5" value={dims.ew} onChange={e => setDims({...dims, ew: e.target.value})} className="w-16 border rounded p-1 text-center text-sm"/> <span className="text-xs text-slate-400 ml-2">(南北 x 東西)</span> </div> </div> <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3"> <h3 className="font-bold text-slate-700 flex items-center gap-2"><Wand2 size={16}/> AI 修正 (模擬)</h3> <div className="flex gap-2"> <input type="text" placeholder="例如: 去背, 調亮, 風格化..." value={correctionPrompt} onChange={e => setCorrectionPrompt(e.target.value)} className="flex-1 border rounded p-2 text-xs" /> <Button variant="primary" className="px-3 py-1 text-xs" onClick={handleAICorrection} disabled={isAIProcessing}> {isAIProcessing ? <Loader2 className="animate-spin" size={14}/> : "修正"} </Button> </div> {aiMessage && <div className="text-xs text-emerald-600 font-bold">{aiMessage}</div>} </div> </div> <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4"> <div className="flex gap-4"> <div className="flex-1"> <label className="text-xs font-bold text-slate-500 block mb-1">家具名稱</label> <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="給家具取個名字..." className="w-full border rounded p-2 text-sm"/> </div> <div className="w-1/3"> <label className="text-xs font-bold text-slate-500 block mb-1">定價 (參考: ${refPrice})</label> <div className="relative"> <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/> <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border rounded p-2 pl-6 text-sm"/> </div> </div> </div> <div className="pt-2 border-t border-gray-100 flex justify-end gap-2"> <Button variant="ghost" onClick={onClose}>取消</Button> <Button variant="primary" onClick={handleSave} icon={Package}>上架家具</Button> </div> </div> </div> <div className="w-48 bg-slate-50 border-l p-4 flex flex-col gap-2 overflow-y-auto shrink-0"> <h4 className="font-bold text-xs text-slate-500 uppercase flex items-center gap-1"><History size={12}/> 版本歷史</h4> {history.map((h, i) => ( <div key={h.id} onClick={() => restoreVersion(h)} className="p-3 bg-white border rounded-xl cursor-pointer hover:border-indigo-400 text-xs shadow-sm active:scale-95 transition-all group"> <div className="font-bold text-indigo-600 mb-1">{h.name}</div> <div className="grid grid-cols-2 gap-0.5 opacity-50 group-hover:opacity-100"> {h.images.slice(0,4).map((img, idx) => ( <div key={idx} className="w-full h-8 bg-slate-100 rounded overflow-hidden"> {img && <img src={img} className="w-full h-full object-cover" style={{filter: h.filter}}/>} </div> ))} </div> </div> ))} </div> </div> );
};

const ShopView = ({ coins, inventory, houseLevel, onBuy, onUpgrade, onClose, isAdmin }) => {
  const nextHouse = HOUSE_LEVELS[houseLevel + 1];
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-scale-up border-4 border-white">
        <div className="p-5 border-b flex justify-between items-center bg-indigo-50">
          <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><ShoppingBag className="text-indigo-600"/> 懷舊家具行</h2>
          <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full text-amber-800 font-bold text-sm shadow-sm">
            {isAdmin && <ShieldCheck size={14} className="text-emerald-600"/>}<Coins size={14} /> {isAdmin ? "♾️" : coins}
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div className="mb-6 bg-slate-50 p-4 rounded-xl text-sm text-slate-500 border border-slate-100">歡迎光臨！購買後的家具會送到左側的 <span className="font-bold text-indigo-600">「我的家具」</span>，請拖曳佈置。</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FURNITURE_CATALOG.map(item => {
              const isOwned = inventory.includes(item.id);
              const canAfford = isAdmin || coins >= item.cost;
              const isSlotAvailable = true; 
              return (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all flex items-center justify-between group bg-white">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isOwned ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'} transition-colors`}><item.icon size={22} /></div>
                    <div><div className="font-bold text-slate-700">{item.name}</div><div className="text-xs text-slate-400">{item.desc}</div></div>
                  </div>
                  {isOwned ? (<div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full"><Check size={14}/> 已擁有</div>) : (
                    <Button onClick={() => onBuy(item)} disabled={!canAfford} className="px-4 py-2 text-xs rounded-full shadow-md" variant="primary">
                      {item.cost === 0 ? "免費領取" : `$${item.cost} 購買`}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-end"><Button variant="ghost" onClick={onClose} className="text-slate-500">離開商店</Button></div>
      </div>
    </div>
  );
};

const EncodingView = ({ items, loci, associations, onAssociate, onNext }) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const unplaced = items.filter(i => !Object.values(associations).includes(i));
    return (
      <div className="animate-fade-in max-w-4xl mx-auto p-4 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">建立記憶連結</h2>
          <p className="text-slate-500">將下方的物品放入房間的記憶點中</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-32">
          {loci.map(loc => {
            const Icon = loc.icon;
            const assigned = associations[loc.id];
            return (
              <div key={loc.id} onClick={() => selectedItem && onAssociate(loc.id, selectedItem)} className={`relative p-4 rounded-3xl border-2 transition-all cursor-pointer min-h-[160px] flex flex-col items-center justify-center text-center gap-3 bg-white shadow-sm ${assigned ? 'border-indigo-300 bg-indigo-50/50' : 'border-dashed border-slate-200 hover:border-indigo-200 hover:bg-slate-50'}`}>
                <div className={`p-4 rounded-2xl ${loc.isFurniture ? 'bg-indigo-100 text-indigo-500' : 'bg-slate-100 text-slate-300'}`}><Icon size={28} /></div>
                <div><div className="text-sm font-bold text-slate-600">{loc.name}</div>{assigned && (<div className="mt-2 bg-indigo-500 text-white text-sm py-1.5 px-4 rounded-full font-bold shadow-md animate-pop">{assigned}</div>)}</div>
              </div>
            );
          })}
        </div>
        <div className="fixed bottom-0 left-0 md:left-20 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-6 shadow-2xl z-20 rounded-t-3xl">
          <div className="max-w-4xl mx-auto">
            {unplaced.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-3">
                {unplaced.map(item => (
                  <button key={item} onClick={() => setSelectedItem(selectedItem === item ? null : item)} className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all shadow-sm ${selectedItem === item ? 'bg-indigo-500 text-white border-indigo-500 scale-110 shadow-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>{item}</button>
                ))}
              </div>
            ) : (<div className="flex justify-center"><Button onClick={onNext} className="w-full md:w-auto px-12 py-3 rounded-full text-lg shadow-indigo-200" icon={ArrowRight}>進入回憶測驗</Button></div>)}
          </div>
        </div>
      </div>
    );
};

const RecallView = ({ items, loci, associations, onFinish }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const loc = loci[currentIdx];
    const handleAnswer = (item) => {
      setAnswers(prev => ({...prev, [loc.id]: item}));
      if (currentIdx < items.length - 1) setTimeout(() => setCurrentIdx(c => c + 1), 300);
    };
    return (
      <div className="animate-fade-in max-w-2xl mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="w-full mb-8">
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"><span>Location</span><span>{currentIdx + 1} / {items.length}</span></div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className="bg-amber-400 h-full transition-all duration-500 ease-out rounded-full" style={{width: `${(currentIdx+1)/items.length*100}%`}}/></div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100 text-center mb-8 w-full relative overflow-hidden">
          <div className="mb-6 inline-block p-5 bg-amber-50 rounded-full text-amber-500"><loc.icon size={48} /></div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">{loc.name}</h3>
          <p className="text-slate-400 mb-8">{loc.description}</p>
          <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 min-h-[70px] flex items-center justify-center">{answers[loc.id] ? (<span className="text-xl font-bold text-indigo-600 animate-pop">{answers[loc.id]}</span>) : (<span className="text-slate-400 italic">這裡放了什麼？</span>)}</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
          {items.map(item => {
            const isSelected = answers[loc.id] === item;
            const isUsed = Object.values(answers).includes(item) && !isSelected;
            return (
              <button key={item} onClick={() => handleAnswer(item)} disabled={isUsed} className={`p-3 text-sm rounded-xl font-medium border-2 transition-all duration-200 ${isSelected ? 'bg-amber-400 text-white border-amber-400 shadow-md transform scale-105' : isUsed ? 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed' : 'bg-white text-slate-600 border-slate-100 hover:border-amber-200 hover:bg-amber-50'}`}>{item}</button>
            )
          })}
        </div>
        <div className="mt-10 flex gap-4 w-full">
          <Button variant="secondary" disabled={currentIdx === 0} onClick={() => setCurrentIdx(c => c - 1)} className="flex-1 rounded-2xl" icon={ChevronLeft}>上一個</Button>
          {currentIdx === items.length - 1 ? (<Button variant="success" disabled={!answers[loc.id]} onClick={() => onFinish(answers)} className="flex-1 rounded-2xl" icon={CheckCircle}>完成交卷</Button>) : (<Button variant="primary" disabled={!answers[loc.id]} onClick={() => setCurrentIdx(c => c + 1)} className="flex-1 rounded-2xl">下一個 <ChevronRight size={18} /></Button>)}
        </div>
      </div>
    );
};

const ResultView = ({ score, total, coinsEarned, onConfirm }) => (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <div className="relative mb-8 transform hover:scale-110 transition-transform duration-500">
        <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30 rounded-full" />
        <Trophy size={100} className="text-yellow-400 relative z-10 drop-shadow-sm" />
        <div className="absolute -right-4 -top-4 bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-xl animate-bounce text-lg">+{coinsEarned}</div>
      </div>
      <h2 className="text-4xl font-extrabold text-slate-800 mb-3">訓練完成！</h2>
      <p className="text-slate-500 mb-10 text-lg">你的記憶準確率：<span className="font-bold text-indigo-500 text-2xl ml-2">{score} / {total}</span></p>
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl w-full max-w-sm mb-10">
        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Reward</div>
        <div className="text-5xl font-mono font-bold text-yellow-500 flex items-center justify-center gap-3"><Coins size={40} /> {coinsEarned}</div>
      </div>
      <Button onClick={onConfirm} className="w-full max-w-sm py-4 text-lg shadow-xl shadow-indigo-100 rounded-2xl">返回首頁</Button>
    </div>
);

// ==========================================
// 6. 主程式入口 (MAIN APP)
// ==========================================

export default function MemoryPalaceTycoon() {
  const { 
    coins, setCoins, houseLevel, upgradeHouse, 
    inventory, buyItem, addPlacement, updatePlacement, removePlacement, placements,
    currentLoci, isAdmin, fullCatalog, fullModels, addNewFurniture,
    history, restoreHistory,
    user, signIn, signUp, signOut, uploadFurnitureImage, isCloudLoading
  } = useGameProgress();

  const [phase, setPhase] = useState('intro');
  const [showShop, setShowShop] = useState(false);
  const [showUploader, setShowUploader] = useState(false); 
  const [showStudio, setShowStudio] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Dragging & Interaction State
  const [draggingItem, setDraggingItem] = useState(null);
  const [draggingRotation, setDraggingRotation] = useState(0);
  const [movingPlacementId, setMovingPlacementId] = useState(null);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [removalSelectedId, setRemovalSelectedId] = useState(null);
  
  // Game Session
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

  const handleCommitPlacement = (itemId, x, y, rotation) => {
     if (movingPlacementId) { updatePlacement(movingPlacementId, x, y, rotation); setMovingPlacementId(null); }
     else { addPlacement(itemId, x, y, rotation); }
     setDraggingItem(null);
  };
  
  // ... (Other handlers like startSession, handleFinishRecall same as before) ...
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

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans text-slate-800 selection:bg-indigo-100">
      <Sidebar 
        isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} coins={coins} currentPhase={phase}
        onStart={startSession} onShop={() => setShowShop(true)} isAdmin={isAdmin} inventory={inventory}
        onDragStart={(item) => { if (phase !== 'intro') return; setDraggingItem(item); setDraggingRotation(0); setMovingPlacementId(null); }}
        isRemoveMode={isRemoveMode} toggleRemoveMode={()=>{setIsRemoveMode(!isRemoveMode); setRemovalSelectedId(null);}}
        confirmRemove={()=>{if(removalSelectedId){removePlacement(removalSelectedId); setRemovalSelectedId(null);}}} 
        cancelRemove={()=>{setRemovalSelectedId(null);}} 
        hasSelection={!!removalSelectedId}
        onOpenUploader={() => { setPhase('intro'); setShowUploader(true); }}
        onOpenStudio={() => { setPhase('intro'); setShowStudio(true); }}
        globalHistory={history} onRestoreHistory={restoreHistory} fullCatalog={fullCatalog}
        user={user} onLoginClick={()=>setShowAuth(true)} onLogoutClick={signOut}
      />
      
      <main className={`flex-1 transition-all duration-300 relative overflow-y-auto ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Loading Overlay */}
        {isCloudLoading && <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center"><Loader2 className="animate-spin" size={40}/></div>}

        {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onSignIn={(e,p)=>{signIn(e,p);setShowAuth(false);}} onSignUp={(e,p)=>{signUp(e,p);setShowAuth(false);}} />}
        
        {showUploader ? (
          <div className="h-full bg-white p-4">
             <div className="flex justify-between mb-4"><h2 className="text-xl font-bold">上傳中心</h2><Button variant="ghost" onClick={()=>setShowUploader(false)}><X/></Button></div>
             <FurnitureUploader onClose={()=>setShowUploader(false)} onSave={addNewFurniture} onUploadImage={uploadFurnitureImage}/>
          </div>
        ) : showStudio ? (
           <div className="h-full bg-white p-4">
             <div className="flex justify-between mb-4"><h2 className="text-xl font-bold">設計室</h2><Button variant="ghost" onClick={()=>setShowStudio(false)}><X/></Button></div>
             <FurnitureStudio onClose={()=>setShowStudio(false)} onSave={addNewFurniture}/>
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
                    isRemoveMode={isRemoveMode} removalSelectedId={removalSelectedId} 
                    onFurnitureClick={(id)=>{if(isRemoveMode) setRemovalSelectedId(id===removalSelectedId?null:id);}}
                    onFurnitureMouseDown={(p)=>{
                         if (phase !== 'intro' || isRemoveMode) return;
                         const item = fullCatalog.find(f => f.id === p.furnitureId);
                         if (item) { setMovingPlacementId(p.id); setDraggingItem(item); setDraggingRotation(p.rotation); }
                    }} 
                    movingPlacementId={movingPlacementId} fullCatalog={fullCatalog} fullModels={fullModels}
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