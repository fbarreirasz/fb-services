'use client';

import { useState, useMemo } from 'react';

// ─── design tokens ────────────────────────────────────────────
const BG     = '#111118';
const CARD   = '#1a1a24';
const BORDER = 'rgba(255,255,255,0.07)';
const PURPLE = '#a78bfa';

// ─── Pool sizes (hakaimarket verified) ───────────────────────
const POOL_SIZES: Record<string, number> = {
  Beginner: 151, Adept: 436, Expert: 489, Master: 260,
};

// ─── Creatures by Bounty Task difficulty ─────────────────────
// Beginner = Harmless (1pt) + Trivial (5pt) bestiary
// Adept    = Easy (15pt) bestiary
// Expert   = Medium (25pt) bestiary
// Master   = Hard (50pt) + Challenging (100pt) bestiary
// Ghastly Dragon = Hard (50pt) → Master pool
const CREATURES: Record<string, string[]> = {
  Beginner: [
    'Agrestic Chicken','Badger','Black Sheep','Bog Frog','Bug',
    'Butterfly','Cat','Cave Parrot','Cave Rat','Chicken',
    'Deer','Dog','Dromedary','Fish','Flamingo','Fox','Frost Troll',
    'Goblin','Green Frog','Horse','Husky','Island Troll','Modified Gnarlhound',
    'Mushroom Sniffer','Northern Pike','Parrot','Penguin','Pig','Pigeon',
    'Poison Spider','Rabbit','Rat','Sandcrawler','Seagull','Sheep',
    'Silver Rabbit','Skunk','Snake','Spider','Squirrel','Troll',
    'Wasp','White Deer','Winter Wolf','Wisp','Wolf',
  ],
  Adept: [
    'Abyssal Calamary','Adventurer','Amazon','Ancient Scarab','Assassin',
    'Azure Frog','Bandit','Barbarian Brutetamer','Barbarian Headhunter',
    'Barbarian Skullhunter','Bat','Bear','Blood Crab','Boar',
    'Bonebeast','Bonelord','Calamary','Carrion Worm','Cave Rat',
    'Centipede','Chakoya Toolshaper','Chakoya Tribewarden','Chakoya Windcaller',
    'Clay Guardian','Cobra','Coral Frog','Crab','Crazed Beggar',
    'Crimson Frog','Crocodile','Crypt Defiler','Crypt Shambler',
    'Cyclops','Damaged Crystal Golem','Damaged Worker Golem','Dark Apprentice',
    'Dark Magician','Dark Monk','Deepsea Blood Crab','Deepling Worker',
    'Demon Skeleton','Doomsday Cultist','Dworc Fleshhunter',
    'Dworc Venomsniper','Dworc Voodoomaster','Dwarf','Dwarf Guard','Dwarf Soldier',
    'Elephant','Elf','Elf Arcanist','Elf Scout','Emerald Damselfly',
    'Enraged Crystal Golem','Firestarter','Fire Devil','Frost Giant','Frost Giantess',
    'Gang Member','Gargoyle','Gazer','Ghost','Ghost Wolf',
    'Ghoul','Gladiator','Gloom Wolf','Gnarlhound','Goblin Assassin',
    'Goblin Leader','Goblin Scavenger','Gozzler','Grave Robber',
    'Haunted Treeling','Honour Guard','Hunter','Hyaena','Insect Swarm',
    'Jellyfish','Killer Caiman','Kongra','Ladybug','Larva',
    'Leaf Golem','Lion','Lizard Sentinel','Lizard Templar','Mad Scientist',
    'Mammoth','Marsh Stalker','Merlkin','Mercury Blob','Minotaur',
    'Minotaur Archer','Minotaur Guard','Minotaur Mage','Mole','Monk',
    'Mummy','Nomad','Novice of the Cult','Omnivora','Orc','Orc Rider',
    'Orc Shaman','Orc Spearman','Orc Warrior','Orchid Frog',
    'Panda','Pirate Ghost','Pirate Marauder','Pirate Skeleton',
    'Poacher','Polar Bear','Raging Fire','Rorc','Rotworm',
    'Salamander','Sandstone Scorpion','Scarab','Sibang','Skeleton',
    'Skeleton Warrior','Slime','Slug','Smuggler','Spit Nettle',
    'Stalker','Starving Wolf','Stone Golem','Swamp Troll','Swampling',
    'Tainted Soul','Terramite','Terror Bird','Tiger','Thornback Tortoise',
    'Toad','Tortoise','Troll Champion','Troll Legionnaire',
    'Undead Mine Worker','Undead Prospector','Valkyrie','War Wolf',
    'Water Buffalo','White Shade','Wild Warrior','Witch','Zombie',
  ],
  Expert: [
    'Acid Blob','Acolyte of the Cult','Adept of the Cult','Arctic Faun',
    'Banshee','Barbarian Bloodwalker','Barkless Devotee','Barkless Fanatic',
    'Blood Beast','Blood Hand','Blood Priest','Bog Raider','Braindeath',
    'Brimstone Bugs','Broken Shaper','Chasm Spawn','Clomp',
    'Corym Charlatan','Corym Skirmisher','Corym Vanguard',
    'Crystal Spider','Cyclops Drone','Cyclops Smith',
    'Dark Faun','Death Blob','Death Priest',
    'Deepling Guard','Deepling Scout','Deepling Spellsinger','Deepling Warrior',
    'Demon Skeleton','Devourer','Diamond Servant Replica','Dragon',
    'Dragon Hatchling','Dragon Lord','Dragon Lord Hatchling',
    'Drillworm','Dwarf Geomancer','Dwarf Henchman',
    'Earth Elemental','Elder Bonelord','Elder Forest Fury',
    'Enraged Crystal Golem','Enlightened of the Cult','Eternal Guardian',
    'Exotic Bat','Exotic Cave Spider','Execowtioner','Faun',
    'Fire Elemental','Forest Fury','Frost Dragon','Frost Dragon Hatchling',
    'Furious Fire Elemental','Glooth Anemone','Glooth Bandit',
    'Glooth Blob','Glooth Brigand','Glooth Golem',
    'Golden Servant Replica','Goldhanded Cultist','Goldhanded Cultist Bride',
    'Gravedigger','Ice Golem','Ice Witch','Insectoid Worker',
    'Iron Servant Replica','Kollos','Lancer Beetle','Lich',
    'Lizard Chosen','Lizard Dragon Priest','Lizard High Guard',
    'Lizard Legionnaire','Lizard Magistratus','Lizard Snakecharmer','Lizard Zaogun',
    'Lumbering Carnisylvan','Manta Ray','Marid','Marsh Stalker',
    'Massive Earth Elemental','Massive Energy Elemental',
    'Massive Fire Elemental','Massive Water Elemental',
    'Metal Gargoyle','Minotaur Cult Follower','Minotaur Cult Prophet',
    'Minotaur Cult Zealot','Minotaur Hunter',
    'Mooh\'tah Warrior','Moohtant','Mutated Bat','Mutated Human','Mutated Tiger',
    'Necromancer','Nightmare','Nightstalker','Noble Lion','Nymph',
    'Ogre Brute','Ogre Rowdy','Ogre Savage','Ogre Shaman',
    'Orc Berserker','Orc Cult Fanatic','Orc Cult Inquisitor',
    'Orc Cult Minion','Orc Cult Priest','Orc Cultist',
    'Orc Leader','Orc Marauder','Orc Warlord',
    'Orclops Doomhauler','Orclops Ravager','Pirat Bombardier',
    'Pirat Cutthroat','Pirat Mate','Pirat Scoundrel',
    'Pirate Buccaneer','Pirate Corsair','Pirate Cutthroat',
    'Pixie','Pooka','Priestess','Putrid Mummy',
    'Quara Constrictor','Quara Hydromancer','Quara Mantassin',
    'Quara Pincher','Quara Predator',
    'Rot Elemental','Sea Serpent','Shadow Pupil','Shark',
    'Souleater','Spidris','Spitter','Stampor','Stone Rhino',
    'Swarmer','Swan Maiden','Twisted Pooka','Twisted Shaper',
    'Undead Gladiator','Vampire','Vampire Bride','Vampire Viscount',
    'Wailing Widow','Walker','Warlock','Waspoid','Water Elemental',
    'Wiggler','Wilting Leaf Golem','Worm Priestess',
    'Wyvern','Young Sea Serpent',
  ],
  Master: [
    // Hard (50pt) bestiary — includes regularly hunted + special spawn
    'Askarak Demon','Askarak Lord','Askarak Prince',
    'Brachiodemon','Carnisylvan',
    'Cliff Strider','Crazed Summer Rearguard','Crazed Summer Vanguard',
    'Crazed Winter Rearguard','Crazed Winter Vanguard',
    'Dark Monk','Death Blob','Deepling Brawler','Deepling Elite',
    'Deepling Master Librarian','Deepling Tyrant',
    'Diabolic Imp','Diremaw','Deepworm',
    'Draken Abomination','Draken Elite','Draken Spellweaver','Draken Warmaster',
    'Elder Wyrm','Enlightened of the Cult',
    'Eye of the Storm','Flameborn',
    'Frazzlemaw','Fury',
    'Ghastly Dragon',
    'Gloom Wolf','Glooth Golem',
    'Golden Curse','Grimeleech',
    'Haunted Dragon','Hellflayer','Hellspawn',
    'Hive Overseer','High Voltage Elemental',
    'Ice Dragon','Infected Weeper','Infernalist',
    'Insectoid Scout',
    'Lava Golem','Lava Lurker','Leviathan',
    'Lizard Noble',
    'Magma Crawler','Manta Ray','Many Faces',
    'Midnight Panther',
    'Minotaur Amazon',
    'Orewalker',
    'Seacrest Serpent','Shaburak Demon','Shaburak Lord','Shaburak Prince',
    'Spidris Elite','Spiky Carnivor','Menancing Carnivor',
    'Stone Devourer','Surik the Manipulator',
    'Undead Dragon',
    'Vexclaw','Vulcongra',
    'Weakened Frazzlemaw','Weeper',
    'Yeti',
  ],
};

