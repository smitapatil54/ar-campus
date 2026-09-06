import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line, Text } from "@react-three/drei";
import * as THREE from "three";

/*
  Campus3D.jsx
  ------------------------------------------------------------------
  MHSSCOE / AR CAMPUS - interactive 3D campus prototype.

  Reference experience:
  - Free orbit / zoom / pan like the supplied Queen's College model.
  - High/top/low/rear camera views.
  - Main central block + clearly separated left/right wings.
  - Roofs and upper structures are visible from top view.
  - Main/student/service/exit gates and approach paths.
  - Visible stairs with individual steps and landings.
  - Cutaway floor maps with classrooms/labs/corridors/lifts.
  - Blue route from current location to destination.
  - Navigation keeps the same public props used by the existing page.

  Important:
  The geometry is a prototype reconstruction, not a survey-grade floor plan.
  Exact room coordinates should be replaced when an official CAD/floor plan
  is available. The official college site confirms a Ground + five-floor
  main building and separate facilities such as the library/cafeteria.
*/

const C = {
  sky: "#dcecf5",
  ground: "#e7e4dd",
  road: "#c8c8c4",
  path: "#d5b9a5",
  wall: "#e7ded3",
  wall2: "#f0e7dc",
  stone: "#78685f",
  brick: "#a9674d",
  brickDark: "#724536",
  roof: "#62524c",
  roofLight: "#80675d",
  glass: "#79a8b4",
  window: "#5c7d85",
  railing: "#5a3d34",
  metal: "#4b5157",
  wood: "#80604f",
  green: "#4e7e55",
  green2: "#67966a",
  blue: "#2f6fed",
  blue2: "#73a8ff",
  red: "#dc4c4c",
  yellow: "#f3c75f",
  text: "#172033",
  white: "#ffffff",
};

const FLOOR_H = 3.15;
const FLOORS = 6; // Ground + five upper floors

const DESTINATIONS = {
  "IT Lab": { floor: 2, room: "IT LAB", x: 8.2, z: -5.7 },
  "IT-301": { floor: 3, room: "IT-301", x: 7.7, z: -5.7 },
  "IT-302": { floor: 2, room: "IT-302", x: 2.2, z: -5.7 },
  "IT-303": { floor: 3, room: "IT-303", x: 2.2, z: -5.7 },
  "AI Lab": { floor: 2, room: "AI LAB", x: -7.7, z: -5.7 },
  Library: { floor: 1, room: "LIBRARY", x: -6.8, z: 5.4 },
  Canteen: { floor: 0, room: "CANTEEN", x: 9.2, z: 4.9 },
  "Placement Cell": { floor: 1, room: "PLACEMENT CELL", x: -1.8, z: 5.3 },
  "Alma Latifi Hall": { floor: 1, room: "ALMA LATIFI HALL", x: 7.5, z: 5.2 },
  "Room 103": { floor: 1, room: "ROOM 103", x: 1.9, z: -5.6 },
  "Room 104": { floor: 1, room: "ROOM 104", x: 7.0, z: -5.6 },
  "Computer Centre": { floor: 3, room: "COMPUTER CENTRE", x: -7.2, z: -5.6 },
  "Seminar Hall": { floor: 4, room: "SEMINAR HALL", x: 1.0, z: -5.6 },
  "Room 407": { floor: 4, room: "ROOM 407", x: 7.4, z: -5.6 },
  BCR: { floor: 4, room: "BCR", x: -7.4, z: -5.6 },
  "GCR": { floor: 0, room: "GCR", x: -7.8, z: 5.0 },
  "Adv. Communication Lab": { floor: 5, room: "ADV. COMMUNICATION LAB", x: -7.2, z: -5.6 },
  "Basic Communication Lab": { floor: 5, room: "BASIC COMMUNICATION LAB", x: 0, z: -5.6 },
  "MFOC Lab": { floor: 5, room: "MFOC LAB", x: 7.2, z: -5.6 },
  "Antenna Lab": { floor: 5, room: "ANTENNA LAB", x: -3.0, z: 5.4 },
};

const FLOOR_ROOMS = {
  0: [
    ["GCR", -8.2, 5.2, 5.5, "facility"],
    ["CANTEEN", 8.4, 5.2, 5.8, "facility"],
    ["MAIN ENTRANCE", 0, -5.6, 6.2, "entry"],
    ["SECURITY / RECEPTION", -1.8, 5.2, 3.8, "office"],
  ],
  1: [
    ["ALMA LATIFI HALL", -8.0, 5.1, 5.7, "hall"],
    ["PLACEMENT CELL", -1.9, 5.1, 4.0, "office"],
    ["ROOM 103", 1.8, -5.4, 4.3, "class"],
    ["ROOM 104", 7.0, -5.4, 4.5, "class"],
    ["LIBRARY", 8.0, 5.1, 5.3, "library"],
  ],
  2: [
    ["AI LAB", -7.5, -5.4, 5.2, "lab"],
    ["PROGRAMMING LAB", -1.9, 5.1, 5.2, "lab"],
    ["IT-302", 2.0, -5.4, 4.3, "class"],
    ["IT LAB", 7.7, -5.4, 5.3, "lab"],
  ],
  3: [
    ["COMPUTER CENTRE", -7.4, -5.4, 5.4, "lab"],
    ["IT-303", 2.0, -5.4, 4.3, "class"],
    ["IT-301", 7.4, -5.4, 4.5, "class"],
    ["STUDENT LIFT", -10.8, 5.0, 3.0, "lift"],
  ],
  4: [
    ["BCR", -7.5, -5.4, 5.0, "facility"],
    ["SEMINAR HALL", 0.8, -5.4, 6.0, "hall"],
    ["ROOM 407", 7.4, -5.4, 4.3, "class"],
  ],
  5: [
    ["ADV. COMMUNICATION LAB", -7.3, -5.4, 5.5, "lab"],
    ["BASIC COMMUNICATION LAB", 0, -5.4, 5.5, "lab"],
    ["MFOC LAB", 7.2, -5.4, 4.5, "lab"],
    ["ANTENNA LAB", -3.2, 5.1, 4.5, "lab"],
  ],
};

function getTarget(destination) {
  return DESTINATIONS[destination] || DESTINATIONS["IT Lab"];
}

function roundedMaterial(color, roughness = 0.72, metalness = 0) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />;
}

