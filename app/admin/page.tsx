'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Order = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone?: string | null;
  service_type: string | null;
  payment_method: string | null;
  total_brl: number | null;
  status: string | null;
  proof_url: string | null;
  created_at: string | null;
};

type StatusFilter = 'all' | 'pending' | 'approved' | 'completed' | 'rejected';
type PaymentFilter = 'all' | 'pix' | 'rc' | 'cartao';

const MONTH_OPTIONS = [
  { value: 'all', label: 'Todos os meses' },
  { value: '0', label: 'Janeiro' },
  { value: '1', label: 'Fevereiro' },
  { value: '2', label: 'Março' },
  { value: '3', label: 'Abril' },
  { value: '4', label: 'Maio' },
  { value: '5', label: 'Junho' },
  { value: '6', label: 'Julho' },
  { value: '7', label: 'Agosto' },
  { value: '8', label: 'Setembro' },
  { value: '9', label: 'Outubro' },
  { value: '10', label: 'Novembro' },
  { value: '11', label: 'Dezembro' },
];

const monthNames = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getCalendarCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}


function getStatusClasses(status: string | null) {
  switch (status) {
    case 'approved': return 'border border-sky-400/20 bg-sky-500/15 text-sky-300';
    case 'completed': return 'border border-emerald-400/20 bg-emerald-500/15 text-emerald-300';
    case 'rejected': return 'border border-red-400/20 bg-red-500/15 text-red-300';
    case 'pending':
    default: return 'border border-amber-400/20 bg-amber-500/15 text-amber-300';
  }
}

function formatStatus(status: string | null) {
  switch (status) {
    case 'approved': return 'Aprovado';
    case 'completed': return 'Finalizado';
    case 'rejected': return 'Rejeitado';
    case 'pending':
    default: return 'Pendente';
  }
}

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR');
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function normalizePaymentMethod(value: string | null): PaymentFilter | 'other' {
  if (!value) return 'other';
  const normalized = value.toLowerCase().trim();
  if (normalized.includes('pix')) return 'pix';
  if (normalized.includes('rubini') || normalized === 'rc') return 'rc';
  if (normalized.includes('cart')) return 'cartao';
  return 'other';
}

export default function AdminPage() {
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { window.location.href = '/login'; return; }
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
      if (!profile?.is_admin) { window.location.href = '/'; return; }
      setIsAdmin(true);
      setLoadingAuth(false);
    }
    checkAdmin();
  }, []);

const ALL_ADMIN_HOURS = [
  '07:00', '08:00', '09:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '19:00', '20:00', '21:00', '22:00', '23:00',
  '00:00', '01:00', '02:00',
];
  
const ADMIN_MORNING_BLOCK = ['07:00', '08:00', '09:00'];
const ADMIN_AFTERNOON_BLOCK = ['13:00', '14:00', '15:00', '16:00', '17:00'];

const ADMIN_NIGHT_WEEKDAY = ['19:00', '20:00', '21:00', '22:00', '23:00', '00:00'];
const ADMIN_NIGHT_FRIDAY = ['19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00'];
const ADMIN_NIGHT_SATURDAY = ['21:00', '22:00', '23:00', '00:00', '01:00', '02:00'];
const ADMIN_NIGHT_SUNDAY = ['21:00', '22:00', '23:00'];

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [siteSettings, setSiteSettings] = useState({ rc_rate_per_1000: 82, rc_block_size: 25 });
  const [savingSettings, setSavingSettings] = useState(false);
  const [blockedSlots, setBlockedSlots] = useState<{id: string; date: string; hour: string}[]>([]);
  const [filterYear, setFilterYear] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterDay, setFilterDay] = useState('all');
  const [adminMonth, setAdminMonth] = useState(new Date().getMonth());
const adminYear = new Date().getFullYear();



const [selectedBlockDates, setSelectedBlockDates] = useState<string[]>([]);
const [selectedBlockHours, setSelectedBlockHours] = useState<string[]>([]);

