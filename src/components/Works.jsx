import { motion, useScroll, useTransform } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { fadeIn } from "../utils/motion";
import { github, frame } from "../assets";
import { projects } from "../constants";
import { SectionWrapper } from "../hoc";
import { styles } from "../styles";
import { useRef } from "react";

const ProjectCard = ({ index, name, description, tags, video, source_code_link }) => {
  const cardRef = useRef(null);

  // Track scroll progress of the card
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "0.80 end"], // Zoom-out ends when card is 5% visible
  });

  // Map scroll progress (0 to 1) to scale
  const scale = useTransform(scrollYProgress, [0, 1], [3, 1]);

  return (
    <motion.div
      ref={cardRef}
      variants={fadeIn("up", "spring", index * 0.5, 0.75)}
      className="relative w-full overflow-hidden"
    >
      <Tilt
        options={{
          max: 45,
          scale: 1,
          speed: 450,
        }}
        className="bg-tertiary p-5 rounded-2xl sm:w-[900px] w-full mx-auto"
      >
        <motion.div
          style={{ scale }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative w-full frame-container flex items-center justify-center"
        >
          {/* Frame image as an overlay */}
          <img
            src={frame}
            alt="phone-frame"
            className="w-full h-full object-contain absolute top-0 left-0 z-10 frame-image"
          />

          {/* Video playing inside the frame */}
          {video ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-[70%] h-[80%] object-cover absolute video-inside-frame z-0"
            >
              <source src={video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-[70%] h-[80%] object-cover absolute video-inside-frame z-0 bg-gray-500 flex items-center justify-center">
              <p className="text-white">No Video Available</p>
            </div>
          )}

          {/* GitHub link icon */}
          <div className="absolute inset-0 flex justify-end m-3 card-img_hover z-20">
            <div
              onClick={() => window.open(source_code_link, "_blank")}
              className="black-gradient w-10 h-10 rounded-full flex justify-center items-center cursor-pointer"
            >
              <img
                src={github}
                alt="source code"
                className="w-1/2 h-1/2 object-contain"
              />
            </div>
          </div>
        </motion.div>

        {/* Project details */}
        <div className="mt-5">
          <h3 className="text-white font-bold text-[24px]">{name}</h3>
          <p className="mt-2 text-secondary text-[14px]">{description}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <p
              key={`${name}-${tag.name}`}
              className={`text-[14px] ${tag.color}`}
            >
              #{tag.name}
            </p>
          ))}
        </div>
      </Tilt>
    </motion.div>
  );
};

const Works = () => {
  return (
    <>
      <motion.div>
        <p className={`${styles.sectionSubText} `}>My work</p>
        <h2 className={`${styles.sectionHeadText}`}>Projects.</h2>
      </motion.div>

      <div className="w-full flex">
        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-3 text-secondary text-[17px] max-w-3xl leading-[30px]"
        >
          As a 3D artist and Unreal Engine developer, I specialize in creating 
          immersive 3D gaming experiences. My portfolio features a VR zombie
          survival game developed for Meta Quest 3, where I was responsible for 
          designing realistic 3D assets and implementing engaging gameplay 
          mechanics to deliver an intense virtual reality experience. Additionally,
          I've developed various 3D games that emphasize compelling storytelling
          and intuitive design. My work also includes interactive AR filters created
          using Lens Studio, blending 3D artistry with real-time user interaction.
          These projects reflect my ability to tackle complex challenges, 
          adapt to various technologies, and manage projects effectively from 
          conception to completion.
        </motion.p>
      </div>

      <div className="mt-20 flex flex-wrap gap-7">
        {projects.map((project, index) => (
          <ProjectCard key={`project-${index}`} index={index} {...project} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Works, "");