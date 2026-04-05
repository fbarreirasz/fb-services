'use client';

import { useState, useMemo } from 'react';

// ─── design tokens ────────────────────────────────────────────
const BG     = '#111118';
const CARD   = '#1a1a24';
const BORDER = 'rgba(255,255,255,0.07)';
const PURPLE = '#a78bfa';

// ─── Pool sizes por dificuldade (Tibia Global) ────────────────
const POOL_SIZES: Record<string, number> = {
  Beginner: 151,
  Adept:    436,
  Expert:   489,
  Master:   260,
};

// ─── Criaturas (top hunts) para dropdown ─────────────────────
const CREATURES: Record<string, string[]> = {
  Beginner: [
    'Bat','Cave Rat','Crocodile','Cyclops','Dragon','Dragon Hatchling',
    'Dwarf','Dwarf Geomancer','Dwarf Guard','Dwarf Soldier',
    'Elf','Elf Arcanist','Elf Scout','Ghoul','Giant Spider',
    'Goblin','Goblin Assassin','Goblin Leader',
    'Minotaur','Minotaur Archer','Minotaur Guard','Minotaur Mage',
    'Orc','Orc Berserker','Orc Leader','Orc Rider','Orc Shaman','Orc Spearman','Orc Warrior',
    'Pirate Corsair','Pirate Cutthroat','Pirate Marauder',
    'Skeleton','Slime','Spider','Swamp Troll','Troll','Troll Champion','Troll Guard',
    'Vampire','Witch','Wolf','Zombie',
  ],
  Adept: [
    'Bonelord','Crystal Spider','Dark Torturer','Demon Outcast','Diabolic Imp',
    'Elder Bonelord','Fire Devil','Gargoyle','Ghost','Grim Reaper',
    'Hell Hound','Hellfire Fighter','Hydra','Juggernaut','Kongra',
    'Lancer Beetle','Medusa','Monk','Mummy','Mutated Bat','Mutated Human','Mutated Tiger',
    'Nightmare','Orc Warlord','Plaguesmith','Polar Bear','Priestess',
    'Quara Constrictor','Quara Hydromancer','Quara Mantassin','Quara Pincher','Quara Predator',
    'Rorc','Sea Serpent','Serpent Spawn','Sibang','Silencer','Souleater',
    'Stone Golem','Tarantula','Terror Bird','Thornback Tortoise',
    'Undead Gladiator','Vampire Bride','War Golem','Werewolf','Wyrm','Wyvern',
  ],
  Expert: [
    'Ancient Scarab','Annihilon','Betrayed Wraith','Blightwalker',
    'Corym Charlatan','Corym Skirmisher','Corym Vanguard',
    'Dark Faun','Death Blob',
    'Deepling Elite','Deepling Guard','Deepling Scout','Deepling Spellsinger','Deepling Warrior',
    'Demon','Demon Skeleton','Dragon Lord','Dragon Lord Hatchling',
    'Draken Abomination','Draken Elite','Draken Spellweaver','Draken Warmaster',
    'Eye of the Storm','Flameborn','Glooth Anemone','Glooth Bandit','Glooth Brigand','Glooth Golem',
    'Grimeleech','Hellspawn','Hideous Fungus','Ice Witch','Infernal Demon',
    'Iron Servant','Lava Lurker','Leviathan',
    'Lost Berserker','Lost Exile','Lost Ghost','Lost Husher',
    'Mad Mage','Marid','Massive Fire Elemental','Massive Ice Elemental',
    'Mohrior','Nighthunter','Nightstalker',
    'Ogre Brute','Ogre Rowdy','Ogre Savage','Ogre Shaman',
    'Outburst','Phantom','Rage Squid','Ravenous Hunger',
    'Rot Elemental','Rukhs','Silencer','Soulcatcher',
    'Splasher','Squasher','Swarmer','Tentugly',
    'Undead Dragon','Vexclaw','Voracious Lernaion','Wailing Widow',
    'White Shade','Worm Priestess','Xelvar','Yielothax',
  ],
  Master: [
    'Abyssador','Alptramun','Annihilon','Armadile',
    'Cave Devourer','Cliff Strider','Crazed Summer Rearguard','Crazed Winter Rearguard',
    'Dark Faun','Death Dragon','Deepling Tyrant',
    'Demon','Devourer','Draken Abomination','Draken Elite',
    'Enraged Crystal Golem','Eye of the Storm','Faceless Bane',
    'Ferumbras Mortal Shell','Frazzlemaw',
    'Gaz\'haragoth','Ghastly Dragon','Glooth Golem','Grimeleech',
    'Harpy','Haunted Dragon','Hellflayer','Hellspawn',
    'Infernal Demon','Ironblight','Juggernaut',
    'Keeper of Desolation','Lava Lurker','Leviathan',
    'Mad Mage','Marid','Minishabaal','Mohrior',
    'Naga Archer','Naga Warrior','Nighthunter',
    'Ogre Brute','Outburst','Ravenous Hunger','Retching Horror',
    'Rot Elemental','Shredderthrax','Sparkion','Splasher','Squasher',
    'Sulphider','Swarmer','Tenebris','Timira the Many-Headed',
    'Undead Dragon','Urmahlullu the Weakened',
    'Vexclaw','Voracious Lernaion','Wailing Widow',
    'Wildfire Elemental','Worm Priestess','Xelvar','Yielothax','Zushuka',
  ],
};

