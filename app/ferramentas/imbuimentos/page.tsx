'use client';

import { useState } from 'react';

// ─── design tokens — idênticos ao skills / stamina / loot-split ─
const BG     = '#111118';
const CARD   = '#1a1a24';
const BORDER = 'rgba(255,255,255,0.07)';
const PURPLE = '#a78bfa';

// ─── icons ───────────────────────────────────────────────────────
const GOLD_TOKEN_ICON   = 'https://intibia.com/_next/image?url=%2Ftibia%2Fgold-token.png&w=16&q=75';
const MARKET_ICON       = 'https://intibia.com/_next/image?url=%2Ftibia%2Fcambio-house.png&w=32&q=75';
const CRYSTAL_COIN_ICON = 'https://intibia.com/_next/image?url=%2Ftibia%2Fcrystal-coin.png&w=16&q=75';

const IMB_ICON_OVERRIDES: Record<string, Record<1|2|3, string>> = {
  punch: {
    1: 'https://www.tibiawiki.com.br/images/6/62/Imbuement_Skillboost_Fist1.png',
    2: 'https://www.tibiawiki.com.br/images/d/de/Imbuement_Skillboost_Fist2.png',
    3: 'https://www.tibiawiki.com.br/images/7/74/Imbuement_Skillboost_Fist3.png',
  },
};

function imbIcon(id: string, tier: 1|2|3): string {
  return IMB_ICON_OVERRIDES[id]?.[tier]
    ?? `https://intibia.com/_next/image?url=%2Fimbuements%2F${id}-${tier}.png&w=64&q=75`;
}

