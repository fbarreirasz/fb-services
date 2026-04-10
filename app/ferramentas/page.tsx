'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';
import {
  ChevronDown, ChevronRight,
  House, CalendarDays, Shield, Star, Wrench, MessageCircle,
  User, History, LogOut,
} from 'lucide-react';

const TOOLS = [
  { id: 'hunt-finder',    label: 'Hunt Finder',                  desc: 'Encontre as melhores hunts para o seu personagem e vocação.',                       icon: 'https://wiki.rubinot.com/items/global/treasure-map.gif',                                                                                                                                     href: '/ferramentas/hunt-finder' },
  { id: 'calculadora-xp', label: 'Calculadora de Experiência',   desc: 'Estime o tempo e o custo para atingir o level desejado.',                            icon: 'https://static.wikia.nocookie.net/tibia/images/a/ab/XP_Boost.png/revision/latest/thumbnail/width/360/height/360?cb=20160831233052&path-prefix=en',                                  href: '/calculadora' },
  { id: 'imbuimentos',    label: 'Imbuiments',                   desc: 'Descubra a maneira mais barata de fazer seus imbuimentos.',                           icon: 'https://www.tibiawiki.com.br/images/thumb/a/a4/Imbuement_Home.gif/75px-Imbuement_Home.gif',                                                                                          href: '/ferramentas/imbuimentos' },
  { id: 'forja',          label: 'Exaltation Forge',             desc: 'Simule cenários perfeitos e calcule custos da forja no modo ideal.',                  icon: 'https://www.tibiawiki.com.br/images/5/5c/Exaltation_Forge_%28Objeto%29.gif',                                                                                                           href: '/ferramentas/forja' },
  { id: 'skills',         label: 'Calculadora de Skills',        desc: 'Descubra quantas horas de treino são necessárias para evoluir suas skills.',          icon: 'https://www.tibiawiki.com.br/images/7/7c/Lasting_Exercise_Bow.gif',                                                                                                                  href: '/ferramentas/skills' },
  { id: 'bounty-tasks',   label: 'Calculadora de Bounty Tasks',  desc: 'Identifique a melhor dificuldade para suas hunts específicas.',                       icon: 'https://www.tibiawiki.com.br/images/d/de/Bounty_Talisman.gif',                                                                                                                       href: '/ferramentas/bounty-tasks' },
  { id: 'loot-split',     label: 'Loot Splitter',                desc: 'Cole o registro da hunt e divida o lucro com sua party.',                             icon: 'https://www.exevopan.com/blog/thumbnails/goldPouch.png',                                                                                                                             href: '/ferramentas/loot-split' },
  { id: 'stamina',        label: 'Calculadora de Stamina',       desc: 'Saiba quanto tempo é preciso para restaurar sua stamina.',                            icon: 'https://www.tibiawiki.com.br/images/a/ad/Stamina_Extension.gif',                                                                                                                    href: '/ferramentas/stamina' },
];

const NAV_LINKS = [
  { id: 'inicio',      label: 'Início',           icon: House,         href: '/' },
  { id: 'agenda',      label: 'Agenda',            icon: CalendarDays,  href: '/?page=agenda' },
  { id: 'regras',      label: 'Termos de serviço', icon: Shield,        href: '/?page=regras' },
  { id: 'feedbacks',   label: 'Feedbacks',         icon: Star,          href: '/?page=feedbacks' },
  { id: 'ferramentas', label: 'Ferramentas',        icon: Wrench,        href: '/ferramentas' },
  { id: 'contato',     label: 'Contato',            icon: MessageCircle, href: 'https://wa.me/5519981587705?text=Olá!%20Vim%20através%20do%20seu%20site.' },
];