const DIFFICULTIES = ['Beginner','Adept','Expert','Master'] as const;
type Difficulty = typeof DIFFICULTIES[number];

const DIFF_COLORS: Record<Difficulty, string> = {
  Beginner: '#22c55e', Adept: '#3b82f6', Expert: '#f59e0b', Master: '#ef4444',
};

// ─── Probability ──────────────────────────────────────────────
// P(preferred appears in at least 1 of 3 task slots)
// Each preferred = weight W. Others = weight 1.
// P = 1 - ((T - 1) / (T - 1 + W))^3  per single preferred slot
function calcProb(total: number, weight: number): number {
  if (total <= 0 || weight <= 0) return 0;
  const p = 1 - Math.pow((total - 1) / (total - 1 + weight), 3);
  return Math.max(0, Math.min(100, p * 100));
}

// ─── Talisman formulas ────────────────────────────────────────
// Damage/Leech/Loot: base 2.5%, max 50%, step +0.5%, cost = 5 + 12*(n-1) per level
// Bestiary: base 5%, max 100%, step +1%, cost = 5 + 12*(n-1) per level
type TalismanType = 'damage' | 'leech' | 'loot' | 'bestiary';

const TALISMAN_CFG: Record<TalismanType, { min: number; max: number; step: number; label: string }> = {
  damage:   { min: 2.5, max: 50,  step: 0.5, label: 'Dano vs Criaturas' },
  leech:    { min: 2.5, max: 50,  step: 0.5, label: 'Roubo de Vida' },
  loot:     { min: 2.5, max: 50,  step: 0.5, label: 'Mais Loot' },
  bestiary: { min: 5,   max: 100, step: 1,   label: 'Bestiário Duplo' },
};

