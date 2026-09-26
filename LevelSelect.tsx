import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Lock, Star } from "lucide-react";
import { CoinBar, SettingsButton } from "./ui";
import { TOTAL_LEVELS, getLevel, getLevelName, loadLevelSource } from "./levels";
import { sfx } from "./sound";
import type { SaveData } from "./store";
import { t } from "./i18n";

interface Props {
  save: SaveData;
  onBack: () => void;
  onPick: (index: number) => void;
  onSettings: () => void;
}

const PAGE_SIZE = 20;

export default function LevelSelect({ save, onBack, onPick, onSettings }: Props) {
  const L = (k: string, ...args: Array<string | number>) => t(save.settings.lang, k, ...args);
  const maxPage = Math.ceil(TOTAL_LEVELS / PAGE_SIZE);
  const [page, setPage] = useState(() => {
    const unlockedPage = Math.floor(save.unlocked / PAGE_SIZE);
    return Math.min(unlockedPage, maxPage - 1);
  });
  const startIdx = page * PAGE_SIZE;
  const pageLevels = useMemo(() => {
    const arr = [];
    for (let i = startIdx; i < Math.min(startIdx + PAGE_SIZE, TOTAL_LEVELS); i++) arr.push(getLevel(i));
    return arr;
  }, [startIdx]);

  return (
    <div className="camo-bg absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between gap-2 bg-[#1e2212]/90 p-3 pt-[max(12px,env(safe-area-inset-top))]">
        <button onClick={() => { sfx.click(); onBack(); }} className="btn-dark grid h-11 w-11 place-items-center"><ArrowLeft size={22} strokeWidth={2.5} /></button>
        <div className="min-w-0 text-center">
          <div className="font-pixel text-lg font-bold text-[#e2cf96]">{L("levels")}</div>
          <div className="font-num text-base leading-none text-[#c7c2a3]">{L("totalLevels", TOTAL_LEVELS)}</div>
        </div>
        <div className="flex items-center gap-2">
          <CoinBar coins={save.coins} />
          <SettingsButton onClick={onSettings} />
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {pageLevels.map((lv, i) => {
            const idx = startIdx + i;
            const locked = idx > save.unlocked;
            const done = save.completed.includes(lv.id);
            return (
              <LevelCard key={lv.id} levelIndex={idx} locked={locked} done={done} onPick={() => onPick(idx)} />
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <button onClick={() => { sfx.page(); setPage((p) => Math.max(0, p - 1)); }} disabled={page === 0}
            className="btn-dark px-3 py-2 font-pixel text-xs font-bold">◀ PREV</button>
          <div className="hud-pill px-4 py-1.5 font-pixel text-xs font-bold text-[#e2cf96]">
            {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, TOTAL_LEVELS)} / {TOTAL_LEVELS}
          </div>
          <button onClick={() => { sfx.page(); setPage((p) => Math.min(maxPage - 1, p + 1)); }} disabled={page >= maxPage - 1}
            className="btn-dark px-3 py-2 font-pixel text-xs font-bold">NEXT ▶</button>
        </div>
      </div>
    </div>
  );
}

function LevelCard({ levelIndex, locked, done, onPick }: { levelIndex: number; locked: boolean; done: boolean; onPick: () => void }) {
  const lv = getLevel(levelIndex);
  const [thumb, setThumb] = useState<string | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    let cancel = false;
    if (doneRef.current) return;
    doneRef.current = true;
    (async () => {
      try {
        if (lv.kind === "file") {
          setThumb(lv.src);
          return;
        }
        const { sprite } = await loadLevelSource(lv);
        if (cancel || !sprite) return;
        // vẽ sprite nhỏ ra dataURL cho thumb
        const c = document.createElement("canvas");
        c.width = 160; c.height = 160;
        const ctx = c.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = sprite.bg;
        ctx.fillRect(0, 0, 160, 160);
        ctx.drawImage(sprite.canvas, 8, 8, 144, 144);
        setThumb(c.toDataURL());
      } catch { /* ignore */ }
    })();
    return () => { cancel = true; };
  }, [lv]);

  return (
    <button disabled={locked} onClick={() => { sfx.click(); onPick(); }}
      className="panel-military relative overflow-hidden p-1.5 text-left disabled:cursor-not-allowed">
      <div className="relative aspect-square overflow-hidden rounded-md border-[3px] border-[#2e3219]">
        {thumb ? (
          <img src={thumb} alt={""} className="h-full w-full object-cover" style={{ imageRendering: "pixelated", filter: locked ? "grayscale(1) blur(6px) brightness(0.5)" : done ? "none" : "grayscale(1) contrast(0.8) brightness(1.25)" }} />
        ) : (
          <div className="h-full w-full bg-[#e7dcb1]" />
        )}
        {locked && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="grid h-10 w-10 place-items-center rounded-lg border-[3px] border-[#1d2410] bg-[#3a3f26] text-[#e2cf96]"><Lock size={22} /></div>
          </div>
        )}
        {done && (
          <div className="absolute right-1 top-1 flex items-center gap-1 rounded bg-[#2e3219] px-1.5 py-0.5 font-pixel text-[10px] font-bold text-yellow-300">
            <Star size={11} fill="currentColor" /> XONG
          </div>
        )}
        <div className="absolute left-1 top-1 rounded bg-[#2e3219] px-1.5 py-0.5 font-pixel text-[11px] font-bold text-[#e2cf96]">LV {lv.id}</div>
      </div>
      <div className="mt-1 truncate px-0.5 text-center font-pixel text-[11px] font-bold leading-tight">{getLevelName(lv)}</div>
      <div className="flex items-center justify-between px-0.5 font-num text-sm leading-none text-[#5f6440]">
        <span>{lv.grid}×{lv.grid} · {lv.colors}c</span>
        <span className="font-bold text-[#8a6410]">+{lv.reward}$</span>
      </div>
    </button>
  );
}
