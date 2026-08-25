import { useState, useEffect, useRef, useMemo, Suspense, Component } from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Shared camera rotation baked into every panorama render (constant across
// all 48 gltf camera nodes) — used to rotate the mesh into the same local
// frame as the photo so "Show Mesh" lines up exactly with the photo view.


/**
 * ============================================================
 *  VIRTUAL TOUR — Haus of Tenet Penthouse
 * ============================================================
 *
 * TOUR_DATA below was generated directly from your real
 * `Penthouse_Cameras.gltf` camera nodes — 48 viewpoints total:
 *
 *  - 12 NAMED ROOMS (isNamed: true) — these show up in the
 *    bottom bar as the actual destinations a visitor picks
 *    (CEO Desk, CEO Office Entry, Garden Area, Landscape,
 *    Landscape Stairs, Meeting Table, Outdoor Water Seating,
 *    Passage, Penthouse, Side Wall Entry, Sunken Seating,
 *    Swimming Pool).
 *
 *  - 36 IN-BETWEEN STEPS (isNamed: false, the cam_xxx_NN nodes)
 *    — these don't appear in the bottom bar. They only exist as
 *    floor-dot hotspots so walking between two named rooms feels
 *    like a real walk instead of an instant jump.
 *
 * Each node's `hotspots` array was computed from the REAL 3D
 * distance and direction between that camera and its nearest
 * neighboring cameras in your gltf — so the floor-dot hotspots
 * point in the physically correct direction for each panorama.
 *
 * WHAT YOU STILL NEED TO DO:
 * 1. Put your 48 equirectangular renders in `public/panoramas/`,
 *    named EXACTLY as they are in TOUR_DATA (e.g.
 *    cam_ceo_desk_01.jpg, ceo_office_entry.jpg, etc.) — this
 *    matches the filenames from your renders folder.
 * 2. Since these are real photographic 360 renders (not a
 *    plain sphere), double check hotspot dot positions visually
 *    once images are in — the graph/directions are computed
 *    from real data, but real-world doorways/walls may need a
 *    small manual position nudge here and there.
 * --------------------------------------------------------------
 */

const TOUR_DATA = {
  camOutWaterSeating04: {
    name: "Out Water Seating 04",
    panorama: "/panoramas/cam_out_water_seating_04.jpg",
    isNamed: false,
    worldPosition: [3.1797, -0.0334, 34.7842],
    hotspots: [
      { targetId: "camOutWaterSeating05", position: [-4.07, 0.0, -4.41], label: "Out Water Seating 05" },
      { targetId: "camOutWaterSeating02", position: [-3.63, 0.0, 4.78], label: "Out Water Seating 02" },
      { targetId: "camOutWaterSeating7", position: [-5.98, 0.0, 0.47], label: "Out Water Seating 7" }
    ],
  },
  camOutWaterSeating06: {
    name: "Out Water Seating 06",
    panorama: "/panoramas/cam_out_water_seating_06.jpg",
    isNamed: false,
    worldPosition: [6.7646, -0.0334, 27.4529],
    hotspots: [
      { targetId: "camPassage05", position: [-5.85, 0.01, -1.35], label: "Passage 05" },
      { targetId: "camPassage04", position: [-5.98, 0.0, -0.45], label: "Passage 04" },
      { targetId: "camOutWaterSeating05", position: [6.0, 0.0, -0.01], label: "Out Water Seating 05" },
      { targetId: "camOutWaterSeating7", position: [0.0, 0.0, 6.0], label: "Out Water Seating 7" }
    ],
  },
  camGardenArea10: {
    name: "Garden Area 10",
    panorama: "/panoramas/cam_garden_area_10.jpg",
    isNamed: false,
    worldPosition: [-8.3750, -0.0334, 25.5840],
    hotspots: [
      { targetId: "camOutWaterSeating03", position: [5.74, 0.0, -1.76], label: "Out Water Seating 03" },
      { targetId: "camGardenArea08", position: [-6.0, -0.18, 0.0], label: "Garden Area 08" },
      { targetId: "outWaterSeating", position: [5.92, 0.0, 0.95], label: "Outdoor Water Seating" },
      { targetId: "camGardenArea09", position: [-5.99, -0.37, 0.0], label: "Garden Area 09" }
    ],
  },
  camPassage05: {
    name: "Passage 05",
    panorama: "/panoramas/cam_passage_05.jpg",
    isNamed: false,
    worldPosition: [7.5664, -0.0258, 23.9900],
    hotspots: [
      { targetId: "camOutWaterSeating06", position: [5.85, -0.01, 1.35], label: "Out Water Seating 06" },
      { targetId: "camPassage04", position: [-6.0, 0.0, 0.0], label: "Passage 04" },
      { targetId: "camOutWaterSeating7", position: [3.43, -0.01, 4.92], label: "Out Water Seating 7" }
    ],
  },
  penthouse: {
    name: "Penthouse",
    panorama: "/panoramas/penthouse.jpg",
    isNamed: true,
    order: 0,
    worldPosition: [7.5664, 0.0353, -7.0327],
    hotspots: [
      { targetId: "passage", position: [-5.97, 0.64, 0.0], label: "Passage" },
      { targetId: "camPassage01", position: [6.0, -0.07, -0.0], label: "Passage 01" },
      { targetId: "camPassage02", position: [6.0, -0.03, -0.0], label: "Passage 02" },
      { targetId: "camSwimmingPool01", position: [-3.76, 1.29, -4.5], label: "Swimming Pool 01" }
    ],
  },
  passage: {
    name: "Passage",
    panorama: "/panoramas/passage.jpg",
    isNamed: true,
    order: 1,
    worldPosition: [7.5664, 0.5982, -12.2883],
    hotspots: [
      { targetId: "penthouse", position: [5.97, -0.64, -0.0], label: "Penthouse" },
      { targetId: "swimmingPool", position: [-1.03, -0.05, -5.91], label: "Swimming Pool" },
      { targetId: "camSwimmingPool01", position: [1.96, 0.9, -5.6], label: "Swimming Pool 01" },
      { targetId: "camMeetingTable01", position: [-5.46, 0.06, -2.49], label: "Meeting Table 01" },
      { targetId: "camCeoOfficeEntry03", position: [-5.95, 0.02, 0.79], label: "Ceo Office Entry 03" },
      { targetId: "ceoOfficeEntry", position: [-3.78, -0.81, 4.59], label: "CEO Office Entry" }
    ],
  },
  swimmingPool: {
    name: "Swimming Pool",
    panorama: "/panoramas/swimming_pool.jpg",
    isNamed: true,
    order: 2,
    worldPosition: [12.0010, 0.5579, -13.0630],
    hotspots: [
      { targetId: "passage", position: [1.03, 0.05, 5.91], label: "Passage" },
      { targetId: "camSunkenSeating01", position: [-6.0, 0.11, 0.0], label: "Sunken Seating 01" },
      { targetId: "camSwimmingPool01", position: [5.71, 1.84, -0.0], label: "Swimming Pool 01" },
      { targetId: "camMeetingTable01", position: [-4.92, 0.12, 3.44], label: "Meeting Table 01" }
    ],
  },
  meetingTable: {
    name: "Meeting Table",
    panorama: "/panoramas/meeting_table.jpg",
    isNamed: true,
    order: 3,
    worldPosition: [9.5869, 0.6315, -19.3093],
    hotspots: [
      { targetId: "ceoDesk", position: [-5.69, -0.03, -1.91], label: "CEO Desk" },
      { targetId: "camCeoDesk01", position: [-5.37, -0.04, 2.67], label: "Ceo Desk 01" },
      { targetId: "sunkenSeating", position: [0.57, -1.25, -5.84], label: "Sunken Seating" },
      { targetId: "camMeetingTable01", position: [6.0, 0.03, 0.12], label: "Meeting Table 01" }
    ],
  },
  camGardenArea06: {
    name: "Garden Area 06",
    panorama: "/panoramas/cam_garden_area_06.jpg",
    isNamed: false,
    worldPosition: [-8.3750, -0.2134, 12.9194],
    hotspots: [
      { targetId: "camGardenArea07", position: [6.0, 0.17, 0.16], label: "Garden Area 07" },
      { targetId: "camGardenArea05", position: [-5.59, 0.0, 2.18], label: "Garden Area 05" },
      { targetId: "camGardenArea04", position: [-5.94, 0.0, -0.88], label: "Garden Area 04" }
    ],
  },
  camGardenArea07: {
    name: "Garden Area 07",
    panorama: "/panoramas/cam_garden_area_07.jpg",
    isNamed: false,
    worldPosition: [-8.4648, -0.1185, 16.2417],
    hotspots: [
      { targetId: "camGardenArea06", position: [-6.0, -0.17, -0.16], label: "Garden Area 06" },
      { targetId: "camGardenArea08", position: [6.0, -0.17, -0.16], label: "Garden Area 08" },
      { targetId: "camGardenArea09", position: [6.0, -0.09, -0.08], label: "Garden Area 09" }
    ],
  },
  camPassage01: {
    name: "Passage 01",
    panorama: "/panoramas/cam_passage_01.jpg",
    isNamed: false,
    worldPosition: [7.5664, -0.0258, -1.7004],
    hotspots: [
      { targetId: "penthouse", position: [-6.0, 0.07, 0.0], label: "Penthouse" },
      { targetId: "camPassage02", position: [6.0, 0.0, -0.0], label: "Passage 02" },
      { targetId: "camPassage03", position: [6.0, 0.0, -0.0], label: "Passage 03" },
      { targetId: "camSwimmingPool01", position: [-5.34, 0.79, -2.62], label: "Swimming Pool 01" }
    ],
  },
  ceoDesk: {
    name: "CEO Desk",
    panorama: "/panoramas/ceo_desk.jpg",
    isNamed: true,
    order: 4,
    worldPosition: [10.7568, 0.6139, -22.7971],
    hotspots: [
      { targetId: "meetingTable", position: [5.69, 0.03, 1.91], label: "Meeting Table" },
      { targetId: "camCeoDesk01", position: [-0.49, -0.02, 5.98], label: "Ceo Desk 01" },
      { targetId: "sunkenSeating", position: [5.44, -0.85, -2.39], label: "Sunken Seating" }
    ],
  },
  camPassage02: {
    name: "Passage 02",
    panorama: "/panoramas/cam_passage_02.jpg",
    isNamed: false,
    worldPosition: [7.5664, -0.0258, 3.9016],
    hotspots: [
      { targetId: "penthouse", position: [-6.0, 0.03, 0.0], label: "Penthouse" },
      { targetId: "camPassage01", position: [-6.0, 0.0, 0.0], label: "Passage 01" },
      { targetId: "camPassage03", position: [6.0, 0.0, -0.0], label: "Passage 03" }
    ],
  },
  camLandscape01: {
    name: "Landscape 01",
    panorama: "/panoramas/cam_landscape_01.jpg",
    isNamed: false,
    worldPosition: [-6.0420, -0.2134, -21.1094],
    hotspots: [
      { targetId: "landscape", position: [-0.0, 0.0, -6.0], label: "Landscape" },
      { targetId: "camLandscapeStairs03", position: [-6.0, 0.0, 0.0], label: "Landscape Stairs 03" },
      { targetId: "camCeoOfficeEntry04", position: [6.0, 0.0, 0.15], label: "Ceo Office Entry 04" }
    ],
  },
  landscape: {
    name: "Landscape",
    panorama: "/panoramas/landscape.jpg",
    isNamed: true,
    order: 5,
    worldPosition: [-2.5898, -0.2134, -21.1094],
    hotspots: [
      { targetId: "camLandscape01", position: [0.0, 0.0, 6.0], label: "Landscape 01" },
      { targetId: "camLandscapeStairs03", position: [-4.03, 0.0, 4.45], label: "Landscape Stairs 03" },
      { targetId: "camCeoOfficeEntry01", position: [5.39, 0.08, -2.64], label: "Ceo Office Entry 01" },
      { targetId: "camCeoOfficeEntry02", position: [6.0, 0.0, -0.0], label: "Ceo Office Entry 02" },
      { targetId: "camLandscapeStairs02", position: [-6.0, 0.0, 0.0], label: "Landscape Stairs 02" },
      { targetId: "camLandscapeStairs01", position: [-4.62, 0.0, -3.82], label: "Landscape Stairs 01" }
    ],
  },
  landscapeStairs: {
    name: "Landscape Stairs",
    panorama: "/panoramas/landscape_stairs.jpg",
    isNamed: true,
    order: 6,
    worldPosition: [3.5156, 0.5816, -24.6692],
    hotspots: [
      { targetId: "camCeoDesk01", position: [2.16, 0.03, -5.6], label: "Ceo Desk 01" },
      { targetId: "camLandscapeStairs02", position: [0.0, -0.77, 5.95], label: "Landscape Stairs 02" },
      { targetId: "camLandscapeStairs01", position: [-0.28, -1.52, 5.8], label: "Landscape Stairs 01" }
    ],
  },
  camOutWaterSeating03: {
    name: "Out Water Seating 03",
    panorama: "/panoramas/cam_out_water_seating_03.jpg",
    isNamed: false,
    worldPosition: [-7.4482, -0.0334, 28.6030],
    hotspots: [
      { targetId: "camGardenArea10", position: [-5.74, 0.0, 1.76], label: "Garden Area 10" },
      { targetId: "camOutWaterSeating02", position: [2.26, 0.0, -5.56], label: "Out Water Seating 02" },
      { targetId: "outWaterSeating", position: [5.22, 0.0, 2.95], label: "Outdoor Water Seating" },
      { targetId: "camOutWaterSeating01", position: [5.26, 0.0, -2.89], label: "Out Water Seating 01" },
      { targetId: "camGardenArea09", position: [-5.93, -0.18, 0.93], label: "Garden Area 09" }
    ],
  },
  camLandscapeStairs03: {
    name: "Landscape Stairs 03",
    panorama: "/panoramas/cam_landscape_stairs_03.jpg",
    isNamed: false,
    worldPosition: [-6.0420, -0.2134, -24.2361],
    hotspots: [
      { targetId: "camLandscape01", position: [6.0, 0.0, -0.0], label: "Landscape 01" },
      { targetId: "landscape", position: [4.03, 0.0, -4.45], label: "Landscape" },
      { targetId: "camLandscapeStairs02", position: [-0.75, 0.0, -5.95], label: "Landscape Stairs 02" }
    ],
  },
  camCeoDesk01: {
    name: "Ceo Desk 01",
    panorama: "/panoramas/cam_ceo_desk_01.jpg",
    isNamed: false,
    worldPosition: [7.7285, 0.6062, -23.0437],
    hotspots: [
      { targetId: "meetingTable", position: [5.37, 0.04, -2.67], label: "Meeting Table" },
      { targetId: "ceoDesk", position: [0.49, 0.02, -5.98], label: "CEO Desk" },
      { targetId: "landscapeStairs", position: [-2.16, -0.03, 5.6], label: "Landscape Stairs" }
    ],
  },
  camPassage04: {
    name: "Passage 04",
    panorama: "/panoramas/cam_passage_04.jpg",
    isNamed: false,
    worldPosition: [7.5664, -0.0258, 16.7673],
    hotspots: [
      { targetId: "camOutWaterSeating06", position: [5.98, -0.0, 0.45], label: "Out Water Seating 06" },
      { targetId: "camPassage05", position: [6.0, 0.0, -0.0], label: "Passage 05" },
      { targetId: "camPassage03", position: [-6.0, 0.0, 0.0], label: "Passage 03" }
    ],
  },
  camPassage03: {
    name: "Passage 03",
    panorama: "/panoramas/cam_passage_03.jpg",
    isNamed: false,
    worldPosition: [7.5664, -0.0258, 9.9685],
    hotspots: [
      { targetId: "camPassage01", position: [-6.0, 0.0, 0.0], label: "Passage 01" },
      { targetId: "camPassage02", position: [-6.0, 0.0, 0.0], label: "Passage 02" },
      { targetId: "camPassage04", position: [6.0, 0.0, -0.0], label: "Passage 04" }
    ],
  },
  camCeoOfficeEntry01: {
    name: "Ceo Office Entry 01",
    panorama: "/panoramas/cam_ceo_office_entry_01.jpg",
    isNamed: false,
    worldPosition: [0.0381, -0.1304, -15.7427],
    hotspots: [
      { targetId: "landscape", position: [-5.39, -0.08, 2.64], label: "Landscape" },
      { targetId: "camCeoOfficeEntry02", position: [-0.5, -0.19, 5.98], label: "Ceo Office Entry 02" },
      { targetId: "ceoOfficeEntry", position: [0.19, 0.02, -6.0], label: "CEO Office Entry" }
    ],
  },
  camGardenArea03: {
    name: "Garden Area 03",
    panorama: "/panoramas/cam_garden_area_03.jpg",
    isNamed: false,
    worldPosition: [-11.9961, -0.2134, 4.9954],
    hotspots: [
      { targetId: "camGardenArea05", position: [5.36, 0.0, -2.7], label: "Garden Area 05" },
      { targetId: "camGardenArea04", position: [2.36, 0.0, -5.52], label: "Garden Area 04" },
      { targetId: "camGardenArea02", position: [-6.0, 0.0, 0.05], label: "Garden Area 02" }
    ],
  },
  camGardenArea01: {
    name: "Garden Area 01",
    panorama: "/panoramas/cam_garden_area_01.jpg",
    isNamed: false,
    worldPosition: [-7.1084, -0.2134, 0.4158],
    hotspots: [
      { targetId: "camGardenArea04", position: [5.99, 0.0, 0.35], label: "Garden Area 04" },
      { targetId: "camGardenArea02", position: [0.21, 0.0, 6.0], label: "Garden Area 02" },
      { targetId: "gardenArea", position: [-5.84, 0.0, 1.37], label: "Garden Area" }
    ],
  },
  camSunkenSeating01: {
    name: "Sunken Seating 01",
    panorama: "/panoramas/cam_sunken_seating_01.jpg",
    isNamed: false,
    worldPosition: [12.0010, 0.6022, -15.5161],
    hotspots: [
      { targetId: "swimmingPool", position: [6.0, -0.11, -0.0], label: "Swimming Pool" },
      { targetId: "camSwimmingPool01", position: [5.94, 0.88, -0.0], label: "Swimming Pool 01" },
      { targetId: "sunkenSeating", position: [-5.88, -0.96, -0.68], label: "Sunken Seating" },
      { targetId: "camMeetingTable01", position: [-2.4, 0.1, 5.5], label: "Meeting Table 01" }
    ],
  },
  camGardenArea08: {
    name: "Garden Area 08",
    panorama: "/panoramas/cam_garden_area_08.jpg",
    isNamed: false,
    worldPosition: [-8.3750, -0.2134, 19.5322],
    hotspots: [
      { targetId: "camGardenArea10", position: [6.0, 0.18, -0.0], label: "Garden Area 10" },
      { targetId: "camGardenArea07", position: [-6.0, 0.17, 0.16], label: "Garden Area 07" },
      { targetId: "camGardenArea09", position: [6.0, 0.0, -0.0], label: "Garden Area 09" }
    ],
  },
  camCeoOfficeEntry02: {
    name: "Ceo Office Entry 02",
    panorama: "/panoramas/cam_ceo_office_entry_02.jpg",
    isNamed: false,
    worldPosition: [-2.5898, -0.2134, -15.9604],
    hotspots: [
      { targetId: "landscape", position: [-6.0, 0.0, 0.0], label: "Landscape" },
      { targetId: "camCeoOfficeEntry01", position: [0.5, 0.19, -5.98], label: "Ceo Office Entry 01" },
      { targetId: "camCeoOfficeEntry04", position: [-0.89, 0.0, 5.93], label: "Ceo Office Entry 04" }
    ],
  },
  sideWallEntry: {
    name: "Side Wall Entry",
    panorama: "/panoramas/side_wall_entry.jpg",
    isNamed: true,
    order: 7,
    worldPosition: [-8.1387, -0.1635, -15.0852],
    hotspots: [
      { targetId: "camCeoOfficeEntry04", position: [-3.48, -0.12, -4.88], label: "Ceo Office Entry 04" },
      { targetId: "camSideWallEntry02", position: [6.0, -0.06, 0.11], label: "Side Wall Entry 02" },
      { targetId: "camSideWallEntry01", position: [3.03, -0.1, 5.18], label: "Side Wall Entry 01" }
    ],
  },
  camOutWaterSeating05: {
    name: "Out Water Seating 05",
    panorama: "/panoramas/cam_out_water_seating_05.jpg",
    isNamed: false,
    worldPosition: [6.7695, -0.0334, 31.4644],
    hotspots: [
      { targetId: "camOutWaterSeating04", position: [4.07, 0.0, 4.41], label: "Out Water Seating 04" },
      { targetId: "camOutWaterSeating06", position: [-6.0, 0.0, 0.01], label: "Out Water Seating 06" },
      { targetId: "camOutWaterSeating7", position: [-4.16, 0.0, 4.32], label: "Out Water Seating 7" }
    ],
  },
  camGardenArea05: {
    name: "Garden Area 05",
    panorama: "/panoramas/cam_garden_area_05.jpg",
    isNamed: false,
    worldPosition: [-9.6338, -0.2134, 9.6934],
    hotspots: [
      { targetId: "camGardenArea06", position: [5.59, 0.0, -2.18], label: "Garden Area 06" },
      { targetId: "camGardenArea03", position: [-5.36, 0.0, 2.7], label: "Garden Area 03" },
      { targetId: "camGardenArea04", position: [-4.74, 0.0, -3.67], label: "Garden Area 04" }
    ],
  },
  camCeoOfficeEntry04: {
    name: "Ceo Office Entry 04",
    panorama: "/panoramas/cam_ceo_office_entry_04.jpg",
    isNamed: false,
    worldPosition: [-6.1602, -0.2134, -16.4973],
    hotspots: [
      { targetId: "camLandscape01", position: [-6.0, 0.0, -0.15], label: "Landscape 01" },
      { targetId: "camCeoOfficeEntry02", position: [0.89, 0.0, -5.93], label: "Ceo Office Entry 02" },
      { targetId: "sideWallEntry", position: [3.48, 0.12, 4.88], label: "Side Wall Entry" },
      { targetId: "camSideWallEntry01", position: [3.24, 0.0, 5.05], label: "Side Wall Entry 01" }
    ],
  },
  camGardenArea04: {
    name: "Garden Area 04",
    panorama: "/panoramas/cam_garden_area_04.jpg",
    isNamed: false,
    worldPosition: [-7.4902, -0.2134, 6.9260],
    hotspots: [
      { targetId: "camGardenArea06", position: [5.94, 0.0, 0.88], label: "Garden Area 06" },
      { targetId: "camGardenArea03", position: [-2.36, 0.0, 5.52], label: "Garden Area 03" },
      { targetId: "camGardenArea01", position: [-5.99, 0.0, -0.35], label: "Garden Area 01" },
      { targetId: "camGardenArea05", position: [4.74, 0.0, 3.67], label: "Garden Area 05" }
    ],
  },
  camLandscapeStairs02: {
    name: "Landscape Stairs 02",
    panorama: "/panoramas/cam_landscape_stairs_02.jpg",
    isNamed: false,
    worldPosition: [-2.5898, -0.2134, -24.6692],
    hotspots: [
      { targetId: "landscape", position: [6.0, 0.0, -0.0], label: "Landscape" },
      { targetId: "landscapeStairs", position: [-0.0, 0.77, -5.95], label: "Landscape Stairs" },
      { targetId: "camLandscapeStairs03", position: [0.75, 0.0, 5.95], label: "Landscape Stairs 03" },
      { targetId: "camLandscapeStairs01", position: [-0.29, 0.0, -5.99], label: "Landscape Stairs 01" }
    ],
  },
  camSideWallEntry02: {
    name: "Side Wall Entry 02",
    panorama: "/panoramas/cam_side_wall_entry_02.jpg",
    isNamed: false,
    worldPosition: [-8.2412, -0.2134, -9.6580],
    hotspots: [
      { targetId: "sideWallEntry", position: [-6.0, 0.06, -0.11], label: "Side Wall Entry" },
      { targetId: "gardenArea", position: [6.0, 0.0, -0.0], label: "Garden Area" },
      { targetId: "camSideWallEntry01", position: [-5.08, 0.0, 3.19], label: "Side Wall Entry 01" }
    ],
  },
  camGardenArea02: {
    name: "Garden Area 02",
    panorama: "/panoramas/cam_garden_area_02.jpg",
    isNamed: false,
    worldPosition: [-12.0303, -0.2134, 0.5879],
    hotspots: [
      { targetId: "camGardenArea03", position: [6.0, 0.0, -0.05], label: "Garden Area 03" },
      { targetId: "camGardenArea01", position: [-0.21, 0.0, -6.0], label: "Garden Area 01" },
      { targetId: "gardenArea", position: [-4.79, 0.0, -3.62], label: "Garden Area" }
    ],
  },
  camOutWaterSeating02: {
    name: "Out Water Seating 02",
    panorama: "/panoramas/cam_out_water_seating_02.jpg",
    isNamed: false,
    worldPosition: [-2.0889, -0.0334, 30.7837],
    hotspots: [
      { targetId: "camOutWaterSeating04", position: [3.63, 0.0, -4.78], label: "Out Water Seating 04" },
      { targetId: "camOutWaterSeating03", position: [-2.26, 0.0, 5.56], label: "Out Water Seating 03" },
      { targetId: "camOutWaterSeating7", position: [-3.47, 0.0, -4.89], label: "Out Water Seating 7" },
      { targetId: "camOutWaterSeating01", position: [2.26, 0.0, 5.56], label: "Out Water Seating 01" }
    ],
  },
  outWaterSeating: {
    name: "Outdoor Water Seating",
    panorama: "/panoramas/out_water_seating.jpg",
    isNamed: true,
    order: 8,
    worldPosition: [-9.4229, -0.0334, 32.0974],
    hotspots: [
      { targetId: "camGardenArea10", position: [-5.92, 0.0, -0.95], label: "Garden Area 10" },
      { targetId: "camOutWaterSeating03", position: [-5.22, 0.0, -2.95], label: "Out Water Seating 03" },
      { targetId: "camOutWaterSeating01", position: [0.1, 0.0, -6.0], label: "Out Water Seating 01" }
    ],
  },
  camSwimmingPool01: {
    name: "Swimming Pool 01",
    panorama: "/panoramas/cam_swimming_pool_01.jpg",
    isNamed: false,
    worldPosition: [12.0010, 1.3093, -10.7354],
    hotspots: [
      { targetId: "penthouse", position: [3.76, -1.29, 4.5], label: "Penthouse" },
      { targetId: "passage", position: [-1.96, -0.9, 5.6], label: "Passage" },
      { targetId: "swimmingPool", position: [-5.71, -1.84, 0.0], label: "Swimming Pool" },
      { targetId: "camPassage01", position: [5.34, -0.79, 2.62], label: "Passage 01" },
      { targetId: "camSunkenSeating01", position: [-5.94, -0.88, 0.0], label: "Sunken Seating 01" }
    ],
  },
  gardenArea: {
    name: "Garden Area",
    panorama: "/panoramas/garden_area.jpg",
    isNamed: true,
    order: 9,
    worldPosition: [-8.2412, -0.2134, -4.4270],
    hotspots: [
      { targetId: "camGardenArea01", position: [5.84, 0.0, -1.37], label: "Garden Area 01" },
      { targetId: "camSideWallEntry02", position: [-6.0, 0.0, 0.0], label: "Side Wall Entry 02" },
      { targetId: "camGardenArea02", position: [4.79, 0.0, 3.62], label: "Garden Area 02" }
    ],
  },
  sunkenSeating: {
    name: "Sunken Seating",
    panorama: "/panoramas/sunken_seating.jpg",
    isNamed: true,
    order: 10,
    worldPosition: [12.4082, 0.0262, -19.0356],
    hotspots: [
      { targetId: "meetingTable", position: [-0.57, 1.25, 5.84], label: "Meeting Table" },
      { targetId: "ceoDesk", position: [-5.44, 0.85, 2.39], label: "CEO Desk" },
      { targetId: "camSunkenSeating01", position: [5.88, 0.96, 0.68], label: "Sunken Seating 01" },
      { targetId: "camMeetingTable01", position: [3.83, 0.97, 4.51], label: "Meeting Table 01" }
    ],
  },
  camMeetingTable01: {
    name: "Meeting Table 01",
    panorama: "/panoramas/cam_meeting_table_01.jpg",
    isNamed: false,
    worldPosition: [9.5322, 0.6457, -16.5923],
    hotspots: [
      { targetId: "passage", position: [5.46, -0.06, 2.49], label: "Passage" },
      { targetId: "swimmingPool", position: [4.92, -0.12, -3.44], label: "Swimming Pool" },
      { targetId: "meetingTable", position: [-6.0, -0.03, -0.12], label: "Meeting Table" },
      { targetId: "camSunkenSeating01", position: [2.4, -0.1, -5.5], label: "Sunken Seating 01" },
      { targetId: "sunkenSeating", position: [-3.83, -0.97, -4.51], label: "Sunken Seating" },
      { targetId: "camCeoOfficeEntry03", position: [1.9, -0.09, 5.69], label: "Ceo Office Entry 03" }
    ],
  },
  camOutWaterSeating7: {
    name: "Out Water Seating 7",
    panorama: "/panoramas/cam_out_water_seating_7.jpg",
    isNamed: false,
    worldPosition: [2.6035, -0.0334, 27.4529],
    hotspots: [
      { targetId: "camOutWaterSeating04", position: [5.98, 0.0, -0.47], label: "Out Water Seating 04" },
      { targetId: "camOutWaterSeating06", position: [-0.0, 0.0, -6.0], label: "Out Water Seating 06" },
      { targetId: "camPassage05", position: [-3.43, 0.01, -4.92], label: "Passage 05" },
      { targetId: "camOutWaterSeating05", position: [4.16, 0.0, -4.32], label: "Out Water Seating 05" },
      { targetId: "camOutWaterSeating02", position: [3.47, 0.0, 4.89], label: "Out Water Seating 02" }
    ],
  },
  camCeoOfficeEntry03: {
    name: "Ceo Office Entry 03",
    panorama: "/panoramas/cam_ceo_office_entry_03.jpg",
    isNamed: false,
    worldPosition: [7.1006, 0.6090, -15.7793],
    hotspots: [
      { targetId: "passage", position: [5.95, -0.02, -0.79], label: "Passage" },
      { targetId: "camMeetingTable01", position: [-1.9, 0.09, -5.69], label: "Meeting Table 01" },
      { targetId: "ceoOfficeEntry", position: [0.25, -1.19, 5.88], label: "CEO Office Entry" }
    ],
  },
  camOutWaterSeating01: {
    name: "Out Water Seating 01",
    panorama: "/panoramas/cam_out_water_seating_01.jpg",
    isNamed: false,
    worldPosition: [-5.4922, -0.0334, 32.1641],
    hotspots: [
      { targetId: "camOutWaterSeating03", position: [-5.26, 0.0, 2.89], label: "Out Water Seating 03" },
      { targetId: "camOutWaterSeating02", position: [-2.26, 0.0, -5.56], label: "Out Water Seating 02" },
      { targetId: "outWaterSeating", position: [-0.1, 0.0, 6.0], label: "Outdoor Water Seating" }
    ],
  },
  camGardenArea09: {
    name: "Garden Area 09",
    panorama: "/panoramas/cam_garden_area_09.jpg",
    isNamed: false,
    worldPosition: [-8.3750, -0.2134, 22.6833],
    hotspots: [
      { targetId: "camGardenArea10", position: [5.99, 0.37, -0.0], label: "Garden Area 10" },
      { targetId: "camGardenArea07", position: [-6.0, 0.09, 0.08], label: "Garden Area 07" },
      { targetId: "camOutWaterSeating03", position: [5.93, 0.18, -0.93], label: "Out Water Seating 03" },
      { targetId: "camGardenArea08", position: [-6.0, 0.0, 0.0], label: "Garden Area 08" }
    ],
  },
  ceoOfficeEntry: {
    name: "CEO Office Entry",
    panorama: "/panoramas/ceo_office_entry.jpg",
    isNamed: true,
    order: 11,
    worldPosition: [3.5156, -0.1180, -15.6296],
    hotspots: [
      { targetId: "passage", position: [3.78, 0.81, -4.59], label: "Passage" },
      { targetId: "camCeoOfficeEntry01", position: [-0.19, -0.02, 6.0], label: "Ceo Office Entry 01" },
      { targetId: "camCeoOfficeEntry03", position: [-0.25, 1.19, -5.88], label: "Ceo Office Entry 03" }
    ],
  },
  camLandscapeStairs01: {
    name: "Landscape Stairs 01",
    panorama: "/panoramas/cam_landscape_stairs_01.jpg",
    isNamed: false,
    worldPosition: [0.4775, -0.2134, -24.8169],
    hotspots: [
      { targetId: "landscape", position: [4.62, 0.0, 3.82], label: "Landscape" },
      { targetId: "landscapeStairs", position: [0.28, 1.52, -5.8], label: "Landscape Stairs" },
      { targetId: "camLandscapeStairs02", position: [0.29, 0.0, 5.99], label: "Landscape Stairs 02" }
    ],
  },
  camSideWallEntry01: {
    name: "Side Wall Entry 01",
    panorama: "/panoramas/cam_side_wall_entry_01.jpg",
    isNamed: false,
    worldPosition: [-10.7080, -0.2134, -13.5811],
    hotspots: [
      { targetId: "sideWallEntry", position: [-3.03, 0.1, -5.18], label: "Side Wall Entry" },
      { targetId: "camCeoOfficeEntry04", position: [-3.24, 0.0, -5.05], label: "Ceo Office Entry 04" },
      { targetId: "camSideWallEntry02", position: [5.08, 0.0, -3.19], label: "Side Wall Entry 02" }
    ],
  },
};const ORDERED_NAMED_IDS = Object.keys(TOUR_DATA)
  .filter((id) => TOUR_DATA[id].isNamed)
  .sort((a, b) => TOUR_DATA[a].order - TOUR_DATA[b].order);

// ---- ERROR BOUNDARY (missing panorama images etc.) --------------------
class TourErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("VirtualTour error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={errorScreenStyle}>
          <h3>Virtual tour couldn't load</h3>
          <p style={{ fontSize: 13, opacity: 0.8, maxWidth: 400 }}>
            {String(this.state.error.message || this.state.error)}
          </p>
          <p style={{ fontSize: 12, opacity: 0.6 }}>
            Check that your panorama images exist at the paths set in
            TOUR_DATA (e.g. /panoramas/ceo_office_entry.jpg in your public folder).
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---- THE PANORAMA SPHERE ----------------------------------------------
function PanoramaSphere({ imageUrl, opacity }) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh scale={[-1, 1, 1]}>
      {/* -1 x-scale flips normals inward so we see the inside face */}
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

// ---- MESH VIEW ("Show Mesh" toggle) ------------------------------------
// Loads your real GLB, strips all 63 materials down to one flat gray
// unlit-ish material (matching the reference tool's look), and positions
// the whole mesh relative to the CURRENT viewpoint's real world position —
// so standing in "Passage" shows the mesh exactly as it would look from
// that real camera spot, lined up with the photo.
const FLAT_MESH_MATERIAL = new THREE.MeshStandardMaterial({
  color: "#8a8a8a",
  roughness: 1,
  metalness: 0,
});

const INVISIBLE_MESH_MATERIAL = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

// ---- SURFACE CURSOR (3D Ring + Dot) ------------------------------------
function SurfaceCursor({ position, normal }) {
  const cursorRef = useRef();

  useEffect(() => {
    if (cursorRef.current && position && normal) {
      cursorRef.current.lookAt(position.clone().add(normal));
    }
  }, [position, normal]);

  if (!position) return null;

  return (
    <group ref={cursorRef} position={position} renderOrder={999}>
      {/* Outer Ring */}
      <mesh>
        <ringGeometry args={[0.2, 0.22, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} depthTest={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner Dot/Ring */}
      <mesh>
        <ringGeometry args={[0.04, 0.08, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} depthTest={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// If the mesh view looks rotated relative to the matching photo, adjust
// this value in 90-degree steps (try 90, -90, or 180) until it lines up.


// ---- MESH VIEW ("Show Mesh" toggle) ------------------------------------



function MeshDollhouseView({ worldPosition, showMesh }) {
  const { scene } = useGLTF("/models/Penthouse_Mesh.glb");
  const [cursorPos, setCursorPos] = useState(null);
  const [cursorNormal, setCursorNormal] = useState(null);

  const activeScene = useMemo(() => {
    const cloned = scene.clone(true);
    const material = showMesh ? FLAT_MESH_MATERIAL : INVISIBLE_MESH_MATERIAL;

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = material;
      }
    });

    return cloned;
  }, [scene, showMesh]);

  return (
    <>
      <group rotation={[0, (-180 * Math.PI) / 180, 0]}>
        <group
          position={[
            -worldPosition[0],
            -worldPosition[1],
            -worldPosition[2],
          ]}
          onPointerMove={(e) => {
            if (e.intersections.length > 0) {
              const hit = e.intersections[0];
              setCursorPos(hit.point);
              
              // Convert local face normal to world space normal
              const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
              const worldNormal = hit.face.normal.clone().applyMatrix3(normalMatrix).normalize();
              setCursorNormal(worldNormal);
            }
          }}
          onPointerOut={() => {
            setCursorPos(null);
            setCursorNormal(null);
          }}
        >
          <primitive object={activeScene} />
        </group>
      </group>

      <SurfaceCursor position={cursorPos} normal={cursorNormal} />
    </>
  );
}
function Hotspot({ position, label, onClick }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.elapsedTime * 4) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation(); // don't let the click also count as an orbit-drag
    onClick();
  };

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* invisible larger sphere = generous click/touch target */}
      <mesh
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <group ref={meshRef}>
        {/* visible ring — flat on floor */}
        <mesh renderOrder={1}>
          <ringGeometry args={[0.3, 0.4, 32]} />
          <meshBasicMaterial
            color={hovered ? "#ffffff" : "#4da3ff"}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
            depthTest={false}
          />
        </mesh>
        {/* soft outer glow */}
        <mesh renderOrder={0}>
          <ringGeometry args={[0.4, 0.6, 32]} />
          <meshBasicMaterial
            color={hovered ? "#ffffff" : "#4da3ff"}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthTest={false}
          />
        </mesh>
        <mesh renderOrder={1}>
          <circleGeometry args={[0.15, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} depthTest={false} />
        </mesh>
      </group>

      {hovered && (
        <Html center distanceFactor={10} position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <div style={pillStyle}>{label}</div>
        </Html>
      )}
    </group>
  );
}

// ---- DYNAMIC HOTSPOTS --------------------------------------------------
function DynamicHotspots({ currentId, onTeleport }) {
  const currentPos = TOUR_DATA[currentId].worldPosition;
  
  return (
    <group rotation={[0, (-180 * Math.PI) / 180, 0]}>
      <group
        position={[
          -currentPos[0],
          -currentPos[1],
          -currentPos[2],
        ]}
      >
        {Object.entries(TOUR_DATA).map(([id, data]) => {
          if (id === currentId) return null;
          
          const targetPos = data.worldPosition;
          
          // Calculate distance to current camera
          const dx = targetPos[0] - currentPos[0];
          const dy = targetPos[1] - currentPos[1];
          const dz = targetPos[2] - currentPos[2];
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          
          // Only show hotspots for cameras within 8 meters
          if (dist > 8) return null;
          
          return (
            <Hotspot 
              key={id} 
              // Place hotspot at the exact GLTF world X/Z, but down 1.6m on the floor relative to current camera
              position={[targetPos[0], currentPos[1] - 1.6, targetPos[2]]} 
              label={data.name || id}
              onClick={() => onTeleport(id)} 
            />
          );
        })}
      </group>
    </group>
  );
}

// Custom 2D DragCursor removed in favor of 3D SurfaceCursor


// ---- BOTTOM HOTSPOT BAR (named rooms only) -----------------------------
function HotspotBar({ currentId, onSelect }) {
  const scrollRef = useRef(null);
  const currentIndex = ORDERED_NAMED_IDS.indexOf(currentId);
  const isOnNamedRoom = currentIndex !== -1;

  const goPrev = () => {
    if (!isOnNamedRoom) return;
    const prevIndex = (currentIndex - 1 + ORDERED_NAMED_IDS.length) % ORDERED_NAMED_IDS.length;
    onSelect(ORDERED_NAMED_IDS[prevIndex]);
  };

  const goNext = () => {
    if (!isOnNamedRoom) return;
    const nextIndex = (currentIndex + 1) % ORDERED_NAMED_IDS.length;
    onSelect(ORDERED_NAMED_IDS[nextIndex]);
  };

  return (
    <div style={hotspotBarWrapperStyle}>
      <button style={arrowButtonStyle} onClick={goPrev} aria-label="Previous room">
        ‹
      </button>

      <div ref={scrollRef} style={hotspotBarScrollStyle}>
        {ORDERED_NAMED_IDS.map((id) => {
          const isActive = id === currentId;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              style={{
                ...hotspotTabStyle,
                ...(isActive ? hotspotTabActiveStyle : {}),
              }}
            >
              {TOUR_DATA[id].name}
            </button>
          );
        })}
      </div>

      <button style={arrowButtonStyle} onClick={goNext} aria-label="Next room">
        ›
      </button>
    </div>
  );
}