const DIFFICULTIES = ['Beginner','Adept','Expert','Master'] as const;
type Difficulty = typeof DIFFICULTIES[number];

const DIFF_COLORS: Record<Difficulty, string> = {
  Beginner: '#22c55e',
  Adept:    '#3b82f6',
  Expert:   '#f59e0b',
  Master:   '#ef4444',
};

// ─── Probability formula ──────────────────────────────────────
// P(preferred in at least 1 of 3 task slots) with weight multiplier w
// P = 1 - ((T-1)/(T-1+w))^3
function calcProb(total: number, weight: number): number {
  if (total <= 0 || weight <= 0) return 0;
  const p = 1 - Math.pow((total - 1) / (total - 1 + weight), 3);
  return Math.max(0, Math.min(100, p * 100));
}

// ─── Talisman cost formulas (TibiaQA verified) ───────────────
// Damage/Leech/Loot: Cost from start% to end% (0.5% steps, start=2.5%, first step=5 pts, +12 each)
// Bestiary: Cost from start% to end% (1% steps, start=5%, first step=5 pts, +12 each)
function calcTalismanCost(type: TalismanType, from: number, to: number): number {
  if (to <= from) return 0;

  if (type === 'bestiary') {
    // 1% per level, starts at 5%, first cost = 5, +12 each level
    // level index starts at 0 → from
    const startLevel = Math.round(from - 5);   // level index when at from%
    const endLevel   = Math.round(to   - 5);   // level index when at to%
    if (endLevel <= startLevel) return 0;
    let cost = 0;
    for (let lv = startLevel; lv < endLevel; lv++) {
      cost += 5 + 12 * lv;
    }
    return cost;
  } else {
    // 0.5% per level, starts at 2.5%, first cost = 5, +12 each level
    const startLevel = Math.round((from - 2.5) / 0.5);
    const endLevel   = Math.round((to   - 2.5) / 0.5);
    if (endLevel <= startLevel) return 0;
    let cost = 0;
    for (let lv = startLevel; lv < endLevel; lv++) {
      cost += 5 + 12 * lv;
    }
    return cost;
  }
}

// ─── Talisman types ───────────────────────────────────────────
type TalismanType = 'damage' | 'leech' | 'loot' | 'bestiary';
const TALISMAN_TYPES: { id: TalismanType; label: string }[] = [
  { id: 'damage',   label: 'Dano vs Criaturas' },
  { id: 'leech',    label: 'Roubo de Vida' },
  { id: 'loot',     label: 'Mais Saque' },
  { id: 'bestiary', label: 'Bestiário Duplo' },
];

