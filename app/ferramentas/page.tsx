'use client';

const TOOLS = [
  {
    id: 'hunt-finder',
    label: 'Hunt Finder',
    desc: 'Encontre as melhores hunts para o seu personagem e vocação',
    icon: '🗺️',
    href: '/ferramentas/hunt-finder',
    ready: false,
  },
  {
    id: 'calculadora-xp',
    label: 'Calculadora de Experiência',
    desc: 'Estime o tempo e custo para atingir seu level desejado',
    icon: '⚔️',
    href: '/calculadora',
    ready: true,
  },
  {
    id: 'imbuimentos',
    label: 'Imbuimentos',
    desc: 'Descubra a maneira mais barata de fazer seus imbuimentos',
    icon: '💎',
    href: '/ferramentas/imbuimentos',
    ready: false,
  },
  {
    id: 'forja',
    label: 'Exaltation Forge',
    desc: 'Simule cenários perfeitos ou calcule a média real de gastos com as taxas de falha do Tibia.',
    icon: '�',
    href: '/ferramentas/forja',
    ready: false,
  },
  {
    id: 'skills',
    label: 'Calculadora de Skills',
    desc: 'Descubra quantas horas de treino para avançar suas skills',
    icon: '🏋️',
    href: '/ferramentas/skills',
    ready: false,
  },
  {
    id: 'bounty-tasks',
    label: 'Calculadora de Bounty Tasks',
    desc: 'Identifique qual melhor dificuldade para suas hunts especificas',
    icon: '✨',
    href: '/ferramentas/bounty-tasks',
    ready: false,
  },
  {
    id: 'loot-split',
    label: 'Divisor de Loot',
    desc: 'Cole o registro da hunt e divida o lucro com sua party',
    icon: '🪙',
    href: '/ferramentas/loot-split',
    ready: true,
  },
  {
    id: 'stamina',
    label: 'Calculadora de Stamina',
    desc: 'Saiba quanto tempo precisa para restaurar sua stamina',
    icon: '⏱️',
    href: '/ferramentas/stamina',
    ready: true,
  },
];

export default function FerramentasPage() {
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

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10 text-center">
          <button
            onClick={() => (window.location.href = '/')}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-zinc-400 backdrop-blur-md transition hover:text-white"
          >
            ← Voltar
          </button>
          <p className="text-xs uppercase tracking-[0.45em] text-violet-400">On RubinOT</p>
          <h1 className="mt-2 text-4xl font-black tracking-[0.1em] text-amber-400">Ferramentas</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
            Calculadoras e utilitários para facilitar sua evolução no servidor.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => (window.location.href = tool.href)}
              className="group relative flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-left backdrop-blur-md transition hover:border-violet-500/40 hover:bg-black/60"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                {tool.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{tool.label}</span>
                  {!tool.ready && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                      
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">{tool.desc}</p>
              </div>
              <svg className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" /></svg>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
