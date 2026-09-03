import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { textVariant } from "../utils/motion";

const imageComparisons = [
  {
    title: "M762 Gun Model",
    description: "#Blender #substance",
    beforeImage: "before1.jpg",
    afterImage: "after1.jpg",
  },
  {
    title: "(Ref)Dragon Booster",
    description: "#Blender #ToonShader",
    beforeImage: "before2.jpg",
    afterImage: "after2.jpg",
  },
  {
    title: "Forklift Truck",
    description: "#Blender #substance",
    beforeImage: "before3.jpg",
    afterImage: "after3.jpg",
  },
  {
    title: "WOODEN_WAGON",
    description: "#Blender",
    beforeImage: "before4.jpg",
    afterImage: "after4.jpg",
  },
];

const projectShowcase1 = [
  {
    title: "Sci-Fi Environment",
    description: "A futuristic cityscape created in Blender",
    image: "project1.jpg",
  },
  {
    title: "Character Model",
    description: "High-detail character for VR game",
    image: "project2.jpg",
  },
  {
    title: "AR Lens Effect",
    description: "Interactive lens for Snapchat",
    image: "project3.jpg",
  },
  {
    title: "Unreal Engine Level",
    description: "Optimized level for Oculus Quest",
    image: "project4.jpg",
  },
];

const projectShowcase2 = [
  {
    title: "Medieval Village",
    description: "Low-poly village scene in Unity",
    image: "project5.jpg",
  },
  {
    title: "Robot Concept",
    description: "Futuristic robot model in Blender",
    image: "project6.jpg",
  },
  {
    title: "VR Puzzle Game",
    description: "Interactive puzzle for VR",
    image: "project7.jpg",
  },
  {
    title: "Fantasy Creature",
    description: "Sculpted creature in ZBrush",
    image: "project8.jpg",
  },
];

const projectShowcase3 = [
  {
    title: "Space Station",
    description: "Modular space station in Unreal Engine",
    image: "project9.jpg",
  },
  {
    title: "Cyberpunk Street",
    description: "Neon-lit street scene in Blender",
    image: "project10.jpg",
  },
  {
    title: "AR Filter",
    description: "Custom AR filter for Instagram",
    image: "project11.jpg",
  },
  {
    title: "Animated Character",
    description: "Rigged character with animations",
    image: "project12.jpg",
  },
];

const Feedbacks = () => {
  const [sliderPositions, setSliderPositions] = useState(
    imageComparisons.map(() => 50)
  );
  const [activeSection, setActiveSection] = useState("showcase1");
  const containerRefs = useRef([]);

  const handleSliderStart = (index, clientX, isTouch = false) => {
    const container = containerRefs.current[index];
    if (!container) return;

    const handleMove = (moveClientX) => {
      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(moveClientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;

      setSliderPositions((prev) => {
        const newPositions = [...prev];
        newPositions[index] = percentage;
        return newPositions;
      });
    };

    const handleMouseMove = (e) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX);
    };

    const handleEnd = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };

    if (isTouch) {
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    } else {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
    }
  };

  const handleMouseDown = (index, e) => {
    e.preventDefault();
    handleSliderStart(index, e.clientX, false);
  };

  const handleTouchStart = (index, e) => {
    handleSliderStart(index, e.touches[0].clientX, true);
  };

  const getContent = () => {
    switch (activeSection) {
      case "beforeAfter":
        return imageComparisons.map((comparison, index) => (
          <div key={index} className="bg-black-200 p-5 rounded-3xl">
            <div
              className="relative w-full h-[400px] rounded-xl overflow-hidden"
              ref={(el) => (containerRefs.current[index] = el)}
            >
              <img
                src={`/images/${comparison.beforeImage}`}
                alt={`Before ${comparison.title}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(0 ${100 - sliderPositions[index]}% 0 0)`,
                }}
              >
                <img
                  src={`/images/${comparison.afterImage}`}
                  alt={`After ${comparison.title}`}
                  className="w-full h-full object-cover"
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
              </div>
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
                style={{ left: `${sliderPositions[index]}%` }}
                onMouseDown={(e) => handleMouseDown(index, e)}
                onTouchStart={(e) => handleTouchStart(index, e)}
              >
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-5 h-10 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1 h-5 bg-gray-800"></div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                {Math.round(sliderPositions[index])}%
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-white font-medium text-lg">{comparison.title}</h3>
              <p className="text-secondary text-sm mt-1">{comparison.description}</p>
            </div>
          </div>
        ));
      case "showcase1":
        return projectShowcase1.map((project, index) => (
          <div key={index} className="bg-black-200 p-5 rounded-3xl">
            <img
              src={`/images/${project.image}`}
              alt={project.title}
              className="w-full h-[400px] object-cover rounded-xl"
            />
            <div className="mt-4">
              <h3 className="text-white font-medium text-lg">{project.title}</h3>
              <p className="text-secondary text-sm mt-1">{project.description}</p>
            </div>
          </div>
        ));
      case "showcase2":
        return projectShowcase2.map((project, index) => (
          <div key={index} className="bg-black-200 p-5 rounded-3xl">
            <img
              src={`/images/${project.image}`}
              alt={project.title}
              className="w-full h-[400px] object-cover rounded-xl"
            />
            <div className="mt-4">
              <h3 className="text-white font-medium text-lg">{project.title}</h3>
              <p className="text-secondary text-sm mt-1">{project.description}</p>
            </div>
          </div>
        ));
      case "showcase3":
        return projectShowcase3.map((project, index) => (
          <div key={index} className="bg-black-200 p-5 rounded-3xl">
            <img
              src={`/images/${project.image}`}
              alt={project.title}
              className="w-full h-[400px] object-cover rounded-xl"
            />
            <div className="mt-4">
              <h3 className="text-white font-medium text-lg">{project.title}</h3>
              <p className="text-secondary text-sm mt-1">{project.description}</p>
            </div>
          </div>
        ));
      default:
        return [];
    }
  };

  return (
    <div className={`mt-12 bg-black-100 rounded-[20px]`}>
      <div className={`bg-tertiary rounded-2xl ${styles.padding} min-h-[300px]`}>
        <motion.div variants={textVariant()}>
          <p className={styles.sectionSubText}>My Work</p>
          <h2 className={styles.heroSubText}>Projects & Transformations</h2>
        </motion.div>
        <div className="mt-12 flex gap-8 flex-wrap justify-center">
          <button
            onClick={() => setActiveSection("showcase1")}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              activeSection === "showcase1"
                ? "bg-tertiary text-white"
                : "bg-black-200 text-secondary hover:bg-black-200/80"
            }`}
          >
            Unreal
          </button>
          <button
            onClick={() => setActiveSection("beforeAfter")}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              activeSection === "beforeAfter"
                ? "bg-tertiary text-white"
                : "bg-black-200 text-secondary hover:bg-black-200/80"
            }`}
          >
            Blender
          </button>
          <button
            onClick={() => setActiveSection("showcase2")}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              activeSection === "showcase2"
                ? "bg-tertiary text-white"
                : "bg-black-200 text-secondary hover:bg-black-200/80"
            }`}
          >
            2D Game
          </button>
          <button
            onClick={() => setActiveSection("showcase3")}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              activeSection === "showcase3"
                ? "bg-tertiary text-white"
                : "bg-black-200 text-secondary hover:bg-black-200/80"
            }`}
          >
            3d Game
          </button>
        </div>
      </div>
      <div className={`pb-14 ${styles.paddingX}`}>
        <motion.div
          key={activeSection}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "tween", duration: 0.5 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {getContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default SectionWrapper(Feedbacks, "feedbacks");