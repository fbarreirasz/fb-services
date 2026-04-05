'use client';

import { useState, useEffect } from 'react';

// ─── helpers ────────────────────────────────────────────────
function parseNum(s: string): number {
  return parseInt(s.replace(/[,.\s]/g, '')) || 0;
}
function fNum(n: number): string {
  return Math.abs(n).toLocaleString('pt-BR');
}

// ─── types ───────────────────────────────────────────────────
type Member  = { name: string; loot: number; supplies: number; balance: number };
type Transfer = { from: string; to: string; amount: number };
type Session  = {
  from: string; to: string; duration: string;
  totalLoot: number; totalSupplies: number; totalBalance: number;
  members: Member[]; transfers: Transfer[]; profitPerPerson: number;
};

// ─── parser ──────────────────────────────────────────────────
function parseSession(raw: string): Session | null {
  if (!raw.trim()) return null;
  const lines = raw.split('\n').filter(l => l !== '');

  let sessionFrom = '', sessionTo = '', duration = '';
  let totalLoot = 0, totalSupplies = 0, totalBalance = 0;
  const members: Member[] = [];

  let i = 0;
  while (i < lines.length) {
    const raw_line = lines[i];
    const trimmed  = raw_line.trim();
    const isIndented = /^\s+/.test(raw_line);

    if (!isIndented) {
      const sm = trimmed.match(/Session data:\s*From (.+?) to (.+)/i);
      if (sm) { sessionFrom = sm[1].trim(); sessionTo = sm[2].trim(); }
      const dm = trimmed.match(/^Session:\s*(.+)/i);
      if (dm) duration = dm[1].trim();
      if (trimmed.match(/^Loot:\s/i) && !trimmed.match(/^Loot Type/i))
        totalLoot = parseNum(trimmed.replace(/^Loot:\s*/i, ''));
      if (trimmed.match(/^Supplies:\s/i))
        totalSupplies = parseNum(trimmed.replace(/^Supplies:\s*/i, ''));
      if (trimmed.match(/^Balance:\s/i)) {
        const val = trimmed.replace(/^Balance:\s*/i, '').trim();
        totalBalance = (val.startsWith('-') ? -1 : 1) * parseNum(val.replace('-', ''));
      }
      const isKV = trimmed.includes(':') && !trimmed.match(/^[A-Za-z'][A-Za-z'\s]*\s*(\(Leader\))?\s*$/);
      if (!isKV && trimmed.match(/^[A-Za-z']/)) {
        const memberName = trimmed.replace(/\s*\(Leader\)\s*$/, '').trim();
        let mLoot = 0, mSupplies = 0, mBalance = 0;
        let j = i + 1;
        while (j < lines.length && /^\s+/.test(lines[j])) {
          const ml = lines[j].trim();
          if (ml.match(/^Loot:\s/i))     mLoot     = parseNum(ml.replace(/^Loot:\s*/i, ''));
          if (ml.match(/^Supplies:\s/i)) mSupplies = parseNum(ml.replace(/^Supplies:\s*/i, ''));
          if (ml.match(/^Balance:\s/i)) {
            const val = ml.replace(/^Balance:\s*/i, '').trim();
            mBalance = (val.startsWith('-') ? -1 : 1) * parseNum(val.replace('-', ''));
          }
          j++;
        }
        if (memberName.length > 1 && !['Session','Loot','Supplies','Balance'].includes(memberName))
          members.push({ name: memberName, loot: mLoot, supplies: mSupplies, balance: mBalance });
        i = j; continue;
      }
    }
    i++;
  }

  if (members.length === 0) return null;
  const profitPerPerson = Math.floor(totalBalance / members.length);
  const avg = profitPerPerson;

  const givers    = members.map(m => ({ name: m.name, diff: m.balance - avg   })).filter(d => d.diff > 0).sort((a,b) => b.diff-a.diff).map(d => ({...d}));
  const receivers = members.map(m => ({ name: m.name, diff: avg   - m.balance })).filter(d => d.diff > 0).sort((a,b) => b.diff-a.diff).map(d => ({...d}));

  const transfers: Transfer[] = [];
  let gi = 0, ri = 0;
  while (gi < givers.length && ri < receivers.length) {
    const amount = Math.min(givers[gi].diff, receivers[ri].diff);
    if (amount > 0) transfers.push({ from: givers[gi].name, to: receivers[ri].name, amount });
    givers[gi].diff -= amount; receivers[ri].diff -= amount;
    if (givers[gi].diff <= 0) gi++;
    if (receivers[ri].diff <= 0) ri++;
  }

  return { from: sessionFrom, to: sessionTo, duration, totalLoot, totalSupplies, totalBalance, members, transfers, profitPerPerson };
}

// ─── design tokens — idênticos ao skills ────────────────────
const BG     = '#111118';
const CARD   = '#1a1a24';
const BORDER = 'rgba(255,255,255,0.07)';
const PURPLE = '#a78bfa';

// ─── CopyBtn ─────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={copy}
      title={`Copiar: ${text}`}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs transition"
      style={{
        border: copied ? '1px solid rgba(167,139,250,0.5)' : `1px solid ${BORDER}`,
        background: copied ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
        color: copied ? PURPLE : '#6b7280',
      }}>
      {copied
        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
    </button>
  );
}

// ─── page ─────────────────────────────────────────────────────
export default function LootSplitPage() {
  const [log, setLog] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!log.trim()) { setSession(null); return; }
    const result = parseSession(log);
    if (result) setSession(result);
  }, [log]);

  function clear() { setLog(''); setSession(null); }

  const isProfit = (session?.profitPerPerson ?? 0) >= 0;

  return (
    <main className="relative min-h-screen text-white" style={{ background: BG }}>

      {/* glow — igual ao skills */}
      <div className="pointer-events-none fixed inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10">

        {/* ── Header — cópia exata do skills ── */}
        <div className="mb-8 text-center">
          <button onClick={() => (window.location.href = '/ferramentas')}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-500 transition hover:text-white"
            style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)' }}>
            ← Ferramentas
          </button>
          <p className="text-xs uppercase tracking-[0.4em]" style={{ color: 'rgba(167,139,250,0.6)' }}>FB Services</p>
          <h1 className="mt-1 text-3xl font-black text-white">
            Divisor de <span style={{ color: PURPLE }}>Loot</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Cole o log da sua sessão de hunt para calcular automaticamente as transferências de loot.
          </p>
        </div>

        {/* ── Two-column grid — mesmo padrão do skills ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* LEFT — Party Log */}
          <div className="flex flex-col gap-4 rounded-2xl p-5"
            style={{ border: `1px solid ${BORDER}`, background: CARD }}>

            {/* card header */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                📋 Party Log
              </p>
              {log && (
                <button onClick={clear}
                  className="flex items-center gap-1.5 text-xs transition hover:opacity-80"
                  style={{ color: PURPLE }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
                  </svg>
                  Limpar Sessão
                </button>
              )}
            </div>

            {/* textarea — mesmo estilo dos inputs do skills */}
            <textarea
              value={log}
              onChange={e => setLog(e.target.value)}
              rows={20}
              placeholder={"Session data: From 2026-4-4, 11:21:07 to 2026-4-4, 13:44:36\nSession: 01:23h\nLoot: 624,317\nSupplies: 566,829\nBalance: 57,488\nPersonagem1 (Leader)\n    Loot: 349,363\n    Supplies: 98,318\n    Balance: 251,045\n..."}
              className="w-full resize-none rounded-xl font-mono text-xs text-zinc-300 outline-none placeholder:text-zinc-700"
              style={{
                border: `1px solid rgba(167,139,250,0.2)`,
                background: '#0d0d14',
                padding: '12px',
                flex: 1,
              }}
              onFocus={e  => (e.target.style.borderColor = 'rgba(167,139,250,0.4)')}
              onBlur={e   => (e.target.style.borderColor = 'rgba(167,139,250,0.2)')}
            />
          </div>

          {/* RIGHT — Resumo */}
          <div className="flex flex-col gap-4 rounded-2xl p-5"
            style={{ border: `1px solid ${BORDER}`, background: CARD }}>

            {/* card header */}
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              💰 Resumo da Sessão
            </p>

            {!session ? (
              <div className="flex flex-1 items-center justify-center py-24 text-sm text-zinc-700">
                Cole o log ao lado para ver o resultado
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-3">

                {/* session info bar — mesma estrutura de info do skills */}
                <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs"
                  style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>
                  <span className="font-bold text-zinc-400">SESSION:</span>
                  <span className="truncate text-zinc-500">From {session.from} to {session.to}</span>
                  {session.duration && (
                    <span className="ml-auto shrink-0 font-bold" style={{ color: PURPLE }}>
                      | {session.duration}
                    </span>
                  )}
                </div>

                {/* ── Transfers ── */}
                {session.transfers.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                      Transferências Necessárias
                    </p>

                    {session.transfers.map((t, i) => (
                      <div key={i}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:brightness-110"
                        style={{ border: `1px solid ${BORDER}`, background: '#0d0d14' }}>

                        {/* FROM */}
                        <div className="flex w-[32%] items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', color: PURPLE }}>
                            ←
                          </div>
                          <span className="truncate text-sm font-medium text-white">{t.from}</span>
                        </div>

                        {/* AMOUNT badge */}
                        <div className="flex flex-1 items-center justify-center">
                          <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-white"
                            style={{ background: 'rgba(167,139,250,0.18)', border: '1px solid rgba(167,139,250,0.25)' }}>
                            🪙 {fNum(t.amount)}
                          </span>
                        </div>

                        {/* TO */}
                        <div className="flex w-[28%] items-center justify-end gap-2">
                          <span className="truncate text-right text-sm font-medium text-white">{t.to}</span>
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
                            →
                          </div>
                        </div>

                        <CopyBtn text={`transfer ${t.amount} to ${t.to}`} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex-1" />

                {/* ── Bottom bar — igual ao card de duração do skills ── */}
                <div className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ border: `1px solid rgba(167,139,250,0.2)`, background: 'rgba(167,139,250,0.06)' }}>

                  <span className="flex items-center gap-2 text-sm text-zinc-400">
                    👥 Jogadores:
                    <span className="font-black text-white">{session.members.length}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                      Profit Individual
                    </span>
                    <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-black"
                      style={{
                        background: isProfit ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        border: `1px solid ${isProfit ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                        color:  isProfit ? '#4ade80' : '#f87171',
                      }}>
                      🪙 {fNum(session.profitPerPerson)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">
          Loot Splitter · FB Services · RubinOT
        </p>
      </div>
    </main>
  );
}
