/**
 * Procedural military sprite generator.
 * Sinh ảnh lên <canvas> theo motif + seed → chạy qua pixelEngine.
 * Đủ motif + biến thể để có hàng nghìn level khác nhau không cần file PNG.
 */
export type Motif =
  | "helmet" | "grenade" | "target" | "star" | "crosshair"
  | "medal" | "shield" | "wings" | "anchor" | "sword"
  | "binoculars" | "dogtag" | "bullet" | "tank" | "rifle"
  | "starBadge" | "rank" | "heart" | "arrow" | "bomb"
  | "plane" | "helicopter" | "ship" | "medic" | "crown"
  | "knife" | "compass" | "radio" | "key" | "flame"
  | "lightning" | "skull" | "bugle" | "drum" | "map"
  | "boots" | "backpack" | "canteen" | "walkie" | "tank_side"
  | "rocket" | "gasmask" | "parachute" | "tank_turret";

export const MOTIFS: Motif[] = [
  "helmet", "grenade", "target", "star", "crosshair", "medal", "shield", "wings", "anchor", "sword",
  "binoculars", "dogtag", "bullet", "tank", "rifle", "starBadge", "rank", "heart", "arrow", "bomb",
  "plane", "helicopter", "ship", "medic", "crown", "knife", "compass", "radio", "key", "flame",
  "lightning", "skull", "bugle", "drum", "map", "boots", "backpack", "canteen", "walkie", "tank_side",
  "rocket", "gasmask", "parachute", "tank_turret",
];

// Mulberry32
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES: Array<[string, string]> = [
  ["#f0e6cd", "#3f4628"], // sand BG + dark olive
  ["#d8dfc4", "#342b1c"], // khaki BG + dark brown
  ["#c9d7d9", "#1f3547"], // sky BG + navy
  ["#e7d1b0", "#3a2a17"], // sand BG + brown
  ["#c7e0c0", "#2b3d20"], // pale green BG + forest
  ["#ffe0b8", "#4b2a16"], // sunset BG + brown
  ["#e5e0f2", "#2a2b4a"], // pale purple BG + indigo
  ["#f7efd2", "#2a2d16"], // off-white BG + black-olive
];

function pick<T>(r: () => number, arr: T[]): T { return arr[Math.floor(r() * arr.length)]; }

export interface GeneratedArt {
  canvas: HTMLCanvasElement;
  bg: string;
  fg: string;
  accent: string;
  motif: Motif;
  name: string;
}

/** Vẽ hình chữ nhật bo góc như pixel */
function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fillPixel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/**
 * Sinh 1 sprite lên canvas vuông theo motif + seed.
 * Trả về canvas (có thể bỏ thẳng vào imageToPixelArt()).
 */
