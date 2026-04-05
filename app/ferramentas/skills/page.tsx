'use client';

import { useState, useMemo } from 'react';

const WEAPONS = [
  { id: 'daily',   name: 'Daily Exercise Weapon',   charges: 45000, rc: 390, gold: 31250000, img: 'https://www.tibiawiki.com.br/images/d/db/Lasting_Exercise_Sword.gif' },
  { id: 'lasting', name: 'Lasting Exercise Weapon',  charges: 14400, rc: 190, gold: 10000000, img: 'https://www.tibiawiki.com.br/images/d/db/Lasting_Exercise_Sword.gif' },
  { id: 'reward',  name: 'Reward Exercise Weapon',   charges: 5000,  rc: 0,   gold: 0,        img: 'https://www.tibiawiki.com.br/images/d/db/Lasting_Exercise_Sword.gif' },
  { id: 'durable', name: 'Durable Exercise Weapon',  charges: 1800,  rc: 80,  gold: 1250000,  img: 'https://www.tibiawiki.com.br/images/2/2a/Durable_Exercise_Sword.gif' },
  { id: 'regular', name: 'Exercise Weapon',          charges: 500,   rc: 40,  gold: 347222,   img: 'https://www.tibiawiki.com.br/images/2/2a/Durable_Exercise_Sword.gif' },
] as const;

type WeaponId = typeof WEAPONS[number]['id'];

const VOCS = [
  { id: 'ek', label: 'EK', img: 'https://www.tibiawiki.com.br/images/a/a0/Grand_Sanguine_Hatchet.gif', skills: ['axe', 'shield', 'ml'] },
  { id: 'rp', label: 'RP', img: 'https://www.tibiawiki.com.br/images/3/3a/Grand_Sanguine_Bow.gif',    skills: ['distance', 'shield', 'ml'] },
  { id: 'ms', label: 'MS', img: 'https://www.tibiawiki.com.br/images/0/08/Grand_Sanguine_Coil.gif',   skills: ['ml', 'shield'] },
  { id: 'ed', label: 'ED', img: 'https://www.tibiawiki.com.br/images/c/c9/Grand_Sanguine_Rod.gif',    skills: ['ml', 'shield'] },
  { id: 'em', label: 'EM', img: 'https://www.tibiawiki.com.br/images/3/38/Grand_Sanguine_Claws.gif',  skills: ['fist', 'ml', 'shield'] },
] as const;

type VocId = typeof VOCS[number]['id'];
type SkillId = 'axe' | 'distance' | 'ml' | 'shield' | 'fist';

const SKILL_LABELS: Record<SkillId, string> = {
  axe: 'Axe/Club/Sword', distance: 'Distance', ml: 'Magic Level', shield: 'Shield', fist: 'Fist',
};

const MULT: Record<string, number> = {
  axe: 0.013893, distance: 0.013893, fist: 0.013893,
  ek_shield: 0.013893, rp_shield: 0.013893, ms_shield: 0.38219, ed_shield: 0.38219, em_shield: 0.04338,
  ms_ml: 0.013836, ed_ml: 0.013836, em_ml: 1.8067, rp_ml: 185.22, ek_ml: 6241.5,
};

function getM(skill: SkillId, voc: VocId) {
  return (skill === 'ml' || skill === 'shield') ? MULT[`${voc}_${skill}`] ?? 0.01389 : MULT[skill] ?? 0.01389;
}

function calcCharges(from: number, to: number, pct: number, skill: SkillId, voc: VocId, dummy: boolean, dbl: boolean) {
  if (to <= from) return 0;
  const M = getM(skill, voc);
  const first = 50 * M * Math.pow(1.1, from - 10) * (pct / 100);
  const rest = to > from + 1 ? 50 * M * Math.pow(1.1, from - 9) * (Math.pow(1.1, to - from - 1) - 1) / 0.1 : 0;
  let raw = first + rest;
  if (dummy) raw /= 1.1;
  if (dbl) raw /= 2;
  return Math.ceil(raw);
}

type WeaponQty = { weapon: typeof WEAPONS[number]; qty: number };

