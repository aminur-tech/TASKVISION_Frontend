'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { 
  ChevronLeft, ChevronRight, Scissors, ZoomIn, ZoomOut, 
  Maximize2, Undo2, RotateCw, X, Check, Upload, Trash2
} from 'lucide-react';

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

  const fetchWorkspaceData = useCallback(async () => {
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

      const res = await fetch('http://localhost:8000/api/annotations/images/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: DBImage[] = await res.json();
        const { leftIndex: currentLeftIndex, rightIndex: currentRightIndex } = selectionRef.current;
        
        const nextLeftIndex = data.length > 0 ? Math.min(currentLeftIndex, data.length - 1) : 0;
        const nextRightIndex = data.length > 0 ? Math.min(currentRightIndex, data.length - 1) : 0;

        setImages(data);
        setLeftIndex(nextLeftIndex);
        setRightIndex(nextRightIndex);
        setPolygonsLeft(mapPolygonsFromImage(data[nextLeftIndex]));
        setPolygonsRight(mapPolygonsFromImage(data[nextRightIndex]));
      }
    } catch (err) {
      console.error("Data syncing link offline.", err);
    }
  }, [mapPolygonsFromImage]);

  useEffect(() => {
    selectionRef.current = { leftIndex, rightIndex };
  }, [leftIndex, rightIndex]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchWorkspaceData();
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const token = Cookies.get('token');
    if (!token) return;

    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData();
      formData.append('image', e.target.files[i]);
      try {
        const res = await fetch('http://localhost:8000/api/annotations/images/', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (res.ok) await fetchWorkspaceData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteImage = async (viewport: 'left' | 'right') => {
    const activeIndex = viewport === 'left' ? leftIndex : rightIndex;
    const targetImage = images[activeIndex];
    if (!targetImage || !confirm(`Are you sure you want to permanently delete image ID ${targetImage.id}?`)) return;

    const token = Cookies.get('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8000/api/annotations/images/${targetImage.id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) await fetchWorkspaceData();
    } catch (err) {
      console.error(err);
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

    try {
      await fetch(`http://localhost:8000/api/annotations/polygons/${resolvedPolyId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchWorkspaceData();
    } catch (err) {
      console.error("Error deleting polygon:", err);
    }
  };

  const handleCanvasClick = (
    e: React.MouseEvent<SVGSVGElement>, 
    ref: React.RefObject<SVGSVGElement | null>, 
    setPoints: React.Dispatch<React.SetStateAction<Point[]>>,
    segmentingMode: boolean
  ) => {
    if (!ref.current || !segmentingMode) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
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

    try {
      const res = await fetch('http://localhost:8000/api/annotations/polygons/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: currentImg.id, points, label })
      });
      if (res.ok) await fetchWorkspaceData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-16 font-sans text-slate-100">
      <div className="mx-auto max-w-[1200px] mb-4 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">Advanced Segment Analytics Matrix</h1>
          <p className="text-[11px] text-slate-400">Synchronized structural medical visualization engine</p>
        </div>
        <label className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white transition px-3 py-1.5 rounded cursor-pointer text-xs font-semibold shadow-sm">
          <Upload className="h-3.5 w-3.5" /> Upload Image Batch
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      <div className="mx-auto max-w-[1200px] grid grid-cols-1 xl:grid-cols-2 gap-4">
        
        {/* ================= LEFT VIEWPORT (AXIAL) ================= */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2 border border-slate-800 rounded-lg mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <button onClick={() => selectLeftImage(leftIndex - 1)} className="p-1 rounded bg-indigo-600 text-white"><ChevronLeft className="h-4 w-4" /></button>
              <span className="font-bold text-slate-200 min-w-[90px] text-center">Axial ({images.length > 0 ? leftIndex + 1 : 0}/{images.length})</span>
              <button onClick={() => selectLeftImage(leftIndex + 1)} className="p-1 rounded bg-indigo-600 text-white"><ChevronRight className="h-4 w-4" /></button>
              {images[leftIndex] && (
                <button onClick={() => handleDeleteImage('left')} className="p-1 ml-1 rounded bg-red-950 border border-red-800 text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select value={selectedClassLeft} onChange={(e) => setSelectedClassLeft(e.target.value)} className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs">
                <option value="Tumor">Tumor</option>
                <option value="Node">Lymph Node</option>
              </select>
              <label className="flex items-center gap-1"><input type="checkbox" checked={hideAnnotationsLeft} onChange={(e) => setHideAnnotationsLeft(e.target.checked)} className="rounded border-slate-700 text-indigo-600 w-3.5 h-3.5" /><span>Hide Annotations</span></label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={applyCTLeft} onChange={(e) => setApplyCTLeft(e.target.checked)} className="rounded border-slate-700 text-indigo-600 w-3.5 h-3.5" /><span>Apply CT Window</span></label>
            </div>
          </div>

          <div className="relative aspect-square w-full bg-black rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
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
              
              <svg ref={svgLeftRef} onClick={(e) => handleCanvasClick(e, svgLeftRef, setCurrentPointsLeft, isSegmentingLeft)} className={`absolute inset-0 w-full h-full z-10 ${isSegmentingLeft ? 'cursor-crosshair' : 'cursor-default'}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                {!hideAnnotationsLeft && polygonsLeft.map((poly) => (
                  <polygon key={poly.id} points={poly.points.map(p => `${p.x},${p.y}`).join(' ')} className="fill-red-500/20 stroke-red-600 stroke-[0.4]" />
                ))}
                {!hideAnnotationsLeft && currentPointsLeft.map((p, idx) => <circle key={idx} cx={p.x} cy={p.y} r="1.2" className="fill-red-600 stroke-white stroke-[0.2]" />)}
                {!hideAnnotationsLeft && currentPointsLeft.length > 1 && <polyline points={currentPointsLeft.map(p => `${p.x},${p.y}`).join(' ')} className="fill-none stroke-red-500 stroke-[0.3]" />}
              </svg>
            </div>
          </div>

          {/* Bottom Toolbar with Slider Toggle */}
          <div className="flex items-center justify-between mt-3 bg-slate-950 p-1.5 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-2 flex-wrap w-full justify-between sm:justify-start">
              <div className="flex items-center gap-1">
                <button onClick={() => setIsSegmentingLeft(!isSegmentingLeft)} className={`p-2 rounded ${isSegmentingLeft ? 'bg-red-600' : 'bg-indigo-600'} text-white`}>{isSegmentingLeft ? <X className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}</button>
                <button onClick={() => setZoomLeft(1)} className="p-2 bg-indigo-600 text-white rounded"><Maximize2 className="h-4 w-4" /></button>
                <button onClick={() => setCurrentPointsLeft(p => p.slice(0, -1))} className="p-2 bg-indigo-600 text-white rounded"><Undo2 className="h-4 w-4" /></button>
                
                <button onClick={() => handleDeletePolygon(undefined, 'left')} className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded" title="Delete Last Polygon"><Trash2 className="h-4 w-4" /></button>
              </div>

              {/* Line Toggle Zoom Slider */}
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                <ZoomOut className="h-3.5 w-3.5 text-slate-400" />
                <input type="range" min="1" max="4" step="0.1" value={zoomLeft} onChange={(e) => setZoomLeft(parseFloat(e.target.value))} className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                <ZoomIn className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-mono text-slate-400 w-8">{Math.round(zoomLeft * 100)}%</span>
              </div>

              <button onClick={() => setClickToZoomLeft(prev => !prev)} className={`px-2.5 py-1 rounded text-[10px] font-semibold ${clickToZoomLeft ? 'bg-emerald-600' : 'bg-slate-700'} text-white`}>
                Click Zoom {clickToZoomLeft ? 'On' : 'Off'}
              </button>

              {currentPointsLeft.length >= 3 && (
                <button onClick={() => saveCurrentShape('left')} className="px-2.5 py-1.5 bg-green-600 text-white rounded text-xs font-bold flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Save</button>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT VIEWPORT (SAGITTAL) ================= */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2 border border-slate-800 rounded-lg mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <button onClick={() => selectRightImage(rightIndex - 1)} className="p-1 rounded bg-indigo-600 text-white"><ChevronLeft className="h-4 w-4" /></button>
              <span className="font-bold text-slate-200 min-w-[90px] text-center">Sagittal ({images.length > 0 ? rightIndex + 1 : 0}/{images.length})</span>
              <button onClick={() => selectRightImage(rightIndex + 1)} className="p-1 rounded bg-indigo-600 text-white"><ChevronRight className="h-4 w-4" /></button>
              {images[rightIndex] && (
                <button onClick={() => handleDeleteImage('right')} className="p-1 ml-1 rounded bg-red-950 border border-red-800 text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select value={selectedClassRight} onChange={(e) => setSelectedClassRight(e.target.value)} className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs">
                <option value="Tumor">Tumor</option>
                <option value="Node">Lymph Node</option>
              </select>
              <label className="flex items-center gap-1"><input type="checkbox" checked={hideAnnotationsRight} onChange={(e) => setHideAnnotationsRight(e.target.checked)} className="rounded border-slate-700 text-indigo-600 w-3.5 h-3.5" /><span>Hide Annotations</span></label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={applyCTRight} onChange={(e) => setApplyCTRight(e.target.checked)} className="rounded border-slate-700 text-indigo-600 w-3.5 h-3.5" /><span>Apply CT Window</span></label>
            </div>
          </div>

          <div className="relative aspect-square w-full bg-black rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
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
              
              <svg ref={svgRightRef} onClick={(e) => handleCanvasClick(e, svgRightRef, setCurrentPointsRight, isSegmentingRight)} className={`absolute inset-0 w-full h-full z-10 ${isSegmentingRight ? 'cursor-crosshair' : 'cursor-default'}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                {!hideAnnotationsRight && polygonsRight.map((poly) => (
                  <polygon key={poly.id} points={poly.points.map(p => `${p.x},${p.y}`).join(' ')} className="fill-blue-500/20 stroke-blue-600 stroke-[0.4]" />
                ))}
                {!hideAnnotationsRight && currentPointsRight.map((p, idx) => <circle key={idx} cx={p.x} cy={p.y} r="1.2" className="fill-blue-600 stroke-white stroke-[0.2]" />)}
                {!hideAnnotationsRight && currentPointsRight.length > 1 && <polyline points={currentPointsRight.map(p => `${p.x},${p.y}`).join(' ')} className="fill-none stroke-blue-500 stroke-[0.3]" />}
              </svg>
            </div>
          </div>

          {/* Bottom Toolbar with Slider Toggle */}
          <div className="flex items-center justify-between mt-3 bg-slate-950 p-1.5 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-2 flex-wrap w-full justify-between sm:justify-start">
              <div className="flex items-center gap-1">
                <button onClick={() => setIsSegmentingRight(!isSegmentingRight)} className={`p-2 rounded ${isSegmentingRight ? 'bg-red-600' : 'bg-indigo-600'} text-white`}>{isSegmentingRight ? <X className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}</button>
                <button onClick={() => setZoomRight(1)} className="p-2 bg-indigo-600 text-white rounded"><Maximize2 className="h-4 w-4" /></button>
                <button onClick={() => setCurrentPointsRight(p => p.slice(0, -1))} className="p-2 bg-indigo-600 text-white rounded"><Undo2 className="h-4 w-4" /></button>
                <button onClick={() => { setPolygonsRight([]); setCurrentPointsRight([]); }} className="p-2 bg-indigo-600 text-white rounded"><RotateCw className="h-4 w-4" /></button>
                <button onClick={() => handleDeletePolygon(undefined, 'right')} className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded" title="Delete Last Polygon"><Trash2 className="h-4 w-4" /></button>
              </div>

              {/* Line Toggle Zoom Slider */}
              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-md border border-slate-800">
                <ZoomOut className="h-3.5 w-3.5 text-slate-400" />
                <input type="range" min="1" max="4" step="0.1" value={zoomRight} onChange={(e) => setZoomRight(parseFloat(e.target.value))} className="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                <ZoomIn className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-mono text-slate-400 w-8">{Math.round(zoomRight * 100)}%</span>
              </div>

              <button onClick={() => setClickToZoomRight(prev => !prev)} className={`px-2.5 py-1 rounded text-[10px] font-semibold ${clickToZoomRight ? 'bg-emerald-600' : 'bg-slate-700'} text-white`}>
                Click Zoom {clickToZoomRight ? 'On' : 'Off'}
              </button>

              {currentPointsRight.length >= 3 && (
                <button onClick={() => saveCurrentShape('right')} className="px-2.5 py-1.5 bg-green-600 text-white rounded text-xs font-bold flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Save</button>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}