const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
const [isHourPickerOpen, setIsHourPickerOpen] = useState(false);
  const [savingSlot, setSavingSlot] = useState(false);
  const [finalizedOrderId, setFinalizedOrderId] = useState<string | null>(null);
  const [finalizedOrder, setFinalizedOrder] = useState<Order | null>(null);


  const blockedYears = useMemo(() => Array.from(new Set(blockedSlots.map((slot) => slot.date.split('-')[0]))).sort((a, b) => Number(b) - Number(a)), [blockedSlots]);

  const blockedMonths = useMemo(() => Array.from(new Set(blockedSlots
    .filter((slot) => filterYear === 'all' ? true : slot.date.split('-')[0] === filterYear)
    .map((slot) => slot.date.split('-')[1]))).sort((a, b) => Number(a) - Number(b)), [blockedSlots, filterYear]);

  const blockedDays = useMemo(() => Array.from(new Set(blockedSlots
    .filter((slot) => {
      const [year, month] = slot.date.split('-');
      const okYear = filterYear === 'all' ? true : year === filterYear;
      const okMonth = filterMonth === 'all' ? true : month === filterMonth;
      return okYear && okMonth;
    })
    .map((slot) => slot.date.split('-')[2]))).sort((a, b) => Number(a) - Number(b)), [blockedSlots, filterYear, filterMonth]);

  const filteredBlockedSlots = useMemo(() => blockedSlots.filter((slot) => {
    const [year, month, day] = slot.date.split('-');
    const okYear = filterYear === 'all' ? true : year === filterYear;
    const okMonth = filterMonth === 'all' ? true : month === filterMonth;
    const okDay = filterDay === 'all' ? true : day === filterDay;
    return okYear && okMonth && okDay;
  }), [blockedSlots, filterYear, filterMonth, filterDay]);

  async function fetchBlockedSlots() {
  const pageSize = 1000;
  let from = 0;
  let allRows: { id: string; date: string; hour: string }[] = [];

  while (true) {
    const { data, error } = await supabase
      .from('blocked_slots')
      .select('id, date, hour')
      .order('date', { ascending: false })
      .order('hour', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('Erro ao buscar blocked_slots:', error);
      break;
    }

    if (!data || data.length === 0) break;

    allRows = [...allRows, ...data];

    if (data.length < pageSize) break;

    from += pageSize;
  }

  setBlockedSlots(allRows);
}

  async function addBlockedSlotsBatch() {
  if (selectedBlockDates.length === 0 || selectedBlockHours.length === 0) return;

  setSavingSlot(true);

  const rows = selectedBlockDates.flatMap((date) =>
    selectedBlockHours.map((hour) => ({
      date,
      hour,
      reason: 'Bloqueado pelo admin',
    }))
  );

  const { error } = await supabase
    .from('blocked_slots')
    .upsert(rows, { onConflict: 'date,hour', ignoreDuplicates: true });

  setSavingSlot(false);

  if (error) {
    alert(`Erro: ${error.message}`);
    return;
  }

  setSelectedBlockDates([]);
  setSelectedBlockHours([]);
  setIsDatePickerOpen(false);
  setIsHourPickerOpen(false);
  fetchBlockedSlots();
}

function toggleAdminDate(dateKey: string) {
  setSelectedBlockDates((prev) =>
    prev.includes(dateKey)
      ? prev.filter((item) => item !== dateKey)
      : [...prev, dateKey].sort()
  );
}

function toggleAdminHour(hour: string) {
  setSelectedBlockHours((prev) =>
    prev.includes(hour)
      ? prev.filter((item) => item !== hour)
      : [...prev, hour].sort()
  );
}


  async function removeBlockedSlot(id: string) {
    await supabase.from('blocked_slots').delete().eq('id', id);
    fetchBlockedSlots();
  }

  function buildWhatsappReviewLink(order: Order): string | null {
    const phone = order.customer_phone?.replace(/\D/g, '');
    if (!phone) return null;
    const msg = encodeURIComponent(
      `Olá ${order.customer_name}! Seu service *${order.service_type}* foi finalizado com sucesso! 🎮\n\nFicou satisfeito? Sua avaliação é muito importante para nós!\n\n👉 fbservices.vercel.app\n\nAcessa o site, vai em Feedbacks e deixa sua avaliação. Obrigado pela confiança! 🙏`
    );
    return `https://wa.me/55${phone}?text=${msg}`;
  }

