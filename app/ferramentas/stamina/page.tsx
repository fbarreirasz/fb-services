'use client';

import { useState } from 'react';

// Stamina regeneration rules:
// ORANGE (< 39:00): offline/sleeping = 3min per 1min stam, trainer = 6min per 1min, PZ = 3min per 1min
// GREEN (>= 39:00): offline/sleeping = 6min per 1min stam, trainer = 6min per 1min, PZ = 5min per 1min
const MAX_STAM = 42 * 60;
const GREEN_THRESHOLD = 39 * 60;

function regenRate(currentMin: number, mode: 'offline' | 'pz' | 'trainer'): number {
  const isGreen = currentMin >= GREEN_THRESHOLD;
  if (mode === 'offline') return isGreen ? 6 : 3;
  if (mode === 'pz')      return isGreen ? 5 : 3;
  return 6; // trainer always 6
}

function calcTime(fromMin: number, toMin: number, mode: 'offline' | 'pz' | 'trainer'): number {
  if (fromMin >= toMin) return 0;
  let totalOfflineMin = 0;
  let cur = fromMin;
  while (cur < toMin) {
    const rate = regenRate(cur, mode);
    const untilGreen = GREEN_THRESHOLD - cur;
    const remaining = toMin - cur;
    if (cur < GREEN_THRESHOLD && mode !== 'trainer') {
      const stepsOrange = Math.min(untilGreen, remaining);
      totalOfflineMin += stepsOrange * rate;
      cur += stepsOrange;
    } else {
      totalOfflineMin += remaining * rate;
      cur = toMin;
    }
  }
  return totalOfflineMin;
}

function fDuration(min: number) {
  const d = Math.floor(min / 60 / 24);
  const h = Math.floor((min / 60) % 24);
  const m = Math.round(min % 60);
  return { d, h, m };
}

function fReadyAt(offsetMin: number): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + offsetMin);
  return now.toLocaleString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
    hour: '2-digit', minute: '2-digit'
  }).replace(/^\w/, c => c.toUpperCase());
}