// ---- TOUR CONTROLLER ----------------------------------------------------
export default function VirtualTour() {
  const [currentId, setCurrentId] = useState(ORDERED_NAMED_IDS[0]);
  const [nextId, setNextId] = useState(null);
  const [fade, setFade] = useState(1); // crossfade progress
  const [showMesh, setShowMesh] = useState(false);
  const fadingRef = useRef(false);

  const current = TOUR_DATA[currentId];

  const teleportTo = (targetId) => {
    if (fadingRef.current || targetId === currentId) return;
    fadingRef.current = true;
    setNextId(targetId);

    // simple crossfade — swap for a GSAP tween if you want easing,
    // since gsap is already in your package.json
    let t = 0;
    const step = () => {
      t += 0.05;
      setFade(1 - t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        setCurrentId(targetId);
        setNextId(null);
        setFade(1);
        fadingRef.current = false;
      }
    };
    requestAnimationFrame(step);
  };

  return (
    <TourErrorBoundary>
      <div style={{ width: "100%", height: "100vh", position: "relative", background: "#111" }}>
        <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }} style={{ cursor: "none" }}>
          <Suspense fallback={<Html center style={{ color: "#fff" }}>Loading panorama…</Html>}>
            {/* Always render mesh for raycasting, toggle visibility inside via showMesh prop */}
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} />
            <MeshDollhouseView worldPosition={current.worldPosition} showMesh={showMesh} />

            {!showMesh && (
              <>
                {/* current panorama, fading out */}
                <PanoramaSphere imageUrl={current.panorama} opacity={fade} />

                {/* next panorama, fading in, only while transitioning */}
                {nextId && (
                  <PanoramaSphere
                    imageUrl={TOUR_DATA[nextId].panorama}
                    opacity={1 - fade}
                  />
                )}
              </>
            )}

            {/* dynamic floor hotspots */}
            <DynamicHotspots currentId={currentId} onTeleport={teleportTo} />

            {/* look-around only, no dolly/zoom-out of the sphere */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              rotateSpeed={-0.3}
            />
          </Suspense>
        </Canvas>

        <div style={hudStyle}>{current.name}</div>

        <button
          style={meshToggleButtonStyle}
          onClick={() => setShowMesh((v) => !v)}
        >
          {showMesh ? "Hide Mesh" : "Show Mesh"}
        </button>

        <HotspotBar currentId={currentId} onSelect={teleportTo} />
      </div>
    </TourErrorBoundary>
  );
}