const TALISMAN_CONFIG: Record<TalismanType, { min: number; max: number; step: number; formula: string }> = {
  damage:   { min: 2.5,  max: 50,  step: 0.5, formula: 'Cost = 6 × [2(% − 2.5)]² − [2(% − 2.5)] por nível (+0.5% cada)' },
  leech:    { min: 2.5,  max: 50,  step: 0.5, formula: 'Cost = 6 × [2(% − 2.5)]² − [2(% − 2.5)] por nível (+0.5% cada)' },
  loot:     { min: 2.5,  max: 50,  step: 0.5, formula: 'Cost = 6 × [2(% − 2.5)]² − [2(% − 2.5)] por nível (+0.5% cada)' },
  bestiary: { min: 5,    max: 100, step: 1,   formula: 'Cost = 6 × (% − 5)² − (% − 5) por nível (+1% cada)' },
};

function fNum(n: number) { return Math.round(n).toLocaleString('pt-BR'); }

// ─── SlotCard ─────────────────────────────────────────────────
function SlotCard({
  index, preferred, unwanted, pool, total, allPreferred, allUnwanted,
  onPrefChange, onUnwantChange, diffColor,
}: {
  index: number; preferred: string | null; unwanted: string | null;
  pool: string[]; total: number;
  allPreferred: (string|null)[]; allUnwanted: (string|null)[];
  onPrefChange: (v: string|null) => void;
  onUnwantChange: (v: string|null) => void;
  diffColor: string;
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-3"
      style={{ border: `1px solid ${preferred ? diffColor + '40' : BORDER}`, background: '#0d0d14' }}>

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Slot {index + 1}
        </span>
        {preferred && (
          <button onClick={() => { onPrefChange(null); onUnwantChange(null); }}
            className="text-[10px] text-zinc-600 hover:text-zinc-400 transition">✕ limpar</button>
        )}
      </div>

      {/* PREFERRED */}
      <div>
        <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest" style={{ color: diffColor }}>
          Monstro Preferido (5x probabilidade)
        </p>
        <CreatureSelect
          value={preferred}
          pool={pool}
          blocked={allPreferred.filter((v, i) => i !== index && v !== null) as string[]}
          placeholder="Selecione"
          accentColor={diffColor}
          onChange={onPrefChange}
        />
      </div>

      {/* UNWANTED */}
      <div>
        <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-700">
          Monstro Indesejado (0 probabilidade)
        </p>
        <CreatureSelect
          value={unwanted}
          pool={pool}
          blocked={allUnwanted.filter((v, i) => i !== index && v !== null) as string[]}
          placeholder="Indesejado"
          accentColor="rgba(255,255,255,0.15)"
          onChange={onUnwantChange}
        />
      </div>

      {/* Individual probability breakdown */}
      {preferred && (
        <div className="rounded-lg p-3" style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}>
          <p className="mb-2 text-[9px] font-black uppercase tracking-wider" style={{ color: preferred ? diffColor : 'rgba(255,255,255,0.3)' }}>
            {preferred}
          </p>
          {[
            { label: '1x', weight: 1 },
            { label: '5x', weight: 5 },
            { label: '10x', weight: 10 },
          ].map(({ label, weight }) => {
            const p = calcProb(total, weight);
            return (
              <div key={label} className="flex items-center gap-2 mb-1.5">
                <span className="w-6 text-[10px] font-black text-zinc-500">{label}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${p}%`, background: weight === 5 ? PURPLE : weight === 10 ? '#c084fc' : 'rgba(255,255,255,0.2)', transition: 'width 0.3s' }} />
                </div>
                <span className="w-10 text-right text-[10px] font-black" style={{ color: weight === 5 ? PURPLE : weight === 10 ? '#c084fc' : '#6b7280' }}>
                  {p.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── CreatureSelect ───────────────────────────────────────────
function CreatureSelect({ value, pool, blocked, placeholder, accentColor, onChange }:
  { value: string|null; pool: string[]; blocked: string[]; placeholder: string; accentColor: string; onChange: (v: string|null) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? pool.filter(m => m.toLowerCase().includes(search.toLowerCase()))
    : pool;

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex h-9 w-full items-center justify-between rounded-lg px-3 text-xs transition"
        style={{ border: `1px solid ${value ? accentColor : BORDER}`, background: 'rgba(255,255,255,0.03)', color: value ? '#fff' : '#4b5563' }}>
        <span className="truncate font-semibold">{value ?? placeholder}</span>
        <div className="flex shrink-0 items-center gap-1">
          {value && (
            <span onClick={e => { e.stopPropagation(); onChange(null); }}
              className="flex h-4 w-4 items-center justify-center rounded text-zinc-500 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </span>
          )}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch(''); }} />
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-xl shadow-2xl"
            style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
            <div className="p-2">
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="h-7 w-full rounded-lg px-2.5 text-[11px] text-white outline-none"
                style={{ border: `1px solid rgba(167,139,250,0.2)`, background: '#1a1a24' }} />
            </div>
            <div className="overflow-y-auto px-1 pb-1" style={{ maxHeight: 200, scrollbarWidth: 'thin', scrollbarColor: 'rgba(167,139,250,0.2) transparent' }}>
              {filtered.map(m => {
                const isBlocked = blocked.includes(m);
                const isActive  = value === m;
                return (
                  <button key={m} disabled={isBlocked && !isActive}
                    onClick={() => { onChange(m); setOpen(false); setSearch(''); }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] transition"
                    style={{
                      color: isActive ? PURPLE : isBlocked ? '#374151' : '#9ca3af',
                      background: isActive ? 'rgba(167,139,250,0.1)' : 'transparent',
                      cursor: isBlocked && !isActive ? 'not-allowed' : 'pointer',
                    }}>
                    <span>{m}</span>
                    {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                );
              })}
              {filtered.length === 0 && <p className="py-2 text-center text-[11px] text-zinc-700">Nenhuma criatura</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── TalismanCalculator ───────────────────────────────────────
function TalismanCalculator() {
  const [type,    setType]    = useState<TalismanType>('damage');
  const [fromPct, setFromPct] = useState('2.5');
  const [toPct,   setToPct]   = useState('');
  const [result,  setResult]  = useState<number | null>(null);
  const [error,   setError]   = useState('');
  const [openDD,  setOpenDD]  = useState(false);

  const cfg = TALISMAN_CONFIG[type];

  function calculate() {
    setError('');
    const from = parseFloat(fromPct);
    const to   = parseFloat(toPct);
    if (isNaN(from) || isNaN(to)) { setError('Preencha os campos.'); return; }
    if (from < cfg.min) { setError(`Mínimo: ${cfg.min}%`); return; }
    if (to > cfg.max)   { setError(`Máximo: ${cfg.max}%`); return; }
    if (to <= from)     { setError('% desejada deve ser maior.'); return; }
    setResult(calcTalismanCost(type, from, to));
  }

  const inputStyle = {
    border: `1px solid ${BORDER}`, background: '#0d0d14',
    borderRadius: 10, padding: '8px 12px', color: '#fff',
    fontSize: 15, fontWeight: 800, fontFamily: 'inherit',
    outline: 'none', width: '100%',
  };

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
      <div className="flex items-center gap-2">
        <span style={{ color: PURPLE }}>⚡</span>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Calculadora de Custo do Talismã
        </p>
      </div>

      {/* Tipo dropdown */}
      <div className="relative">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Tipo de Talismã</p>
        <button onClick={() => setOpenDD(o => !o)}
          className="flex h-10 w-full items-center justify-between rounded-xl px-3 text-sm font-semibold text-white transition"
          style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
          <span>{TALISMAN_TYPES.find(t => t.id === type)?.label}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"
            style={{ transform: openDD ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {openDD && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenDD(false)} />
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl overflow-hidden shadow-2xl"
              style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
              {TALISMAN_TYPES.map(t => (
                <button key={t.id}
                  onClick={() => { setType(t.id); setOpenDD(false); setResult(null); setError(''); setFromPct(TALISMAN_CONFIG[t.id].min.toString()); setToPct(''); }}
                  className="flex w-full items-center px-4 py-2.5 text-sm transition hover:bg-white/5"
                  style={{ color: type === t.id ? PURPLE : '#9ca3af', background: type === t.id ? 'rgba(167,139,250,0.08)' : 'transparent' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-600">% Atual</p>
          <input type="number" value={fromPct} step={cfg.step} min={cfg.min} max={cfg.max}
            onChange={e => { setFromPct(e.target.value); setResult(null); setError(''); }}
            style={inputStyle} />
        </div>
        <div>
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-600">% Desejado</p>
          <input type="number" value={toPct} step={cfg.step} min={cfg.min} max={cfg.max}
            placeholder={cfg.max.toString()}
            onChange={e => { setToPct(e.target.value); setResult(null); setError(''); }}
            style={inputStyle} />
        </div>
      </div>

      {/* Range info */}
      <p className="text-[10px] text-zinc-700 leading-relaxed">
        Range: {cfg.min}% – {cfg.max}% · Passo {cfg.step}% · {type === 'bestiary' ? '5–100% (+6 por nível)' : '2.5–50% (+12 por nível)'}
      </p>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button onClick={calculate}
        className="h-10 w-full rounded-xl text-sm font-black text-black transition hover:brightness-110 active:scale-[0.98]"
        style={{ background: PURPLE }}>
        Calcular
      </button>

      {result !== null && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl p-4" style={{ border: `1px solid rgba(167,139,250,0.3)`, background: 'rgba(167,139,250,0.08)' }}>
            <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Pontos Necessários</p>
            <p className="text-3xl font-black" style={{ color: PURPLE }}>{fNum(result)}</p>
          </div>
          <div className="rounded-xl p-3 text-[10px] leading-relaxed text-zinc-500"
            style={{ border: `1px solid rgba(96,165,250,0.15)`, background: 'rgba(96,165,250,0.05)' }}>
            <span className="text-sky-400 font-bold">Fórmula: </span>{cfg.formula}
          </div>
        </div>
      )}

      {/* Info geral */}
      <div className="rounded-xl p-3" style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Total para o máximo</p>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500">
          <span>Dano / Saque / Leech:</span><span className="font-bold text-zinc-400">53.440 pts</span>
          <span>Bestiário Duplo:</span><span className="font-bold text-zinc-400">53.440 pts</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function BountyTasksPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Adept');
  const [preferred,  setPreferred]  = useState<(string|null)[]>([null,null,null,null,null]);
  const [unwanted,   setUnwanted]   = useState<(string|null)[]>([null,null,null,null,null]);

  const pool    = CREATURES[difficulty];
  const total   = POOL_SIZES[difficulty];
  const diffColor = DIFF_COLORS[difficulty];

  const selectedPrefs = preferred.filter(Boolean) as string[];

  // Combined probability (at least 1 preferred in 3 slots, all with 5x weight)
  const combinedProb = useMemo(() => {
    if (selectedPrefs.length === 0) return 0;
    const n = selectedPrefs.length;
    const weightTotal = total + 4 * n;          // each preferred adds 4 extra weight
    const pNone = Math.pow((total - n) / weightTotal, 3);
    return Math.max(0, (1 - pNone) * 100);
  }, [selectedPrefs, total]);

  function setPref(i: number, v: string|null) {
    setPreferred(prev => prev.map((x, idx) => idx === i ? v : x));
    if (!v) setUnwanted(prev => prev.map((x, idx) => idx === i ? null : x));
  }
  function setUnwant(i: number, v: string|null) {
    setUnwanted(prev => prev.map((x, idx) => idx === i ? v : x));
  }

  function changeDifficulty(d: Difficulty) {
    setDifficulty(d);
    setPreferred([null,null,null,null,null]);
    setUnwanted([null,null,null,null,null]);
  }

  return (
    <main className="relative min-h-screen text-white" style={{ background: BG }}>
      <div className="pointer-events-none fixed inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <button onClick={() => (window.location.href = '/ferramentas')}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-500 transition hover:text-white"
            style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)' }}>
            ← Ferramentas
          </button>
          <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'rgba(167,139,250,0.6)' }}>FB Services</p>
          <h1 className="mt-1 text-3xl font-black text-white">
            Calculadora de <span style={{ color: PURPLE }}>Bounty Tasks</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Calcule a chance de rolar sua criatura preferida e o custo do Talismã de Bounty.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">

          {/* ── LEFT ── */}
          <div className="flex flex-col gap-4">

            {/* Dificuldade + stats */}
            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Dificuldade</p>
              <div className="mb-5 flex gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => changeDifficulty(d)}
                    className="flex-1 rounded-xl py-2.5 text-xs font-black uppercase tracking-wide transition"
                    style={{
                      background: difficulty === d ? DIFF_COLORS[d] + '20' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${difficulty === d ? DIFF_COLORS[d] + '55' : BORDER}`,
                      color: difficulty === d ? DIFF_COLORS[d] : '#6b7280',
                    }}>
                    {d}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Criaturas</p>
                  <p className="text-xl font-black" style={{ color: diffColor }}>{total}</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Preferidas</p>
                  <p className="text-xl font-black text-white">{selectedPrefs.length}</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{
                  border: `1px solid ${combinedProb > 0 ? 'rgba(167,139,250,0.3)' : BORDER}`,
                  background: combinedProb > 0 ? 'rgba(167,139,250,0.08)' : '#0d0d14',
                }}>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Chance</p>
                  <p className="text-xl font-black" style={{ color: combinedProb > 0 ? PURPLE : 'rgba(255,255,255,0.2)' }}>
                    {combinedProb > 0 ? combinedProb.toFixed(1) + '%' : '—'}
                  </p>
                </div>
              </div>

              {/* Probability bar */}
              {combinedProb > 0 && (
                <div className="mt-4">
                  <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: '#0d0d14', border: `1px solid ${BORDER}` }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, combinedProb)}%`, background: `linear-gradient(90deg, #7c3aed, ${PURPLE})` }} />
                  </div>
                  <p className="mt-2 text-[10px] text-zinc-600">
                    Chance combinada de aparecer ao menos 1 preferido em 3 opções de task. Cada preferido tem <strong className="text-zinc-400">5×</strong> mais chance.
                  </p>
                </div>
              )}
            </div>

            {/* 5 slots */}
            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Preferred List (5 Slots)</p>
                {selectedPrefs.length > 0 && (
                  <button onClick={() => { setPreferred([null,null,null,null,null]); setUnwanted([null,null,null,null,null]); }}
                    className="flex items-center gap-1.5 text-xs transition hover:opacity-80" style={{ color: PURPLE }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
                    Limpar tudo
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {preferred.map((pref, i) => (
                  <SlotCard
                    key={i} index={i}
                    preferred={pref} unwanted={unwanted[i]}
                    pool={pool} total={total}
                    allPreferred={preferred} allUnwanted={unwanted}
                    onPrefChange={v => setPref(i, v)}
                    onUnwantChange={v => setUnwant(i, v)}
                    diffColor={diffColor}
                  />
                ))}
              </div>
            </div>

            {/* Recompensas por dificuldade */}
            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Recompensas por Dificuldade</p>
              <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${BORDER}` }}>
                <div className="grid grid-cols-3 px-4 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Dificuldade</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Abates</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Bounty Points</span>
                </div>
                {[
                  { d: 'Beginner', kills: '50–110',   pts: '3', color: DIFF_COLORS.Beginner },
                  { d: 'Adept',    kills: '80–190',   pts: '7', color: DIFF_COLORS.Adept },
                  { d: 'Expert',   kills: '150–310',  pts: '16', color: DIFF_COLORS.Expert },
                  { d: 'Master',   kills: '300–600',  pts: '27', color: DIFF_COLORS.Master },
                ].map((row, i) => (
                  <div key={row.d} className="grid grid-cols-3 px-4 py-2.5"
                    style={{ borderTop: `1px solid ${BORDER}`, background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <span className="text-[11px] font-bold" style={{ color: row.color }}>{row.d}</span>
                    <span className="text-[11px] text-zinc-400">{row.kills}</span>
                    <span className="text-[11px] text-zinc-400">{row.pts} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT — Talisman ── */}
          <TalismanCalculator />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">
          Calculadora de Bounty Tasks · RubinOT · Tibia Global
        </p>
      </div>
    </main>
  );
}
