'use client';

import { useState, useMemo } from 'react';

// ─── Tokens ──────────────────────────────────────────────────
const BG       = '#111118';
const CARD     = '#1a1a24';
const BORDER   = 'rgba(255,255,255,0.07)';
const PURPLE   = '#a78bfa';
const GREEN    = '#43cf7b';
const SOFT_RED = '#f87171';
const BLUE     = '#60a5fa';
const SELECT_ACCENT = '#7f8cff';
const SELECT_BG = 'rgba(127,140,255,0.12)';
const GOLD_TXT = '#f3c654';
const RES_TXT  = '#7ea9ff';
const STEP2_ACCENT = '#d7a24a';

const GOLD_ICON = 'https://www.tibiawiki.com.br/images/b/b0/Gold_Coin.gif';
const CORE_ICON = 'https://www.tibiawiki.com.br/images/0/0d/Exalted_Core.gif';
const DUST_ICON = 'https://www.tibiawiki.com.br/images/7/73/Dust.gif';

// ─── Fee tables ───────────────────────────────────────────────
const FORGE_FEES: Record<number, Record<number, number>> = {
  1: { 1: 125_000 },
  2: { 1: 750_000,       2: 5_000_000 },
  3: { 1: 4_000_000,     2: 10_000_000,     3: 20_000_000 },
  4: {
     1: 8_000_000,       2: 20_000_000,     3: 40_000_000,
     4: 65_000_000,      5: 100_000_000,    6: 250_000_000,
     7: 750_000_000,     8: 2_500_000_000,  9: 8_000_000_000,
    10: 15_000_000_000,
  },
};

const CONV_FEES: Record<number, Record<number, number>> = {
  4: {
    1: 55_000_000,     2: 110_000_000,    3: 170_000_000,
    4: 300_000_000,    5: 875_000_000,    6: 2_350_000_000,
    7: 6_950_000_000,  8: 21_250_000_000, 9: 50_000_000_000,
   10: 125_000_000_000,
  },
};

const TRANSF_CONV_FEES: Record<number, Record<number, number>> = {
  4: {
    1: 65_000_000,     2: 165_000_000,    3: 375_000_000,
    4: 800_000_000,    5: 2_000_000_000,  6: 5_250_000_000,
    7: 14_500_000_000, 8: 42_500_000_000, 9: 100_000_000_000,
   10: 300_000_000_000,
  },
};

const MAX_TIER: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 10 };
const DUST_BASE = 100;
const DUST_CONV = 160;

// Cores consumed in the single Transfer step (fixed per target tier)
const TRANSFER_STEP_CORES: Record<number, number> = {
  1: 1, 2: 2, 3: 5, 4: 10, 5: 15, 6: 25, 7: 35, 8: 50, 9: 60,
};

type ForgeMode = 'fusao_regular' | 'transf_regular' | 'fusao_conv' | 'transf_conv';

const AVAILABLE_MODES: Record<number, ForgeMode[]> = {
  1: ['fusao_regular'],
  2: ['fusao_regular', 'transf_regular'],
  3: ['fusao_regular', 'transf_regular'],
  4: ['fusao_regular', 'transf_regular', 'fusao_conv', 'transf_conv'],
};

function getMaxTier(cls: number, mode: ForgeMode) {
  return mode === 'transf_regular' ? MAX_TIER[cls] - 1 : MAX_TIER[cls];
}

const CLASSES = [
  { id: 4, label: 'Class 4', examples: 'Falcon, Soulcore' },
  { id: 3, label: 'Class 3', examples: 'Gnome, Deus' },
  { id: 2, label: 'Class 2', examples: 'Gnature, Asura' },
  { id: 1, label: 'Class 1', examples: 'Zaoan, Dwarven' },
];

const MODE_INFO: Record<ForgeMode, { label: string; short: string; desc: string }> = {
  fusao_regular:  { label: 'Fusão Regular',          short: '', desc: 'Avança padrão a partir de Tiers inferiores.' },
  transf_regular: { label: 'Transferência Regular',  short: '', desc: 'Requer Fodder de 1 Tier acima (T+1).' },
  fusao_conv:     { label: 'Fusão Convergência',     short: '', desc: 'Avanço garantido. Requer Fodders do mesmo Tier.' },
  transf_conv:    { label: 'Transferência Converg.', short: '',    desc: 'Transfere Tier idêntico ao alvo.' },
};

