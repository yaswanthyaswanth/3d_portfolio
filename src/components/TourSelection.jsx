import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { styles } from "../styles";

const TourCard = ({ title, description, link, index }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="cursor-pointer"
      onClick={() => navigate(link)}
    >
      <div 
        className="w-full p-[1px] rounded-[20px] shadow-card"
        style={{ background: "linear-gradient(144deg, #915EFF, #3b6fe0)" }}
      >
        <div className="bg-tertiary rounded-[20px] py-10 px-12 min-h-[280px] flex justify-center items-center flex-col 
                        transition-all duration-300 hover:bg-black-100 hover:scale-[1.02]">
          
          <div className="w-16 h-16 rounded-full bg-[#915EFF] flex items-center justify-center mb-6 shadow-lg">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          <h3 className="text-white text-[24px] font-bold text-center mb-4">{title}</h3>
          
          <p className="text-secondary text-[14px] text-center leading-[22px]">
            {description}
          </p>

          <button className="mt-8 bg-tertiary border border-[#915EFF] text-white px-6 py-2 rounded-full 
                             hover:bg-[#915EFF] transition-colors duration-300 font-medium text-[14px]">
            Explore 3D
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TourSelection = () => {
  const tours = [
    {
      title: "Haus of Tenet Penthouse",
      description: "A highly detailed luxury penthouse virtual tour with dynamic floor mapping.",
      link: "/tour/penthouse",
    },
    {
      title: "Classic Office",
      description: "A premium 3D visualization of a modern professional office space.",
      link: "/tour/office",
    },
  ];

  return (
    <div className="relative z-0 bg-primary min-h-screen flex items-center justify-center p-6 sm:p-12">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className={`${styles.sectionSubText}`}>Interactive Experiences</p>
          <h2 className={`${styles.sectionHeadText}`}>Select a 3D Walkthrough.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
          {tours.map((tour, index) => (
            <TourCard key={tour.title} index={index} {...tour} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default TourSelection;
