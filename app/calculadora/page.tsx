'use client';

const sliderCSS = `
  .calc-range { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 9999px; background: #1e293b; outline: none; }
  .calc-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #c026d3); cursor: pointer; border: 2px solid #0b1220; box-shadow: 0 0 8px rgba(124,58,237,0.5); }
  .calc-range::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #c026d3); cursor: pointer; border: 2px solid #0b1220; }
  .calc-range::-webkit-slider-runnable-track { height: 4px; border-radius: 9999px; }
`;

import { useState } from 'react';

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

function getRate(n: number) {
  return RATES.find((s) => n >= s.f && n <= s.t)?.r ?? 1.2;
}

function xpLvl(n: number) {
  return 50 * n * n - 50 * n + 100;
}

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

function fDays(h: number) {
  return h < 24 ? h.toFixed(1) + 'h total' : (h / 24).toFixed(1) + ' dias';
}

type BreakdownItem = { label: string; xp: number; h: number };

type CalcResult = {
  totalH: number;
  totalSess: number;
  totalXp: number;
  breakdown: BreakdownItem[];
};

const MAX_SESS = 3;

export default function CalculadoraPage() {
  const [levelFrom, setLevelFrom] = useState(958);
  const [levelTo, setLevelTo]     = useState(1000);
  const [mode, setMode]           = useState<'xp' | 'pct'>('xp');
  const [xpExact, setXpExact]     = useState(3239355);
  const [pct, setPct]             = useState(8);
  const [rawKK, setRawKK]         = useState(1);
  const [hSess, setHSess]         = useState(2);
  const [hasStam, setHasStam]     = useState(true);
  const [hasStore, setHasStore]   = useState(false);
  const [result, setResult]       = useState<CalcResult | null>(null);
  const [error, setError]         = useState('');

  const totalLevelXp = xpLvl(levelFrom);
  const xpPreviewPct = mode === 'xp' && xpExact > 0
    ? ((xpExact / totalLevelXp) * 100).toFixed(1)
    : null;

  const currentRate = getRate(levelFrom);

  // stamFrac: fração da sessão coberta pela stamina (renova todo dia)
  // hSess limitado a MAX_SESS, então stamFrac é sempre min(3, hSess) / hSess
  const stamFrac  = hasStam ? Math.min(MAX_SESS, hSess) / hSess : 0;
  const boostMult = hasStore ? 1.5 : 1.0;
  // Multiplicador efetivo médio por hora de sessão
  const sessEffMult = (1 + 0.5 * stamFrac) * boostMult;

  const multLabel = (() => {
    const stamH = Math.min(MAX_SESS, hSess);
    const parts: string[] = [`${currentRate}`];
    if (hasStore) parts.push('× 1.5');
    if (hasStam) {
      if (stamH === hSess) {
        parts.push('× 1.5');
      } else {
        parts.push(`× 1.5 (stam, ${stamH}h de ${hSess}h/sessão)`);
      }
    }
    return parts.join(' ') + ` = ${(currentRate * sessEffMult).toFixed(2)}x efetivo`;
  })();

  function calcular() {
    setError('');
    setResult(null);

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

    function timeForXP(xp: number, rate: number) {
      return xp / (rawPH * rate * sessEffMult);
    }

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

    const totalSess = Math.ceil(totalH / hSess);
    const totalXp = breakdown.reduce((a, b) => a + b.xp, 0);
    setResult({ totalH, totalSess, totalXp, breakdown });
  }

  return (
    <>
      <style>{sliderCSS}</style>
      <main className="relative min-h-screen overflow-hidden text-white"
        style={{
          background: 'radial-gradient(circle at 50% 14%, rgba(205,215,255,0.10) 0%, transparent 18%), radial-gradient(circle at 52% 18%, rgba(168,140,255,0.25) 0%, rgba(168,140,255,0.08) 14%, transparent 30%), linear-gradient(to bottom, #09101f 0%, #050b17 42%, #040814 72%, #030611 100%)',
        }}
      >
        <div className="orb-1 pointer-events-none absolute left-[-10%] top-[8%] z-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[80px]" />
        <div className="orb-2 pointer-events-none absolute right-[-8%] top-[5%] z-0 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/15 blur-[90px]" />
        <div className="orb-4 pointer-events-none absolute right-[15%] bottom-[10%] z-0 h-[24rem] w-[24rem] rounded-full bg-indigo-500/14 blur-[80px]" />

        <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
          <div className="mb-8 text-center">
            <button
              onClick={() => (window.location.href = '/')}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-zinc-400 backdrop-blur-md transition hover:text-white"
            >
              ← Voltar
            </button>
            <p className="text-xs uppercase tracking-[0.45em] text-violet-400">On RubinOT</p>
            <h1 className="mt-2 text-4xl font-black tracking-[0.1em] text-amber-400">
              Calculadora de XP
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
              Estime quantas horas de hunt você precisa para atingir seu level desejado no RubinOT.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">

            <div className="mb-5 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Level atual</label>
                <input type="number" value={levelFrom} min={1} max={1999}
                  onChange={(e) => setLevelFrom(Number(e.target.value))}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none focus:border-violet-500/50" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Level desejado</label>
                <input type="number" value={levelTo} min={2} max={2000}
                  onChange={(e) => setLevelTo(Number(e.target.value))}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none focus:border-violet-500/50" />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">XP restante no level atual</label>
              <div className="mb-2 flex gap-2">
                {(['xp', 'pct'] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold transition ${mode === m ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40' : 'border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                    {m === 'xp' ? 'XP (Valor)' : 'XP (Porcentagem)'}
                  </button>
                ))}
              </div>
              {mode === 'xp' ? (
                <div>
                  <input type="number" value={xpExact} min={1}
                    onChange={(e) => setXpExact(Number(e.target.value))}
                    className="h-11 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none focus:border-violet-500/50" />
                  {xpPreviewPct && (
                    <p className="mt-1 text-xs text-zinc-500">
                      ≈ {xpPreviewPct}% do level {levelFrom} · total do level: {totalLevelXp.toLocaleString('pt-BR')} XP
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={100} value={pct}
                      onChange={(e) => setPct(Number(e.target.value))}
                      className="calc-range flex-1" />
                    <span className="min-w-[44px] text-right text-sm text-white">{pct}%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">Selecione a % referente a quanto falta para o próximo level.</p>
                </div>
              )}
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Raw XP/hora</label>
                <input type="number" value={rawKK} min={0.01} step={0.1}
                  onChange={(e) => setRawKK(Number(e.target.value))}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none focus:border-violet-500/50" />
                <p className="mt-1 text-[11px] text-zinc-500">Ex: 5 = 5kk/h · 5.5 = 5.5kk/h</p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Horas por dia</label>
                <input type="number" value={hSess} min={0.5} max={MAX_SESS} step={0.5}
                  onChange={(e) => setHSess(Math.min(MAX_SESS, Math.max(0.5, Number(e.target.value))))}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none focus:border-violet-500/50" />
                <p className="mt-1 text-[11px] text-zinc-500">Limitado a 3h (duração da stamina)</p>
              </div>
            </div>

            <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
              <label className="flex cursor-pointer items-center gap-3">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${hasStam ? 'border-violet-500 bg-violet-600' : 'border-white/20 bg-white/5'}`}
                  onClick={() => setHasStam(!hasStam)} style={{cursor:'pointer'}}>
                  {hasStam && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-sm text-zinc-300">
                  Stamina bonus <span className="text-zinc-500">(1.5x)</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${hasStore ? 'border-amber-400 bg-amber-500' : 'border-white/20 bg-white/5'}`}
                  onClick={() => setHasStore(!hasStore)} style={{cursor:'pointer'}}>
                  {hasStore && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-sm text-zinc-300">
                  Boosts <span className="text-zinc-500">(+50%)</span>
                </span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-zinc-500">Multiplicador para level {levelFrom}:</span>
                <span className="rounded-full bg-violet-500/20 px-3 py-0.5 text-xs font-semibold text-violet-300">
                  {multLabel}
                </span>
              </div>
            </div>

            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

            <button onClick={calcular}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98]">
              Calcular
            </button>
          </div>

          {result && (
            <div className="mt-4 rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
              <div className="mb-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                  <p className="text-xs text-violet-300">Tempo estimado</p>
                  <p className="mt-1 text-2xl font-black text-white">{fH(result.totalH)}</p>
                </div>
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
                  <p className="text-xs text-violet-300">Total</p>
                  <p className="mt-1 text-2xl font-black text-white">{fDays(result.totalH)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-zinc-400">Total de horas</p>
                  <p className="mt-1 text-2xl font-black text-white">{Math.ceil(result.totalH)}h</p>
                  <p className="mt-1 text-[11px] text-zinc-500">{result.totalSess} sessões de {hSess}h</p>
                </div>
                {(() => {
                  const hoursRounded = Math.ceil(result.totalH);
                  const hourRate = hoursRounded <= 14 ? 16 : 14;
                  const totalPrice = hoursRounded * hourRate;
                  return (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <p className="text-xs text-emerald-300">Valor estimado</p>
                      <p className="mt-1 text-2xl font-black text-white">
                        R$ {totalPrice.toLocaleString('pt-BR')}
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-500">
                        R$ {hourRate}/h · {hoursRounded}h total {hoursRounded <= 14 ? '(até 14h)' : '(acima de 14h)'}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {hasStore ? (
                <div className="mb-5 rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3 text-xs text-sky-300">
                  Valores aproximados in game, podendo haver divergência nos horários.
                </div>
              ) : (
                <div className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                  Cálculo conservador. Ative os toggles acima para ficar mais fiel ao tempo de jogo. O tempo real e valores pode variar conforme vocação, set, disponibilidade das hunts, raw/hora e players online.
                </div>
              )}

              {result.breakdown.length > 1 && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Detalhamento por faixa
                  </p>
                  <div className="flex flex-col gap-1">
                    {result.breakdown.map((s, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-sm">
                        <span className="text-zinc-400">{s.label}</span>
                        <span className="font-semibold text-white">
                          {fH(s.h)}{' '}
                          <span className="text-xs font-normal text-zinc-500">({fkk(s.xp)})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="mt-6 text-center text-xs text-zinc-600">
            Cálculo baseado nos rates do RubinOT · XP base do Tibia Global
          </p>
        </div>
      </main>
    </>
  );
}