function ArchWindow({ position, scale = 1, dark = false, shutters = false }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[1.05, 1.55, 0.14]} />
        {roundedMaterial(dark ? C.window : C.wall2)}
      </mesh>
      <mesh position={[0, 1.36, 0]}>
        <cylinderGeometry args={[0.525, 0.525, 0.14, 24, 1, false, 0, Math.PI]} />
        {roundedMaterial(dark ? C.window : C.wall2)}
      </mesh>
      <mesh position={[0, 0.62, 0.09]}>
        <boxGeometry args={[0.78, 1.18, 0.06]} />
        {roundedMaterial(dark ? C.glass : "#b9cdd0", 0.4)}
      </mesh>
      <mesh position={[0, 0.62, 0.13]}>
        <boxGeometry args={[0.06, 1.15, 0.05]} />
        {roundedMaterial(C.railing, 0.55)}
      </mesh>
      <mesh position={[0, 0.62, 0.13]}>
        <boxGeometry args={[0.72, 0.05, 0.05]} />
        {roundedMaterial(C.railing, 0.55)}
      </mesh>
      {shutters && (
        <>
          <mesh position={[-0.58, 0.62, 0.12]} rotation-y={0.08}>
            <boxGeometry args={[0.13, 1.2, 0.28]} />
            {roundedMaterial(C.brick)}
          </mesh>
          <mesh position={[0.58, 0.62, 0.12]} rotation-y={-0.08}>
            <boxGeometry args={[0.13, 1.2, 0.28]} />
            {roundedMaterial(C.brick)}
          </mesh>
        </>
      )}
      <mesh position={[0, 0.0, 0.12]}>
        <boxGeometry args={[1.45, 0.12, 0.34]} />
        {roundedMaterial(C.railing)}
      </mesh>
      {[-0.6, -0.3, 0, 0.3, 0.6].map((x) => (
        <mesh key={x} position={[x, -0.42, 0.12]}>
          <boxGeometry args={[0.035, 0.75, 0.035]} />
          {roundedMaterial(C.railing)}
        </mesh>
      ))}
    </group>
  );
}

function Railing({ width = 10, position = [0, 0, 0], z = 0 }) {
  const count = Math.max(5, Math.floor(width / 0.75));
  return (
    <group position={position}>
      <mesh position={[0, 0, z]}>
        <boxGeometry args={[width, 0.11, 0.11]} />
        {roundedMaterial(C.railing, 0.6)}
      </mesh>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[-width / 2 + (i * width) / (count - 1), -0.48, z]}>
          <boxGeometry args={[0.055, 0.95, 0.055]} />
          {roundedMaterial(C.railing, 0.6)}
        </mesh>
      ))}
    </group>
  );
}

function Dome({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[1.35, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {roundedMaterial(C.roof)}
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <coneGeometry args={[0.18, 0.52, 8]} />
        {roundedMaterial(C.brickDark)}
      </mesh>
    </group>
  );
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 2.0, 9]} />
        {roundedMaterial("#684737")}
      </mesh>
      <mesh position={[0, 2.55, 0]} castShadow>
        <sphereGeometry args={[1.15, 18, 14]} />
        {roundedMaterial(C.green)}
      </mesh>
      <mesh position={[0.6, 2.85, 0.1]} scale={0.62}>
        <sphereGeometry args={[1.0, 16, 12]} />
        {roundedMaterial(C.green2)}
      </mesh>
    </group>
  );
}

function Gate({ position, label, width = 5.5, highlighted = false }) {
  return (
    <group position={position}>
      <mesh position={[-width / 2, 2.2, 0]}>
        <boxGeometry args={[0.32, 4.4, 0.38]} />
        {roundedMaterial(highlighted ? C.blue : C.railing)}
      </mesh>
      <mesh position={[width / 2, 2.2, 0]}>
        <boxGeometry args={[0.32, 4.4, 0.38]} />
        {roundedMaterial(highlighted ? C.blue : C.railing)}
      </mesh>
      <mesh position={[0, 4.3, 0]}>
        <boxGeometry args={[width + 0.5, 0.35, 0.38]} />
        {roundedMaterial(highlighted ? C.blue : C.railing)}
      </mesh>
      <Text position={[0, 4.85, 0]} fontSize={0.43} color={highlighted ? C.blue : C.text} anchorX="center">
        {label}
      </Text>
    </group>
  );
}

function Lamp({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.045, 0.07, 3.1, 8]} />
        {roundedMaterial(C.metal, 0.4, 0.3)}
      </mesh>
      <mesh position={[0, 3.0, 0]}>
        <octahedronGeometry args={[0.25, 0]} />
        <meshStandardMaterial color="#24272a" emissive="#f5d68b" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function Steps({ position = [0, 0, 0], width = 7, count = 10, depth = 0.55, direction = 1 }) {
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.12 + i * 0.14, direction * (count - 1 - i) * depth]}
          receiveShadow
        >
          <boxGeometry args={[width - i * 0.08, 0.24, depth]} />
          {roundedMaterial(i % 2 ? "#c9c0b7" : "#b8aea5")}
        </mesh>
      ))}
    </group>
  );
}

function StairFlight({ position = [0, 0, 0], rotation = 0, label = "STAIRS" }) {
  return (
    <group position={position} rotation-y={rotation}>
      <Steps position={[0, 0, 0]} width={3.8} count={12} depth={0.42} direction={1} />
      <mesh position={[0, 1.85, 5.0]}>
        <boxGeometry args={[4.0, 0.24, 1.5]} />
        {roundedMaterial("#aaa198")}
      </mesh>
      <Steps position={[0, 1.95, 5.8]} width={3.8} count={12} depth={0.42} direction={-1} />
      <Railing width={4.2} position={[-1.85, 0.5, 2.7]} z={0} />
      <Railing width={4.2} position={[1.85, 0.5, 2.7]} z={0} />
      <Text position={[0, 4.05, 6.0]} fontSize={0.34} color={C.blue} anchorX="center">
        {label}
      </Text>
    </group>
  );
}

function Wing({ side = -1 }) {
  const x = side * 11.0;
  const width = 9.0;
  const depth = 21.0;
  const h = FLOORS * FLOOR_H;
  const z = -0.4;
  const floorBands = Array.from({ length: FLOORS + 1 });
  const windows = Array.from({ length: FLOORS });

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[width, h, depth]} />
        {roundedMaterial(C.wall2)}
      </mesh>

      {floorBands.map((_, i) => (
        <mesh key={i} position={[0, i * FLOOR_H, depth / 2 + 0.1]}>
          <boxGeometry args={[width + 0.35, 0.22, 0.38]} />
          {roundedMaterial(i === 0 ? C.brickDark : C.brick)}
        </mesh>
      ))}

      {windows.map((_, floor) => (
        <group key={floor}>
          {Array.from({ length: 5 }).map((__, i) => (
            <ArchWindow
              key={i}
              position={[-3.1 + i * 1.55, floor * FLOOR_H + 1.45, depth / 2 + 0.18]}
              scale={0.67}
              dark={i % 3 === 0}
              shutters
            />
          ))}
          {Array.from({ length: 5 }).map((__, i) => (
            <ArchWindow
              key={`back-${i}`}
              position={[-3.1 + i * 1.55, floor * FLOOR_H + 1.45, -depth / 2 - 0.18]}
              scale={0.62}
              dark={i % 3 === 1}
              shutters
            />
          ))}
        </group>
      ))}

      {[-width / 2 - 0.15, width / 2 + 0.15].map((xx) => (
        <group key={xx}>
          {Array.from({ length: FLOORS }).map((_, floor) => (
            <Railing key={floor} width={width - 0.3} position={[xx, floor * FLOOR_H + 0.55, 0]} z={side < 0 ? 0.4 : -0.4} />
          ))}
        </group>
      ))}

      {/* Wing roof + parapet: intentionally broad so it reads from TOP view. */}
      <mesh position={[0, h + 0.42, 0]} castShadow>
        <boxGeometry args={[width + 0.8, 0.75, depth + 0.8]} />
        {roundedMaterial(C.roof)}
      </mesh>
      <mesh position={[0, h + 0.92, 0]}>
        <boxGeometry args={[width + 0.95, 0.22, depth + 0.95]} />
        {roundedMaterial(C.brickDark)}
      </mesh>

      {/* Corner pilasters make both wings readable from side angles. */}
      {[-width / 2 + 0.25, width / 2 - 0.25].map((xx) => (
        <mesh key={xx} position={[xx, h / 2, depth / 2 + 0.32]}>
          <boxGeometry args={[0.32, h + 0.1, 0.34]} />
          {roundedMaterial(C.brickDark)}
        </mesh>
      ))}
    </group>
  );
}

