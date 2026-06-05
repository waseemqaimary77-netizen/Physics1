import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCw, Maximize2, Move, ArrowRight, ArrowLeft, 
  Settings, Sliders, Check, Eye, Trash2, Plus, Link as LinkIcon, Image as ImageIcon, Sparkles, RefreshCw,
  BookOpen, GraduationCap, FileText
} from 'lucide-react';
import { BoardImage } from '../types';

interface WhiteboardViewerProps {
  images: BoardImage[];
  activeIdx: number;
  onSelectIndex: (idx: number) => void;
  onAddImage: (newImg: BoardImage) => void;
  onDeleteImage: (id: string) => void;
  activeSource: 'teacher' | 'notebook';
  onChangeSource: (source: 'teacher' | 'notebook') => void;
  teacherCount: number;
  notebookCount: number;
}

export function WhiteboardViewer({ 
  images, 
  activeIdx, 
  onSelectIndex, 
  onAddImage, 
  onDeleteImage,
  activeSource,
  onChangeSource,
  teacherCount,
  notebookCount
}: WhiteboardViewerProps) {
  
  const activeImage = images[activeIdx] || null;

  // Zoom & Pan states
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Filter enhancement states
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 185, 270
  const [brightness, setBrightness] = useState<number>(100); // 50% to 200%
  const [contrast, setContrast] = useState<number>(100); // 50% to 200%
  const [isInverted, setIsInverted] = useState<boolean>(false);

  // New Image addition states
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset zoom and filters whenever image changes
  useEffect(() => {
    handleResetTransform();
  }, [activeIdx]);

  const handleResetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.3, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.3, 1));
  };

  // Mouse drag for panning mechanism
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale <= 1) return; // Only pan when zoomed in
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const nextX = e.clientX - dragStart.current.x;
    const nextY = e.clientY - dragStart.current.y;
    
    // Boundary setting (restrict endless pulling out of container)
    const paddingVal = 300 * (scale - 1);
    const clampedX = Math.max(Math.min(nextX, paddingVal), -paddingVal);
    const clampedY = Math.max(Math.min(nextY, paddingVal), -paddingVal);

    setPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile panning support
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStart.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const nextX = touch.clientX - dragStart.current.x;
      const nextY = touch.clientY - dragStart.current.y;
      
      const paddingVal = 300 * (scale - 1);
      const clampedX = Math.max(Math.min(nextX, paddingVal), -paddingVal);
      const clampedY = Math.max(Math.min(nextY, paddingVal), -paddingVal);
      
      setPosition({ x: clampedX, y: clampedY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Double Click Zoom shortcut
  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  // Rotate handler
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        const nextIdx = (activeIdx + 1) % images.length;
        onSelectIndex(nextIdx);
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = activeIdx === 0 ? images.length - 1 : activeIdx - 1;
        onSelectIndex(prevIdx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, images.length]);

  // Handle local File Upload convertion to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('يرجى تحميل ملف صورة صالح فقط.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setNewUrl(base64Url);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, "")); // Set name without extension as default title
      }
      setUploadError('');
    };
    reader.readAsDataURL(file);
  };

  // Submit adding new image
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) {
      setUploadError('يرجى توفير رابط الصورة أو تحميل ملف صوري أولاً.');
      return;
    }

    const finalTitle = newTitle.trim() || `لوح إضافي للمذاكرة #${images.length + 1}`;
    const newImage: BoardImage = {
      id: `board_${Date.now()}`,
      url: newUrl,
      title: finalTitle,
      description: newDesc.trim() || 'صورة لوح إيضاحية مضافة من قبل الطالب للمراجعة والتحضير الملخص.',
      isUserAdded: true,
      category: 'مضاف من الطالب'
    };

    onAddImage(newImage);
    
    // Clear fields
    setNewTitle('');
    setNewUrl('');
    setNewDesc('');
    setShowAddForm(false);
    setUploadError('');
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col h-full" id="whiteboard-card">
      
      {/* Title block with helper icons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              {activeSource === 'teacher' ? 'ألوح الشرح والتلخيص للمعلم' : 'دفتر الطالب عدنان مجاهد'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {activeSource === 'teacher' 
              ? 'تصفح صور اللوح بوضوح واعتمد على فلاتر التقريب وتوضيح الكتابة'
              : 'استعرض وحمل صفحات تلخيص كيمياء التوجيهي كراسة الطالب عدنان مجاهد'}
          </p>
        </div>
      </div>

      {/* Dynamic Tabs: Teacher boards vs Student Notebook */}
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 gap-1" id="whiteboard-tabs-switch">
        <button
          onClick={() => onChangeSource('teacher')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-black rounded-xl transition cursor-pointer ${
            activeSource === 'teacher'
              ? 'bg-white text-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <ImageIcon className="w-4 h-4 shrink-0" />
          <span>👨‍🏫 لوحات الشرح للمعلم</span>
          <span className="text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded-md font-mono">
            {teacherCount}
          </span>
        </button>
        <button
          onClick={() => onChangeSource('notebook')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-black rounded-xl transition cursor-pointer ${
            activeSource === 'notebook'
              ? 'bg-white text-emerald-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>📝 دفتر الطالب عدنان مجاهد</span>
          <span className="text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded-md font-mono">
            {notebookCount}
          </span>
        </button>
      </div>

      {/* Main Image Container */}
      {activeImage ? (
        <div className="relative flex-1 flex flex-col min-h-0">
          
          {/* Active Image Metadata Details overlay */}
          <div className="bg-slate-900/90 text-white rounded-2xl p-3 px-4 mb-3 flex items-start justify-between gap-4 select-none">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span>الدرس {activeIdx + 1} من {images.length}</span>
                {activeImage.category && (
                  <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.5 rounded-sm text-[10px]">
                    {activeImage.category}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm mt-0.5">{activeImage.title}</h3>
              <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">{activeImage.description}</p>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="flex-1 bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800" id="canvas-viewer-wrapper">
            
            {/* Viewboard Screen with Interactive Multipliers */}
            <div 
              ref={imageContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
              className={`w-full h-full flex items-center justify-center relative select-none ${
                scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
              }`}
              style={{ minHeight: '380px' }}
            >
              <img 
                key={activeImage.id}
                src={activeImage.url} 
                alt={activeImage.title} 
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain pointer-events-none transition-all duration-100 ease-out shadow-lg"
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px) rotate(${rotation}deg)`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1) hue-rotate(180deg)' : ''}`,
                }}
              />

              {/* Status Indicator Overlays */}
              {scale > 1 && (
                <span className="absolute bottom-4 left-4 bg-slate-900/80 text-white font-mono text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-slate-700">
                  <Move className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تقريب: {scale.toFixed(1)}x (اضغط واسحب اللوح للتحكم)</span>
                </span>
              )}
            </div>

          </div>

          {/* Navigation Buttons Row - ORDERED NEATLY BELOW THE CANVAS */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 mt-3 flex items-center justify-between shadow-md" id="whiteboard-navigation-under">
            {/* Right Button (Advance Forward) */}
            <button 
              onClick={() => onSelectIndex((activeIdx + 1) % images.length)}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-400/20"
              title="الذهاب للوح التالي"
            >
              <span>التقديم للأمام (اللوح التالي)</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>

            {/* Current Status Badge */}
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-normal">اللوحة الدراسية المعروضة</span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {activeIdx + 1} / {images.length}
              </span>
            </div>

            {/* Left Button (Go Backward) */}
            <button 
              onClick={() => onSelectIndex(activeIdx === 0 ? images.length - 1 : activeIdx - 1)}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl transition duration-150 flex items-center gap-2 cursor-pointer"
              title="الرجوع للوح السابق"
            >
              <ArrowLeft className="w-5 h-5 shrink-0" />
              <span>الرجوع للخلف (اللوح السابق)</span>
            </button>
          </div>

          {/* Unified Tool and Filter Panel under the image */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-3 space-y-4 select-none" id="enhance-control-panel">
            
            {/* Row 1: Direct Zoom, Rotate & Reset commands */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/50 pb-3">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                <Settings className="w-4 h-4 text-emerald-600" />
                <span>أدوات تقريب وتدوير الصورة:</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Zoom In */}
                <button 
                  onClick={handleZoomIn}
                  className="flex items-center gap-1 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                  title="تقريب (Zoom In)"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تكبير الصورة</span>
                </button>

                {/* Zoom Out */}
                <button 
                  onClick={handleZoomOut}
                  disabled={scale <= 1}
                  className="flex items-center gap-1 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-50 disabled:hover:text-slate-400 disabled:hover:border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                  title="تصغير (Zoom Out)"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تصغير الصورة</span>
                </button>

                {/* Rotate */}
                <button 
                  onClick={handleRotate}
                  className="flex items-center gap-1 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                  title="تدوير 90 درجة"
                >
                  <RotateCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تدوير 90°</span>
                </button>

                {/* Reset */}
                <button 
                  onClick={handleResetTransform}
                  className="flex items-center gap-1 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                  title="إعادة ضبط الصورة بالكامل"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>إعادة الضبط</span>
                </button>
              </div>
            </div>

            {/* Row 2: Contrast, Brightness and Night Mode */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>فلاتر السطوع وتحسين مظهر اللوح:</span>
              </div>

              <div className="flex flex-wrap items-center gap-5 sm:gap-6 flex-1 justify-end w-full">
                {/* Brightness bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">السطوع</span>
                  <input 
                    type="range" 
                    min="50" 
                    max="180" 
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-20 md:w-24 accent-emerald-500 h-1 bg-slate-200 rounded-full cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 font-mono w-6 text-left">{brightness}%</span>
                </div>

                {/* Contrast bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">التباين</span>
                  <input 
                    type="range" 
                    min="60" 
                    max="200" 
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-20 md:w-24 accent-emerald-500 h-1 bg-slate-200 rounded-full cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 font-mono w-6 text-left">{contrast}%</span>
                </div>

                {/* Color Inversion (Whiteboard to Smartboard) */}
                <button 
                  onClick={() => setIsInverted(!isInverted)}
                  className={`py-1.5 px-3 text-xs font-bold rounded-xl transition duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isInverted 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                  title="يقلب الخلفية البيضاء إلى سوداء والكتابة إلى ألوان مريحة للعين في الليل"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isInverted ? 'إلغاء وضع اللوح الليلي' : 'وضع اللوح الليلي 🌙'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Lower Image Gallery Ribbon Selector */}
          <div className="mt-4">
            <span className="block text-right text-xs font-bold text-slate-500 mb-1.5 px-1">قائمة جميع الواجهات الدراسية المتوفرة:</span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200" id="thumbnail-ribbon">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => onSelectIndex(idx)}
                  className={`flex-none w-20 h-14 rounded-xl overflow-hidden relative bg-slate-900 border-2 transition duration-200 ${
                    idx === activeIdx 
                    ? 'border-emerald-500 scale-95 shadow-sm shadow-emerald-200' 
                    : 'border-transparent opacity-65 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/20" />
                  <span className="absolute bottom-0 right-0 left-0 bg-slate-950/70 text-white font-bold text-[9px] text-center p-0.5 truncate leading-tight">
                    لوح {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl" id="no-whiteboards-deck">
          <ImageIcon className="w-12 h-12 text-slate-300" />
          <h3 className="font-bold text-slate-700 mt-3 text-base">لا تتوفر صور لوح شرح حالياً</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
            إما بسبب قيود الاتصال بالمنطقة، أو لأنك لم تقم بإضافة لوح مخصص بعد. انقر على زر "إضافة لوح مخصص" بالأعلى لرفع وحفظ لوح الشرح الخاص بك!
          </p>
        </div>
      )}

    </div>
  );
}
