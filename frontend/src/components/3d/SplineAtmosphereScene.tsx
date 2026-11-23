import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Globe, Sparkles, RotateCw, Compass, MapPin } from 'lucide-react';

interface SplineAtmosphereSceneProps {
  onClose?: () => void;
  selectedCity?: string;
}

const INDIAN_CITIES = [
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, aqi: 184, color: '#E5B800' },
  { name: 'Delhi NCR', lat: 28.6139, lng: 77.209, aqi: 312, color: '#C00000' },
  { name: 'Ludhiana', lat: 30.901, lng: 75.8573, aqi: 245, color: '#FF7C80' },
  { name: 'Amritsar', lat: 31.634, lng: 74.8723, aqi: 198, color: '#E5B800' },
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, aqi: 142, color: '#E5B800' },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, aqi: 78, color: '#92D050' },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export const SplineAtmosphereScene: React.FC<SplineAtmosphereSceneProps> = ({
  onClose,
  selectedCity = 'Chandigarh',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [activePin, setActivePin] = useState<string>(selectedCity);

  useEffect(() => {
    if (selectedCity) setActivePin(selectedCity);
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
      if (controlsRef.current) controlsRef.current.autoRotate = next;
      return next;
    });
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 550;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.0;
    controls.maxDistance = 8.0;
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 0.6;
    controlsRef.current = controls;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(8, 5, 6);
    scene.add(sunLight);
    const blueLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    blueLight.position.set(-8, -4, -6);
    scene.add(blueLight);

    // Starfield Background
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 20 + Math.random() * 25;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.12, transparent: true, opacity: 0.6 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Procedural Globe Sphere
    const earthRadius = 1.45;
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Earth Ocean Sphere
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x0f2b46,
      roughness: 0.45,
      metalness: 0.15,
      emissive: 0x051320,
      emissiveIntensity: 0.3,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Wireframe Grid / Lat-Long Meridians
    const gridGeo = new THREE.SphereGeometry(earthRadius * 1.002, 32, 16);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    earthGroup.add(new THREE.Mesh(gridGeo, gridMat));

    // Outer Atmospheric Glow
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.08, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Mesh(atmosGeo, atmosMat));

    // City AQI Pins & Beacons
    INDIAN_CITIES.forEach((city) => {
      const pinPos = latLngToVector3(city.lat, city.lng, earthRadius * 1.015);
      const markerMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 16, 16),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(city.color) })
      );
      markerMesh.position.copy(pinPos);
      earthGroup.add(markerMesh);

      // Outer Beacon Ring
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.048, 0.068, 24),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(city.color),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        })
      );
      ringMesh.position.copy(pinPos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      earthGroup.add(ringMesh);
    });

    let isDisposed = false;
    const animate = () => {
      if (isDisposed) return;
      animFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      starField.rotation.y -= 0.0001;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isAutoRotating]);

  return (
    <div className="relative w-full h-[500px] sm:h-[620px] rounded-3xl overflow-hidden border border-white/60 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 shadow-2xl backdrop-blur-xl select-none">
      {/* 3D Scene Interactive Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg">
          <Globe className="w-4 h-4 text-emerald-400 animate-spin-slow" />
          <span>3D Atmosphere & Station Network</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
            Realtime 60 FPS
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
