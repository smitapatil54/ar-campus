import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Line, Text } from "@react-three/drei";
import * as THREE from "three";

/*
  MHSSCOE Campus 3D Navigation
  ------------------------------------------------------------
  UX flow:
  1. Explore = full campus / exterior overview
  2. Start Navigation = smooth camera flight to Main Gate
  3. "START HERE" appears
  4. Camera enters the college
  5. Floor + corridor + destination become visible
  6. Blue route connects the user to the destination

  This is a stylized architectural reconstruction for the prototype.
  It is intentionally built from reusable geometry instead of generic boxes.
*/

const C = {
  ground: "#e8e6df",
  road: "#c9c8c1",
  facade: "#d9c7b3",
  facadeLight: "#eadccb",
  trim: "#704c3d",
  trimDark: "#4c342d",
  roof: "#62504a",
  arch: "#f4eadf",
  glass: "#7ea8b4",
  window: "#58757d",
  greenery: "#5c8c63",
  greenDark: "#3f6848",
  blue: "#2f6fed",
  blueSoft: "#73a8ff",
  red: "#d94b4b",
  white: "#ffffff",
  text: "#172033",
  yellow: "#f4c95d",
};

const DESTINATIONS = {
  "IT Lab": { floor: 2, room: "IT LAB", position: [5.8, 8.9, -1.2] },
  "IT-301": { floor: 3, room: "IT-301", position: [4.9, 13.4, -1.2] },
  "IT-302": { floor: 2, room: "IT-302", position: [4.1, 8.9, -1.2] },
  "IT-303": { floor: 3, room: "IT-303", position: [2.6, 13.4, -1.2] },
  "AI Lab": { floor: 2, room: "AI LAB", position: [1.9, 8.9, -1.2] },
  Library: { floor: 1, room: "LIBRARY", position: [-5.7, 4.5, -1.2] },
  Canteen: { floor: 0, room: "CANTEEN", position: [7.4, 0.7, -1.2] },
  "Placement Cell": { floor: 1, room: "PLACEMENT", position: [-1.8, 4.5, -1.2] },
};

function useTarget(destination) {
  return DESTINATIONS[destination] || DESTINATIONS["IT Lab"];
}

function SmoothCamera({ mode, targetFloor = 2, navigationPhase = "stairs", currentStep = 0, onArrive }) {
  const { camera } = useThree();
  const controls = useRef();

  const targets = useMemo(
    () => ({
      campus: {
        position: new THREE.Vector3(28, 28, 34),
        look: new THREE.Vector3(0, 3, 0),
      },
      gate: {
        position: new THREE.Vector3(12, 8, 19),
        look: new THREE.Vector3(0, 3, 4),
      },
      entrance: {
        position: new THREE.Vector3(3.2, 5.2, 10.5),
        look: new THREE.Vector3(0, 4.2, 0),
      },
      interior: {
        0: {
          stairsLow: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 0, 0),
          },
          stairsHigh: {
            position: new THREE.Vector3(17, 13.5, 19),
            look: new THREE.Vector3(-2.5, 0, 0.5),
          },
          stairs: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 0, 0),
          },
          corridor: {
            position: new THREE.Vector3(17, 13, 21),
            look: new THREE.Vector3(0, 0, 0),
          },
          destination: {
            position: new THREE.Vector3(13, 10, 17),
            look: new THREE.Vector3(1.5, 0, 0),
          },
        },
        1: {
          stairsLow: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 3.15, 0),
          },
          stairsHigh: {
            position: new THREE.Vector3(17, 13.5, 19),
            look: new THREE.Vector3(-2.5, 3.15, 0.5),
          },
          stairs: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 3.15, 0),
          },
          corridor: {
            position: new THREE.Vector3(17, 13, 21),
            look: new THREE.Vector3(0, 3.15, 0),
          },
          destination: {
            position: new THREE.Vector3(13, 10, 17),
            look: new THREE.Vector3(1.5, 3.15, 0),
          },
        },
        2: {
          stairsLow: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 6.3, 0),
          },
          stairsHigh: {
            position: new THREE.Vector3(17, 13.5, 19),
            look: new THREE.Vector3(-2.5, 6.3, 0.5),
          },
          stairs: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 6.3, 0),
          },
          corridor: {
            position: new THREE.Vector3(17, 13, 21),
            look: new THREE.Vector3(0, 6.3, 0),
          },
          destination: {
            position: new THREE.Vector3(13, 10, 17),
            look: new THREE.Vector3(1.5, 6.3, 0),
          },
        },
        3: {
          stairsLow: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 9.45, 0),
          },
          stairsHigh: {
            position: new THREE.Vector3(17, 13.5, 19),
            look: new THREE.Vector3(-2.5, 9.45, 0.5),
          },
          stairs: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 9.45, 0),
          },
          corridor: {
            position: new THREE.Vector3(17, 13, 21),
            look: new THREE.Vector3(0, 9.45, 0),
          },
          destination: {
            position: new THREE.Vector3(13, 10, 17),
            look: new THREE.Vector3(1.5, 9.45, 0),
          },
        },
        4: {
          stairsLow: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 12.6, 0),
          },
          stairsHigh: {
            position: new THREE.Vector3(17, 13.5, 19),
            look: new THREE.Vector3(-2.5, 12.6, 0.5),
          },
          stairs: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 12.6, 0),
          },
          corridor: {
            position: new THREE.Vector3(17, 13, 21),
            look: new THREE.Vector3(0, 12.6, 0),
          },
          destination: {
            position: new THREE.Vector3(13, 10, 17),
            look: new THREE.Vector3(1.5, 12.6, 0),
          },
        },
        5: {
          stairsLow: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 15.75, 0),
          },
          stairsHigh: {
            position: new THREE.Vector3(17, 13.5, 19),
            look: new THREE.Vector3(-2.5, 15.75, 0.5),
          },
          stairs: {
            position: new THREE.Vector3(18, 15, 22),
            look: new THREE.Vector3(-6.2, 15.75, 0),
          },
          corridor: {
            position: new THREE.Vector3(17, 13, 21),
            look: new THREE.Vector3(0, 15.75, 0),
          },
          destination: {
            position: new THREE.Vector3(13, 10, 17),
            look: new THREE.Vector3(1.5, 15.75, 0),
          },
        },
      },
    }),
    []
  );

  const destination =
    mode === "campus"
      ? targets.campus
      : mode === "gate"
      ? targets.gate
      : mode === "entrance"
      ? targets.entrance
      : targets.interior[Math.min(5, Math.max(0, targetFloor))][
          navigationPhase === "stairs"
            ? currentStep <= 0
              ? "stairsLow"
              : "stairsHigh"
            : navigationPhase
        ] ||
        targets.interior[Math.min(5, Math.max(0, targetFloor))].stairs;

  useFrame((_, delta) => {
    const speed = mode === "campus" ? 4.5 : 2.5;

    camera.position.lerp(destination.position, 1 - Math.exp(-speed * delta));

    if (controls.current) {
      controls.current.target.lerp(
        destination.look,
        1 - Math.exp(-speed * delta)
      );
      controls.current.update();
    }

    const distance = camera.position.distanceTo(destination.position);

    if (mode !== "campus" && distance < 0.22 && onArrive) {
      onArrive();
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enablePan
      enableDamping
      dampingFactor={0.08}
      minDistance={5}
      maxDistance={65}
      maxPolarAngle={Math.PI * 0.48}
    />
  );
}

function Ground() {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[70, 62]} />
        <meshStandardMaterial color={C.ground} />
      </mesh>

      {/* Main approach road */}
      <mesh position={[0, 0.03, 16]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[10, 32]} />
        <meshStandardMaterial color={C.road} />
      </mesh>

      {/* Courtyard road */}
      <mesh position={[0, 0.035, 1]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[24, 9]} />
        <meshStandardMaterial color={C.road} />
      </mesh>

      {/* Exit-side path */}
      <mesh position={[-17, 0.04, 2]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color={C.road} />
      </mesh>
    </>
  );
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 2.2, 8]} />
        <meshStandardMaterial color="#684638" />
      </mesh>
      <mesh position={[0, 2.8, 0]} castShadow>
        <sphereGeometry args={[1.25, 16, 12]} />
        <meshStandardMaterial color={C.greenDark} />
      </mesh>
      <mesh position={[0.65, 3.1, 0.15]} scale={0.7} castShadow>
        <sphereGeometry args={[1.05, 16, 12]} />
        <meshStandardMaterial color={C.greenery} />
      </mesh>
    </group>
  );
}

