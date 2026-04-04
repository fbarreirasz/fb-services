'use client';

import { useState } from 'react';

function parseGold(text: string): number {
  const lower = text.toLowerCase();
  let total = 0;
  const re = /(\d[\d.,]*)\s*(platinum|gold|gp|pp|kk|k)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(lower)) !== null) {
    const val = parseFloat(m[1].replace(',', '.'));
    const unit = m[2] || '';
    if (unit.includes('platinum') || unit === 'pp') total += val * 100;
    else if (unit === 'kk') total += val * 1000000;
    else if (unit === 'k') total += val * 1000;
    else total += val;
  }
  return Math.round(total);
}

function fGold(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + 'kk';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

type Member = { name: string; bankTransfer: number };
type Result = { name: string; receives: number; bankTransfer: number };

export default function LootSplitPage() {
  const [log, setLog] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<{
    loot: number;
    supplies: number;
    balance: number;
  } | null>(null);
  const [manualMembers, setManualMembers] = useState('');

  function parseLog() {
    setError('');
    setResults([]);
    setParsed(null);

    if (!log.trim()) { setError('Cole o log da hunt.'); return; }

    // Tenta extrair dados do log do Tibia
    const lootMatch = log.match(/loot of the session:\s*([\d,]+)/i);
    const suppliesMatch = log.match(/supplies of the session:\s*([\d,]+)/i);
    const balanceMatch = log.match(/balance of the session:\s*(-?[\d,]+)/i);

    // Extrai membros do log
    const memberMatches = [...log.matchAll(/(\w[\w\s]+)\s*:\s*([\d,]+)\s*xp/gi)];
    const logMembers: Member[] = memberMatches.map(m => ({
      name: m[1].trim(),
      bankTransfer: 0,
    }));

    // Se não achou membros no log, usa os manuais
    const finalMembers: Member[] = logMembers.length > 0
      ? logMembers
      : manualMembers.split('\n').map(n => n.trim()).filter(Boolean).map(name => ({ name, bankTransfer: 0 }));

    if (finalMembers.length === 0) {
      setError('Não foi possível detectar membros. Digite os nomes abaixo.');
      return;
    }

    const loot = lootMatch ? parseInt(lootMatch[1].replace(/,/g, '')) : parseGold(log);
    const supplies = suppliesMatch ? parseInt(suppliesMatch[1].replace(/,/g, '')) : 0;
    const balance = balanceMatch ? parseInt(balanceMatch[1].replace(/,/g, '')) : loot - supplies;

    if (balance === 0 && loot === 0) { setError('Não foi possível identificar valores no log. Verifique o formato.'); return; }

    const perPerson = Math.floor(balance / finalMembers.length);

    setMembers(finalMembers);
    setParsed({ loot, supplies, balance });
    setResults(finalMembers.map(m => ({
      name: m.name,
      receives: perPerson,
      bankTransfer: m.bankTransfer,
    })));
  }

  function updateTransfer(idx: number, val: number) {
    const updated = members.map((m, i) => i === idx ? { ...m, bankTransfer: val } : m);
    setMembers(updated);
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        background:
          'radial-gradient(circle at 50% 14%, rgba(205,215,255,0.10) 0%, transparent 18%), radial-gradient(circle at 52% 18%, rgba(168,140,255,0.25) 0%, rgba(168,140,255,0.08) 14%, transparent 30%), linear-gradient(to bottom, #09101f 0%, #050b17 42%, #040814 72%, #030611 100%)',
      }}
    >
      <div className="orb-1 pointer-events-none absolute left-[-10%] top-[8%] z-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[80px]" />
      <div className="orb-2 pointer-events-none absolute right-[-8%] top-[5%] z-0 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/15 blur-[90px]" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <button
            onClick={() => (window.location.href = '/ferramentas')}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-zinc-400 backdrop-blur-md transition hover:text-white"
          >
            ← Ferramentas
          </button>
          <p className="text-xs uppercase tracking-[0.45em] text-violet-400">On RubinOT</p>
          <h1 className="mt-2 text-4xl font-black tracking-[0.1em] text-amber-400">🪙 Loot Splitter</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
            Cole o log da hunt e divida o lucro igualmente entre os membros da party.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Log da hunt
            </label>
            <textarea
              value={log}
              onChange={(e) => setLog(e.target.value)}
              rows={8}
              placeholder="Cole aqui o log da sessão de hunt do Tibia/RubinOT..."
              className="w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 resize-none placeholder:text-zinc-600"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Membros da party <span className="text-zinc-600 normal-case font-normal">(um por linha — caso não detecte pelo log)</span>
            </label>
            <textarea
              value={manualMembers}
              onChange={(e) => setManualMembers(e.target.value)}
              rows={3}
              placeholder={"Personagem 1\nPersonagem 2\nPersonagem 3"}
              className="w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 resize-none placeholder:text-zinc-600"
            />
          </div>

          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

          <button
            onClick={parseLog}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-[0.98]"
          >
            Calcular divisão
          </button>
        </div>

        {parsed && results.length > 0 && (
          <div className="mt-4 rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
            {/* Resumo */}
            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-[11px] text-zinc-500">Loot</p>
                <p className="text-lg font-black text-white">{fGold(parsed.loot)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-[11px] text-zinc-500">Supplies</p>
                <p className="text-lg font-black text-white">{fGold(parsed.supplies)}</p>
              </div>
              <div className={`rounded-2xl border p-3 text-center ${parsed.balance >= 0 ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'}`}>
                <p className={`text-[11px] ${parsed.balance >= 0 ? 'text-green-300' : 'text-red-300'}`}>Balanço</p>
                <p className={`text-lg font-black ${parsed.balance >= 0 ? 'text-green-300' : 'text-red-400'}`}>
                  {parsed.balance < 0 ? '-' : ''}{fGold(Math.abs(parsed.balance))}
                </p>
              </div>
            </div>

            {/* Divisão */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Divisão por membro ({results.length} membros)
            </p>
            <div className="flex flex-col gap-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                  <div>
                    <p className="font-semibold text-white">{r.name}</p>
                    <p className="text-[11px] text-zinc-500">Recebe: {fGold(r.receives)} gold</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${r.receives >= 0 ? 'text-green-300' : 'text-red-400'}`}>
                      {r.receives < 0 ? '-' : '+'}{fGold(Math.abs(r.receives))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/5 bg-white/5 p-3 text-xs text-zinc-500">
              Divisão igualitária. Valores em gold coins do servidor.
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-zinc-600">
          Loot Splitter · FB Services · RubinOT
        </p>
      </div>
    </main>
  );
}
