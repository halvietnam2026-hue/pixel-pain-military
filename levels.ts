import { MOTIFS, generateSprite, type Motif, type GeneratedArt } from "./procedural";

export interface FileLevel {
  kind: "file";
  id: number;
  name: string;
  src: string;
  grid: number;
  colors: number;
  reward: number;
  seed: number;
}

export interface ProcLevel {
  kind: "procedural";
  id: number;
  motif: Motif;
  variant: number;
  grid: number;
  colors: number;
  reward: number;
  seed: number;
}

export type Level = FileLevel | ProcLevel;

/* 5 built-in levels with hand-drawn art (chapter 1: boot camp) */
const BUILTIN: FileLevel[] = [
  { kind: "file", id: 1, name: "HELMET", src: "/levels/level1.jpg", grid: 16, colors: 6, reward: 50, seed: 101 },
  { kind: "file", id: 2, name: "GRENADE", src: "/levels/level2.jpg", grid: 20, colors: 7, reward: 60, seed: 202 },
  { kind: "file", id: 3, name: "TANK", src: "/levels/level3.jpg", grid: 24, colors: 8, reward: 80, seed: 303 },
  { kind: "file", id: 4, name: "HELICOPTER", src: "/levels/level4.jpg", grid: 28, colors: 9, reward: 100, seed: 404 },
  { kind: "file", id: 5, name: "JET FIGHTER", src: "/levels/level5.jpg", grid: 32, colors: 10, reward: 120, seed: 505 },
];

/* procedural levels: >10,000 total (5 built-in + 10,000 generated) */
export const TOTAL_LEVELS = BUILTIN.length + 10000;

function procLevel(index: number): ProcLevel {
  const i = index - BUILTIN.length; // 0..999
  const motif = MOTIFS[i % MOTIFS.length];
  const variant = Math.floor(i / MOTIFS.length);
  const difficulty = Math.min(1, i / 900); // 0 → 1
  // grid from 20 → 36, colors 6 → 12, reward 60 → 240
  const grid = Math.round(20 + difficulty * 16);
  const colors = Math.max(5, Math.round(6 + difficulty * 6));
  const reward = 60 + Math.round(difficulty * 180);
  const seed = 10000 + i;
  return {
    kind: "procedural",
    id: index + 1,
    motif, variant, grid, colors, reward, seed,
  };
}

export function getLevel(index: number): Level {
  if (index < 0) return BUILTIN[0];
  if (index < BUILTIN.length) return BUILTIN[index];
  if (index >= TOTAL_LEVELS) return procLevel(TOTAL_LEVELS - 1);
  return procLevel(index);
}

/** Tên level (nếu là procedural thì lấy từ tên motif) */
export function getLevelName(level: Level): string {
  if (level.kind === "file") return level.name;
  return `OP-${String(level.id).padStart(4, "0")} · ${motifName(level.motif)}`;
}

function motifName(m: Motif): string {
  // fallback: capitalize
  const names: Partial<Record<Motif, string>> = {
    helmet: "HELMET", grenade: "GRENADE", target: "TARGET", star: "STAR", crosshair: "CROSSHAIR",
    medal: "MEDAL", shield: "SHIELD", wings: "WINGS", anchor: "ANCHOR", sword: "SWORD",
    binoculars: "BINOCS", dogtag: "DOGTAG", bullet: "ROUND", tank: "TANK", rifle: "RIFLE",
    starBadge: "BADGE", rank: "INSIGNIA", heart: "HEART", arrow: "ARROW", bomb: "BOMB",
    plane: "JET", helicopter: "HELO", ship: "PATROL BOAT", medic: "MEDIC", crown: "CROWN",
    knife: "KNIFE", compass: "COMPASS", radio: "RADIO", key: "KEY", flame: "FLAME",
    lightning: "STRIKE", skull: "SKULL", bugle: "BUGLE", drum: "DRUM", map: "MAP",
    boots: "BOOTS", backpack: "PACK", canteen: "CANTEEN", walkie: "WALKIE", tank_side: "TANK MKII",
    rocket: "ROCKET", gasmask: "GAS MASK", parachute: "PARATROOPER", tank_turret: "TURRET",
  };
  return names[m] ?? m.toUpperCase();
}

/** Tải source ảnh cho level (file URL hoặc canvas động). */
export async function loadLevelSource(level: Level): Promise<{ img: HTMLImageElement | HTMLCanvasElement; bg?: string; artBg?: string; sprite?: GeneratedArt }> {
  if (level.kind === "file") {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = level.src;
    });
    return { img };
  }
  const sprite = generateSprite(level.motif, level.seed, 96);
  return { img: sprite.canvas, bg: sprite.bg, artBg: sprite.bg, sprite };
}

export const PERFECT_BONUS = 20;
export const HINT_COST = 15;
export const CHAPTER_SIZE = BUILTIN.length;