function fNum(n: number) { return Math.round(n).toLocaleString('pt-BR'); }

// ─── Perfect helpers ──────────────────────────────────────────
type RowData = { tier: number; gold: number; items: number; cores: number };

type ConvRow = { tier: number; npcFee: number; fodderCost: number; fodderTier: number };

type XferSteps = {
  fodderTier: number;
  fodderItems: number;
  fodderGold: number;
  fodderCores: number;
  transferFee: number;
  transferCores: number;
  isConv?: boolean;
};

type ForgeResult = {
  itemsT0: number;
  goldFees: number;
  coresNeeded: number;
  dustNeeded: number;
  totalCost: number;
  rows?: RowData[];
  convBreakdown?: ConvRow[];
  xferSteps?: XferSteps;
};

// ─── Perfect build (no failures) ─────────────────────────────
// gold   = Σ 2^(n-k) × fee(k) para k=1..n
// items  = 2^n
// cores  = (2^n-1) × cpa
// dust   = (2^n-1) × 100
function buildPerfect(cls: number, n: number, cpa: number) {
  let gold = 0;
  let fusions = 0;

  for (let k = 1; k <= n; k++) {
    const fus = Math.pow(2, n - k);
    gold += fus * (FORGE_FEES[cls]?.[k] ?? 0);
    fusions += fus;
  }

  return {
    items: Math.pow(2, n),
    gold: Math.ceil(gold),
    cores: Math.ceil(fusions * cpa),
    dust: Math.ceil(fusions * DUST_BASE),
  };
}

// ─── Main calculator (perfect only) ──────────────────────────
function calcForge({ cls, tier, mode, useBoost, useProt, itemPrice, corePrice }: {
  cls: number;
  tier: number;
  mode: ForgeMode;
  useBoost: boolean;
  useProt: boolean;
  itemPrice: number;
  corePrice: number;
}): ForgeResult {
  const cpa = (useBoost ? 1 : 0) + (useProt ? 1 : 0);

  // ── Fusão Regular ──────────────────────────────────────────
  if (mode === 'fusao_regular') {
    const p = buildPerfect(cls, tier, cpa);
    let prevC = 0;
    const rows: RowData[] = [];

    for (let k = 1; k <= tier; k++) {
      const fee = FORGE_FEES[cls]?.[k] ?? 0;
      const pFee = k > 1 ? (FORGE_FEES[cls]?.[k - 1] ?? 0) : 0;
      const Ck = k === 1 ? fee : 2 * prevC + fee - pFee;

      rows.push({
        tier: k,
        gold: Ck,
        items: Math.pow(2, k - 1),
        cores: Math.pow(2, k - 1) * cpa,
      });

      prevC = Ck;
    }

    return {
      itemsT0: p.items,
      goldFees: p.gold,
      coresNeeded: p.cores,
      dustNeeded: p.dust,
      totalCost: Math.ceil(p.items * itemPrice + p.cores * corePrice + p.gold),
      rows,
    };
  }

  // ── Transferência Regular ──────────────────────────────────
  if (mode === 'transf_regular') {
    const fTier = tier + 1;
    const fp = buildPerfect(cls, fTier, cpa);
    const tFee = FORGE_FEES[cls]?.[fTier] ?? 0;
    const tCores = TRANSFER_STEP_CORES[tier] ?? tier * 5;

    return {
      itemsT0: fp.items,
      goldFees: Math.round(fp.gold + tFee),
      coresNeeded: Math.ceil(fp.cores + tCores),
      dustNeeded: Math.round(fp.dust),
      totalCost: Math.round(
        (fp.items * itemPrice) +
        ((fp.cores + tCores) * corePrice) +
        (fp.gold + tFee)
      ),
      xferSteps: {
        fodderTier: fTier,
        fodderItems: fp.items,
        fodderGold: fp.gold,
        fodderCores: fp.cores,
        transferFee: tFee,
        transferCores: tCores,
      },
    };
  }

  // ── Fusão Convergência ─────────────────────────────────────
  if (mode === 'fusao_conv') {
    const n = tier;
    const ff = (Math.pow(2, n) - 1) - n;
    const its = Math.pow(2, n) - 1;
    const convRows: ConvRow[] = [];
    let totalGold = 0;

    for (let k = 1; k <= n; k++) {
      const nFee = CONV_FEES[cls]?.[k] ?? 0;
      const fTier = k - 1;
      const fod = fTier === 0 ? { gold: 0 } : buildPerfect(cls, fTier, cpa);

      convRows.push({ tier: k, npcFee: nFee, fodderCost: fod.gold, fodderTier: fTier });
      totalGold += nFee + fod.gold;
    }

    return {
      itemsT0: Math.ceil(its),
      goldFees: Math.ceil(totalGold),
      coresNeeded: Math.ceil(ff * cpa),
      dustNeeded: Math.ceil(ff * DUST_BASE + n * DUST_CONV),
      totalCost: Math.ceil(its * itemPrice + ff * cpa * corePrice + totalGold),
      convBreakdown: convRows,
    };
  }

  // ── Transferência Convergência ─────────────────────────────
  const fp = buildPerfect(cls, tier, cpa);
  const tFee = TRANSF_CONV_FEES[cls]?.[tier] ?? 0;

  return {
    itemsT0: fp.items,
    goldFees: Math.ceil(fp.gold + tFee),
    coresNeeded: fp.cores,
    dustNeeded: Math.ceil(fp.dust + DUST_CONV),
    totalCost: Math.ceil(fp.items * itemPrice + fp.cores * corePrice + fp.gold + tFee),
    xferSteps: {
      fodderTier: tier,
      fodderItems: fp.items,
      fodderGold: fp.gold,
      fodderCores: fp.cores,
      transferFee: tFee,
      transferCores: 0,
      isConv: true,
    },
  };
}

