'use client';

export default function Page() {
  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        background:
          'radial-gradient(circle at 50% 14%, rgba(205,215,255,0.10) 0%, transparent 18%), radial-gradient(circle at 52% 18%, rgba(168,140,255,0.25) 0%, rgba(168,140,255,0.08) 14%, transparent 30%), linear-gradient(to bottom, #09101f 0%, #050b17 42%, #040814 72%, #030611 100%)',
      }}
    >
      <div className="orb-1 pointer-events-none absolute left-[-10%] top-[8%] z-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[80px]" />
      <div className="relative z-10 mx-auto max-w-lg px-4 py-12 text-center">
        <button
          onClick={() => (window.location.href = '/ferramentas')}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-zinc-400 backdrop-blur-md transition hover:text-white"
        >
          ← Ferramentas
        </button>
        <div className="text-6xl mb-4">💎</div>
        <h1 className="text-3xl font-black text-amber-400">Imbuimentos</h1>
        <p className="mt-4 text-zinc-400">Esta ferramenta está sendo desenvolvida.</p>
        <div className="mt-6 inline-block rounded-full bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-300">Em breve</div>
      </div>
    </main>
  );
}