function fStam(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

const MODES = [
  { id: 'offline', label: 'Offline', sub: 'Regeneração Padrão', icon: '🌙' },
  { id: 'pz',      label: 'Em PZ',   sub: 'Rewards Diários',    icon: '🛡️' },
  { id: 'trainer', label: 'Treinando', sub: 'Com Skeleton Target', icon: '⚔️' },
] as const;

export default function StaminaPage() {
  const [curH, setCurH] = useState(39);
  const [curM, setCurM] = useState(0);
  const [desH, setDesH] = useState(42);
  const [desM, setDesM] = useState(0);

  const curMin = Math.min(MAX_STAM, Math.max(0, curH * 60 + curM));
  const desMin = Math.min(MAX_STAM, Math.max(curMin, desH * 60 + desM));
  const pct = (curMin / MAX_STAM) * 100;
  const isGreen = curMin >= GREEN_THRESHOLD;

  return (
    <main className="relative min-h-screen overflow-hidden text-white"
      style={{ background: 'radial-gradient(circle at 50% 14%, rgba(205,215,255,0.10) 0%, transparent 18%), radial-gradient(circle at 52% 18%, rgba(168,140,255,0.25) 0%, rgba(168,140,255,0.08) 14%, transparent 30%), linear-gradient(to bottom, #09101f 0%, #050b17 42%, #040814 72%, #030611 100%)' }}>
      <div className="orb-1 pointer-events-none absolute left-[-10%] top-[8%] z-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[80px]" />
      <div className="orb-2 pointer-events-none absolute right-[-8%] top-[5%] z-0 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/15 blur-[90px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 text-center">
          <button onClick={() => (window.location.href = '/ferramentas')}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-zinc-400 backdrop-blur-md transition hover:text-white">
            ← Ferramentas
          </button>
          <p className="text-xs uppercase tracking-[0.45em] text-violet-400">On RubinOT</p>
          <h1 className="mt-2 text-4xl font-black tracking-[0.1em] text-amber-400">Calculadora de Stamina</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
            Planeje suas hunts com precisão. Descubra exatamente quando sua stamina voltará ao valor desejado.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left — config */}
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Configuração</p>

            {/* Stamina atual */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Stamina Atual</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input type="number" value={curH} min={0} max={42}
                    onChange={e => setCurH(Math.min(42, Math.max(0, Number(e.target.value))))}
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-center text-2xl font-black text-white outline-none focus:border-violet-500/50" />
                  <p className="mt-1 text-center text-[10px] text-zinc-600 uppercase tracking-widest">Horas</p>
                </div>
                <span className="text-2xl font-black text-zinc-500">:</span>
                <div className="flex-1">
                  <input type="number" value={curM} min={0} max={59}
                    onChange={e => setCurM(Math.min(59, Math.max(0, Number(e.target.value))))}
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-center text-2xl font-black text-white outline-none focus:border-violet-500/50" />
                  <p className="mt-1 text-center text-[10px] text-zinc-600 uppercase tracking-widest">Min.</p>
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400">↓</div>
            </div>

            {/* Stamina desejada */}
            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Stamina Desejada</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input type="number" value={desH} min={curH} max={42}
                    onChange={e => setDesH(Math.min(42, Math.max(0, Number(e.target.value))))}
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-center text-2xl font-black text-white outline-none focus:border-violet-500/50" />
                  <p className="mt-1 text-center text-[10px] text-zinc-600 uppercase tracking-widest">Horas</p>
                </div>
                <span className="text-2xl font-black text-zinc-500">:</span>
                <div className="flex-1">
                  <input type="number" value={desM} min={0} max={59}
                    onChange={e => setDesM(Math.min(59, Math.max(0, Number(e.target.value))))}
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-center text-2xl font-black text-white outline-none focus:border-violet-500/50" />
                  <p className="mt-1 text-center text-[10px] text-zinc-600 uppercase tracking-widest">Min.</p>
                </div>
              </div>
            </div>

            {/* Barra */}
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs text-zinc-500">
                <span>Stamina Bar</span>
                <span className={isGreen ? 'text-green-400 font-semibold' : 'text-amber-400 font-semibold'}>{fStam(curMin)}</span>
              </div>
              <div className="relative h-5 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
                <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: isGreen ? 'linear-gradient(90deg,#22c55e,#4ade80)' : 'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />
              </div>
            </div>

            {/* Nota */}
            {isGreen && (
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-300">
                <span className="font-bold">Nota:</span> Stamina Verde (39:00+) regenera mais lentamente. Os cálculos consideram automaticamente as penalidades de regeneração.
              </div>
            )}
            {!isGreen && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                <span className="font-bold">Stamina Laranja:</span> Abaixo de 39h. Regeneração padrão mais rápida.
              </div>
            )}
          </div>

          {/* Right — results */}
          <div className="flex flex-col gap-4">
            {MODES.map(mode => {
              const offMin = calcTime(curMin, desMin, mode.id);
              const dur = fDuration(offMin);
              const readyAt = fReadyAt(offMin);
              return (
                <div key={mode.id} className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-xl">{mode.icon}</span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">{mode.label}</p>
                      <p className="text-[11px] text-zinc-500">{mode.sub}</p>
                    </div>
                  </div>
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {[{ label: 'Dias', val: dur.d }, { label: 'Horas', val: dur.h }, { label: 'Min', val: dur.m }].map(item => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 py-3 text-center">
                        <p className="text-2xl font-black text-white">{item.val}</p>
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500">{item.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <span className="text-xs text-zinc-500">📅 Pronto em:</span>
                    <span className="text-xs font-semibold text-white capitalize">{readyAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">Baseado nas mecânicas de stamina do RubinOT · Tibia Global</p>
      </div>
    </main>
  );
}
