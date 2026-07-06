'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { 
  ChevronLeft, ChevronRight, Scissors, ZoomIn, ZoomOut, 
  Maximize2, Move, Undo2, RotateCw, X, Check, Upload
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
  image: string; // Dynamic source string (URL / base64 image data string)
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
  
  // Viewports index tracking
  const [leftIndex, setLeftIndex] = useState<number>(23);
  const [rightIndex, setRightIndex] = useState<number>(0);

  // --- Controls & Toggle Options ---
  const [selectedClassLeft, setSelectedClassLeft] = useState<string>('Tumor');
  const [hideAnnotationsLeft, setHideAnnotationsLeft] = useState<boolean>(false);
  const [hideReviewLeft, setHideReviewLeft] = useState<boolean>(false);
  const [applyCTLeft, setApplyCTLeft] = useState<boolean>(false);

  const [selectedClassRight, setSelectedClassRight] = useState<string>('Tumor');
  const [hideAnnotationsRight, setHideAnnotationsRight] = useState<boolean>(false);
  const [hideReviewRight, setHideReviewRight] = useState<boolean>(false);
  const [applyCTRight, setApplyCTRight] = useState<boolean>(false);

  // --- Zoom, Pan & Mode States ---
  const [zoomLeft, setZoomLeft] = useState<number>(1);
  const [isSegmentingLeft, setIsSegmentingLeft] = useState<boolean>(false);
  
  const [zoomRight, setZoomRight] = useState<number>(1);
  const [isSegmentingRight, setIsSegmentingRight] = useState<boolean>(false);

  // Drawing point arrays
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
        // Fallback baseline mock images
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
        const nextLeftIndex = Math.min(currentLeftIndex, Math.max(data.length - 1, 0));
        const nextRightIndex = data.length > 1 && currentRightIndex === 0 ? 1 : currentRightIndex;

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
    if (!token) {
      alert("Local mock session active. Backend token required to persist uploaded batches.");
      return;
    }

    for (let i = 0; i < e.target.files.length; i++) {
      const formData = new FormData();
      formData.append('image', e.target.files[i]);

      try {
        const res = await fetch('http://localhost:8000/api/annotations/images/', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (res.ok) {
          await fetchWorkspaceData();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCanvasClick = (
    e: React.MouseEvent<SVGSVGElement>, 
    ref: React.RefObject<SVGSVGElement | null>, 
    setPoints: React.Dispatch<React.SetStateAction<Point[]>>,
    currentZoom: number,
    segmentingMode: boolean
  ) => {
    if (!ref.current || !segmentingMode) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPoints(prev => [...prev, { x, y }]);
  };

  const saveCurrentShape = (target: 'left' | 'right') => {
    if (target === 'left') {
      if (currentPointsLeft.length < 3) return;
      const newPoly: Polygon = {
        id: Date.now().toString(),
        points: currentPointsLeft,
        label: selectedClassLeft
      };
      setPolygonsLeft(prev => [...prev, newPoly]);
      setCurrentPointsLeft([]);
    } else {
      if (currentPointsRight.length < 3) return;
      const newPoly: Polygon = {
        id: Date.now().toString(),
        points: currentPointsRight,
        label: selectedClassRight
      };
      setPolygonsRight(prev => [...prev, newPoly]);
      setCurrentPointsRight([]);
    }
  };

  // Safe reference getters for active image assets
  const currentLeftImage = images[leftIndex];
  const currentRightImage = images[rightIndex];

  return (
    <main className="min-h-screen bg-[#f8f9fa] p-16 font-sans text-gray-800">
      {/* Top Workspace Controls / Upload Header Panel */}
      <div className="mx-auto max-w-[1200px] mb-4 flex flex-wrap items-center justify-between gap-4 bg-white border border-gray-200 rounded shadow-sm px-4 py-3">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-gray-900">
            Advanced Segment Analytics Matrix
          </h1>
          <p className="text-[11px] text-gray-500">Synchronized structural medical visualization engine</p>
        </div>
        
        <label className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white transition px-3 py-1.5 rounded cursor-pointer text-xs font-semibold shadow-sm">
          <Upload className="h-3.5 w-3.5" /> Upload Image Batch
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      <div className="mx-auto max-w-[1200px] grid grid-cols-1 xl:grid-cols-2 gap-4">
        
        {/* ================= LEFT VIEWPORT (AXIAL) ================= */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-3 flex flex-col">
          {/* Top Config Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 p-2 border border-gray-200 rounded mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => selectLeftImage(leftIndex - 1)}
                className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-bold text-gray-700 min-w-[90px] text-center">
                Axial ({images.length > 0 ? leftIndex + 1 : 1}/{images.length || 75})
              </span>
              <button 
                onClick={() => selectLeftImage(leftIndex + 1)}
                className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-gray-600 font-medium">Select Class:</span>
                <select 
                  value={selectedClassLeft} 
                  onChange={(e) => setSelectedClassLeft(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                >
                  <option value="Tumor">Tumor</option>
                  <option value="Node">Lymph Node</option>
                </select>
              </div>

              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hideAnnotationsLeft}
                  onChange={(e) => setHideAnnotationsLeft(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" 
                />
                <span>Hide Annotations</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hideReviewLeft}
                  onChange={(e) => setHideReviewLeft(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" 
                />
                <span>Hide Review</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={applyCTLeft}
                  onChange={(e) => setApplyCTLeft(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" 
                />
                <span>Apply CT Window</span>
              </label>
            </div>
          </div>

          {/* Screen Canvas Area with Live Uploaded Image Frame */}
          <div className="relative aspect-square w-full bg-black rounded border border-gray-300 overflow-hidden flex items-center justify-center">
            <div className="relative w-full h-full transition-transform duration-200 ease-out origin-center" style={{ transform: `scale(${zoomLeft})` }}>
              
              {/* Actual Image Render Layer */}
              {currentLeftImage?.image ? (
                <img 
                  src={currentLeftImage.image} 
                  alt={`Axial View Frame ${leftIndex + 1}`}
                  className={`w-full h-full object-contain pointer-events-none select-none ${applyCTLeft ? 'brightness-125 contrast-150 grayscale' : ''}`}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium text-sm select-none pointer-events-none">
                  <div className="w-[80%] h-[80%] rounded-full border border-dashed border-gray-800 opacity-40 flex items-center justify-center">
                    <span className="text-xs text-gray-700">Axial View Frame [{leftIndex + 1}]</span>
                  </div>
                </div>
              )}
              
              <svg
                ref={svgLeftRef}
                onClick={(e) => handleCanvasClick(e, svgLeftRef, setCurrentPointsLeft, zoomLeft, isSegmentingLeft)}
                className={`absolute inset-0 w-full h-full z-10 ${isSegmentingLeft ? 'cursor-crosshair' : 'cursor-default'}`}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {!hideAnnotationsLeft && polygonsLeft.map((poly) => (
                  <polygon 
                    key={poly.id} 
                    points={poly.points.map(p => `${p.x},${p.y}`).join(' ')} 
                    className="fill-red-500/20 stroke-red-600 stroke-[0.4]" 
                  />
                ))}
                {!hideAnnotationsLeft && currentPointsLeft.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="1.2" className="fill-red-600 stroke-white stroke-[0.2]" />
                    <circle cx={p.x} cy={p.y} r="2.5" className="fill-none stroke-red-400 stroke-[0.15] stroke-dasharray-[0.5,0.5]" />
                  </g>
                ))}
                {!hideAnnotationsLeft && currentPointsLeft.length > 1 && (
                  <polyline 
                    points={currentPointsLeft.map(p => `${p.x},${p.y}`).join(' ')} 
                    className="fill-none stroke-red-500 stroke-[0.3]" 
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Bottom Custom Actions Toolbar Row */}
          <div className="flex items-center justify-between mt-3 bg-gray-50 p-1.5 border border-gray-200 rounded">
            <div className="flex items-center gap-1 flex-wrap">
              <button 
                title="Toggle Segmentation Mode"
                onClick={() => setIsSegmentingLeft(!isSegmentingLeft)} 
                className={`p-2 rounded transition relative ${isSegmentingLeft ? 'bg-red-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isSegmentingLeft ? <X className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
              </button>
              
              <button onClick={() => setZoomLeft(z => Math.min(z + 0.25, 4))} className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><ZoomIn className="h-4 w-4" /></button>
              <button onClick={() => setZoomLeft(z => Math.max(z - 0.25, 1))} className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><ZoomOut className="h-4 w-4" /></button>
              <button onClick={() => setZoomLeft(1)} className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><Maximize2 className="h-4 w-4" /></button>
              <button className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><Move className="h-4 w-4" /></button>
              <button onClick={() => setCurrentPointsLeft(p => p.slice(0, -1))} className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><Undo2 className="h-4 w-4" /></button>
              <button onClick={() => { setPolygonsLeft([]); setCurrentPointsLeft([]); }} className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><RotateCw className="h-4 w-4" /></button>

              {currentPointsLeft.length >= 3 && (
                <button 
                  onClick={() => saveCurrentShape('left')}
                  className="ml-2 px-2.5 py-1.5 bg-green-600 text-white rounded text-xs font-bold flex items-center gap-1 hover:bg-green-700 transition"
                >
                  <Check className="h-3.5 w-3.5" /> Commit
                </button>
              )}
            </div>
            <span className="text-[11px] font-semibold text-gray-500 mr-2 uppercase tracking-wider">Series Review: Axial</span>
          </div>
        </div>

        {/* ================= RIGHT VIEWPORT (SAGITTAL) ================= */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-3 flex flex-col">
          {/* Top Config Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 p-2 border border-gray-200 rounded mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => selectRightImage(rightIndex - 1)}
                className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-bold text-gray-700 min-w-[90px] text-center">
                Sagittal ({images.length > 0 ? rightIndex + 1 : 1}/{images.length || 232})
              </span>
              <button 
                onClick={() => selectRightImage(rightIndex + 1)}
                className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-gray-600 font-medium">Select Class:</span>
                <select 
                  value={selectedClassRight} 
                  onChange={(e) => setSelectedClassRight(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                >
                  <option value="Tumor">Tumor</option>
                  <option value="Node">Lymph Node</option>
                </select>
              </div>

              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hideAnnotationsRight}
                  onChange={(e) => setHideAnnotationsRight(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" 
                />
                <span>Hide Annotations</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hideReviewRight}
                  onChange={(e) => setHideReviewRight(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" 
                />
                <span>Hide Review</span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={applyCTRight}
                  onChange={(e) => setApplyCTRight(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" 
                />
                <span>Apply CT Window</span>
              </label>
            </div>
          </div>

          {/* Screen Canvas Area with Live Uploaded Image Frame */}
          <div className="relative aspect-square w-full bg-black rounded border border-gray-300 overflow-hidden flex items-center justify-center">
            <div className="relative w-full h-full transition-transform duration-200 ease-out origin-center" style={{ transform: `scale(${zoomRight})` }}>
              
              {/* Actual Image Render Layer */}
              {currentRightImage?.image ? (
                <img 
                  src={currentRightImage.image} 
                  alt={`Sagittal View Frame ${rightIndex + 1}`}
                  className={`w-full h-full object-contain pointer-events-none select-none ${applyCTRight ? 'brightness-125 contrast-150 grayscale' : ''}`}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium text-sm select-none pointer-events-none">
                  <div className="w-[80%] h-[80%] rounded-xl border border-dashed border-gray-800 opacity-40 flex items-center justify-center">
                    <span className="text-xs text-gray-700">Sagittal View Frame [{rightIndex + 1}]</span>
                  </div>
                </div>
              )}
              
              <svg
                ref={svgRightRef}
                onClick={(e) => handleCanvasClick(e, svgRightRef, setCurrentPointsRight, zoomRight, isSegmentingRight)}
                className={`absolute inset-0 w-full h-full z-10 ${isSegmentingRight ? 'cursor-crosshair' : 'cursor-default'}`}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {!hideAnnotationsRight && polygonsRight.map((poly) => (
                  <polygon 
                    key={poly.id} 
                    points={poly.points.map(p => `${p.x},${p.y}`).join(' ')} 
                    className="fill-blue-500/20 stroke-blue-600 stroke-[0.4]" 
                  />
                ))}
                {!hideAnnotationsRight && currentPointsRight.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="1.2" className="fill-blue-600 stroke-white stroke-[0.2]" />
                    <circle cx={p.x} cy={p.y} r="2.5" className="fill-none stroke-blue-400 stroke-[0.15] stroke-dasharray-[0.5,0.5]" />
                  </g>
                ))}
                {!hideAnnotationsRight && currentPointsRight.length > 1 && (
                  <polyline 
                    points={currentPointsRight.map(p => `${p.x},${p.y}`).join(' ')} 
                    className="fill-none stroke-blue-500 stroke-[0.3]" 
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Bottom Custom Actions Toolbar Row */}
          <div className="flex items-center justify-between mt-3 bg-gray-50 p-1.5 border border-gray-200 rounded">
            <div className="flex items-center gap-1 flex-wrap">
              <button 
                title="Toggle Segmentation Mode"
                onClick={() => setIsSegmentingRight(!isSegmentingRight)} 
                className={`p-2 rounded transition relative ${isSegmentingRight ? 'bg-red-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isSegmentingRight ? <X className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
              </button>
              
              <button onClick={() => setZoomRight(z => Math.min(z + 0.25, 4))} className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><ZoomIn className="h-4 w-4" /></button>
              <button onClick={() => setZoomRight(z => Math.max(z - 0.25, 1))} className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><ZoomOut className="h-4 w-4" /></button>
              <button onClick={() => setZoomRight(1)} className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><Maximize2 className="h-4 w-4" /></button>
              <button className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><Move className="h-4 w-4" /></button>
              <button onClick={() => setCurrentPointsRight(p => p.slice(0, -1))} className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><Undo2 className="h-4 w-4" /></button>
              <button onClick={() => { setPolygonsRight([]); setCurrentPointsRight([]); }} className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition"><RotateCw className="h-4 w-4" /></button>

              {currentPointsRight.length >= 3 && (
                <button 
                  onClick={() => saveCurrentShape('right')}
                  className="ml-2 px-2.5 py-1.5 bg-green-600 text-white rounded text-xs font-bold flex items-center gap-1 hover:bg-green-700 transition"
                >
                  <Check className="h-3.5 w-3.5" /> Commit
                </button>
              )}
            </div>
            <span className="text-[11px] font-semibold text-gray-500 mr-2 uppercase tracking-wider">Series Review: Sagittal</span>
          </div>
        </div>

      </div>
    </main>
  );
}