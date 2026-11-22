import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Globe,
  Sparkles,
  RefreshCw,
  Layers,
  RotateCw,
  Compass,
  AlertTriangle,
  MapPin,
} from 'lucide-react';

interface SplineAtmosphereSceneProps {
  modelUrl?: string;
  onClose?: () => void;
  selectedCity?: string;
}

// Coordinate markers for key Indian air monitoring hubs
const INDIAN_CITIES = [
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, aqi: 184, color: '#E5B800' },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.209, aqi: 312, color: '#C00000' },
  { name: 'Ludhiana', lat: 30.901, lng: 75.8573, aqi: 245, color: '#FF7C80' },
  { name: 'Amritsar', lat: 31.634, lng: 74.8723, aqi: 198, color: '#E5B800' },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, aqi: 142, color: '#E5B800' },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, aqi: 78, color: '#92D050' },
];

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Converts Latitude/Longitude to 3D Cartesian coordinates on a sphere of given radius.
 */
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const SplineAtmosphereScene: React.FC<SplineAtmosphereSceneProps> = ({
  modelUrl = '/models/earth.glb',
  onClose,
  selectedCity = 'Chandigarh',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [activePin, setActivePin] = useState<string | null>(selectedCity);

  // Sync selectedCity prop changes to update active 3D pin
  useEffect(() => {
    if (selectedCity) {
      setActivePin(selectedCity);
    }
  }, [selectedCity]);

  const handleResetCamera = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.autoRotate = isAutoRotating;
    }
  }, [isAutoRotating]);

  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating((prev) => {
      const next = !prev;
      if (controlsRef.current) {
        controlsRef.current.autoRotate = next;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebGLSupported(false);
      setIsLoading(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 550;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712); // slate-950

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.2);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const canvas = renderer.domElement;
    let isDisposed = false;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      isDisposed = true;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      setHasError(true);
      setErrorMessage('WebGL context was lost. Click retry to reinitialize 3D Earth.');
    };

    const handleContextRestored = () => {
      setHasError(false);
      setIsLoading(true);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.minDistance = 2.2;
    controls.maxDistance = 10;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(10, 6, 8);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    fillLight.position.set(-10, -5, -8);
    scene.add(fillLight);

    // 6. Starfield particle background
    const starCount = 800;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 25 + Math.random() * 30;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * radius;
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 7. Atmospheric Glow Layer
    const atmosphereGeometry = new THREE.SphereGeometry(1.65, 48, 48);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphereMesh);

    // 8. Earth Root Group
    const earthGroup = new THREE.Group();
    earthGroupRef.current = earthGroup;
    scene.add(earthGroup);

    // 9. Load Earth GLB Model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;

        // Compute bounding box to normalize model scale and center it
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center); // center model at (0,0,0)

        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetRadius = 1.55;
        const scaleFactor = (targetRadius * 2) / (maxDim || 1);
        model.scale.setScalar(scaleFactor);

        earthGroup.add(model);

        // Add 3D Pin Markers for Indian Cities
        INDIAN_CITIES.forEach((city) => {
          const pinPos = latLngToVector3(city.lat, city.lng, targetRadius * 1.01);

          // Glowing Sphere Marker
          const markerGeo = new THREE.SphereGeometry(0.035, 16, 16);
          const markerMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(city.color),
          });
          const markerMesh = new THREE.Mesh(markerGeo, markerMat);
          markerMesh.position.copy(pinPos);
          earthGroup.add(markerMesh);

          // Outer beacon ring
          const ringGeo = new THREE.RingGeometry(0.045, 0.065, 24);
          const ringMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(city.color),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.copy(pinPos);
          ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
          earthGroup.add(ringMesh);
        });

        setIsLoading(false);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.min(100, Math.round((xhr.loaded / xhr.total) * 100));
          setLoadProgress(percent);
        } else {
          // Fallback based on 22.6MB expected file size
          const estimatedTotal = 22669004;
          const percent = Math.min(99, Math.round((xhr.loaded / estimatedTotal) * 100));
          setLoadProgress(percent);
        }
      },
      (error) => {
        console.error('Error loading earth.glb model:', error);
        setHasError(true);
        setErrorMessage('Failed to load local 3D Earth GLB asset.');
        setIsLoading(false);
      }
    );

    // 10. Animation Loop
    const animate = () => {
      if (isDisposed) return;
      animFrameIdRef.current = requestAnimationFrame(animate);

      controls.update();

      // Subtle rotation for atmospheric glow and star field
      atmosphereMesh.rotation.y += 0.0004;
      starField.rotation.y -= 0.0001;

      renderer.render(scene, camera);
    };
    animate();

    // 11. Resize handling
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      controls.dispose();

      // Recursive disposal of GLTF scene mesh, geometry, material, and textures
      if (earthGroupRef.current) {
        earthGroupRef.current.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) {
            mesh.geometry.dispose();
          }
          if (mesh.material) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((mat) => {
              Object.keys(mat).forEach((key) => {
                const prop = (mat as unknown as Record<string, unknown>)[key];
                if (prop && typeof prop === 'object' && 'isTexture' in prop && Boolean(prop.isTexture)) {
                  (prop as THREE.Texture).dispose();
                }
              });
              mat.dispose();
            });
          }
        });
        earthGroupRef.current.clear();
      }

      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  return (
    <div className="relative w-full h-[500px] sm:h-[620px] rounded-3xl overflow-hidden border border-white/60 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 shadow-2xl backdrop-blur-xl select-none">
      {/* 3D Scene Interactive Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg">
          <Globe className="w-4 h-4 text-emerald-400 animate-spin-slow" />
          <span>3D Earth Atmosphere</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
            earth.glb (22.7 MB)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Indian Cities Quick Focus Pills */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 border border-white/10 text-[11px] text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-slate-400">Monitoring Hubs:</span>
            {INDIAN_CITIES.slice(0, 4).map((city) => (
              <button
                key={city.name}
                onClick={() => setActivePin(city.name)}
                className={`px-2 py-0.5 rounded transition-all ${
                  activePin === city.name
                    ? 'bg-emerald-500 text-white font-bold shadow-sm'
                    : 'hover:bg-white/10 text-slate-300'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>

          {/* Auto-Rotate Toggle */}
          <button
            onClick={toggleAutoRotate}
            title={isAutoRotating ? 'Pause auto-rotation' : 'Resume auto-rotation'}
            className={`p-2 rounded-full border text-xs transition-colors backdrop-blur-md ${
              isAutoRotating
                ? 'bg-emerald-600/70 border-emerald-400 text-white shadow-md'
                : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
          </button>

          {/* Reset Camera Button */}
          <button
            onClick={handleResetCamera}
            title="Reset Camera View"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 backdrop-blur-md"
          >
            <Compass className="w-3.5 h-3.5 text-amber-300" />
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              title="Close 3D View"
              className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-200 transition-colors border border-red-500/30 backdrop-blur-md"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading Progress Bar HUD */}
      {isLoading && webGLSupported && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 bg-slate-950/80 backdrop-blur-md">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            <Layers className="w-8 h-8 text-emerald-400 absolute inset-0 m-auto" />
          </div>
          <h4 className="mt-5 text-base font-semibold text-white tracking-wide">
            Loading High-Resolution 3D Earth...
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Parsing <code className="text-emerald-300">earth.glb</code> geometry, textures, and atmospheric shaders
          </p>

          {/* Progress bar */}
          <div className="w-64 bg-slate-800 rounded-full h-2.5 mt-4 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(8, loadProgress)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-emerald-300 mt-2 font-semibold">
            {loadProgress > 0 ? `${loadProgress}% downloaded` : 'Initializing WebGL...'}
          </span>
        </div>
      )}

      {/* WebGL Not Available Fallback */}
      {!webGLSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white bg-gradient-to-br from-slate-950 to-emerald-950 z-10">
          <AlertTriangle className="w-16 h-16 text-amber-400 mb-3" />
          <h4 className="text-lg font-bold">Hardware Accelerated 3D Not Supported</h4>
          <p className="text-xs text-slate-300 max-w-md mt-2 mb-4">
            WebGL is disabled or unsupported on your browser. AIRiac continues providing full live air quality monitoring, maps, and AI assistance in 2D mode.
          </p>
          <div className="flex gap-2">
            <span className="text-xs text-emerald-300 font-semibold bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30">
              Live Pan-India AQI Active
            </span>
          </div>
        </div>
      )}

      {/* Model Load Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white bg-gradient-to-br from-slate-950 to-emerald-950 z-10">
          <AlertTriangle className="w-14 h-14 text-rose-400 mb-3" />
          <h4 className="text-base font-bold text-white">3D Earth Asset Notice</h4>
          <p className="text-xs text-slate-300 max-w-md mt-1 mb-4">
            {errorMessage || 'Unable to stream 3D model.'}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Loading Model
          </button>
        </div>
      )}

      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Atmospheric Metrics & Instructions Footer */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/90 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-lg pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Aerosol Optical Depth (AOD): <strong className="text-emerald-300 font-mono">0.38</strong></span>
          <span className="text-white/40">•</span>
          <span>Tropospheric Mixing Layer: <strong className="text-emerald-300 font-mono">850m</strong></span>
          <span className="text-white/40">•</span>
          <span>Focus: <strong className="text-amber-300">{activePin || selectedCity}</strong></span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-300 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Drag to rotate • Scroll to zoom • Shift + drag to pan</span>
        </div>
      </div>
    </div>
  );
};
