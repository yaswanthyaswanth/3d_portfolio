import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
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
      {/* Ambient Light: Baseline illumination for transparent textures */}
      <ambientLight intensity={0.2} color="#ffffff" />
      {/* Key Light: Strong directional light from right corner, top-down */}
      <spotLight
        position={[20, 50, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2.5}
        castShadow
        shadow-mapSize={1024}
        color="#a276ff" // slight purple tint for cinematic look
      />
      {/* Fill Light: Soft, even lighting to reduce shadows */}
      <spotLight
        position={[-10, 20, 15]}
        angle={0.4}
        penumbra={1}
        intensity={1.0}
        color="#ffffff"
      />
      {/* Back Light: Subtle rim effect for depth */}
      <pointLight
        position={[0, 15, -15]}
        intensity={1.5}
        color="#00e5ff" // cyan rim light
      />
      <primitive
        object={computer.scene}
        scale={isMobile ? 0.6 : 0.75}
        position={isMobile ? [0, -4, -2.2] : [0, -5, -1.5]}
        rotation={[-0.01, -0.8, -0.1]}
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