function findCombination(n: number, fixedId?: WeaponId): WeaponQty[] {
  if (n <= 0) return [];
  if (fixedId) {
    const w = WEAPONS.find(x => x.id === fixedId)!;
    return [{ weapon: w, qty: Math.ceil(n / w.charges) }];
  }
  const order = WEAPONS.filter(w => w.rc > 0);
  const result: WeaponQty[] = [];
  let rem = n;
  for (let i = 0; i < order.length; i++) {
    const w = order[i];
    const last = i === order.length - 1;
    const qty = last ? Math.ceil(rem / w.charges) : Math.floor(rem / w.charges);
    if (qty > 0) { result.push({ weapon: w, qty }); rem -= qty * w.charges; }
    if (rem <= 0) break;
  }
  return result;
}

function calcCost(combo: WeaponQty[]) {
  return {
    gold: combo.reduce((s, c) => s + c.weapon.gold * c.qty, 0),
    rc: combo.reduce((s, c) => s + c.weapon.rc * c.qty, 0),
    total: combo.reduce((s, c) => s + c.weapon.charges * c.qty, 0),
  };
}

function fNum(n: number) { return n.toLocaleString('pt-BR'); }

function fTime(charges: number, vip: boolean) {
  if (charges <= 0) return { d: 0, h: 0, m: 0 };
  const totalMin = charges / (vip ? 0.55 : 0.5) / 60;
  return { d: Math.floor(totalMin / 1440), h: Math.floor((totalMin % 1440) / 60), m: Math.floor(totalMin % 60) };
}

const BG = '#111118';
const CARD = '#1a1a24';
const BORDER = 'rgba(255,255,255,0.07)';
const AMBER = '#f59e0b';

function Checkbox({ checked, onChange, label, sub, icon }: { checked: boolean; onChange: () => void; label: string; sub: string; icon?: string }) {
  return (
    <div onClick={onChange} className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors"
      style={{ border: `1px solid ${checked ? 'rgba(245,158,11,0.35)' : BORDER}`, background: checked ? 'rgba(245,158,11,0.07)' : 'rgba(255,255,255,0.02)' }}>
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
        style={{ border: `2px solid ${checked ? AMBER : 'rgba(255,255,255,0.18)'}`, background: checked ? AMBER : 'transparent' }}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: checked ? AMBER : '#d1d5db' }}>{label}</p>
        <p className="text-[11px] text-zinc-600">{sub}</p>
      </div>
      {icon && <span className="text-lg opacity-60">{icon}</span>}
    </div>
  );
}

