import { useState, useEffect, useRef, useMemo, Suspense, Component } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { buildTourGraph } from "../utils/tourBuilder";

// Shared camera rotation baked into every panorama render (constant across
// all 48 gltf camera nodes) — used to rotate the mesh into the same local
// frame as the photo so "Show Mesh" lines up exactly with the photo view.


/**
 * ============================================================
 *  VIRTUAL TOUR — Haus of Tenet Penthouse
 * ============================================================
 *
 * TOUR_DATA below was generated directly from your real
 * `Penthouse_Cameras.gltf` camera nodes — 48 viewpoints total:
 *
 *  - 12 NAMED ROOMS (isNamed: true) — these show up in the
 *    bottom bar as the actual destinations a visitor picks
 *    (CEO Desk, CEO Office Entry, Garden Area, Landscape,
 *    Landscape Stairs, Meeting Table, Outdoor Water Seating,
 *    Passage, Penthouse, Side Wall Entry, Sunken Seating,
 *    Swimming Pool).
 *
 *  - 36 IN-BETWEEN STEPS (isNamed: false, the cam_xxx_NN nodes)
 *    — these don't appear in the bottom bar. They only exist as
 *    floor-dot hotspots so walking between two named rooms feels
 *    like a real walk instead of an instant jump.
 *
 * Each node's `hotspots` array was computed from the REAL 3D
 * distance and direction between that camera and its nearest
 * neighboring cameras in your gltf — so the floor-dot hotspots
 * point in the physically correct direction for each panorama.
 *
 * WHAT YOU STILL NEED TO DO:
 * 1. Put your 48 equirectangular renders in `public/panoramas/`,
 *    named EXACTLY as they are in TOUR_DATA (e.g.
 *    cam_ceo_desk_01.jpg, ceo_office_entry.jpg, etc.) — this
 *    matches the filenames from your renders folder.
 * 2. Since these are real photographic 360 renders (not a
 *    plain sphere), double check hotspot dot positions visually
 *    once images are in — the graph/directions are computed
 *    from real data, but real-world doorways/walls may need a
 *    small manual position nudge here and there.
 * --------------------------------------------------------------
 */



// ---- ERROR BOUNDARY & PRELOADING ----------------------------------------
class TourErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("VirtualTour error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={errorScreenStyle}>
          <h3>Virtual tour couldn't load</h3>
          <p style={{ fontSize: 13, opacity: 0.8, maxWidth: 400 }}>
            {String(this.state.error.message || this.state.error)}
          </p>
          <p style={{ fontSize: 12, opacity: 0.6 }}>
            Check that your panorama images exist at the paths set in
            TOUR_DATA (e.g. /panoramas/ceo_office_entry.jpg in your public folder).
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Invisible component that loads a texture into cache without rendering it,
// then triggers a callback so we can start the transition seamlessly.
function PreloadTexture({ url, onLoaded }) {
  const texture = useLoader(THREE.TextureLoader, url);
  useEffect(() => {
    if (texture) {
      // Small timeout ensures texture is uploaded to GPU before we crossfade
      const tid = setTimeout(() => onLoaded(), 50);
      return () => clearTimeout(tid);
    }
  }, [texture, onLoaded]);
  return null;
}

// ---- THE PANORAMA SPHERE ----------------------------------------------
function PanoramaSphere({ imageUrl, opacity }) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh scale={[-1, 1, 1]}>
      {/* -1 x-scale flips normals inward so we see the inside face */}
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

// ---- MESH VIEW ("Show Mesh" toggle) ------------------------------------
// Loads your real GLB, strips all 63 materials down to one flat gray
// unlit-ish material (matching the reference tool's look), and positions
// the whole mesh relative to the CURRENT viewpoint's real world position —
// so standing in "Passage" shows the mesh exactly as it would look from
// that real camera spot, lined up with the photo.
const FLAT_MESH_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#8a8a8a",
  roughness: 1,
  metalness: 0,
});

const INVISIBLE_MESH_MATERIAL = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

