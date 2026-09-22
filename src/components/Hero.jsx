import { motion } from "framer-motion";

import { styles } from "../styles";
import { ComputersCanvas } from "./canvas";

const Hero = () => {
  const textVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.77, 0, 0.17, 1], // Cinematic smooth ease
        delay: i * 0.15,
      },
    }),
  };

  return (
    <section className={`relative w-full h-screen mx-auto overflow-hidden`}>
      <div
        className={`absolute inset-0 top-[120px] max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5 z-10 pointer-events-none`}
      >
        <div className='flex flex-col justify-center items-center mt-5'>
          <div className='w-5 h-5 rounded-full bg-[#915EFF] shadow-[0_0_15px_rgba(145,94,255,0.9)]' />
          <div className='w-1 sm:h-80 h-40 violet-gradient' />
        </div>

        <div className="pointer-events-auto mt-2">
          <div className="overflow-hidden pb-2">
            <motion.h1 
              custom={1}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className={`${styles.heroHeadText} text-white`}
            >
              Hi, I'm <span className='text-[#915EFF] drop-shadow-[0_0_20px_rgba(145,94,255,0.7)]'>Yaswanth</span>
            </motion.h1>
          </div>
          
          <div className="overflow-hidden">
            <motion.p 
              custom={2}
              initial="hidden"
              animate="visible"
              variants={textVariants}
              className={`${styles.heroSubText} mt-2 text-white-100 max-w-2xl font-light leading-relaxed`}
            >
              I specialize in 3D modeling, texturing, and <br className='sm:block hidden' />
              game development using Unreal Engine and Unity, 
              bringing immersive worlds and game-ready assets to life.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 w-full h-full opacity-90 mix-blend-screen pointer-events-auto">
        <ComputersCanvas />
      </div>

      {/* Cinematic vignette overlay on the canvas */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,2,2,0.8)_100%)] z-0" />

      <div className='absolute xs:bottom-10 bottom-32 w-full flex justify-center items-center z-10'>
        <a href='#about'>
          <div className='w-[35px] h-[64px] rounded-3xl border-4 border-white/30 hover:border-white/80 transition-colors flex justify-center items-start p-2 backdrop-blur-sm'>
            <motion.div
              animate={{
                y: [0, 24, 0],
              }}
              transition={{
                duration: 2, // slower cinematic bob
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut"
              }}
              className='w-3 h-3 rounded-full bg-white mb-1 shadow-[0_0_10px_rgba(255,255,255,1)]'
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
