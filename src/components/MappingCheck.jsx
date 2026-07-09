import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";

/**
 * ============================================================
 *  MAPPING CHECK — GLB mesh + real GLTF camera positions
 * ============================================================
 * Purpose: verify the mesh and every camera node line up
 * correctly in the same 3D space BEFORE wiring in renders or
 * navigation logic. Drag to orbit, scroll to zoom.
 *
 * - White dots = in-between walking steps (cam_xxx_NN)
 * - Blue dots  = named rooms (the 12 bottom-bar destinations)
 * - Click any dot to see its exact name + position confirmed
 *
 * Put Penthouse_Mesh.glb in your `public/models/` folder,
 * matching the path used below.
 */

const CAMERA_MARKERS = [
  { name: "cam_out_water_seating_04", position: [3.1797, -0.0334, 34.7842], isNamed: false },
  { name: "cam_out_water_seating_06", position: [6.7646, -0.0334, 27.4529], isNamed: false },
  { name: "cam_garden_area_10", position: [-8.3750, -0.0334, 25.5840], isNamed: false },
  { name: "cam_passage_05", position: [7.5664, -0.0258, 23.9900], isNamed: false },
  { name: "penthouse", position: [7.5664, 0.0353, -7.0327], isNamed: true },
  { name: "passage", position: [7.5664, 0.5982, -12.2883], isNamed: true },
  { name: "swimming_pool", position: [12.0010, 0.5579, -13.0630], isNamed: true },
  { name: "meeting_table", position: [9.5869, 0.6315, -19.3093], isNamed: true },
  { name: "cam_garden_area_06", position: [-8.3750, -0.2134, 12.9194], isNamed: false },
  { name: "cam_garden_area_07", position: [-8.4648, -0.1185, 16.2417], isNamed: false },
  { name: "cam_passage_01", position: [7.5664, -0.0258, -1.7004], isNamed: false },
  { name: "ceo_desk", position: [10.7568, 0.6139, -22.7971], isNamed: true },
  { name: "cam_passage_02", position: [7.5664, -0.0258, 3.9016], isNamed: false },
  { name: "cam_landscape_01", position: [-6.0420, -0.2134, -21.1094], isNamed: false },
  { name: "landscape", position: [-2.5898, -0.2134, -21.1094], isNamed: true },
  { name: "landscape_stairs", position: [3.5156, 0.5816, -24.6692], isNamed: true },
  { name: "cam_out_water_seating_03", position: [-7.4482, -0.0334, 28.6030], isNamed: false },
  { name: "cam_landscape_stairs_03", position: [-6.0420, -0.2134, -24.2361], isNamed: false },
  { name: "cam_ceo_desk_01", position: [7.7285, 0.6062, -23.0437], isNamed: false },
  { name: "cam_passage_04", position: [7.5664, -0.0258, 16.7673], isNamed: false },
  { name: "cam_passage_03", position: [7.5664, -0.0258, 9.9685], isNamed: false },
  { name: "cam_ceo_office_entry_01", position: [0.0381, -0.1304, -15.7427], isNamed: false },
  { name: "cam_garden_area_03", position: [-11.9961, -0.2134, 4.9954], isNamed: false },
  { name: "cam_garden_area_01", position: [-7.1084, -0.2134, 0.4158], isNamed: false },
  { name: "cam_sunken_seating_01", position: [12.0010, 0.6022, -15.5161], isNamed: false },
  { name: "cam_garden_area_08", position: [-8.3750, -0.2134, 19.5322], isNamed: false },
  { name: "cam_ceo_office_entry_02", position: [-2.5898, -0.2134, -15.9604], isNamed: false },
  { name: "side_wall_entry", position: [-8.1387, -0.1635, -15.0852], isNamed: true },
  { name: "cam_out_water_seating_05", position: [6.7695, -0.0334, 31.4644], isNamed: false },
  { name: "cam_garden_area_05", position: [-9.6338, -0.2134, 9.6934], isNamed: false },
  { name: "cam_ceo_office_entry_04", position: [-6.1602, -0.2134, -16.4973], isNamed: false },
  { name: "cam_garden_area_04", position: [-7.4902, -0.2134, 6.9260], isNamed: false },
  { name: "cam_landscape_stairs_02", position: [-2.5898, -0.2134, -24.6692], isNamed: false },
  { name: "cam_side_wall_entry_02", position: [-8.2412, -0.2134, -9.6580], isNamed: false },
  { name: "cam_garden_area_02", position: [-12.0303, -0.2134, 0.5879], isNamed: false },
  { name: "cam_out_water_seating_02", position: [-2.0889, -0.0334, 30.7837], isNamed: false },
  { name: "out_water_seating", position: [-9.4229, -0.0334, 32.0974], isNamed: true },
  { name: "cam_swimming_pool_01", position: [12.0010, 1.3093, -10.7354], isNamed: false },
  { name: "garden_area", position: [-8.2412, -0.2134, -4.4270], isNamed: true },
  { name: "sunken_seating", position: [12.4082, 0.0262, -19.0356], isNamed: true },
  { name: "cam_meeting_table_01", position: [9.5322, 0.6457, -16.5923], isNamed: false },
  { name: "cam_out_water_seating_7", position: [2.6035, -0.0334, 27.4529], isNamed: false },
  { name: "cam_ceo_office_entry_03", position: [7.1006, 0.6090, -15.7793], isNamed: false },
  { name: "cam_out_water_seating_01", position: [-5.4922, -0.0334, 32.1641], isNamed: false },
  { name: "cam_garden_area_09", position: [-8.3750, -0.2134, 22.6833], isNamed: false },
  { name: "ceo_office_entry", position: [3.5156, -0.1180, -15.6296], isNamed: true },
  { name: "cam_landscape_stairs_01", position: [0.4775, -0.2134, -24.8169], isNamed: false },
  { name: "cam_side_wall_entry_01", position: [-10.7080, -0.2134, -13.5811], isNamed: false },
];
function PenthouseMesh() {
  const { scene } = useGLTF("/models/Penthouse_Mesh.glb");
  return <primitive object={scene} />;
}