function CentralBlock() {
  const h = FLOORS * FLOOR_H;
  return (
    <group position={[0, 0, -6.7]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[16.0, h, 7.0]} />
        {roundedMaterial(C.wall)}
      </mesh>

      {Array.from({ length: FLOORS + 1 }).map((_, i) => (
        <mesh key={i} position={[0, i * FLOOR_H, 3.58]}>
          <boxGeometry args={[16.35, 0.25, 0.42]} />
          {roundedMaterial(i === 0 ? C.brickDark : C.brick)}
        </mesh>
      ))}

      {Array.from({ length: FLOORS }).map((_, floor) =>
        Array.from({ length: 6 }).map((__, i) => (
          <ArchWindow
            key={`${floor}-${i}`}
            position={[-6.4 + i * 2.55, floor * FLOOR_H + 1.45, 3.82]}
            scale={0.7}
            dark={i % 3 === 0}
            shutters
          />
        ))
      )}

      <mesh position={[0, h + 0.42, 0]}>
        <boxGeometry args={[16.6, 0.75, 7.4]} />
        {roundedMaterial(C.roofLight)}
      </mesh>

      {/* Historic-style central tower */}
      <group position={[0, 0, 3.5]}>
        <mesh position={[0, 9.0, 0]} castShadow>
          <boxGeometry args={[7.2, 18.0, 2.8]} />
          {roundedMaterial(C.wall2)}
        </mesh>
        {[-2.75, 2.75].map((x) => (
          <mesh key={x} position={[x, 9.0, 1.52]}>
            <boxGeometry args={[0.34, 17.5, 0.34]} />
            {roundedMaterial(C.brickDark)}
          </mesh>
        ))}
        <mesh position={[0, 12.2, 1.58]}>
          <boxGeometry args={[4.2, 7.1, 0.18]} />
          {roundedMaterial(C.brickDark)}
        </mesh>
        <mesh position={[0, 12.2, 1.7]}>
          <boxGeometry args={[3.45, 6.35, 0.08]} />
          {roundedMaterial(C.glass, 0.32)}
        </mesh>
        {[-1.15, 0, 1.15].map((x) => (
          <mesh key={x} position={[x, 12.2, 1.78]}>
            <boxGeometry args={[0.07, 6.2, 0.07]} />
            {roundedMaterial(C.brickDark)}
          </mesh>
        ))}
        <Text position={[0, 7.55, 1.72]} fontSize={0.43} color={C.text} anchorX="center">
          M.H. SABOO SIDDIK
        </Text>
        <mesh position={[0, 18.75, 0]}>
          <boxGeometry args={[6.2, 1.0, 3.25]} />
          {roundedMaterial(C.brickDark)}
        </mesh>
        <Dome position={[-2.0, 19.6, 0]} scale={0.7} />
        <Dome position={[2.0, 19.6, 0]} scale={0.7} />
      </group>
    </group>
  );
}

function MainEntrance() {
  return (
    <group position={[0, 0, 0.0]}>
      <mesh position={[0, 1.8, 3.65]}>
        <boxGeometry args={[8.2, 3.6, 1.0]} />
        {roundedMaterial(C.wall2)}
      </mesh>
      <mesh position={[0, 2.4, 4.2]}>
        <boxGeometry args={[4.0, 4.9, 0.24]} />
        {roundedMaterial("#263b48", 0.35, 0.2)}
      </mesh>
      {[-1.25, 1.25].map((x) => (
        <mesh key={x} position={[x, 2.4, 4.35]}>
          <boxGeometry args={[0.07, 4.4, 0.07]} />
          {roundedMaterial("#c9d2d8", 0.35, 0.3)}
        </mesh>
      ))}
      <Steps position={[0, 0, 5.2]} width={7.0} count={8} depth={0.5} direction={-1} />
      <mesh position={[0, 5.0, 4.3]}>
        <boxGeometry args={[6.0, 0.22, 1.1]} />
        {roundedMaterial(C.brickDark)}
      </mesh>
      <Text position={[0, 5.75, 4.55]} fontSize={0.46} color={C.text} anchorX="center">
        MAIN ENTRANCE
      </Text>
    </group>
  );
}

function CampusWallsAndGates({ navigationStage }) {
  return (
    <group>
      {/* Perimeter walls give the campus the layered reference-model feeling. */}
      <mesh position={[0, 1.0, 17.2]}>
        <boxGeometry args={[50, 2.0, 0.65]} />
        {roundedMaterial(C.stone)}
      </mesh>
      <mesh position={[-22.5, 1.0, 3.0]}>
        <boxGeometry args={[0.65, 2.0, 27]} />
        {roundedMaterial(C.stone)}
      </mesh>
      <mesh position={[22.5, 1.0, 3.0]}>
        <boxGeometry args={[0.65, 2.0, 27]} />
        {roundedMaterial(C.stone)}
      </mesh>

      <Gate position={[-13, 0, 18]} label="MAIN GATE" highlighted={navigationStage !== "campus"} />
      <Gate position={[0, 0, 18]} label="STUDENT ENTRY" width={5.0} />
      <Gate position={[18, 0, 10]} label="SERVICE GATE" width={4.4} />
      <Gate position={[-22, 0, -5]} label="EXIT GATE" width={5.0} />

      <Steps position={[-13, 0, 15.7]} width={6.2} count={8} depth={0.5} direction={-1} />
      <Steps position={[-22, 0, -2.0]} width={5.0} count={12} depth={0.42} direction={1} />
      <StairFlight position={[18, 0, 5.0]} rotation={Math.PI / 2} label="SIDE STAIRS" />
    </group>
  );
}

