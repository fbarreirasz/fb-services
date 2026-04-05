'use client';

import { useState } from 'react';

// ─── design tokens — idênticos ao skills / stamina / loot-split ─
const BG     = '#111118';
const CARD   = '#1a1a24';
const BORDER = 'rgba(255,255,255,0.07)';
const PURPLE = '#a78bfa';

// ─── slider CSS ─────────────────────────────────────────────────
const sliderCSS = `
  .calc-range { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 9999px; background: #0d0d14; outline: none; }
  .calc-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${PURPLE}; cursor: pointer; border: 2px solid #111118; box-shadow: 0 0 8px rgba(167,139,250,0.4); }
  .calc-range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: ${PURPLE}; cursor: pointer; border: 2px solid #111118; }
`;

// ─── rates RubinOT ───────────────────────────────────────────────
const RATES = [
  { f: 1,    t: 8,    r: 50   },
  { f: 9,    t: 50,   r: 80   },
  { f: 51,   t: 100,  r: 60   },
  { f: 101,  t: 150,  r: 40   },
  { f: 151,  t: 200,  r: 30   },
  { f: 201,  t: 300,  r: 15   },
  { f: 301,  t: 400,  r: 12   },
  { f: 401,  t: 500,  r: 10   },
  { f: 501,  t: 600,  r: 7    },
  { f: 601,  t: 700,  r: 6    },
  { f: 701,  t: 800,  r: 5    },
  { f: 801,  t: 900,  r: 4    },
  { f: 901,  t: 1000, r: 3    },
  { f: 1001, t: 1200, r: 2    },
  { f: 1201, t: 1400, r: 1.5  },
  { f: 1401, t: 9999, r: 1.2  },
];

function getRate(n: number) { return RATES.find(s => n >= s.f && n <= s.t)?.r ?? 1.2; }
function xpLvl(n: number)   { return 50 * n * n - 50 * n + 100; }

function fkk(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'bi';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'kk';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'k';
  return Math.round(n).toString();
}
function fH(h: number) {
  if (h <= 0) return '0min';
  if (h < 1 / 60) return '<1 min';
  if (h < 1) return Math.round(h * 60) + 'min';
  const d = Math.floor(h / 24);
  const r = h % 24;
  if (d === 0) return h.toFixed(1) + 'h';
  return `${d}d ${r.toFixed(0)}h`;
}
function fDays(h: number) { return h < 24 ? h.toFixed(1) + 'h total' : (h / 24).toFixed(1) + ' dias'; }

type BreakdownItem = { label: string; xp: number; h: number };
type CalcResult    = { totalH: number; totalSess: number; totalXp: number; breakdown: BreakdownItem[] };

const MAX_SESS = 3;

// ─── small reusable checkbox ─────────────────────────────────────
function Checkbox({ checked, onChange, label, sub }: { checked: boolean; onChange: () => void; label: string; sub: string }) {
  return (
    <div onClick={onChange} className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors"
      style={{ border: `1px solid ${checked ? 'rgba(167,139,250,0.35)' : BORDER}`, background: checked ? 'rgba(167,139,250,0.07)' : 'rgba(255,255,255,0.02)' }}>
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
        style={{ border: `2px solid ${checked ? PURPLE : 'rgba(255,255,255,0.18)'}`, background: checked ? PURPLE : 'transparent' }}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: checked ? PURPLE : '#d1d5db' }}>{label}</p>
        <p className="text-[11px] text-zinc-600">{sub}</p>
      </div>
    </div>
  );
}

// ─── input helper ────────────────────────────────────────────────
const inputCls = "h-11 w-full rounded-xl bg-transparent px-4 text-sm text-white outline-none transition";
const inputStyle = { border: `1px solid ${BORDER}`, background: '#0d0d14' };