// ---- SURFACE CURSOR (3D Ring + Dot) ------------------------------------
function SurfaceCursor({ position, normal }) {
  const cursorRef = useRef();

  useEffect(() => {
    if (cursorRef.current && position && normal) {
      cursorRef.current.lookAt(position.clone().add(normal));
    }
  }, [position, normal]);

  if (!position) return null;

  return (
    <group ref={cursorRef} position={position} renderOrder={999}>
      {/* Outer Ring */}
      <mesh>
        <ringGeometry args={[0.2, 0.22, 32]} />
        <meshBasicMaterial color="#4da3ff" transparent opacity={0.6} depthTest={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner Dot/Ring */}
      <mesh>
        <ringGeometry args={[0.04, 0.08, 16]} />
        <meshBasicMaterial color="#4da3ff" transparent opacity={0.9} depthTest={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// If the mesh view looks rotated relative to the matching photo, adjust
// this value in 90-degree steps (try 90, -90, or 180) until it lines up.


// ---- MESH VIEW ("Show Mesh" toggle) ------------------------------------



function MeshDollhouseView({ worldPosition, showMesh, isTransitioning, meshGlb }) {
  const { scene } = useGLTF(meshGlb);
  const [cursorPos, setCursorPos] = useState(null);
  const [cursorNormal, setCursorNormal] = useState(null);

  const activeScene = useMemo(() => {
    const cloned = scene.clone(true);
    const material = showMesh ? FLAT_MESH_MATERIAL : INVISIBLE_MESH_MATERIAL;

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
      }
    });

    return cloned;
  }, [scene, showMesh]);

  return (
    <>
      <group rotation={[0, (-180 * Math.PI) / 180, 0]}>
        <group
          position={[
            -worldPosition[0],
            -worldPosition[1],
            -worldPosition[2],
          ]}
          onPointerMove={(e) => {
            if (isTransitioning) return; // Ignore raycasts during transition
            if (e.intersections.length > 0) {
              const hit = e.intersections[0];
              setCursorPos(hit.point);
              
              // Convert local face normal to world space normal
              const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
              const worldNormal = hit.face.normal.clone().applyMatrix3(normalMatrix).normalize();
              setCursorNormal(worldNormal);
            }
          }}
          onPointerOut={() => {
            setCursorPos(null);
            setCursorNormal(null);
          }}
        >
          <primitive object={activeScene} />
        </group>
      </group>

      {!isTransitioning && <SurfaceCursor position={cursorPos} normal={cursorNormal} />}
    </>
  );
}
function Hotspot({ position, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 4) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation(); // don't let the click also count as an orbit-drag
    onClick();
  };

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* invisible larger sphere = generous click/touch target */}
      <mesh
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={meshRef}>
        {/* visible ring — flat on floor */}
        <mesh renderOrder={1}>
          <ringGeometry args={[0.3, 0.4, 32]} />
          <meshBasicMaterial
            color={hovered ? "#ffffff" : "#4da3ff"}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
            depthTest={false}
          />
        </mesh>
        {/* soft outer glow */}
        <mesh renderOrder={0}>
          <ringGeometry args={[0.4, 0.6, 32]} />
          <meshBasicMaterial
            color={hovered ? "#ffffff" : "#4da3ff"}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthTest={false}
          />
        </mesh>
        <mesh renderOrder={1}>
          <circleGeometry args={[0.15, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} depthTest={false} />
        </mesh>
      </group>

      {hovered && (
        <Html center distanceFactor={10} position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <div style={pillStyle}>{label}</div>
        </Html>
      )}
    </group>
  );
}