export default function FerramentasPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [menuOpen,     setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [userName,     setUserName]     = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setIsLoggedIn(!!s);
      setUserName(s?.user?.user_metadata?.full_name || s?.user?.user_metadata?.name || '');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setIsLoggedIn(!!s);
      setUserName(s?.user?.user_metadata?.full_name || s?.user?.user_metadata?.name || '');
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserName('');
    setUserMenuOpen(false);
  }

  // ── Tokens que mudam com o tema ──────────────────────────────────────────────
  const pageBg     = isDark
    ? 'linear-gradient(to bottom, #09101f 0%, #050b17 42%, #040814 72%, #030611 100%)'
    : 'linear-gradient(to bottom, #f0f2ff 0%, #e8eaf6 45%, #eceef8 100%)';

  const navBg      = isDark ? 'rgba(0,0,0,0.38)'        : 'rgba(255,255,255,0.70)';
  const navBorder  = isDark ? 'rgba(255,255,255,0.10)'   : 'rgba(0,0,0,0.10)';
  const navText    = isDark ? '#e4e4e7'                  : '#18181b';
  const dropBg     = isDark ? 'rgba(0,0,0,0.68)'        : 'rgba(255,255,255,0.96)';
  const dropBorder = isDark ? 'rgba(255,255,255,0.10)'   : 'rgba(0,0,0,0.09)';

  const card       = isDark ? '#1a1a24'                  : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)'   : 'rgba(0,0,0,0.08)';
  const cardShadow = isDark
    ? '0 2px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.02)'
    : '0 2px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)';

  const toolLabel  = isDark ? '#ffffff'                  : '#18181b';
  const toolDesc   = isDark ? '#71717a'                  : '#52525b';
  const accentClr  = isDark ? '#7f8cff'                  : '#4338ca';
  const subtitleCl = isDark ? 'rgba(127,140,255,0.75)'   : 'rgba(67,56,202,0.75)';
  const iconBg     = isDark ? 'rgba(255,255,255,0.05)'   : 'rgba(0,0,0,0.05)';
  const chevronClr = isDark ? '#3f3f46'                  : '#d4d4d8';

  // nav icon + item text helpers
  const iconCls = isDark
    ? 'bg-white/5 text-zinc-300 group-hover/item:bg-amber-400/10 group-hover/item:text-amber-100'
    : 'bg-black/5 text-zinc-500 group-hover/item:bg-amber-500/10 group-hover/item:text-amber-700';
  const itemTextCls = isDark
    ? 'text-zinc-200 group-hover/item:text-white'
    : 'text-zinc-700 group-hover/item:text-zinc-900';
  const chevronItemCls = isDark
    ? 'text-zinc-500 group-hover/item:translate-x-1 group-hover/item:text-amber-200'
    : 'text-zinc-400 group-hover/item:translate-x-1 group-hover/item:text-amber-600';
  const itemHovCls = isDark ? 'hover:bg-white/5' : 'hover:bg-black/4';

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: pageBg }}>
      {/* Orbs estáticos */}
      <div className={`pointer-events-none absolute left-[-10%] top-[8%] z-0 h-[28rem] w-[28rem] rounded-full blur-[80px] ${isDark ? 'bg-violet-600/20' : 'bg-violet-300/40'}`} />
      <div className={`pointer-events-none absolute right-[-8%] top-[5%] z-0 h-[30rem] w-[30rem] rounded-full blur-[90px] ${isDark ? 'bg-fuchsia-500/15' : 'bg-indigo-200/50'}`} />

      {/* ── MENU (top left) ── */}
      <div className="fixed left-2 top-2 z-50 sm:left-3 sm:top-3 md:left-4 md:top-4">
        <div className="relative">
          <button type="button"
            onClick={() => { setMenuOpen(p => !p); setUserMenuOpen(false); }}
            className="group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-md backdrop-blur-md transition hover:brightness-105"
            style={{ background: navBg, border: `1px solid ${navBorder}`, color: navText }}>
            Menu
            <ChevronDown className={`h-4 w-4 transition ${menuOpen ? 'rotate-180' : ''}`}
              style={{ color: menuOpen ? '#f59e0b' : undefined }} />
          </button>

          <div className={`absolute left-0 top-[calc(100%+12px)] z-20 w-[230px] rounded-[20px] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all duration-200
            ${menuOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}
            style={{ background: dropBg, border: `1px solid ${dropBorder}` }}>
            <div className="absolute -top-2 left-6 h-4 w-4 rotate-45"
              style={{ background: dropBg, borderLeft: `1px solid ${dropBorder}`, borderTop: `1px solid ${dropBorder}` }} />
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} type="button"
                    onClick={() => { setMenuOpen(false); window.location.href = item.href; }}
                    className={`group/item flex items-center justify-between rounded-[14px] border border-transparent px-3 py-2.5 text-left transition ${itemHovCls}`}
                    style={{ transitionDelay: menuOpen ? `${i * 20}ms` : '0ms' }}>
                    <span className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${iconCls}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={`font-medium transition ${itemTextCls}`}>{item.label}</span>
                    </span>
                    <ChevronRight className={`h-4 w-4 transition ${chevronItemCls}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── USER / LOGIN (top right) ── */}
      <div className="fixed right-2 top-2 z-50 sm:right-3 sm:top-3 md:right-4 md:top-4 flex items-center gap-2">
        <ThemeToggle />

        <div className="relative">
          {!isLoggedIn ? (
            <button type="button"
              onClick={() => { window.location.href = '/'; }}
              className="group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-md backdrop-blur-md transition hover:brightness-105"
              style={{ background: navBg, border: `1px solid ${navBorder}`, color: navText }}>
              <User className="h-4 w-4 opacity-60" />
              Login
              <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
          ) : (
            <>
              <button type="button"
                onClick={() => { setUserMenuOpen(p => !p); setMenuOpen(false); }}
                className="group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-md backdrop-blur-md transition hover:brightness-105"
                style={{ background: navBg, border: `1px solid ${navBorder}`, color: navText }}>
                <User className="h-4 w-4 opacity-60" />
                <span className="max-w-[88px] truncate">{userName || 'Usuário'}</span>
                <ChevronDown className={`h-4 w-4 transition ${userMenuOpen ? 'rotate-180' : 'opacity-50'}`}
                  style={{ color: userMenuOpen ? '#f59e0b' : undefined }} />
              </button>

              <div className={`absolute right-0 top-[calc(100%+12px)] z-20 w-[210px] rounded-[20px] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all duration-200
                ${userMenuOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}
                style={{ background: dropBg, border: `1px solid ${dropBorder}` }}>
                <div className="absolute -top-2 right-6 h-4 w-4 rotate-45"
                  style={{ background: dropBg, borderRight: `1px solid ${dropBorder}`, borderTop: `1px solid ${dropBorder}` }} />
                <div className="flex flex-col gap-1">
                  {[
                    { id: 'perfil',    label: 'Perfil',    icon: User,    href: '/?page=perfil' },
                    { id: 'historico', label: 'Histórico', icon: History, href: '/?page=historico' },
                    { id: 'feedbacks', label: 'Feedbacks', icon: Star,    href: '/?page=feedbacks' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.id} type="button"
                        onClick={() => { setUserMenuOpen(false); window.location.href = item.href; }}
                        className={`group/item flex items-center justify-between rounded-[14px] border border-transparent px-3 py-2.5 text-left transition ${itemHovCls}`}>
                        <span className="flex items-center gap-3">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${iconCls}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className={`font-medium transition ${itemTextCls}`}>{item.label}</span>
                        </span>
                        <ChevronRight className={`h-4 w-4 transition ${chevronItemCls}`} />
                      </button>
                    );
                  })}

                  {/* Deslogar */}
                  <button type="button" onClick={handleLogout}
                    className="group/item flex items-center justify-between rounded-[14px] border border-transparent px-3 py-2.5 text-left transition hover:bg-red-500/8">
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-red-400 transition group-hover/item:bg-red-400/10">
                        <LogOut className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-red-400 group-hover/item:text-red-300">Deslogar</span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-red-300/50 transition group-hover/item:translate-x-1 group-hover/item:text-red-300" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-12 pt-24">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.45em]" style={{ color: subtitleCl }}>
            FB Services
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[0.08em]" style={{ color: isDark ? '#ffffff' : '#18181b' }}>
            <span style={{ color: accentClr }}>Ferramentas</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: toolDesc }}>
            Calculadoras e utilitários para facilitar sua evolução no servidor.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <button key={tool.id}
              onClick={() => (window.location.href = tool.href)}
              className="group relative flex min-h-[92px] items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-200 hover:-translate-y-[2px]"
              style={{ border: `1px solid ${cardBorder}`, background: card, boxShadow: cardShadow }}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                style={{ background: iconBg }}>
                <img src={tool.icon} alt="" className="h-8 w-8 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[1.05rem] font-bold leading-tight" style={{ color: toolLabel }}>
                  {tool.label}
                </span>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: toolDesc }}>
                  {tool.desc}
                </p>
              </div>
              <svg className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                style={{ color: chevronClr }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