export default function SkillsPage() {
  const [voc, setVoc] = useState<VocId>('ek');
  const [skill, setSkill] = useState<SkillId>('axe');
  const [from, setFrom] = useState(10);
  const [to, setTo] = useState(80);
  const [pct, setPct] = useState(100);
  const [vip, setVip] = useState(true);
  const [dummy, setDummy] = useState(true);
  const [dbl, setDbl] = useState(false);
  const [tab, setTab] = useState<'best' | WeaponId>('best');

  const vocObj = VOCS.find(v => v.id === voc)!;

  function handleVoc(id: VocId) {
    setVoc(id);
    const v = VOCS.find(x => x.id === id)!;
    if (!v.skills.includes(skill as never)) setSkill(v.skills[0] as SkillId);
  }

  const charges = useMemo(() => calcCharges(from, to, pct, skill, voc, dummy, dbl), [from, to, pct, skill, voc, dummy, dbl]);
  const combo = useMemo(() => tab === 'best' ? findCombination(charges) : findCombination(charges, tab as WeaponId), [charges, tab]);
  const cost = useMemo(() => calcCost(combo), [combo]);
  const time = useMemo(() => fTime(charges, vip), [charges, vip]);

  const TABS: { id: 'best' | WeaponId; label: string }[] = [
    { id: 'best', label: 'Melhor Combinação' },
    { id: 'daily', label: 'Daily' },
    { id: 'lasting', label: 'Lasting' },
    { id: 'reward', label: 'Reward' },
    { id: 'durable', label: 'Durable' },
    { id: 'regular', label: 'Regular' },
  ];

  return (
    <main className="relative min-h-screen text-white" style={{ background: BG }}>
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <button onClick={() => (window.location.href = '/ferramentas')}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-500 transition hover:text-white"
            style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)' }}>
            ← Ferramentas
          </button>
          <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'rgba(245,158,11,0.6)' }}>On RubinOT</p>
          <h1 className="mt-1 text-3xl font-black text-white">Calculadora de <span style={{ color: AMBER }}>Skills</span></h1>
          <p className="mt-2 text-sm text-zinc-500">Planeje seu treinamento com precisão. Calcule custos, tempo e a melhor estratégia para sua vocação.</p>
        </div>

        {/* Top cost cards */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl p-5" style={{ border: `1px solid rgba(245,158,11,0.25)`, background: CARD }}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Custo em Gold</p>
            <p className="text-2xl font-black" style={{ color: AMBER }}>
              {cost.gold > 0 ? fNum(cost.gold) + ',00' : '0'}
              <span className="ml-2 text-sm font-normal text-zinc-500">gp</span>
            </p>
          </div>
          <div className="rounded-2xl p-5" style={{ border: `1px solid rgba(96,165,250,0.25)`, background: CARD }}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Custo em Coins</p>
            <p className="text-2xl font-black text-sky-400">
              {fNum(cost.rc)}
              <span className="ml-2 text-sm font-normal text-zinc-500">RC</span>
            </p>
          </div>
          <div className="rounded-2xl p-5" style={{ border: `1px solid rgba(52,211,153,0.25)`, background: CARD }}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Total Cargas</p>
            <p className="text-2xl font-black text-emerald-400">{charges > 0 ? fNum(cost.total) : '0'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[420px_1fr]">
          {/* LEFT */}
          <div className="flex flex-col gap-4">
            {/* Vocação + Habilidade + Levels */}
            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              {/* Vocação */}
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Vocação</p>
              <div className="mb-6 flex gap-2">
                {VOCS.map(v => (
                  <button key={v.id} onClick={() => handleVoc(v.id)}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all"
                    style={{
                      width: 68, height: 68,
                      border: `2px solid ${voc === v.id ? AMBER : BORDER}`,
                      background: voc === v.id ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.02)',
                    }}>
                    <img src={v.img} alt={v.label} className="h-9 w-9 object-contain" style={{ imageRendering: 'pixelated' }} />
                    <span className="text-[9px] font-bold" style={{ color: voc === v.id ? AMBER : '#4b5563' }}>{v.label}</span>
                  </button>
                ))}
              </div>

              {/* Habilidade */}
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Habilidade</p>
              <div className="mb-6 flex flex-wrap gap-2">
                {(['axe', 'distance', 'ml', 'shield', 'fist'] as SkillId[]).map(s => {
                  const ok = vocObj.skills.includes(s as never);
                  const active = skill === s && ok;
                  return (
                    <button key={s} onClick={() => ok && setSkill(s)} disabled={!ok}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all"
                      style={{
                        background: active ? AMBER : ok ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                        color: active ? '#000' : ok ? '#9ca3af' : '#2d3748',
                        border: active ? 'none' : `1px solid ${ok ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                        cursor: ok ? 'pointer' : 'not-allowed',
                      }}>
                      {SKILL_LABELS[s]}
                    </button>
                  );
                })}
              </div>

              {/* Level inputs */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex-1 rounded-xl p-4 text-center" style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Atual</p>
                  <input type="number" value={from} min={10} max={to - 1}
                    onChange={e => setFrom(Math.max(10, Math.min(to - 1, Number(e.target.value))))}
                    className="w-full bg-transparent text-center text-2xl font-black text-white outline-none" />
                </div>
                <span className="text-zinc-600 text-lg">→</span>
                <div className="flex-1 rounded-xl p-4 text-center" style={{ border: `1px solid rgba(245,158,11,0.3)`, background: '#0d0d14' }}>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Desejado</p>
                  <input type="number" value={to} min={from + 1}
                    onChange={e => setTo(Math.max(from + 1, Number(e.target.value)))}
                    className="w-full bg-transparent text-center text-2xl font-black outline-none" style={{ color: AMBER }} />
                </div>
              </div>

              {/* Progress */}
              <div className="mb-5">
                <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-zinc-600">Progresso do nível atual</span>
                  <span style={{ color: AMBER }}>{pct}% Restante</span>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full" style={{ background: '#0d0d14', border: `1px solid ${BORDER}` }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, #d97706, ${AMBER})` }} />
                  <input type="range" min={1} max={100} value={pct} onChange={e => setPct(Number(e.target.value))}
                    className="absolute inset-0 w-full cursor-pointer opacity-0" />
                </div>
              </div>

              {/* Loyalty */}
              <div className="rounded-xl p-3" style={{ border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(96,165,250,0.06)' }}>
                <p className="mb-0.5 text-xs font-bold text-sky-400">Nota sobre Loyalty:</p>
                <p className="text-xs text-zinc-500">A calculadora usa skills base. Não insira valores com bônus de loyalty.</p>
              </div>
            </div>

            {/* Bônus */}
            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">⚡ Bônus & Extras</p>
              <div className="flex flex-col gap-2">
                <Checkbox checked={vip} onChange={() => setVip(!vip)} label="VIP Account" sub="Aceleração nos disparos (10%)" icon="👑" />
                <Checkbox checked={dummy} onChange={() => setDummy(!dummy)} label="Exercise Dummy" sub="Eficiência +10%" />
                <Checkbox checked={dbl} onChange={() => setDbl(!dbl)} label="Double Event" sub="Skill rate +100%" icon="⚡" />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            {/* Weapon panel */}
            <div className="flex-1 rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              {/* Tabs */}
              <div className="mb-5 flex flex-wrap gap-1.5">
                {TABS.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all"
                    style={{
                      background: tab === t.id ? AMBER : 'rgba(255,255,255,0.04)',
                      color: tab === t.id ? '#000' : '#6b7280',
                      border: tab === t.id ? 'none' : `1px solid ${BORDER}`,
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {charges === 0 ? (
                  <div className="flex h-32 items-center justify-center text-zinc-700 text-sm">Level atual igual ao desejado</div>
                ) : combo.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl px-5 py-4 transition-colors"
                    style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}>
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
                      <img src={c.weapon.img} alt={c.weapon.name} className="h-9 w-9 object-contain" style={{ imageRendering: 'pixelated' }} />
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-black" style={{ background: AMBER }}>
                        x{c.qty}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{c.weapon.name}</p>
                      <p className="text-[11px] text-zinc-600">{fNum(c.weapon.charges)} cargas por unidade</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black" style={{ color: AMBER }}>{fNum(c.weapon.charges * c.qty)}</p>
                      <p className="text-[10px] uppercase tracking-wide text-zinc-600">Cargas totais</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl"
                    style={{ background: 'rgba(245,158,11,0.1)', border: `1px solid rgba(245,158,11,0.2)` }}>
                    ⏱️
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Duração Total</p>
                    <p className="text-xs text-zinc-500">Tempo de Treino Estimado</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {time.d > 0 && (
                    <>
                      <div className="rounded-lg px-4 py-2 text-center" style={{ background: '#0d0d14', border: `1px solid ${BORDER}` }}>
                        <p className="text-2xl font-black text-white">{String(time.d).padStart(2, '0')}</p>
                        <p className="text-[8px] uppercase tracking-widest text-zinc-600">Dias</p>
                      </div>
                      <span className="text-zinc-700 text-xl">:</span>
                    </>
                  )}
                  <div className="rounded-lg px-4 py-2 text-center" style={{ background: '#0d0d14', border: `1px solid ${BORDER}` }}>
                    <p className="text-2xl font-black text-white">{String(time.h).padStart(2, '0')}</p>
                    <p className="text-[8px] uppercase tracking-widest text-zinc-600">Horas</p>
                  </div>
                  <span className="text-zinc-700 text-xl">:</span>
                  <div className="rounded-lg px-4 py-2 text-center" style={{ background: '#0d0d14', border: `1px solid ${BORDER}` }}>
                    <p className="text-2xl font-black" style={{ color: AMBER }}>{String(time.m).padStart(2, '0')}</p>
                    <p className="text-[8px] uppercase tracking-widest text-zinc-600">Min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">Calculadora de Skills · RubinOT · Baseada nos rates do servidor</p>
      </div>
    </main>
  );
}
