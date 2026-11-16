import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject, PointerEvent as ReactPointerEvent } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ChevronDown, Heart, MapPin,
  Maximize2, Music2, RotateCcw, VolumeX, X,
} from "lucide-react";
import {
  apologyLetter, futurePlans, memories,
  relationshipStart, rooms, thingsILove,
} from "./data";
import type { Memory, Room, RoomId } from "./data";

type Movement = { forward: boolean; back: boolean; turnLeft: boolean; turnRight: boolean };
type TeleportRequest = { room: RoomId; serial: number };

const initialMovement = (): Movement => ({ forward: false, back: false, turnLeft: false, turnRight: false });

const assetUrl = (path: string) => `./${path.replace(/^\/+/, "")}`;

function daysTogether(): string {
  const [year, month, day] = relationshipStart.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  if (
    Number.isNaN(start.getTime())
    || start.getFullYear() !== year
    || start.getMonth() !== month - 1
    || start.getDate() !== day
  ) return "Our story, always";

  const today = new Date();
  let years = today.getFullYear() - year;
  let months = today.getMonth() - (month - 1);
  let days = today.getDate() - day;
  if (days < 0) {
    months -= 1;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years}y · ${months}m · ${days}d together`;
}

const HALL_HALF_WIDTH = 2.8;
const ROOM_HALF_WIDTH = 8.65;
const ROOM_HALF_LENGTH = 8.05;

function isWalkablePosition(x: number, z: number): boolean {
  if (Math.abs(x) <= HALL_HALF_WIDTH && z >= -103 && z <= -5.8) return true;
  if (Math.abs(x) <= 2.35 && z >= -5.8 && z <= -5.05) return true;

  const entrance = rooms.find((room) => room.id === "entrance");
  if (
    entrance
    && Math.abs(x - entrance.position[0]) <= ROOM_HALF_WIDTH
    && Math.abs(z - entrance.position[2]) <= ROOM_HALF_LENGTH
  ) return true;

  return rooms.some((room) => {
    if (room.side === "center") return false;
    const [centerX, , centerZ] = room.position;
    if (Math.abs(x - centerX) <= ROOM_HALF_WIDTH && Math.abs(z - centerZ) <= ROOM_HALF_LENGTH) return true;
    const doorwayX = (room.side === "left" ? -1 : 1) * x;
    return doorwayX >= HALL_HALF_WIDTH
      && doorwayX <= Math.abs(centerX) - ROOM_HALF_WIDTH
      && Math.abs(z - centerZ) <= 2.35;
  });
}

const hallArrowShape = new THREE.Shape();
hallArrowShape.moveTo(-0.45, -1.6);
hallArrowShape.lineTo(-0.45, 0.2);
hallArrowShape.lineTo(-1.1, 0.2);
hallArrowShape.lineTo(0, 1.5);
hallArrowShape.lineTo(1.1, 0.2);
hallArrowShape.lineTo(0.45, 0.2);
hallArrowShape.lineTo(0.45, -1.6);
hallArrowShape.closePath();

function PhotoFrame({ memory, position, rotation, scale, onOpen }: {
  memory: Memory;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  onOpen: (memory: Memory) => void;
}) {
  const texture = useTexture(assetUrl(memory.image));
  return (
    <group position={position} rotation={rotation} scale={scale} onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = "auto"; }}>
      <mesh position={[0, 0, -0.07]} castShadow>
        <boxGeometry args={[3.25, 2.55, 0.22]} />
        <meshStandardMaterial color="#9b754f" metalness={0.24} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0, 0.055]} onClick={(event) => { event.stopPropagation(); onOpen(memory); }}>
        <planeGeometry args={[2.93, 2.22]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

function photoWallPlacement(index: number, total: number, room: Room) {
  const wall = index % 4;
  const wallIndex = Math.floor(index / 4);
  const wallCount = Math.ceil((total - wall) / 4);
  const innerSide = wall === 3;
  const columns = innerSide ? 2 : 6;
  const rows = Math.ceil(wallCount / columns);
  const row = Math.floor(wallIndex / columns);
  const itemsInRow = Math.min(columns, wallCount - row * columns);
  const column = wallIndex % columns;
  const verticalSpacing = rows === 1 ? 0 : Math.min(1.9, 2.75 / (rows - 1));
  const scale = rows === 1 ? 0.66 : Math.min(0.66, Math.max(0.2, (verticalSpacing - 0.12) / 2.55));
  const y = rows === 1 ? 3 : 3.95 - row * verticalSpacing;
  const acrossWall = innerSide
    ? itemsInRow === 1 ? -5.65 : (column === 0 ? -5.65 : 5.65)
    : (column - (itemsInRow - 1) / 2) * 2.8;
  const insideWall = room.side === "left" ? 9 : -9;
  const outerWall = -insideWall;
  const sideRotation = (x: number): [number, number, number] => [0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0];

  if (wall === 0) return { position: [acrossWall, y, -8.12] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale };
  if (wall === 1) {
    const x = outerWall - Math.sign(outerWall) * 0.33;
    return { position: [x, y, acrossWall] as [number, number, number], rotation: sideRotation(x), scale };
  }
  if (wall === 2) return { position: [acrossWall, y, 8.12] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number], scale };

  const x = insideWall - Math.sign(insideWall) * 0.33;
  return { position: [x, y, acrossWall] as [number, number, number], rotation: sideRotation(x), scale };
}

function RoomShell({ room, activeRoom, onOpenMemory }: {
  room: Room;
  activeRoom: RoomId;
  onOpenMemory: (memory: Memory) => void;
}) {
  const [x, , z] = room.position;
  const leftRoom = room.side === "left";
  const insideWall = leftRoom ? 9 : -9;
  const outerWall = -insideWall;
  const roomMemories = memories.filter((memory) => memory.room === room.id);
  const tone = room.id === "apology" ? "#d0c3bd" : room.id === "future" ? "#d8c8bd" : "#d1c6bc";
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[18, 17]} />
        <meshStandardMaterial color={tone} roughness={0.64} metalness={0.13} />
      </mesh>
      <mesh position={[0, 6.1, 0]}>
        <boxGeometry args={[18, 0.2, 17]} />
        <meshStandardMaterial color="#665c65" roughness={0.85} />
      </mesh>
      {room.id === "entrance" ? (
        <>
          {[-5.7, 5.7].map((side) => (
            <mesh key={side} position={[side, 3, -8.45]} receiveShadow>
              <boxGeometry args={[6.6, 6, 0.45]} />
              <meshStandardMaterial color="#b4a69a" roughness={0.88} />
            </mesh>
          ))}
          <mesh position={[0, 5.55, -8.45]}>
            <boxGeometry args={[5.2, 0.9, 0.45]} />
            <meshStandardMaterial color="#b4a69a" roughness={0.88} />
          </mesh>
          <group position={[0, 0, -8.15]}>
            {[-2.55, 2.55].map((side) => (
              <mesh key={side} position={[side, 2.45, 0]}>
                <boxGeometry args={[0.13, 4.9, 0.12]} />
                <meshStandardMaterial color="#e2bbd4" emissive="#a96cbb" emissiveIntensity={2.2} />
              </mesh>
            ))}
            <mesh position={[0, 4.9, 0]}>
              <boxGeometry args={[5.2, 0.13, 0.12]} />
              <meshStandardMaterial color="#e8d0a6" emissive="#a27745" emissiveIntensity={0.8} />
            </mesh>
            <pointLight position={[0, 2.3, 0]} color="#fff0d9" intensity={1.6} distance={8} />
          </group>
        </>
      ) : (
        <mesh position={[0, 3, -8.45]} receiveShadow>
          <boxGeometry args={[18, 6, 0.45]} />
          <meshStandardMaterial color="#b4a69a" roughness={0.88} />
        </mesh>
      )}
      <mesh position={[0, 3, 8.45]} receiveShadow>
        <boxGeometry args={[18, 6, 0.45]} />
        <meshStandardMaterial color="#a99b91" roughness={0.88} />
      </mesh>
      <mesh position={[outerWall, 3, 0]} receiveShadow>
        <boxGeometry args={[0.45, 6, 17]} />
        <meshStandardMaterial color="#b4a69a" roughness={0.88} />
      </mesh>
      {room.side === "center" && (
        <mesh position={[-9, 3, 0]} receiveShadow>
          <boxGeometry args={[0.45, 6, 17]} />
          <meshStandardMaterial color="#b4a69a" roughness={0.88} />
        </mesh>
      )}
      {room.side !== "center" && (
        <>
          {[-5.65, 5.65].map((doorSide) => (
            <mesh key={doorSide} position={[insideWall, 3, doorSide]} receiveShadow>
              <boxGeometry args={[0.45, 6, 5.7]} />
              <meshStandardMaterial color="#b4a69a" roughness={0.88} />
            </mesh>
          ))}
          <mesh position={[insideWall, 5.55, 0]}>
            <boxGeometry args={[0.45, 1, 5.3]} />
            <meshStandardMaterial color="#b4a69a" roughness={0.88} />
          </mesh>
          <group position={[insideWall + (leftRoom ? 0.24 : -0.24), 0, 0]}>
            {[-2.55, 2.55].map((doorSide) => (
              <mesh key={doorSide} position={[0, 2.45, doorSide]}>
                <boxGeometry args={[0.12, 4.9, 0.13]} />
                <meshStandardMaterial color="#dfc49a" emissive="#a27745" emissiveIntensity={0.75} />
              </mesh>
            ))}
            <mesh position={[0, 4.9, 0]}>
              <boxGeometry args={[0.12, 0.13, 5.2]} />
              <meshStandardMaterial color="#e8d0a6" emissive="#a27745" emissiveIntensity={0.8} />
            </mesh>
          </group>
        </>
      )}
      {room.id === activeRoom && (
        <Html position={[0, 5.2, -7.7]} center distanceFactor={12} transform pointerEvents="none">
          <div className="world-sign">{room.title}</div>
        </Html>
      )}
      <Suspense fallback={null}>
        {room.id === activeRoom && roomMemories.map((memory, index) => {
          const placement = photoWallPlacement(index, roomMemories.length, room);
          return <PhotoFrame key={memory.id} memory={memory} {...placement} onOpen={onOpenMemory} />;
        })}
      </Suspense>
      <pointLight position={[0, 4.8, 0]} color="#fff0d9" intensity={2.1} distance={20} />
    </group>
  );
}

function Portal({ room, onJump }: { room: Room; onJump: (room: RoomId) => void }) {
  const [, , z] = room.position;
  const glow = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (glow.current) {
      const pulse = 0.78 + Math.sin(clock.elapsedTime * 1.4 + Math.abs(z)) * 0.16;
      (glow.current.material as THREE.MeshBasicMaterial).opacity = pulse;
    }
  });
  return (
    <group position={[0, 0, z - 7]}>
      <mesh ref={glow} position={[0, 2.65, 0]} onClick={() => onJump(room.id)}
        onPointerOver={() => { document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { document.body.style.cursor = "auto"; }}>
        <torusGeometry args={[2.2, 0.11, 12, 48]} />
        <meshBasicMaterial color="#e8d0a6" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 2.6, -0.08]} onClick={() => onJump(room.id)}>
        <planeGeometry args={[3.7, 4.9]} />
        <meshBasicMaterial color="#fff0d9" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, 5.7, 0]} center distanceFactor={14} pointerEvents="none" occlude>
        <div className="portal-sign">{room.title}</div>
      </Html>
    </group>
  );
}

function CameraRig({ room, request, onRoomChange, movement }: {
  room: RoomId;
  request: TeleportRequest | null;
  onRoomChange: (id: RoomId) => void;
  movement: MutableRefObject<Movement>;
}) {
  const { camera } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const pressed = useRef(new Set<string>());
  const lastRoom = useRef(room);
  const targetPosition = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        event.preventDefault();
        pressed.current.add(key);
      }
    };
    const keyUp = (event: KeyboardEvent) => pressed.current.delete(event.key.toLowerCase());
    const blur = () => pressed.current.clear();
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", blur);
    };
  }, []);

  useEffect(() => {
    if (!request) return;
    const target = rooms.find((item) => item.id === request.room);
    if (!target) return;
    targetPosition.current = new THREE.Vector3(target.position[0], 1.7, target.id === "entrance" ? 7 : target.position[2]);
    yaw.current = 0;
    pitch.current = 0;
    lastRoom.current = target.id;
    camera.rotation.set(0, 0, 0);
  }, [request, camera]);

  useFrame((_, delta) => {
    const keys = pressed.current;
    const forwardInput = Number(keys.has("w") || keys.has("arrowup") || movement.current.forward)
      - Number(keys.has("s") || keys.has("arrowdown") || movement.current.back);
    const turnInput = Number(keys.has("d") || keys.has("arrowright") || movement.current.turnRight)
      - Number(keys.has("a") || keys.has("arrowleft") || movement.current.turnLeft);
    yaw.current -= turnInput * Math.min(delta, 0.05) * 1.8;
    camera.rotation.order = "YXZ";
    camera.rotation.set(pitch.current, yaw.current, 0);
    if (targetPosition.current) {
      camera.position.lerp(targetPosition.current, 1 - Math.exp(-delta * 5));
      if (camera.position.distanceToSquared(targetPosition.current) < 0.01) {
        camera.position.copy(targetPosition.current);
        targetPosition.current = null;
      }
    } else if (forwardInput) {
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const step = Math.min(delta, 0.05) * forwardInput * 5.5;
      const nextX = camera.position.x + forward.x * step;
      const nextZ = camera.position.z + forward.z * step;
      if (isWalkablePosition(nextX, camera.position.z)) camera.position.x = nextX;
      if (isWalkablePosition(camera.position.x, nextZ)) camera.position.z = nextZ;
      camera.position.y = 1.7;
    }
    if (!targetPosition.current) {
      const closest = rooms.find((item) => {
        const dx = camera.position.x - item.position[0];
        const dz = camera.position.z - item.position[2];
        return Math.hypot(dx, dz) < (item.id === "entrance" ? 10 : 11);
      });
      if (closest && closest.id !== lastRoom.current) {
        lastRoom.current = closest.id;
        onRoomChange(closest.id);
      }
    }
  });
  return null;
}

function HallWalls() {
  const sides: ("left" | "right")[] = ["left", "right"];
  return (
    <>
      {sides.flatMap((side) => {
        const openings = rooms
          .filter((room) => room.side === side)
          .map((room) => ({ high: room.position[2] + 2.8, low: room.position[2] - 2.8 }))
          .sort((a, b) => b.high - a.high);
        const segments: { center: number; length: number }[] = [];
        let cursor = 8;
        openings.forEach(({ high, low }) => {
          if (cursor > high) segments.push({ center: (cursor + high) / 2, length: cursor - high });
          cursor = low;
        });
        if (cursor > -105) segments.push({ center: (cursor - 105) / 2, length: cursor + 105 });
        return segments.map((segment, index) => (
          <mesh key={`${side}-${index}`} position={[side === "left" ? -3.2 : 3.2, 3, segment.center]}>
            <boxGeometry args={[0.28, 6, segment.length]} />
            <meshStandardMaterial color="#b4a69a" roughness={0.88} />
          </mesh>
        ));
      })}
      <mesh position={[0, 6.15, -48.5]}>
        <boxGeometry args={[6.65, 0.35, 115]} />
        <meshStandardMaterial color="#857a7b" roughness={0.9} />
      </mesh>
      {[-3.05, 3.05].map((x) => (
        <mesh key={x} position={[x, 0.22, -48.5]}>
          <boxGeometry args={[0.12, 0.38, 115]} />
          <meshStandardMaterial color="#756052" roughness={0.68} />
        </mesh>
      ))}
      {[-2, -25, -48, -71, -94].map((z) => (
        <group key={z} position={[0, 5.86, z]}>
          <mesh>
            <boxGeometry args={[1.8, 0.12, 0.28]} />
            <meshStandardMaterial color="#fff0d5" emissive="#d4aa72" emissiveIntensity={0.55} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function HallArrows() {
  return (
    <>
      {[-7, -15, -23, -31, -39, -47, -55, -63, -71, -79, -87, -95].map((z) => (
        <mesh key={z} position={[0, 0.015, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <shapeGeometry args={[hallArrowShape]} />
          <meshBasicMaterial color="#f0d7ad" transparent opacity={0.92} />
        </mesh>
      ))}
    </>
  );
}

function GalleryWorld({ room, request, movement, onRoomChange, onOpenMemory, onJump }: {
  room: RoomId;
  request: TeleportRequest | null;
  movement: MutableRefObject<Movement>;
  onRoomChange: (id: RoomId) => void;
  onOpenMemory: (memory: Memory) => void;
  onJump: (room: RoomId) => void;
}) {
  return (
    <>
      <color attach="background" args={["#383137"]} />
      <fog attach="fog" args={["#383137", 42, 170]} />
      <ambientLight intensity={1.15} color="#fff0df" />
      <directionalLight position={[12, 20, 6]} intensity={1.8} color="#fff0df" />
      <Sparkles count={16} scale={[5.5, 5, 112]} size={1} speed={0.1} opacity={0.13} color="#fff3dc" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, -46]} receiveShadow>
        <planeGeometry args={[6.3, 115]} />
        <meshStandardMaterial color="#756a65" roughness={0.48} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -46]}>
        <planeGeometry args={[3.7, 115]} />
        <meshBasicMaterial color="#c0a789" transparent opacity={0.12} />
      </mesh>
      <HallArrows />
      <HallWalls />
      {rooms.map((item) => (
        <RoomShell key={item.id} room={item} activeRoom={room} onOpenMemory={onOpenMemory} />
      ))}
      {rooms.filter((item) => item.id !== "entrance").map((item) => (
        <Portal key={item.id} room={item} onJump={onJump} />
      ))}
      <CameraRig room={room} request={request} onRoomChange={onRoomChange} movement={movement} />
    </>
  );
}

function MusicControl() {
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(0.18);
  const audio = useRef<{ context: AudioContext; gain: GainNode; oscillators: OscillatorNode[] } | null>(null);

  useEffect(() => () => {
    if (audio.current) {
      audio.current.oscillators.forEach((oscillator) => oscillator.stop());
      void audio.current.context.close();
    }
  }, []);

  const toggle = async () => {
    if (!audio.current) {
      const context = new AudioContext();
      const master = context.createGain();
      master.gain.value = volume;
      master.connect(context.destination);
      const oscillators = [110, 164.81, 220].map((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.value = index === 0 ? 0.15 : 0.075;
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start();
        return oscillator;
      });
      audio.current = { context, gain: master, oscillators };
      setEnabled(true);
      return;
    }
    if (enabled) {
      audio.current.gain.gain.setTargetAtTime(0, audio.current.context.currentTime, 0.12);
      setEnabled(false);
    } else {
      await audio.current.context.resume();
      audio.current.gain.gain.setTargetAtTime(volume, audio.current.context.currentTime, 0.35);
      setEnabled(true);
    }
  };
  const changeVolume = (next: number) => {
    setVolume(next);
    if (audio.current && enabled) audio.current.gain.gain.setTargetAtTime(next, audio.current.context.currentTime, 0.1);
  };

  return (
    <div className="music-control">
      <button className="icon-button" aria-label={enabled ? "Mute music" : "Play ambient music"} onClick={() => void toggle()}>
        {enabled ? <Music2 size={16} /> : <VolumeX size={16} />}
      </button>
      <input aria-label="Music volume" type="range" min="0" max="0.5" step="0.01" value={volume}
        onChange={(event) => changeVolume(Number(event.target.value))} />
    </div>
  );
}

function MiniMap({ currentRoom, onSelect }: { currentRoom: RoomId; onSelect: (id: RoomId) => void }) {
  return (
    <div className="map-card">
      <div className="map-heading"><MapPin size={13} /> YOUR LITTLE MAP</div>
      <div className="map-line">
        {rooms.map((room, index) => (
          <button key={room.id} aria-label={`Go to ${room.title}`} title={room.title}
            className={`map-dot ${room.id === currentRoom ? "active" : ""} ${index % 2 ? "offset" : ""}`}
            onClick={() => onSelect(room.id)} />
        ))}
      </div>
      <div className="map-current">{rooms.find((room) => room.id === currentRoom)?.title}</div>
    </div>
  );
}

function RoomPicker({ currentRoom, onSelect }: { currentRoom: RoomId; onSelect: (id: RoomId) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="room-picker">
      <button className="nav-button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <MapPin size={15} /> Rooms <ChevronDown size={14} className={open ? "chevron-open" : ""} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="room-menu" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            {rooms.map((room) => (
              <button key={room.id} className={room.id === currentRoom ? "selected" : ""} onClick={() => { onSelect(room.id); setOpen(false); }}>
                <span>{room.title}</span>{room.subtitle && <small>{room.subtitle}</small>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoomContent({ room, onOpenMemory, onFinish }: {
  room: Room;
  onOpenMemory: (memory: Memory) => void;
  onFinish: () => void;
}) {
  const [category, setCategory] = useState("all");
  const roomMemories = memories.filter((memory) => memory.room === room.id);
  const visibleMemories = category === "all" ? roomMemories : roomMemories.filter((memory) => memory.category === category);

  if (room.id === "entrance") {
    return <p className="room-description">Every memory, every laugh, every little moment. This is our story.</p>;
  }
  if (room.id === "beginning" || room.id === "memories") {
    const categories = ["all", "dates", "trips", "funny", "everyday"];
    return (
      <>
        <div className="category-row">
          {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div className="memory-list">
          {visibleMemories.map((memory) => (
            <button className="memory-row" key={memory.id} onClick={() => onOpenMemory(memory)}>
              <img src={assetUrl(memory.image)} alt="" />
              <span><strong>{memory.title}</strong><small>{memory.date} · {memory.category}</small></span>
              <Maximize2 size={15} />
            </button>
          ))}
        </div>
        <p className="quiet-note">The framed photographs in this room are clickable too.</p>
      </>
    );
  }
  if (room.id === "little-things") {
    return (
      <div className="memory-list">
        {roomMemories.map((memory) => (
          <button className="memory-row" key={memory.id} onClick={() => onOpenMemory(memory)}>
            <img src={assetUrl(memory.image)} alt="" />
            <span><strong>{memory.title}</strong><small>{memory.date} · {memory.category}</small></span>
            <Maximize2 size={15} />
          </button>
        ))}
      </div>
    );
  }
  if (room.id === "timeline") {
    return (
      <div className="love-list">
        {thingsILove.map((item) => (
          <article className="love-item" key={item}>
            <h3>{item}</h3>
          </article>
        ))}
      </div>
    );
  }
  if (room.id === "apology") {
    return (
      <>
        <div className="letter-copy">{apologyLetter}</div>
        <p className="quiet-note">Edit this letter in <code>src/data.ts</code>.</p>
      </>
    );
  }
  if (room.id !== "future") {
    return (
      <>
        <p className="room-description">{room.subtitle}</p>
        <div className="memory-list">
          {roomMemories.map((memory) => (
            <button className="memory-row" key={memory.id} onClick={() => onOpenMemory(memory)}>
              <img src={assetUrl(memory.image)} alt="" />
              <span><strong>{memory.title}</strong><small>{memory.date} · {memory.category}</small></span>
              <Maximize2 size={15} />
            </button>
          ))}
        </div>
        {!roomMemories.length && <p className="quiet-note">Add memories for this room in <code>src/data.ts</code>.</p>}
      </>
    );
  }
  return (
    <>
      <p className="room-description">{futurePlans.closing}</p>
      <button className="finish-button" onClick={onFinish}>A little last note <Heart size={14} /></button>
    </>
  );
}

function MemoryModal({ memory, onClose }: { memory: Memory; onClose: () => void }) {
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <motion.div className="memory-modal" initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}>
        <button className="close-button" onClick={onClose} aria-label="Close memory"><X size={18} /></button>
        <img className="memory-large-image" src={assetUrl(memory.image)} alt={memory.title} />
        <div className="memory-modal-copy">
          <div className="eyebrow">{memory.date} <span>·</span> {memory.category}</div>
          <h2>{memory.title}</h2><p className="memory-caption">{memory.caption}</p><p>{memory.description}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<RoomId>("entrance");
  const [request, setRequest] = useState<TeleportRequest | null>(null);
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null);
  const [showFinal, setShowFinal] = useState(false);
  const [duration, setDuration] = useState(daysTogether);
  const movement = useRef<Movement>(initialMovement());
  const overlayOpen = Boolean(activeMemory || showFinal);
  const room = rooms.find((item) => item.id === currentRoom) ?? rooms[0];

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timer = 0;
    const updateAtMidnight = () => {
      setDuration(daysTogether());
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = window.setTimeout(updateAtMidnight, nextMidnight.getTime() - now.getTime() + 50);
    };
    updateAtMidnight();
    return () => window.clearTimeout(timer);
  }, []);

  const jumpToRoom = useCallback((id: RoomId) => {
    setCurrentRoom(id);
    setRequest((previous) => ({ room: id, serial: (previous?.serial ?? 0) + 1 }));
    setActiveMemory(null);
  }, []);

  const changeMovement = (direction: keyof Movement, value: boolean) => {
    movement.current[direction] = value;
  };

  return (
    <main className={`experience ${overlayOpen ? "overlay-open" : ""}`}>
      <div className="world-canvas">
        <Canvas
          camera={{ position: [0, 1.7, 7], fov: 66 }}
          dpr={[0.75, 1]}
          frameloop={overlayOpen ? "never" : "always"}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <GalleryWorld
              room={currentRoom}
              request={request}
              movement={movement}
              onRoomChange={setCurrentRoom}
              onOpenMemory={setActiveMemory}
              onJump={jumpToRoom}
            />
          </Suspense>
        </Canvas>
      </div>
      <div className="atmosphere-vignette" />

      <AnimatePresence>
        {!ready && (
          <motion.div className="loading-screen" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
            <div className="loading-mark"><Heart size={20} /></div><div className="eyebrow">A WALK THROUGH US</div>
            <p>Gathering a few little moments…</p><div className="loading-line"><span /></div>
          </motion.div>
        )}
      </AnimatePresence>

      {ready && (
        <>
          <header className="topbar">
            <a className="brand" href="#" onClick={(event) => { event.preventDefault(); jumpToRoom("entrance"); }}>
              <span className="brand-mark"><Heart size={14} /></span><span>A WALK THROUGH US<small>A little world, made for us</small></span>
            </a>
            <div className="topbar-right">
              <div className="duration-chip"><span className="duration-dot" />{duration}</div>
              <MusicControl />
            </div>
          </header>

          {entered && (
            <>
              <div className="room-title-chip"><span>YOU ARE IN</span><strong>{room.title}</strong></div>
              <div className="nav-controls">
                <RoomPicker currentRoom={currentRoom} onSelect={jumpToRoom} />
                <button className="nav-button home-button" onClick={() => jumpToRoom("entrance")}><RotateCcw size={14} /> Entrance</button>
              </div>
              <MiniMap currentRoom={currentRoom} onSelect={jumpToRoom} />
              <div className="controls-hint">
                <strong>HOW TO MOVE</strong>
                <span><span className="keycap">W</span><span className="keycap">↑</span> Walk forward</span>
                <span><span className="keycap">S</span><span className="keycap">↓</span> Walk backward</span>
                <span><span className="keycap">←</span><span className="keycap">→</span> Turn</span>
                <span className="hint-caption">Follow the gold floor arrows</span>
              </div>
              <div className="mobile-pad" aria-label="Movement controls">
                <button aria-label="Walk forward" title="Walk forward" onPointerDown={(event: ReactPointerEvent) => { event.preventDefault(); changeMovement("forward", true); }} onPointerUp={() => changeMovement("forward", false)} onPointerLeave={() => changeMovement("forward", false)}><ArrowUp /></button>
                <div>
                  <button aria-label="Turn left" title="Turn left" onPointerDown={(event: ReactPointerEvent) => { event.preventDefault(); changeMovement("turnLeft", true); }} onPointerUp={() => changeMovement("turnLeft", false)} onPointerLeave={() => changeMovement("turnLeft", false)}><ArrowLeft /></button>
                  <button aria-label="Walk backward" title="Walk backward" onPointerDown={(event: ReactPointerEvent) => { event.preventDefault(); changeMovement("back", true); }} onPointerUp={() => changeMovement("back", false)} onPointerLeave={() => changeMovement("back", false)}><ArrowDown /></button>
                  <button aria-label="Turn right" title="Turn right" onPointerDown={(event: ReactPointerEvent) => { event.preventDefault(); changeMovement("turnRight", true); }} onPointerUp={() => changeMovement("turnRight", false)} onPointerLeave={() => changeMovement("turnRight", false)}><ArrowRight /></button>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.section key={currentRoom} className={`room-panel ${currentRoom === "apology" ? "apology-panel" : ""}`}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.35 }}>
                  <div className="panel-topline"><span className="eyebrow">{currentRoom === "apology" ? "A MOMENT FOR HONESTY" : "A ROOM IN OUR STORY"}</span><span className="panel-number">{String(rooms.findIndex((item) => item.id === currentRoom) + 1).padStart(2, "0")} / 07</span></div>
                  <h1>{room.title}</h1>
                  {currentRoom !== "apology" && room.subtitle && <p className="panel-subtitle">{room.subtitle}</p>}
                  <RoomContent room={room} onOpenMemory={setActiveMemory} onFinish={() => setShowFinal(true)} />
                </motion.section>
              </AnimatePresence>
            </>
          )}

          {!entered && (
            <motion.div className="welcome-screen" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.8 }}>
              <div className="welcome-orbit"><span /><span /><span /></div>
              <div className="eyebrow">A PLACE FOR OUR LITTLE MOMENTS</div>
              <h1>A little place<br /><em>I made for us.</em></h1>
              <p>After entering, follow the glowing floor arrows or use Rooms to jump ahead.<br />W / ↑ walks forward, S / ↓ walks back, and ← / → turns.</p>
              <button className="enter-button" onClick={() => { setEntered(true); jumpToRoom("entrance"); }}>
                ENTER <span>↗</span>
              </button>
              <div className="welcome-bottom"><span>MADE WITH LOVE, AND A LITTLE BIT OF COURAGE</span><span>01 — 07</span></div>
            </motion.div>
          )}
        </>
      )}

      <AnimatePresence>
        {activeMemory && <MemoryModal memory={activeMemory} onClose={() => setActiveMemory(null)} />}
        {showFinal && (
          <motion.div className="modal-backdrop final-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="final-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <Heart size={23} className="final-heart" />
              <div className="eyebrow">UNTIL THE NEXT LITTLE MOMENT</div>
              <h2>Thank you for being<br /><em>part of my life.</em></h2>
              <p>{futurePlans.closing}</p>
              <button className="small-button" onClick={() => setShowFinal(false)}>Stay a little longer</button>
              <button className="close-button" onClick={() => setShowFinal(false)} aria-label="Close"><X size={18} /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