// ---- DYNAMIC HOTSPOTS --------------------------------------------------
function DynamicHotspots({ currentId, onTeleport, tourData }) {
  const { scene } = useGLTF("/models/Penthouse_Mesh.glb");
  const currentPos = tourData[currentId].worldPosition;
  const [visibleHotspots, setVisibleHotspots] = useState([]);
  
  // Raycast to find which cameras have a clear line of sight.
  // We use useEffect with a small timeout to prevent the heavy raycasting 
  // from blocking the main thread and causing jitter at the exact moment the teleport finishes.
  useEffect(() => {
    let isActive = true;
    setVisibleHotspots([]); // Clear old hotspots immediately
    
    const timer = setTimeout(() => {
      const visible = [];
      const raycaster = new THREE.Raycaster();
      const currentPosVec = new THREE.Vector3(...currentPos);
      
      // Crucial: ensure world matrices are updated for the raw GLTF scene before raycasting
      scene.updateMatrixWorld(true);
      
      // Force materials to double-sided temporarily for accurate raycasting against thin walls
      const originalSides = new Map();
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          originalSides.set(child, child.material.side);
          child.material.side = THREE.DoubleSide;
        }
      });
      
      Object.entries(tourData).forEach(([id, data]) => {
        if (id === currentId) return;
        
        const targetPosVec = new THREE.Vector3(...data.worldPosition);
        const dir = new THREE.Vector3().subVectors(targetPosVec, currentPosVec);
        const dist = dir.length();
        dir.normalize();
        
        raycaster.set(currentPosVec, dir);
        const hits = raycaster.intersectObject(scene, true);
        
        // Filter out hits right on top of the camera lens
        const validHits = hits.filter(hit => hit.distance > 0.5);
        
        // If the ray hits a wall before it reaches the target camera (with 0.5m margin), hide it
        if (validHits.length > 0 && validHits[0].distance < dist - 0.5) {
          return; 
        }
        
        visible.push(id);
      });
      
      // Restore materials
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.side = originalSides.get(child);
        }
      });
      
      if (isActive) {
        setVisibleHotspots(visible);
      }
    }, 50);
    
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [currentId, scene, currentPos]);

  return (
    <group rotation={[0, (-180 * Math.PI) / 180, 0]}>
      <group
        position={[
          -currentPos[0],
          -currentPos[1],
          -currentPos[2],
        ]}
      >
        {visibleHotspots.map((id) => {
          const data = tourData[id];
          const targetPos = data.worldPosition;
          
          return (
            <Hotspot 
              key={id} 
              // Place hotspot at the exact GLTF world X/Z, but down 1.6m on the floor relative to current camera
              position={[targetPos[0], currentPos[1] - 1.6, targetPos[2]]} 
              label={data.name || id}
              onClick={() => onTeleport(id)} 
            />
          );
        })}
      </group>
    </group>
  );
}

// ---- CAMERA CONTROLLER ---------------------------------------------------
// Removed zoom effect. Standard 75 FOV is used.

// Custom 2D DragCursor removed in favor of 3D SurfaceCursor


// ---- BOTTOM HOTSPOT BAR (named rooms only) -----------------------------
function HotspotBar({ currentId, onSelect, tourData, orderedIds }) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleCount = isMobile ? 2 : 4;
  
  // Auto-scroll to show current room if it's named and clicked via 3D floor dots
  useEffect(() => {
    const currentIndex = ORDERED_NAMED_IDS.indexOf(currentId);
    if (currentIndex !== -1) {
      if (currentIndex < scrollIndex) {
        setScrollIndex(currentIndex);
      } else if (currentIndex > scrollIndex + (visibleCount - 1)) {
        setScrollIndex(currentIndex - (visibleCount - 1));
      }
    }
  }, [currentId, visibleCount]); 

  const goPrev = () => {
    setScrollIndex(v => Math.max(0, v - 1));
  };

  const goNext = () => {
    setScrollIndex(v => Math.min(orderedIds.length - visibleCount, v + 1));
  };

  const visibleIds = ORDERED_NAMED_IDS.slice(scrollIndex, scrollIndex + visibleCount);
  const tabWidth = isMobile ? 110 : 140;

  return (
    <div style={hotspotBarWrapperStyle}>
      <button 
        style={{...arrowButtonStyle, opacity: scrollIndex === 0 ? 0.3 : 1}} 
        onClick={goPrev} 
        disabled={scrollIndex === 0}
        aria-label="Scroll left"
      >
        ‹
      </button>

      <div style={{ ...hotspotBarScrollStyle, width: "auto", justifyContent: 'center' }}>
        {visibleIds.map((id) => {
          const isActive = id === currentId;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              style={{
                ...hotspotTabStyle,
                ...(isActive ? hotspotTabActiveStyle : {}),
                width: tabWidth, // responsive width
                fontSize: isMobile ? 12 : 14,
                padding: isMobile ? "8px 12px" : "10px 18px",
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {tourData[id].name}
            </button>
          );
        })}
      </div>

      <button 
        style={{...arrowButtonStyle, opacity: scrollIndex >= ORDERED_NAMED_IDS.length - visibleCount ? 0.3 : 1}} 
        onClick={goNext} 
        disabled={scrollIndex >= ORDERED_NAMED_IDS.length - visibleCount}
        aria-label="Scroll right"
      >
        ›
      </button>
    </div>
  );
}

