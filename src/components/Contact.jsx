import React from "react";
import { motion } from "framer-motion";

import { styles } from "../styles";
import { EarthCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { slideIn } from "../utils/motion";

const Contact = () => {
  return (
    <div
      className={`xl:mt-12 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden`}
    >
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className='flex-[0.75] bg-black-100 p-8 rounded-2xl'
      >
        <p className={styles.sectionSubText}>Get in touch</p>
        <h3 className={styles.sectionHeadText}>Contact.</h3>

        <div className='mt-12 flex flex-col gap-8'>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <img
                src='/assets/email-icon.png'
                alt='Email Icon'
                className='w-6 h-6 object-contain'
              />
              <span className='text-white font-medium'>Email</span>
            </div>
            <a
              href='mailto:yaswanthyaswanth76@gmail.com'
              className='text-secondary hover:text-white font-medium mt-2'
            >
              yaswanthyaswanth76@gmail.com
            </a>
          </div>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <img
                src='/assets/linkedin-icon.png'
                alt='LinkedIn Icon'
                className='w-6 h-6 object-contain'
              />
              <span className='text-white font-medium'>LinkedIn</span>
            </div>
            <a
              href='https://www.linkedin.com/in/yaswanth-s-844773187/'
              target='_blank'
              rel='noopener noreferrer'
              className='text-secondary hover:text-white font-medium mt-2'
            >
              linkedin.com/in/yaswanth-sundar
            </a>
          </div>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <img
                src='/assets/artstation-icon.png'
                alt='ArtStation Icon'
                className='w-6 h-6 object-contain'
              />
              <span className='text-white font-medium'>ArtStation</span>
            </div>
            <a
              href='https://www.artstation.com/yaswanthsundar'
              target='_blank'
              rel='noopener noreferrer'
              className='text-secondary hover:text-white font-medium mt-2'
            >
              yaswanthsundar.artstation.com
            </a>
          </div>
          <a
            href='https://export-download.canva.com/MFc74/DAFQPuMFc74/118/0-5944091663555493247.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQYCGKMUH5AO7UJ26%2F20250519%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250519T020329Z&X-Amz-Expires=25184&X-Amz-Signature=4e02d74b7b13651a94524b18f126d93f47ed16ff38355d7909d40ffe3d5acb1c&X-Amz-SignedHeaders=host&response-content-disposition=attachment%3B%20filename%2A%3DUTF-8%27%27%2B918838631075.pdf&response-expires=Mon%2C%2019%20May%202025%2009%3A03%3A13%20GMT'
            target='_blank'
            rel='noopener noreferrer'
            className='bg-tertiary py-3 px-8 rounded-xl outline-none w-fit text-white font-bold shadow-md shadow-primary mt-4'
          >
            Download My CV
          </a>
        </div>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className='xl:flex-1 xl:h-auto md:h-[550px] h-[350px]'
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");