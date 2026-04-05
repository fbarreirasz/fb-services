'use client';

import { useState } from 'react';

// ─── DATA ──────────────────────────────────────────────────────────────────
type Material = { name: string; qty: number };
type Tier = { label: 'Basic' | 'Intricate' | 'Powerful'; color: string; effect: string; materials: Material[] };
type Imbuement = { id: string; name: string; desc: string; category: string; icon: string; tiers: Tier[] };

const IMBUEMENTS: Imbuement[] = [
  {
    id: 'vampirism', name: 'Vampirism', desc: 'Life leech', category: 'Leech',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fvampirism-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+5% life leech',  materials: [{ name: 'Vampire Teeth', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+10% life leech', materials: [{ name: 'Vampire Teeth', qty: 25 }, { name: 'Bloody Pincers', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+25% life leech', materials: [{ name: 'Vampire Teeth', qty: 25 }, { name: 'Bloody Pincers', qty: 15 }, { name: 'Piece of Dead Brain', qty: 5 }] },
    ],
  },
  {
    id: 'void', name: 'Void', desc: 'Mana leech', category: 'Leech',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fvoid-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+3% mana leech',  materials: [{ name: 'Rope Belt', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+5% mana leech',  materials: [{ name: 'Rope Belt', qty: 25 }, { name: 'Waspoid Wing', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+8% mana leech',  materials: [{ name: 'Rope Belt', qty: 25 }, { name: 'Waspoid Wing', qty: 15 }, { name: 'Vexclaw Talon', qty: 5 }] },
    ],
  },
  {
    id: 'strike', name: 'Strike', desc: 'Critical damage', category: 'Offensive',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fstrike-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+10% crit (25%)',  materials: [{ name: 'Orc Tooth', qty: 20 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+20% crit (25%)',  materials: [{ name: 'Orc Tooth', qty: 20 }, { name: 'Troll Green', qty: 25 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+50% crit (25%)',  materials: [{ name: 'Orc Tooth', qty: 20 }, { name: 'Troll Green', qty: 25 }, { name: 'Ogre Ear Stud', qty: 5 }] },
    ],
  },
  {
    id: 'swiftness', name: 'Swiftness', desc: 'Speed boost', category: 'Utility',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fswiftness-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+10 speed',  materials: [{ name: 'Centipede Leg', qty: 20 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+20 speed',  materials: [{ name: 'Centipede Leg', qty: 20 }, { name: 'Deepling Fin', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+30 speed',  materials: [{ name: 'Centipede Leg', qty: 20 }, { name: 'Deepling Fin', qty: 15 }, { name: 'Lizard Essence', qty: 5 }] },
    ],
  },
  {
    id: 'featherweight', name: 'Featherweight', desc: 'Capacity increase', category: 'Utility',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Ffeatherweight-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+150 oz',   materials: [{ name: 'Thin Silk', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+300 oz',   materials: [{ name: 'Thin Silk', qty: 25 }, { name: 'Louse', qty: 25 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+600 oz',   materials: [{ name: 'Thin Silk', qty: 25 }, { name: 'Louse', qty: 25 }, { name: 'Rusted Iron', qty: 5 }] },
    ],
  },
  {
    id: 'vibrancy', name: 'Vibrancy', desc: 'Paralysis removal', category: 'Utility',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fvibrancy-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '40% removal',  materials: [{ name: 'Fish Fin', qty: 20 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '70% removal',  materials: [{ name: 'Fish Fin', qty: 20 }, { name: 'Turtle Shell', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '100% removal', materials: [{ name: 'Fish Fin', qty: 20 }, { name: 'Turtle Shell', qty: 15 }, { name: 'Flask of Embalming Fluid', qty: 5 }] },
    ],
  },
  {
    id: 'lich_shroud', name: 'Lich Shroud', desc: 'Death Protection', category: 'Protection',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Flich-shroud-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+3% death prot',  materials: [{ name: 'Piece of Dead Brain', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+5% death prot',  materials: [{ name: 'Piece of Dead Brain', qty: 25 }, { name: 'Vampire Teeth', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+8% death prot',  materials: [{ name: 'Piece of Dead Brain', qty: 25 }, { name: 'Vampire Teeth', qty: 15 }, { name: 'Cursed Bone', qty: 5 }] },
    ],
  },
  {
    id: 'snake_skin', name: 'Snake Skin', desc: 'Earth Protection', category: 'Protection',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fsnake-skin-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+3% earth prot',  materials: [{ name: 'Snake Skin', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+5% earth prot',  materials: [{ name: 'Snake Skin', qty: 25 }, { name: 'Piece of Scarab Shell', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+8% earth prot',  materials: [{ name: 'Snake Skin', qty: 25 }, { name: 'Piece of Scarab Shell', qty: 15 }, { name: 'Wyvern Talisman', qty: 5 }] },
    ],
  },
  {
    id: 'dragon_hide', name: 'Dragon Hide', desc: 'Fire Protection', category: 'Protection',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fdragon-hide-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+3% fire prot',  materials: [{ name: 'Dragon Scale', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+5% fire prot',  materials: [{ name: 'Dragon Scale', qty: 25 }, { name: 'Green Dragon Leather', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+8% fire prot',  materials: [{ name: 'Dragon Scale', qty: 25 }, { name: 'Green Dragon Leather', qty: 15 }, { name: 'Blazing Bone', qty: 5 }] },
    ],
  },
  {
    id: 'quara_scale', name: 'Quara Scale', desc: 'Ice Protection', category: 'Protection',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fquara-scale-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+3% ice prot',  materials: [{ name: 'Quara Scale', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+5% ice prot',  materials: [{ name: 'Quara Scale', qty: 25 }, { name: 'Deepling Scale', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+8% ice prot',  materials: [{ name: 'Quara Scale', qty: 25 }, { name: 'Deepling Scale', qty: 15 }, { name: 'Piece of Draconian Steel', qty: 5 }] },
    ],
  },
  {
    id: 'cloud_fabric', name: 'Cloud Fabric', desc: 'Energy Protection', category: 'Protection',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fcloud-fabric-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+3% energy prot',  materials: [{ name: 'Rorc Feather', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+5% energy prot',  materials: [{ name: 'Rorc Feather', qty: 25 }, { name: 'Badger Fur', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+8% energy prot',  materials: [{ name: 'Rorc Feather', qty: 25 }, { name: 'Badger Fur', qty: 15 }, { name: 'Crystal Bone', qty: 5 }] },
    ],
  },
  {
    id: 'demon_presence', name: 'Demon Presence', desc: 'Holy Protection', category: 'Protection',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fdemon-presence-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+3% holy prot',  materials: [{ name: 'Demon Dust', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+5% holy prot',  materials: [{ name: 'Demon Dust', qty: 25 }, { name: 'Silver Brooch', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+8% holy prot',  materials: [{ name: 'Demon Dust', qty: 25 }, { name: 'Silver Brooch', qty: 15 }, { name: 'Piece of Hellfire Armor', qty: 5 }] },
    ],
  },
  {
    id: 'precision', name: 'Precision', desc: 'Distance Fighting', category: 'Skill',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fprecision-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+1 distance',  materials: [{ name: 'Elven Hoof', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+2 distance',  materials: [{ name: 'Elven Hoof', qty: 25 }, { name: 'Cyclops Toe', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+4 distance',  materials: [{ name: 'Elven Hoof', qty: 25 }, { name: 'Cyclops Toe', qty: 15 }, { name: 'Silencer Claws', qty: 5 }] },
    ],
  },
  {
    id: 'epiphany', name: 'Epiphany', desc: 'Magic Level', category: 'Skill',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fepiphany-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+1 magic level',  materials: [{ name: 'Pixie Dust', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+2 magic level',  materials: [{ name: 'Pixie Dust', qty: 25 }, { name: 'Fairy Wings', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+4 magic level',  materials: [{ name: 'Pixie Dust', qty: 25 }, { name: 'Fairy Wings', qty: 15 }, { name: 'Unicorn Horn Powder', qty: 5 }] },
    ],
  },
  {
    id: 'scorch', name: 'Scorch', desc: 'Fire Damage', category: 'Elemental',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fscorch-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: 'Fire +1',  materials: [{ name: 'Faun Legs', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: 'Fire +2',  materials: [{ name: 'Faun Legs', qty: 25 }, { name: 'Blazing Bone', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: 'Fire +3',  materials: [{ name: 'Faun Legs', qty: 25 }, { name: 'Blazing Bone', qty: 15 }, { name: 'Fiery Heart', qty: 5 }] },
    ],
  },
  {
    id: 'venom', name: 'Venom', desc: 'Earth Damage', category: 'Elemental',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fvenom-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: 'Earth +1',  materials: [{ name: 'Brimstone Fangs', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: 'Earth +2',  materials: [{ name: 'Brimstone Fangs', qty: 25 }, { name: 'Wyvern Talisman', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: 'Earth +3',  materials: [{ name: 'Brimstone Fangs', qty: 25 }, { name: 'Wyvern Talisman', qty: 15 }, { name: 'Werewolf Fur', qty: 5 }] },
    ],
  },
  {
    id: 'frost', name: 'Frost', desc: 'Ice Damage', category: 'Elemental',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Ffrost-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: 'Ice +1',  materials: [{ name: 'Deepling Warts', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: 'Ice +2',  materials: [{ name: 'Deepling Warts', qty: 25 }, { name: 'Piece of Draconian Steel', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: 'Ice +3',  materials: [{ name: 'Deepling Warts', qty: 25 }, { name: 'Piece of Draconian Steel', qty: 15 }, { name: 'Frosty Heart', qty: 5 }] },
    ],
  },
  {
    id: 'electrify', name: 'Electrify', desc: 'Energy Damage', category: 'Elemental',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Felectrify-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: 'Energy +1',  materials: [{ name: 'Sparkion Stings', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: 'Energy +2',  materials: [{ name: 'Sparkion Stings', qty: 25 }, { name: 'Rorc Feather', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: 'Energy +3',  materials: [{ name: 'Sparkion Stings', qty: 25 }, { name: 'Rorc Feather', qty: 15 }, { name: 'Crystal Bone', qty: 5 }] },
    ],
  },
  {
    id: 'reap', name: 'Reap', desc: 'Death Damage', category: 'Elemental',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Freap-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: 'Death +1',  materials: [{ name: 'Cursed Bone', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: 'Death +2',  materials: [{ name: 'Cursed Bone', qty: 25 }, { name: 'Piece of Dead Brain', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: 'Death +3',  materials: [{ name: 'Cursed Bone', qty: 25 }, { name: 'Piece of Dead Brain', qty: 15 }, { name: 'Sacred Wood Chip', qty: 5 }] },
    ],
  },
  {
    id: 'chop', name: 'Chop', desc: 'Axe Fighting', category: 'Skill',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fchop-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+1 axe',  materials: [{ name: 'War Crystal', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+2 axe',  materials: [{ name: 'War Crystal', qty: 25 }, { name: 'Minotaur Leather', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+4 axe',  materials: [{ name: 'War Crystal', qty: 25 }, { name: 'Minotaur Leather', qty: 15 }, { name: 'Minotaur Trophy', qty: 5 }] },
    ],
  },
  {
    id: 'slash', name: 'Slash', desc: 'Sword Fighting', category: 'Skill',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fslash-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+1 sword',  materials: [{ name: "Lion's Mane", qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+2 sword',  materials: [{ name: "Lion's Mane", qty: 25 }, { name: 'Orc Tusk', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+4 sword',  materials: [{ name: "Lion's Mane", qty: 25 }, { name: 'Orc Tusk', qty: 15 }, { name: 'Broken Gladiator Shield', qty: 5 }] },
    ],
  },
  {
    id: 'bash', name: 'Bash', desc: 'Club Fighting', category: 'Skill',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fbash-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+1 club',  materials: [{ name: 'Winter Wolf Fur', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+2 club',  materials: [{ name: 'Winter Wolf Fur', qty: 25 }, { name: 'Cyclops Toe', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+4 club',  materials: [{ name: 'Winter Wolf Fur', qty: 25 }, { name: 'Cyclops Toe', qty: 15 }, { name: 'Giant Sword', qty: 5 }] },
    ],
  },
  {
    id: 'blockade', name: 'Blockade', desc: 'Shielding', category: 'Skill',
    icon: 'https://intibia.com/_next/image?url=%2Fimbuements%2Fblockade-3.png&w=64&q=75',
    tiers: [
      { label: 'Basic',    color: '#22c55e', effect: '+1 shield',  materials: [{ name: 'Hardened Bone', qty: 25 }] },
      { label: 'Intricate',color: '#3b82f6', effect: '+2 shield',  materials: [{ name: 'Hardened Bone', qty: 25 }, { name: 'Wyrm Scale', qty: 15 }] },
      { label: 'Powerful', color: '#ef4444', effect: '+4 shield',  materials: [{ name: 'Hardened Bone', qty: 25 }, { name: 'Wyrm Scale', qty: 15 }, { name: 'Piece of Royal Steel', qty: 5 }] },
    ],
  },
];

const ALL_MATERIALS = Array.from(new Set(IMBUEMENTS.flatMap(i => i.tiers.flatMap(t => t.materials.map(m => m.name)))));

const BG = '#111118';
const CARD = '#1a1a24';
const BORDER = 'rgba(255,255,255,0.07)';

function fNum(n: number) { return Math.round(n).toLocaleString('pt-BR'); }

function ImbIcon({ src, size = 48 }: { src: string; size?: number }) {
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', imageRendering: 'auto' }}
    />
  );
}

export default function ImbuimentosPage() {
  const [selected, setSelected] = useState<Imbuement | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});

  function getPrice(mat: string) { return prices[mat] ?? 0; }
  function setPrice(mat: string, val: number) { setPrices(p => ({ ...p, [mat]: val })); }

  function tierCost(tier: Tier) {
    return tier.materials.reduce((s, m) => s + getPrice(m.name) * m.qty, 0);
  }

  const modalMaterials = selected
    ? Array.from(new Set(selected.tiers.flatMap(t => t.materials.map(m => m.name))))
    : [];

  return (
    <main className="relative min-h-screen text-white" style={{ background: BG }}>
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <button onClick={() => window.location.href = '/ferramentas'}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-500 transition hover:text-white"
            style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)' }}>
            ← Ferramentas
          </button>
          <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'rgba(167,139,250,0.6)' }}>On RubinOT</p>
          <h1 className="mt-1 text-3xl font-black text-white">Preços de <span style={{ color: '#a78bfa' }}>Imbuements</span></h1>
          <p className="mt-2 text-sm text-zinc-500">Descubra a maneira mais barata de fazer seus imbuements</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {IMBUEMENTS.map(imb => {
            const minCost = Math.min(...imb.tiers.map(t => tierCost(t)));
            const hasPrices = imb.tiers[0].materials.some(m => getPrice(m.name) > 0);
            return (
              <button key={imb.id} onClick={() => setSelected(imb)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:border-white/20"
                style={{ border: `1px solid ${BORDER}`, background: CARD }}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
                  <ImbIcon src={imb.icon} size={40} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white text-sm truncate">{imb.name}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{imb.desc}</p>
                </div>
                <div className="shrink-0">
                  {hasPrices ? (
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                      {fNum(minCost)}
                    </span>
                  ) : (
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{ background: 'rgba(167,139,250,0.08)', color: '#7c3aed' }}>
                      •?
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && setSelected(null)}>
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
              style={{ background: '#1a1a24', border: `1px solid ${BORDER}` }}>
              {/* Modal header */}
              <div className="flex items-center justify-between border-b p-5" style={{ borderColor: BORDER }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}` }}>
                    <ImbIcon src={selected.icon} size={44} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">{selected.name}</h2>
                    <p className="text-xs text-zinc-500">{selected.desc}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white text-xl transition">✕</button>
              </div>

              {/* Tiers */}
              <div className="grid grid-cols-3 gap-3 p-5">
                {selected.tiers.map(tier => (
                  <div key={tier.label} className="rounded-xl p-4" style={{ border: `1px solid ${BORDER}`, background: '#111118' }}>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
                        <ImbIcon src={selected.icon} size={28} />
                      </div>
                      <span className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase"
                        style={{ background: tier.color + '22', color: tier.color }}>
                        {tier.label}
                      </span>
                    </div>
                    <p className="mb-3 text-xs font-semibold" style={{ color: tier.color }}>{tier.effect}</p>
                    <div className="mb-3 flex flex-col gap-1.5">
                      {tier.materials.map(m => (
                        <div key={m.name} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">{m.qty}x {m.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center" style={{ borderColor: BORDER }}>
                      <span className="text-[10px] text-zinc-600 uppercase tracking-wide">Total</span>
                      <span className="text-sm font-black" style={{ color: '#a78bfa' }}>
                        {tierCost(tier) > 0 ? fNum(tierCost(tier)) : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price inputs */}
              <div className="border-t p-5" style={{ borderColor: BORDER }}>
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Preços dos Recursos</p>
                <div className="grid grid-cols-2 gap-2">
                  {modalMaterials.map(mat => (
                    <div key={mat} className="flex items-center gap-2 rounded-xl px-3 py-2"
                      style={{ border: `1px solid ${BORDER}`, background: '#111118' }}>
                      <span className="text-[10px] text-zinc-500 flex-1 truncate">{mat}</span>
                      <input
                        type="number"
                        value={getPrice(mat) || ''}
                        onChange={e => setPrice(mat, Number(e.target.value))}
                        placeholder="0"
                        className="w-20 bg-transparent text-right text-xs font-bold text-white outline-none"
                        style={{ color: getPrice(mat) > 0 ? '#a78bfa' : '#6b7280' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-zinc-700">Imbuimentos · RubinOT · Tibia Global</p>
      </div>
    </main>
  );
}