// ─── UI helpers ───────────────────────────────────────────────
function SectionHeader({ n, label }: { n: number; label: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-black"
        style={{ background: PURPLE }}
      >
        {n}
      </span>
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{label}</p>
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }: {
  checked: boolean;
  onChange: () => void;
  label: string;
  sub: string;
}) {
  return (
    <div
      onClick={onChange}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3"
      style={{
        border: `1px solid ${checked ? 'rgba(127,140,255,0.45)' : BORDER}`,
background: checked ? SELECT_BG : 'rgba(255,255,255,0.02)',
      }}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: checked ? SELECT_ACCENT : '#d1d5db' }}>{label}</p>
        <p className="text-[11px] text-zinc-600">{sub}</p>
      </div>
      <div
        className="relative flex h-6 w-11 shrink-0 items-center rounded-full"
       style={{ background: checked ? SELECT_ACCENT : 'rgba(255,255,255,0.1)' }}
      >
        <span
          className="absolute h-4 w-4 rounded-full bg-white shadow"
          style={{ left: checked ? 'calc(100% - 20px)' : '4px', transition: 'left 0.15s' }}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, icon }: { label: string; value: string; accent?: string; icon?: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
      <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">{label}</p>
      <div className="flex items-center justify-center gap-1.5">
        {icon ? <img src={icon} alt="" className="h-4 w-4" /> : null}
        <p className="text-base font-black break-all" style={{ color: accent ?? '#ffffff' }}>{value}</p>
      </div>
    </div>
  );
}

