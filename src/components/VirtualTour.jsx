import { useState, useEffect, useRef, Suspense, Component } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

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
    hotspots: [
      { targetId: "sideWallEntry", position: [-3.03, 0.1, -5.18], label: "Side Wall Entry" },
      { targetId: "camCeoOfficeEntry04", position: [-3.24, 0.0, -5.05], label: "Ceo Office Entry 04" },
      { targetId: "camSideWallEntry02", position: [5.08, 0.0, -3.19], label: "Side Wall Entry 02" }
    ],
  },
};
const ORDERED_NAMED_IDS = Object.keys(TOUR_DATA)
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

// ---- IN-SCENE FLOOR-DOT HOTSPOT ----------------------------------------
function Hotspot({ position, label, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial
          color={hovered ? "#ffffff" : "#4da3ff"}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <circleGeometry args={[0.12, 24]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.95} />
      </mesh>
      {hovered && (
        <Html center distanceFactor={10} position={[0, 0.6, 0]}>
          <div style={pillStyle}>{label}</div>
        </Html>
      )}
    </group>
  );
}

// ---- CUSTOM LOOK-AROUND CURSOR -----------------------------------------
// Purely visual — listens on `window` passively so it never blocks
// drag events meant for OrbitControls underneath it.
function DragCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const handleMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    const handleDown = () => setDragging(true);
    const handleUp = () => setDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  return (
    <div style={cursorLayerStyle}>
      <div
        style={{
          ...cursorRingStyle,
          left: pos.x,
          top: pos.y,
          transform: `translate(-50%, -50%) scale(${dragging ? 0.7 : 1})`,
          background: dragging ? "rgba(255,255,255,0.25)" : "transparent",
        }}
      />
    </div>
  );
}

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
            {/* current panorama, fading out */}
            <PanoramaSphere imageUrl={current.panorama} opacity={fade} />

            {/* next panorama, fading in, only while transitioning */}
            {nextId && (
              <PanoramaSphere
                imageUrl={TOUR_DATA[nextId].panorama}
                opacity={1 - fade}
              />
            )}

            {current.hotspots.map((h) => (
              <Hotspot
                key={h.targetId}
                position={h.position}
                label={h.label}
                onClick={() => teleportTo(h.targetId)}
              />
            ))}

            {/* look-around only, no dolly/zoom-out of the sphere */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              rotateSpeed={-0.3}
            />
          </Suspense>
        </Canvas>

        <DragCursor />

        <div style={hudStyle}>{current.name}</div>

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

const cursorLayerStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 5,
  cursor: "none",
  pointerEvents: "none",
};

const cursorRingStyle = {
  position: "fixed",
  width: 46,
  height: 46,
  borderRadius: "50%",
  border: "2px solid rgba(255,255,255,0.8)",
  pointerEvents: "none",
  transition: "transform 0.1s ease, background 0.15s ease",
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