function getAdminHoursForDate(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dow = date.getDay();

  if (dow === 0) return [...ADMIN_NIGHT_SUNDAY];
  if (dow === 6) return [...ADMIN_NIGHT_SATURDAY];
  if (dow === 5) return [...ADMIN_MORNING_BLOCK, ...ADMIN_AFTERNOON_BLOCK, ...ADMIN_NIGHT_FRIDAY];

  return [...ADMIN_MORNING_BLOCK, ...ADMIN_AFTERNOON_BLOCK, ...ADMIN_NIGHT_WEEKDAY];
}

function getSharedAdminHours(dates: string[]) {
  if (dates.length === 0) return [] as string[];
  return ALL_ADMIN_HOURS.filter((hour) =>
    dates.every((dateKey) => getAdminHoursForDate(dateKey).includes(hour))
  );
}

  async function fetchOrders() {
    setLoading(true);
    setAccessDenied(false);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) { setAccessDenied(true); setLoading(false); return; }
    const profileResponse = await supabase.from('profiles').select('id, email, is_admin').eq('id', session.user.id).single();
    const profile = profileResponse.data;
    const profileError = profileResponse.error;
    if (profileError || !profile?.is_admin) { setAccessDenied(true); setLoading(false); return; }
    const ordersResponse = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (ordersResponse.error) { console.error('Erro ao buscar pedidos:', ordersResponse.error); setLoading(false); return; }
    setOrders((ordersResponse.data as Order[]) || []);
    setLoading(false);
  }

  async function fetchSiteSettings() {
    const { data, error } = await supabase.from('site_settings').select('rc_rate_per_1000, rc_block_size').eq('id', 1).single();
    if (error) { console.error('Erro ao buscar site_settings:', error); return; }
    if (data) { setSiteSettings({ rc_rate_per_1000: Number(data.rc_rate_per_1000 || 82), rc_block_size: Number(data.rc_block_size || 25) }); }
  }

  async function saveSiteSettings() {
    setSavingSettings(true);
    const { error } = await supabase.from('site_settings').update({ rc_rate_per_1000: Number(siteSettings.rc_rate_per_1000), rc_block_size: Number(siteSettings.rc_block_size), updated_at: new Date().toISOString() }).eq('id', 1);
    setSavingSettings(false);
    if (error) { console.error('Erro ao salvar site_settings:', error); alert(`Erro ao salvar configuração: ${error.message}`); return; }
    alert('Cotação atualizada com sucesso.');
  }

  async function updateStatus(id: string, status: 'approved' | 'completed' | 'rejected') {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) { console.error('Erro ao atualizar status:', error); alert(`Erro ao atualizar status: ${error.message}`); return; }
    if (status === 'completed') {
      const order = orders.find((o) => o.id === id) ?? null;
      setFinalizedOrderId(id);
      setFinalizedOrder(order);
    }
    fetchOrders();
  }

  useEffect(() => {
    fetchOrders();
    fetchSiteSettings();
    fetchBlockedSlots();
  }, []);

  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(orders.map((order) => {
      if (!order.created_at) return null;
      const date = new Date(order.created_at);
      if (Number.isNaN(date.getTime())) return null;
      return String(date.getFullYear());
    }).filter(Boolean))) as string[];
    uniqueYears.sort((a, b) => Number(b) - Number(a));
    return ['all', ...uniqueYears];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' ? true : order.status === statusFilter;
      const normalizedPayment = normalizePaymentMethod(order.payment_method);
      const matchesPayment = paymentFilter === 'all' ? true : normalizedPayment === paymentFilter;
      let matchesMonth = true;
      let matchesYear = true;
      if (order.created_at) {
        const date = new Date(order.created_at);
        if (!Number.isNaN(date.getTime())) {
          matchesMonth = selectedMonth === 'all' ? true : String(date.getMonth()) === selectedMonth;
          matchesYear = selectedYear === 'all' ? true : String(date.getFullYear()) === selectedYear;
        }
      }
      const matchesSearch = !normalizedSearch ||
        (order.customer_name || '').toLowerCase().includes(normalizedSearch) ||
        (order.customer_email || '').toLowerCase().includes(normalizedSearch) ||
        (order.service_type || '').toLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesPayment && matchesMonth && matchesYear && matchesSearch;
    });
  }, [orders, paymentFilter, search, selectedMonth, selectedYear, statusFilter]);

  const pendingCount = filteredOrders.filter((o) => o.status === 'pending').length;
  const approvedCount = filteredOrders.filter((o) => o.status === 'approved').length;
  const completedCount = filteredOrders.filter((o) => o.status === 'completed').length;
  const filteredRevenue = filteredOrders.reduce((acc, order) => acc + Number(order.total_brl || 0), 0);
  const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total_brl || 0), 0);
  const selectedYearRevenue = orders.filter((order) => {
    if (selectedYear === 'all') return true;
    if (!order.created_at) return false;
    const date = new Date(order.created_at);
    if (Number.isNaN(date.getTime())) return false;
    return String(date.getFullYear()) === selectedYear;
  }).reduce((acc, order) => acc + Number(order.total_brl || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050014] via-[#0a0225] to-[#020617] p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-purple-500/20 bg-black/30 p-6">Carregando...</div>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050014] via-[#0a0225] to-[#020617] p-6 text-white">
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <h1 className="text-3xl font-bold">Acesso negado</h1>
          <p className="mt-2 text-zinc-300">Você não tem permissão para acessar o painel admin.</p>
        </div>
      </div>
    );
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Verificando acesso...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050014] via-[#0a0225] to-[#020617] p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-900/40 to-black/40 p-6 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Painel Admin</h1>
              <p className="mt-1 text-sm text-purple-300">Controle total dos pedidos — FB Services</p>
            </div>
            <button onClick={fetchOrders} className="rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:opacity-90">
              Recarregar pedidos
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou serviço..." className="h-12 rounded-2xl border border-purple-500/20 bg-[#0b1220] px-4 text-sm text-white outline-none placeholder:text-zinc-500" />
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="h-12 rounded-2xl border border-purple-500/20 bg-[#0b1220] px-4 text-sm text-white outline-none">
              {years.map((year) => (<option key={year} value={year}>{year === 'all' ? 'Todos os anos' : year}</option>))}
            </select>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="h-12 rounded-2xl border border-purple-500/20 bg-[#0b1220] px-4 text-sm text-white outline-none">
              {MONTH_OPTIONS.map((month) => (<option key={month.value} value={month.value}>{month.label}</option>))}
            </select>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)} className="h-12 rounded-2xl border border-purple-500/20 bg-[#0b1220] px-4 text-sm text-white outline-none">
              <option value="all">Todos os pagamentos</option>
              <option value="pix">PIX</option>
              <option value="rc">RC</option>
              <option value="cartao">Cartão</option>
            </select>
          </div>

          <div className="mt-5 rounded-3xl border border-amber-400/20 bg-black/20 p-5">
            <h2 className="text-lg font-bold text-white">Configuração de Rubini Coins</h2>
            <p className="mt-1 text-sm text-zinc-300">Ajuste aqui a cotação usada no site para calcular o valor em RC.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-200">Cotação por 1000 RC</label>
                <input type="number" step="0.01" value={siteSettings.rc_rate_per_1000} onChange={(e) => setSiteSettings((prev) => ({ ...prev, rc_rate_per_1000: Number(e.target.value) }))} className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-200">Tamanho do bloco de RC</label>
                <input type="number" step="1" value={siteSettings.rc_block_size} onChange={(e) => setSiteSettings((prev) => ({ ...prev, rc_block_size: Number(e.target.value) }))} className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none" />
              </div>
            </div>
            <div className="mt-4">
              <button onClick={saveSiteSettings} disabled={savingSettings} className="rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-300 px-5 py-3 text-sm font-bold text-black shadow-md transition hover:brightness-105 disabled:opacity-60">
                {savingSettings ? 'Salvando...' : 'Salvar cotação RC'}
              </button>
            </div>
          </div>

          <div className="mt-4 max-h-[300px] overflow-y-auto pr-2 flex flex-wrap gap-2">
            {(['all', 'pending', 'approved', 'completed', 'rejected'] as StatusFilter[]).map((filter) => {
              const active = statusFilter === filter;
              return (
                <button key={filter} onClick={() => setStatusFilter(filter)} className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${active ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-black shadow-md' : 'border border-white/10 bg-white/10 text-white hover:bg-white/20'}`}>
                  {filter === 'all' ? 'Todos' : filter === 'pending' ? 'Pendentes' : filter === 'approved' ? 'Aprovados' : filter === 'completed' ? 'Finalizados' : 'Rejeitados'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 p-4">
            <p className="text-xs text-yellow-300">Pendentes</p>
            <h2 className="text-2xl font-bold">{pendingCount}</h2>
          </div>
          <div className="rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-400/20 to-sky-600/10 p-4">
            <p className="text-xs text-sky-300">Aprovados</p>
            <h2 className="text-2xl font-bold">{approvedCount}</h2>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 p-4">
            <p className="text-xs text-emerald-300">Finalizados</p>
            <h2 className="text-2xl font-bold">{completedCount}</h2>
          </div>
          <div className="rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-400/20 to-purple-600/10 p-4">
            <p className="text-xs text-purple-300">Faturamento filtrado</p>
            <h2 className="text-2xl font-bold">{formatCurrency(filteredRevenue)}</h2>
          </div>
          <div className="rounded-2xl border border-pink-400/20 bg-gradient-to-br from-pink-400/20 to-pink-600/10 p-4">
            <p className="text-xs text-pink-300">{selectedYear === 'all' ? 'Faturamento geral' : `Ano ${selectedYear}`}</p>
            <h2 className="text-2xl font-bold">{formatCurrency(selectedYear === 'all' ? totalRevenue : selectedYearRevenue)}</h2>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-sky-500/20 bg-black/30 p-6">
          <h2 className="text-lg font-bold text-white">Gerenciar Agenda</h2>
          <p className="mt-1 text-sm text-zinc-300">Bloqueie ou libere horários do calendário.</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="rounded-2xl border border-white/10 bg-[#0b1220] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#101a2d]"
            >
              Selecionar datas
            </button>

            <button
              type="button"
              onClick={() => setIsHourPickerOpen(true)}
              disabled={selectedBlockDates.length === 0}
              className="rounded-2xl border border-white/10 bg-[#0b1220] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#101a2d] disabled:opacity-50"
            >
              Selecionar horários
            </button>

            <button
              type="button"
              onClick={addBlockedSlotsBatch}
              disabled={savingSlot || selectedBlockDates.length === 0 || selectedBlockHours.length === 0}
              className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-400 disabled:opacity-50"
            >
              {savingSlot ? 'Salvando...' : 'Bloquear horários'}
            </button>
          </div>

          {selectedBlockDates.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                Datas selecionadas
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedBlockDates.map((dateKey) => {
                  const [y, m, d] = dateKey.split('-');
                  return (
                    <span
                      key={dateKey}
                      className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200"
                    >
                      {d}/{m}/{y}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {selectedBlockHours.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                Horários selecionados
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedBlockHours.map((hour) => (
                  <span
                    key={hour}
                    className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-200"
                  >
                    {hour}
                  </span>
                ))}
              </div>
            </div>
          )}

<div className="mt-5 grid gap-3 md:grid-cols-3">
  <select
    value={filterYear}
    onChange={(e) => {
      setFilterYear(e.target.value);
      setFilterMonth('all');
      setFilterDay('all');
    }}
    className="h-11 rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none"
  >
    <option value="all">Todos os anos</option>
    {blockedYears.map((year) => (
      <option key={year} value={year}>{year}</option>
    ))}
  </select>

  <select
    value={filterMonth}
    onChange={(e) => {
      setFilterMonth(e.target.value);
      setFilterDay('all');
    }}
    className="h-11 rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none"
  >
    <option value="all">Todos os meses</option>
    {blockedMonths.map((month) => (
      <option key={month} value={month}>{month}</option>
    ))}
  </select>

  <select
    value={filterDay}
    onChange={(e) => setFilterDay(e.target.value)}
    className="h-11 rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none"
  >
    <option value="all">Todos os dias</option>
    {blockedDays.map((day) => (
      <option key={day} value={day}>{day}</option>
    ))}
  </select>
</div>

          {filteredBlockedSlots.length > 0 && (
            <div className="mt-5 max-h-[320px] overflow-y-auto pr-2 flex flex-wrap gap-2">
              {filteredBlockedSlots.map((slot) => {
                const [y, m, d] = slot.date.split('-');
                return (
                  <div key={slot.id} className="flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-sm text-red-200">
                    <span>{d}/{m}/{y} — {slot.hour}</span>
                    <button onClick={() => removeBlockedSlot(slot.id)} className="text-red-300 hover:text-white transition">✕</button>
                  </div>
                );
              })}
            </div>
          )}

          {filteredBlockedSlots.length === 0 && blockedSlots.length > 0 && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-zinc-400">
              Nenhum horário bloqueado encontrado para o filtro selecionado.
            </div>
          )}
        </div>

        {isDatePickerOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#07101d] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h4 className="text-xl font-black text-white">Selecionar datas</h4>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                >
                  Fechar
                </button>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAdminMonth((prev) => (prev === 0 ? 11 : prev - 1))}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                >
                  ←
                </button>

                <div className="text-center text-2xl font-black text-white">
                  {monthNames[adminMonth]} de {adminYear}
                </div>

                <button
                  type="button"
                  onClick={() => setAdminMonth((prev) => (prev === 11 ? 0 : prev + 1))}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white"
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day} className="pb-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                    {day}
                  </div>
                ))}

                {getCalendarCells(adminYear, adminMonth).map((date, index) => {
                  if (!date) return <div key={`empty-${index}`} />;

                  const dateKey = formatDateKey(date);
                  const selected = selectedBlockDates.includes(dateKey);

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => toggleAdminDate(dateKey)}
                      className="rounded-2xl border py-4 text-center font-bold transition"
                      style={{
                        border: selected ? '1px solid rgba(250,204,21,0.45)' : '1px solid rgba(255,255,255,0.08)',
                        background: selected ? 'rgba(250,204,21,0.18)' : '#0b1220',
                        color: selected ? '#fde047' : '#ffffff',
                      }}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {isHourPickerOpen && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-3xl rounded-[28px] border border-white/10 bg-[#07101d] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h4 className="text-xl font-black text-white">Selecionar horários</h4>
                <button
                  type="button"
                  onClick={() => setIsHourPickerOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                >
                  Fechar
                </button>
              </div>

              <p className="mb-4 text-sm text-zinc-400">
                Os horários apagados não podem ser usados em todas as datas selecionadas.
              </p>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {ALL_ADMIN_HOURS.map((hour) => {
                  const allowed = getSharedAdminHours(selectedBlockDates).includes(hour);
                  const selected = selectedBlockHours.includes(hour);

                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => allowed && toggleAdminHour(hour)}
                      disabled={!allowed}
                      className="rounded-xl border px-3 py-2 text-sm font-bold transition"
                      style={{
                        border: selected ? '1px solid rgba(56,189,248,0.55)' : '1px solid rgba(255,255,255,0.08)',
                        background: selected ? 'rgba(56,189,248,0.18)' : '#0f172a',
                        color: selected ? '#7dd3fc' : allowed ? '#ffffff' : '#64748b',
                        opacity: allowed ? 1 : 0.35,
                        cursor: allowed ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {hour}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6 text-yellow-200">
            Nenhum pedido encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#0a0225] to-black/60 p-6 shadow-2xl transition hover:border-purple-400/40">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xl font-bold">
                      {order.customer_name || 'Sem nome'} — {order.service_type || 'Sem serviço'}
                    </div>
                    <div className="mt-3 grid gap-1 text-sm text-zinc-300">
                      <div><strong>Email:</strong> {order.customer_email || '-'}</div>
                      <div><strong>Pagamento:</strong> {order.payment_method || '-'}</div>
                      <div><strong>Total:</strong> {formatCurrency(order.total_brl)}</div>
                      <div><strong>Criado em:</strong> {formatDate(order.created_at)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-sm ${getStatusClasses(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                    {order.proof_url && (
                      <a href={order.proof_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-sky-400 underline">
                        Ver comprovante
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {finalizedOrderId === order.id && finalizedOrder && buildWhatsappReviewLink(finalizedOrder) && (
                    <a
                      href={buildWhatsappReviewLink(finalizedOrder) as string}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl bg-[#25d366] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#20bc5a]"
                    >
                      💬 Pedir avaliação no WhatsApp
                    </a>
                  )}
                  <button onClick={() => updateStatus(order.id, 'approved')} className="rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300">
                    Aprovar (manual)
                  </button>
                  <button onClick={() => updateStatus(order.id, 'completed')} className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-emerald-400">
                    Finalizar
                  </button>
                  <button onClick={() => updateStatus(order.id, 'rejected')} className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400">
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