function ArchWindow({ position, scale = 1, dark = false }) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[1.0, 1.45, 0.12]} />
        <meshStandardMaterial color={dark ? C.window : C.arch} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.12, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={dark ? C.window : C.arch} />
      </mesh>
      <mesh position={[-0.38, 0, 0.08]}>
        <boxGeometry args={[0.06, 1.2, 0.05]} />
        <meshStandardMaterial color={C.trim} />
      </mesh>
      <mesh position={[0.38, 0, 0.08]}>
        <boxGeometry args={[0.06, 1.2, 0.05]} />
        <meshStandardMaterial color={C.trim} />
      </mesh>
    </group>
  );
}

function VerticalColumn({ position, height = 12 }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.34, height, 0.42]} />
      <meshStandardMaterial color={C.trimDark} />
    </mesh>
  );
}

function Dome({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[1.25, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={C.trim} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <coneGeometry args={[0.18, 0.55, 8]} />
        <meshStandardMaterial color={C.trimDark} />
      </mesh>
    </group>
  );
}

function GalleryRail({ position, width = 8, z = 0 }) {
  return (
    <group position={[position[0], position[1], position[2]]}>
      <mesh position={[0, 0.05, z]}>
        <boxGeometry args={[width, 0.12, 0.12]} />
        <meshStandardMaterial color={C.trimDark} />
      </mesh>
      {Array.from({ length: Math.max(3, Math.floor(width / 1.1)) }).map((_, i) => (
        <mesh key={i} position={[-width / 2 + (i * width) / (Math.max(3, Math.floor(width / 1.1)) - 1), -0.48, z]}>
          <boxGeometry args={[0.08, 1.0, 0.08]} />
          <meshStandardMaterial color={C.trimDark} />
        </mesh>
      ))}
    </group>
  );
}

function Wing({ position, width = 16, depth = 7, floors = 5, rotate = 0 }) {
  const floorHeight = 3.15;
  const totalHeight = floors * floorHeight;
  const sideCols = Math.max(5, Math.floor(depth / 1.9));
  const endCols = Math.max(3, Math.floor(width / 2.0));

  return (
    <group position={position} rotation-y={rotate}>
      {/* Structural shell broken into floor bands so it reads as architecture, not a single block. */}
      <mesh position={[0, totalHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, totalHeight, depth]} />
        <meshStandardMaterial color={C.facadeLight} />
      </mesh>

      {Array.from({ length: floors + 1 }).map((_, i) => (
        <mesh key={`band-${i}`} position={[0, i * floorHeight, 0]}>
          <boxGeometry args={[width + 0.45, 0.18, depth + 0.35]} />
          <meshStandardMaterial color={i === 0 ? C.trimDark : C.trim} />
        </mesh>
      ))}

      {/* Long gallery sides */}
      {[-width / 2 - 0.04, width / 2 + 0.04].map((x) => (
        <group key={`gallery-side-${x}`}>
          {Array.from({ length: floors }).map((_, floor) => (
            <group key={floor} position={[x, floor * floorHeight + 0.78, 0]}>
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.22, 0.18, depth - 0.5]} />
                <meshStandardMaterial color={C.trimDark} />
              </mesh>
              {Array.from({ length: sideCols }).map((__, i) => (
                <mesh key={i} position={[0, -0.45, -depth / 2 + 0.55 + (i * (depth - 1.1)) / (sideCols - 1)]}>
                  <boxGeometry args={[0.10, 0.95, 0.10]} />
                  <meshStandardMaterial color={C.trimDark} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* Windows along both long sides */}
      {[-width / 2 - 0.16, width / 2 + 0.16].map((x, side) =>
        Array.from({ length: floors }).map((_, floor) =>
          Array.from({ length: sideCols - 1 }).map((__, col) => (
            <group key={`side-window-${side}-${floor}-${col}`} position={[x, floor * floorHeight + 1.65, -depth / 2 + 1.15 + (col * (depth - 2.3)) / (sideCols - 2)]}>
              <ArchWindow position={[0, 0, 0]} scale={0.58} dark={col % 3 === 0} />
            </group>
          ))
        )
      )}

      {/* End façades */}
      {[-depth / 2 - 0.18, depth / 2 + 0.18].map((z, side) => (
        <group key={`end-${side}`}>
          {Array.from({ length: floors }).map((_, floor) =>
            Array.from({ length: endCols }).map((__, col) => (
              <ArchWindow
                key={`end-window-${side}-${floor}-${col}`}
                position={[-width / 2 + 1.0 + (col * (width - 2.0)) / (endCols - 1), floor * floorHeight + 1.65, z]}
                scale={0.60}
                dark={col % 2 === 0}
              />
            ))
          )}
          <mesh position={[0, totalHeight + 0.35, z * 0.98]}>
            <boxGeometry args={[width + 0.4, 0.45, 0.35]} />
            <meshStandardMaterial color={C.roof} />
          </mesh>
        </group>
      ))}

      {/* Floor slab edges / gallery bands */}
      {Array.from({ length: floors }).map((_, floor) => (
        <mesh key={`front-gallery-${floor}`} position={[0, floor * floorHeight + 0.55, depth / 2 + 0.42]}>
          <boxGeometry args={[width - 0.45, 0.12, 0.12]} />
          <meshStandardMaterial color={C.trimDark} />
        </mesh>
      ))}
    </group>
  );
}
function MainEntrance() {
  return (
    <group position={[0, 0, 6.2]}>
      {/* Central projecting entrance block */}
      <mesh position={[0, 9.5, 0]} castShadow>
        <boxGeometry args={[8.2, 19, 3.2]} />
        <meshStandardMaterial color={C.facadeLight} />
      </mesh>

      {/* Dark vertical framing */}
      {[-3.3, -2.1, 2.1, 3.3].map((x) => (
        <mesh key={x} position={[x, 9.5, 1.72]}>
          <boxGeometry args={[0.35, 18.4, 0.32]} />
          <meshStandardMaterial color={C.trimDark} />
        </mesh>
      ))}

      {/* Entrance arch / portal */}
      <mesh position={[0, 2.7, 1.78]}>
        <boxGeometry args={[3.8, 5.8, 0.42]} />
        <meshStandardMaterial color={C.trimDark} />
      </mesh>

      <mesh position={[0, 2.7, 2.02]}>
        <boxGeometry args={[2.75, 4.75, 0.18]} />
        <meshStandardMaterial color="#253744" />
      </mesh>

      {/* Tall entrance sign */}
      <Text
        position={[0, 15.7, 1.95]}
        fontSize={0.62}
        color={C.text}
        anchorX="center"
        anchorY="middle"
        maxWidth={7}
      >
        M.H. SABOO SIDDIK COLLEGE
      </Text>

      {/* Central crown */}
      <mesh position={[0, 20.0, 0]}>
        <boxGeometry args={[6.8, 1.4, 3.8]} />
        <meshStandardMaterial color={C.trim} />
      </mesh>

      <Dome position={[-2.8, 20.7, 0]} scale={0.85} />
      <Dome position={[2.8, 20.7, 0]} scale={0.85} />

      {/* Clearly visible entrance staircase */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.14 + i * 0.14, 4.15 - i * 0.48]}
          receiveShadow
        >
          <boxGeometry args={[7.0 - i * 0.22, 0.28, 0.62]} />
          <meshStandardMaterial color={i % 2 ? "#cfc5ba" : "#bdb2a7"} />
        </mesh>
      ))}

      <mesh position={[0, 1.05, 1.1]}>
        <boxGeometry args={[5.8, 0.16, 0.16]} />
        <meshStandardMaterial color={C.trimDark} />
      </mesh>
    </group>
  );
}

function MainCollegeBuilding() {
  const floorHeight = 3.15;
  const floors = 5;
  const totalHeight = floorHeight * floors;

  return (
    <group>
      {/* Main rectangular academic block */}
      <group position={[0, 0, -5]}>
        <mesh position={[0, totalHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[32, totalHeight, 8.5]} />
          <meshStandardMaterial color={C.facadeLight} />
        </mesh>

        {/* Deep horizontal floor galleries */}
        {Array.from({ length: floors + 1 }).map((_, i) => (
          <mesh key={`floor-band-${i}`} position={[0, i * floorHeight, 4.42]}>
            <boxGeometry args={[32.5, 0.24, 0.42]} />
            <meshStandardMaterial color={i === 0 ? C.trimDark : C.trim} />
          </mesh>
        ))}

        {/* Vertical façade piers */}
        {Array.from({ length: 15 }).map((_, i) => (
          <VerticalColumn
            key={`main-pier-${i}`}
            height={totalHeight}
            position={[-15.5 + i * (31 / 14), totalHeight / 2, 4.55]}
          />
        ))}

        {/* Five levels of tall windows */}
        {Array.from({ length: floors }).map((_, floor) =>
          Array.from({ length: 13 }).map((__, col) => (
            <ArchWindow
              key={`main-front-window-${floor}-${col}`}
              position={[-13.8 + col * 2.3, floor * floorHeight + 1.65, 4.70]}
              scale={0.67}
              dark={col % 4 === 0}
            />
          ))
        )}

        {/* Window mullions and gallery rails */}
        {Array.from({ length: floors }).map((_, floor) => (
          <group key={`main-gallery-${floor}`} position={[0, floor * floorHeight + 0.62, 4.92]}>
            <mesh>
              <boxGeometry args={[31.3, 0.11, 0.10]} />
              <meshStandardMaterial color={C.trimDark} />
            </mesh>
            {Array.from({ length: 28 }).map((__, i) => (
              <mesh key={i} position={[-15.1 + i * 1.12, -0.48, 0]}>
                <boxGeometry args={[0.07, 0.92, 0.07]} />
                <meshStandardMaterial color={C.trimDark} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Side elevations with windows so the building remains detailed from every camera angle */}
        {[-16.25, 16.25].map((x, side) => (
          <group key={`main-side-${side}`}>
            {Array.from({ length: floors }).map((_, floor) =>
              Array.from({ length: 3 }).map((__, col) => (
                <ArchWindow
                  key={`side-window-${side}-${floor}-${col}`}
                  position={[x, floor * floorHeight + 1.65, -2.7 + col * 2.7]}
                  scale={0.70}
                  dark={col === 1}
                />
              ))
            )}
            <mesh position={[x, totalHeight / 2, 4.0]}>
              <boxGeometry args={[0.25, totalHeight, 0.25]} />
              <meshStandardMaterial color={C.trimDark} />
            </mesh>
          </group>
        ))}

        {/* Rear windows */}
        {Array.from({ length: floors }).map((_, floor) =>
          Array.from({ length: 11 }).map((__, col) => (
            <ArchWindow
              key={`rear-window-${floor}-${col}`}
              position={[-12.5 + col * 2.5, floor * floorHeight + 1.65, -4.70]}
              scale={0.56}
              dark={col % 3 === 0}
            />
          ))
        )}

        <mesh position={[0, totalHeight + 0.35, 0]}>
          <boxGeometry args={[32.7, 0.72, 8.9]} />
          <meshStandardMaterial color={C.roof} />
        </mesh>
      </group>

      {/* Central projecting entrance / historic tower composition */}
      <group position={[0, 0, -0.35]}>
        <mesh position={[0, 9.2, 0]} castShadow>
          <boxGeometry args={[8.4, 18.4, 3.3]} />
          <meshStandardMaterial color={C.facadeLight} />
        </mesh>

        {[-3.35, -2.05, 2.05, 3.35].map((x) => (
          <mesh key={x} position={[x, 9.3, 1.78]}>
            <boxGeometry args={[0.36, 17.9, 0.36]} />
            <meshStandardMaterial color={C.trimDark} />
          </mesh>
        ))}

        {/* Recessed tall central gallery */}
        <mesh position={[0, 12.15, 1.82]}>
          <boxGeometry args={[4.05, 7.2, 0.18]} />
          <meshStandardMaterial color={C.trimDark} />
        </mesh>
        <mesh position={[0, 12.15, 1.95]}>
          <boxGeometry args={[3.3, 6.35, 0.08]} />
          <meshStandardMaterial color={C.glass} />
        </mesh>
        {[-1.1, 0, 1.1].map((x) => (
          <mesh key={`tower-v-${x}`} position={[x, 12.15, 2.05]}>
            <boxGeometry args={[0.08, 6.25, 0.08]} />
            <meshStandardMaterial color={C.trimDark} />
          </mesh>
        ))}
        {[-2.4, -1.2, 0, 1.2, 2.4].map((y) => (
          <mesh key={`tower-h-${y}`} position={[0, 12.15 + y, 2.05]}>
            <boxGeometry args={[3.15, 0.08, 0.08]} />
            <meshStandardMaterial color={C.trimDark} />
          </mesh>
        ))}

        {/* Main entrance doors */}
        <mesh position={[0, 2.35, 1.83]}>
          <boxGeometry args={[3.2, 4.7, 0.22]} />
          <meshStandardMaterial color="#283b48" />
        </mesh>
        {[-0.75, 0.75].map((x) => (
          <mesh key={x} position={[x, 2.35, 1.98]}>
            <boxGeometry args={[0.06, 4.25, 0.06]} />
            <meshStandardMaterial color="#cbd5df" />
          </mesh>
        ))}
        <mesh position={[0, 4.55, 2.0]}>
          <boxGeometry args={[3.15, 0.08, 0.08]} />
          <meshStandardMaterial color="#cbd5df" />
        </mesh>

        <Text position={[0, 7.65, 2.02]} fontSize={0.42} color={C.text} anchorX="center">
          M.H. SABOO SIDDIK
        </Text>

        <mesh position={[0, 18.85, 0]}>
          <boxGeometry args={[6.9, 1.25, 3.9]} />
          <meshStandardMaterial color={C.trim} />
        </mesh>
        <Dome position={[-2.25, 19.9, 0]} scale={0.74} />
        <Dome position={[2.25, 19.9, 0]} scale={0.74} />

        {/* Wide entrance steps */}
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={`entry-step-${i}`} position={[0, 0.13 + i * 0.15, 3.9 - i * 0.45]}>
            <boxGeometry args={[7.1 - i * 0.2, 0.26, 0.58]} />
            <meshStandardMaterial color={i % 2 ? '#cfc5ba' : '#b8aea4'} />
          </mesh>
        ))}

        {/* Entrance canopy and gallery rails */}
        <mesh position={[0, 5.2, 2.65]}>
          <boxGeometry args={[6.0, 0.18, 1.0]} />
          <meshStandardMaterial color={C.trimDark} />
        </mesh>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={`canopy-post-${i}`} position={[-2.7 + i * 0.9, 4.65, 2.95]}>
            <boxGeometry args={[0.08, 1.1, 0.08]} />
            <meshStandardMaterial color={C.trimDark} />
          </mesh>
        ))}
      </group>

      {/* 90° left and right wings with detailed galleries */}
      <Wing position={[-11.7, 0, -3.2]} width={8.8} depth={18} floors={5} rotate={Math.PI / 2} />
      <Wing position={[11.7, 0, -3.2]} width={8.8} depth={18} floors={5} rotate={-Math.PI / 2} />

      {/* Open courtyard / college forecourt */}
      <mesh position={[0, 0.06, 5.2]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[24, 8]} />
        <meshStandardMaterial color="#d5d0c7" />
      </mesh>
      {[-8, 8].map((x) => (
        <group key={x} position={[x, 0, 5.2]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[1.8, 1.8, 0.24, 32]} />
            <meshStandardMaterial color="#b8b0a7" />
          </mesh>
          <Tree position={[0, 0.15, 0]} scale={0.75} />
        </group>
      ))}

      <Text position={[0, 0.2, 9]} fontSize={0.48} color="#7a736d" anchorX="center">
        M.H. SABOO SIDDIK COLLEGE CAMPUS
      </Text>
    </group>
  );
}
function AnnexBuilding({ position, label, width = 8, depth = 6, height = 5 }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={C.facadeLight} />
      </mesh>
      <mesh position={[0, height + 0.22, 0]}>
        <boxGeometry args={[width + 0.4, 0.45, depth + 0.4]} />
        <meshStandardMaterial color={C.roof} />
      </mesh>

      {[-width / 3, 0, width / 3].map((x) => (
        <ArchWindow
          key={x}
          position={[x, height * 0.57, depth / 2 + 0.12]}
          scale={0.7}
          dark
        />
      ))}

      <Text
        position={[0, height + 0.65, depth / 2]}
        fontSize={0.5}
        color={C.text}
        anchorX="center"
      >
        {label}
      </Text>
    </group>
  );
}

function Gate({ position, label, highlighted = false }) {
  return (
    <group position={position}>
      <mesh position={[-2.5, 2.1, 0]}>
        <boxGeometry args={[0.28, 4.2, 0.28]} />
        <meshStandardMaterial color={highlighted ? C.blue : C.trimDark} />
      </mesh>
      <mesh position={[2.5, 2.1, 0]}>
        <boxGeometry args={[0.28, 4.2, 0.28]} />
        <meshStandardMaterial color={highlighted ? C.blue : C.trimDark} />
      </mesh>
      <mesh position={[0, 4.0, 0]}>
        <boxGeometry args={[5.3, 0.3, 0.3]} />
        <meshStandardMaterial color={highlighted ? C.blue : C.trimDark} />
      </mesh>
      <Text
        position={[0, 4.55, 0]}
        fontSize={0.48}
        color={highlighted ? C.blue : C.text}
        anchorX="center"
      >
        {label}
      </Text>
    </group>
  );
}

function YouMarker({ position = [0, 0.2, 18], pulse = false }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current && pulse) {
      const s = 1 + Math.sin(clock.elapsedTime * 4) * 0.08;
      ref.current.scale.setScalar(s);
    }
  });

  return (
    <group position={position} ref={ref}>
      <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.0, 32]} />
        <meshBasicMaterial color={C.blue} transparent opacity={0.18} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshBasicMaterial color={C.blue} />
      </mesh>
      <Html center position={[0, 1.5, 0]}>
        <div style={{
          background: "#ffffff",
          border: `2px solid ${C.blue}`,
          borderRadius: 10,
          padding: "6px 10px",
          font: "700 12px Inter, sans-serif",
          color: C.blue,
          whiteSpace: "nowrap",
          boxShadow: "0 5px 18px rgba(0,0,0,.12)",
        }}>
          YOU ARE HERE
        </div>
      </Html>
    </group>
  );
}