function CampusGround() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[64, 58]} />
        {roundedMaterial(C.ground)}
      </mesh>
      <mesh position={[0, 0.03, 21]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[18, 14]} />
        {roundedMaterial(C.road)}
      </mesh>
      <mesh position={[-24, 0.04, 1]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[12, 44]} />
        {roundedMaterial(C.road)}
      </mesh>
      <mesh position={[22, 0.04, 7]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[9, 32]} />
        {roundedMaterial(C.road)}
      </mesh>
      <mesh position={[0, 0.06, 7.0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[21, 17]} />
        {roundedMaterial("#d5d0c8")}
      </mesh>

      {[[-18, 12], [-8, 13], [8, 13], [18, 12], [-20, 7], [20, 7], [-18, -11], [18, -11]].map(([x, z], i) => (
        <Tree key={i} position={[x, 0, z]} scale={0.85 + (i % 2) * 0.1} />
      ))}
      {[[-16, 19], [-7, 19], [7, 19], [16, 19], [-24, 10], [-24, 0], [24, 12], [24, 2]].map(([x, z], i) => (
        <Lamp key={`lamp-${i}`} position={[x, 0, z]} />
      ))}
    </group>
  );
}

function ExteriorCampus({ navigationStage, currentStep }) {
  const route = useMemo(() => {
    if (navigationStage === "campus") return [];
    const points = navigationStage === "stairs"
      ? STAIR_NAV_PATH
      : EXTERIOR_NAV_PATH;
    return points.map(([x, y, z]) => [x, y + 0.05, z]);
  }, [navigationStage, currentStep]);

  return (
    <group>
      <CampusGround />
      <CampusWallsAndGates navigationStage={navigationStage} />
      <Wing side={-1} />
      <Wing side={1} />
      <CentralBlock />
      <MainEntrance />

      {/* Courtyard furniture */}
      <mesh position={[0, 0.12, 7.2]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[3.0, 48]} />
        {roundedMaterial("#bbb2aa")}
      </mesh>
      <Tree position={[0, 0.2, 7.2]} scale={0.8} />

      <mesh position={[0, 0.12, 11.8]}>
        <boxGeometry args={[14, 0.18, 0.6]} />
        {roundedMaterial(C.brickDark)}
      </mesh>

      <Text position={[0, 0.22, 15.3]} fontSize={0.42} color="#7b746e" anchorX="center">
        M.H. SABOO SIDDIK COLLEGE CAMPUS
      </Text>

      {route.length > 1 && (
        <>
          <Line points={route} color={C.blue} lineWidth={5} />
          {route.slice(1).map((p, i) => (
            <mesh key={i} position={[p[0], 0.28, p[2]]} rotation-x={-Math.PI / 2}>
              <circleGeometry args={[0.22, 24]} />
              <meshBasicMaterial color={C.blue} />
            </mesh>
          ))}
        </>
      )}

      {navigationStage === "campus" && (
        <YouMarker position={[-13, 0.3, 21.5]} />
      )}
    </group>
  );
}

