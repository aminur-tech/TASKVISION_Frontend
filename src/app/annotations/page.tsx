'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  ChevronLeft, ChevronRight, Scissors, ZoomIn, ZoomOut, 
  Maximize2, Undo2, RotateCw, X, Check, Upload, Trash2, Loader2
} from 'lucide-react';
import api from '@/libs/Api';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  id: string;
  databaseId?: number;
  points: Point[];
  label: string;
}

interface DBImage {
  id: number;
  image: string;
  uploaded_at: string;
  polygons: Array<{
    id: number;
    points: Point[];
    label: string;
    image: number;
  }>;
}

export default function AdvancedAnnotationWorkspace() {
  const [images, setImages] = useState<DBImage[]>([]);
  
  const [leftIndex, setLeftIndex] = useState<number>(23);
  const [rightIndex, setRightIndex] = useState<number>(0);

  const [selectedClassLeft, setSelectedClassLeft] = useState<string>('Tumor');
  const [hideAnnotationsLeft, setHideAnnotationsLeft] = useState<boolean>(false);
  const [applyCTLeft, setApplyCTLeft] = useState<boolean>(false);

  const [selectedClassRight, setSelectedClassRight] = useState<string>('Tumor');
  const [hideAnnotationsRight, setHideAnnotationsRight] = useState<boolean>(false);
  const [applyCTRight, setApplyCTRight] = useState<boolean>(false);

  const [zoomLeft, setZoomLeft] = useState<number>(1);
  const [isSegmentingLeft, setIsSegmentingLeft] = useState<boolean>(false);
  const [clickToZoomLeft, setClickToZoomLeft] = useState<boolean>(true);
  
  const [zoomRight, setZoomRight] = useState<number>(1);
  const [isSegmentingRight, setIsSegmentingRight] = useState<boolean>(false);
  const [clickToZoomRight, setClickToZoomRight] = useState<boolean>(true);

  const [polygonsLeft, setPolygonsLeft] = useState<Polygon[]>([]);
  const [currentPointsLeft, setCurrentPointsLeft] = useState<Point[]>([]);
  const svgLeftRef = useRef<SVGSVGElement | null>(null);

  const [polygonsRight, setPolygonsRight] = useState<Polygon[]>([]);
  const [currentPointsRight, setCurrentPointsRight] = useState<Point[]>([]);
  const svgRightRef = useRef<SVGSVGElement | null>(null);
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const selectionRef = useRef({ leftIndex, rightIndex });

  const mapPolygonsFromImage = useCallback((image?: DBImage): Polygon[] => {
    if (!image) return [];
    return image.polygons.map((p) => ({
      id: p.id.toString(),
      databaseId: p.id,
      points: p.points,
      label: p.label
    }));
  }, []);

  const fetchWorkspaceData = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        const mockImages: DBImage[] = Array.from({ length: 75 }, (_, i) => ({
          id: i + 1,
          image: '/api/placeholder/600/400',
          uploaded_at: new Date().toISOString(),
          polygons: []
        }));
        setImages(mockImages);
        return;
      }

      const res = await api.get<DBImage[]>('/api/annotations/images/');
      const data = res.data;
      
      const { leftIndex: currentLeftIndex, rightIndex: currentRightIndex } = selectionRef.current;
      
      const nextLeftIndex = data.length > 0 ? Math.min(currentLeftIndex, data.length - 1) : 0;
      const nextRightIndex = data.length > 0 ? Math.min(currentRightIndex, data.length - 1) : 0;

      setImages(data);
      setLeftIndex(nextLeftIndex);
      setRightIndex(nextRightIndex);
      setPolygonsLeft(mapPolygonsFromImage(data[nextLeftIndex]));
      setPolygonsRight(mapPolygonsFromImage(data[nextRightIndex]));
    } catch (err) {
      let errorMessage = "Data syncing link offline.";
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = Object.values(err.response.data).flat().join(' ');
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      console.error(errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  }, [mapPolygonsFromImage]);

  useEffect(() => {
    selectionRef.current = { leftIndex, rightIndex };
  }, [leftIndex, rightIndex]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchWorkspaceData(true);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchWorkspaceData]);

  const selectLeftImage = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= images.length) return;
    setLeftIndex(nextIndex);
    setCurrentPointsLeft([]);
    setPolygonsLeft(mapPolygonsFromImage(images[nextIndex]));
  };

  const selectRightImage = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= images.length) return;
    setRightIndex(nextIndex);
    setCurrentPointsRight([]);
    setPolygonsRight(mapPolygonsFromImage(images[nextIndex]));
  };

  const uploadFilesPipeline = async (files: FileList) => {
    const token = Cookies.get('token');
    if (!token) return;
    
    setIsLoading(true);
    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith('image/')) continue;
      
      const formData = new FormData();
      formData.append('image', files[i]);
      try {
        await api.post('/api/annotations/images/', formData);
      } catch (err) {
        let errorMessage = "Error uploading image.";
        if (axios.isAxiosError(err) && err.response?.data) {
          errorMessage = Object.values(err.response.data).flat().join(' ');
        }
        console.error(errorMessage, err);
      }
    }
    await fetchWorkspaceData(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    await uploadFilesPipeline(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFilesPipeline(e.dataTransfer.files);
    }
  };

  const handleDeleteImage = async (viewport: 'left' | 'right') => {
    const activeIndex = viewport === 'left' ? leftIndex : rightIndex;
    const targetImage = images[activeIndex];
    if (!targetImage || !confirm(`Are you sure you want to permanently delete image ID ${targetImage.id}?`)) return;

    const token = Cookies.get('token');
    if (!token) return;

    setIsLoading(true);
    try {
      await api.delete(`/api/annotations/images/${targetImage.id}/`);
      await fetchWorkspaceData(false);
    } catch (err) {
      let errorMessage = "Error deleting image.";
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = Object.values(err.response.data).flat().join(' ');
      }
      console.error(errorMessage, err);
      setIsLoading(false);
    }
  };

  const handleDeletePolygon = async (polyId?: string, target?: 'left' | 'right') => {
    const activeTarget = target ?? 'left';
    const currentPolygons = activeTarget === 'left' ? polygonsLeft : polygonsRight;
    const resolvedPolyId = polyId ?? currentPolygons[currentPolygons.length - 1]?.id;

    if (!resolvedPolyId) return;
    if (!confirm("Are you sure you want to delete this specific polygon?")) return;

    if (activeTarget === 'left') {
      setPolygonsLeft(prev => prev.filter(p => p.id !== resolvedPolyId));
    } else {
      setPolygonsRight(prev => prev.filter(p => p.id !== resolvedPolyId));
    }

    const token = Cookies.get('token');
    if (!token) return;

    setIsLoading(true);
    try {
      await api.delete(`/api/annotations/polygons/${resolvedPolyId}/`);
      await fetchWorkspaceData(false);
    } catch (err) {
      let errorMessage = "Error deleting polygon.";
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = Object.values(err.response.data).flat().join(' ');
      }
      console.error(errorMessage, err);
      setIsLoading(false);
    }
  };

  const handleCanvasTouchOrClick = (
    clientX: number,
    clientY: number,
    ref: React.RefObject<SVGSVGElement | null>, 
    setPoints: React.Dispatch<React.SetStateAction<Point[]>>,
    segmentingMode: boolean
  ) => {
    if (!ref.current || !segmentingMode || isLoading) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setPoints(prev => [...prev, { x, y }]);
  };

  const handleImageZoom = (target: 'left' | 'right') => {
    if (target === 'left') {
      setZoomLeft(prev => Math.min(prev + 0.25, 4));
    } else {
      setZoomRight(prev => Math.min(prev + 0.25, 4));
    }
  };

  const saveCurrentShape = async (target: 'left' | 'right') => {
    const token = Cookies.get('token');
    const isLeft = target === 'left';
    const points = isLeft ? currentPointsLeft : currentPointsRight;
    const label = isLeft ? selectedClassLeft : selectedClassRight;
    const currentImg = isLeft ? images[leftIndex] : images[rightIndex];

    if (points.length < 3 || !currentImg) return;

    const localFallbackId = Date.now().toString();
    const tentativePoly: Polygon = { id: localFallbackId, points, label };
    
    if (isLeft) {
      setPolygonsLeft(prev => [...prev, tentativePoly]);
      setCurrentPointsLeft([]);
    } else {
      setPolygonsRight(prev => [...prev, tentativePoly]);
      setCurrentPointsRight([]);
    }

    if (!token) return;

    setIsLoading(true);
    try {
      await api.post('/api/annotations/polygons/', { image: currentImg.id, points, label });
      await fetchWorkspaceData(false);
    } catch (err) {
      let errorMessage = "Error saving polygon.";
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = Object.values(err.response.data).flat().join(' ');
      }
      console.error(errorMessage, err);
      setIsLoading(false);
    }
  };

  return (
    <main 
      className="min-h-screen bg-slate-950 p-3 sm:p-6 md:p-12 lg:p-16 font-sans text-slate-100 relative selection:bg-indigo-500/30"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Bar Header */}
      <div 
        className={`mx-auto max-w-[1200px] mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 border transition-colors rounded-xl p-4 ${
          isDragging ? 'border-indigo-500 bg-slate-900/100' : 'border-white/10'
        }`}
      >
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">Advanced Segment Analytics Matrix</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isDragging ? "Drop images anywhere to auto-upload..." : "Synchronized structural medical visualization engine"}
          </p>
        </div>
        <label className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white transition px-4 py-2 sm:py-1.5 rounded-lg cursor-pointer text-xs font-semibold shadow-sm select-none">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} 
          <span>Upload Image Batch</span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isLoading} />
        </label>
      </div>

      {/* Main Viewport Workspace Grid */}
      <div className={`mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-200 rounded-xl relative ${
        isDragging ? 'outline-2 outline-dashed outline-indigo-500/60 outline-offset-4' : ''
      }`}>
        
        {/* Global Loader Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-50 rounded-xl flex flex-col items-center justify-center gap-2 border border-slate-800">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="text-xs font-medium tracking-wide text-slate-300">Syncing Matrix Core Layer...</span>
          </div>
        )}

        {/* ================= LEFT VIEWPORT (AXIAL) ================= */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col overflow-hidden">
          {/* Controls Bar Header */}
          <div className="flex flex-col gap-3 bg-slate-900/50 p-2.5 border border-slate-800/80 rounded-lg mb-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button disabled={isLoading} onClick={() => selectLeftImage(leftIndex - 1)} className="p-2 sm:p-1.5 rounded bg-indigo-600 active:bg-indigo-700 text-white disabled:opacity-50 touch-manipulation"><ChevronLeft className="h-4 w-4" /></button>
                <span className="font-bold text-slate-200 min-w-[90px] text-center text-xs">Axial ({images.length > 0 ? leftIndex + 1 : 0}/{images.length})</span>
                <button disabled={isLoading} onClick={() => selectLeftImage(leftIndex + 1)} className="p-2 sm:p-1.5 rounded bg-indigo-600 active:bg-indigo-700 text-white disabled:opacity-50 touch-manipulation"><ChevronRight className="h-4 w-4" /></button>
              </div>
              {images[leftIndex] && (
                <button disabled={isLoading} onClick={() => handleDeleteImage('left')} className="p-2 sm:p-1.5 rounded bg-red-950/60 border border-red-800/60 text-red-400 active:bg-red-900/40 disabled:opacity-50 touch-manipulation"><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <select disabled={isLoading} value={selectedClassLeft} onChange={(e) => setSelectedClassLeft(e.target.value)} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500 flex-1 sm:flex-initial min-w-[100px]">
                <option value="Tumor">Tumor</option>
                <option value="Node">Lymph Node</option>
              </select>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer select-none py-1"><input type="checkbox" checked={hideAnnotationsLeft} onChange={(e) => setHideAnnotationsLeft(e.target.checked)} className="rounded border-slate-700 text-indigo-600 w-4 h-4 accent-indigo-600 focus:ring-0 focus:ring-offset-0" /><span className="text-[11px] sm:text-xs">Hide</span></label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none py-1"><input type="checkbox" checked={applyCTLeft} onChange={(e) => setApplyCTLeft(e.target.checked)} className="rounded border-slate-700 text-indigo-600 w-4 h-4 accent-indigo-600 focus:ring-0 focus:ring-offset-0" /><span className="text-[11px] sm:text-xs">CT Window</span></label>
              </div>
            </div>
          </div>

          {/* Interactive Canvas Container */}
          <div className="relative aspect-square w-full bg-black rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center touch-none">
            <div
              className="relative w-full h-full transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${zoomLeft})` }}
              onClick={() => {
                if (!isSegmentingLeft && clickToZoomLeft) handleImageZoom('left');
              }}
            >
              {images[leftIndex]?.image ? (
                <img src={images[leftIndex].image} alt="Axial View" className={`w-full h-full object-contain pointer-events-none select-none ${applyCTLeft ? 'brightness-125 contrast-150 grayscale' : ''}`} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">No Image Loaded</div>
              )}
              
              <svg 
                ref={svgLeftRef} 
                onClick={(e) => handleCanvasTouchOrClick(e.clientX, e.clientY, svgLeftRef, setCurrentPointsLeft, isSegmentingLeft)}
                onTouchStart={(e) => {
                  if (isSegmentingLeft && e.touches.length === 1) {
                    handleCanvasTouchOrClick(e.touches[0].clientX, e.touches[0].clientY, svgLeftRef, setCurrentPointsLeft, isSegmentingLeft);
                  }
                }}
                className={`absolute inset-0 w-full h-full z-10 ${isSegmentingLeft ? 'cursor-crosshair' : 'cursor-default'}`} 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                {!hideAnnotationsLeft && polygonsLeft.map((poly) => (
                  <polygon key={poly.id} points={poly.points.map(p => `${p.x},${p.y}`).join(' ')} className="fill-red-500/20 stroke-red-600 stroke-[0.4]" />
                ))}
                {!hideAnnotationsLeft && currentPointsLeft.map((p, idx) => <circle key={idx} cx={p.x} cy={p.y} r="1.2" className="fill-red-600 stroke-white stroke-[0.2]" />)}
                {!hideAnnotationsLeft && currentPointsLeft.length > 1 && <polyline points={currentPointsLeft.map(p => `${p.x},${p.y}`).join(' ')} className="fill-none stroke-red-500 stroke-[0.3]" />}
              </svg>
            </div>
          </div>

          {/* Canvas Actions Toolbelt */}
          <div className="flex flex-col gap-2 mt-3 bg-slate-900/30 p-2 border border-slate-800/80 rounded-lg">
            
            <div className="flex flex-wrap items-center gap-1.5 w-full justify-between">
              <div className="flex flex-wrap items-center gap-1">
                <button disabled={isLoading} onClick={() => setIsSegmentingLeft(!isSegmentingLeft)} className={`p-2.5 rounded-lg active:scale-95 transition-transform ${isSegmentingLeft ? 'bg-red-600' : 'bg-indigo-600'} text-white touch-manipulation`} title="Toggle Segment Draw">
                  {isSegmentingLeft ? <X className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
                </button>
                <button onClick={() => setZoomLeft(1)} className="p-2.5 bg-indigo-600 active:bg-indigo-700 text-white rounded-lg active:scale-95 transition-transform touch-manipulation" title="Reset Zoom"><Maximize2 className="h-4 w-4" /></button>
                <button onClick={() => setCurrentPointsLeft(p => p.slice(0, -1))} className="p-2.5 bg-indigo-600 active:bg-indigo-700 text-white rounded-lg active:scale-95 transition-transform touch-manipulation" title="Undo Last Node Point"><Undo2 className="h-4 w-4" /></button>
                <button disabled={isLoading} onClick={() => handleDeletePolygon(undefined, 'left')} className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg active:scale-95 transition-transform touch-manipulation" title="Delete Last Polygon"><Trash2 className="h-4 w-4" /></button>
              </div>

              <button onClick={() => setClickToZoomLeft(prev => !prev)} className={`px-2.5 py-2 rounded-lg text-[10px] font-bold active:scale-95 transition-all select-none ${clickToZoomLeft ? 'bg-emerald-600/90 text-white' : 'bg-slate-800 text-slate-400'} touch-manipulation`}>
                Click Zoom {clickToZoomLeft ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 w-full">
              <div className="flex items-center gap-2 bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 flex-1 max-w-[220px]">
                <ZoomOut className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input type="range" min="1" max="4" step="0.1" value={zoomLeft} onChange={(e) => setZoomLeft(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                <ZoomIn className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] font-mono text-slate-400 w-8 text-right shrink-0">{Math.round(zoomLeft * 100)}%</span>
              </div>

              {currentPointsLeft.length >= 3 && (
                <button disabled={isLoading} onClick={() => saveCurrentShape('left')} className="px-3 py-1.5 bg-green-600 active:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform animate-pulse touch-manipulation"><Check className="h-3.5 w-3.5" /> Save</button>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT VIEWPORT (SAGITTAL) ================= */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col overflow-hidden">
          {/* Controls Bar Header */}
          <div className="flex flex-col gap-3 bg-slate-900/50 p-2.5 border border-slate-800/80 rounded-lg mb-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button disabled={isLoading} onClick={() => selectRightImage(rightIndex - 1)} className="p-2 sm:p-1.5 rounded bg-indigo-600 active:bg-indigo-700 text-white disabled:opacity-50 touch-manipulation"><ChevronLeft className="h-4 w-4" /></button>
                <span className="font-bold text-slate-200 min-w-[90px] text-center text-xs">Sagittal ({images.length > 0 ? rightIndex + 1 : 0}/{images.length})</span>
                <button disabled={isLoading} onClick={() => selectRightImage(rightIndex + 1)} className="p-2 sm:p-1.5 rounded bg-indigo-600 active:bg-indigo-700 text-white disabled:opacity-50 touch-manipulation"><ChevronRight className="h-4 w-4" /></button>
              </div>
              {images[rightIndex] && (
                <button disabled={isLoading} onClick={() => handleDeleteImage('right')} className="p-2 sm:p-1.5 rounded bg-red-950/60 border border-red-800/60 text-red-400 active:bg-red-900/40 disabled:opacity-50 touch-manipulation"><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <select disabled={isLoading} value={selectedClassRight} onChange={(e) => setSelectedClassRight(e.target.value)} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500 flex-1 sm:flex-initial min-w-[100px]">
                <option value="Tumor">Tumor</option>
                <option value="Node">Lymph Node</option>
              </select>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer select-none py-1"><input type="checkbox" checked={hideAnnotationsRight} onChange={(e) => setHideAnnotationsRight(e.target.checked)} className="rounded border-slate-700 text-indigo-600 w-4 h-4 accent-indigo-600 focus:ring-0 focus:ring-offset-0" /><span className="text-[11px] sm:text-xs">Hide</span></label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none py-1"><input type="checkbox" checked={applyCTRight} onChange={(e) => setApplyCTRight(e.target.checked)} className="rounded border-slate-700 text-indigo-600 w-4 h-4 accent-indigo-600 focus:ring-0 focus:ring-offset-0" /><span className="text-[11px] sm:text-xs">CT Window</span></label>
              </div>
            </div>
          </div>

          {/* Interactive Canvas Container */}
          <div className="relative aspect-square w-full bg-black rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center touch-none">
            <div
              className="relative w-full h-full transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${zoomRight})` }}
              onClick={() => {
                if (!isSegmentingRight && clickToZoomRight) handleImageZoom('right');
              }}
            >
              {images[rightIndex]?.image ? (
                <img src={images[rightIndex].image} alt="Sagittal View" className={`w-full h-full object-contain pointer-events-none select-none ${applyCTRight ? 'brightness-125 contrast-150 grayscale' : ''}`} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">No Image Loaded</div>
              )}
              
              <svg 
                ref={svgRightRef} 
                onClick={(e) => handleCanvasTouchOrClick(e.clientX, e.clientY, svgRightRef, setCurrentPointsRight, isSegmentingRight)}
                onTouchStart={(e) => {
                  if (isSegmentingRight && e.touches.length === 1) {
                    handleCanvasTouchOrClick(e.touches[0].clientX, e.touches[0].clientY, svgRightRef, setCurrentPointsRight, isSegmentingRight);
                  }
                }}
                className={`absolute inset-0 w-full h-full z-10 ${isSegmentingRight ? 'cursor-crosshair' : 'cursor-default'}`} 
                viewBox="0 0 100 100" 
                preserveAspectRatio="none"
              >
                {!hideAnnotationsRight && polygonsRight.map((poly) => (
                  <polygon key={poly.id} points={poly.points.map(p => `${p.x},${p.y}`).join(' ')} className="fill-blue-500/20 stroke-blue-600 stroke-[0.4]" />
                ))}
                {!hideAnnotationsRight && currentPointsRight.map((p, idx) => <circle key={idx} cx={p.x} cy={p.y} r="1.2" className="fill-blue-600 stroke-white stroke-[0.2]" />)}
                {!hideAnnotationsRight && currentPointsRight.length > 1 && <polyline points={currentPointsRight.map(p => `${p.x},${p.y}`).join(' ')} className="fill-none stroke-blue-500 stroke-[0.3]" />}
              </svg>
            </div>
          </div>

          {/* Canvas Actions Toolbelt */}
          <div className="flex flex-col gap-2 mt-3 bg-slate-900/30 p-2 border border-slate-800/80 rounded-lg">
            <div className="flex flex-wrap items-center gap-1.5 w-full justify-between">
              <div className="flex flex-wrap items-center gap-1">                
                <button disabled={isLoading} onClick={() => setIsSegmentingRight(!isSegmentingRight)} className={`p-2.5 rounded-lg active:scale-95 transition-transform ${isSegmentingRight ? 'bg-red-600' : 'bg-indigo-600'} text-white touch-manipulation`} title="Toggle Segment Draw">
                  {isSegmentingRight ? <X className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
                </button>
                <button onClick={() => setZoomRight(1)} className="p-2.5 bg-indigo-600 active:bg-indigo-700 text-white rounded-lg active:scale-95 transition-transform touch-manipulation" title="Reset Zoom"><Maximize2 className="h-4 w-4" /></button>
                <button onClick={() => setCurrentPointsRight(p => p.slice(0, -1))} className="p-2.5 bg-indigo-600 active:bg-indigo-700 text-white rounded-lg active:scale-95 transition-transform touch-manipulation" title="Undo Last Node Point"><Undo2 className="h-4 w-4" /></button>
                <button onClick={() => { setPolygonsRight([]); setCurrentPointsRight([]); }} className="p-2.5 bg-indigo-600 active:bg-indigo-700 text-white rounded-lg active:scale-95 transition-transform touch-manipulation" title="Clear Canvas States"><RotateCw className="h-4 w-4" /></button>
                <button disabled={isLoading} onClick={() => handleDeletePolygon(undefined, 'right')} className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg active:scale-95 transition-transform touch-manipulation" title="Delete Last Polygon"><Trash2 className="h-4 w-4" /></button>
              </div>

              <button onClick={() => setClickToZoomRight(prev => !prev)} className={`px-2.5 py-2 rounded-lg text-[10px] font-bold active:scale-95 transition-all select-none ${clickToZoomRight ? 'bg-emerald-600/90 text-white' : 'bg-slate-800 text-slate-400'} touch-manipulation`}>
                Click Zoom {clickToZoomRight ? 'On' : 'Off'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 w-full">
              <div className="flex items-center gap-2 bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 flex-1 max-w-[220px]">
                <ZoomOut className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <input type="range" min="1" max="4" step="0.1" value={zoomRight} onChange={(e) => setZoomRight(parseFloat(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                <ZoomIn className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] font-mono text-slate-400 w-8 text-right shrink-0">{Math.round(zoomRight * 100)}%</span>
              </div>

              {currentPointsRight.length >= 3 && (
                <button disabled={isLoading} onClick={() => saveCurrentShape('right')} className="px-3 py-1.5 bg-green-600 active:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform animate-pulse touch-manipulation"><Check className="h-3.5 w-3.5" /> Save</button>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}