import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";

import CanvasLoader from "../Loader";

class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn("WebGL Canvas crashed. Hiding to prevent full page white screen.", error);
  }
  render() {
    if (this.state.hasError) {
      return null; // Fallback: hide the 3D model instead of crashing the app
    }
    return this.props.children;
  }
}

const Computers = ({ isMobile }) => {
  const computer = useGLTF("./desktop_pc/scene.gltf");

  useEffect(() => {
    if (computer.scene) {
      computer.scene.traverse((child) => {
        if (child.isMesh && child.material) {
          // Fix for character hair/transparency sorting issues
          // GLTF often exports hair as transparent = true, which causes depth sorting bugs in WebGL
          if (child.material.transparent) {
            child.material.transparent = false;
            child.material.alphaTest = 0.5; // Discard pixels below 0.5 alpha
            child.material.depthWrite = true;
            child.material.needsUpdate = true;
          }
        }
      });
    }
  }, [computer.scene]);

  return (
    <mesh>
      {/* Realistic lighting setup for character models */}
      <hemisphereLight intensity={0.5} skyColor="#ffffff" groundColor="#444444" />
      <ambientLight intensity={0.5} color="#ffffff" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        position={[-10, -10, -10]}
        intensity={0.5}
        color="#8aaae5"
      />
      
      <primitive
        object={computer.scene}
        scale={isMobile ? 0.55 : 0.65}
        position={isMobile ? [0, -3.5, -3] : [0, -4.5, -2.5]}
        rotation={[-0.01, -0.5, -0.1]}
      />
    </mesh>
  );
};

const ComputersCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 500px)");
    setIsMobile(mediaQuery.matches);

    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <CanvasErrorBoundary>
        <Canvas
          frameloop='always' // required for animated noise
          shadows={!isMobile} 
          dpr={isMobile ? 1 : [1, 2]}
          camera={{ position: [20, 3, 5], fov: 25 }}
          gl={{ 
            preserveDrawingBuffer: false, 
            alpha: true,
            antialias: false, // Turn off MSAA for postprocessing
            powerPreference: "high-performance" 
          }}
          className="touch-pinch-zoom"
        >
          <Suspense fallback={<CanvasLoader />}>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
              minDistance={10}
              maxDistance={50}
              autoRotate={true}
              autoRotateSpeed={0.5} // Slowed down for cinematic feel
            />
            <Computers isMobile={isMobile} />

          </Suspense>
          <Preload all />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
};

export default ComputersCanvas;