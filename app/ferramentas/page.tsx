'use client';



const TOOLS = [
  {
    id: 'hunt-finder',
    label: 'Hunt Finder',
    desc: 'Encontre as melhores hunts para o seu personagem e vocação.',
    icon: 'https://wiki.rubinot.com/items/global/treasure-map.gif',
    href: '/ferramentas/hunt-finder',
  },
  {
    id: 'calculadora-xp',
    label: 'Calculadora de Experiência',
    desc: 'Estime o tempo e o custo para atingir o level desejado.',
    icon: 'https://static.wikia.nocookie.net/tibia/images/a/ab/XP_Boost.png/revision/latest/thumbnail/width/360/height/360?cb=20160831233052&path-prefix=en',
    href: '/calculadora',
  },
  {
    id: 'imbuimentos',
    label: 'Imbuiments',
    desc: 'Descubra a maneira mais barata de fazer seus imbuimentos.',
    icon: 'https://www.tibiawiki.com.br/images/thumb/a/a4/Imbuement_Home.gif/75px-Imbuement_Home.gif',
    href: '/ferramentas/imbuimentos',
  },
  {
    id: 'forja',
    label: 'Exaltation Forge',
    desc: 'Simule cenários perfeitos e calcule custos da forja no modo ideal.',
    icon: 'https://www.tibiawiki.com.br/images/5/5c/Exaltation_Forge_%28Objeto%29.gif',
    href: '/ferramentas/forja',
  },
  {
    id: 'skills',
    label: 'Calculadora de Skills',
    desc: 'Descubra quantas horas de treino são necessárias para evoluir suas skills.',
    icon: 'https://www.tibiawiki.com.br/images/7/7c/Lasting_Exercise_Bow.gif',
    href: '/ferramentas/skills',
  },
  {
    id: 'bounty-tasks',
    label: 'Calculadora de Bounty Tasks',
    desc: 'Identifique a melhor dificuldade para suas hunts específicas.',
    icon: 'https://www.tibiawiki.com.br/images/d/de/Bounty_Talisman.gif',
    href: '/ferramentas/bounty-tasks',
  },
  {
    id: 'loot-split',
    label: 'Loot Splitter',
    desc: 'Cole o registro da hunt e divida o lucro com sua party.',
    icon: 'https://www.exevopan.com/blog/thumbnails/goldPouch.png',
    href: '/ferramentas/loot-split',
  },
  {
    id: 'stamina',
    label: 'Calculadora de Stamina',
    desc: 'Saiba quanto tempo é preciso para restaurar sua stamina.',
    icon: 'https://www.tibiawiki.com.br/images/a/ad/Stamina_Extension.gif',
    href: '/ferramentas/stamina',
  },
];

const BG =
  'radial-gradient(circle at 50% 14%, rgba(205,215,255,0.10) 0%, transparent 18%), radial-gradient(circle at 52% 18%, rgba(127,140,255,0.22) 0%, rgba(127,140,255,0.08) 14%, transparent 30%), linear-gradient(to bottom, #09101f 0%, #050b17 42%, #040814 72%, #030611 100%)';

const CARD = '#1a1a24';
const BORDER = 'rgba(255,255,255,0.07)';
const SELECT = '#7f8cff';

export default function FerramentasPage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      style={{ background: BG }}
    >
      <div className="pointer-events-none absolute left-[-10%] top-[8%] z-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[80px]" />
      <div className="pointer-events-none absolute right-[-8%] top-[5%] z-0 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/15 blur-[90px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-12">
        <div className="mb-10 text-center">
          <button
            onClick={() => (window.location.href = '/')}
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-400 transition hover:text-white"
            style={{ border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)' }}
          >
            ← Voltar
          </button>
          <p className="text-xs uppercase tracking-[0.45em]" style={{ color: 'rgba(127,140,255,0.75)' }}>
            FB Services
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[0.08em] text-white">
            <span style={{ color: SELECT }}>Ferramentas</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
            Calculadoras e utilitários para facilitar sua evolução no servidor.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => (window.location.href = tool.href)}
              className="group relative flex min-h-[92px] items-center gap-4 rounded-2xl px-5 py-4 text-left transition"
              style={{
                border: `1px solid ${BORDER}`,
                background: CARD,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
              }}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <img src={tool.icon} alt="" className="h-8 w-8 object-contain" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="block text-[1.05rem] font-bold leading-tight text-white">
                  {tool.label}
                </span>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                  {tool.desc}
                </p>
              </div>

              <svg
                className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