function InlineValue({ icon, children, color, className = '' }: { icon?: string; children: React.ReactNode; color: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`.trim()} style={{ color }}>
      {icon ? <img src={icon} alt="" className="h-3.5 w-3.5" /> : null}
      <span>{children}</span>
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function ExaltationForgePage() {
  const [cls, setCls] = useState(4);
  const [tier, setTier] = useState(1);
  const [mode, setMode] = useState<ForgeMode>('fusao_regular');
  const [boost, setBoost] = useState(true);
  const [prot, setProt] = useState(true);
  const [itmStr, setItmStr] = useState('');
  const [coreStr, setCoreStr] = useState('');

  const itemPrice = parseInt(itmStr.replace(/\D/g, '')) || 0;
  const corePrice = parseInt(coreStr.replace(/\D/g, '')) || 0;
  const maxTier = getMaxTier(cls, mode);

  const result = useMemo(
    () => calcForge({ cls, tier, mode, useBoost: boost, useProt: prot, itemPrice, corePrice }),
    [cls, tier, mode, boost, prot, itemPrice, corePrice],
  );

  const bRate = boost
    ? Math.min((mode === 'transf_regular' ? 0.9 : 0.5) + 0.15, 1)
    : (mode === 'transf_regular' ? 0.9 : 0.5);
  const effRate = ((bRate + (1 - bRate) * (prot ? 0.5 : 0)) * 100).toFixed(1);

  function fInp(v: string) {
    const n = parseInt(v.replace(/\D/g, '')) || 0;
    return n > 0 ? n.toLocaleString('pt-BR') : '';
  }

  function onCls(id: number) {
    setCls(id);
    const mt = getMaxTier(id, mode);
    setTier(t => Math.min(mt, t));
    if (!AVAILABLE_MODES[id].includes(mode)) setMode('fusao_regular');
  }

  function onMode(m: ForgeMode) {
    setMode(m);
    setTier(t => Math.min(getMaxTier(cls, m), t));
  }

  const inp: React.CSSProperties = {
    border: `1px solid ${BORDER}`,
    background: '#0d0d14',
    borderRadius: 10,
    padding: '8px 12px',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
  };

  const scnClr = GREEN;
  const availModes = AVAILABLE_MODES[cls];

  return (
    <main className="relative min-h-screen text-white" style={{ background: BG }}>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(74,222,128,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 text-center">
          <button
            onClick={() => (window.location.href = '/ferramentas')}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-500 hover:text-white"
            style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)' }}
          >
            ← Ferramentas
          </button>
          <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'rgba(167,139,250,0.6)' }}>FB Services</p>
          <h1 className="mt-1 text-3xl font-black text-white">
            Exaltation <span style={{ color: PURPLE }}>Forge</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Calculadora com foco apenas no cenário perfeito.
          </p>
        </div>

        <div className="mb-6 flex gap-1.5 rounded-2xl p-1.5" style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
          <div
            className="flex-1 rounded-xl py-3 text-center text-sm font-black"
            style={{
              background: GREEN,
              color: '#000',
              boxShadow: '0 0 22px rgba(74,222,128,0.35), inset 0 0 0 1px rgba(74,222,128,0.45)',
            }}
          >
            100% Sucesso
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <SectionHeader n={1} label="Classificação do Item" />
              <p className="mb-3 text-[11px] text-zinc-600">A classe define o custo e os limites de Tier possíveis.</p>
              <div className="grid grid-cols-2 gap-2">
                {CLASSES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => onCls(c.id)}
                    className="flex flex-col rounded-xl px-3 py-3 text-left"
                    style={{
                      border: `1px solid ${cls === c.id ? 'rgba(127,140,255,0.65)' : BORDER}`,
                      background: cls === c.id ? SELECT_BG : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <span className="text-sm font-black" style={{ color: cls === c.id ? SELECT_ACCENT : '#d1d5db' }}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <SectionHeader n={2} label="Tier Final Desejado" />
              <p className="mb-4 text-[11px] text-zinc-600">Até onde você deseja aprimorar o seu item base?</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTier(t => Math.max(1, t - 1))}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl font-black"
                  style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.04)', color: '#9ca3af' }}
                >
                  −
                </button>
                <div className="flex-1 rounded-xl py-3 text-center" style={{ border: '1px solid rgba(127,140,255,0.35)', background: '#0d0d14' }}>
                  <span className="text-2xl font-black" style={{ color: SELECT_ACCENT }}>T{tier}</span>
                </div>
                <button
                  onClick={() => setTier(t => Math.min(maxTier, t + 1))}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl font-black"
                  style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.04)', color: '#9ca3af' }}
                >
                  +
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-zinc-700">
                Máximo: T{maxTier} para {CLASSES.find(c => c.id === cls)?.label}
              </p>
            </div>

            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <SectionHeader n={3} label="Modo da Operação" />
              <div className="flex flex-col gap-2">
                {(['fusao_regular', 'transf_regular', 'fusao_conv', 'transf_conv'] as ForgeMode[]).map(m => {
                  const info = MODE_INFO[m];
                  const active = mode === m;
                  const avail = availModes.includes(m);
                  return (
                    <button
                      key={m}
                      disabled={!avail}
                      onClick={() => avail && onMode(m)}
                      className="flex items-start gap-3 rounded-xl px-4 py-3 text-left"
                      style={{
                        border: `1px solid ${active ? 'rgba(127,140,255,0.55)' : avail ? BORDER : 'rgba(255,255,255,0.03)'}`,
                        background: active ? SELECT_BG : 'rgba(255,255,255,0.02)',
                        opacity: avail ? 1 : 0.3,
                        cursor: avail ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <div
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                        style={{
                          border: `2px solid ${active ? SELECT_ACCENT : 'rgba(255,255,255,0.2)'}`,
                          background: active ? SELECT_ACCENT : 'transparent',
                        }}
                      >
                        {active && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: active ? SELECT_ACCENT : '#d1d5db' }}>{info.label}</span>
                          <span
                            className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                            style={{ background: 'rgba(255,255,255,0.06)', color: '#6b7280' }}
                          >
                            {info.short}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-zinc-600">{info.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <SectionHeader n={4} label="Preços do Mercado" />
              <p className="mb-4 text-[11px] text-zinc-600">Informe o valor dos itens base para calcular o custo total real.</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: 'Item Base T0 (Gold)', val: itmStr, set: setItmStr, icon: '' },
                  { label: 'Exalted Core (Gold)', val: coreStr, set: setCoreStr, icon: '' },
                ] as const).map(f => (
                  <div key={f.label}>
                    <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-zinc-600">{f.label}</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-zinc-600 text-sm">{f.icon}</span>
                      <input
                        type="text"
                        value={fInp(f.val)}
                        placeholder=""
                        onChange={e => f.set(e.target.value.replace(/\D/g, ''))}
                        className="pl-8"
                        style={inp}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <SectionHeader n={5} label="Modificadores da Forja" />
              <p className="mb-3 text-[11px] text-zinc-600">Deseja utilizar Exalted Cores a cada tentativa?</p>
              <div className="flex flex-col gap-2">
                <Toggle
                  checked={boost}
                  onChange={() => setBoost(b => !b)}
                  label="Success Rate"
                  sub=""
                />
                <Toggle
                  checked={prot}
                  onChange={() => setProt(p => !p)}
                  label="Tier Protection"
                  sub=""
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div
              className="rounded-2xl p-5"
              style={{ border: `1px solid ${scnClr}40`, background: CARD, boxShadow: `0 0 40px ${scnClr}14` }}
            >
              <p className="mb-1 text-center text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                Custo Estimado Equivalente
              </p>
              <div className="mb-3 flex items-center justify-center gap-2 text-center">
                <img src={GOLD_ICON} alt="" className="h-6 w-6" />
                <span className="text-4xl font-black" style={{ color: GOLD_TXT }}>{fNum(result.totalCost)}</span>
                <span className="text-lg font-bold" style={{ color: GOLD_TXT }}>Gold</span>
              </div>
              <div className="mb-5 flex justify-center">
                <span className="rounded-full px-4 py-1 text-xs font-bold" style={{ background: `${scnClr}18`, border: `1px solid ${scnClr}45`, color: scnClr }}>
                  ✦ 100% Sucesso (Ideal)
                </span>
              </div>
              <div className="grid grid-cols-3 gap3 sm:grid-cols2">
                <StatCard label="Items T0" value={fNum(result.itemsT0)} accent="#ffffff" />
<StatCard label="Exalted Cores" value={fNum(result.coresNeeded)} accent={RES_TXT} icon={CORE_ICON} />
<StatCard label="Exalted Dust" value={fNum(result.dustNeeded)} accent={RES_TXT} icon={DUST_ICON} />
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Detalhamento da Operação</p>
              <p className="mb-4 text-[11px] text-zinc-600">
                {mode === 'fusao_conv'
                  ? 'Custo cumulativo usando Convergência em cada subida de Tier.'
                  : 'Custo cumulativo assumindo zero falhas durante as fusões.'}
              </p>

              {result.rows && (
                <div className="flex flex-col gap-2">
                  {result.rows.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                        style={{ background: SELECT_BG, color: SELECT_ACCENT }}
                      >
                        T{b.tier}
                      </span>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5"><img src={GOLD_ICON} alt="" className="h-4 w-4" /><p className="text-sm font-black" style={{ color: GOLD_TXT }}>+{fNum(b.gold)} G</p></div>
                        <div className="flex items-center justify-end gap-2 text-[10px] text-zinc-400"><span className="text-white">+{fNum(b.items)} {b.items === 1 ? 'Item' : 'Itens'}</span><span>|</span><InlineValue icon={CORE_ICON} color={RES_TXT}>+{fNum(b.cores)} Cores</InlineValue></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.convBreakdown && (
                <div className="flex flex-col gap-2">
                  {result.convBreakdown.map((row, i) => (
                    <div key={i} className="overflow-hidden rounded-xl" style={{ border: '1px solid rgba(167,139,250,0.25)' }}>
                      <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(215,162,74,0.10)' }}>
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-black" style={{ background: 'rgba(167,139,250,0.2)', color: PURPLE }}>
                            T{row.tier}
                          </span>
                          <span className="text-xs font-bold" style={{ color: SELECT_ACCENT }}>Avanço Garantido</span>
                        </div>
                        <span className="rounded px-2 py-0.5 text-xs font-black" style={{ background: SELECT_BG }}>
                          Taxa: {fNum(row.npcFee)} 
                        </span>
                      </div>
                      <div className="px-4 py-2 text-[11px]" style={{ background: '#0d0d14' }}>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">{row.fodderTier === 0 ? 'Fodder (T0):' : `Criar Fodder (T${row.fodderTier}):`}</span>
                          <span className="font-bold" style={{ color: row.fodderCost === 0 ? '#6b7280' : GOLD_TXT }}>
                            Equivalente {fNum(row.fodderCost)} 
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.xferSteps && (() => {
                const ts = result.xferSteps!;
                return (
                  <div className="flex flex-col gap-3">
                    <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${BLUE}40` }}>
                      <div className="px-4 py-2.5" style={{ background: `${BLUE}14` }}>
                        <p className="text-sm font-bold" style={{ color: BLUE }}>
                          Passo 1: Construir Fodder (T{ts.fodderTier})
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 px-4 py-3" style={{ background: '#0d0d14' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-500">Material Base Necessário:</span>
                          <span className="text-[11px] font-bold text-white">{fNum(ts.fodderItems)}x T0</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-500">Custos da Forja (Gold):</span>
                          <InlineValue icon={GOLD_ICON} color={GOLD_TXT} className="text-[11px] font-bold">{fNum(ts.fodderGold)} Gold</InlineValue>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center text-zinc-600">↓</div>

                    <div className="overflow-hidden rounded-xl" style={{ border: '1px solid rgba(215,162,74,0.35)' }}>
                      <div className="px-4 py-2.5" style={{ background: 'rgba(215,162,74,0.10)' }}>
                        <p className="text-sm font-bold" style={{ color: STEP2_ACCENT }}>
                          {ts.isConv ? 'Passo 2: Taxa de Transf. Convergência' : 'Passo 2: Taxa de Transferência'}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 px-4 py-3" style={{ background: '#0d0d14' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-500">Taxa Fixa do NPC:</span>
                          <InlineValue icon={GOLD_ICON} color={GOLD_TXT} className="text-[11px] font-bold">{fNum(ts.transferFee)} Gold</InlineValue>
                        </div>
                        {!ts.isConv && (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-zinc-500">Custo em Cores:</span>
                            <InlineValue icon={CORE_ICON} color={RES_TXT} className="text-[11px] font-bold">{ts.transferCores} {ts.transferCores === 1 ? 'Core' : 'Cores'}</InlineValue>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
                        </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">
          Exaltation Forge · RubinOT · Calculadora de Custos
        </p>
      </div>
    </main>
  );
}