export default function CalculadoraPage() {
  const [levelFrom, setLevelFrom] = useState(958);
  const [levelTo,   setLevelTo]   = useState(1000);
  const [mode,      setMode]      = useState<'xp' | 'pct'>('xp');
  const [xpExact,   setXpExact]   = useState(3239355);
  const [pct,       setPct]       = useState(8);
  const [rawKK,     setRawKK]     = useState(1);
  const [hSess,     setHSess]     = useState(2);
  const [hasStam,   setHasStam]   = useState(true);
  const [hasStore,  setHasStore]  = useState(false);
  const [result,    setResult]    = useState<CalcResult | null>(null);
  const [error,     setError]     = useState('');

  const totalLevelXp = xpLvl(levelFrom);
  const xpPreviewPct = mode === 'xp' && xpExact > 0 ? ((xpExact / totalLevelXp) * 100).toFixed(1) : null;
  const currentRate  = getRate(levelFrom);
  const stamFrac     = hasStam ? Math.min(MAX_SESS, hSess) / hSess : 0;
  const boostMult    = hasStore ? 1.5 : 1.0;
  const sessEffMult  = (1 + 0.5 * stamFrac) * boostMult;

  const multLabel = (() => {
    const stamH = Math.min(MAX_SESS, hSess);
    const parts: string[] = [`${currentRate}`];
    if (hasStore) parts.push('× 1.5');
    if (hasStam) {
      parts.push(stamH === hSess ? '× 1.5' : `× 1.5 (stam, ${stamH}h de ${hSess}h/sessão)`);
    }
    return parts.join(' ') + ` = ${(currentRate * sessEffMult).toFixed(2)}x efetivo`;
  })();

  function calcular() {
    setError(''); setResult(null);
    if (!levelFrom || !levelTo || levelFrom >= levelTo) { setError('Level desejado deve ser maior que o atual.'); return; }
    if (!rawKK || rawKK <= 0) { setError('Informe o raw XP/h.'); return; }
    if (levelFrom < 1 || levelTo > 2000) { setError('Level entre 1 e 2000.'); return; }

    const xpCurRemaining = mode === 'xp' ? xpExact : xpLvl(levelFrom) * (pct / 100);
    if (xpCurRemaining <= 0) { setError('Informe o XP restante.'); return; }
    if (xpCurRemaining > xpLvl(levelFrom)) {
      setError(`XP restante não pode ser maior que o total do level (${xpLvl(levelFrom).toLocaleString('pt-BR')}).`);
      return;
    }

    const rawPH = rawKK * 1e6;
    const timeForXP = (xp: number, rate: number) => xp / (rawPH * rate * sessEffMult);
    const pctLabel = mode === 'xp'
      ? `${((xpCurRemaining / xpLvl(levelFrom)) * 100).toFixed(1)}% restante`
      : `${Math.round(pct)}% restante`;

    let totalH = 0;
    const breakdown: BreakdownItem[] = [];

    const rateCur = getRate(levelFrom);
    const hCur = timeForXP(xpCurRemaining, rateCur);
    totalH += hCur;
    breakdown.push({ label: `Lv ${levelFrom} (${pctLabel} · ${rateCur}x)`, xp: xpCurRemaining, h: hCur });

    const rsegs: Record<number, { r: number; xp: number; lf: number; lt: number }> = {};
    for (let n = levelFrom + 1; n < levelTo; n++) {
      const r = getRate(n);
      if (!rsegs[r]) rsegs[r] = { r, xp: 0, lf: n, lt: n };
      rsegs[r].xp += xpLvl(n);
      rsegs[r].lt = n + 1;
    }
    for (const s of Object.values(rsegs).sort((a, b) => a.lf - b.lf)) {
      const h = timeForXP(s.xp, s.r);
      totalH += h;
      breakdown.push({ label: `Lv ${s.lf}–${s.lt} · ${s.r}x`, xp: s.xp, h });
    }

    setResult({ totalH, totalSess: Math.ceil(totalH / hSess), totalXp: breakdown.reduce((a, b) => a + b.xp, 0), breakdown });
  }

  return (
    <>
      <style>{sliderCSS}</style>
      <main className="relative min-h-screen text-white" style={{ background: BG }}>

        {/* glow */}
        <div className="pointer-events-none fixed inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 mx-auto max-w-2xl px-4 py-10">

          {/* ── Header ── */}
          <div className="mb-8 text-center">
            <button onClick={() => (window.location.href = '/ferramentas')}
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-500 transition hover:text-white"
              style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)' }}>
              ← Ferramentas
            </button>
            <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'rgba(167,139,250,0.6)' }}>FB Services</p>
            <h1 className="mt-1 text-3xl font-black text-white">
              Calculadora de <span style={{ color: PURPLE }}>Experiência</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Estime quantas horas de hunt você precisa para atingir seu level desejado no RubinOT.
            </p>
          </div>

          {/* ── Form card ── */}
          <div className="rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>

            {/* Levels */}
            <div className="mb-5 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-zinc-600">Level atual</label>
                <input type="number" value={levelFrom} min={1} max={1999}
                  onChange={e => setLevelFrom(Number(e.target.value))}
                  className={inputCls} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.4)')}
                  onBlur={e  => (e.target.style.borderColor = BORDER)} />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-zinc-600">Level desejado</label>
                <input type="number" value={levelTo} min={2} max={2000}
                  onChange={e => setLevelTo(Number(e.target.value))}
                  className={inputCls} style={{ ...inputStyle, color: PURPLE, borderColor: 'rgba(167,139,250,0.3)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.5)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(167,139,250,0.3)')} />
              </div>
            </div>

            {/* XP restante */}
            <div className="mb-5">
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-zinc-600">XP restante no level atual</label>
              <div className="mb-3 flex gap-2">
                {(['xp', 'pct'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className="flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition"
                    style={{
                      background: mode === m ? PURPLE : 'rgba(255,255,255,0.04)',
                      color: mode === m ? '#000' : '#6b7280',
                      border: mode === m ? 'none' : `1px solid ${BORDER}`,
                    }}>
                    {m === 'xp' ? 'XP (Valor)' : 'XP (%)'}
                  </button>
                ))}
              </div>
              {mode === 'xp' ? (
                <div>
                  <input type="number" value={xpExact} min={1}
                    onChange={e => setXpExact(Number(e.target.value))}
                    className={inputCls} style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.4)')}
                    onBlur={e  => (e.target.style.borderColor = BORDER)} />
                  {xpPreviewPct && (
                    <p className="mt-1.5 text-[11px] text-zinc-600">
                      ≈ {xpPreviewPct}% do level {levelFrom} · total: {totalLevelXp.toLocaleString('pt-BR')} XP
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={100} value={pct}
                      onChange={e => setPct(Number(e.target.value))}
                      className="calc-range flex-1" />
                    <span className="min-w-[44px] text-right text-sm font-black" style={{ color: PURPLE }}>{pct}%</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-zinc-600">Selecione a % referente a quanto falta para o próximo level.</p>
                </div>
              )}
            </div>

            {/* Raw XP + horas */}
            <div className="mb-5 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-zinc-600">Raw XP/hora</label>
                <input type="number" value={rawKK} min={0.01} step={0.1}
                  onChange={e => setRawKK(Number(e.target.value))}
                  className={inputCls} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.4)')}
                  onBlur={e  => (e.target.style.borderColor = BORDER)} />
                <p className="mt-1.5 text-[11px] text-zinc-600">Ex: 5 = 5kk/h · 5.5 = 5.5kk/h</p>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-zinc-600">Horas por dia</label>
                <input type="number" value={hSess} min={0.5} max={MAX_SESS} step={0.5}
                  onChange={e => setHSess(Math.min(MAX_SESS, Math.max(0.5, Number(e.target.value))))}
                  className={inputCls} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.4)')}
                  onBlur={e  => (e.target.style.borderColor = BORDER)} />
                <p className="mt-1.5 text-[11px] text-zinc-600">Limitado a 3h (duração da stamina)</p>
              </div>
            </div>

            {/* Checkboxes + multiplicador */}
            <div className="mb-5 flex flex-col gap-2">
              <Checkbox checked={hasStam}  onChange={() => setHasStam(!hasStam)}   label="Stamina bonus" sub="Multiplicador 1.5x nas primeiras 3h" />
              <Checkbox checked={hasStore} onChange={() => setHasStore(!hasStore)} label="Boosts" sub="Store boost +50%" />
              <div className="flex flex-wrap items-center gap-2 rounded-xl px-4 py-3"
                style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-[11px] text-zinc-500">Multiplicador para level {levelFrom}:</span>
                <span className="rounded-full px-3 py-0.5 text-[11px] font-semibold"
                  style={{ background: 'rgba(167,139,250,0.12)', color: PURPLE }}>
                  {multLabel}
                </span>
              </div>
            </div>

            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

            <button onClick={calcular}
              className="w-full rounded-xl py-3 text-sm font-black text-black transition hover:brightness-110 active:scale-[0.98]"
              style={{ background: PURPLE }}>
              Calcular
            </button>
          </div>

          {/* ── Results card ── */}
          {result && (
            <div className="mt-4 rounded-2xl p-5" style={{ border: `1px solid ${BORDER}`, background: CARD }}>

              {/* 4 stat cards */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                {/* tempo */}
                <div className="rounded-xl p-4" style={{ border: `1px solid rgba(167,139,250,0.25)`, background: 'rgba(167,139,250,0.08)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Tempo estimado</p>
                  <p className="mt-1.5 text-2xl font-black text-white">{fH(result.totalH)}</p>
                </div>
                {/* total */}
                <div className="rounded-xl p-4" style={{ border: `1px solid rgba(167,139,250,0.25)`, background: 'rgba(167,139,250,0.08)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Total</p>
                  <p className="mt-1.5 text-2xl font-black text-white">{fDays(result.totalH)}</p>
                </div>
                {/* horas */}
                <div className="rounded-xl p-4" style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Total de horas</p>
                  <p className="mt-1.5 text-2xl font-black text-white">{Math.ceil(result.totalH)}h</p>
                  <p className="mt-1 text-[11px] text-zinc-600">{result.totalSess} sessões de {hSess}h</p>
                </div>
                {/* valor */}
                {(() => {
                  const hoursRounded = Math.ceil(result.totalH);
                  const hourRate  = hoursRounded <= 14 ? 16 : 14;
                  const totalPrice = hoursRounded * hourRate;
                  return (
                    <div className="rounded-xl p-4" style={{ border: `1px solid rgba(52,211,153,0.25)`, background: 'rgba(52,211,153,0.07)' }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Valor estimado</p>
                      <p className="mt-1.5 text-2xl font-black text-white">R$ {totalPrice.toLocaleString('pt-BR')}</p>
                      <p className="mt-1 text-[11px] text-zinc-600">R$ {hourRate}/h · {hoursRounded}h {hoursRounded <= 14 ? '(até 14h)' : '(acima de 14h)'}</p>
                    </div>
                  );
                })()}
              </div>

              {/* nota */}
              {hasStore ? (
                <div className="mb-4 rounded-xl p-3 text-[11px]"
                  style={{ border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(96,165,250,0.06)', color: '#93c5fd' }}>
                  Valores aproximados in game, podendo haver divergência nos horários.
                </div>
              ) : (
                <div className="mb-4 rounded-xl p-3 text-[11px]"
                  style={{ border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.06)', color: '#fcd34d' }}>
                  Cálculo conservador. Ative os toggles acima para ficar mais fiel ao tempo de jogo. O tempo real pode variar conforme vocação, set, disponibilidade das hunts, raw/hora e players online.
                </div>
              )}

              {/* breakdown */}
              {result.breakdown.length > 1 && (
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Detalhamento por faixa</p>
                  <div className="flex flex-col gap-1.5">
                    {result.breakdown.map((s, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl px-4 py-2.5"
                        style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.02)' }}>
                        <span className="text-[12px] text-zinc-400">{s.label}</span>
                        <span className="text-[12px] font-semibold text-white">
                          {fH(s.h)}{' '}
                          <span className="text-[11px] font-normal text-zinc-600">({fkk(s.xp)})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-zinc-700">
            Cálculo baseado nos rates do RubinOT · XP base do Tibia Global
          </p>
        </div>
      </main>
    </>
  );
}
