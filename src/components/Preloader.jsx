import React, { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

const Preloader = () => {
  const { progress } = useProgress();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If progress reaches 100 or a minimum time has passed to ensure smooth transition
    if (progress === 100) {
      const timeout = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "#050816",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          {/* Professional Circle Loader */}
          <div style={{ position: "relative", width: "100px", height: "100px", marginBottom: "30px" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              style={{
                boxSizing: "border-box",
                position: "absolute",
                width: "100%",
                height: "100%",
                border: "4px solid transparent",
                borderTopColor: "#915EFF",
                borderRightColor: "#915EFF",
                borderRadius: "50%",
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{
                boxSizing: "border-box",
                position: "absolute",
                top: "10px",
                left: "10px",
                width: "80px",
                height: "80px",
                border: "4px solid transparent",
                borderBottomColor: "#00cea8",
                borderLeftColor: "#00cea8",
                borderRadius: "50%",
              }}
            />
          </div>

          <h2 style={{ color: "#ffffff", fontSize: "24px", fontWeight: 600, letterSpacing: "2px", margin: 0 }}>
            YASWANTH
          </h2>
          <p style={{ color: "#aaa6c3", fontSize: "14px", letterSpacing: "4px", marginTop: "8px", textTransform: "uppercase" }}>
            Loading Artist Portfolio
          </p>
          
          {/* Progress bar */}
          <div style={{ width: "200px", height: "2px", backgroundColor: "#151030", marginTop: "30px", borderRadius: "2px", overflow: "hidden" }}>
            <motion.div 
              style={{ height: "100%", backgroundColor: "#915EFF" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