export function generateSprite(motif: Motif, seed: number, size = 96): GeneratedArt {
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  const r = rng(seed);

  const [bg, fg] = pick(r, PALETTES);
  const accent = pick(r, ["#b23b25", "#c98d12", "#2f6e5c", "#4b6b2e", "#8a4728", "#6d3a88", "#c97a1e"]);
  // nền
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  // chuyển toạ độ về giữa, pixel to
  ctx.save();
  ctx.translate(size / 2, size / 2);
  const u = size / 48; // 1 đơn vị = 2px @ size 96

  const dark = fg;
  const mid = shade(dark, 1.4);
  const light = shade(dark, 1.8);

  function px(x: number, y: number, w: number, h: number, color: string) {
    fillPixel(ctx, Math.round(x * u), Math.round(y * u), Math.max(1, Math.round(w * u)), Math.max(1, Math.round(h * u)), color);
  }

  const drawMotif = () => {
    switch (motif) {
      case "helmet": {
        px(-10, -2, 20, 10, mid);
        px(-12, 8, 24, 4, dark);
        px(-8, 12, 16, 2, dark);
        px(-2, -6, 4, 4, accent);
        break;
      }
      case "grenade": {
        px(-7, -4, 14, 16, mid);
        px(-7, -4, 14, 2, light);
        px(-3, -10, 6, 6, dark);
        px(-1, -14, 2, 4, dark);
        px(-4, 4, 1, 1, dark); px(3, 6, 1, 1, dark); px(0, 8, 1, 1, dark);
        break;
      }
      case "target": {
        for (let i = 5; i >= 1; i -= 1) {
          ctx.fillStyle = i % 2 ? dark : bg;
          if (i === 1) ctx.fillStyle = accent;
          ctx.beginPath(); ctx.arc(0, 0, i * 4 * u, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = dark; ctx.lineWidth = u;
        ctx.strokeRect(-18 * u, -18 * u, 36 * u, 36 * u);
        break;
      }
      case "star":
      case "starBadge": {
        drawStar(ctx, u, 14, motif === "starBadge", mid, light, dark, accent);
        break;
      }
      case "crosshair": {
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u;
        ctx.beginPath();
        ctx.arc(0, 0, 14 * u, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-18 * u, 0); ctx.lineTo(-6 * u, 0);
        ctx.moveTo(6 * u, 0); ctx.lineTo(18 * u, 0);
        ctx.moveTo(0, -18 * u); ctx.lineTo(0, -6 * u);
        ctx.moveTo(0, 6 * u); ctx.lineTo(0, 18 * u);
        ctx.stroke();
        px(-1, -1, 2, 2, accent);
        break;
      }
      case "medal": {
        px(-8, -14, 16, 10, accent);
        px(-10, -6, 20, 4, dark);
        ctx.fillStyle = mid; ctx.beginPath(); ctx.arc(0, 6 * u, 10 * u, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(0, 6 * u, 10 * u, 0, Math.PI * 2); ctx.stroke();
        drawStar(ctx, u, 5, true, accent, accent, dark, accent);
        ctx.translate(0, 6 * u);
        break;
      }
      case "shield": {
        ctx.fillStyle = mid;
        ctx.beginPath();
        ctx.moveTo(-12 * u, -12 * u);
        ctx.lineTo(12 * u, -12 * u);
        ctx.lineTo(12 * u, 4 * u);
        ctx.lineTo(0, 14 * u);
        ctx.lineTo(-12 * u, 4 * u);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        px(-2, -8, 4, 14, accent); px(-6, -2, 12, 4, accent);
        break;
      }
      case "wings": {
        for (const s of [-1, 1]) {
          ctx.save(); ctx.scale(s, 1);
          ctx.fillStyle = mid;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(18 * u, -6 * u);
          ctx.lineTo(20 * u, -2 * u);
          ctx.lineTo(14 * u, 0);
          ctx.lineTo(20 * u, 2 * u);
          ctx.lineTo(18 * u, 6 * u);
          ctx.lineTo(0, 3 * u);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
          ctx.restore();
        }
        px(-3, -3, 6, 6, accent);
        break;
      }
      case "anchor": {
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, -14 * u); ctx.lineTo(0, 12 * u);
        ctx.moveTo(-8 * u, 12 * u); ctx.quadraticCurveTo(0, 18 * u, 8 * u, 12 * u);
        ctx.moveTo(-6 * u, -8 * u); ctx.lineTo(6 * u, -8 * u);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -14 * u, 2.5 * u, 0, Math.PI * 2); ctx.fillStyle = dark; ctx.fill();
        break;
      }
      case "sword": {
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.lineCap = "butt";
        ctx.beginPath(); ctx.moveTo(0, -16 * u); ctx.lineTo(0, 8 * u); ctx.stroke();
        px(-6, 8, 12, 2, dark);
        px(-1, 10, 2, 6, accent);
        px(-2, -16, 4, 2, dark);
        break;
      }
      case "binoculars": {
        for (const s of [-1, 1]) {
          ctx.save(); ctx.translate(s * 6 * u, 0);
          rrect(ctx, -4 * u, -10 * u, 8 * u, 20 * u, 2 * u);
          ctx.fillStyle = mid; ctx.fill();
          ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
          ctx.beginPath(); ctx.arc(0, -10 * u, 3 * u, 0, Math.PI * 2); ctx.fillStyle = dark; ctx.fill();
          ctx.restore();
        }
        px(-2, 0, 4, 4, dark);
        break;
      }
      case "dogtag": {
        rrect(ctx, -10 * u, -7 * u, 20 * u, 14 * u, 3 * u);
        ctx.fillStyle = mid; ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        ctx.beginPath(); ctx.arc(-7 * u, -11 * u, 2 * u, 0, Math.PI * 2); ctx.fillStyle = dark; ctx.fill();
        px(-5, -2, 10, 1, dark); px(-5, 1, 8, 1, dark);
        break;
      }
      case "bullet": {
        ctx.fillStyle = mid;
        ctx.beginPath();
        ctx.moveTo(-4 * u, 14 * u);
        ctx.lineTo(4 * u, 14 * u);
        ctx.lineTo(4 * u, -6 * u);
        ctx.quadraticCurveTo(0, -16 * u, -4 * u, -6 * u);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        px(-2, -14, 4, 2, accent);
        break;
      }
      case "tank": drawTank(ctx, u, mid, dark, accent, false); break;
      case "tank_side": drawTankSide(ctx, u, mid, dark, accent, light); break;
      case "tank_turret": drawTank(ctx, u, mid, dark, accent, true); break;
      case "rifle": {
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.lineCap = "square";
        ctx.beginPath();
        ctx.moveTo(-16 * u, 0); ctx.lineTo(10 * u, 0); ctx.stroke();
        px(10, -1, 6, 3, dark);
        px(-16, -1, 2, 4, accent);
        px(-4, 0, 2, 4, dark);
        break;
      }
      case "rank": {
        px(-14, -2, 28, 4, dark);
        px(-10, 2, 20, 2, mid);
        for (let i = -1; i <= 1; i++) px(i * 6 - 1, -8, 2, 6, accent);
        break;
      }
      case "heart": drawHeart(ctx, u, mid, dark, accent); break;
      case "arrow": {
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u;
        ctx.beginPath(); ctx.moveTo(-14 * u, 0); ctx.lineTo(10 * u, 0); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10 * u, -6 * u); ctx.lineTo(16 * u, 0); ctx.lineTo(10 * u, 6 * u);
        ctx.closePath(); ctx.fillStyle = accent; ctx.fill(); ctx.stroke();
        break;
      }
      case "bomb": {
        ctx.fillStyle = mid; ctx.beginPath(); ctx.arc(0, 2 * u, 12 * u, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        ctx.strokeStyle = dark; ctx.beginPath();
        ctx.moveTo(0, -10 * u); ctx.quadraticCurveTo(6 * u, -14 * u, 4 * u, -18 * u);
        ctx.stroke();
        px(4, -20, 3, 3, accent);
        px(-4, -2, 2, 2, light);
        break;
      }
      case "plane": {
        ctx.fillStyle = mid;
        ctx.beginPath();
        ctx.moveTo(-14 * u, 0); ctx.lineTo(-4 * u, -4 * u); ctx.lineTo(12 * u, -2 * u);
        ctx.lineTo(16 * u, 0); ctx.lineTo(12 * u, 2 * u); ctx.lineTo(-4 * u, 4 * u);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        px(-10, -6, 4, 2, dark); px(-10, 4, 4, 2, dark);
        px(6, -6, 2, 12, accent);
        break;
      }
      case "helicopter": {
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u;
        ctx.beginPath(); ctx.moveTo(-16 * u, -8 * u); ctx.lineTo(16 * u, -8 * u); ctx.stroke();
        px(-2, -12, 4, 4, dark);
        rrect(ctx, -10 * u, -4 * u, 20 * u, 10 * u, 4 * u);
        ctx.fillStyle = mid; ctx.fill(); ctx.stroke();
        px(-12, 6, 24, 2, dark);
        px(8, -2, 4, 6, accent);
        break;
      }
      case "ship": {
        ctx.fillStyle = mid;
        ctx.beginPath();
        ctx.moveTo(-14 * u, 0); ctx.lineTo(14 * u, 0); ctx.lineTo(10 * u, 8 * u); ctx.lineTo(-10 * u, 8 * u);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        ctx.strokeStyle = dark; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -14 * u); ctx.stroke();
        ctx.fillStyle = accent;
        ctx.beginPath(); ctx.moveTo(0, -14 * u); ctx.lineTo(10 * u, -6 * u); ctx.lineTo(0, -6 * u); ctx.closePath(); ctx.fill();
        break;
      }
      case "medic": {
        ctx.fillStyle = mid; rrect(ctx, -10 * u, -10 * u, 20 * u, 20 * u, 4 * u); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        px(-2, -8, 4, 16, accent); px(-8, -2, 16, 4, accent);
        break;
      }
      case "crown": {
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(-14 * u, 6 * u); ctx.lineTo(-14 * u, -8 * u); ctx.lineTo(-6 * u, 0); ctx.lineTo(0, -10 * u);
        ctx.lineTo(6 * u, 0); ctx.lineTo(14 * u, -8 * u); ctx.lineTo(14 * u, 6 * u);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        for (let i = -1; i <= 1; i++) px(i * 6 - 1, -2, 2, 2, "#fff3b0");
        break;
      }
      case "knife": {
        ctx.fillStyle = mid;
        ctx.beginPath();
        ctx.moveTo(-14 * u, 2 * u); ctx.lineTo(6 * u, -2 * u); ctx.lineTo(14 * u, 2 * u); ctx.lineTo(6 * u, 6 * u);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        px(-16, 0, 6, 6, dark);
        break;
      }
      case "compass": {
        ctx.beginPath(); ctx.arc(0, 0, 12 * u, 0, Math.PI * 2);
        ctx.fillStyle = mid; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        ctx.fillStyle = accent;
        ctx.beginPath(); ctx.moveTo(0, -10 * u); ctx.lineTo(3 * u, 0); ctx.lineTo(0, 10 * u); ctx.lineTo(-3 * u, 0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = dark; ctx.stroke();
        break;
      }
      case "radio": case "walkie": {
        rrect(ctx, -8 * u, -12 * u, 16 * u, 22 * u, 2 * u);
        ctx.fillStyle = mid; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        for (let i = -1; i <= 1; i++) px(i * 3 - 0.5, -14, 1, 4, dark);
        px(-4, -8, 8, 4, dark);
        for (let i = 0; i < 3; i++) px(-4, -1 + i * 3, 8, 2, dark);
        break;
      }
      case "key": {
        ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(-8 * u, 0, 6 * u, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        ctx.strokeStyle = dark; ctx.beginPath();
        ctx.moveTo(-2 * u, 0); ctx.lineTo(14 * u, 0); ctx.lineTo(14 * u, 4 * u); ctx.moveTo(8 * u, 0); ctx.lineTo(8 * u, 5 * u);
        ctx.stroke();
        px(-10, -2, 4, 4, bg);
        break;
      }
      case "flame": {
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(0, -14 * u);
        ctx.quadraticCurveTo(10 * u, -4 * u, 8 * u, 4 * u);
        ctx.quadraticCurveTo(4 * u, 12 * u, 0, 14 * u);
        ctx.quadraticCurveTo(-4 * u, 12 * u, -8 * u, 4 * u);
        ctx.quadraticCurveTo(-10 * u, -4 * u, 0, -14 * u);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        ctx.fillStyle = "#fff3b0";
        ctx.beginPath();
        ctx.moveTo(0, -6 * u); ctx.quadraticCurveTo(4 * u, 0, 3 * u, 6 * u); ctx.quadraticCurveTo(0, 10 * u, -3 * u, 6 * u); ctx.quadraticCurveTo(-4 * u, 0, 0, -6 * u);
        ctx.closePath(); ctx.fill();
        break;
      }
      case "lightning": {
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(-2 * u, -14 * u); ctx.lineTo(6 * u, -2 * u); ctx.lineTo(0, -2 * u); ctx.lineTo(4 * u, 14 * u);
        ctx.lineTo(-6 * u, 2 * u); ctx.lineTo(0, 2 * u); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        break;
      }
      case "skull": {
        ctx.fillStyle = mid;
        ctx.beginPath(); ctx.arc(0, -2 * u, 11 * u, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        px(-6, -2, 3, 4, dark); px(3, -2, 3, 4, dark);
        px(-1, 3, 2, 4, dark);
        for (let i = -1; i <= 1; i++) px(i * 2 - 0.5, 8, 1, 4, dark);
        break;
      }
      case "bugle": {
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u;
        ctx.beginPath(); ctx.moveTo(-12 * u, -6 * u); ctx.lineTo(-12 * u, 6 * u); ctx.stroke();
        px(-14, -8, 4, 2, dark); px(-14, 6, 4, 2, dark);
        ctx.beginPath();
        ctx.moveTo(-12 * u, -6 * u); ctx.quadraticCurveTo(6 * u, -6 * u, 14 * u, 0); ctx.quadraticCurveTo(6 * u, 6 * u, -12 * u, 6 * u);
        ctx.closePath(); ctx.fillStyle = accent; ctx.fill(); ctx.stroke();
        break;
      }
      case "drum": {
        rrect(ctx, -12 * u, -8 * u, 24 * u, 14 * u, 3 * u);
        ctx.fillStyle = mid; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        px(-12, -4, 24, 1, dark); px(-12, 4, 24, 1, dark);
        for (let i = -1; i <= 1; i++) px(i * 6 - 0.5, -14, 1, 6, dark);
        break;
      }
      case "map": {
        rrect(ctx, -14 * u, -10 * u, 28 * u, 20 * u, 2 * u);
        ctx.fillStyle = light; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        ctx.strokeStyle = accent; ctx.lineWidth = 2 * u;
        ctx.beginPath();
        ctx.moveTo(-10 * u, 2 * u); ctx.quadraticCurveTo(-2 * u, -8 * u, 4 * u, 0); ctx.quadraticCurveTo(10 * u, 8 * u, 14 * u, -2 * u);
        ctx.stroke();
        px(4, -2, 2, 2, accent);
        break;
      }
      case "boots": {
        ctx.fillStyle = dark;
        rrect(ctx, -10 * u, -12 * u, 10 * u, 20 * u, 2 * u); ctx.fill();
        rrect(ctx, -14 * u, 4 * u, 20 * u, 8 * u, 2 * u); ctx.fill();
        px(-10, -12, 10, 2, light);
        break;
      }
      case "backpack": {
        rrect(ctx, -10 * u, -12 * u, 20 * u, 22 * u, 3 * u);
        ctx.fillStyle = mid; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        rrect(ctx, -6 * u, -8 * u, 12 * u, 6 * u, 1 * u);
        ctx.fillStyle = dark; ctx.fill();
        px(-2, 2, 4, 10, dark);
        break;
      }
      case "canteen": {
        ctx.beginPath(); ctx.arc(0, 2 * u, 10 * u, 0, Math.PI * 2);
        ctx.fillStyle = mid; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        px(-3, -10, 6, 4, dark);
        px(-1, -14, 2, 4, dark);
        px(-6, 2, 12, 1, dark);
        break;
      }
      case "rocket": {
        ctx.fillStyle = mid;
        ctx.beginPath();
        ctx.moveTo(0, -14 * u); ctx.lineTo(5 * u, -2 * u); ctx.lineTo(5 * u, 10 * u); ctx.lineTo(-5 * u, 10 * u); ctx.lineTo(-5 * u, -2 * u);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        px(-5, 8, 10, 4, accent);
        px(-3, -6, 6, 2, dark);
        // flame
        ctx.fillStyle = accent;
        ctx.beginPath(); ctx.moveTo(-4 * u, 12 * u); ctx.lineTo(0, 20 * u); ctx.lineTo(4 * u, 12 * u); ctx.closePath(); ctx.fill();
        break;
      }
      case "gasmask": {
        ctx.beginPath(); ctx.arc(0, 0, 12 * u, 0, Math.PI * 2);
        ctx.fillStyle = mid; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        for (const s of [-1, 1]) {
          ctx.beginPath(); ctx.arc(s * 5 * u, 2 * u, 3 * u, 0, Math.PI * 2);
          ctx.fillStyle = dark; ctx.fill();
        }
        px(-5, -6, 10, 3, dark);
        px(-2, -12, 4, 3, dark);
        break;
      }
      case "parachute": {
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(-14 * u, -6 * u); ctx.quadraticCurveTo(0, -18 * u, 14 * u, -6 * u);
        ctx.quadraticCurveTo(6 * u, -2 * u, 0, -2 * u); ctx.quadraticCurveTo(-6 * u, -2 * u, -14 * u, -6 * u);
        ctx.closePath(); ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
        for (const s of [-1, 0, 1]) {
          ctx.beginPath(); ctx.moveTo(s * 6 * u, -6 * u); ctx.lineTo(0, 10 * u); ctx.stroke();
        }
        rrect(ctx, -4 * u, 8 * u, 8 * u, 8 * u, 2 * u);
        ctx.fillStyle = mid; ctx.fill(); ctx.stroke();
        break;
      }
    }
  };

  drawMotif();
  ctx.restore();

  // names
  const NAME_BY_MOTIF: Record<Motif, string> = {
    helmet: "HELMET", grenade: "GRENADE", target: "TARGET", star: "STAR", crosshair: "CROSSHAIR",
    medal: "MEDAL", shield: "SHIELD", wings: "WINGS", anchor: "ANCHOR", sword: "SWORD",
    binoculars: "BINOCULARS", dogtag: "DOGTAG", bullet: "BULLET", tank: "TANK", rifle: "RIFLE",
    starBadge: "STAR BADGE", rank: "RANK", heart: "HEART", arrow: "ARROW", bomb: "BOMB",
    plane: "FIGHTER", helicopter: "HELICOPTER", ship: "WARSHIP", medic: "MEDIC", crown: "CROWN",
    knife: "KNIFE", compass: "COMPASS", radio: "RADIO", key: "KEY", flame: "FLAME",
    lightning: "LIGHTNING", skull: "SKULL", bugle: "BUGLE", drum: "DRUM", map: "MAP",
    boots: "BOOTS", backpack: "BACKPACK", canteen: "CANTEEN", walkie: "WALKIE", tank_side: "TANK MKII",
    rocket: "ROCKET", gasmask: "GAS MASK", parachute: "PARATROOPER", tank_turret: "TURRET",
  };
  const name = NAME_BY_MOTIF[motif];

  return { canvas, bg, fg: dark, accent, motif, name };
}

function drawStar(ctx: CanvasRenderingContext2D, u: number, size: number, filled: boolean, c: string, light: string, dark: string, accent: string) {
  const s = size * u;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? s : s * 0.45;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fillStyle = filled ? c : "transparent";
  if (filled) ctx.fill();
  ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
  if (filled) {
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.8); ctx.lineTo(s * 0.25, -s * 0.2); ctx.lineTo(-s * 0.15, -s * 0.1); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(0, s * 0.15, s * 0.18, 0, Math.PI * 2); ctx.fill();
  }
}

function drawHeart(ctx: CanvasRenderingContext2D, u: number, mid: string, dark: string, accent: string) {
  ctx.fillStyle = accent;
  const s = 12 * u;
  ctx.beginPath();
  ctx.moveTo(0, 8 * u);
  ctx.bezierCurveTo(-14 * u, -2 * u, -8 * u, -12 * u, 0, -4 * u);
  ctx.bezierCurveTo(8 * u, -12 * u, 14 * u, -2 * u, 0, 8 * u);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
  ctx.fillStyle = mid;
  ctx.beginPath(); ctx.arc(-3 * u, -5 * u, s * 0.15, 0, Math.PI * 2); ctx.fill();
  void s;
}

function drawTank(ctx: CanvasRenderingContext2D, u: number, mid: string, dark: string, accent: string, turretOnly: boolean) {
  if (!turretOnly) {
    rrect(ctx, -16 * u, 4 * u, 32 * u, 10 * u, 3 * u);
    ctx.fillStyle = mid; ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.arc(i * 6 * u, 14 * u, 2.5 * u, 0, Math.PI * 2);
      ctx.fillStyle = dark; ctx.fill();
    }
  }
  rrect(ctx, -8 * u, turretOnly ? -6 * u : -4 * u, 16 * u, 10 * u, 3 * u);
  ctx.fillStyle = dark; ctx.fill();
  ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
  if (!turretOnly) {
    ctx.strokeStyle = accent; ctx.lineWidth = 3 * u;
    ctx.beginPath(); ctx.moveTo(6 * u, 0); ctx.lineTo(20 * u, 0); ctx.stroke();
  }
}

function drawTankSide(ctx: CanvasRenderingContext2D, u: number, mid: string, dark: string, accent: string, light: string) {
  // hull
  rrect(ctx, -18 * u, -2 * u, 36 * u, 10 * u, 2 * u);
  ctx.fillStyle = mid; ctx.fill();
  rrect(ctx, -10 * u, -10 * u, 16 * u, 8 * u, 2 * u);
  ctx.fillStyle = light; ctx.fill();
  ctx.strokeStyle = dark; ctx.lineWidth = 2 * u; ctx.stroke();
  // gun
  ctx.strokeStyle = dark; ctx.beginPath(); ctx.moveTo(6 * u, -8 * u); ctx.lineTo(22 * u, -8 * u); ctx.stroke();
  fillPixel(ctx, 20 * u, -10 * u, 4 * u, 4 * u, dark);
  // wheels
  for (let i = -2; i <= 3; i++) {
    ctx.beginPath(); ctx.arc((i * 6 - 3) * u, 10 * u, 3 * u, 0, Math.PI * 2);
    ctx.fillStyle = dark; ctx.fill();
    ctx.beginPath(); ctx.arc((i * 6 - 3) * u, 10 * u, 1 * u, 0, Math.PI * 2);
    ctx.fillStyle = accent; ctx.fill();
  }
  // track top
  fillPixel(ctx, -20 * u, 6 * u, 40 * u, 2 * u, dark);
}

function shade(hex: string, factor: number): string {
  const r = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * factor)));
  const g = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * factor)));
  const b = Math.min(255, Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * factor)));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}
