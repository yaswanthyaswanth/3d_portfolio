import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();

  // Disable custom cursor in the virtual tour routes
  const isVirtualTour = location.pathname.startsWith('/tour');
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (isVirtualTour || isTouchDevice) return;

    const updateMousePosition = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    const handleMouseOver = (e) => {
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
  }, [isVirtualTour, isTouchDevice]);

  if (isVirtualTour || isTouchDevice) return null;

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      scale: 1,
    },
    hover: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      scale: 2.5,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      border: "1px solid white"
    }
  };

  return (
    <>
      <style>
        {`
          body {
            cursor: none; /* Hide default cursor */
          }
          a, button, .cursor-pointer {
            cursor: none !important;
          }
        `}
      </style>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full bg-white mix-blend-difference pointer-events-none z-[9999] flex items-center justify-center"
        variants={variants}
        animate={isHovering ? "hover" : "default"}
        transition={{
          type: "tween",
          ease: "backOut",
          duration: 0.15
        }}
      />
    </>
  );
};

export default CustomCursor;
