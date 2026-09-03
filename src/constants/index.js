import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  typescript,
  css,
  reactjs,
  redux,
  tailwind,
  meta,
  starbucks,
  tesla,
  shopify,
  mongodb,
  propvr,
} from "../assets";

export const navLinks = [
  { id: "about", title: "About" },
  { id: "work", title: "Work" },
  { id: "contact", title: "Contact" },
];

const services = [
  { title: "Unreal Developer", icon: web },
  { title: "VR/AR Developer", icon: mobile },
  { title: "3D Generalist", icon: backend },
  { title: "Lens Studio developer", icon: creator },
];

const technologies = [
  { name: "Unreal", icon: javascript, percentage: 80 },
  { name: "Blender", icon: css, percentage: 95 },
  { name: "Unity", icon: typescript, percentage: 50 },
  { name: "Gaea", icon: reactjs, percentage: 60 },
  { name: "Lens Studio", icon: redux, percentage: 60 },
  { name: "C++", icon: tailwind, percentage: 50 },
  { name: "Substance Painter", icon: mongodb, percentage: 70 },
];

const experiences = [
  {
    title: "BACHELOR OF COMPUTER SCIENCE ENGINEERING",
    company_name: "SRM Easwari Engineering college",
    icon: starbucks,
    iconBg: "#383E56",
    date: "BATCH 2020 - 2024",
    points: [],
  },
  {
    title: "MASTER CERTIFICATE IN AR/VR",
    company_name: "Monolith Research and TrainingLabs",
    icon: tesla,
    iconBg: "#E6DEDD",
    date: "July 2024 - July 2025",
    points: [],
  },
  {
    title: "3D Generalist (Intern)",
    company_name: "Monolith Asia Technology and Private limited",
    icon: shopify,
    iconBg: "#383E56",
    date: "February 2025 - April 2025",
    points: [
      "Created high-quality 3D models (props, environments, and modular assets) using industry-standard software such as Blender",
      "Unwrapped and textured assets using tools like Substance Painter and Photoshop, maintaining visual fidelity while optimizing for performance.",
      "Reduced polygon counts and baked high-to-low detail maps (normal, AO, roughness, etc.) to ensure smooth performance in real-time engines like Unity and Unreal Engine.",
      "Worked closely with developers and technical artists to ensure seamless integration of assets into VR experiences.",
    ],
  },
  {
    title: "National Level Gameathon (Won 2nd Place)",
    company_name: "REVA University Bangalore",
    icon: meta,
    iconBg: "#E6DEDD",
    date: "April 2025",
    points: [
      "MY Contributions",
      "Level Design: Crafted immersive environments using modular assets and optimized geometry to enhance performance and gameplay flow.",
      "Inventory System: Developed a dynamic inventory system utilizing Unreal Engine's Blueprint scripting for efficient item management.",
      "Performance Optimization: Implemented Level of Detail (LOD) techniques and occlusion culling to ensure smooth gameplay on Oculus Quest.",
    ],
  },
  {
    title: "Environment Artist & Junior Unreal Artist",
    company_name: "PropVR, Bangalore",
    icon: propvr,
    iconBg: "#383E56",
    date: "Feb 2026 ---Present",
    points: [
      "Collaborated in a 15-19 member team to deliver high-quality architectural visualization projects from scratch.",
      "Developed 2 international projects based in Dubai and 1 domestic project, focusing on immersive environment design.",
      "Responsible for 3D modeling, shading, level design, and overall environment creation using Unreal Engine.",
      "Split and managed level design tasks within the team to ensure efficient workflow and optimized performance.",
    ],
  },
];

const testimonials = [];

const projects = [
  {
    name: "",
    description: "",
    tags: [
      { name: "########", color: "blue-text-gradient" },
      { name: "########", color: "green-text-gradient" },
      { name: "#########", color: "pink-text-gradient" },
    ],
    video: "/videos/my-video.mp4",
    source_code_link: "https://www.instagram.com/yasshhh__76?igsh=OGU3eGJqeDByM2Rk",
  },
];

export { services, technologies, experiences, testimonials, projects };