function YouMarker({ position }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.08);
  });
  return (
    <group ref={ref} position={position}>
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.0, 32]} />
        <meshBasicMaterial color={C.blue} transparent opacity={0.17} />
      </mesh>
      <Html center position={[0, 0.95, 0]} distanceFactor={11}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: C.white,
          border: `3px solid ${C.blue}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          lineHeight: 1,
          boxShadow: "0 6px 20px rgba(47,111,237,.25)"
        }}>
          👨🏻‍🎓
        </div>
      </Html>
      <Html center position={[0, 1.65, 0]}>
        <div style={{ background: C.white, border: `2px solid ${C.blue}`, color: C.blue, borderRadius: 999, padding: "6px 10px", font: "800 11px Inter, sans-serif", whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(0,0,0,.14)" }}>
          YOU ARE HERE
        </div>
      </Html>
    </group>
  );
}

function RoomFurniture({ type }) {
  if (type === "lab") {
    return (
      <group>
        {Array.from({ length: 6 }).map((_, i) => {
          const x = -1.9 + (i % 3) * 1.9;
          const z = -0.55 + Math.floor(i / 3) * 1.25;
          return (
            <group key={i} position={[x, 0.42, z]}>
              <mesh>
                <boxGeometry args={[1.35, 0.15, 0.65]} />
                {roundedMaterial("#b6a79a")}
              </mesh>
              <mesh position={[0, 0.35, 0]}>
                <boxGeometry args={[0.75, 0.42, 0.07]} />
                {roundedMaterial("#596b78")}
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }
  if (type === "class" || type === "hall") {
    return (
      <group>
        <mesh position={[0, 0.75, -1.0]}>
          <boxGeometry args={[4.1, 1.25, 0.12]} />
          {roundedMaterial("#e7e0d8")}
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[-1.8 + (i % 3) * 1.8, 0.35, 0.3 + Math.floor(i / 3) * 1.1]}>
            <boxGeometry args={[1.25, 0.14, 0.6]} />
            {roundedMaterial("#aa9c90")}
          </mesh>
        ))}
      </group>
    );
  }
  return null;
}

function CutawayRoom({ room, active, onSelect }) {
  const [label, x, z, width, type] = room;
  return (
    <group
      position={[x, 0, z]}
      onClick={(e) => { e.stopPropagation(); onSelect(label); }}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "default"; }}
    >
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[width, 2.7, 3.0]} />
        {roundedMaterial(active ? "#dbe9ff" : "#eee6dc")}
      </mesh>
      <mesh position={[0, 1.35, 1.53]}>
        <boxGeometry args={[Math.min(width - 0.5, 3.8), 1.55, 0.08]} />
        {roundedMaterial(active ? C.blue : C.glass, 0.35)}
      </mesh>
      <mesh position={[0, 0.95, 1.62]}>
        <boxGeometry args={[0.95, 1.85, 0.1]} />
        {roundedMaterial(active ? C.blue2 : C.wood)}
      </mesh>
      <Text position={[0, 2.9, 1.7]} fontSize={0.27} color={C.text} anchorX="center" maxWidth={width - 0.2}>
        {label}
      </Text>
      <RoomFurniture type={type} />
    </group>
  );
}

function IndoorStairs({ x = -11.0, z = 1.8 }) {
  return (
    <group position={[x, 0, z]}>
      <Steps width={3.2} count={11} depth={0.42} direction={1} />
      <mesh position={[0, 1.7, 4.8]}>
        <boxGeometry args={[3.4, 0.25, 1.3]} />
        {roundedMaterial("#aaa198")}
      </mesh>
      <Steps position={[0, 1.82, 5.4]} width={3.2} count={11} depth={0.42} direction={-1} />
      <Railing width={3.5} position={[-1.6, 0.65, 2.5]} />
      <Railing width={3.5} position={[1.6, 0.65, 2.5]} />
      <Html center position={[0, 3.7, 5.9]}>
        <div style={{ background: C.white, border: `2px solid ${C.blue}`, color: C.blue, borderRadius: 999, padding: "6px 10px", font: "800 11px Inter, sans-serif", whiteSpace: "nowrap", boxShadow: "0 5px 18px rgba(0,0,0,.12)" }}>
          STAIRS • GO TO NEXT FLOOR
        </div>
      </Html>
    </group>
  );
}

function Lift({ position, label }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2.0, 2.7, 1.8]} />
        {roundedMaterial("#d5d9dd", 0.4)}
      </mesh>
      <mesh position={[0, 0, 0.93]}>
        <boxGeometry args={[1.45, 1.9, 0.08]} />
        {roundedMaterial("#52616b", 0.3, 0.15)}
      </mesh>
      <Text position={[0, 1.55, 1.05]} fontSize={0.24} color={C.text} anchorX="center">
        {label}
      </Text>
    </group>
  );
}

function FloorInterior({ floor, destination, currentStep, selectedRoom, onRoomSelect, showRoute = true }) {
  const target = getTarget(destination);
  const rooms = FLOOR_ROOMS[floor] || FLOOR_ROOMS[2];
  const routeTarget = rooms.find((r) => r[0] === target.room) || rooms[0];
  const routeX = routeTarget?.[1] ?? target.x;
  const routeZ = routeTarget?.[2] ?? target.z;
  const route = [
    [-12.5, 0.22, 0.9],
    [-7.0, 0.22, 0.9],
    [0, 0.22, 0.9],
    [6.0, 0.22, 0.9],
    [routeX, 0.22, routeZ],
  ];

  return (
    <group position={[0, floor * FLOOR_H, 0]}>
      {/* Floor slab */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <boxGeometry args={[30, 0.7, 18]} />
        {roundedMaterial("#d3cec6")}
      </mesh>

      {/* Open cutaway walls: back + side walls, front left open for navigation visibility. */}
      <mesh position={[0, 1.55, -8.45]}>
        <boxGeometry args={[29, 3.1, 0.32]} />
        {roundedMaterial(C.wall2)}
      </mesh>
      <mesh position={[-14.45, 1.55, 0]}>
        <boxGeometry args={[0.32, 3.1, 16.8]} />
        {roundedMaterial(C.wall2)}
      </mesh>
      <mesh position={[14.45, 1.55, 0]}>
        <boxGeometry args={[0.32, 3.1, 16.8]} />
        {roundedMaterial(C.wall2)}
      </mesh>

      {/* Corridor */}
      <mesh position={[0, 0.08, 0.9]}>
        <boxGeometry args={[25.6, 0.13, 4.5]} />
        {roundedMaterial("#bbb2aa")}
      </mesh>
      <Line points={[[-12.8, 0.17, -1.35], [12.8, 0.17, -1.35]]} color="#9f958c" lineWidth={2} />
      <Line points={[[-12.8, 0.17, 3.15], [12.8, 0.17, 3.15]]} color="#9f958c" lineWidth={2} />

      {/* Ceiling beams/lights are visible when the user rotates the cutaway view. */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i} position={[-10.5 + i * 3, 2.75, 0.9]}>
          <mesh>
            <boxGeometry args={[0.14, 0.12, 4.2]} />
            {roundedMaterial("#b7aea5")}
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.6, 0.07, 1.0]} />
            <meshStandardMaterial color="#fff2bf" emissive="#ffe9a4" emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}

      {/* Doors and notice boards */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-10.5 + i * 3.5, 1.0, -1.58]}>
          <boxGeometry args={[1.25, 2.0, 0.12]} />
          {roundedMaterial(C.wood)}
        </mesh>
      ))}
      {[-9.0, -3.0, 3.0, 9.0].map((x, i) => (
        <group key={i} position={[x, 1.45, 3.08]}>
          <mesh>
            <boxGeometry args={[1.6, 0.85, 0.06]} />
            {roundedMaterial("#f2eee8")}
          </mesh>
          <Text position={[0, 0, 0.05]} fontSize={0.16} color="#59636d" anchorX="center">
            {i % 2 ? "DEPARTMENT" : "NOTICE BOARD"}
          </Text>
        </group>
      ))}

      {/* Stairs are always visible in the floor map — not temporary navigation geometry. */}
      <IndoorStairs x={-11.4} z={0.9} />
      <Lift position={[-6.7, 0, 5.0]} label="STUDENT LIFT" />
      <Lift position={[-3.9, 0, 5.0]} label="STAFF LIFT" />

      {rooms.map((room) => (
        <CutawayRoom
          key={room[0]}
          room={room}
          active={selectedRoom === room[0] || (currentStep >= 3 && target.room === room[0])}
          onSelect={onRoomSelect}
        />
      ))}

      {/* Washrooms — positioned separately so they remain visible and clickable-looking. */}
      <group position={[11.0, 0, 5.0]}>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[2.5, 2.3, 2.3]} />
          {roundedMaterial("#e8eef1")}
        </mesh>
        <Text position={[0, 1.2, 1.2]} fontSize={0.26} color={C.text} anchorX="center">{floor % 2 ? "LADIES" : "GENTS"}</Text>
      </group>

      {/* Blue navigation path: this is the missing visual connection between HERE and CLASSROOM/LAB. */}
      {showRoute && (
        <>
          <Line points={route} color={C.blue} lineWidth={5} />
          {route.slice(1, -1).map((p, i) => (
            <group key={i} position={[p[0], 0.31, p[2]]}>
              <mesh rotation-x={-Math.PI / 2}>
                <coneGeometry args={[0.24, 0.6, 3]} />
                <meshBasicMaterial color={C.blue} />
              </mesh>
            </group>
          ))}
          <group position={[routeX, 0.35, routeZ]}>
            <mesh rotation-x={-Math.PI / 2}>
              <ringGeometry args={[0.5, 0.78, 32]} />
              <meshBasicMaterial color={C.red} />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <coneGeometry args={[0.28, 0.8, 18]} />
              <meshBasicMaterial color={C.red} />
            </mesh>
            <Html center position={[0, 1.45, 0]}>
              <div style={{ background: C.red, color: "#fff", borderRadius: 999, padding: "7px 11px", font: "800 11px Inter, sans-serif", whiteSpace: "nowrap", boxShadow: "0 7px 22px rgba(220,76,76,.28)" }}>
                DESTINATION • {target.room}
              </div>
            </Html>
          </group>
        </>
      )}

      <Html position={[0, 3.5, -6.9]} center>
        <div style={{ background: "rgba(255,255,255,.96)", borderRadius: 13, padding: "8px 14px", color: C.text, font: "800 12px Inter, sans-serif", boxShadow: "0 8px 24px rgba(0,0,0,.12)", whiteSpace: "nowrap" }}>
          FLOOR {floor === 0 ? "GROUND" : floor} • ROOMS • CORRIDOR • STAIRS • LIFTS
        </div>
      </Html>
    </group>
  );
}


function samplePath(points, t) {
  if (!points.length) return new THREE.Vector3();
  if (points.length === 1) return new THREE.Vector3(...points[0]);
  const scaled = THREE.MathUtils.clamp(t, 0, 1) * (points.length - 1);
  const i = Math.min(points.length - 2, Math.floor(scaled));
  const local = scaled - i;
  return new THREE.Vector3(...points[i]).lerp(new THREE.Vector3(...points[i + 1]), local);
}

const EXTERIOR_NAV_PATH = [
  // Approach the real-looking main gate first.
  [-13, 1.2, 23.5],
  [-13, 1.6, 21.0],
  [-13, 1.7, 19.0],
  [-13, 1.65, 17.2],
  // Stop at the top of the visible entrance stair flight.
  [-13, 1.25, 15.85],
];

// The navigation camera deliberately follows the individual stair levels so the
// user can SEE the character/camera coming down the steps instead of teleporting.
const STAIR_NAV_PATH = [
  [-13, 1.18, 15.85],
  [-13, 1.04, 15.42],
  [-13, 0.90, 14.99],
  [-13, 0.76, 14.56],
  [-13, 0.62, 14.13],
  [-13, 0.48, 13.70],
  [-13, 0.34, 13.27],
  [-13, 0.22, 12.84],
  [-13, 0.18, 12.35],
  // Bottom landing and the path toward the central entrance.
  [-12.0, 0.18, 11.65],
  [-9.5, 0.18, 10.55],
  [-6.0, 0.18, 9.05],
  [-2.5, 0.18, 7.85],
  [0, 0.18, 6.9],
  [0, 0.18, 5.2],
  [0, 0.18, 3.7],
];


function StudentAvatar({ moving = false }) {
  return (
    <div style={{
      width: moving ? 46 : 50,
      height: moving ? 46 : 50,
      borderRadius: "50%",
      background: "#1f6feb",
      border: "3px solid #ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: moving ? 27 : 29,
      lineHeight: 1,
      boxShadow: "0 7px 22px rgba(31,111,235,.35)",
      userSelect: "none",
    }}>
      👨🏻‍🎓
    </div>
  );
}

function NavigationCameraMotion({ stage, floor, destination, currentStep, controlsRef, onFinish }) {
  const { camera } = useThree();
  const [progress, setProgress] = useState(0);
  const lastStage = useRef(stage);
  const startedAt = useRef(null);
  const finished = useRef(false);
  const target = getTarget(destination);

  const room = FLOOR_ROOMS[target.floor]?.find((r) => r[0] === target.room);
  const routeX = room?.[1] ?? target.x;
  const routeZ = room?.[2] ?? target.z;
  const interiorPath = useMemo(() => [
    [-11.4, 0.9],
    [-9.0, 0.9],
    [-5.0, 0.9],
    [0, 0.9],
    [5.0, 0.9],
    [routeX, routeZ],
  ], [routeX, routeZ]);

  useEffect(() => {
    if (stage !== lastStage.current) {
      startedAt.current = performance.now();
      setProgress(0);
      finished.current = false;
      lastStage.current = stage;
    }
  }, [stage]);

  useFrame((_, delta) => {
    if (stage !== "route" && stage !== "stairs" && stage !== "interiorWalk") return;

    if (startedAt.current == null) startedAt.current = performance.now();

    const duration = stage === "route" ? 5600 : stage === "stairs" ? 5200 : 6500;
    const elapsed = performance.now() - startedAt.current;
    const raw = THREE.MathUtils.clamp(elapsed / duration, 0, 1);
    const eased = 1 - Math.pow(1 - raw, 3);
    setProgress(eased);

    if (stage === "route") {
      const p = samplePath(EXTERIOR_NAV_PATH, eased);
      const next = samplePath(EXTERIOR_NAV_PATH, Math.min(1, eased + 0.045));
      const forward = next.clone().sub(p).normalize();
      camera.position.lerp(new THREE.Vector3(p.x, p.y + 3.4, p.z + 5.2), 0.16);
      camera.lookAt(p.x + forward.x * 4.5, p.y + 0.4, p.z + forward.z * 4.5);
      if (controlsRef.current) {
        controlsRef.current.target.set(p.x + forward.x * 4.5, p.y + 0.4, p.z + forward.z * 4.5);
      }
    } else if (stage === "stairs") {
      const p = samplePath(STAIR_NAV_PATH, eased);
      const next = samplePath(STAIR_NAV_PATH, Math.min(1, eased + 0.035));
      const forward = next.clone().sub(p).normalize();
      // Lower the camera with each stair step. This is the important visual
      // transition: the user visibly descends the stair flight and then walks
      // across the landing toward the college entrance.
      camera.position.lerp(new THREE.Vector3(p.x, p.y + 2.25, p.z + 3.0), 0.22);
      camera.lookAt(p.x + forward.x * 3.2, p.y + 0.35, p.z + forward.z * 3.2);
      if (controlsRef.current) {
        controlsRef.current.target.set(p.x + forward.x * 3.2, p.y + 0.35, p.z + forward.z * 3.2);
      }
    } else {
      const scaled = eased * (interiorPath.length - 1);
      const i = Math.min(interiorPath.length - 2, Math.floor(scaled));
      const local = scaled - i;
      const a = interiorPath[i];
      const b = interiorPath[i + 1];
      const x = THREE.MathUtils.lerp(a[0], b[0], local);
      const z = THREE.MathUtils.lerp(a[1], b[1], local);
      const nx = b[0] - a[0];
      const nz = b[1] - a[1];
      const len = Math.max(0.001, Math.hypot(nx, nz));
      const fx = nx / len;
      const fz = nz / len;
      const y = floor * FLOOR_H + 0.15;
      camera.position.lerp(new THREE.Vector3(x, y + 3.0, z + 5.4), 0.18);
      camera.lookAt(x + fx * 3.8, y + 0.7, z + fz * 3.8);
      if (controlsRef.current) {
        controlsRef.current.target.set(x + fx * 3.8, y + 0.7, z + fz * 3.8);
      }
    }

    if (raw >= 1 && !finished.current) {
      finished.current = true;
      onFinish?.();
    }
  });

  // The avatar uses THIS SAME progress value and THIS SAME path as the camera.
  // There is intentionally no second timer/component for the moving user marker.
  let travelerPoint;
  if (stage === "route") {
    travelerPoint = samplePath(EXTERIOR_NAV_PATH, progress);
  } else if (stage === "stairs") {
    travelerPoint = samplePath(STAIR_NAV_PATH, progress);
  } else if (stage === "interiorWalk") {
    const p = samplePath(interiorPath.map(([x, z]) => [x, floor * FLOOR_H + 0.35, z]), progress);
    travelerPoint = p;
  }

  return <>
    {travelerPoint && (
      <group position={[travelerPoint.x, travelerPoint.y + 0.3, travelerPoint.z]}>
        <mesh rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.9, 40]} />
          <meshBasicMaterial color={C.blue} transparent opacity={0.16} />
        </mesh>
        <Html center position={[0, 1.05, 0]} distanceFactor={10}>
          <StudentAvatar moving />
        </Html>
        <Html center position={[0, 1.85, 0]}>
          <div style={{
            background: C.blue,
            color: "#fff",
            borderRadius: 999,
            padding: "5px 9px",
            font: "800 10px Inter, sans-serif",
            whiteSpace: "nowrap",
            boxShadow: "0 5px 18px rgba(47,111,237,.3)"
          }}>
            YOU
          </div>
        </Html>
      </group>
    )}

    <Html fullscreen>
    <div style={{ position: "absolute", left: 16, right: 16, bottom: 16, pointerEvents: "none", fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ maxWidth: 430, background: "rgba(255,255,255,.96)", borderRadius: 16, padding: "11px 13px", boxShadow: "0 12px 32px rgba(0,0,0,.16)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ color: C.blue, fontSize: 10, fontWeight: 900, letterSpacing: ".08em" }}>
              {stage === "route" ? "LIVE ROUTE PREVIEW" : stage === "stairs" ? "STAIR DESCENT" : "INDOOR WALKTHROUGH"}
            </div>
            <div style={{ color: C.text, fontSize: 14, fontWeight: 900, marginTop: 2 }}>
              {stage === "route" ? "You are here → Main Gate → Stairs" : stage === "stairs" ? "Walk down the entrance stairs → College" : `${destination} • Follow the blue path`}
            </div>
          </div>
          <div style={{ color: C.blue, fontSize: 12, fontWeight: 900 }}>{Math.round(progress * 100)}%</div>
        </div>
        <div style={{ height: 5, marginTop: 8, borderRadius: 999, background: "#e7edf5", overflow: "hidden" }}>
          <div style={{ width: `${Math.max(3, progress * 100)}%`, height: "100%", background: C.blue, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  </Html>
  </>;
}

function CameraRig({ stage, floor, view, controlsRef, autoMotion = false }) {
  const { camera } = useThree();
  const internal = useRef();
  const controls = controlsRef || internal;

  // Two complete preset sets:
  // 1) Campus exterior views
  // 2) Floor/interior views
  // The same buttons can therefore be used before and after entering a floor.
  const campusTargets = useMemo(() => ({
    campus: { p: new THREE.Vector3(31, 27, 35), t: new THREE.Vector3(0, 6, 1) },
    top: { p: new THREE.Vector3(0, 45, 0.01), t: new THREE.Vector3(0, 0, 0) },
    front: { p: new THREE.Vector3(0, 10, 36), t: new THREE.Vector3(0, 8, -2) },
    left: { p: new THREE.Vector3(-35, 11, 10), t: new THREE.Vector3(-3, 8, -2) },
    right: { p: new THREE.Vector3(35, 11, 10), t: new THREE.Vector3(3, 8, -2) },
    rear: { p: new THREE.Vector3(0, 13, -34), t: new THREE.Vector3(0, 8, -4) },
    low: { p: new THREE.Vector3(0, 4.8, 31), t: new THREE.Vector3(0, 8, -3) },
  }), []);

  const interiorTargets = useMemo(() => {
    const y = floor * FLOOR_H;
    return {
      campus: {
        p: new THREE.Vector3(18, y + 12, 20),
        t: new THREE.Vector3(0, y + 1, 0),
      },
      top: {
        p: new THREE.Vector3(0, y + 19, 0.01),
        t: new THREE.Vector3(0, y, 0),
      },
      front: {
        p: new THREE.Vector3(0, y + 7.0, 16.5),
        t: new THREE.Vector3(0, y + 1.1, 0.5),
      },
      left: {
        p: new THREE.Vector3(-17, y + 6.5, 3),
        t: new THREE.Vector3(-1.5, y + 1.0, 0),
      },
      right: {
        p: new THREE.Vector3(17, y + 6.5, 3),
        t: new THREE.Vector3(1.5, y + 1.0, 0),
      },
      rear: {
        p: new THREE.Vector3(0, y + 7.0, -16.5),
        t: new THREE.Vector3(0, y + 1.1, 0),
      },
      low: {
        p: new THREE.Vector3(0, y + 3.2, 14.5),
        t: new THREE.Vector3(0, y + 1.0, 0),
      },
    };
  }, [floor]);

  useEffect(() => {
    // During automatic navigation the navigation camera owns the camera.
    if (stage === "route" || stage === "stairs" || stage === "interiorWalk") return;

    const isInterior = stage === "interior";
    const targets = isInterior ? interiorTargets : campusTargets;
    const key = stage === "start" ? "front" : stage === "entering" ? "low" : view;
    const preset = targets[key] || targets.campus;

    camera.position.copy(preset.p);
    if (controls.current) {
      controls.current.target.copy(preset.t);
      controls.current.update();
    }
    camera.updateProjectionMatrix();
  }, [stage, floor, view, camera, controls, campusTargets, interiorTargets]);

  useFrame(() => {
    if (controls.current) controls.current.update();
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan
      enableDamping
      dampingFactor={0.075}
      minDistance={1.8}
      maxDistance={85}
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI * 0.49}
      rotateSpeed={0.7}
      zoomSpeed={0.8}
      panSpeed={0.8}
      // Mouse interaction is available whenever automatic navigation is not running.
      // Left drag = orbit, wheel = zoom, right/middle drag = pan.
      enabled={!autoMotion}
    />
  );
}

function InteriorKeyboard({ controlsRef, floor, enabled = true }) {
  const { camera } = useThree();
  const keys = useRef({});
  useEffect(() => {
    const down = (e) => { keys.current[e.key.toLowerCase()] = true; };
    const up = (e) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  useFrame((_, delta) => {
    if (!enabled) return;
    const k = keys.current;
    const speed = 7 * delta;
    let dx = 0;
    let dz = 0;
    if (k.w || k.arrowup) dz -= speed;
    if (k.s || k.arrowdown) dz += speed;
    if (k.a || k.arrowleft) dx -= speed;
    if (k.d || k.arrowright) dx += speed;
    if (!dx && !dz) return;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x + dx, -13.2, 13.2);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z + dz, -7.0, 7.0);
    camera.position.y = floor * FLOOR_H + 7.0;
    if (controlsRef.current) {
      controlsRef.current.target.x = THREE.MathUtils.clamp(controlsRef.current.target.x + dx, -13.0, 13.0);
      controlsRef.current.target.z = THREE.MathUtils.clamp(controlsRef.current.target.z + dz, -6.5, 6.5);
      controlsRef.current.update();
    }
  });
  return null;
}

function stageToPhase(stage, currentStep) {
  if (stage === "start" || stage === "route") return "approach";
  if (stage === "stairs") return "stairs";
  if (stage === "interiorWalk") return "corridor";
  if (stage === "interior") return currentStep >= 3 ? "destination" : "corridor";
  return currentStep <= 1 ? "stairs" : currentStep === 2 ? "corridor" : "destination";
}

function Scene({ navigationStarted, destination, currentStep }) {
  const target = getTarget(destination);
  const [stage, setStage] = useState(navigationStarted ? "start" : "campus");
  const [autoMotion, setAutoMotion] = useState(false);
  const [floor, setFloor] = useState(navigationStarted ? 0 : target.floor);
  const [view, setView] = useState("campus");
  const [selectedRoom, setSelectedRoom] = useState(target.room);
  const controlsRef = useRef();

  // The visible instruction follows the actual 3D navigation stage. This keeps
  // the command and camera movement synchronized.
  const phase = stageToPhase(stage, currentStep);

  useEffect(() => {
    setSelectedRoom(target.room);
  }, [target.room]);

  useEffect(() => {
    if (!navigationStarted) {
      setStage("campus");
      setView("campus");
      setAutoMotion(false);
      return;
    }

    setStage("start");
    setAutoMotion(false);
    setFloor(0);

    // 1) Hold the full-campus view briefly.
    // 2) Zoom toward YOU ARE HERE.
    // 3) Follow the blue route physically toward the entrance.
    const a = setTimeout(() => {
      setStage("route");
      setAutoMotion(true);
    }, 900);

    return () => clearTimeout(a);
  }, [navigationStarted]);

  return (
    <>
      <color attach="background" args={[C.sky]} />
      <ambientLight intensity={1.55} />
      <directionalLight position={[20, 32, 18]} intensity={2.7} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <directionalLight position={[-25, 15, -20]} intensity={0.9} />

      {stage === "interior" || stage === "interiorWalk" ? (
        <FloorInterior
          floor={floor}
          destination={destination}
          currentStep={currentStep}
          selectedRoom={selectedRoom}
          showRoute={stage === "interiorWalk"}
          onRoomSelect={(room) => {
            setSelectedRoom(room);
            const entry = Object.values(DESTINATIONS).find((d) => d.room === room);
            if (entry) setFloor(entry.floor);
          }}
        />
      ) : (
        <ExteriorCampus navigationStage={stage} currentStep={currentStep} />
      )}

      {(stage === "interior" || stage === "interiorWalk") && <InteriorKeyboard controlsRef={controlsRef} floor={floor} enabled={!autoMotion} />}

      <CameraRig stage={stage} floor={floor} view={view} controlsRef={controlsRef} autoMotion={autoMotion} />

      {stage === "route" && (
        <NavigationCameraMotion
          stage="route"
          floor={floor}
          destination={destination}
          currentStep={currentStep}
          controlsRef={controlsRef}
          onFinish={() => {
            setStage("stairs");
            setAutoMotion(true);
          }}
        />
      )}

      {stage === "stairs" && (
        <NavigationCameraMotion
          stage="stairs"
          floor={floor}
          destination={destination}
          currentStep={currentStep}
          controlsRef={controlsRef}
          onFinish={() => {
            // Reveal the destination floor only after the stair descent is done.
            setFloor(target.floor);
            setStage("interiorWalk");
            setAutoMotion(true);
          }}
        />
      )}

      {stage === "interiorWalk" && (
        <NavigationCameraMotion
          stage="interiorWalk"
          floor={floor}
          destination={destination}
          currentStep={currentStep}
          controlsRef={controlsRef}
          onFinish={() => {
            setStage("interior");
            setAutoMotion(false);
          }}
        />
      )}

      {/* Reference-style navigation / camera controls. */}
      <Html fullscreen>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", fontFamily: "Inter, Arial, sans-serif" }}>
          <div style={{ position: "absolute", top: 16, left: 16, pointerEvents: "auto", display: "flex", gap: 7, flexWrap: "wrap", maxWidth: 510 }}>
            {[
              ["campus", "3D CAMPUS"],
              ["top", "TOP VIEW"],
              ["front", "FRONT"],
              ["left", "LEFT WING"],
              ["right", "RIGHT WING"],
              ["rear", "REAR"],
              ["low", "LOW VIEW"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  if (autoMotion) return;
                  setView(id);
                  // IMPORTANT: do not kick the user out of the current floor.
                  // The same preset buttons work for both the exterior campus and interior floor.
                }}
                style={{ border: "1px solid rgba(23,32,51,.12)", borderRadius: 10, padding: "8px 10px", background: view === id ? C.blue : "rgba(255,255,255,.94)", color: view === id ? "#fff" : C.text, fontWeight: 800, fontSize: 11, cursor: autoMotion ? "not-allowed" : "pointer", opacity: autoMotion ? 0.65 : 1, boxShadow: "0 5px 18px rgba(0,0,0,.12)" }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ position: "absolute", top: 16, right: 16, pointerEvents: "auto", background: "rgba(255,255,255,.95)", borderRadius: 14, padding: "9px 12px", boxShadow: "0 8px 24px rgba(0,0,0,.13)", color: C.text, fontSize: 11, lineHeight: 1.45 }}>
            <b>3D Explore</b><br />
            Left mouse drag = orbit • Wheel = zoom<br />
            Right mouse drag = pan<br />
            Presets work in campus + every floor
          </div>

          {stage !== "campus" && (
            <div style={{ position: "absolute", top: 74, left: "50%", transform: "translateX(-50%)", pointerEvents: "none", background: "rgba(255,255,255,.96)", borderRadius: 14, padding: "10px 16px", boxShadow: "0 10px 28px rgba(0,0,0,.14)", color: C.text, fontWeight: 800, fontSize: 13 }}>
              {stage === "start" ? "START HERE • Main Gate" : stage === "route" ? "Following route → Main Gate" : stage === "stairs" ? "STAIRS • Walk down first → College Entrance" : stage === "entering" ? `Entering College • Floor ${target.floor}` : stage === "interiorWalk" ? `Corridor route → ${destination}` : `Arrived • ${destination}`}
            </div>
          )}

          {stage === "interior" && (
            <div style={{ position: "absolute", left: 16, bottom: 16, pointerEvents: "auto", background: "rgba(255,255,255,.96)", borderRadius: 16, padding: 14, width: 315, boxShadow: "0 12px 35px rgba(0,0,0,.18)" }}>
              <div style={{ color: C.blue, fontSize: 10, fontWeight: 900, letterSpacing: ".08em" }}>INDOOR CAMPUS NAVIGATION</div>
              <div style={{ color: C.text, fontSize: 17, fontWeight: 900, marginTop: 4 }}>{destination}</div>
              <div style={{ color: "#667085", fontSize: 12, lineHeight: 1.45, marginTop: 4 }}>
                {phase === "approach" ? "Follow the blue route to the Main Gate and entrance stairs." : phase === "stairs" ? "Walk down the visible stairs first. Then continue into the college." : phase === "corridor" ? `Now walk through the corridor toward ${destination}. Classrooms and labs stay visible.` : `Turn toward ${target.room}. You have reached the destination.`}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                {Array.from({ length: FLOORS }).map((_, f) => (
                  <button key={f} onClick={() => setFloor(f)} style={{ border: 0, borderRadius: 8, padding: "6px 9px", background: floor === f ? C.blue : "#eef2f7", color: floor === f ? "#fff" : C.text, fontWeight: 800, fontSize: 11, cursor: "pointer" }}>
                    {f === 0 ? "G" : f}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 9, fontSize: 10, color: "#667085" }}>W/A/S/D or arrow keys = walk camera • click any room = select it</div>
            </div>
          )}
        </div>
      </Html>
    </>
  );
}

export default function Campus3D({ navigationStarted = false, destination = "IT Lab", currentStep = 0 }) {
  return (
    <div style={{ width: "100%", height: "100%", minHeight: 600, position: "relative", overflow: "hidden", borderRadius: 20, background: C.sky }}>
      <Canvas
        shadows
        camera={{ position: [31, 27, 35], fov: 42, near: 0.1, far: 180 }}
        dpr={[1, 1.7]}
      >
        <Scene navigationStarted={navigationStarted} destination={destination} currentStep={currentStep} />
      </Canvas>
    </div>
  );
}
