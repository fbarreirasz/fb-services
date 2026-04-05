'use client';

import { useState } from 'react';

const MAX_STAM       = 42 * 60;
const GREEN_THRESHOLD = 39 * 60;

function regenRate(currentMin: number, mode: 'offline' | 'pz' | 'trainer'): number {
  const isGreen = currentMin >= GREEN_THRESHOLD;
  if (mode === 'offline') return isGreen ? 6 : 3;
  if (mode === 'pz')      return isGreen ? 5 : 3;
  return 6;
}

function calcTime(fromMin: number, toMin: number, mode: 'offline' | 'pz' | 'trainer'): number {
  if (fromMin >= toMin) return 0;
  let totalOfflineMin = 0;
  let cur = fromMin;
  while (cur < toMin) {
    const rate        = regenRate(cur, mode);
    const untilGreen  = GREEN_THRESHOLD - cur;
    const remaining   = toMin - cur;
    if (cur < GREEN_THRESHOLD && mode !== 'trainer') {
      const stepsOrange = Math.min(untilGreen, remaining);
      totalOfflineMin  += stepsOrange * rate;
      cur              += stepsOrange;
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
    hour: '2-digit', minute: '2-digit',
  }).replace(/^\w/, c => c.toUpperCase());
}

function fStam(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

// ─── design tokens — idênticos ao skills / loot-split ────────
const BG     = '#111118';
const CARD   = '#1a1a24';
const BORDER = 'rgba(255,255,255,0.07)';
const PURPLE = '#a78bfa';

const MODES = [
  {
    id:    'offline' as const,
    label: 'Offline',
    sub:   'Regeneração Padrão',
    icon:  'https://static.wikia.nocookie.net/tibia/images/c/c9/Dark_Moon_Mirror.gif/revision/latest/thumbnail/width/360/height/360?cb=20170709101902&path-prefix=en',
  },
  {
    id:    'pz' as const,
    label: 'Em PZ',
    sub:   'Rewards Diários',
    icon:  'https://wiki.rubinot.com/decorations/rubinot/cursed-locker.gif',
  },
  {
    id:    'trainer' as const,
    label: 'Treinando',
    sub:   'Com Skeleton Target',
    icon:  'https://wiki.rubinot.com/decorations/rubinot/flame-reaper-execise-dummy.gif',
  },
] as const;

const CAL_ICON = 'https://cdn-icons-png.flaticon.com/512/1513/1513520.png';

export default function StaminaPage() {
  const [curH, setCurH] = useState(39);
  const [curM, setCurM] = useState(0);
  const [desH, setDesH] = useState(42);
  const [desM, setDesM] = useState(0);

  const curMin = Math.min(MAX_STAM, Math.max(0, curH * 60 + curM));
  const desMin = Math.min(MAX_STAM, Math.max(curMin, desH * 60 + desM));
  const pct     = (curMin / MAX_STAM) * 100;
  const isGreen = curMin >= GREEN_THRESHOLD;

  return (
    <main className="relative min-h-screen text-white" style={{ background: BG }}>

      {/* glow — igual ao skills */}
      <div className="pointer-events-none fixed inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10">

        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <button onClick={() => (window.location.href = '/ferramentas')}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-500 transition hover:text-white"
            style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)' }}>
            ← Ferramentas
          </button>
          <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'rgba(167,139,250,0.6)' }}>FB Services</p>
          <h1 className="mt-1 text-3xl font-black text-white">
            Calculadora de <span style={{ color: PURPLE }}>Stamina</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Planeje suas hunts com precisão. Descubra exatamente quando sua stamina voltará ao valor desejado.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* ── LEFT — configuração ── */}
          <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Configuração</p>

            {/* Stamina atual */}
            <div className="mb-4">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Stamina Atual
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input type="number" value={curH} min={0} max={42}
                    onChange={e => setCurH(Math.min(42, Math.max(0, Number(e.target.value))))}
                    className="h-14 w-full rounded-xl border bg-transparent px-4 text-center text-2xl font-black text-white outline-none transition"
                    style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}
                    onFocus={e  => (e.target.style.borderColor = 'rgba(167,139,250,0.4)')}
                    onBlur={e   => (e.target.style.borderColor = BORDER)} />
                  <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-widest text-zinc-600">Horas</p>
                </div>
                <span className="text-2xl font-black text-zinc-600">:</span>
                <div className="flex-1">
                  <input type="number" value={curM} min={0} max={59}
                    onChange={e => setCurM(Math.min(59, Math.max(0, Number(e.target.value))))}
                    className="h-14 w-full rounded-xl bg-transparent px-4 text-center text-2xl font-black text-white outline-none transition"
                    style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}
                    onFocus={e  => (e.target.style.borderColor = 'rgba(167,139,250,0.4)')}
                    onBlur={e   => (e.target.style.borderColor = BORDER)} />
                  <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-widest text-zinc-600">Min.</p>
                </div>
              </div>
            </div>

            {/* Arrow separator */}
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600"
                style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}>
                ↓
              </div>
            </div>

            {/* Stamina desejada */}
            <div className="mb-5">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Stamina Desejada
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input type="number" value={desH} min={curH} max={42}
                    onChange={e => setDesH(Math.min(42, Math.max(0, Number(e.target.value))))}
                    className="h-14 w-full rounded-xl bg-transparent px-4 text-center text-2xl font-black outline-none transition"
                    style={{ border: `1px solid rgba(167,139,250,0.3)`, background: '#0d0d14', color: PURPLE }}
                    onFocus={e  => (e.target.style.borderColor = 'rgba(167,139,250,0.6)')}
                    onBlur={e   => (e.target.style.borderColor = 'rgba(167,139,250,0.3)')} />
                  <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-widest text-zinc-600">Horas</p>
                </div>
                <span className="text-2xl font-black text-zinc-600">:</span>
                <div className="flex-1">
                  <input type="number" value={desM} min={0} max={59}
                    onChange={e => setDesM(Math.min(59, Math.max(0, Number(e.target.value))))}
                    className="h-14 w-full rounded-xl bg-transparent px-4 text-center text-2xl font-black outline-none transition"
                    style={{ border: `1px solid rgba(167,139,250,0.3)`, background: '#0d0d14', color: PURPLE }}
                    onFocus={e  => (e.target.style.borderColor = 'rgba(167,139,250,0.6)')}
                    onBlur={e   => (e.target.style.borderColor = 'rgba(167,139,250,0.3)')} />
                  <p className="mt-1 text-center text-[9px] font-bold uppercase tracking-widest text-zinc-600">Min.</p>
                </div>
              </div>
            </div>

            {/* Barra de stamina */}
            <div className="mb-4">
              <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-zinc-600">Stamina Bar</span>
                <span style={{ color: isGreen ? '#4ade80' : '#fbbf24' }}>{fStam(curMin)}</span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full"
                style={{ background: '#0d0d14', border: `1px solid ${BORDER}` }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: isGreen
                      ? 'linear-gradient(90deg, #16a34a, #4ade80)'
                      : 'linear-gradient(90deg, #d97706, #fbbf24)',
                  }} />
              </div>
            </div>

            {/* Note */}
            {isGreen ? (
              <div className="rounded-xl p-3 text-xs"
                style={{ border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(96,165,250,0.06)', color: '#93c5fd' }}>
                <span className="font-bold">Nota:</span> Stamina Verde (39:00+) regenera mais lentamente. Os cálculos consideram as penalidades de regeneração.
              </div>
            ) : (
              <div className="rounded-xl p-3 text-xs"
                style={{ border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.06)', color: '#fcd34d' }}>
                <span className="font-bold">Stamina Laranja:</span> Abaixo de 39h. Regeneração padrão mais rápida.
              </div>
            )}

            {/* ── Efeitos de Stamina ── */}
            <div className="mt-4 flex flex-col gap-3">

              {/* Tabela de faixas */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Efeitos de Stamina</p>
                <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${BORDER}` }}>
                  <div className="grid grid-cols-2 px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Faixa</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Efeito</span>
                  </div>
                  {[
                    { range: '42:00 ~ 39:00', effect: 'EXP Bônus (+50% rate)', color: '#4ade80' },
                    { range: '38:59 ~ 14:00', effect: 'EXP Normal (rate do level)', color: '#d1d5db' },
                    { range: '13:59 ~ 00:00', effect: 'EXP Reduzida (−50% rate)', color: '#f59e0b' },
                    { range: '08:00 ~ 00:00', effect: 'Criaturas não dropam loot', color: '#f87171' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-2 px-3 py-2.5"
                      style={{ borderTop: `1px solid ${BORDER}`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <span className="text-[11px] font-mono text-zinc-400">{row.range}</span>
                      <span className="text-[11px] font-semibold" style={{ color: row.color }}>{row.effect}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regeneração laranja */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>
                  Stamina Laranja — Regeneração
                </p>
                <div className="overflow-hidden rounded-xl" style={{ border: `1px solid rgba(245,158,11,0.18)` }}>
                  <div className="grid grid-cols-2 px-3 py-2" style={{ background: 'rgba(245,158,11,0.06)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Condição</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Regeneração</span>
                  </div>
                  {[
                    { cond: 'A cada 3 min offline ou dormindo', regen: '+1 minuto' },
                    { cond: 'A cada 6 min atacando um trainer', regen: '+1 minuto' },
                    { cond: 'A cada 3 min em zona de proteção', regen: '+1 minuto' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-2 px-3 py-2.5"
                      style={{ borderTop: `1px solid rgba(245,158,11,0.1)`, background: i % 2 === 0 ? 'transparent' : 'rgba(245,158,11,0.03)' }}>
                      <span className="text-[11px] text-zinc-400">{row.cond}</span>
                      <span className="text-[11px] font-semibold text-zinc-300">{row.regen}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regeneração verde */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#4ade80' }}>
                  Stamina Verde — Regeneração
                </p>
                <div className="overflow-hidden rounded-xl" style={{ border: `1px solid rgba(74,222,128,0.18)` }}>
                  <div className="grid grid-cols-2 px-3 py-2" style={{ background: 'rgba(74,222,128,0.06)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Condição</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Regeneração</span>
                  </div>
                  {[
                    { cond: 'A cada 6 min offline ou dormindo', regen: '+1 minuto' },
                    { cond: 'A cada 6 min atacando um trainer', regen: '+1 minuto' },
                    { cond: 'A cada 5 min em zona de proteção', regen: '+1 minuto' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-2 px-3 py-2.5"
                      style={{ borderTop: `1px solid rgba(74,222,128,0.1)`, background: i % 2 === 0 ? 'transparent' : 'rgba(74,222,128,0.03)' }}>
                      <span className="text-[11px] text-zinc-400">{row.cond}</span>
                      <span className="text-[11px] font-semibold text-zinc-300">{row.regen}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── RIGHT — resultados ── */}
          <div className="flex flex-col gap-4">
            {MODES.map(mode => {
              const offMin = calcTime(curMin, desMin, mode.id);
              const dur    = fDuration(offMin);
              const readyAt = fReadyAt(offMin);

              return (
                <div key={mode.id} className="rounded-2xl p-5"
                  style={{ border: `1px solid ${BORDER}`, background: CARD }}>

                  {/* mode header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
                      <img src={mode.icon} alt={mode.label}
                        className="h-8 w-8 object-contain" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{mode.label}</p>
                      <p className="text-[11px] text-zinc-600">{mode.sub}</p>
                    </div>
                  </div>

                  {/* time blocks — mesma estrutura do skills duration */}
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {[{ label: 'Dias', val: dur.d }, { label: 'Horas', val: dur.h }, { label: 'Min', val: dur.m }].map((item, idx) => (
                      <div key={item.label} className="rounded-xl py-3 text-center"
                        style={{ background: '#0d0d14', border: `1px solid ${BORDER}` }}>
                        <p className="text-2xl font-black"
                          style={{ color: idx === 2 ? PURPLE : '#ffffff' }}>
                          {String(item.val).padStart(2, '0')}
                        </p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* pronto em */}
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}>
                    <img src={CAL_ICON} alt="calendar" className="h-4 w-4 object-contain opacity-50" />
                    <span className="text-[11px] text-zinc-500">Pronto em:</span>
                    <span className="ml-1 truncate text-[11px] font-semibold text-zinc-300 capitalize">{readyAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">
          Baseado nas mecânicas de stamina do RubinOT · Tibia Global
        </p>
      </div>
    </main>
  );
}