function CameraMarker({ marker, onSelect, isSelected }) {
  const [hovered, setHovered] = useState(false);
  const color = marker.isNamed ? "#4da3ff" : "#ffffff";
  const size = marker.isNamed ? 0.35 : 0.18;

  return (
    <group position={marker.position}>
      <mesh
        onClick={() => onSelect(marker)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? "#ffcc00" : hovered ? "#ffffff" : color}
        />
      </mesh>
      {(hovered || isSelected) && (
        <Html center distanceFactor={15} position={[0, size + 0.3, 0]}>
          <div style={labelStyle}>{marker.name}</div>
        </Html>
      )}
    </group>
  );
}

export default function MappingCheck() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", background: "#0a0a0f" }}>
      <Canvas camera={{ position: [30, 25, 30], fov: 50 }}>
        <Suspense fallback={<Html center style={{ color: "#fff" }}>Loading mesh…</Html>}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 20, 10]} intensity={1} />

          <PenthouseMesh />

          {CAMERA_MARKERS.map((m) => (
            <CameraMarker
              key={m.name}
              marker={m}
              onSelect={setSelected}
              isSelected={selected?.name === m.name}
            />
          ))}

          <OrbitControls makeDefault />
        </Suspense>
      </Canvas>

      <div style={hudStyle}>
        <strong>Mapping check</strong>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
          🔵 named room &nbsp; ⚪ walking step
        </div>
        {selected && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            <div><strong>{selected.name}</strong></div>
            <div style={{ opacity: 0.7 }}>
              [{selected.position.map((v) => v.toFixed(2)).join(", ")}]
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  background: "rgba(0,0,0,0.8)",
  color: "#fff",
  padding: "3px 8px",
  borderRadius: 4,
  fontSize: 11,
  whiteSpace: "nowrap",
  fontFamily: "sans-serif",
};

const hudStyle = {
  position: "absolute",
  top: 20,
  left: 20,
  color: "#fff",
  background: "rgba(0,0,0,0.5)",
  padding: "12px 16px",
  borderRadius: 8,
  fontFamily: "sans-serif",
  fontSize: 14,
  minWidth: 180,
};
