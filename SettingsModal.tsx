import { useState } from "react";
import { Home, RotateCcw, X, Globe, Volume2, VolumeX } from "lucide-react";
import { Modal, Toggle } from "./ui";
import { sfx } from "./sound";
import { LANGS, t } from "./i18n";
import { setMusicEnabled, setMusicVolume, setSfxVolume } from "./music";
import type { Settings } from "./store";

interface Props {
  open: boolean;
  settings: Settings;
  inGame: boolean;
  onChange: (s: Settings) => void;
  onClose: () => void;
  onHome: () => void;
  onRestartLevel: () => void;
  onResetAll: () => void;
}

export default function SettingsModal({ open, settings, inGame, onChange, onClose, onHome, onRestartLevel, onResetAll }: Props) {
  const L = (k: string, ...args: Array<string | number>) => t(settings.lang, k, ...args);
  const [confirm, setConfirm] = useState(false);
  const [about, setAbout] = useState(false);

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    onChange(next);
    if ("music" in patch) setMusicEnabled(patch.music ?? settings.music);
    if ("musicVol" in patch) setMusicVolume(patch.musicVol ?? settings.musicVol);
    if ("sfxVol" in patch) setSfxVolume(patch.sfxVol ?? settings.sfxVol);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="panel-military relative p-4">
        <div className="-mx-4 -mt-4 mb-4 flex items-center justify-between border-b-4 border-[#2e3219] bg-[#56622f] px-4 py-3">
          <div className="font-pixel text-lg font-bold text-[#f2ead3]">⚙ {L("settings")}</div>
          <button onClick={() => { sfx.click(); onClose(); }} className="btn-dark grid h-9 w-9 place-items-center"><X size={18} strokeWidth={3} /></button>
        </div>

        {about ? (
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-[#2e3219]/40 bg-[#f6ecca]/60 p-3">
              <img src="/icon.png" alt="" className="mx-auto mb-2 h-16 w-16 rounded-[22%] border-[3px] border-[#2e3219] object-cover" style={{ imageRendering: "pixelated" }} />
              <div className="font-pixel text-sm font-bold text-[#3e4322]">{L("about")}</div>
              <div className="mt-2 font-num text-lg leading-snug text-[#2e3219]">
                Discord: <b className="font-pixel">hal_2105.</b><br />
                Roblox: <b className="font-pixel">Hal_2105</b>
              </div>
              <div className="mt-1 font-num text-sm text-[#5f6440]">{L("version")}</div>
            </div>
            <button onClick={() => setAbout(false)} className="btn-dark w-full py-2 font-pixel text-xs font-bold">← {L("settings")}</button>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <div className="mb-1 flex items-center gap-2 font-pixel text-xs font-bold text-[#3e4322]"><Globe size={14} /> {L("chooseLang")}</div>
              <div className="grid grid-cols-2 gap-1.5">
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => { sfx.click(); update({ lang: l.code }); }}
                    className={`flex items-center gap-2 rounded-md border-2 px-2 py-1.5 text-left font-num text-base leading-tight ${settings.lang === l.code ? "border-[#2e3219] bg-[#2e3219] text-[#e2cf96]" : "border-[#2e3219]/30 bg-[#f6ecca]/60 text-[#3e4322]"}`}>
                    <span className="text-lg leading-none">{l.flag}</span>
                    <span className="truncate font-bold">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Toggle label={L("sound")} desc={L("soundD")} value={settings.sound} onChange={(v) => update({ sound: v })} />
            <Toggle label={L("music")} desc={L("musicD")} value={settings.music} onChange={(v) => update({ music: v })} />

            <VolumeSlider label={L("musicVolume")} value={settings.musicVol} onChange={(v) => update({ musicVol: v })} />
            <VolumeSlider label={L("sfxVolume")} value={settings.sfxVol} onChange={(v) => update({ sfxVol: v })} />

            <Toggle label={L("vibrate")} desc={L("vibrateD")} value={settings.vibrate} onChange={(v) => update({ vibrate: v })} />
            <Toggle label={L("autoNext")} desc={L("autoNextD")} value={settings.autoNext} onChange={(v) => update({ autoNext: v })} />
            <Toggle label={L("highlight")} desc={L("highlightD")} value={settings.highlight} onChange={(v) => update({ highlight: v })} />

            <div className="grid gap-2">
              {inGame && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { sfx.click(); onRestartLevel(); }} className="btn-olive flex items-center justify-center gap-2 py-2.5 font-pixel text-xs font-bold">
                    <RotateCcw size={15} /> {L("restart")}
                  </button>
                  <button onClick={() => { sfx.click(); onHome(); }} className="btn-olive flex items-center justify-center gap-2 py-2.5 font-pixel text-xs font-bold">
                    <Home size={15} /> {L("backToMenu")}
                  </button>
                </div>
              )}
              <button onClick={() => setAbout(true)} className="btn-dark w-full py-2 font-pixel text-xs font-bold">
                {L("about")}
              </button>
              {!confirm ? (
                <button onClick={() => setConfirm(true)} className="rounded-lg border-2 border-dashed border-[#8b2e1f]/60 py-2 font-pixel text-[11px] font-bold text-[#8b2e1f]">
                  {L("resetProg")}
                </button>
              ) : (
                <div className="rounded-lg border-2 border-[#8b2e1f] bg-[#f6d9c9] p-2">
                  <div className="text-center font-num text-lg leading-tight text-[#8b2e1f]">{L("resetProgWarn")}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button onClick={() => setConfirm(false)} className="btn-dark py-2 font-pixel text-xs font-bold">{L("cancel")}</button>
                    <button onClick={() => { setConfirm(false); onResetAll(); }} className="rounded-lg border-[3px] border-[#3d130b] bg-[#b23b25] py-2 font-pixel text-xs font-bold text-white">{L("reset")}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function VolumeSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-lg border-2 border-[#2e3219]/30 bg-[#f6ecca]/60 px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="font-pixel text-xs font-bold text-[#3e4322]">{label}</span>
        <span className="flex items-center gap-1 font-num text-sm text-[#3e4322]">
          {value === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />} {Math.round(value * 100)}%
        </span>
      </div>
      <input type="range" min={0} max={1} step={0.05} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[#56622f]" />
    </div>
  );
}
