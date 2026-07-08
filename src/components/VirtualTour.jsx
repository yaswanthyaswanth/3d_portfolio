import { useState, useRef, useMemo, Suspense } from "react";
import { Canvas, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * ============================================================
 *  VIRTUAL TOUR SYSTEM (Matterport-style)
 * ============================================================
 *
 * How it works:
 * 1. `TOUR_DATA` defines every "viewpoint" (a 360 panorama).
 *    Each viewpoint has a position (from your GLTF camera nodes),
 *    a panorama image, hotspots to teleport to other viewpoints,
 *    and interactive "touch" points on objects in the scene.
 *
 * 2. A giant inverted sphere is textured with the equirectangular
 *    360 image — you're standing inside it looking out.
 *
 * 3. Hotspots are small 3D rings placed in that sphere. Clicking
 *    one crossfades to the next viewpoint's panorama.
 *
 * 4. Interactive points use the same technique but open an info
 *    card (Html from drei) instead of teleporting — this is your
 *    "touch and feel" layer (e.g. click a sofa -> see material info).
 *
 * --------------------------------------------------------------
 * GETTING YOUR CAMERA POINTS FROM GLTF:
 * In Blender, place an Empty (or Camera) at each spot you want a
 * 360 render taken from, name them clearly (e.g. "CamPoint_LivingRoom"),
 * export as GLTF, then render a 360 panorama from that exact spot
 * (Blender: set camera to "Panoramic" > "Equirectangular").
 * That keeps your dollhouse model and your panoramas spatially aligned.
 * --------------------------------------------------------------
 */

// ---- 1. TOUR DATA -------------------------------------------------
// Replace positions/images with your real camera points + renders.
const TOUR_DATA = {
  livingRoom: {
    name: "Living Room",
    panorama: "/panoramas/living-room.jpg",
    position: [0, 1.6, 0], // matches your GLTF camera node position
    hotspots: [
      { targetId: "kitchen", position: [8, -1, -3], label: "Kitchen" },
      { targetId: "hallway", position: [-6, -1, 4], label: "Hallway" },
    ],
    touchPoints: [
      {
        position: [3, -1.5, -2],
        label: "Sofa",
        info: "Custom-modeled sofa — 2,400 tris, PBR materials.",
      },
    ],
  },
  kitchen: {
    name: "Kitchen",
    panorama: "/panoramas/kitchen.jpg",
    position: [10, 1.6, -3],
    hotspots: [
      { targetId: "livingRoom", position: [-8, -1, 3], label: "Living Room" },
    ],
    touchPoints: [],
  },
  hallway: {
    name: "Hallway",
    panorama: "/panoramas/hallway.jpg",
    position: [-8, 1.6, 5],
    hotspots: [
      { targetId: "livingRoom", position: [6, -1, -4], label: "Living Room" },
    ],
    touchPoints: [],
  },
};

// ---- 2. THE PANORAMA SPHERE ---------------------------------------
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

// ---- 3. A TELEPORT HOTSPOT ----------------------------------------
function Hotspot({ position, label, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <ringGeometry args={[0.4, 0.6, 32]} />
        <meshBasicMaterial
          color={hovered ? "#ffffff" : "#4da3ff"}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
      {hovered && (
        <Html center distanceFactor={10}>
          <div style={pillStyle}>{label}</div>
        </Html>
      )}
    </group>
  );
}

// ---- 4. A "TOUCH AND FEEL" INTERACTIVE POINT -----------------------
function TouchPoint({ position, label, info }) {
  const [open, setOpen] = useState(false);

  return (
    <group position={position}>
      <mesh onClick={() => setOpen((v) => !v)}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color="#ff9d4d" transparent opacity={0.9} />
      </mesh>
      {open && (
        <Html center distanceFactor={8}>
          <div style={cardStyle}>
            <strong>{label}</strong>
            <p style={{ margin: "4px 0 0", fontSize: 12 }}>{info}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ---- 5. THE OPTIONAL DOLLHOUSE MODEL (overview map) -----------------
function DollhouseModel({ url, onSelectViewpoint }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} onClick={onSelectViewpoint} />;
}

// ---- 6. TOUR CONTROLLER --------------------------------------------
export default function VirtualTour({ glbUrl }) {
  const [currentId, setCurrentId] = useState("livingRoom");
  const [nextId, setNextId] = useState(null);
  const [fade, setFade] = useState(1); // crossfade progress
  const fadingRef = useRef(false);

  const current = TOUR_DATA[currentId];

  const teleportTo = (targetId) => {
    if (fadingRef.current || targetId === currentId) return;
    fadingRef.current = true;
    setNextId(targetId);

    // simple crossfade using state + rAF (swap in a tween lib like GSAP
    // if you want easing — you already have gsap in package.json)
    let t = 0;
    const step = () => {
      t += 0.04;
      setFade(1 - t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        setCurrentId(targetId);
        setNextId(null);
        setFade(1);
        fadingRef.current = false;
      }
    };
    requestAnimationFrame(step);
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
        <Suspense fallback={null}>
          {/* current panorama, fading out */}
          <PanoramaSphere imageUrl={current.panorama} opacity={fade} />

          {/* next panorama, fading in, only while transitioning */}
          {nextId && (
            <PanoramaSphere
              imageUrl={TOUR_DATA[nextId].panorama}
              opacity={1 - fade}
            />
          )}

          {current.hotspots.map((h) => (
            <Hotspot
              key={h.targetId}
              position={h.position}
              label={h.label}
              onClick={() => teleportTo(h.targetId)}
            />
          ))}

          {current.touchPoints.map((tp, i) => (
            <TouchPoint key={i} {...tp} />
          ))}

          {/* look-around only, no dolly/zoom-out of the sphere */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={-0.3}
          />
        </Suspense>
      </Canvas>

      <div style={hudStyle}>{current.name}</div>
    </div>
  );
}

// ---- styles (inline for portability — move to your CSS/Tailwind) ----
const pillStyle = {
  background: "rgba(0,0,0,0.75)",
  color: "#fff",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  whiteSpace: "nowrap",
};

const cardStyle = {
  background: "rgba(15,15,25,0.9)",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 8,
  width: 180,
  fontSize: 13,
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