function DynamicYouMarker({ targetPosition, duration = 1.7 }) {
  const groupRef = useRef();
  const current = useRef(new THREE.Vector3(...targetPosition));
  const from = useRef(new THREE.Vector3(...targetPosition));
  const target = useRef(new THREE.Vector3(...targetPosition));
  const startedAt = useRef(performance.now());

  useEffect(() => {
    from.current.copy(current.current);
    target.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
    startedAt.current = performance.now();
  }, [targetPosition[0], targetPosition[1], targetPosition[2]]);

  useFrame(({ clock }) => {
    const t = Math.min(1, (performance.now() - startedAt.current) / 1000 / duration);
    const eased = t * t * (3 - 2 * t);
    current.current.lerpVectors(from.current, target.current, eased);

    if (groupRef.current) {
      groupRef.current.position.copy(current.current);
      groupRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 5) * 0.06);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.0, 32]} />
        <meshBasicMaterial color={C.blue} transparent opacity={0.18} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.30, 20, 16]} />
        <meshBasicMaterial color={C.blue} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <coneGeometry args={[0.18, 0.55, 16]} />
        <meshBasicMaterial color={C.blue} />
      </mesh>
      <Html center position={[0, 1.55, 0]}>
        <div style={{
          background: "#ffffff",
          border: `2px solid ${C.blue}`,
          borderRadius: 10,
          padding: "6px 10px",
          font: "700 12px Inter, sans-serif",
          color: C.blue,
          whiteSpace: "nowrap",
          boxShadow: "0 5px 18px rgba(0,0,0,.12)",
        }}>
          YOU ARE HERE
        </div>
      </Html>
    </group>
  );
}