// ---- TOUR CONTROLLER ----------------------------------------------------
function VirtualTourInner({ tourData, orderedIds, meshGlb }) {
  const [currentId, setCurrentId] = useState(ORDERED_NAMED_IDS[0]);
  const [nextId, setNextId] = useState(null);
  const [pendingNextId, setPendingNextId] = useState(null);
  const [fade, setFade] = useState(1); // crossfade progress
  const [showMesh, setShowMesh] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasStartedMobile, setHasStartedMobile] = useState(false);
  const fadingRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMobileStart = () => {
    setHasStartedMobile(true);
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().then(() => {
        if (window.screen.orientation && window.screen.orientation.lock) {
          window.screen.orientation.lock('landscape').catch(e => console.log("Orientation lock failed:", e));
        }
      }).catch(e => console.log("Fullscreen request failed:", e));
    }
  };

  const current = tourData[currentId];

  const teleportTo = (targetId) => {
    if (fadingRef.current || targetId === currentId || pendingNextId) return;
    setPendingNextId(targetId);
  };

  const startTransition = () => {
    if (!pendingNextId) return;
    fadingRef.current = true;
    setNextId(pendingNextId);

    // Medium transition time: ~0.8 seconds (t += 0.02 per frame at 60fps)
    let t = 0;
    const step = () => {
      t += 0.02;
      if (t > 1) t = 1;
      setFade(1 - t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        setCurrentId(pendingNextId);
        setNextId(null);
        setPendingNextId(null);
        setFade(1);
        fadingRef.current = false;
      }
    };
    requestAnimationFrame(step);
  };

  if (isMobile && !hasStartedMobile) {
    return (
      <div style={{ width: "100%", height: "100vh", background: "#111", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
        <h2 style={{ fontSize: 28, marginBottom: 15 }}>3D Walkthrough</h2>
        <p style={{ marginBottom: 40, color: "#aaa", maxWidth: 300 }}>For the best interactive experience, this tour requires fullscreen landscape mode.</p>
        <button 
          onClick={handleMobileStart} 
          style={{ padding: "16px 32px", fontSize: 18, fontWeight: "bold", background: "#3b6fe0", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", boxShadow: "0 4px 15px rgba(59, 111, 224, 0.4)" }}
        >
          Enter VR Tour
        </button>
      </div>
    );
  }

  return (
    <TourErrorBoundary>
      <div style={{ width: "100%", height: "100vh", position: "relative", background: "#111" }}>
        <Canvas 
          camera={{ position: [0, 0, 0.1], fov: 75 }} 
          style={{ cursor: "none" }}
          gl={{ toneMapping: THREE.NoToneMapping }} // Preserves raw image colors without adding contrast/darkness
        >
          <Suspense fallback={<Html center style={{ color: "#fff" }}>Loading panorama…</Html>}>
            
            {/* Background loader for the next panorama so it doesn't flicker */}
            {pendingNextId && (
              <Suspense fallback={null}>
                <PreloadTexture 
                  url={tourData[pendingNextId].panorama} 
                  onLoaded={startTransition} 
                />
              </Suspense>
            )}

            {/* 1. Draw panoramas FIRST (behind everything) with pure crossfade */}
            {!showMesh && (
              <>
                <PanoramaSphere imageUrl={current.panorama} opacity={1} />
                {nextId && (
                  <PanoramaSphere
                    imageUrl={tourData[nextId].panorama}
                    opacity={1 - fade}
                  />
                )}
              </>
            )}

            {/* 2. Draw walls (invisible but write depth) */}
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} />
            <MeshDollhouseView 
              worldPosition={current.worldPosition} 
              showMesh={showMesh} 
              isTransitioning={pendingNextId !== null || nextId !== null} meshGlb={meshGlb} 
            />

            {/* 3. Draw hotspots (dynamic) - Hidden during transition for clean effect */}
            {!pendingNextId && !nextId && (
              <DynamicHotspots currentId={currentId} onTeleport={teleportTo} tourData={tourData} />
            )}

            {/* look-around only, no dolly/zoom-out of the sphere */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              rotateSpeed={-0.3}
            />
          </Suspense>
        </Canvas>

        <div style={hudStyle}>{current.name}</div>

        <button
          style={meshToggleButtonStyle}
          onClick={() => setShowMesh((v) => !v)}
        >
          {showMesh ? "Hide Mesh" : "Show Mesh"}
        </button>

        <HotspotBar currentId={currentId} onSelect={teleportTo} tourData={tourData} orderedIds={orderedIds} />
      </div>
    </TourErrorBoundary>
  );
}

// ---- styles (inline for portability — move to your CSS/Tailwind) -------
const pillStyle = {
  background: "rgba(0,0,0,0.75)",
  color: "#fff",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  whiteSpace: "nowrap",
};

const errorScreenStyle = {
  width: "100%",
  height: "100vh",
  background: "#1a0f0f",
  color: "#ffb4b4",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  fontFamily: "sans-serif",
  gap: 8,
  padding: 20,
};

const meshToggleButtonStyle = {
  position: "absolute",
  top: 20,
  right: 20,
  zIndex: 10,
  background: "#3b6fe0",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: 10,
  fontFamily: "sans-serif",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const hudStyle = {
  position: "absolute",
  top: 20,
  left: 20,
  color: "#fff",
  background: "rgba(0,0,0,0.4)",
  padding: "6px 14px",
  borderRadius: 6,
  fontFamily: "sans-serif",
  fontSize: 14,
  pointerEvents: "none",
};

const hotspotBarWrapperStyle = {
  position: "absolute",
  bottom: 20,
  left: 0,
  right: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "0 16px",
  zIndex: 10,
};

const hotspotBarScrollStyle = {
  display: "flex",
  gap: 10,
  overflowX: "auto",
  maxWidth: "80vw",
  scrollbarWidth: "none",
};

const hotspotTabStyle = {
  flexShrink: 0,
  background: "rgba(20,20,25,0.8)",
  color: "#ddd",
  border: "none",
  padding: "10px 18px",
  borderRadius: 999,
  fontFamily: "sans-serif",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const hotspotTabActiveStyle = {
  background: "#ffffff",
  color: "#000",
};

const arrowButtonStyle = {
  flexShrink: 0,
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "none",
  background: "rgba(20,20,25,0.8)",
  color: "#fff",
  fontSize: 20,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};


export default function VirtualTour({ 
  cameraGltf = "/models/Penthouse_Cameras.gltf", 
  meshGlb = "/models/Penthouse_Mesh.glb", 
  panoramasFolder = "/panoramas" 
}) {
  const [tourData, setTourData] = useState(null);
  const [orderedIds, setOrderedIds] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    new GLTFLoader().load(cameraGltf, (gltf) => {
      try {
        const data = buildTourGraph(gltf.scene, panoramasFolder);
        const ordered = Object.keys(data).filter(id => data[id].isNamed).sort((a, b) => data[a].order - data[b].order);
        setTourData(data);
        setOrderedIds(ordered);
      } catch (err) {
        setError(err);
      }
    }, undefined, (err) => setError(err));
  }, [cameraGltf, panoramasFolder]);

  if (error) {
    return (
      <div style={errorScreenStyle}>
        <h3>Virtual tour couldn't load</h3>
        <p>{String(error.message || error)}</p>
      </div>
    );
  }
  
  if (!tourData) {
    return (
      <div style={errorScreenStyle}>
        <h3>Loading Virtual Tour Data...</h3>
      </div>
    );
  }

  return <VirtualTourInner tourData={tourData} orderedIds={orderedIds} meshGlb={meshGlb} />;
}
