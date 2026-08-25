import React, { useEffect, useState } from "react";
import { BallCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";

const Tech = () => {
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let loadedCount = 0;
    const totalImages = technologies.length;

    technologies.forEach((tech) => {
      const img = new Image();
      img.src = tech.icon;
      img.onerror = () => {
        console.error(`Failed to preload icon: ${tech.name}, URL: ${tech.icon}`);
        loadedCount++;
        if (loadedCount === totalImages) setLoaded(true);
      };
      img.onload = () => {
        console.log(`Preloaded icon: ${tech.name}`);
        loadedCount++;
        if (loadedCount === totalImages) setLoaded(true);
      };
    });
    
    // Detect mobile to prevent WebGL context limit crashes on Chrome
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!loaded) return null;

  return (
    <div className='flex flex-row flex-wrap justify-center gap-10'>
      {technologies.map((technology) => (
        <div className='w-28 text-center flex flex-col items-center' key={technology.name}>
          <div className='w-28 h-28 flex justify-center items-center'>
            {isMobile ? (
              <img src={technology.icon} alt={technology.name} className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(145,94,255,0.5)]" />
            ) : (
              <BallCanvas icon={technology.icon} />
            )}
          </div>
          <div className='mt-2'>
            <p className='text-white text-sm font-medium'>{technology.name}</p>
            <div className='mt-1 w-full bg-gray-700 rounded-full h-2'>
              <div
                className='bg-tertiary h-2 rounded-full transition-all duration-500'
                style={{ width: `${technology.percentage}%` }}
              ></div>
            </div>
            <p className='text-secondary text-xs mt-1'>{technology.percentage}%</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SectionWrapper(Tech, "");