function StartHereMarker({ visible }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 0.7 + Math.sin(clock.elapsedTime * 3) * 0.08;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[0, 0.7, 25.2]}>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.65, 0.95, 32]} />
        <meshBasicMaterial color={C.blue} transparent opacity={0.9} />
      </mesh>
      <Html center position={[0, 1.7, 0]}>
        <div
          style={{
            background: C.blue,
            color: "#fff",
            padding: "9px 14px",
            borderRadius: 999,
            font: "800 12px Inter, sans-serif",
            letterSpacing: ".04em",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 24px rgba(47,111,237,.35)",
          }}
        >
          START HERE
        </div>
      </Html>
    </group>
  );
}

function CampusRoute({ active }) {
  if (!active) return null;

  const points = [
    [0, 0.22, 18],
    [0, 0.22, 12.2],
    [0, 0.22, 18.0],
    [0, 0.22, 10.0],
    [0, 0.22, 5.0],
  ];

  return (
    <>
      <Line
        points={points}
        color={C.blue}
        lineWidth={4}
        transparent
        opacity={0.95}
      />
      <mesh position={[0, 0.25, 12.2]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.25, 20]} />
        <meshBasicMaterial color={C.blue} />
      </mesh>
    </>
  );
}

function CampusExterior({ navigationStage, currentStep = 0 }) {
  const navigating = navigationStage !== "campus";
  const routePoints =
    currentStep <= 0
      ? [[-15, 0.24, 28], [0, 0.24, 28], [0, 0.24, 20], [0, 0.24, 12], [0, 0.24, 5]]
      : currentStep === 1
      ? [[0, 0.24, 20], [0, 0.24, 12], [0, 0.24, 5]]
      : [[0, 0.24, 12], [0, 0.24, 5]];

  return (
    <group>
      <Ground />
      <MainCollegeBuilding />

      {/* Large open courtyard */}
      <mesh position={[0, 0.055, 11]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[34, 21]} />
        <meshStandardMaterial color="#dedbd4" />
      </mesh>

      {/* Front-side canteen, with GCR behind it */}
      <AnnexBuilding position={[19, 0, 10.5]} label="CANTEEN" width={7.5} depth={5.2} height={5} />
      <AnnexBuilding position={[19, 0, 4.7]} label="GCR" width={6.7} depth={4.4} height={4.5} />

      <AnnexBuilding position={[-5, 0, -20]} label="LIBRARY" width={9} depth={7} height={6} />
      <AnnexBuilding position={[-20, 0, -15]} label="DIPLOMA BLOCK" width={9} depth={7} height={7} />

      {/* Two front entry points + side exit */}
      <Gate position={[-15, 0, 29]} label="MAIN GATE" highlighted={navigating} />
      <Gate position={[15, 0, 29]} label="ENTRY GATE" />
      <Gate position={[-26, 0, 4]} label="EXIT GATE" />

      <Tree position={[-21, 0, 21]} scale={0.9} />
      <Tree position={[21, 0, 21]} scale={1.0} />
      <Tree position={[-23, 0, 10]} scale={0.8} />
      <Tree position={[23, 0, 10]} scale={0.9} />
      <Tree position={[-21, 0, -2]} scale={0.75} />
      <Tree position={[21, 0, -2]} scale={0.75} />

      {!navigating ? (
        <YouMarker position={[0, 0.2, 25.2]} pulse />
      ) : (
        <DynamicYouMarker
          targetPosition={
            navigationStage === "start"
              ? [-15, 0.25, 28]
              : currentStep <= 0
              ? [0, 0.25, 20]
              : currentStep === 1
              ? [0, 0.25, 12]
              : [0, 0.25, 5]
          }
        />
      )}
      <StartHereMarker visible={navigationStage === "start"} />

      {navigating && navigationStage !== "start" && (
        <>
          <Line points={routePoints} color={C.blue} lineWidth={4} />
          {routePoints.slice(1).map((p, i) => (
            <mesh key={i} position={[p[0], 0.3, p[2]]} rotation-x={-Math.PI / 2}>
              <circleGeometry args={[0.2, 20]} />
              <meshBasicMaterial color={C.blue} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
function InteriorRoom({ x, y, label, active = false, width = 3.2 }) {
  return (
    <group position={[x, y, -1.3]}>
      <mesh>
        <boxGeometry args={[width, 2.35, 2.5]} />
        <meshStandardMaterial
          color={active ? "#dceaff" : "#f0e9df"}
          emissive={active ? "#376edc" : "#000000"}
          emissiveIntensity={active ? 0.15 : 0}
        />
      </mesh>
      <mesh position={[0, 0, 1.27]}>
        <boxGeometry args={[width * 0.78, 1.55, 0.08]} />
        <meshStandardMaterial color={active ? C.blue : C.window} />
      </mesh>
      <Text
        position={[0, 0, 1.38]}
        fontSize={0.35}
        color={active ? "#ffffff" : C.text}
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.3}
      >
        {label}
      </Text>
    </group>
  );
}

function Stairs({ x = -4.5, y = 0 }) {
  return (
    <group position={[x, y, 0]}>
      {/* lower staircase */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={`lower-${i}`} position={[i * 0.32, i * 0.16, 0]}>
          <boxGeometry args={[0.62, 0.30, 2.2]} />
          <meshStandardMaterial color={i % 2 ? "#a9a198" : "#c0b8af"} />
        </mesh>
      ))}

      {/* landing */}
      <mesh position={[1.75, 1.48, 0]}>
        <boxGeometry args={[2.0, 0.30, 2.35]} />
        <meshStandardMaterial color="#aaa198" />
      </mesh>

      {/* upper staircase */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={`upper-${i}`} position={[2.15 - i * 0.32, 1.64 + i * 0.16, 0]}>
          <boxGeometry args={[0.62, 0.30, 2.2]} />
          <meshStandardMaterial color={i % 2 ? "#a9a198" : "#c0b8af"} />
        </mesh>
      ))}

      <Text position={[1.0, 3.35, 1.35]} fontSize={0.34} color={C.text}>
        STAIRS ↑
      </Text>

      <Html center position={[1.0, 2.8, 1.55]}>
        <div
          style={{
            background: "#fff",
            border: `2px solid ${C.blue}`,
            borderRadius: 999,
            padding: "5px 9px",
            color: C.blue,
            font: "800 11px Inter, sans-serif",
            whiteSpace: "nowrap",
            boxShadow: "0 5px 14px rgba(0,0,0,.12)",
          }}
        >
          GO UP
        </div>
      </Html>
    </group>
  );
}

function Lift({ x = -7, y = 0, label = "STUDENT LIFT" }) {
  return (
    <group position={[x, y, 0]}>
      <mesh>
        <boxGeometry args={[2.1, 2.7, 2.0]} />
        <meshStandardMaterial color="#d8dce2" />
      </mesh>
      <mesh position={[0, 0, 1.02]}>
        <boxGeometry args={[1.45, 1.8, 0.08]} />
        <meshStandardMaterial color="#52606b" />
      </mesh>
      <Text position={[0, 1.55, 1.12]} fontSize={0.27} color={C.text}>
        {label}
      </Text>
    </group>
  );
}

function Washroom({ x, y, label }) {
  return (
    <group position={[x, y, -1.3]}>
      <mesh>
        <boxGeometry args={[2.4, 2.35, 2.4]} />
        <meshStandardMaterial color="#e8eef1" />
      </mesh>
      <Text position={[0, 0, 1.27]} fontSize={0.28} color={C.text}>
        {label}
      </Text>
    </group>
  );
}

function LabFurniture({ type = "lab" }) {
  const count = type === "computer" ? 6 : 5;
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const x = -5.2 + (i % 3) * 2.8;
        const z = -3.9 + Math.floor(i / 3) * 2.0;
        return (
          <group key={i} position={[x, 0.45, z]}>
            <mesh>
              <boxGeometry args={[2.1, 0.18, 0.9]} />
              <meshStandardMaterial color="#b6a99d" />
            </mesh>
            <mesh position={[0, 0.35, -0.25]}>
              <boxGeometry args={[1.45, 0.55, 0.12]} />
              <meshStandardMaterial color="#596b78" />
            </mesh>
            <mesh position={[0, 0.02, 0.55]}>
              <boxGeometry args={[1.1, 0.65, 0.08]} />
              <meshStandardMaterial color="#7a665b" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function ClassroomFurniture() {
  return (
    <group>
      <mesh position={[7.0, 1.15, -4.9]}>
        <boxGeometry args={[5.2, 2.0, 0.16]} />
        <meshStandardMaterial color="#e8e2da" />
      </mesh>
      <mesh position={[7.0, 0.62, -4.75]}>
        <boxGeometry args={[4.6, 0.75, 0.08]} />
        <meshStandardMaterial color="#50616d" />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i} position={[5.0 + (i % 3) * 2.0, 0.48, -2.6 + Math.floor(i / 3) * 1.8]}>
          <mesh>
            <boxGeometry args={[1.45, 0.16, 0.7]} />
            <meshStandardMaterial color="#b8aaa0" />
          </mesh>
          <mesh position={[0, 0.38, 0.15]}>
            <boxGeometry args={[1.0, 0.45, 0.08]} />
            <meshStandardMaterial color="#6f7f88" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FloorInterior({ floor, destination, navigationPhase = "stairs", currentStep = 0 }) {
  const target = useTarget(destination);
  const showStairs = navigationPhase === "stairs";
  const showCorridor = navigationPhase === "corridor" || navigationPhase === "destination";
  const showDestination = navigationPhase === "destination";

  const floorRooms = {
    0: [
      ["GCR", -9, -2, 4.0],
      ["CANTEEN", 8.5, -2, 4.5],
      ["MAIN ENTRANCE", 0, -5.1, 4.2],
    ],
    1: [
      ["ALMA LATIFI HALL", -8.5, -2, 5.5],
      ["ROOM 103", 1.8, -2, 4.0],
      ["ROOM 104", 7.0, -2, 4.0],
      ["LIBRARY", -2.0, 4.8, 5.0],
    ],
    2: [
      ["AI LAB", -7.0, -2, 4.2],
      ["IT-302", 0.8, -2, 4.0],
      ["IT LAB", 6.8, -2, 5.0],
      ["PROGRAMMING LAB", -2.5, 4.8, 5.0],
    ],
    3: [
      ["COMPUTER CENTRE", -7.0, -2, 4.8],
      ["IT-303", 0.0, -2, 4.0],
      ["IT-301", 6.8, -2, 4.0],
      ["STUDENT LIFT", -9.0, 4.8, 3.5],
    ],
    4: [
      ["BCR", -7.0, -2, 4.2],
      ["SEMINAR HALL", 0.5, -2, 5.8],
      ["ROOM 407", 7.2, -2, 4.0],
    ],
    5: [
      ["ADV. COMMUNICATION LAB", -7.0, -2, 5.4],
      ["BASIC COMMUNICATION LAB", 0.0, -2, 5.4],
      ["MFOC LAB", 7.0, -2, 4.4],
      ["ANTENNA LAB", -3.0, 4.8, 4.5],
    ],
  };

  const rooms = floorRooms[floor] || floorRooms[2];

  return (
    <group position={[0, floor * 3.15, 0]}>
      {/* Full floor slab and perimeter */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[29, 0.6, 17]} />
        <meshStandardMaterial color="#d5d0c8" />
      </mesh>
      <Line
        points={[[-14.5, 0.02, -8.5], [14.5, 0.02, -8.5], [14.5, 0.02, 8.5], [-14.5, 0.02, 8.5], [-14.5, 0.02, -8.5]]}
        color="#82776f"
        lineWidth={3}
      />

      {/* Open-cutaway perimeter walls */}
      <mesh position={[0, 1.55, -8.15]}>
        <boxGeometry args={[28.6, 3.1, 0.3]} />
        <meshStandardMaterial color={C.facadeLight} />
      </mesh>
      <mesh position={[-14.15, 1.55, 0]}>
        <boxGeometry args={[0.3, 3.1, 16]} />
        <meshStandardMaterial color={C.facadeLight} />
      </mesh>
      <mesh position={[14.15, 1.55, 0]}>
        <boxGeometry args={[0.3, 3.1, 16]} />
        <meshStandardMaterial color={C.facadeLight} />
      </mesh>

      {/* Central corridor */}
      <mesh position={[0, 0.08, 0.8]}>
        <boxGeometry args={[25.5, 0.12, 4.4]} />
        <meshStandardMaterial color="#bcb4aa" />
      </mesh>
      <Line points={[[-12.4, 0.17, -1.4], [12.4, 0.17, -1.4]]} color="#a59b92" lineWidth={2} />
      <Line points={[[-12.4, 0.17, 3.0], [12.4, 0.17, 3.0]]} color="#a59b92" lineWidth={2} />

      {/* Interior ceiling beams + corridor lights */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`ceiling-beam-${i}`} position={[-10.5 + i * 3.5, 2.85, 0.8]}>
          <boxGeometry args={[0.18, 0.12, 4.1]} />
          <meshStandardMaterial color="#b9b1a8" />
        </mesh>
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`ceiling-light-${i}`} position={[-10.5 + i * 3.5, 2.82, 0.8]}>
          <boxGeometry args={[0.55, 0.06, 1.05]} />
          <meshStandardMaterial color="#fff6d6" emissive="#fff2b2" emissiveIntensity={0.25} />
        </mesh>
      ))}

      {/* Corridor wall doors and notice panels */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`corridor-detail-${i}`} position={[-10 + i * 4, 0, -1.58]}>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[1.35, 2.1, 0.10]} />
            <meshStandardMaterial color="#806b5e" />
          </mesh>
          <mesh position={[0.34, 1.05, 0.07]}>
            <boxGeometry args={[0.05, 1.82, 0.05]} />
            <meshStandardMaterial color="#d5c9be" />
          </mesh>
        </group>
      ))}
      {[-9.5, -3.5, 2.5, 8.5].map((x, i) => (
        <group key={`notice-${i}`} position={[x, 1.45, 3.03]}>
          <mesh>
            <boxGeometry args={[1.45, 0.85, 0.05]} />
            <meshStandardMaterial color="#f5f1e9" />
          </mesh>
          <Text position={[0, 0, 0.05]} fontSize={0.16} color="#52606b" anchorX="center">
            {i % 2 === 0 ? "NOTICE BOARD" : "DEPARTMENT"}
          </Text>
        </group>
      ))}

      {/* Temporary navigation geometry: stairs exist only while climbing */}
      {showStairs && <Stairs x={-8.2} />}
      {showStairs && <Lift x={-4.4} label="STUDENT LIFT" />}
      {showStairs && <Lift x={-1.5} label="STAFF LIFT" />}

      {!showStairs && (
        <group position={[-8.2, 0.2, 0.8]}>
          <mesh rotation-x={-Math.PI / 2}>
            <circleGeometry args={[1.15, 32]} />
            <meshBasicMaterial color="#e3ded7" />
          </mesh>
          <Text position={[0, 0.35, 0]} fontSize={0.25} color="#667085" anchorX="center">
            FLOOR ACCESS
          </Text>
        </group>
      )}

      {showStairs && (
        <>
          <DynamicYouMarker
            targetPosition={currentStep <= 0 ? [-7.8, 0.38, 0] : [-5.0, 1.90, 0]}
          />
          <Line
            points={
              currentStep <= 0
                ? [[-8.0, 0.42, 0], [-6.8, 0.62, 0], [-5.6, 0.82, 0]]
                : [[-5.0, 1.95, 0], [-3.8, 2.05, 0]]
            }
            color={C.blue}
            lineWidth={4}
          />
          <Html center position={[-5.2, 3.75, 1.5]}>
            <div style={{
              background: "#fff",
              color: C.blue,
              border: `1px solid ${C.blueSoft}`,
              borderRadius: 10,
              padding: "8px 11px",
              font: "800 12px Inter, sans-serif",
              whiteSpace: "nowrap",
              boxShadow: "0 8px 22px rgba(0,0,0,.12)",
            }}>
              {currentStep <= 0 ? "Move to the stairs" : `Keep climbing → Floor ${floor}`}
            </div>
          </Html>
        </>
      )}

      {/* Rooms with doors/windows */}
      {rooms.map(([label, x, z, width]) => {
        const active = showDestination && target.room === label;
        return (
          <group key={label} position={[x, 0, z]}>
            <mesh position={[0, 1.25, 0]}>
              <boxGeometry args={[width, 2.5, 3.2]} />
              <meshStandardMaterial color={active ? "#dbe9ff" : "#eee7de"} />
            </mesh>
            <mesh position={[0, 0.95, 1.66]}>
              <boxGeometry args={[Math.min(width - 0.6, 3.6), 1.65, 0.08]} />
              <meshStandardMaterial color={active ? C.blue : C.window} />
            </mesh>
            <mesh position={[0, 0.85, 1.73]}>
              <boxGeometry args={[1.0, 1.75, 0.10]} />
              <meshStandardMaterial color={active ? C.blueSoft : "#7d6c60"} />
            </mesh>
            <Text position={[0, 2.8, 1.76]} fontSize={0.30} color={C.text} anchorX="center" maxWidth={width - 0.2}>
              {label}
            </Text>

            {/* Interior detail */}
            {label.includes("LAB") || label.includes("CENTRE") ? <LabFurniture type="computer" /> : null}
            {label.includes("ROOM") || label.includes("CLASS") ? <ClassroomFurniture /> : null}
          </group>
        );
      })}

      <Washroom x={9.0} y={0} label={floor % 2 === 0 ? "GENTS" : "LADIES"} />
      <Washroom x={-11.0} y={0} label={floor % 2 === 0 ? "LADIES" : "GENTS"} />

      {/* Forward-only route: old segment is not rendered */}
      {showCorridor && target && (
        <>
          <Line
            points={
              showDestination
                ? [[-2.8, 0.22, 0.8], [0.5, 0.22, 0.8], [target.position[0], 0.22, -1.0], [target.position[0], 0.22, zForTarget(target)]]
                : [[-3.8, 0.22, 0.8], [0, 0.22, 0.8], [3.5, 0.22, 0.8], [6.0, 0.22, 0.8]]
            }
            color={C.blue}
            lineWidth={4}
          />
          {(showDestination ? [-1.7, 0.8, 2.6] : [-2.8, 0.0, 2.8, 5.0]).map((x, i) => (
            <group key={i} position={[x, 0.3, 0.8]}>
              <mesh rotation-x={-Math.PI / 2} rotation-z={-Math.PI / 2}>
                <coneGeometry args={[0.22, 0.58, 3]} />
                <meshBasicMaterial color={C.blue} />
              </mesh>
            </group>
          ))}
          <DynamicYouMarker
            targetPosition={showDestination ? [1.2, 0.25, 0.8] : [-3.8, 0.25, 0.8]}
          />
          <Html position={[0, 3.45, 0.8]} center>
            <div style={{ background: "#fff", padding: "9px 13px", borderRadius: 11, border: `1px solid ${C.blueSoft}`, boxShadow: "0 8px 24px rgba(0,0,0,.12)", font: "800 12px Inter, sans-serif", color: C.text, whiteSpace: "nowrap" }}>
              {showDestination ? `Turn right → ${target.room}` : "Walk straight → Follow the blue arrows"}
            </div>
          </Html>
        </>
      )}

      {showDestination && target && (
        <group position={[target.position[0], 0.35, zForTarget(target)]}>
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.45, 0.72, 32]} />
            <meshBasicMaterial color={C.red} />
          </mesh>
          <mesh position={[0, 0.45, 0]}>
            <coneGeometry args={[0.28, 0.75, 20]} />
            <meshBasicMaterial color={C.red} />
          </mesh>
          <Html center position={[0, 1.65, 0]}>
            <div style={{ background: C.red, color: "#fff", padding: "10px 14px", borderRadius: 999, font: "800 12px Inter, sans-serif", whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(217,75,75,.30)" }}>
              📍 {target.room}
            </div>
          </Html>
        </group>
      )}

      <Html position={[0, 3.65, -6.7]} center>
        <div style={{ background: "rgba(255,255,255,.96)", borderRadius: 12, padding: "8px 15px", font: "800 13px Inter, sans-serif", color: C.text, boxShadow: "0 7px 22px rgba(0,0,0,.1)" }}>
          FLOOR {floor === 0 ? "GROUND" : floor} • DETAILED FLOOR MAP
        </div>
      </Html>
    </group>
  );
}