function matIcon(name: string): string {
  const slug = name.replace(/'/g, '%27').replace(/ /g, '_');
  return `https://tibia.fandom.com/wiki/Special:FilePath/${slug}.gif`;
}

const BASE_COST = { Basic: 7_500, Intricate: 60_000, Powerful: 250_000 };

type Material  = { name: string; qty: number };
type TierLabel = 'Basic' | 'Intricate' | 'Powerful';
type Tier      = { label: TierLabel; color: string; effect: string; materials: Material[] };
type Imbuement = { id: string; name: string; desc: string; tiers: Tier[] };

const T = (label: TierLabel, effect: string, ...mats: [string, number][]): Tier => ({
  label,
  color: label === 'Basic' ? '#22c55e' : label === 'Intricate' ? '#3b82f6' : '#ef4444',
  effect,
  materials: mats.map(([name, qty]) => ({ name, qty })),
});

const IMBUEMENTS: Imbuement[] = [
  { id: 'vampirism',      name: 'Vampirism',      desc: 'Life Leech',         tiers: [ T('Basic','+5% Life leech',['Vampire Teeth',25]), T('Intricate','+10% Life leech',['Vampire Teeth',25],['Bloody Pincers',15]), T('Powerful','+25% Life leech',['Vampire Teeth',25],['Bloody Pincers',15],['Piece of Dead Brain',5]) ] },
  { id: 'void',           name: 'Void',           desc: 'Mana Leech',         tiers: [ T('Basic','+3% Mana leech',['Rope Belt',25]), T('Intricate','+5% Mana leech',['Rope Belt',25],['Silencer Claws',25]), T('Powerful','+8% Mana leech',['Rope Belt',25],['Silencer Claws',25],['Some Grimeleech Wings',5]) ] },
  { id: 'strike',         name: 'Strike',         desc: 'Critical Damage',    tiers: [ T('Basic','15% Critical damage',['Protective Charm',20]), T('Intricate','25% Critical damage',['Protective Charm',20],['Sabretooth',25]), T('Powerful','50% Critical damage',['Protective Charm',20],['Sabretooth',25],['Vexclaw Talon',5]) ] },
  { id: 'scorch',         name: 'Scorch',         desc: 'Fire Damage',        tiers: [ T('Basic','10% Damage converted',['Fiery Heart',25]), T('Intricate','25% Damage converted',['Fiery Heart',25],['Green Dragon Scale',5]), T('Powerful','50% Damage converted',['Fiery Heart',25],['Green Dragon Scale',5],['Demon Horn',5]) ] },
  { id: 'frost',          name: 'Frost',          desc: 'Ice Damage',         tiers: [ T('Basic','10% Damage converted',['Frosty Heart',25]), T('Intricate','25% Damage converted',['Frosty Heart',25],['Seacrest Hair',10]), T('Powerful','50% Damage converted',['Frosty Heart',25],['Seacrest Hair',10],['Polar Bear Paw',5]) ] },
  { id: 'electrify',      name: 'Electrify',      desc: 'Energy Damage',      tiers: [ T('Basic','10% Damage converted',['Rorc Feather',25]), T('Intricate','25% Damage converted',['Rorc Feather',25],['Peacock Feather Fan',5]), T('Powerful','50% Damage converted',['Rorc Feather',25],['Peacock Feather Fan',5],['Energy Vein',1]) ] },
  { id: 'venom',          name: 'Venom',          desc: 'Earth Damage',       tiers: [ T('Basic','10% Damage converted',['Swamp Grass',25]), T('Intricate','25% Damage converted',['Swamp Grass',25],['Poisonous Slime',20]), T('Powerful','50% Damage converted',['Swamp Grass',25],['Poisonous Slime',20],['Slime Heart',2]) ] },
  { id: 'reap',           name: 'Reap',           desc: 'Death Damage',       tiers: [ T('Basic','10% Damage converted',['Pile of Grave Earth',25]), T('Intricate','25% Damage converted',['Pile of Grave Earth',25],['Demonic Skeletal Hand',20]), T('Powerful','50% Damage converted',['Pile of Grave Earth',25],['Demonic Skeletal Hand',20],['Petrified Scream',5]) ] },
  { id: 'bash',           name: 'Bash',           desc: 'Club Fighting',      tiers: [ T('Basic','+1x Club fighting',['Cyclops Toe',20]), T('Intricate','+2x Club fighting',['Cyclops Toe',20],['Ogre Nose Ring',15]), T('Powerful','+4x Club fighting',['Cyclops Toe',20],['Ogre Nose Ring',15],["Warmaster's Wristguards",10]) ] },
  { id: 'chop',           name: 'Chop',           desc: 'Axe Fighting',       tiers: [ T('Basic','+1x Axe fighting',['Orc Tooth',20]), T('Intricate','+2x Axe fighting',['Orc Tooth',20],['Battle Stone',25]), T('Powerful','+4x Axe fighting',['Orc Tooth',20],['Battle Stone',25],['Moohtant Horn',20]) ] },
  { id: 'slash',          name: 'Slash',          desc: 'Sword Fighting',     tiers: [ T('Basic','+1x Sword fighting',["Lion's Mane",25]), T('Intricate','+2x Sword fighting',["Lion's Mane",25],["Mooh'Tah Shell",25]), T('Powerful','+4x Sword fighting',["Lion's Mane",25],["Mooh'Tah Shell",25],['War Crystal',5]) ] },
  { id: 'precision',      name: 'Precision',      desc: 'Distance Fighting',  tiers: [ T('Basic','+1x Distance fighting',['Elven Scouting Glass',25]), T('Intricate','+2x Distance fighting',['Elven Scouting Glass',25],['Elven Hoof',20]), T('Powerful','+4x Distance fighting',['Elven Scouting Glass',25],['Elven Hoof',20],['Metal Spike',10]) ] },
  { id: 'epiphany',       name: 'Epiphany',       desc: 'Magic Level',        tiers: [ T('Basic','+1x Magic level',['Elvish Talisman',25]), T('Intricate','+2x Magic level',['Elvish Talisman',25],['Broken Shamanic Staff',15]), T('Powerful','+4x Magic level',['Elvish Talisman',25],['Broken Shamanic Staff',15],['Strand of Medusa Hair',15]) ] },
  { id: 'punch',          name: 'Punch',          desc: 'Fist Fighting',      tiers: [ T('Basic','+1x Fist fighting',['Tarantula Egg',25]), T('Intricate','+2x Fist fighting',['Tarantula Egg',25],['Mantassin Tail',20]), T('Powerful','+4x Fist fighting',['Tarantula Egg',25],['Mantassin Tail',20],['Gold-Brocaded Cloth',15]) ] },
  { id: 'blockade',       name: 'Blockade',       desc: 'Shielding',          tiers: [ T('Basic','+1x Shielding',['Piece of Scarab Shell',20]), T('Intricate','+2x Shielding',['Piece of Scarab Shell',20],['Brimstone Shell',25]), T('Powerful','+4x Shielding',['Piece of Scarab Shell',20],['Brimstone Shell',25],['Frazzle Skin',25]) ] },
  { id: 'lich-shroud',    name: 'Lich Shroud',    desc: 'Death Protection',   tiers: [ T('Basic','+2% Death protection',['Flask of Embalming Fluid',25]), T('Intricate','+5% Death protection',['Flask of Embalming Fluid',25],['Gloom Wolf Fur',20]), T('Powerful','+10% Death protection',['Flask of Embalming Fluid',25],['Gloom Wolf Fur',20],['Mystical Hourglass',5]) ] },
  { id: 'snake-skin',     name: 'Snake Skin',     desc: 'Earth Protection',   tiers: [ T('Basic','+3% Earth protection',['Piece of Swampling Wood',25]), T('Intricate','+8% Earth protection',['Piece of Swampling Wood',25],['Snake Skin',10]), T('Powerful','+15% Earth protection',['Piece of Swampling Wood',25],['Snake Skin',10],['Brimstone Fangs',10]) ] },
  { id: 'dragon-hide',    name: 'Dragon Hide',    desc: 'Fire Protection',    tiers: [ T('Basic','+3% Fire protection',['Green Dragon Leather',20]), T('Intricate','+8% Fire protection',['Green Dragon Leather',20],['Blazing Bone',10]), T('Powerful','+15% Fire protection',['Green Dragon Leather',20],['Blazing Bone',10],['Draken Sulphur',5]) ] },
  { id: 'quara-scale',    name: 'Quara Scale',    desc: 'Ice Protection',     tiers: [ T('Basic','+3% Ice protection',['Winter Wolf Fur',25]), T('Intricate','+8% Ice protection',['Winter Wolf Fur',25],['Thick Fur',15]), T('Powerful','+15% Ice protection',['Winter Wolf Fur',25],['Thick Fur',15],['Deepling Warts',10]) ] },
  { id: 'cloud-fabric',   name: 'Cloud Fabric',   desc: 'Energy Protection',  tiers: [ T('Basic','+3% Energy protection',['Wyvern Talisman',20]), T('Intricate','+8% Energy protection',['Wyvern Talisman',20],['Crawler Head Plating',15]), T('Powerful','+15% Energy protection',['Wyvern Talisman',20],['Crawler Head Plating',15],['Wyrm Scale',10]) ] },
  { id: 'demon-presence', name: 'Demon Presence', desc: 'Holy Protection',    tiers: [ T('Basic','+3% Holy protection',['Cultish Robe',25]), T('Intricate','+8% Holy protection',['Cultish Robe',25],['Cultish Mask',25]), T('Powerful','+15% Holy protection',['Cultish Robe',25],['Cultish Mask',25],['Hellspawn Tail',20]) ] },
  { id: 'swiftness',      name: 'Swiftness',      desc: 'Speed Boost',        tiers: [ T('Basic','+10 Speed',['Damselfly Wing',15]), T('Intricate','+15 Speed',['Damselfly Wing',15],['Compass',25]), T('Powerful','+30 Speed',['Damselfly Wing',15],['Compass',25],['Waspoid Wing',20]) ] },
  { id: 'vibrancy',       name: 'Vibrancy',       desc: 'Paralysis Removal',  tiers: [ T('Basic','15% Paralysis removal',['Wereboar Hooves',20]), T('Intricate','25% Paralysis removal',['Wereboar Hooves',20],['Crystallized Anger',15]), T('Powerful','50% Paralysis removal',['Wereboar Hooves',20],['Crystallized Anger',15],['Quill',5]) ] },
  { id: 'featherweight',  name: 'Featherweight',  desc: 'Capacity Increase',  tiers: [ T('Basic','+150 Oz capacity',['Fairy Wings',20]), T('Intricate','+250 Oz capacity',['Fairy Wings',20],['Little Bowl of Myrrh',10]), T('Powerful','+500 Oz capacity',['Fairy Wings',20],['Little Bowl of Myrrh',10],['Goosebump Leather',5]) ] },
];

function fNum(n: number) { return Math.round(n).toLocaleString('pt-BR'); }

// ─── MatIcon with fallback ───────────────────────────────────────
function MatIcon({ name, size = 18 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (err) return <div style={{ width: size, height: size, borderRadius: 3, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />;
  return <img src={matIcon(name)} alt={name} width={size} height={size} onError={() => setErr(true)}
    style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, imageRendering: 'pixelated' }} />;
}

// ─── CopyBtn — igual ao loot-split ──────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} title={`Copiar "${text}"`}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition"
      style={{ border: copied ? '1px solid rgba(167,139,250,0.5)' : `1px solid ${BORDER}`,
        background: copied ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.03)',
        opacity: copied ? 1 : 0.5, cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => { if (!copied) e.currentTarget.style.opacity = '0.5'; }}>
      {copied
        ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
    </button>
  );
}

// ─── TotalRow — tooltip ABAIXO ──────────────────────────────────
function TotalRow({ marketCost, tokenCost }: { marketCost: number; tokenCost: number }) {
  const [hover, setHover] = useState(false);
  const hasData    = marketCost > 0 || tokenCost > 0;
  const bestToken  = tokenCost  > 0 && (tokenCost  <= marketCost || marketCost === 0);
  const bestMarket = marketCost > 0 && (marketCost  <  tokenCost  || tokenCost  === 0);
  const display    = hasData ? Math.min(...[marketCost, tokenCost].filter(v => v > 0)) : 0;

  return (
    <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 8, marginTop: 6, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: hasData ? 'help' : 'default' }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>Total</span>
          {hasData && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <img src={CRYSTAL_COIN_ICON} width={12} height={12} style={{ objectFit: 'contain' }} />
          <span style={{ fontSize: 13, fontWeight: 900, color: hasData ? PURPLE : 'rgba(255,255,255,0.2)' }}>
            {hasData ? fNum(display) : '—'}
          </span>
        </div>
      </div>
      {hover && hasData && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
          background: '#0a0a10', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '10px 12px',
          zIndex: 999, width: 230, boxShadow: '0 12px 40px rgba(0,0,0,0.8)' }}>
          {tokenCost > 0 && (
            <div style={{ marginBottom: marketCost > 0 ? 8 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <img src={GOLD_TOKEN_ICON} width={12} height={12} style={{ objectFit: 'contain' }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Apenas Gold Tokens</span>
                {bestToken && <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 800, marginLeft: 'auto' }}>✓ melhor</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <img src={CRYSTAL_COIN_ICON} width={11} height={11} style={{ objectFit: 'contain' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: bestToken ? '#22c55e' : PURPLE }}>{fNum(tokenCost)}</span>
                {marketCost > 0 && <span style={{ fontSize: 10, color: bestToken ? '#16a34a' : '#ef4444', marginLeft: 2 }}>({bestToken ? '' : '+'}{fNum(tokenCost - marketCost)}gp)</span>}
              </div>
            </div>
          )}
          {marketCost > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <img src={MARKET_ICON} width={12} height={12} style={{ objectFit: 'contain' }} />
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Apenas Market</span>
                {bestMarket && <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 800, marginLeft: 'auto' }}>✓ melhor</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <img src={CRYSTAL_COIN_ICON} width={11} height={11} style={{ objectFit: 'contain' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: bestMarket ? '#22c55e' : PURPLE }}>{fNum(marketCost)}</span>
                {tokenCost > 0 && <span style={{ fontSize: 10, color: bestMarket ? '#16a34a' : '#ef4444', marginLeft: 2 }}>({bestMarket ? '' : '+'}{fNum(marketCost - tokenCost)}gp)</span>}
              </div>
            </div>
          )}
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 8, textAlign: 'center', borderTop: `1px solid ${BORDER}`, paddingTop: 7 }}>
            Inclui preço base + taxa de sucesso de 100%
          </p>
        </div>
      )}
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────
export default function ImbuimentosPage() {
  const [selected, setSelected]             = useState<Imbuement | null>(null);
  const [prices, setPrices]                 = useState<Record<string, number>>({});
  const [goldTokenPrice, setGoldTokenPrice] = useState<number>(0);

  const getPrice = (mat: string) => prices[mat] ?? 0;
  const setPrice = (mat: string, val: number) => setPrices(p => ({ ...p, [mat]: val }));

  const marketCost = (tier: Tier) => {
    const mat = tier.materials.reduce((s, m) => s + getPrice(m.name) * m.qty, 0);
    return mat === 0 ? 0 : mat + BASE_COST[tier.label];
  };
  const tokenCost = (tier: Tier) => {
    if (!goldTokenPrice) return 0;
    return tier.materials.length * 2 * goldTokenPrice + BASE_COST[tier.label];
  };
  const bestCost = (tier: Tier) => {
    const mc = marketCost(tier); const tc = tokenCost(tier);
    if (!mc && !tc) return 0; if (!mc) return tc; if (!tc) return mc;
    return Math.min(mc, tc);
  };

  const modalMaterials = selected
    ? Array.from(new Set(selected.tiers.flatMap(t => t.materials.map(m => m.name))))
    : [];
  const matSlots: (string | null)[] = [
    modalMaterials[0] ?? null, modalMaterials[1] ?? null, modalMaterials[2] ?? null,
  ];

  return (
    <main className="relative min-h-screen text-white" style={{ background: BG }}>

      {/* glow igual ao skills */}
      <div className="pointer-events-none fixed inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">

        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <button onClick={() => (window.location.href = '/ferramentas')}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-500 transition hover:text-white"
            style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)' }}>
            ← Ferramentas
          </button>
          <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'rgba(167,139,250,0.6)' }}>FB Services</p>
          <h1 className="mt-1 text-3xl font-black text-white">
            Preços dos <span style={{ color: PURPLE }}>Imbuimentos</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">Descubra a maneira mais barata de fazer seus imbuements</p>
        </div>

        {/* ── Grid de cards ── */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {IMBUEMENTS.map(imb => {
            const cost = bestCost(imb.tiers[2]);
            return (
              <button key={imb.id} onClick={() => setSelected(imb)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:brightness-110"
                style={{ border: `1px solid ${BORDER}`, background: CARD }}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
                  <img src={imbIcon(imb.id, 3)} alt={imb.name} width={36} height={36} style={{ objectFit: 'contain' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{imb.name}</p>
                  <p className="text-[11px] truncate text-zinc-600">{imb.desc}</p>
                </div>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{ background: cost > 0 ? 'rgba(167,139,250,0.12)' : 'rgba(167,139,250,0.06)', color: cost > 0 ? PURPLE : '#7c3aed' }}>
                  {cost > 0 ? fNum(cost) : '•?'}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Modal ── */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={e => e.target === e.currentTarget && setSelected(null)}>

            <div className="w-full overflow-y-auto rounded-2xl"
              style={{ maxWidth: 960, maxHeight: '92vh', background: CARD, border: `1px solid ${BORDER}` }}>

              {/* modal header */}
              <div className="flex items-center justify-between p-5"
                style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
                    <img src={imbIcon(selected.id, 3)} alt={selected.name} width={44} height={44} style={{ objectFit: 'contain' }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{selected.name}</h2>
                    <p className="text-xs text-zinc-600">{selected.desc}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:text-white"
                  style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* tier cards — mesma estrutura dos cards do skills */}
              <div className="grid gap-3 p-5" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {selected.tiers.map((tier, ti) => {
                  const tierNum = (ti + 1) as 1|2|3;
                  const mc = marketCost(tier);
                  const tc = tokenCost(tier);
                  const hasPrices  = mc > 0 || tc > 0;
                  const bestToken  = tc > 0 && (tc <= mc || mc === 0);
                  const bestMarket = mc > 0 && (mc <  tc || tc === 0);
                  const bestIcon   = bestToken ? GOLD_TOKEN_ICON : bestMarket ? MARKET_ICON : null;

                  return (
                    <div key={tier.label} className="rounded-xl p-4"
                      style={{ border: `1px solid ${BORDER}`, background: BG }}>

                      {/* tier header — mesma linha do skills (ícone + badge) */}
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden"
                          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}>
                          <img src={imbIcon(selected.id, tierNum)} alt={tier.label} width={28} height={28} style={{ objectFit: 'contain' }} />
                        </div>
                        <span className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest"
                          style={{ background: tier.color + '22', color: tier.color }}>
                          {tier.label}
                        </span>
                      </div>

                      {/* efeito — igual ao label de habilidade do skills */}
                      <p className="mb-3 text-[11px] font-bold" style={{ color: tier.color }}>{tier.effect}</p>

                      {/* lista de materiais */}
                      <div className="mb-2 flex flex-col gap-2">
                        {tier.materials.map(m => (
                          <div key={m.name} className="flex items-center gap-2">
                            <MatIcon name={m.name} size={16} />
                            <span className="flex-1 truncate text-[11px] text-zinc-400">{m.qty}x {m.name}</span>
                            {hasPrices && bestIcon && (
                              <img src={bestIcon} width={12} height={12} style={{ objectFit: 'contain', flexShrink: 0, opacity: 0.8 }} />
                            )}
                            <CopyBtn text={m.name} />
                          </div>
                        ))}
                      </div>

                      {/* custo base */}
                      <div className="flex justify-end mb-1">
                        <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-wider">
                          + {fNum(BASE_COST[tier.label])}gp base
                        </span>
                      </div>

                      <TotalRow marketCost={mc} tokenCost={tc} />
                    </div>
                  );
                })}
              </div>

              {/* price inputs — mesmo estilo dos inputs do skills */}
              <div className="px-5 pb-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  Preços dos Recursos
                </p>
                <div className="grid grid-cols-4 gap-3">

                  {/* Gold Token */}
                  <div className="flex flex-col gap-2 rounded-xl p-3"
                    style={{ border: `1px solid ${BORDER}`, background: BG }}>
                    <div className="flex items-center gap-2">
                      <img src={GOLD_TOKEN_ICON} width={16} height={16} style={{ objectFit: 'contain', flexShrink: 0 }} />
                      <span className="flex-1 truncate text-[11px] font-semibold text-zinc-500">Gold Token</span>
                      <CopyBtn text="gold token" />
                    </div>
                    <input type="number" min="0" value={goldTokenPrice || ''} placeholder="0"
                      onChange={e => setGoldTokenPrice(Number(e.target.value))}
                      className="w-full bg-transparent text-sm font-black outline-none"
                      style={{ border: 'none', color: goldTokenPrice > 0 ? PURPLE : 'rgba(255,255,255,0.2)', fontFamily: 'inherit' }} />
                  </div>

                  {/* Material slots */}
                  {matSlots.map((mat, i) => {
                    const price = mat ? getPrice(mat) : 0;
                    return (
                      <div key={i} className="flex flex-col gap-2 rounded-xl p-3"
                        style={{ border: `1px solid ${mat ? BORDER : 'rgba(255,255,255,0.03)'}`,
                          background: mat ? BG : 'rgba(255,255,255,0.01)', opacity: mat ? 1 : 0.35 }}>
                        <div className="flex items-center gap-2">
                          {mat ? <MatIcon name={mat} size={16} /> : <div style={{ width: 16, height: 16, borderRadius: 3, background: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />}
                          <span className="flex-1 truncate text-[11px] font-semibold text-zinc-500">{mat ?? '—'}</span>
                          {mat && <CopyBtn text={mat} />}
                        </div>
                        <input type="number" min="0" disabled={!mat}
                          value={mat && price > 0 ? price : ''} placeholder="0"
                          onChange={e => mat && setPrice(mat, Number(e.target.value))}
                          className="w-full bg-transparent text-sm font-black outline-none"
                          style={{ border: 'none', color: price > 0 ? PURPLE : 'rgba(255,255,255,0.2)',
                            fontFamily: 'inherit', cursor: mat ? 'text' : 'not-allowed' }} />
                      </div>
                    );
                  })}
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
