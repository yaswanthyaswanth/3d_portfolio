import { BrowserRouter, Routes, Route } from "react-router-dom";

import {
  About,
  Contact,
  Experience,
  Feedbacks,
  Hero,
  Navbar,
  Tech,
  Works,
  StarsCanvas,
  Preloader,
} from "./components";

import VirtualTour from "./components/VirtualTour";
import MappingCheck from "./components/MappingCheck";


const Home = () => (
  <div className="relative z-0 bg-primary">
    <Preloader />
    <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center">
      <Navbar />
      <Hero />
    </div>

    <About />
    <Experience />
    <Tech />
    <Works />
    <Feedbacks />

    <div className="relative z-0">
      <Contact />
      <StarsCanvas />
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tour" element={
          <VirtualTour 
            cameraGltf="/models/Penthouse Cameras.gltf" 
            meshGlb="/models/Penthouse_Mesh.glb" 
            panoramasFolder="/panoramas" 
          />
        } />
        <Route path="/mapping-check" element={<MappingCheck />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
