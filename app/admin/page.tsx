'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Order = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
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

function getStatusClasses(status: string | null) {
  switch (status) {
    case 'approved':
      return 'border border-sky-400/20 bg-sky-500/15 text-sky-300';
    case 'completed':
      return 'border border-emerald-400/20 bg-emerald-500/15 text-emerald-300';
    case 'rejected':
      return 'border border-red-400/20 bg-red-500/15 text-red-300';
    case 'pending':
    default:
      return 'border border-amber-400/20 bg-amber-500/15 text-amber-300';
  }
}

function formatStatus(status: string | null) {
  switch (status) {
    case 'approved':
      return 'Aprovado';
    case 'completed':
      return 'Finalizado';
    case 'rejected':
      return 'Rejeitado';
    case 'pending':
    default:
      return 'Pendente';
  }
}

function formatDate(value: string | null) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('pt-BR');
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.href = '/login';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        window.location.href = '/';
        return;
      }

      setIsAdmin(true);
      setLoadingAuth(false);
    }

    checkAdmin();
  }, []);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const [siteSettings, setSiteSettings] = useState({
    rc_rate_per_1000: 82,
    rc_block_size: 25,
  });
  
  const [savingSettings, setSavingSettings] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    setAccessDenied(false);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    const profileResponse = await supabase
      .from('profiles')
      .select('id, email, is_admin')
      .eq('id', session.user.id)
      .single();

    const profile = profileResponse.data;
    const profileError = profileResponse.error;

    if (profileError || !profile?.is_admin) {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    const ordersResponse = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersResponse.error) {
      console.error('Erro ao buscar pedidos:', ordersResponse.error);
      setLoading(false);
      return;
    }

    setOrders((ordersResponse.data as Order[]) || []);
    setLoading(false);
  }

  async function fetchSiteSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('rc_rate_per_1000, rc_block_size')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Erro ao buscar site_settings:', error);
      return;
    }

    if (data) {
      setSiteSettings({
        rc_rate_per_1000: Number(data.rc_rate_per_1000 || 82),
        rc_block_size: Number(data.rc_block_size || 25),
      });
    }
  }

  async function saveSiteSettings() {
    setSavingSettings(true);

    const { error } = await supabase
      .from('site_settings')
      .update({
        rc_rate_per_1000: Number(siteSettings.rc_rate_per_1000),
        rc_block_size: Number(siteSettings.rc_block_size),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    setSavingSettings(false);

    if (error) {
      console.error('Erro ao salvar site_settings:', error);
      alert(`Erro ao salvar configuração: ${error.message}`);
      return;
    }

    alert('Cotação atualizada com sucesso.');
  }

  async function updateStatus(
    id: string,
    status: 'approved' | 'completed' | 'rejected'
  ) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error);
      alert(`Erro ao atualizar status: ${error.message}`);
      return;
    }

    fetchOrders();
  }

  useEffect(() => {
    fetchOrders();
    fetchSiteSettings();
  }, []);

  const years = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(
        orders
          .map((order) => {
            if (!order.created_at) return null;
            const date = new Date(order.created_at);
            if (Number.isNaN(date.getTime())) return null;
            return String(date.getFullYear());
          })
          .filter(Boolean)
      )
    ) as string[];

    uniqueYears.sort((a, b) => Number(b) - Number(a));

    return ['all', ...uniqueYears];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all' ? true : order.status === statusFilter;

      const normalizedPayment = normalizePaymentMethod(order.payment_method);
      const matchesPayment =
        paymentFilter === 'all' ? true : normalizedPayment === paymentFilter;

      let matchesMonth = true;
      let matchesYear = true;

      if (order.created_at) {
        const date = new Date(order.created_at);

        if (!Number.isNaN(date.getTime())) {
          matchesMonth =
            selectedMonth === 'all'
              ? true
              : String(date.getMonth()) === selectedMonth;

          matchesYear =
            selectedYear === 'all'
              ? true
              : String(date.getFullYear()) === selectedYear;
        }
      }

      const matchesSearch =
        !normalizedSearch ||
        (order.customer_name || '').toLowerCase().includes(normalizedSearch) ||
        (order.customer_email || '').toLowerCase().includes(normalizedSearch) ||
        (order.service_type || '').toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesPayment && matchesMonth && matchesYear && matchesSearch;
    });
  }, [orders, paymentFilter, search, selectedMonth, selectedYear, statusFilter]);

  const pendingCount = filteredOrders.filter((o) => o.status === 'pending').length;
  const approvedCount = filteredOrders.filter((o) => o.status === 'approved').length;
  const completedCount = filteredOrders.filter((o) => o.status === 'completed').length;
  const filteredRevenue = filteredOrders.reduce(
    (acc, order) => acc + Number(order.total_brl || 0),
    0
  );

  const totalRevenue = orders.reduce(
    (acc, order) => acc + Number(order.total_brl || 0),
    0
  );

  const selectedYearRevenue = orders
    .filter((order) => {
      if (selectedYear === 'all') return true;
      if (!order.created_at) return false;

      const date = new Date(order.created_at);
      if (Number.isNaN(date.getTime())) return false;

      return String(date.getFullYear()) === selectedYear;
    })
    .reduce((acc, order) => acc + Number(order.total_brl || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050014] via-[#0a0225] to-[#020617] p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-purple-500/20 bg-black/30 p-6">
            Carregando...
          </div>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050014] via-[#0a0225] to-[#020617] p-6 text-white">
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <h1 className="text-3xl font-bold">Acesso negado</h1>
          <p className="mt-2 text-zinc-300">
            Você não tem permissão para acessar o painel admin.
          </p>
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
              <p className="mt-1 text-sm text-purple-300">
                Controle total dos pedidos — FB Services
              </p>
            </div>

            <button
              onClick={fetchOrders}
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-purple-400 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
            >
              Recarregar pedidos
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou serviço..."
              className="h-12 rounded-2xl border border-purple-500/20 bg-[#0b1220] px-4 text-sm text-white outline-none placeholder:text-zinc-500"
            />

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-12 rounded-2xl border border-purple-500/20 bg-[#0b1220] px-4 text-sm text-white outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year === 'all' ? 'Todos os anos' : year}
                </option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-12 rounded-2xl border border-purple-500/20 bg-[#0b1220] px-4 text-sm text-white outline-none"
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
              className="h-12 rounded-2xl border border-purple-500/20 bg-[#0b1220] px-4 text-sm text-white outline-none"
            >
              <option value="all">Todos os pagamentos</option>
              <option value="pix">PIX</option>
              <option value="rc">RC</option>
              <option value="cartao">Cartão</option>
            </select>
          </div>

          <div className="mt-5 rounded-3xl border border-amber-400/20 bg-black/20 p-5">
            <h2 className="text-lg font-bold text-white">Configuração de Rubini Coins</h2>
            <p className="mt-1 text-sm text-zinc-300">
              Ajuste aqui a cotação usada no site para calcular o valor em RC.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                  Cotação por 1000 RC
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={siteSettings.rc_rate_per_1000}
                  onChange={(e) =>
                    setSiteSettings((prev) => ({
                      ...prev,
                      rc_rate_per_1000: Number(e.target.value),
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-200">
                  Tamanho do bloco de RC
                </label>
                <input
                  type="number"
                  step="1"
                  value={siteSettings.rc_block_size}
                  onChange={(e) =>
                    setSiteSettings((prev) => ({
                      ...prev,
                      rc_block_size: Number(e.target.value),
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={saveSiteSettings}
                disabled={savingSettings}
                className="rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-300 px-5 py-3 text-sm font-bold text-black shadow-md transition hover:brightness-105 disabled:opacity-60"
              >
                {savingSettings ? 'Salvando...' : 'Salvar cotação RC'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(['all', 'pending', 'approved', 'completed', 'rejected'] as StatusFilter[]).map(
              (filter) => {
                const active = statusFilter === filter;

                return (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-black shadow-md'
                        : 'border border-white/10 bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {filter === 'all'
                      ? 'Todos'
                      : filter === 'pending'
                      ? 'Pendentes'
                      : filter === 'approved'
                      ? 'Aprovados'
                      : filter === 'completed'
                      ? 'Finalizados'
                      : 'Rejeitados'}
                  </button>
                );
              }
            )}
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
            <p className="text-xs text-pink-300">
              {selectedYear === 'all' ? 'Faturamento geral' : `Ano ${selectedYear}`}
            </p>
            <h2 className="text-2xl font-bold">
              {formatCurrency(selectedYear === 'all' ? totalRevenue : selectedYearRevenue)}
            </h2>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6 text-yellow-200">
            Nenhum pedido encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-[#0a0225] to-black/60 p-6 shadow-2xl transition hover:border-purple-400/40"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xl font-bold">
                      {order.customer_name || 'Sem nome'} —{' '}
                      {order.service_type || 'Sem serviço'}
                    </div>

                    <div className="mt-3 grid gap-1 text-sm text-zinc-300">
                      <div>
                        <strong>Email:</strong> {order.customer_email || '-'}
                      </div>
                      <div>
                        <strong>Pagamento:</strong> {order.payment_method || '-'}
                      </div>
                      <div>
                        <strong>Total:</strong> {formatCurrency(order.total_brl)}
                      </div>
                      <div>
                        <strong>Criado em:</strong> {formatDate(order.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-sm ${getStatusClasses(
                        order.status
                      )}`}
                    >
                      {formatStatus(order.status)}
                    </span>

                    {order.proof_url && (
                      <a
                        href={order.proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-sky-400 underline"
                      >
                        Ver comprovante
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(order.id, 'approved')}
                    className="rounded-2xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-yellow-300"
                  >
                    Aprovar
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, 'completed')}
                    className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-emerald-400"
                  >
                    Finalizar
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, 'rejected')}
                    className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400"
                  >
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