function zForTarget(target) {
  // Destination coordinates are world coordinates from the navigation data.
  // The floor scene is a cutaway map, so only the x/z part is used here.
  const z = Array.isArray(target.position) ? target.position[2] : -1.0;
  return Math.max(-5.0, Math.min(5.0, z));
}

function NavigationOverlay({
  stage,
  floor,
  destination,
  onStart,
  onFloorChange,
}) {
  const target = useTarget(destination);

  return (
    <Html fullscreen>
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        {/* Top navigation chip */}
        {stage !== "campus" && (
          <div
            style={{
              position: "absolute",
              top: 18,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fff",
              borderRadius: 14,
              padding: "10px 16px",
              boxShadow: "0 10px 28px rgba(0,0,0,.14)",
              color: C.text,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {stage === "start"
              ? "Route ready"
              : stage === "entering"
              ? "Entering Main Building..."
              : `Navigating to ${destination}`}
          </div>
        )}

        {/* Bottom instruction */}
        {stage === "interior" && (
          <div
            style={{
              position: "absolute",
              left: 20,
              bottom: 20,
              width: 300,
              background: "#fff",
              borderRadius: 18,
              padding: 16,
              boxShadow: "0 12px 35px rgba(0,0,0,.18)",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                color: C.blue,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: ".08em",
                marginBottom: 6,
              }}
            >
              LIVE CAMPUS NAVIGATION
            </div>
            <div
              style={{
                color: C.text,
                fontSize: 17,
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              {destination}
            </div>
            <div
              style={{
                color: "#667085",
                fontSize: 13,
                lineHeight: 1.45,
              }}
            >
              {target.floor === floor
                ? "Walk straight through the corridor, then turn toward your destination."
                : `Take the stairs/lift to Floor ${target.floor}, then follow the blue route.`}
            </div>

            <div style={{ display: "flex", gap: 7, marginTop: 13 }}>
              {[0, 1, 2, 3, 4, 5].map((f) => (
                <button
                  key={f}
                  onClick={() => onFloorChange(f)}
                  style={{
                    pointerEvents: "auto",
                    border: 0,
                    borderRadius: 9,
                    padding: "7px 9px",
                    cursor: "pointer",
                    background: floor === f ? C.blue : "#eef2f7",
                    color: floor === f ? "#fff" : C.text,
                    fontWeight: 800,
                    fontSize: 11,
                  }}
                >
                  {f === 0 ? "G" : f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Start here action */}
        {stage === "start" && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 30,
              transform: "translateX(-50%)",
              background: "#fff",
              borderRadius: 18,
              padding: 14,
              boxShadow: "0 12px 35px rgba(0,0,0,.18)",
              pointerEvents: "auto",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#667085" }}>
                You are at the Main Gate
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                Start Here
              </div>
            </div>
            <button
              onClick={onStart}
              style={{
                border: 0,
                borderRadius: 11,
                padding: "11px 18px",
                background: C.blue,
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Enter College →
            </button>
          </div>
        )}
      </div>
    </Html>
  );
}

function Scene({
  navigationStarted,
  destination,
  currentStep,
}) {
  const [stage, setStage] = useState(
    navigationStarted ? "entering" : "campus"
  );
  const [floor, setFloor] = useState(2);

  const target = useTarget(destination);

  // Existing NavigationPage already advances currentStep automatically.
  // Reuse that state so the 3D scene changes naturally:
  // step 0-1 = stairs/lift, step 2 = corridor, step 3+ = destination.
  const navigationPhase =
    currentStep <= 1
      ? "stairs"
      : currentStep === 2
      ? "corridor"
      : "destination";

  useEffect(() => {
    if (navigationStarted) {
      setStage("start");
      setFloor(target.floor);
    } else {
      setStage("campus");
    }
  }, [navigationStarted, target.floor]);

  useEffect(() => {
    if (navigationStarted && stage === "start") {
      const timer = setTimeout(() => setStage("entering"), 1100);
      return () => clearTimeout(timer);
    }
  }, [navigationStarted, stage]);

  useEffect(() => {
    if (stage === "entering") {
      const timer = setTimeout(() => setStage("interior"), 3200);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === "interior") {
      setFloor(target.floor);
    }
  }, [stage, target.floor]);

  return (
    <>
      <color attach="background" args={["#dcecf5"]} />

      <ambientLight intensity={1.8} />
      <directionalLight
        position={[15, 28, 18]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-20, 12, -10]} intensity={0.8} />

      {stage === "interior" ? (
        <FloorInterior floor={floor} destination={destination} navigationPhase={navigationPhase} currentStep={currentStep} />
      ) : (
        <CampusExterior navigationStage={stage} currentStep={currentStep} />
      )}

      {stage === "interior" && navigationPhase === "destination" && (
        <Html fullscreen>
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              pointerEvents: "none",
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "12px 15px",
                boxShadow: "0 10px 30px rgba(0,0,0,.16)",
                minWidth: 190,
              }}
            >
              <div style={{ fontSize: 11, color: C.blue, fontWeight: 800 }}>
                DESTINATION
              </div>
              <div style={{ fontSize: 17, color: C.text, fontWeight: 800, marginTop: 4 }}>
                📍 {destination}
              </div>
              <div style={{ fontSize: 12, color: "#667085", marginTop: 4 }}>
                Floor {target.floor}
              </div>
            </div>
          </div>
        </Html>
      )}

      {stage === "entering" && (
        <Html fullscreen>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              paddingBottom: 28,
              pointerEvents: "none",
              fontFamily: "Inter, Arial, sans-serif",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,.96)",
                borderRadius: 16,
                padding: "12px 18px",
                boxShadow: "0 12px 32px rgba(0,0,0,.16)",
                fontSize: 13,
                fontWeight: 800,
                color: C.text,
              }}
            >
              {currentStep <= 1
                ? `Take the stairs/lift to Floor ${target.floor}`
                : currentStep === 2
                ? "You reached the floor • Walk straight"
                : `Turn right • ${destination} ahead`}
            </div>
          </div>
        </Html>
      )}

      <SmoothCamera
        mode={stage === "campus" ? "campus" : stage === "start" ? "gate" : stage === "entering" ? "entrance" : "interior"}
        targetFloor={floor}
        navigationPhase={navigationPhase}
        currentStep={currentStep}
        onArrive={() => {
          if (stage === "entering") setStage("interior");
        }}
      />

      <NavigationOverlay
        stage={stage}
        floor={floor}
        destination={destination}
        currentStep={currentStep}
        onStart={() => setStage("entering")}
        onFloorChange={setFloor}
      />
    </>
  );
}

export default function Campus3D({
  navigationStarted = false,
  destination = "IT Lab",
  currentStep = 0,
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 560,
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        background: "#dcecf5",
      }}
    >
      <Canvas
        shadows
        camera={{
          position: [28, 28, 34],
          fov: 42,
          near: 0.1,
          far: 150,
        }}
        dpr={[1, 1.7]}
      >
        <Scene
          navigationStarted={navigationStarted}
          destination={destination}
          currentStep={currentStep}
        />
      </Canvas>
    </div>
  );
}