function calcTalismanCost(type: TalismanType, from: number, to: number): number {
  if (to <= from) return 0;
  const cfg = TALISMAN_CFG[type];
  const startLv = type === 'bestiary'
    ? Math.round(from - cfg.min)
    : Math.round((from - cfg.min) / cfg.step);
  const endLv = type === 'bestiary'
    ? Math.round(to - cfg.min)
    : Math.round((to - cfg.min) / cfg.step);
  let cost = 0;
  for (let lv = startLv; lv < endLv; lv++) cost += 5 + 12 * lv;
  return cost;
}

function fNum(n: number) { return Math.round(n).toLocaleString('pt-BR'); }

// ─── CreatureSelect ───────────────────────────────────────────
function CreatureSelect({ value, pool, blocked, placeholder, accent, onChange }: {
  value: string|null; pool: string[]; blocked: string[];
  placeholder: string; accent: string;
  onChange: (v: string|null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q,    setQ]    = useState('');
  const filtered = q.trim() ? pool.filter(m => m.toLowerCase().includes(q.toLowerCase())) : pool;

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex h-9 w-full items-center justify-between rounded-lg px-3 text-xs transition"
        style={{ border: `1px solid ${value ? accent : BORDER}`, background: 'rgba(255,255,255,0.03)', color: value ? '#fff' : '#4b5563' }}>
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
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setQ(''); }} />
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl shadow-2xl overflow-hidden"
            style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
            <div className="p-2">
              <input autoFocus value={q} onChange={e => setQ(e.target.value)}
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
                    onClick={() => { onChange(m); setOpen(false); setQ(''); }}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11px] transition"
                    style={{ color: isActive ? PURPLE : isBlocked ? '#374151' : '#9ca3af',
                      background: isActive ? 'rgba(167,139,250,0.1)' : 'transparent',
                      cursor: isBlocked && !isActive ? 'not-allowed' : 'pointer' }}>
                    <span>{m}</span>
                    {isActive && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                );
              })}
              {filtered.length === 0 && <p className="py-2 text-center text-[11px] text-zinc-700">Nenhuma criatura encontrada</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── SlotCard ─────────────────────────────────────────────────
function SlotCard({ index, preferred, unwanted, pool, total, allPref, allUnwant, onPref, onUnwant, diffColor }: {
  index: number; preferred: string|null; unwanted: string|null;
  pool: string[]; total: number; allPref: (string|null)[]; allUnwant: (string|null)[];
  onPref: (v: string|null) => void; onUnwant: (v: string|null) => void; diffColor: string;
}) {
  const blockedPref   = allPref.filter(  (v, i) => i !== index && v) as string[];
  const blockedUnwant = allUnwant.filter((v, i) => i !== index && v) as string[];

  return (
    <div className="flex flex-col gap-3 rounded-xl p-4"
      style={{ border: `1px solid ${preferred ? diffColor + '40' : BORDER}`, background: '#0d0d14' }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Slot {index + 1}
        </span>
        {(preferred || unwanted) && (
          <button onClick={() => { onPref(null); onUnwant(null); }}
            className="text-[10px] text-zinc-600 transition hover:text-zinc-400">✕</button>
        )}
      </div>

      {/* Preferred */}
      <div>
        <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest" style={{ color: diffColor }}>
          Preferido (5× prob.)
        </p>
        <CreatureSelect value={preferred} pool={pool} blocked={blockedPref}
          placeholder="Selecione" accent={diffColor} onChange={onPref} />
      </div>

      {/* Unwanted */}
      <div>
        <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-700">
          Indesejado (0 prob.)
        </p>
        <CreatureSelect value={unwanted} pool={pool} blocked={blockedUnwant}
          placeholder="Indesejado" accent="rgba(255,255,255,0.1)" onChange={onUnwant} />
      </div>

      {/* Individual probability */}
      {preferred && (
        <div className="rounded-lg p-3" style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}>
          <p className="mb-2 text-[9px] font-semibold truncate" style={{ color: diffColor }}>{preferred}</p>
          {([1, 5, 10] as const).map(w => {
            const p = calcProb(total, w);
            return (
              <div key={w} className="mb-1.5 flex items-center gap-2">
                <span className="w-6 text-[10px] font-black text-zinc-600">{w}×</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${p}%`,
                    background: w === 10 ? '#c084fc' : w === 5 ? PURPLE : 'rgba(255,255,255,0.2)',
                    transition: 'width 0.3s',
                  }} />
                </div>
                <span className="w-10 text-right text-[10px] font-black"
                  style={{ color: w === 10 ? '#c084fc' : w === 5 ? PURPLE : '#6b7280' }}>
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

// ─── TalismanCalculator ───────────────────────────────────────
function TalismanCalculator() {
  const [type,   setType]   = useState<TalismanType>('damage');
  const [fromS,  setFromS]  = useState('2.5');
  const [toS,    setToS]    = useState('');
  const [result, setResult] = useState<number|null>(null);
  const [error,  setError]  = useState('');
  const [ddOpen, setDdOpen] = useState(false);

  const cfg = TALISMAN_CFG[type];

  // Auto-cap % desejado to max
  function handleToChange(val: string) {
    const n = parseFloat(val);
    if (!isNaN(n) && n > cfg.max) {
      setToS(cfg.max.toString());
    } else {
      setToS(val);
    }
    setResult(null); setError('');
  }

  function calculate() {
    setError(''); setResult(null);
    const from = parseFloat(fromS);
    const to   = parseFloat(toS);
    if (isNaN(from) || isNaN(to)) { setError('Preencha os dois campos.'); return; }
    if (from < cfg.min) { setError(`Mínimo é ${cfg.min}%.`); return; }
    if (to > cfg.max)   { setError(`Máximo é ${cfg.max}%.`); return; }
    if (to <= from)     { setError('% desejada deve ser maior que a atual.'); return; }
    setResult(calcTalismanCost(type, from, to));
  }

  const inputBase = {
    border: `1px solid ${BORDER}`, background: '#0d0d14', borderRadius: 10,
    padding: '8px 12px', color: '#fff', fontSize: 15, fontWeight: 800,
    fontFamily: 'inherit', outline: 'none', width: '100%',
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl p-5"
      style={{ border: `1px solid ${BORDER}`, background: CARD }}>
      <div className="flex items-center gap-2">
        <span style={{ color: PURPLE }}>⚡</span>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Calculadora de Custo 
        </p>
      </div>

      {/* Tipo dropdown */}
      <div className="relative">
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Tipo de Buff</p>
        <button onClick={() => setDdOpen(o => !o)}
          className="flex h-10 w-full items-center justify-between rounded-xl px-3 text-sm font-semibold text-white"
          style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
          <span>{cfg.label}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"
            style={{ transform: ddOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {ddOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDdOpen(false)} />
            <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-xl shadow-2xl"
              style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
              {(Object.keys(TALISMAN_CFG) as TalismanType[]).map(t => (
                <button key={t}
                  onClick={() => {
                    setType(t); setDdOpen(false); setResult(null); setError('');
                    setFromS(TALISMAN_CFG[t].min.toString()); setToS('');
                  }}
                  className="flex w-full px-4 py-2.5 text-sm transition hover:bg-white/5"
                  style={{ color: type === t ? PURPLE : '#9ca3af',
                    background: type === t ? 'rgba(167,139,250,0.08)' : 'transparent' }}>
                  {TALISMAN_CFG[t].label}
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
          <input type="number" value={fromS} step={cfg.step} min={cfg.min} max={cfg.max}
            onChange={e => { setFromS(e.target.value); setResult(null); setError(''); }}
            style={inputBase} />
        </div>
        <div>
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
            % Desejado <span style={{ color: PURPLE }}>(máx {cfg.max}%)</span>
          </p>
          <input type="number" value={toS} step={cfg.step} min={cfg.min} max={cfg.max}
            placeholder={cfg.max.toString()}
            onChange={e => handleToChange(e.target.value)}
            style={inputBase} />
        </div>
      </div>

      {/* Range info */}
      <p className="text-[10px] leading-relaxed text-zinc-700">
        Range: {cfg.min}% – {cfg.max}% · Passo {cfg.step}% · Progressão: +12 pts por nível
      </p>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button onClick={calculate}
        className="h-10 w-full rounded-xl text-sm font-black text-black transition hover:brightness-110 active:scale-[0.98]"
        style={{ background: PURPLE }}>
        Calcular
      </button>

      {result !== null && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl p-4"
            style={{ border: `1px solid rgba(167,139,250,0.3)`, background: 'rgba(167,139,250,0.08)' }}>
            <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Pontos Necessários</p>
            <p className="text-3xl font-black" style={{ color: PURPLE }}>{fNum(result)}</p>
          </div>
          <div className="rounded-xl p-3 text-[10px] leading-relaxed text-zinc-500"
            style={{ border: '1px solid rgba(96,165,250,0.15)', background: 'rgba(96,165,250,0.05)' }}>
            <span className="font-bold text-sky-400">Fórmula: </span>
            {type === 'bestiary'
              ? 'Cost(%) = 6 × (% − 5)² − (% − 5)  (+1% por nível)'
              : 'Cost(%) = 6 × [2(% − 2.5)]² − [2(% − 2.5)]  (+0.5% por nível)'}
          </div>
        </div>
      )}

      {/* Totais */}
      <div className="rounded-xl p-3" style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Máximo total (2.5→50 ou 5→100)</p>
        <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-500">
          <span>Dano / Loot / Leech:</span><span className="font-bold text-zinc-400">53.440 pts</span>
          <span>Bestiário Duplo:</span><span className="font-bold text-zinc-400">53.440 pts</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function BountyTasksPage() {
  const [diff,      setDiff]      = useState<Difficulty>('Adept');
  const [preferred, setPreferred] = useState<(string|null)[]>([null,null,null,null,null]);
  const [unwanted,  setUnwanted]  = useState<(string|null)[]>([null,null,null,null,null]);

  const pool      = CREATURES[diff];
  const total     = POOL_SIZES[diff];
  const diffColor = DIFF_COLORS[diff];
  const selPrefs  = preferred.filter(Boolean) as string[];

  const combinedProb = useMemo(() => {
    if (!selPrefs.length) return 0;
    const n = selPrefs.length;
    const wTotal = total + 4 * n;
    const pNone  = Math.pow((total - n) / wTotal, 3);
    return Math.max(0, (1 - pNone) * 100);
  }, [selPrefs, total]);

  function changeDiff(d: Difficulty) {
    setDiff(d);
    setPreferred([null,null,null,null,null]);
    setUnwanted([null,null,null,null,null]);
  }
  function setPref(i: number, v: string|null) {
    setPreferred(p => p.map((x, idx) => idx === i ? v : x));
    if (!v) setUnwanted(u => u.map((x, idx) => idx === i ? null : x));
  }
  function setUnwant(i: number, v: string|null) {
    setUnwanted(u => u.map((x, idx) => idx === i ? v : x));
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
            Calcule a chance de rolar sua criatura preferida e o custo do Talismã.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">

          {/* ── LEFT ── */}
          <div className="flex flex-col gap-4">

            {/* Dificuldade + stats */}
            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Dificuldade</p>

              <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => changeDiff(d)}
                    className="rounded-xl py-2.5 text-xs font-black uppercase tracking-wide transition"
                    style={{
                      background: diff === d ? DIFF_COLORS[d] + '20' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${diff === d ? DIFF_COLORS[d] + '55' : BORDER}`,
                      color: diff === d ? DIFF_COLORS[d] : '#6b7280',
                    }}>
                    {d}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Criaturas</p>
                  <p className="text-xl font-black" style={{ color: diffColor }}>{total}</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Preferidas</p>
                  <p className="text-xl font-black text-white">{selPrefs.length}</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{
                  border: `1px solid ${combinedProb > 0 ? 'rgba(167,139,250,0.3)' : BORDER}`,
                  background: combinedProb > 0 ? 'rgba(167,139,250,0.08)' : '#0d0d14',
                }}>
                  <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">Chance</p>
                  <p className="text-xl font-black" style={{ color: combinedProb > 0 ? PURPLE : 'rgba(255,255,255,0.2)' }}>
                    {combinedProb > 0 ? combinedProb.toFixed(1) + '%' : '—'}
                  </p>
                </div>
              </div>

              {combinedProb > 0 && (
                <div className="mt-4">
                  <div className="relative h-2 w-full overflow-hidden rounded-full"
                    style={{ background: '#0d0d14', border: `1px solid ${BORDER}` }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, combinedProb)}%`, background: `linear-gradient(90deg, #7c3aed, ${PURPLE})` }} />
                  </div>
                  <p className="mt-2 text-[10px] text-zinc-600">
                    Chance combinada — ao menos 1 preferido em 3 opções. Cada criatura preferida tem <strong className="text-zinc-400">5×</strong> mais chance.
                  </p>
                </div>
              )}
            </div>

            

            {/* 5 slots */}
            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Preferred List</p>
                {selPrefs.length > 0 && (
                  <button onClick={() => { setPreferred([null,null,null,null,null]); setUnwanted([null,null,null,null,null]); }}
                    className="flex items-center gap-1.5 text-xs transition hover:opacity-80" style={{ color: PURPLE }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
                    Limpar
                  </button>
                )}
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {preferred.map((pref, i) => (
                  <SlotCard key={i} index={i}
                    preferred={pref} unwanted={unwanted[i]}
                    pool={pool} total={total}
                    allPref={preferred} allUnwant={unwanted}
                    onPref={v => setPref(i, v)}
                    onUnwant={v => setUnwant(i, v)}
                    diffColor={diffColor} />
                ))}
              </div>
            </div>

            {/* Recompensas */}
            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Recompensas por Dificuldade</p>
              <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${BORDER}` }}>
                <div className="grid grid-cols-3 px-4 py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Dificuldade','Abates','Bounty Pts'].map(h => (
                    <span key={h} className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">{h}</span>
                  ))}
                </div>
                {[
                  { d: 'Beginner', kills: '50–110',  pts: '3' },
                  { d: 'Adept',    kills: '80–190',  pts: '7' },
                  { d: 'Expert',   kills: '150–310', pts: '16' },
                  { d: 'Master',   kills: '300–600', pts: '27' },
                ].map((row, i) => (
                  <div key={row.d} className="grid grid-cols-3 px-4 py-2.5"
                    style={{ borderTop: `1px solid ${BORDER}`, background: i % 2 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <span className="text-[11px] font-bold" style={{ color: DIFF_COLORS[row.d as Difficulty] }}>{row.d}</span>
                    <span className="text-[11px] text-zinc-400">{row.kills}</span>
                    <span className="text-[11px] text-zinc-400">{row.pts}</span>
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
