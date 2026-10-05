import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useLocation } from "react-router-dom";

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();

  const isVirtualTour = location.pathname.startsWith('/tour');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // High-performance motion values
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring physics for the outer ring (creates a smooth trailing effect)
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (isVirtualTour || isTouchDevice) return;

    const updateMousePosition = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      // Check if we are hovering over an interactable element
      if (
        e.target.tagName === 'A' ||
        e.target.tagName === 'BUTTON' ||
        e.target.closest('a') ||
        e.target.closest('button') ||
        e.target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVirtualTour, isTouchDevice, cursorX, cursorY]);

  // Don't render the custom cursor in the virtual tour or on mobile
  if (isVirtualTour || isTouchDevice) return null;

  return (
    <>
      <style>
        {`
          * {
            cursor: none !important; /* Force hide default cursor everywhere */
          }
        `}
      </style>

      {/* Inner Dot - tracks exactly with mouse */}
      <motion.div
        className="fixed top-0 left-0 w-[6px] h-[6px] rounded-full bg-[#915EFF] pointer-events-none z-[9999] shadow-[0_0_10px_rgba(145,94,255,0.8)]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: isHovering ? 0 : 1,
          scale: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Outer Ring - trails smoothly with spring physics */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 rounded-full border-[1.5px] border-[#915EFF]/80 pointer-events-none z-[9998] flex items-center justify-center backdrop-blur-[1px]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 1.6 : 1,
          backgroundColor: isHovering ? "rgba(145, 94, 255, 0.15)" : "rgba(145, 94, 255, 0)",
          borderColor: isHovering ? "rgba(145, 94, 255, 0)" : "rgba(145, 94, 255, 0.8)",
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
};

export default CustomCursor;