// ---- styles (inline for portability — move to your CSS/Tailwind) -------
const pillStyle = {
  background: "rgba(0,0,0,0.75)",
  color: "#fff",
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  whiteSpace: "nowrap",
};

const errorScreenStyle = {
  width: "100%",
  height: "100vh",
  background: "#1a0f0f",
  color: "#ffb4b4",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  fontFamily: "sans-serif",
  gap: 8,
  padding: 20,
};

const meshToggleButtonStyle = {
  position: "absolute",
  top: 20,
  right: 20,
  zIndex: 10,
  background: "#3b6fe0",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: 10,
  fontFamily: "sans-serif",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const hudStyle = {
  position: "absolute",
  top: 20,
  left: 20,
  color: "#fff",
  background: "rgba(0,0,0,0.4)",
  padding: "6px 14px",
  borderRadius: 6,
  fontFamily: "sans-serif",
  fontSize: 14,
  pointerEvents: "none",
};

const hotspotBarWrapperStyle = {
  position: "absolute",
  bottom: 20,
  left: 0,
  right: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "0 16px",
  zIndex: 10,
};

const hotspotBarScrollStyle = {
  display: "flex",
  gap: 10,
  overflowX: "auto",
  maxWidth: "80vw",
  scrollbarWidth: "none",
};

const hotspotTabStyle = {
  flexShrink: 0,
  background: "rgba(20,20,25,0.8)",
  color: "#ddd",
  border: "none",
  padding: "10px 18px",
  borderRadius: 999,
  fontFamily: "sans-serif",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const hotspotTabActiveStyle = {
  background: "#ffffff",
  color: "#000",
};

const arrowButtonStyle = {
  flexShrink: 0,
  width: 36,
  height: 36,
  borderRadius: "50%",
  border: "none",
  background: "rgba(20,20,25,0.8)",
  color: "#fff",
  fontSize: 20,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
