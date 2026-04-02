'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Crown,
  Gem,
  History,
  House,
  LogOut,
  MessageCircle,
  QrCode,
  ScrollText,
  Shield,
  Star,
  Sword,
  Target,
  Upload,
  User,
  WalletCards,
  X,
} from 'lucide-react';

const menuOptions = [
  { id: 'inicio', label: 'Início', icon: House },
  { id: 'sobre', label: 'Sobre mim', icon: User },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'regras', label: 'Termos de serviço', icon: Shield },
  { id: 'feedbacks', label: 'Feedbacks', icon: Star },
  { id: 'contato', label: 'Contato', icon: MessageCircle },
];

const serviceOptions = [
  {
    id: 'char-level-up',
    title: 'Char Level Up',
    subtitle: 'Rush de level com segurança e organização',
    icon: Sword,
    glow: 'from-amber-400/30 via-orange-400/10 to-transparent',
    border: 'border-amber-300/20 hover:border-amber-300/40',
    iconBg: 'from-amber-400/25 to-orange-400/10',
  },
  {
    id: 'linked-bestiary',
    title: 'Linked Tasks e Bestiários',
    subtitle: 'Avanço de charms, tasks e progresso eficiente',
    icon: ScrollText,
    glow: 'from-emerald-400/30 via-lime-400/10 to-transparent',
    border: 'border-emerald-300/20 hover:border-emerald-300/40',
    iconBg: 'from-emerald-400/25 to-lime-400/10',
  },
  {
    id: 'bounty-weekly',
    title: 'Bounty e Weekly Tasks',
    subtitle: 'Execução limpa de weeklies e objetivos de bounty',
    icon: Target,
    glow: 'from-fuchsia-400/30 via-violet-400/10 to-transparent',
    border: 'border-fuchsia-300/20 hover:border-fuchsia-300/40',
    iconBg: 'from-fuchsia-400/25 to-violet-400/10',
  },
  {
    id: 'rotacao-bosses',
    title: 'Rotação de Bosses',
    subtitle: 'Selecione bosses, data desejada e preferência de horário',
    icon: Crown,
    glow: 'from-sky-400/30 via-cyan-400/10 to-transparent',
    border: 'border-sky-300/20 hover:border-sky-300/40',
    iconBg: 'from-sky-400/25 to-cyan-400/10',
  },
  {
    id: 'quests-acessos',
    title: 'Quests e Acessos',
    subtitle: 'Selecione quests desejadas e monte seu pedido',
    icon: Gem,
    glow: 'from-violet-400/30 via-fuchsia-400/10 to-transparent',
    border: 'border-violet-300/20 hover:border-violet-300/40',
    iconBg: 'from-violet-400/25 to-fuchsia-400/10',
  },
];

const integratedScheduleServiceIds = [
  'char-level-up',
  'linked-bestiary',
  'bounty-weekly',
];

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const weekdayHours = ['19:00', '20:00', '21:00', '22:00', '23:00'];
const saturdayHours = ['21:00', '22:00', '23:00', '00:00', '01:00', '02:00'];
const sundayHours = ['21:00', '22:00', '23:00'];

// TESTE TEMPORÁRIO — remover antes de produção
const reservedHoursByDate: Record<string, string[]> = {};

const bossOptions = [
  'Court Warlock',
  'Despor',
  'Drume',
  'Faceless Bane',
  'Gold Token x5',
  'Grand Master Oberon',
  'King Zelos',
  'Magma Bubble',
  'Mini Dream Courts',
  'Mini Livraria x4',
  'Mitmah Vanguard',
  'Ravenous Hunger/Leiden',
  'Scarlett Etzel',
  'Silver Token/Grave Danger x5',
  'The Brainstealer',
  'The Monster',
  'The Nightmare Beast',
  'The Pale Worm',
  'The World Devourer',
  'Timira the Many-Headed',
  'Urmahlullu the Weakened',
  'Vladrukh',
];

const bossTimeWindows = ['Manhã', 'Tarde', 'Noite', 'Madrugada'];

const questOptions = [
  '20 Years of a Cook',
  'Adventures of Galthen Quest',
  'Ferumbras Ascendant',
  'Grimvale Quest',
  'Primal Ordeal',
  'Rotten Blood',
  'Soul War 50/50',
  'Soul War Full',
  'Sweet Dreams Quest',
  'The Order of the Lion Quest',
  'The Roost of the Graveborn Quest',
];

const questTimeWindows = ['Manhã', 'Tarde', 'Noite', 'Madrugada'];

const PIX_RECEIVER_NAME = 'Felipe Barreira';
const PIX_KEY = 'ebafb34b-f732-453f-9a54-ba2a186f6e0d';
const PIX_BANK_NAME = 'Itaú';
const PIX_CITY = 'Campinas';
const WHATSAPP_NUMBER = '5519994737774';
const RC_RECEIVER_CHARACTER = 'Barreira Services Bank';
const RC_RECEIVER_WORLD = 'Elysian';
const DEFAULT_RC_RATE_PER_1000 = 82;
const DEFAULT_RC_BLOCK_SIZE = 25;

type PaymentMethod = 'pix' | 'rubini' | 'card';

type RcPaymentForm = {
  characterName: string;
  world: string;
  storePrint: File | null;
  transferProof: File | null;
};

function formatCurrencyBRL(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function buildPixField(id: string, value: string) {
  const size = String(value.length).padStart(2, '0');
  return `${id}${size}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function buildPixPayload({
  key,
  name,
  city,
  amount,
  txid,
}: {
  key: string;
  name: string;
  city: string;
  amount: number;
  txid: string;
}) {
  const sanitizedName = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .slice(0, 25);

  const sanitizedCity = city
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .slice(0, 15);

  const merchantAccount =
    buildPixField('00', 'BR.GOV.BCB.PIX') + buildPixField('01', key);

  const payload =
    buildPixField('00', '01') +
    buildPixField('01', '12') +
    buildPixField('26', merchantAccount) +
    buildPixField('52', '0000') +
    buildPixField('53', '986') +
    buildPixField('54', amount.toFixed(2)) +
    buildPixField('58', 'BR') +
    buildPixField('59', sanitizedName) +
    buildPixField('60', sanitizedCity) +
    buildPixField('62', buildPixField('05', txid)) +
    '6304';

  return payload + crc16(payload);
}

function getRubiniCoinsFromValue(
  value: number,
  blockPrice: number,
  blockSize: number
) {
  const blocksNeeded = Math.ceil(value / blockPrice);
  return blocksNeeded * blockSize;
}

function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(dateKey: string) {
  const [y, m, d] = dateKey.split('-');
  return `${d}/${m}/${y}`;
}

function formatShortDate(dateKey: string) {
  const [, m, d] = dateKey.split('-');
  return `${d}/${m}`;
}

function getCalendarCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function isSunday(date: Date) {
  return date.getDay() === 0;
}

function isSaturday(date: Date) {
  return date.getDay() === 6;
}

function isPastDate(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const test = new Date(date);
  test.setHours(0, 0, 0, 0);

  return test < today;
}

function isSoldOut(_date: Date) {
  return false;
}

function isPartial(date: Date) {
  const limitDate = new Date(2026, 4, 31);
  const compareDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (compareDate > limitDate) return false;
  if (isSunday(date) || isSaturday(date)) return false;
  if (isPastDate(date)) return false;

  return true;
}

function getAvailableHoursForDate(dateKey: string | null) {
  if (!dateKey) return [];

  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (isSunday(date)) return sundayHours;
  if (isSaturday(date)) return saturdayHours;
  return weekdayHours;
}

function getReservedCountForDate(dateKey: string) {
  return reservedHoursByDate[dateKey]?.length ?? 0;
}

function getRemainingHoursForDate(dateKey: string) {
  const available = getAvailableHoursForDate(dateKey);
  const reserved = reservedHoursByDate[dateKey] ?? [];
  return Math.max(available.length - reserved.length, 0);
}

function getReservedTooltipText(count: number) {
  if (count <= 0) return '';
  if (count === 1) return '1 horário já reservado';
  return `${count} horários já reservados`;
}

function isWeekendDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return isSaturday(date) || isSunday(date);
}

function getSelectedHoursCountByType(
  selectedHoursByDate: Record<string, string[]>
) {
  let weekdayHoursCount = 0;
  let weekendHoursCount = 0;

  Object.entries(selectedHoursByDate).forEach(([dateKey, hours]) => {
    if (isWeekendDateKey(dateKey)) {
      weekendHoursCount += hours.length;
    } else {
      weekdayHoursCount += hours.length;
    }
  });

  return { weekdayHoursCount, weekendHoursCount };
}

function getPricingForService(
  serviceId: string | null,
  selectedHoursByDate: Record<string, string[]>
) {
  const { weekdayHoursCount, weekendHoursCount } =
    getSelectedHoursCountByType(selectedHoursByDate);

  if (serviceId === 'linked-bestiary' || serviceId === 'bounty-weekly') {
    return {
      weekdayRate: 15,
      weekendRate: 18,
      weekdayHoursCount,
      weekendHoursCount,
    };
  }

  return {
    weekdayRate: weekdayHoursCount >= 15 ? 14 : 16,
    weekendRate: weekendHoursCount >= 12 ? 18 : 20,
    weekdayHoursCount,
    weekendHoursCount,
  };
}

function getTotalPrice(
  serviceId: string | null,
  selectedHoursByDate: Record<string, string[]>
) {
  const { weekdayRate, weekendRate, weekdayHoursCount, weekendHoursCount } =
    getPricingForService(serviceId, selectedHoursByDate);

  return weekdayHoursCount * weekdayRate + weekendHoursCount * weekendRate;
}

function getAttendanceText(activeHoursTab: string | null) {
  if (!activeHoursTab) return 'selecione uma data';

  const [year, month, day] = activeHoursTab.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (isSaturday(date)) return '21:00 às 02:00';
  if (isSunday(date)) return '21:00 às 23:00';
  return '19:00 às 23:00';
}

function getPricingHint(serviceId: string | null) {
  if (serviceId === 'linked-bestiary' || serviceId === 'bounty-weekly') {
    return 'Dias de semana: R$ 15/h • Fim de semana: R$ 18/h.';
  }

  return 'Na semana, até 14h fica R$ 16/h e na 15ª hora muda para R$ 14/h. No fim de semana, até 11h fica R$ 20/h e na 12ª hora muda para R$ 18/h.';
}

function getBossWeight(boss: string) {
  if (boss.includes('x5')) return 5;
  if (boss.includes('x4')) return 4;
  return 1;
}

function getBossRatePerBoss(count: number) {
  if (count >= 16) return 8;
  if (count >= 5) return 9;
  return 10;
}

function getBossTotal(count: number) {
  return count * getBossRatePerBoss(count);
}

function getQuestPrice(quest: string) {
  switch (quest) {
    case 'Soul War Full':
      return 110;
    case 'Soul War 50/50':
      return 55;
    case 'Primal Ordeal':
    case 'Rotten Blood':
      return 110;
    case 'Ferumbras Ascendant':
      return 80;
    case 'The Roost of the Graveborn Quest':
      return 80;
    case 'Adventures of Galthen Quest':
      return 80;
    case 'Grimvale Quest':
    case 'The Order of the Lion Quest':
      return 80;
    case '20 Years of a Cook':
    case 'Sweet Dreams Quest':
      return 80;
    default:
      return 80;
  }
}

type ServiceRecord = {
  id: number | string;
  type: string;
  character: string;
  date: string;
  hours: string;
  total: string;
  status: string;
};

type CurrentService = {
  type: string;
  character: string;
  date: string;
  hours: string;
  total: string;
  status: string;
};

const feedbackFilters = [
  'Todos',
  'Char Level Up',
  'Linked Tasks / Bestiary',
  'Bounty / Weekly',
  'Rotação de Bosses',
  'Quests e Acessos',
] as const;

type FeedbackFilter = (typeof feedbackFilters)[number];

type FeedbackItem = {
  id: number;
  service: string;
  character: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  author: string;
};

type SiteSettings = {
  rc_rate_per_1000: number;
  rc_block_size: number;
};





type ActivePage =
  | 'home'
  | 'sobre'
  | 'agenda'
  | 'regras'
  | 'feedbacks'
  | 'auth'
  | 'perfil'
  | 'historico';

export default function Page() {
   
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
const currentYear = new Date().getFullYear();
  const customerStepTopRef = useRef<HTMLDivElement | null>(null);
  const [openCustomerDropdown, setOpenCustomerDropdown] = useState<
    'vocation' | 'world' | null
  >(null);

  const [rcNicknameCopied, setRcNicknameCopied] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');
  function handleCopyRcNickname() {
    navigator.clipboard.writeText('Barreira Services Bank');
    setRcNicknameCopied(true);

    setTimeout(() => {
      setRcNicknameCopied(false);
    }, 1800);
  
  }


  

  const [rcRatePer1000, setRcRatePer1000] = useState(DEFAULT_RC_RATE_PER_1000);
const [rcBlockSize, setRcBlockSize] = useState(DEFAULT_RC_BLOCK_SIZE);


async function loadFeedbacks() {
  const { data, error } = await supabase
    .from('feedbacks').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Erro ao buscar feedbacks:', error); return; }
  if (data) {
    setFeedbacks(data.map((item: any) => ({
      id: item.id,
      service: item.service,
      character: item.character,
      rating: item.rating,
      comment: item.comment,
      date: new Date(item.created_at).toLocaleDateString('pt-BR'),
      verified: item.verified,
      author: item.author,
    })));
  }
}

async function loadUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) { console.error('Erro ao buscar pedidos:', error); return; }
  if (data) {
    const history: ServiceRecord[] = data.map((order: any) => ({
      id: order.id,
      type: order.service_type,
      character: order.char_name,
      date: new Date(order.created_at).toLocaleDateString('pt-BR'),
      hours: '-',
      total: `R$ ${Number(order.total_brl).toFixed(2).replace('.', ',')}`,
      status: order.status,
    }));
    setServiceHistory(history);
    const active = data.find((o: any) => o.status === 'pending' || o.status === 'approved');
    if (active) {
      setCurrentService({
        type: active.service_type,
        character: active.char_name,
        date: new Date(active.created_at).toLocaleDateString('pt-BR'),
        hours: '-',
        total: `R$ ${Number(active.total_brl).toFixed(2).replace('.', ',')}`,
        status: active.status,
      });
      setHasPurchasedService(true);
    } else {
      setCurrentService(null);
      setHasPurchasedService(false);
    }
  }
}

async function loadSiteSettings() {
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
    console.log('SITE SETTINGS PAGE:', data);
    setRcRatePer1000(Number(data.rc_rate_per_1000 || DEFAULT_RC_RATE_PER_1000));
    setRcBlockSize(Number(data.rc_block_size || DEFAULT_RC_BLOCK_SIZE));
  }
}

useEffect(() => {
  loadSiteSettings();
  loadFeedbacks();
}, []);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('payment') === 'success') {
    const orderId = params.get('orderId');
    setPaymentSuccessMessage(
      `Pagamento confirmado!${orderId ? ` Pedido #${orderId.slice(0, 8).toUpperCase()}` : ''}`
    );
    window.history.replaceState({}, '', '/');
  }
}, []);

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>('pix');
  const [paymentError, setPaymentError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [copiedPixCode, setCopiedPixCode] = useState(false);
  const [pixReadyForWhatsapp, setPixReadyForWhatsapp] = useState(false);
  const [cardAcknowledged, setCardAcknowledged] = useState(false);
  const [rcPaymentForm, setRcPaymentForm] = useState<RcPaymentForm>({
    characterName: '',
    world: 'Elysian',
    storePrint: null,
    transferProof: null,
  });
  const [rcReadyForWhatsapp, setRcReadyForWhatsapp] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [pixProofFile, setPixProofFile] = useState<File | null>(null);
  const [proofUploadLoading, setProofUploadLoading] = useState(false);
  const [asaasPixQrCodeImage, setAsaasPixQrCodeImage] = useState('');
const [asaasPixCopyPaste, setAsaasPixCopyPaste] = useState('');
const [asaasInvoiceUrl, setAsaasInvoiceUrl] = useState('');

  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3 | 4 | 5>(2);

  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpfCnpj: '',
    charName: '',
    charLevel: '',
    vocation: '',
    world: '',
  });

  const [customerFormErrors, setCustomerFormErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    cpfCnpj?: string;
    charName?: string;
    charLevel?: string;
    vocation?: string;
    world?: string;
    terms?: string;
  }>({});

  const [acceptedServiceTerms, setAcceptedServiceTerms] = useState(false);
  const [acceptedPrivacyTerms, setAcceptedPrivacyTerms] = useState(false);

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedHoursByDate, setSelectedHoursByDate] = useState<
    Record<string, string[]>
  >({});
  const [activeDateTab, setActiveDateTab] = useState<string | null>(null);

  const [bossDropdownOpen, setBossDropdownOpen] = useState(false);
  const [selectedBosses, setSelectedBosses] = useState<string[]>([]);
  const [bossTimeWindow, setBossTimeWindow] = useState('');
  const [bossDayPreference, setBossDayPreference] = useState('');
  const [bossNotes, setBossNotes] = useState('');
  const bossDropdownRef = useRef<HTMLDivElement | null>(null);

  const [questDropdownOpen, setQuestDropdownOpen] = useState(false);
  const [selectedQuests, setSelectedQuests] = useState<string[]>([]);
  const [questTimeWindow, setQuestTimeWindow] = useState('');
  const [questDayPreference, setQuestDayPreference] = useState('');
  const [questNotes, setQuestNotes] = useState('');
  const questDropdownRef = useRef<HTMLDivElement | null>(null);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [session, setSession] = useState<Session | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userConfirmPassword, setUserConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hasPurchasedService, setHasPurchasedService] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [currentService, setCurrentService] = useState<CurrentService | null>(
    null
  );

  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>([]);

  const [selectedFeedbackFilter, setSelectedFeedbackFilter] =
    useState<FeedbackFilter>('Todos');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackCharacter, setFeedbackCharacter] = useState('');
  const [feedbackService, setFeedbackService] = useState('Char Level Up');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [isFeedbackServiceOpen, setIsFeedbackServiceOpen] = useState(false);
  const [isFeedbackFilterOpen, setIsFeedbackFilterOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  const monthCells = useMemo(
    () => getCalendarCells(currentYear, currentMonth),
    [currentYear, currentMonth]
  );
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fullNameIsValid =
    customerForm.fullName.trim().split(/\s+/).filter(Boolean).length >= 2;
  const phoneDigits = customerForm.phone.replace(/\D/g, '');
  const phoneIsValid = phoneDigits.length >= 10 && phoneDigits.length <= 11;
  const charLevelIsValid =
    /^\d+$/.test(customerForm.charLevel.trim()) &&
    Number(customerForm.charLevel) > 0;

  const isCustomerFormReady =
    fullNameIsValid &&
    emailIsValid.test(customerForm.email.trim()) &&
    phoneIsValid &&
    customerForm.charName.trim().length > 0 &&
    charLevelIsValid &&
    customerForm.vocation.trim().length > 0 &&
    customerForm.world.trim().length > 0 &&
    acceptedServiceTerms &&
    acceptedPrivacyTerms;

  useEffect(() => {
    if (checkoutStep >= 3) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      setTimeout(() => {
        customerStepTopRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 120);
    } else {
      setOpenCustomerDropdown(null);
    }
  }, [checkoutStep]);

  useEffect(() => {
    function handleClickOutside() {
      setOpenCustomerDropdown(null);
    }

    if (openCustomerDropdown) {
      window.addEventListener('click', handleClickOutside);
    }

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [openCustomerDropdown]);

  function resetScheduleFlow() {
    setSelectedDates([]);
    setSelectedHoursByDate({});
    setActiveDateTab(null);
  }

  function resetBossFlow() {
    setBossDropdownOpen(false);
    setSelectedBosses([]);
    setBossDayPreference('');
    setBossTimeWindow('');
    setBossNotes('');
  }

  function resetQuestFlow() {
    setQuestDropdownOpen(false);
    setSelectedQuests([]);
    setQuestDayPreference('');
    setQuestTimeWindow('');
    setQuestNotes('');
  }

  function resetPaymentFlow() {
    setSelectedPaymentMethod('pix');
    setPaymentError('');
    setPaymentNotice('');
    setCopiedPixCode(false);
    setPixReadyForWhatsapp(false);
    setCardAcknowledged(false);
    setRcPaymentForm({
      characterName: '',
      world: 'Elysian',
      storePrint: null,
      transferProof: null,
    });
    setRcReadyForWhatsapp(false);
    setCurrentOrderId(null);
    setPixProofFile(null);
    setProofUploadLoading(false);
    setAsaasPixQrCodeImage('');
setAsaasPixCopyPaste('');
setAsaasInvoiceUrl('');
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        bossDropdownRef.current &&
        !bossDropdownRef.current.contains(event.target as Node)
      ) {
        setBossDropdownOpen(false);
      }

      if (
        questDropdownRef.current &&
        !questDropdownRef.current.contains(event.target as Node)
      ) {
        setQuestDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erro ao carregar sessão:', error.message);
        return;
      }

      const currentSession = data.session;

      setSession(currentSession);
      setIsLoggedIn(!!currentSession);
      setUserEmail(currentSession?.user.email ?? '');

      if (currentSession?.user) {
        ensureProfile(currentSession.user);
        loadUserOrders(currentSession.user.id);
      }

      const fullName =
        currentSession?.user.user_metadata?.full_name ||
        currentSession?.user.user_metadata?.name ||
        '';

      setUserName(fullName);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoggedIn(!!newSession);
      setUserEmail(newSession?.user.email ?? '');

      if (newSession?.user) {
        ensureProfile(newSession.user);
        loadUserOrders(newSession.user.id);
      }

      const fullName =
        newSession?.user.user_metadata?.full_name ||
        newSession?.user.user_metadata?.name ||
        '';

      setUserName(fullName);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function openAuthPage(mode: 'login' | 'register' = 'login') {
    setMenuOpen(false);
    setSelectedService(null);
    setAuthMode(mode);
    setLoginError('');
    setIsUserMenuOpen(false);
    setActivePage('auth');
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    setSession(null);
    setIsLoggedIn(false);
    setServiceHistory([]);
setCurrentService(null);
setHasPurchasedService(false);
    setIsUserMenuOpen(false);
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserConfirmPassword('');
    setLoginError('');
    setHasPurchasedService(false);
    setCurrentService(null);
    setActivePage('home');
  }

  async function ensureProfile(user: Session['user']) {
    const { error } = await supabase.from('profiles').upsert(
      [
        {
          id: user.id,
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            '',
          email: user.email ?? '',
        },
      ],
      { onConflict: 'id' }
    );

    if (error) {
      console.error('Erro ao garantir profile:', error);
    }
  }

  async function handleAuthSubmit() {
    setLoginError('');

    if (!userEmail.trim() || !userPassword.trim()) {
      setLoginError('Preencha e-mail e senha.');
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        if (!userName.trim()) {
          setLoginError('Preencha seu nome.');
          setAuthLoading(false);
          return;
        }

        if (userPassword.length < 6) {
          setLoginError('A senha deve ter pelo menos 6 caracteres.');
          setAuthLoading(false);
          return;
        }

        if (userPassword !== userConfirmPassword) {
          setLoginError('As senhas não coincidem.');
          setAuthLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: userEmail.trim(),
          password: userPassword,
          options: {
            data: {
              full_name: userName.trim(),
            },
          },
        });

        if (error) {
          setLoginError(error.message);
          setAuthLoading(false);
          return;
        }

        if (data.user) {
          setLoginError('Conta criada. Se pedir confirmação por e-mail, confirme.');
        }

        setActivePage('home');
        setAuthLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: userEmail.trim(),
        password: userPassword,
      });

      if (error) {
        setLoginError('E-mail ou senha inválidos.');
        setAuthLoading(false);
        return;
      }

      if (data.session) {
        setSession(data.session);
        setIsLoggedIn(true);
        setUserEmail(data.session.user.email ?? '');
        await ensureProfile(data.session.user);
        await loadUserOrders(data.session.user.id);

        const fullName =
          data.session.user.user_metadata?.full_name ||
          data.session.user.user_metadata?.name ||
          '';

        setUserName(fullName);
        setIsUserMenuOpen(false);
        setActivePage('home');
      }
    } catch (error) {
      console.error(error);
      setLoginError('Erro inesperado.');
    } finally {
      setAuthLoading(false);
    }
  }
  const vocationOptions = [
    'Elite Knight',
    'Royal Paladin',
    'Elder Druid',
    'Master Sorcerer',
    'Exalted Monk',
  ];

  const worldOptions = [
    'Divinian',
    'Elysian',
    'Etherian',
    'Halorian',
    'Lunarian',
    'Mystian',
    'Serenian',
    'Solarian',
    'Auroria',
    'Belaria',
    'Vesperia',
    'Bellum',
    'Spectrum',
    'Tenebrium',
  ];

  function CustomerStyledDropdown({
    label,
    value,
    placeholder,
    isOpen,
    onToggle,
    onSelect,
    onClose,
    options,
    error,
  }: {
    label: string;
    value: string;
    placeholder: string;
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (value: string) => void;
    onClose: () => void;
    options: string[];
    error?: string;
  }) {
    return (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <label className="mb-2 block text-[13px] font-semibold text-white">
          {label}
        </label>

        <button
          type="button"
          onClick={onToggle}
          className={`flex h-11 w-full items-center justify-between rounded-[16px] px-4 text-left text-[13px] outline-none transition ${
            error
              ? 'bg-[#081126]/95 ring-1 ring-red-400/40'
              : 'bg-[#081126]/95 hover:bg-[#0b1731] focus:ring-1 focus:ring-blue-500/40'
          }`}
        >
          <span className={value ? 'text-white' : 'text-zinc-500'}>
            {value || placeholder}
          </span>

          <svg
            className={`h-4 w-4 text-zinc-400 transition ${
              isOpen ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#0b1731,#081126)] shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/5 backdrop-blur-md">
            <div className="px-4 py-3 text-[12px] text-zinc-500">
              {placeholder}
            </div>

            <div className="max-h-56 overflow-y-auto pr-1 custom-scroll">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(option);
                    onClose();
                  }}
                  className={`flex w-full items-center px-4 py-3 text-[13px] transition ${
                    value === option
                      ? 'bg-[linear-gradient(90deg,rgba(59,130,246,0.15),transparent)] text-white'
                      : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
        <style jsx global>{`
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 999px;
  }

  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.22);
  }
`}</style>

        {error && <p className="mt-1.5 text-[12px] text-red-300">{error}</p>}
      </div>
    );
  }
  function updateCustomerForm(field: keyof typeof customerForm, value: string) {
    let nextValue = value;

    if (field === 'phone') {
      nextValue = value.replace(/\D/g, '').slice(0, 11);
    }

    if (field === 'cpfCnpj') {
  nextValue = value.replace(/\D/g, '').slice(0, 14);
}

    if (field === 'charLevel') {
      nextValue = value.replace(/\D/g, '').slice(0, 5);
    }

    setCustomerForm((prev) => ({
      ...prev,
      [field]: nextValue,
    }));

    setCustomerFormErrors((prev) => ({
      ...prev,
      [field]: '',
      terms: '',
    }));
  }

  function handleGoToCustomerDataStep() {
    if (!canContinueToCustomerData) return;

    setCheckoutStep(3);
  }

  function validateCustomerForm() {
    const errors: {
      fullName?: string;
      email?: string;
      phone?: string;
      cpfCnpj?: string;
      charName?: string;
      charLevel?: string;
      vocation?: string;
      world?: string;
      terms?: string;
    } = {};

    const fullName = customerForm.fullName.trim();
    const email = customerForm.email.trim();
    const phone = customerForm.phone.replace(/\D/g, '');
    const cpfCnpj = customerForm.cpfCnpj.replace(/\D/g, '');
    const charName = customerForm.charName.trim();
    const charLevel = customerForm.charLevel.trim();

    if (!fullName) {
      errors.fullName = 'Informe seu nome completo.';
    } else if (fullName.split(/\s+/).filter(Boolean).length < 2) {
      errors.fullName = 'Digite nome e sobrenome.';
    }

    if (!email) {
      errors.email = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Digite um e-mail válido.';
    }

    if (!phone) {
      errors.phone = 'Informe seu telefone.';
    } else if (phone.length < 10 || phone.length > 11) {
      errors.phone = 'Digite um telefone válido com DDD.';
    }

    if (!cpfCnpj) {
  errors.cpfCnpj = 'Informe o CPF ou CNPJ.';
} else if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
  errors.cpfCnpj = 'Digite um CPF ou CNPJ válido.';
}

    if (!charName) {
      errors.charName = 'Informe o nome do char.';
    }

    if (!charLevel) {
      errors.charLevel = 'Informe o nível do personagem.';
    } else if (!/^\d+$/.test(charLevel) || Number(charLevel) <= 0) {
      errors.charLevel = 'O level deve conter apenas números válidos.';
    }

    if (!customerForm.vocation.trim()) {
      errors.vocation = 'Selecione a vocação.';
    }

    if (!customerForm.world.trim()) {
      errors.world = 'Selecione o mundo.';
    }

    if (!acceptedServiceTerms || !acceptedPrivacyTerms) {
      errors.terms = 'Você precisa aceitar os dois termos para continuar.';
    }

    setCustomerFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setTimeout(() => {
        customerStepTopRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    }

    return Object.keys(errors).length === 0;
  }

  function handleGoToPaymentStep() {
    const isValid = validateCustomerForm();

    if (!isValid) return;

    setOpenCustomerDropdown(null);
    setCheckoutStep(4);
  }

  function parseDateBR(dateStr: string) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  function getDaysDifference(dateStr: string) {
    const now = new Date();
    const target = parseDateBR(dateStr);
    const diffMs = now.getTime() - target.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  function hasRecentEligibleService() {
    return serviceHistory.some((item) => getDaysDifference(item.date) <= 7);
  }

  function normalizeText(textValue: string) {
    return textValue
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function containsBlockedLanguage(textValue: string) {
    const normalized = normalizeText(textValue);

    const blockedTerms = [
      'filho da puta',
      'puta',
      'puta que pariu',
      'vagabundo',
      'vagabunda',
      'otario',
      'otaria',
      'babaca',
      'idiota',
      'imbecil',
      'burro',
      'bosta',
      'merda',
      'porra',
      'caralho',
      'fdp',
      'corno',
      'arrombado',
      'arrombada',
      'desgracado',
      'desgracada',
      'lixo',
      'escroto',
      'escrota',
      'retardado',
      'retardada',
      'troxa',
      'inutil',
      'vai se foder',
      'vsf',
      'pau no cu',
      'cuzao',
      'cusao',
    ];

    return blockedTerms.find((term) => normalized.includes(term)) || null;
  }

  async function handleSubmitFeedback() {
  setFeedbackError(''); setFeedbackSuccess('');
  if (!isLoggedIn) { setFeedbackError('Faça login para publicar sua avaliação.'); return; }
  if (!hasRecentEligibleService()) { setFeedbackError('É necessário ter um service nos últimos 7 dias.'); return; }
  if (!feedbackService.trim()) { setFeedbackError('Selecione o tipo de service avaliado.'); return; }
  if (!feedbackCharacter.trim()) { setFeedbackError('Informe o nome do personagem atendido.'); return; }
  if (feedbackRating < 1 || feedbackRating > 5) { setFeedbackError('Selecione de 1 a 5 estrelas.'); return; }
  if (feedbackComment.trim().length < 12) { setFeedbackError('Escreva um comentário com pelo menos 12 caracteres.'); return; }
  const blockedWord = containsBlockedLanguage(feedbackComment);
  if (blockedWord) { setFeedbackError(`Linguagem ofensiva detectada ("${blockedWord}").`); return; }

  const { data, error } = await supabase.from('feedbacks').insert([{
    user_id: session?.user?.id,
    author: userName || 'Cliente',
    service: feedbackService,
    character: feedbackCharacter,
    rating: feedbackRating,
    comment: feedbackComment.trim(),
    verified: true,
  }]).select().single();

  if (error) { setFeedbackError(`Erro ao publicar: ${error.message}`); return; }

  if (data) {
    setFeedbacks((prev) => [{
      id: data.id, service: data.service, character: data.character,
      rating: data.rating, comment: data.comment,
      date: new Date(data.created_at).toLocaleDateString('pt-BR'),
      verified: data.verified, author: data.author,
    }, ...prev]);
  }

  setFeedbackRating(0); setFeedbackComment(''); setFeedbackCharacter('');
  setFeedbackService('Char Level Up'); setFeedbackSuccess('Avaliação publicada com sucesso.');
}

 
  function goToPage(page: ActivePage) {
    setMenuOpen(false);
    setSelectedService(null);
    setIsUserMenuOpen(false);

    if ((page === 'perfil' || page === 'historico') && !isLoggedIn) {
      openAuthPage('login');
      return;
    }

    setActivePage(page);
  }

  function openWhatsappContact() {
    setMenuOpen(false);
    window.open(
      'https://wa.me/5519981587705?text=Olá!%20Vim%20através%20do%20seu%20site%20e%20gostaria%20de%20receber%20mais%20informações%20sobre%20os%20services.%20Poderia%20me%20ajudar%3F',
      '_blank'
    );
  }

  function toggleService(serviceId: string) {
    setActivePage('home');
    setCheckoutStep(2);
    setSelectedService((prev) => {
      const next = prev === serviceId ? null : serviceId;

      if (next !== prev) {
        resetScheduleFlow();
        resetBossFlow();
        resetQuestFlow();
        resetPaymentFlow();
      }

      return next;
    });
  }

  function toggleDate(date: Date) {
    const key = formatDateKey(date);

    setSelectedDates((prev) => {
      if (prev.includes(key)) {
        const next = prev.filter((item) => item !== key);

        setSelectedHoursByDate((hours) => {
          const copy = { ...hours };
          delete copy[key];
          return copy;
        });

        setActiveDateTab((current) => {
          if (current !== key) return current;
          return next[0] ?? null;
        });

        return next;
      }

      const next = [...prev, key].sort();
      setActiveDateTab(key);
      return next;
    });
  }

  function toggleHour(dateKey: string, hour: string) {
    setSelectedHoursByDate((prev) => {
      const existing = prev[dateKey] ?? [];
      const next = existing.includes(hour)
        ? existing.filter((item) => item !== hour)
        : [...existing, hour].sort();

      return { ...prev, [dateKey]: next };
    });
  }

  function addBoss(bossName: string) {
    setSelectedBosses((prev) => {
      if (prev.includes(bossName)) return prev;
      return [...prev, bossName];
    });
  }

  function removeBoss(bossName: string) {
    setSelectedBosses((prev) => prev.filter((boss) => boss !== bossName));
  }

  function addQuest(questName: string) {
    setSelectedQuests((prev) => {
      if (prev.includes(questName)) return prev;
      return [...prev, questName];
    });
  }

  function removeQuest(questName: string) {
    setSelectedQuests((prev) => prev.filter((quest) => quest !== questName));
  }

  const selectedDateTabs = selectedDates.filter(
    (dateKey) => (selectedHoursByDate[dateKey] ?? []).length > 0
  );

  const activeHoursTab =
    activeDateTab && selectedDates.includes(activeDateTab)
      ? activeDateTab
      : selectedDateTabs[0] ?? selectedDates[0] ?? null;

  const activeHoursForDate = activeHoursTab
    ? getAvailableHoursForDate(activeHoursTab)
    : [];
  const activeReservedForDate = activeHoursTab
    ? reservedHoursByDate[activeHoursTab] ?? []
    : [];

  const { weekdayRate, weekendRate, weekdayHoursCount, weekendHoursCount } =
    getPricingForService(selectedService, selectedHoursByDate);

  const totalSelectedHours = weekdayHoursCount + weekendHoursCount;
  const hasAnySelectedHour = totalSelectedHours > 0;
  const totalPrice = getTotalPrice(selectedService, selectedHoursByDate);

  const bossCount = selectedBosses.reduce((total, boss) => {
    return total + getBossWeight(boss);
  }, 0);
  const bossRate = getBossRatePerBoss(bossCount);
  const bossTotal = getBossTotal(bossCount);

  const filteredFeedbacks =
    selectedFeedbackFilter === 'Todos'
      ? feedbacks
      : feedbacks.filter((item) => item.service === selectedFeedbackFilter);

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, item) => sum + item.rating, 0) /
          feedbacks.length
        ).toFixed(1)
      : '0.0';

  const canPublishFeedback = isLoggedIn && hasRecentEligibleService();
  const feedbackServiceOptions = feedbackFilters.filter(
    (item) => item !== 'Todos'
  );

  const questTotal = selectedQuests.reduce((total, quest) => {
    return total + getQuestPrice(quest);
  }, 0);

  const checkoutSummaryItems = useMemo(() => {
    if (selectedService === 'rotacao-bosses') {
      return selectedBosses.map((boss) => ({
        label: boss,
        hours: `${getBossWeight(boss)} boss${
          getBossWeight(boss) > 1 ? 'es' : ''
        }`,
      }));
    }

    if (selectedService === 'quests-acessos') {
      return selectedQuests.map((quest) => ({
        label: quest,
        hours: `R$ ${getQuestPrice(quest).toFixed(2).replace('.', ',')}`,
      }));
    }

    return selectedDateTabs.map((dateKey) => {
      const hours = selectedHoursByDate[dateKey] ?? [];
      return {
        label: formatDateDisplay(dateKey),
        hours: `${hours.join(', ')} (${hours.length}h)`,
      };
    });
  }, [
    selectedDateTabs,
    selectedHoursByDate,
    selectedService,
    selectedBosses,
    selectedQuests,
  ]);

  const checkoutTotalHoursLabel = useMemo(() => {
    if (selectedService === 'rotacao-bosses') {
      return bossCount > 0
        ? `${bossCount} boss${bossCount > 1 ? 'es' : ''}`
        : '—';
    }

    if (selectedService === 'quests-acessos') {
      return selectedQuests.length > 0
        ? `${selectedQuests.length} quest${
            selectedQuests.length > 1 ? 's' : ''
          }`
        : '—';
    }

    return totalSelectedHours > 0 ? `${totalSelectedHours}h` : '—';
  }, [selectedService, bossCount, selectedQuests.length, totalSelectedHours]);

  const checkoutTotalValueLabel = useMemo(() => {
    if (selectedService === 'rotacao-bosses') {
      return `R$ ${bossTotal.toFixed(2).replace('.', ',')}`;
    }

    if (selectedService === 'quests-acessos') {
      return `R$ ${questTotal.toFixed(2).replace('.', ',')}`;
    }

    return `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
  }, [selectedService, bossTotal, questTotal, totalPrice]);
  const integratedScheduleReady =
    selectedDates.length > 0 &&
    selectedDates.every(
      (dateKey) => (selectedHoursByDate[dateKey] ?? []).length > 0
    );

  const bossFlowReady =
    selectedBosses.length > 0 &&
    bossDayPreference.trim().length > 0 &&
    bossTimeWindow.trim().length > 0;

  const questFlowReady =
    selectedQuests.length > 0 &&
    questDayPreference.trim().length > 0 &&
    questTimeWindow.trim().length > 0;

  const canContinueToCustomerData =
    isLoggedIn &&
    ((selectedService !== null &&
      integratedScheduleServiceIds.includes(selectedService) &&
      integratedScheduleReady) ||
      (selectedService === 'rotacao-bosses' && bossFlowReady) ||
      (selectedService === 'quests-acessos' && questFlowReady));

  const checkoutTotalValueNumber = useMemo(() => {
    if (selectedService === 'rotacao-bosses') return bossTotal;
    if (selectedService === 'quests-acessos') return questTotal;
    return totalPrice;
  }, [selectedService, bossTotal, questTotal, totalPrice]);

  const selectedServiceTitle =
    serviceOptions.find((item) => item.id === selectedService)?.title ??
    'Service';

  const paymentMethodTheme: Record<
    PaymentMethod,
    {
      card: string;
      panel: string;
      button: string;
      badge: string;
      title: string;
      subtitle: string;
    }
  > = {
    pix: {
      card: 'bg-[linear-gradient(180deg,rgba(9,19,40,0.94),rgba(6,13,29,0.96))] shadow-[0_16px_36px_rgba(0,0,0,0.20)] hover:brightness-[1.03]',
      panel:
        'bg-[linear-gradient(180deg,rgba(5,44,30,0.88),rgba(4,28,21,0.95))] shadow-[0_22px_52px_rgba(0,0,0,0.22)]',
      button:
        'bg-[linear-gradient(180deg,#17cf6d,#0eb95d)] text-white shadow-[0_14px_30px_rgba(17,210,107,0.24)] hover:brightness-105',
      badge: 'bg-emerald-400/10 text-emerald-200',
      title: 'Pagamento via PIX',
      subtitle: 'Confirmação rápida com QR Code e PIX copia e cola.',
    },
    rubini: {
      card: 'bg-[linear-gradient(180deg,rgba(44,28,7,0.84),rgba(20,14,7,0.95))] shadow-[0_16px_36px_rgba(0,0,0,0.20)] hover:brightness-[1.03]',
      panel:
        'bg-[linear-gradient(180deg,rgba(51,34,10,0.88),rgba(20,14,7,0.95))] shadow-[0_22px_52px_rgba(0,0,0,0.22)]',
      button:
        'bg-[linear-gradient(180deg,#f4b63f,#d89216)] text-black shadow-[0_14px_30px_rgba(244,182,63,0.24)] hover:brightness-105',
      badge: 'bg-amber-400/12 text-amber-100',
      title: 'Pagamento com Rubini Coins',
      subtitle: 'Pagamento em Rubini Coins com conferência manual e arredondamento de 25 em 25.',
    },
    card: {
      card: 'bg-[linear-gradient(180deg,rgba(10,24,46,0.84),rgba(7,14,28,0.95))] shadow-[0_16px_36px_rgba(0,0,0,0.20)] hover:brightness-[1.03]',
      panel:
        'bg-[linear-gradient(180deg,rgba(12,28,54,0.86),rgba(8,15,30,0.95))] shadow-[0_22px_52px_rgba(0,0,0,0.22)]',
      button:
        'bg-[linear-gradient(180deg,#5c8cff,#356df1)] text-white shadow-[0_14px_30px_rgba(92,140,255,0.24)] hover:brightness-105',
      badge: 'bg-sky-400/12 text-sky-100',
      title: 'Cartão de Crédito',
subtitle:
  'Pagamento via Asaas com checkout externo seguro e redirecionamento protegido.',
    },
  };

  const paymentTheme = paymentMethodTheme[selectedPaymentMethod];

  const pixPayload = useMemo(() => {
    if (checkoutTotalValueNumber <= 0) return '';

    return buildPixPayload({
      key: PIX_KEY,
      name: PIX_RECEIVER_NAME,
      city: PIX_CITY,
      amount: checkoutTotalValueNumber,
      txid: 'FBORDER01',
    });
  }, [checkoutTotalValueNumber]);

  const pixQrCodeUrl = useMemo(() => {
    if (!pixPayload) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
      pixPayload
    )}`;
  }, [pixPayload]);

  const rcBlockPrice = useMemo(
  () => (rcRatePer1000 / 1000) * rcBlockSize,
  [rcRatePer1000, rcBlockSize]
);

const rubiniCoinsTotal = useMemo(
  () =>
    getRubiniCoinsFromValue(
      checkoutTotalValueNumber,
      rcBlockPrice,
      rcBlockSize
    ),
  [checkoutTotalValueNumber, rcBlockPrice, rcBlockSize]
);

const rubiniBlocksTotal = Math.ceil(rubiniCoinsTotal / rcBlockSize);
  const rcPaymentReady = true;

  const paymentReady =
    selectedPaymentMethod === 'pix'
      ? true
      : selectedPaymentMethod === 'card'
      ? true
      : rcPaymentReady;

  const orderSummaryText = checkoutSummaryItems
    .map((item) => `${item.label}: ${item.hours}`)
    .join(' | ');

  const whatsappPixMessage = encodeURIComponent(
    [
      'Olá! Realizei o pagamento via PIX no site da FB Services.',
      '',
      `Service: ${selectedServiceTitle}`,
      `Resumo: ${orderSummaryText || 'Sem itens detalhados'}`,
      `Valor: ${checkoutTotalValueLabel}`,
      `Nome: ${customerForm.fullName}`,
      `Email: ${customerForm.email}`,
      `Telefone: ${customerForm.phone}`,
      `Char: ${customerForm.charName}`,
      `Level: ${customerForm.charLevel}`,
      `Vocação: ${customerForm.vocation}`,
      `Mundo: ${customerForm.world}`,
      '',
      'Vou enviar o comprovante nesta conversa para conferência.',
    ].join('\n')
  );

  const whatsappRcMessage = encodeURIComponent(
    [
      'Olá! Acabei de concluir o pagamento com Rubini Coins.',
      '',
      `Service: ${selectedServiceTitle}`,
      `Resumo: ${orderSummaryText || 'Sem itens detalhados'}`,
      `Valor em reais: ${checkoutTotalValueLabel}`,
      `Valor em RC: ${rubiniCoinsTotal} RC`,
      `Char atendido: ${customerForm.charName}`,
      `Level: ${customerForm.charLevel}`,
      `Vocação: ${customerForm.vocation}`,
      `Mundo do char: ${customerForm.world}`,
    ].join('\n')
  );

  const whatsappServiceMessage = encodeURIComponent(
  [
    'Olá! Fiz um pedido na FB Services.',
    '',
    `Service: ${selectedServiceTitle}`,
    `Char: ${customerForm.charName}`,
    `Mundo: ${customerForm.world}`,
    `Vocação: ${customerForm.vocation}`,
    `Resumo: ${orderSummaryText || 'Sem itens detalhados'}`,
    '',
    'Quero alinhar os dados para execução do service.',
  ].join('\n')
);

const whatsappRcServiceMessage = encodeURIComponent(
  [
    'Olá! Já fiz o envio das Rubini Coins na FB Services.',
    '',
    `Service: ${selectedServiceTitle}`,
    `Resumo: ${orderSummaryText || 'Sem itens detalhados'}`,
    `Valor em RC: ${rubiniCoinsTotal} RC`,
    `Valor em reais: ${checkoutTotalValueLabel}`,
    `Char do service: ${customerForm.charName}`,
    `Mundo: ${customerForm.world}`,
    `Vocação: ${customerForm.vocation}`,
    '',
    'Já anexei o comprovante no site e quero alinhar os dados para execução do service.',
  ].join('\n')
);

  function updateRcPaymentForm(
    field: keyof RcPaymentForm,
    value: string | File | null
  ) {
    setRcPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPaymentError('');
    setPaymentNotice('');
  }

  function buildProofFilePath(orderId: string, file: File) {
    const safeName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-');

    return `${session?.user?.id ?? 'guest'}/${orderId}/${Date.now()}-${safeName}`;
  }

  async function uploadProofAndAttach({
    file,
    bucket,
    orderId,
  }: {
    file: File;
    bucket: 'pix-proofs' | 'rc-proofs';
    orderId: string;
  }) {
    const filePath = buildProofFilePath(orderId, file);

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: signedData } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);

    const proofUrl = signedData?.signedUrl ?? null;

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        proof_url: proofUrl,
        proof_path: `${bucket}/${filePath}`,
        proof_uploaded_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('user_id', session?.user?.id ?? '');

    if (updateError) {
      throw updateError;
    }

    return {
      proofUrl,
      proofPath: `${bucket}/${filePath}`,
    };
  }

  async function handleCopyPixCode() {
  if (!asaasPixCopyPaste) return;

  try {
    await navigator.clipboard.writeText(asaasPixCopyPaste);
    setCopiedPixCode(true);
    setTimeout(() => setCopiedPixCode(false), 2200);
  } catch {
    setPaymentNotice(
      'Não foi possível copiar automaticamente. Copie manualmente o código abaixo.'
    );
  }
}

  async function handleConfirmPayment() {
  setPaymentError('');
  setPaymentNotice('');

  if (!paymentReady) {
    setPaymentError(
      selectedPaymentMethod === 'rubini'
        ? 'Revise as instruções do envio em Rubini Coins antes de continuar.'
        : 'Complete os dados necessários antes de continuar.'
    );
    return;
  }

  if (!session?.user?.id) {
    setPaymentError('Você precisa estar logado para continuar.');
    return;
  }

  try {
    const servicePayload =
      selectedService === 'rotacao-bosses'
        ? {
            items: selectedBosses,
            timeWindow: bossTimeWindow,
            dayPreference: bossDayPreference,
            notes: bossNotes,
          }
        : selectedService === 'quests-acessos'
        ? {
            items: selectedQuests,
            timeWindow: questTimeWindow,
            dayPreference: questDayPreference,
            notes: questNotes,
          }
        : {
            selectedDates,
            selectedHoursByDate,
          };

    const { data: createdOrder, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id: session.user.id,
          service_type: selectedServiceTitle,
          service_payload: servicePayload,
          customer_name: customerForm.fullName,
          customer_email: customerForm.email,
          customer_phone: customerForm.phone,
          char_name: customerForm.charName,
          char_level: Number(customerForm.charLevel) || 0,
          vocation: customerForm.vocation,
          world: customerForm.world,
          payment_method: selectedPaymentMethod,
          total_brl: checkoutTotalValueNumber || 0,
          total_rc: selectedPaymentMethod === 'rubini' ? rubiniCoinsTotal : 0,
          status: 'pending',
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao salvar pedido:', error);
      setPaymentError(`Erro ao salvar pedido: ${error.message}`);
      return;
    }

    setCurrentOrderId(createdOrder.id);
    setPixReadyForWhatsapp(false);
    setRcReadyForWhatsapp(false);
    setCardAcknowledged(false);
    setPixProofFile(null);
    setAsaasPixQrCodeImage('');
    setAsaasPixCopyPaste('');
    setAsaasInvoiceUrl('');

    if (selectedPaymentMethod === 'rubini') {
      setCheckoutStep(5);
      return;
    }

    const asaasResponse = await fetch('/api/asaas/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customerName: customerForm.fullName,
    customerEmail: customerForm.email,
    customerPhone: customerForm.phone,
    customerCpfCnpj: customerForm.cpfCnpj,
    value: checkoutTotalValueNumber || 0,
    paymentMethod: selectedPaymentMethod === 'card' ? 'card' : 'pix',
    orderId: createdOrder.id,
    description: `${selectedServiceTitle} - ${customerForm.charName}`,
  }),
});

    const asaasData = await asaasResponse.json();

    if (!asaasResponse.ok) {
      setPaymentError(
        asaasData?.error || 'Não foi possível gerar a cobrança no Asaas.'
      );
      return;
    }

    if (selectedPaymentMethod === 'card') {
      if (!asaasData.invoiceUrl) {
        setPaymentError('O Asaas não retornou a URL do checkout do cartão.');
        return;
      }

      window.location.href = asaasData.invoiceUrl;
      return;
    }

    setAsaasInvoiceUrl(asaasData.invoiceUrl || '');
    setAsaasPixQrCodeImage(asaasData.pixQrCodeImage || '');
    setAsaasPixCopyPaste(asaasData.pixCopyPaste || '');
    setCheckoutStep(5);
  } catch (error: any) {
    console.error('Erro inesperado ao salvar pedido:', error);
    setPaymentError(
      `Erro inesperado ao salvar pedido: ${error?.message || 'sem detalhes'}`
    );
  }
}

  const renderAgendaCalendar = (isStandalone = false) => (
    <div
      className={
        isStandalone ? 'mx-auto max-w-[1080px]' : 'mx-auto max-w-[980px]'
      }
    >
      <div className="rounded-[18px] bg-[radial-gradient(circle_at_top,rgba(20,30,58,0.42),rgba(6,12,24,0.94))] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
        <div className="mt-2 rounded-[16px] bg-[#061121]/72 px-3 py-3">
          <div className="flex items-center justify-between rounded-[12px] bg-[#040d1b]/72 px-3 py-2.5 text-white">
            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => Math.max(0, prev - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-200 transition hover:bg-white/5"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-lg font-black md:text-[1.55rem]">
              {monthNames[currentMonth]} De {currentYear}
            </div>

            <button
              type="button"
              onClick={() => setCurrentMonth((prev) => Math.min(11, prev + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-200 transition hover:bg-white/5"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2 text-center text-[12px] font-bold text-zinc-500 md:text-[13px]">
            {weekDays.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthCells.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-[48px]" />;
              }

              const key = formatDateKey(date);
              const selected = selectedDates.includes(key);
              const past = isPastDate(date);
              const soldOut = isSoldOut(date);
              const partial = isPartial(date);
              const sunday = isSunday(date);
              const saturday = isSaturday(date);
              const weekend = sunday || saturday;
              const reservedCount = getReservedCountForDate(key);
              const remainingHours = getRemainingHoursForDate(key);
              const reservedTooltip = getReservedTooltipText(reservedCount);

              let cls =
                'group relative flex h-[48px] items-center justify-center rounded-[13px] border text-[14px] font-semibold transition-all duration-200';

              if (selected) {
                cls +=
                  ' scale-[1.01] border-transparent bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.24)]';
              } else if (past) {
                cls +=
                  ' border-transparent bg-[#111827] text-slate-600 cursor-not-allowed';
              } else if (soldOut) {
                cls += ' border-transparent bg-red-700/90 text-white';
              } else if (partial) {
                cls +=
                  ' border-[rgba(255,255,255,0.04)] bg-[#c8843f]/80 text-white hover:-translate-y-[1px] hover:bg-[#d08f4f]';
              } else if (weekend) {
                cls +=
                  ' border-[rgba(255,255,255,0.04)] bg-[#152238] text-white hover:-translate-y-[1px] hover:bg-[#1d2b45]';
              } else {
                cls +=
                  ' border-[rgba(255,255,255,0.04)] bg-[#121d31] text-white hover:-translate-y-[1px] hover:bg-[#1a2840]';
              }

              return (
                <button
                  key={key}
                  type="button"
                  disabled={past}
                  onClick={() => toggleDate(date)}
                  title={reservedTooltip || undefined}
                  className={cls}
                >
                  {!past && !selected && (
                    <span className="pointer-events-none absolute inset-x-2 top-1.5 h-px rounded-full bg-white/8" />
                  )}

                  {selected && (
                    <span className="pointer-events-none absolute inset-0 rounded-[13px] ring-1 ring-yellow-200/30" />
                  )}

                  <span className="relative z-[1]">{date.getDate()}</span>

                  {remainingHours > 0 && remainingHours <= 3 && !past && (
                    <span className="pointer-events-none absolute bottom-1 right-1 rounded-full bg-yellow-400 px-1.5 py-[1px] text-[9px] font-bold leading-none text-black shadow-[0_2px_8px_rgba(250,204,21,0.25)]">
                      {remainingHours}h
                    </span>
                  )}

                  {reservedCount > 0 && !past && (
                    <span className="pointer-events-none absolute -top-9 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#0b1424]/95 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] group-hover:block">
                      {reservedTooltip}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-[4px] bg-yellow-400" />
              <span>Selecionado</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-[4px] bg-[#c8843f]/75" />
              <span>Parcialmente ocupado</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-[4px] bg-red-700" />
              <span>Esgotado</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-[4px] bg-[#111827]" />
              <span>Data passada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        background:
          'radial-gradient(circle at 50% 14%, rgba(205,215,255,0.14) 0%, transparent 18%), radial-gradient(circle at 52% 18%, rgba(168,140,255,0.30) 0%, rgba(168,140,255,0.12) 14%, transparent 30%), radial-gradient(circle at 62% 24%, rgba(255,85,205,0.18) 0%, transparent 16%), radial-gradient(circle at 18% 28%, rgba(45,110,255,0.16) 0%, transparent 22%), radial-gradient(circle at 84% 34%, rgba(120,130,255,0.10) 0%, transparent 14%), radial-gradient(circle at 50% 100%, rgba(255,104,24,0.30) 0%, rgba(255,104,24,0.10) 16%, transparent 30%), radial-gradient(circle at 62% 84%, rgba(255,180,40,0.16) 0%, transparent 18%), radial-gradient(circle at 28% 88%, rgba(255,70,30,0.10) 0%, transparent 18%), linear-gradient(to bottom, #09101f 0%, #050b17 42%, #040814 72%, #030611 100%)',
      }}
    >
      {/* Orbs nebulosas animadas */}
<div className="orb-1 pointer-events-none absolute left-[-10%] top-[8%] z-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[80px]" />
<div className="orb-2 pointer-events-none absolute right-[-8%] top-[5%] z-0 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/15 blur-[90px]" />
<div className="orb-3 pointer-events-none absolute left-[20%] top-[40%] z-0 h-[20rem] w-[20rem] rounded-full bg-blue-600/12 blur-[70px]" />
<div className="orb-4 pointer-events-none absolute right-[15%] bottom-[10%] z-0 h-[24rem] w-[24rem] rounded-full bg-indigo-500/14 blur-[80px]" />
<div className="pointer-events-none absolute left-1/2 bottom-[-8%] z-0 h-[18rem] w-[40rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />

{/* Aurora horizontal */}
<div className="aurora-1 pointer-events-none absolute left-0 top-[30%] z-0 h-[2px] w-full bg-gradient-to-r from-transparent via-violet-400/20 to-transparent blur-[6px]" />
<div className="aurora-2 pointer-events-none absolute left-0 top-[60%] z-0 h-[2px] w-full bg-gradient-to-r from-transparent via-fuchsia-400/15 to-transparent blur-[6px]" />

{/* Estrelas */}
<div className="pointer-events-none absolute inset-0 z-0">
  {[
    { top: '8%',  left: '12%',  size: 'h-[2px] w-[2px]', dur: '2.4s', delay: '0s' },
    { top: '15%', left: '78%',  size: 'h-[1px] w-[1px]', dur: '3.1s', delay: '0.5s' },
    { top: '22%', left: '45%',  size: 'h-[2px] w-[2px]', dur: '2.8s', delay: '1.2s' },
    { top: '35%', left: '88%',  size: 'h-[1px] w-[1px]', dur: '4.0s', delay: '0.3s' },
    { top: '42%', left: '5%',   size: 'h-[2px] w-[2px]', dur: '3.5s', delay: '0.8s' },
    { top: '55%', left: '62%',  size: 'h-[1px] w-[1px]', dur: '2.6s', delay: '1.5s' },
    { top: '65%', left: '30%',  size: 'h-[2px] w-[2px]', dur: '3.8s', delay: '0.2s' },
    { top: '72%', left: '91%',  size: 'h-[1px] w-[1px]', dur: '2.2s', delay: '1.0s' },
    { top: '80%', left: '18%',  size: 'h-[2px] w-[2px]', dur: '4.2s', delay: '0.7s' },
    { top: '88%', left: '55%',  size: 'h-[1px] w-[1px]', dur: '3.0s', delay: '1.8s' },
    { top: '5%',  left: '55%',  size: 'h-[2px] w-[2px]', dur: '2.9s', delay: '0.4s' },
    { top: '48%', left: '75%',  size: 'h-[1px] w-[1px]', dur: '3.6s', delay: '1.1s' },
  ].map((s, i) => (
    <div
      key={i}
      className={`star absolute ${s.size} rounded-full bg-white`}
      style={{ top: s.top, left: s.left, '--dur': s.dur, animationDelay: s.delay } as React.CSSProperties}
    />
  ))}
</div>

{/* Overlay gradiente geral */}
<div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.04),transparent_22%),linear-gradient(to_bottom,rgba(255,255,255,0.01),transparent_18%,transparent_82%,rgba(0,0,0,0.12))]" />

{paymentSuccessMessage && (
  <div className="fixed top-4 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/20 px-5 py-3 text-sm font-semibold text-emerald-100 shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-md">
    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
    {paymentSuccessMessage}
    <button type="button" onClick={() => setPaymentSuccessMessage('')} className="ml-2 text-emerald-300 hover:text-white">
      <X className="h-4 w-4" />
    </button>
  </div>
)}


      <AnimatePresence>
        {selectedService && activePage === 'home' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-none absolute inset-0 z-0 bg-black/18 backdrop-blur-[1px]"
          />
        )}
      </AnimatePresence>

      <div className="fixed left-2 top-2 z-50 sm:left-3 sm:top-3 md:left-4 md:top-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="group inline-flex items-center gap-2 rounded-full bg-black/35 px-4 py-2.5 text-sm font-semibold text-zinc-100 shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur-md transition hover:border-amber-300/30 hover:bg-black/55 hover:text-white hover:shadow-[0_0_16px_rgba(251,191,36,0.18)]"
          >
            Menu
            <ChevronDown
              className={`h-4 w-4 transition ${
                menuOpen
                  ? 'rotate-180 text-amber-200'
                  : 'text-zinc-300 group-hover:text-amber-200'
              }`}
            />
          </button>

          <div
            className={`absolute left-0 top-[calc(100%+12px)] z-20 w-[230px] rounded-[20px] bg-black/65 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-200 ${
              menuOpen
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none -translate-y-2 opacity-0'
            }`}
          >
            <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 border-l border-t border-white/10 bg-black/65" />
            <div className="flex flex-col gap-1">
              {menuOptions.map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === 'inicio') goToPage('home');
                      if (item.id === 'sobre') goToPage('sobre');
                      if (item.id === 'agenda') goToPage('agenda');
                      if (item.id === 'regras') goToPage('regras');
                      if (item.id === 'feedbacks') goToPage('feedbacks');
                      if (item.id === 'contato') openWhatsappContact();
                    }}
                    className="group/item flex items-center justify-between rounded-[14px] border border-transparent bg-white/0 px-3 py-2.5 text-left transition hover:border-white/10 hover:bg-white/5 hover:shadow-[0_0_12px_rgba(251,191,36,0.12)]"
                    style={{
                      transitionDelay: menuOpen ? `${index * 28}ms` : '0ms',
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-zinc-200 transition group-hover/item:border-amber-300/20 group-hover/item:bg-amber-400/10 group-hover/item:text-amber-100">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-zinc-200 transition group-hover/item:text-white">
                        {item.label}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 text-zinc-500 transition group-hover/item:translate-x-1 group-hover/item:text-amber-200" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed right-2 top-2 z-50 sm:right-3 sm:top-3 md:right-4 md:top-4">
        <div className="relative">
          {!isLoggedIn ? (
            <button
              type="button"
              onClick={() => openAuthPage('login')}
              className="group inline-flex items-center gap-2 rounded-full bg-black/35 px-4 py-2.5 text-sm font-semibold text-zinc-100 shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur-md transition hover:border-amber-300/30 hover:bg-black/55 hover:text-white hover:shadow-[0_0_16px_rgba(251,191,36,0.18)]"
            >
              <span className="flex h-4 w-4 items-center justify-center text-zinc-200">
                <User className="h-4 w-4" />
              </span>
              Login
              <ChevronDown className="h-4 w-4 text-zinc-300 transition group-hover:text-amber-200" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="group inline-flex items-center gap-2 rounded-full bg-black/35 px-4 py-2.5 text-sm font-semibold text-zinc-100 shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur-md transition hover:border-amber-300/30 hover:bg-black/55 hover:text-white hover:shadow-[0_0_16px_rgba(251,191,36,0.18)]"
              >
                <span className="flex h-4 w-4 items-center justify-center text-zinc-200">
                  <User className="h-4 w-4" />
                </span>

                <span className="max-w-[88px] truncate">
                  {userName || 'Usuário'}
                </span>

                <ChevronDown
                  className={`h-4 w-4 transition ${
                    isUserMenuOpen
                      ? 'rotate-180 text-amber-200'
                      : 'text-zinc-300 group-hover:text-amber-200'
                  }`}
                />
              </button>

              <div
                className={`absolute right-0 top-[calc(100%+12px)] z-20 w-[230px] rounded-[20px] bg-black/65 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-200 ${
                  isUserMenuOpen
                    ? 'pointer-events-auto translate-y-0 opacity-100'
                    : 'pointer-events-none -translate-y-2 opacity-0'
                }`}
              >
                <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 border-r border-t border-white/10 bg-black/65" />
                <div className="flex flex-col gap-1">
                  {[
                    { id: 'perfil', label: 'Perfil', icon: User },
                    { id: 'historico', label: 'Histórico', icon: History },
                    { id: 'feedbacks', label: 'Feedbacks', icon: Star },
                    {
                      id: 'deslogar',
                      label: 'Deslogar',
                      icon: LogOut,
                      danger: true,
                    },
                  ].map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);

                          if (item.id === 'perfil') goToPage('perfil');
                          if (item.id === 'historico') goToPage('historico');
                          if (item.id === 'feedbacks') goToPage('feedbacks');
                          if (item.id === 'deslogar') handleLogout();
                        }}
                        className={`group/item flex items-center justify-between rounded-[14px] border border-transparent bg-white/0 px-3 py-2.5 text-left transition hover:border-white/10 hover:bg-white/5 hover:shadow-[0_0_12px_rgba(251,191,36,0.12)] ${
                          item.danger
                            ? 'hover:border-red-300/10 hover:bg-red-500/5 hover:shadow-none'
                            : ''
                        }`}
                        style={{
                          transitionDelay: isUserMenuOpen
                            ? `${index * 28}ms`
                            : '0ms',
                        }}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 transition ${
                              item.danger
                                ? 'text-red-300 group-hover/item:border-red-300/20 group-hover/item:bg-red-400/10 group-hover/item:text-red-200'
                                : 'text-zinc-200 group-hover/item:border-amber-300/20 group-hover/item:bg-amber-400/10 group-hover/item:text-amber-100'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>

                          <span
                            className={`font-medium transition ${
                              item.danger
                                ? 'text-red-300 group-hover/item:text-red-200'
                                : 'text-zinc-200 group-hover/item:text-white'
                            }`}
                          >
                            {item.label}
                          </span>
                        </span>

                        <ChevronRight
                          className={`h-4 w-4 transition ${
                            item.danger
                              ? 'text-red-300/50 group-hover/item:translate-x-1 group-hover/item:text-red-200'
                              : 'text-zinc-500 group-hover/item:translate-x-1 group-hover/item:text-amber-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center px-4 py-6 md:py-8">
        {activePage === 'home' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mt-10 text-center md:mt-6"
            >
              <div className="text-[10px] uppercase tracking-[0.45em] text-zinc-400 md:text-xs">
                On Rubinot
              </div>
              <h1 className="mt-2 text-4xl font-black tracking-[0.14em] text-amber-400 md:text-5xl lg:text-6xl">
                FB SERVICES
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-300 md:text-base">
                Escolha o tipo de service que deseja contratar. A próxima etapa
                vai abrir a seleção de data, horário e detalhes do seu pedido.
              </p>
            </motion.div>

            <div className="mt-8 flex w-full max-w-5xl flex-col gap-3 md:mt-6 md:gap-3.5">
              {serviceOptions.map((service, index) => {
                const Icon = service.icon;
                const active = selectedService === service.id;
                const shouldHide =
                  !!selectedService && selectedService !== service.id;
                const usesIntegratedSchedule =
                  integratedScheduleServiceIds.includes(service.id);
                const isBossService = service.id === 'rotacao-bosses';
                const isQuestService = service.id === 'quests-acessos';

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{
                      opacity: shouldHide ? 0 : 1,
                      y: shouldHide ? -10 : 0,
                      height: shouldHide ? 0 : 'auto',
                    }}
                    transition={{
                      duration: 0.25,
                      ease: 'easeOut',
                      delay: shouldHide ? 0 : index * 0.04,
                    }}
                    className={
                      shouldHide ? 'pointer-events-none overflow-hidden' : ''
                    }
                  >
                    <motion.button
                      whileHover={{ y: -6, scale: active ? 1.015 : 1.01 }}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => toggleService(service.id)}
                      className={`group relative w-full overflow-hidden rounded-[24px] border bg-black/45 px-5 py-4 text-left backdrop-blur-md transition ${
                        service.border
                      } ${
                        active
                          ? 'border-amber-300/40 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_0_18px_rgba(251,146,60,0.14),0_10px_26px_rgba(0,0,0,0.24)]'
                          : 'shadow-[0_8px_22px_rgba(0,0,0,0.18)] hover:shadow-[0_0_12px_rgba(251,191,36,0.08),0_8px_22px_rgba(0,0,0,0.18)]'
                      }`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${
                          service.glow
                        } ${active ? 'opacity-100' : 'opacity-80'}`}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05),transparent_26%,transparent)]" />

                      {active && (
                        <>
                          <motion.div
                            initial={{ opacity: 0.45, scale: 0.95 }}
                            animate={{
                              opacity: [0.25, 0.5, 0.3],
                              scale: [0.96, 1.03, 0.98],
                            }}
                            transition={{
                              duration: 1.1,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className="absolute -left-6 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-orange-400/12 blur-2xl"
                          />
                          <motion.div
                            initial={{ opacity: 0.35, scale: 0.95 }}
                            animate={{
                              opacity: [0.18, 0.4, 0.22],
                              scale: [0.96, 1.02, 0.98],
                            }}
                            transition={{
                              duration: 1.15,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: 0.12,
                            }}
                            className="absolute right-6 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-amber-300/10 blur-xl"
                          />
                        </>
                      )}

                      <div className="relative z-10 flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${service.iconBg}`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h2
                            className="truncate font-black leading-none text-white"
                            style={{
                              fontSize: 'clamp(1.05rem,1.55vw,1.55rem)',
                            }}
                          >
                            {service.title}
                          </h2>
                          <p className="mt-0.5 truncate text-sm text-zinc-300 md:text-[0.95rem]">
                            {service.subtitle}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className={`hidden rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] md:block ${
                              active
                                ? 'border-amber-300/30 bg-amber-300/10 text-amber-100'
                                : 'border-white/10 bg-white/5 text-zinc-300'
                            }`}
                          >
                            {active ? 'Selecionado' : 'Abrir'}
                          </div>
                          <ChevronRight
                            className={`h-5 w-5 shrink-0 transition ${
                              active
                                ? 'rotate-90 text-amber-200'
                                : 'text-zinc-400 group-hover:translate-x-1 group-hover:text-white'
                            }`}
                          />
                        </div>
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {active &&
                        checkoutStep === 2 &&
                        usesIntegratedSchedule && (
                          <motion.section
                            initial={{
                              opacity: 0,
                              y: -10,
                              filter: 'blur(3px)',
                              height: 0,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              filter: 'blur(0px)',
                              height: 'auto',
                            }}
                            exit={{
                              opacity: 0,
                              y: -8,
                              filter: 'blur(2px)',
                              height: 0,
                            }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="mt-2 overflow-hidden px-1"
                          >
                            <div className="rounded-[20px] bg-[#08101e]/88 px-3 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur-md">
                              {renderAgendaCalendar(false)}

                              <div className="mx-auto mt-4 max-w-[980px] rounded-[16px] bg-[#07111f]/82 px-4 py-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-md">
                                <div className="flex items-center justify-between gap-3">
                                  <h3 className="text-[17px] font-black tracking-[-0.02em] text-white md:text-[19px]">
                                    Selecione os horários para cada data:
                                  </h3>
                                </div>

                                <div className="mt-3 rounded-[12px] border border-[#2d64c8]/25 bg-[#11224c]/32 px-3.5 py-2.5">
                                  <div className="text-[13px] font-bold text-sky-200">
                                    Horário de Atendimento:{' '}
                                    {getAttendanceText(activeHoursTab)}
                                  </div>
                                  <p className="mt-1 text-[13px] text-slate-300/72">
                                    Selecione pelo menos 1 horário para cada
                                    data. Cada data pode ter horários
                                    diferentes.
                                  </p>
                                </div>

                                {activeHoursTab && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {selectedDates.map((dateKey) => {
                                      const selectedCount = (
                                        selectedHoursByDate[dateKey] ?? []
                                      ).length;
                                      const isActive =
                                        activeHoursTab === dateKey;

                                      return (
                                        <button
                                          key={dateKey}
                                          type="button"
                                          onClick={() =>
                                            setActiveDateTab(dateKey)
                                          }
                                          className={`rounded-[11px] px-3.5 py-2 text-[13px] font-bold transition-all duration-200 ${
                                            isActive
                                              ? 'bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.22)]'
                                              : 'border border-emerald-500/40 bg-emerald-950/25 text-emerald-300 hover:-translate-y-[1px] hover:bg-emerald-900/25'
                                          }`}
                                        >
                                          {formatShortDate(dateKey)} (
                                          {selectedCount}h)
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {activeHoursTab ? (
                                  <>
                                    <div className="mt-3 text-[16px] font-black tracking-[-0.02em] text-white md:text-[18px]">
                                      Horários para{' '}
                                      {formatDateDisplay(activeHoursTab)}:
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                      {activeHoursForDate.map((hour) => {
                                        const selected = (
                                          selectedHoursByDate[activeHoursTab] ??
                                          []
                                        ).includes(hour);
                                        const reserved =
                                          activeReservedForDate.includes(hour);

                                        return (
                                          <button
                                            key={`${activeHoursTab}-${hour}`}
                                            type="button"
                                            disabled={reserved}
                                            onClick={() =>
                                              !reserved &&
                                              toggleHour(activeHoursTab, hour)
                                            }
                                            className={`h-[42px] rounded-[12px] border text-[14px] font-bold transition-all duration-200 ${
                                              reserved
                                                ? 'cursor-not-allowed border-slate-800 bg-[#0b1322] text-slate-600'
                                                : selected
                                                ? 'border-yellow-400 bg-yellow-400/12 text-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.14)]'
                                                : 'border-slate-600/60 bg-[#131d2d]/70 text-slate-200 hover:-translate-y-[1px] hover:border-slate-400 hover:bg-[#18253a]'
                                            }`}
                                          >
                                            {hour}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </>
                                ) : (
                                  <div className="mt-4 rounded-[14px] border border-amber-500/15 bg-amber-500/8 px-4 py-3 text-sm text-amber-200/90">
                                    Selecione pelo menos uma data no calendário
                                    para liberar os horários.
                                  </div>
                                )}

                                {hasAnySelectedHour && (
                                  <>
                                    <div className="mt-4 rounded-[14px] border border-emerald-300/30 bg-[linear-gradient(135deg,rgba(34,197,94,0.18),rgba(6,78,59,0.28))] px-4 py-3 text-emerald-50 shadow-[0_8px_22px_rgba(34,197,94,0.08)]">
                                      <div className="text-[13px] font-black text-emerald-100">
                                        Resumo de horários selecionados:
                                      </div>

                                      <div className="mt-2.5 space-y-1.5 text-[13px] leading-relaxed text-emerald-50">
                                        {selectedDateTabs.map((dateKey) => {
                                          const hours =
                                            selectedHoursByDate[dateKey] ?? [];

                                          return (
                                            <div key={dateKey}>
                                              {formatDateDisplay(dateKey)}:{' '}
                                              {hours.join(', ')} ({hours.length}
                                              h)
                                            </div>
                                          );
                                        })}
                                      </div>

                                      <div className="mt-4 h-px bg-emerald-200/10" />

                                      <div className="mt-2.5 text-[14px] font-black text-emerald-100">
                                        Total: {totalSelectedHours}h
                                      </div>
                                    </div>
                                    <div className="mt-4 rounded-[16px] border border-amber-300/30 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),rgba(120,90,20,0.28))] px-4 py-4 shadow-[0_10px_26px_rgba(251,191,36,0.10)]">
                                      <div className="text-[14px] text-amber-100/85">
                                        Valor Total:
                                      </div>

                                      <div className="mt-2 text-[28px] font-black leading-none tracking-[-0.03em] text-[#ffd86b] md:text-[36px]">
                                        R${' '}
                                        {totalPrice
                                          .toFixed(2)
                                          .replace('.', ',')}
                                      </div>

                                      <div className="mt-3 space-y-1 text-[13px] text-amber-100/80 md:text-[14px]">
                                        <div>
                                          {weekdayHoursCount}h em dias de semana
                                          × R$ {weekdayRate}/h
                                        </div>
                                        <div>
                                          {weekendHoursCount}h em fim de semana
                                          × R$ {weekendRate}/h
                                        </div>
                                      </div>

                                      <div className="mt-3 text-[12px] leading-relaxed text-amber-200/60 md:text-[13px]">
                                        Dica: {getPricingHint(selectedService)}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={handleGoToCustomerDataStep}
                                      disabled={!canContinueToCustomerData}
                                      className={`mt-4 h-[46px] w-full rounded-[14px] text-[15px] font-black transition-all duration-200 ${
                                        integratedScheduleReady
                                          ? 'border border-cyan-300/10 bg-[linear-gradient(180deg,#155e75,#0f3f53)] text-white shadow-[0_10px_22px_rgba(21,94,117,0.24)] hover:-translate-y-[1px] hover:brightness-105'
                                          : 'cursor-not-allowed bg-white/10 text-zinc-500 shadow-none'
                                      }`}
                                    >
                                      Continuar para Dados Pessoais
                                    </button>
                                    {!isLoggedIn ? (
                                      <p className="mt-2 text-[12px] text-amber-200/80">
                                        Faça login para continuar para os dados
                                        pessoais.
                                      </p>
                                    ) : !canContinueToCustomerData ? (
                                      <p className="mt-2 text-[12px] text-amber-200/80">
                                        Complete todas as seleções obrigatórias
                                        para continuar.
                                      </p>
                                    ) : null}
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.section>
                        )}

                      {active && checkoutStep === 2 && isBossService && (
                        <motion.section
                          initial={{
                            opacity: 0,
                            y: -10,
                            filter: 'blur(8px)',
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            height: 'auto',
                          }}
                          exit={{
                            opacity: 0,
                            y: -8,
                            filter: 'blur(6px)',
                            height: 0,
                          }}
                          transition={{ duration: 0.28, ease: 'easeOut' }}
                          className="mt-2 overflow-hidden px-1"
                        >
                          <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(7,14,28,0.96),rgba(4,10,22,0.94))] px-5 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.34)] backdrop-blur-md">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_22%)]" />

                            <div className="relative mx-auto max-w-[980px]">
                              <div className="relative rounded-[24px] bg-[linear-gradient(180deg,rgba(9,18,38,0.92),rgba(6,12,24,0.84))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.22)]">
                                <div className="text-[19px] font-black tracking-[-0.02em] text-white md:text-[24px]">
                                  Monte sua rotação de bosses
                                </div>
                                <p className="mt-2 text-sm text-zinc-300">
                                  Selecione os bosses desejados, acompanhe o
                                  valor da rotação em tempo real e informe a
                                  faixa de horário que melhor combina com você.
                                </p>
                                <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                                  <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(8,24,52,0.72),rgba(5,14,30,0.58))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <div className="text-[13px] font-black uppercase tracking-[0.16em] text-sky-200">
                                      Seleção de bosses
                                    </div>

                                    <div
                                      className="relative mt-3"
                                      ref={bossDropdownRef}
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setBossDropdownOpen((prev) => !prev)
                                        }
                                        className="flex h-[52px] w-full items-center justify-between rounded-[16px] bg-[linear-gradient(180deg,rgba(13,21,39,0.96),rgba(10,18,33,0.92))] px-4 text-left text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_20px_rgba(0,0,0,0.16)] transition hover:-translate-y-[1px] hover:bg-[#121c33]"
                                      >
                                        <span>
                                          Selecione os bosses da rotação
                                        </span>
                                        <ChevronDown
                                          className={`h-4 w-4 text-zinc-300 transition ${
                                            bossDropdownOpen ? 'rotate-180' : ''
                                          }`}
                                        />
                                      </button>

                                      <AnimatePresence>
                                        {bossDropdownOpen && (
                                          <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.18 }}
                                            className="boss-quest-scroll absolute z-20 mt-3 max-h-[280px] w-full overflow-y-auto rounded-[18px] bg-[linear-gradient(180deg,rgba(10,17,32,0.98),rgba(8,14,28,0.97))] p-2 pr-1 shadow-[0_26px_56px_rgba(0,0,0,0.46)] backdrop-blur-md"
                                            style={{
                                              scrollbarWidth: 'thin',
                                              scrollbarColor:
                                                'rgba(255,255,255,0.14) transparent',
                                            }}
                                          >
                                            <div className="flex flex-col gap-1">
                                              {bossOptions.map((boss) => {
                                                const alreadySelected =
                                                  selectedBosses.includes(boss);

                                                return (
                                                  <button
                                                    key={boss}
                                                    type="button"
                                                    disabled={alreadySelected}
                                                    onClick={() =>
                                                      addBoss(boss)
                                                    }
                                                    className={`flex items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-sm transition ${
                                                      alreadySelected
                                                        ? 'cursor-not-allowed bg-white/[0.04] text-zinc-500'
                                                        : 'text-white hover:bg-sky-400/[0.08]'
                                                    }`}
                                                  >
                                                    <span>{boss}</span>
                                                    {alreadySelected && (
                                                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                                                        Selecionado
                                                      </span>
                                                    )}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    <div className="mt-4">
                                      <div className="text-[12px] font-black uppercase tracking-[0.14em] text-zinc-400">
                                        Bosses escolhidos
                                      </div>

                                      {selectedBosses.length === 0 ? (
                                        <div className="mt-3 rounded-[16px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-sm text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                          Nenhum boss selecionado ainda.
                                        </div>
                                      ) : (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          {selectedBosses.map((boss) => (
                                            <div
                                              key={boss}
                                              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,rgba(56,189,248,0.16),rgba(14,116,144,0.14))] px-3.5 py-2 text-sm font-medium text-sky-100 shadow-[0_8px_18px_rgba(14,116,144,0.12)]"
                                            >
                                              <span>{boss}</span>
                                              <button
                                                type="button"
                                                onClick={() => removeBoss(boss)}
                                                className="rounded-full p-1 text-sky-200/80 transition hover:bg-white/10 hover:text-white"
                                              >
                                                <X className="h-3.5 w-3.5" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,rgba(42,31,12,0.92),rgba(24,18,10,0.84))] px-5 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.28),0_0_30px_rgba(251,191,36,0.08)]">
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.20),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_24%)]" />

                                    <div className="relative">
                                      <div className="text-[12px] font-black uppercase tracking-[0.18em] text-amber-100/90">
                                        Resumo da rotação
                                      </div>

                                      <div className="mt-4 space-y-3 text-[14px] text-zinc-300">
                                        <div className="flex items-center justify-between gap-3">
                                          <span>Bosses selecionados</span>
                                          <span className="font-bold text-white">
                                            {bossCount}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                          <span>Valor atual por boss</span>
                                          <span className="font-bold text-white">
                                            R${' '}
                                            {bossRate
                                              .toFixed(2)
                                              .replace('.', ',')}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                          <span>Duração estimada</span>
                                          <span className="font-bold text-white">
                                            1h a 4h
                                          </span>
                                        </div>
                                      </div>

                                      <div className="mt-4 h-px bg-amber-200/10" />

                                      <div className="mt-4">
                                        <div className="text-[13px] text-amber-100/80">
                                          Valor total da rotação
                                        </div>
                                        <div className="mt-2 text-[34px] font-black leading-none tracking-[-0.04em] text-[#ffd86b] drop-shadow-[0_0_10px_rgba(255,216,107,0.10)]">
                                          R${' '}
                                          {bossTotal
                                            .toFixed(2)
                                            .replace('.', ',')}
                                        </div>
                                      </div>

                                      <div className="mt-4 text-[12px] leading-relaxed text-amber-100/65">
                                        1 a 4 bosses: R$ 10,00 por kill • 5 a 15
                                        bosses: R$ 9,00 por kill • 16 bosses em
                                        diante: R$ 8,00 por kill.
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-5 rounded-[20px] bg-[linear-gradient(135deg,rgba(8,46,44,0.72),rgba(5,18,24,0.78))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_12px_28px_rgba(0,0,0,0.18)]">
                                  <div className="text-[13px] font-black uppercase tracking-[0.14em] text-emerald-200">
                                    Aviso importante
                                  </div>
                                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                                    A duração da rotação pode variar conforme
                                    vocação, level, set, PT, mundo, horário e
                                    outros fatores. A contratação é pela
                                    rotação/kills, não pelo tempo.
                                  </p>
                                </div>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                  <div className="rounded-[20px] bg-[linear-gradient(180deg,rgba(11,20,39,0.82),rgba(7,14,28,0.78))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <div className="text-[13px] font-black uppercase tracking-[0.14em] text-zinc-300">
                                      Preferência de dia
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {['Dia de semana', 'Fim de semana'].map(
                                        (option) => {
                                          const selected =
                                            bossDayPreference === option;

                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              onClick={() =>
                                                setBossDayPreference(option)
                                              }
                                              className={`rounded-[14px] px-3.5 py-2 text-[13px] font-bold transition-all duration-200 ${
                                                selected
                                                  ? 'bg-[linear-gradient(180deg,#ffd84d,#facc15)] text-black shadow-[0_0_16px_rgba(250,204,21,0.28),0_8px_18px_rgba(250,204,21,0.14)]'
                                                  : 'bg-white/[0.04] text-slate-200 hover:-translate-y-[1px] hover:bg-white/[0.08]'
                                              }`}
                                            >
                                              {option}
                                            </button>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>

                                  <div className="rounded-[20px] bg-[linear-gradient(180deg,rgba(11,20,39,0.82),rgba(7,14,28,0.78))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <div className="text-[13px] font-black uppercase tracking-[0.14em] text-zinc-300">
                                      Faixa de horário
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {bossTimeWindows.map((window) => {
                                        const selected =
                                          bossTimeWindow === window;

                                        return (
                                          <button
                                            key={window}
                                            type="button"
                                            onClick={() =>
                                              setBossTimeWindow(window)
                                            }
                                            className={`h-[44px] rounded-[14px] px-3.5 py-2 text-[13px] font-bold transition-all duration-200 ${
                                              selected
                                                ? 'bg-[linear-gradient(180deg,#ffd84d,#facc15)] text-black shadow-[0_0_16px_rgba(250,204,21,0.28),0_8px_18px_rgba(250,204,21,0.14)]'
                                                : 'bg-white/[0.04] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-[1px] hover:bg-white/[0.08]'
                                            }`}
                                          >
                                            {window}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-5 rounded-[22px] bg-[linear-gradient(180deg,rgba(10,18,34,0.86),rgba(6,12,24,0.82))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_16px_34px_rgba(0,0,0,0.18)]">
                                  <div className="text-[13px] font-black uppercase tracking-[0.14em] text-zinc-300">
                                    Observações
                                  </div>
                                  <textarea
                                    value={bossNotes}
                                    onChange={(e) =>
                                      setBossNotes(e.target.value)
                                    }
                                    rows={6}
                                    placeholder="Informe sua preferência de horário e qualquer detalhe importante para a sua rotação. Após a confirmação do pagamento, entraremos em contato via WhatsApp para alinhar o dia e o horário exato de início."
                                    className="relative z-10 mt-3 min-h-[170px] w-full resize-none rounded-[18px] bg-[#0f1728] px-4 py-3 text-sm leading-relaxed text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-sky-300/20 focus:bg-[#111b2e] focus:ring-0"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleGoToCustomerDataStep}
                                  disabled={!canContinueToCustomerData}
                                  className={`mt-4 h-[46px] w-full rounded-[14px] text-[15px] font-black transition-all duration-200 ${
                                    bossFlowReady
                                      ? 'border border-cyan-300/10 bg-[linear-gradient(180deg,#155e75,#0f3f53)] text-white shadow-[0_10px_22px_rgba(21,94,117,0.24)] hover:-translate-y-[1px] hover:brightness-105'
                                      : 'cursor-not-allowed bg-white/10 text-zinc-500 shadow-none'
                                  }`}
                                >
                                  Continuar para Dados Pessoais
                                </button>
                                {!isLoggedIn ? (
                                  <p className="mt-2 text-[12px] text-amber-200/80">
                                    Faça login para continuar para os dados
                                    pessoais.
                                  </p>
                                ) : !canContinueToCustomerData ? (
                                  <p className="mt-2 text-[12px] text-amber-200/80">
                                    Complete todas as seleções obrigatórias para
                                    continuar.
                                  </p>
                                ) : null}
                              
                              </div>
                            </div>
                          </div>
                        </motion.section>
                      )}

                      {active && checkoutStep === 2 && isQuestService && (
                        <motion.section
                          initial={{
                            opacity: 0,
                            y: -10,
                            filter: 'blur(8px)',
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            height: 'auto',
                          }}
                          exit={{
                            opacity: 0,
                            y: -8,
                            filter: 'blur(6px)',
                            height: 0,
                          }}
                          transition={{ duration: 0.28, ease: 'easeOut' }}
                          className="mt-2 overflow-hidden px-1"
                        >
                          <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(8,13,30,0.96),rgba(5,9,22,0.94))] px-5 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.34)] backdrop-blur-md">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_22%)]" />

                            <div className="relative mx-auto max-w-[980px]">
                              <div className="relative rounded-[24px] bg-[linear-gradient(180deg,rgba(15,16,42,0.92),rgba(8,10,28,0.86))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.22)]">
                                <div className="text-[19px] font-black tracking-[-0.02em] text-white md:text-[24px]">
                                  Monte seu pedido de quests e acessos
                                </div>
                                <p className="mt-2 text-sm text-zinc-300">
                                  Selecione as quests desejadas, acompanhe um
                                  valor base em tempo real e informe a faixa de
                                  horário que melhor combina com você.
                                </p>
                                <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                                  <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(34,15,60,0.64),rgba(12,10,32,0.56))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <div className="text-[13px] font-black uppercase tracking-[0.16em] text-violet-200">
                                      Seleção de quests
                                    </div>

                                    <div
                                      className="relative mt-4"
                                      ref={questDropdownRef}
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setQuestDropdownOpen((prev) => !prev)
                                        }
                                        className="flex h-[52px] w-full items-center justify-between rounded-[16px] bg-[linear-gradient(180deg,rgba(18,19,42,0.96),rgba(10,12,32,0.92))] px-4 text-left text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_20px_rgba(0,0,0,0.16)] transition hover:-translate-y-[1px] hover:bg-[#181a3b]"
                                      >
                                        <span>Selecione quests principais</span>
                                        <ChevronDown
                                          className={`h-4 w-4 text-zinc-300 transition ${
                                            questDropdownOpen
                                              ? 'rotate-180'
                                              : ''
                                          }`}
                                        />
                                      </button>

                                      <AnimatePresence>
                                        {questDropdownOpen && (
                                          <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.18 }}
                                            className="boss-quest-scroll absolute z-20 mt-3 max-h-[300px] w-full overflow-y-auto rounded-[18px] bg-[linear-gradient(180deg,rgba(18,15,38,0.98),rgba(10,10,28,0.97))] p-2 pr-1 shadow-[0_26px_56px_rgba(0,0,0,0.46)] backdrop-blur-md"
                                            style={{
                                              scrollbarWidth: 'thin',
                                              scrollbarColor:
                                                'rgba(255,255,255,0.14) transparent',
                                            }}
                                          >
                                            <div className="flex flex-col gap-1">
                                              {questOptions.map((quest) => {
                                                const alreadySelected =
                                                  selectedQuests.includes(
                                                    quest
                                                  );

                                                return (
                                                  <button
                                                    key={quest}
                                                    type="button"
                                                    disabled={alreadySelected}
                                                    onClick={() =>
                                                      addQuest(quest)
                                                    }
                                                    className={`flex items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-sm transition ${
                                                      alreadySelected
                                                        ? 'cursor-not-allowed bg-white/[0.04] text-zinc-500'
                                                        : 'text-white hover:bg-violet-400/[0.08]'
                                                    }`}
                                                  >
                                                    <span>{quest}</span>
                                                    {alreadySelected && (
                                                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet-300">
                                                        Selecionado
                                                      </span>
                                                    )}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>

                                    <div className="mt-4">
                                      <div className="text-[12px] font-black uppercase tracking-[0.14em] text-zinc-400">
                                        Quests selecionadas
                                      </div>

                                      {selectedQuests.length === 0 ? (
                                        <div className="mt-3 rounded-[16px] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-3 text-sm text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                          Nenhuma quest selecionada ainda.
                                        </div>
                                      ) : (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          {selectedQuests.map((quest) => (
                                            <div
                                              key={quest}
                                              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(180deg,rgba(168,85,247,0.18),rgba(109,40,217,0.14))] px-3.5 py-2 text-sm font-medium text-violet-100 shadow-[0_8px_18px_rgba(109,40,217,0.12)]"
                                            >
                                              <span>{quest}</span>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeQuest(quest)
                                                }
                                                className="rounded-full p-1 text-violet-200/80 transition hover:bg-white/10 hover:text-white"
                                              >
                                                <X className="h-3.5 w-3.5" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,rgba(28,15,50,0.92),rgba(16,10,30,0.84))] px-5 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.28),0_0_30px_rgba(168,85,247,0.08)]">
                                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_24%)]" />

                                    <div className="relative">
                                      <div className="text-[12px] font-black uppercase tracking-[0.18em] text-violet-100/90">
                                        Resumo do pedido
                                      </div>

                                      <div className="mt-4 space-y-3 text-[14px] text-zinc-300">
                                        <div className="flex items-center justify-between gap-3">
                                          <span>Quests selecionadas</span>
                                          <span className="font-bold text-white">
                                            {selectedQuests.length}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="mt-4 h-px bg-violet-200/10" />

                                      <div className="mt-4">
                                        <div className="text-[13px] text-violet-100/80">
                                          Valor estimado
                                        </div>

                                        {selectedQuests.length === 0 ? (
                                          <div className="mt-2 text-[20px] font-bold text-zinc-400">
                                            Selecione uma quest
                                          </div>
                                        ) : (
                                          <div className="mt-2 text-[30px] font-black leading-none tracking-[-0.04em] text-[#d8b4fe] drop-shadow-[0_0_10px_rgba(216,180,254,0.12)]">
                                            R${' '}
                                            {questTotal
                                              .toFixed(2)
                                              .replace('.', ',')}
                                          </div>
                                        )}

                                        <div className="mt-3 text-[12px] text-violet-100/65">
                                          Valores base. Pode variar conforme
                                          level, vocação e necessidade de PT.
                                        </div>

                                        <div className="mt-4 rounded-[14px] border border-violet-400/15 bg-violet-500/[0.04] px-4 py-3 text-[12px] leading-relaxed text-violet-100/75">
                                          <span className="mb-1 block font-bold text-violet-200">
                                            Política de valores
                                          </span>
                                          Os serviços de quests e acessos têm
                                          valor médio de <b>R$ 80,00</b>,
                                          enquanto as <b>main quests</b> possuem
                                          valor fixado em <b>R$ 110,00</b>,
                                          devido ao maior nível de complexidade
                                          e demanda.
                                          <br />
                                          <br />O cálculo é feito com base em{' '}
                                          <b>R$ 20,00 por hora</b>, considerando
                                          uma média de até{' '}
                                          <b>4 horas por service</b>.
                                          <br />
                                          <br />
                                          Caso a execução seja finalizada antes
                                          do tempo estimado, o valor excedente é{' '}
                                          <b>devolvido proporcionalmente</b> ao
                                          cliente, garantindo um atendimento
                                          justo e transparente.
                                        </div>

                                        {selectedQuests.includes(
                                          'Soul War 50/50'
                                        ) && (
                                          <div className="mt-3 text-[12px] leading-relaxed text-violet-100/65">
                                            Soul War 50/50: R$ 55,00 + divisão
                                            do drop.
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-5 rounded-[20px] bg-[linear-gradient(135deg,rgba(17,65,78,0.56),rgba(10,18,32,0.78))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_12px_28px_rgba(0,0,0,0.18)]">
                                  <div className="text-[13px] font-black uppercase tracking-[0.14em] text-cyan-200">
                                    Aviso importante
                                  </div>
                                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                                    O valor e a execução podem variar conforme o
                                    conteúdo escolhido, seu level, vocação,
                                    necessidade de ajuda extra, etapas já
                                    concluídas no personagem e quantidade de
                                    pessoas necessárias.
                                  </p>
                                </div>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                  <div className="rounded-[20px] bg-[linear-gradient(180deg,rgba(11,20,39,0.82),rgba(7,14,28,0.78))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <div className="text-[13px] font-black uppercase tracking-[0.14em] text-zinc-300">
                                      Preferência de dia
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {['Dia de semana', 'Fim de semana'].map(
                                        (option) => {
                                          const selected =
                                            questDayPreference === option;

                                          return (
                                            <button
                                              key={option}
                                              type="button"
                                              onClick={() =>
                                                setQuestDayPreference(option)
                                              }
                                              className={`rounded-[14px] px-3.5 py-2 text-[13px] font-bold transition-all duration-200 ${
                                                selected
                                                  ? 'bg-[linear-gradient(180deg,#c084fc,#a855f7)] text-white shadow-[0_0_16px_rgba(168,85,247,0.24),0_8px_18px_rgba(168,85,247,0.14)]'
                                                  : 'bg-white/[0.04] text-slate-200 hover:-translate-y-[1px] hover:bg-white/[0.08]'
                                              }`}
                                            >
                                              {option}
                                            </button>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>

                                  <div className="rounded-[20px] bg-[linear-gradient(180deg,rgba(11,20,39,0.82),rgba(7,14,28,0.78))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <div className="text-[13px] font-black uppercase tracking-[0.14em] text-zinc-300">
                                      Faixa de horário
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {questTimeWindows.map((window) => {
                                        const selected =
                                          questTimeWindow === window;

                                        return (
                                          <button
                                            key={window}
                                            type="button"
                                            onClick={() =>
                                              setQuestTimeWindow(window)
                                            }
                                            className={`h-[44px] rounded-[14px] px-3.5 py-2 text-[13px] font-bold transition-all duration-200 ${
                                              selected
                                                ? 'bg-[linear-gradient(180deg,#c084fc,#a855f7)] text-white shadow-[0_0_16px_rgba(168,85,247,0.24),0_8px_18px_rgba(168,85,247,0.14)]'
                                                : 'bg-white/[0.04] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-[1px] hover:bg-white/[0.08]'
                                            }`}
                                          >
                                            {window}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-5 rounded-[22px] bg-[linear-gradient(180deg,rgba(10,18,34,0.86),rgba(6,12,24,0.82))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_16px_34px_rgba(0,0,0,0.18)]">
                                  <div className="text-[13px] font-black uppercase tracking-[0.14em] text-zinc-300">
                                    Observações
                                  </div>
                                  <textarea
                                    value={questNotes}
                                    onChange={(e) =>
                                      setQuestNotes(e.target.value)
                                    }
                                    rows={6}
                                    placeholder="Informe detalhes importantes sobre sua quest. Exemplo: objetivo principal, etapa já feita, necessidade de ajuda em boss final, pré-requisitos e qualquer outra informação útil."
                                    className="relative z-10 mt-3 min-h-[170px] w-full resize-none rounded-[18px] bg-[#0f1728] px-4 py-3 text-sm leading-relaxed text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-violet-300/20 focus:bg-[#111b2e] focus:ring-0"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleGoToCustomerDataStep}
                                  disabled={!canContinueToCustomerData}
                                  className={`mt-4 h-[46px] w-full rounded-[14px] text-[15px] font-black transition-all duration-200 ${
                                    questFlowReady
                                      ? 'border border-cyan-300/10 bg-[linear-gradient(180deg,#155e75,#0f3f53)] text-white shadow-[0_10px_22px_rgba(21,94,117,0.24)] hover:-translate-y-[1px] hover:brightness-105'
                                      : 'cursor-not-allowed bg-white/10 text-zinc-500 shadow-none'
                                  }`}
                                >
                                  Continuar para Dados Pessoais
                                </button>
                                {!isLoggedIn ? (
                                  <p className="mt-2 text-[12px] text-amber-200/80">
                                    Faça login para continuar para os dados
                                    pessoais.
                                  </p>
                                ) : !canContinueToCustomerData ? (
                                  <p className="mt-2 text-[12px] text-amber-200/80">
                                    Complete todas as seleções obrigatórias para
                                    continuar.
                                  </p>
                                ) : null}
                                
                              </div>
                            </div>
                          </div>
                        </motion.section>
                      )}

                      {active &&
                        checkoutStep === 2 &&
                        !usesIntegratedSchedule &&
                        !isBossService &&
                        !isQuestService && (
                          <motion.section
                            initial={{
                              opacity: 0,
                              y: -10,
                              filter: 'blur(8px)',
                              height: 0,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              filter: 'blur(0px)',
                              height: 'auto',
                            }}
                            exit={{
                              opacity: 0,
                              y: -8,
                              filter: 'blur(6px)',
                              height: 0,
                            }}
                            transition={{ duration: 0.28, ease: 'easeOut' }}
                            className="mt-2 overflow-hidden px-1"
                          >
                            <div className="rounded-[18px] bg-[#08101e]/82 px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-md">
                              <div className="text-center text-zinc-300">
                                Este service terá um fluxo diferente. Vamos
                                montar depois.
                              </div>
                            </div>
                          </motion.section>
                        )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {selectedService && checkoutStep === 3 && (
              <motion.section
                ref={customerStepTopRef}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-4 w-full max-w-4xl"
              >
                <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(9,17,40,0.96),rgba(6,12,28,0.94))] shadow-[0_24px_60px_rgba(0,0,0,0.30)]">
                  <div className="bg-black/20 px-5 py-4 md:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep(2)}
                        className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-300 transition hover:text-white"
                      >
                        ← Voltar
                      </button>

                      <h2 className="text-center text-[24px] font-black tracking-[-0.03em] text-white md:text-[30px]">
                        Informações do Agendamento
                      </h2>

                      <div className="w-[52px]" />
                    </div>
                  </div>

                  <div className="px-5 py-6 md:px-6">
                    <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-5 shadow-[0_16px_34px_rgba(0,0,0,0.14)]">
                      <h3 className="text-[18px] font-black tracking-[-0.02em] text-white">
                        Resumo
                      </h3>

                      <div className="mt-4 space-y-3 text-[14px] text-zinc-300">
                        <p>
                          <span className="font-semibold text-white">
                            Service:
                          </span>{' '}
                          {serviceOptions.find(
                            (item) => item.id === selectedService
                          )?.title ?? 'Não selecionado'}
                        </p>

                        <div>
                          <span className="font-semibold text-white">
                            Agendamentos:
                          </span>

                          <div className="mt-2 space-y-2">
                            {checkoutSummaryItems.length > 0 ? (
                              checkoutSummaryItems.map((item) => (
                                <div
                                  key={`${item.label}-${item.hours}`}
                                  className="rounded-[16px] bg-black/10 px-3.5 py-3 text-[13px] text-zinc-300"
                                >
                                  <div className="font-semibold text-white">
                                    {item.label}
                                  </div>
                                  <div className="mt-1 text-zinc-400">
                                    {item.hours}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="rounded-[16px] bg-black/10 px-3.5 py-3 text-[13px] text-zinc-400">
                                Nenhum agendamento ou seleção confirmada ainda.
                              </div>
                            )}
                          </div>
                        </div>

                        <p>
                          <span className="font-semibold text-white">
                            Total:
                          </span>{' '}
                          {checkoutTotalHoursLabel}
                        </p>
                      </div>

                      <div className="mt-4 border-t border-white/8 pt-4">
                        <div className="text-[13px] font-semibold text-zinc-400">
                          Valor Total
                        </div>
                        <div className="mt-1 text-[22px] font-black text-emerald-400 md:text-[26px]">
                          {checkoutTotalValueLabel}
                        </div>
                      </div>
                    </div>

                    <div className="mt-7">
                      <h3 className="text-[24px] font-black tracking-[-0.03em] text-white">
                        Seus Dados
                      </h3>

                      <div className="mt-5 grid gap-4">
                        <div>
                          <label className="mb-2 block text-[13px] font-semibold text-white">
                            Nome Completo: *
                          </label>
                          <input
                            type="text"
                            value={customerForm.fullName}
                            onChange={(e) =>
                              updateCustomerForm('fullName', e.target.value)
                            }
                            placeholder="Digite seu nome completo"
                            className="h-11 w-full rounded-[16px] bg-[#081126]/95 px-4 text-[13px] text-white outline-none placeholder:text-zinc-500"
                          />
                          {customerFormErrors.fullName && (
                            <p className="mt-1.5 text-[12px] text-red-300">
                              {customerFormErrors.fullName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-[13px] font-semibold text-white">
                            E-mail: *
                          </label>
                          <input
                            type="email"
                            value={customerForm.email}
                            onChange={(e) =>
                              updateCustomerForm('email', e.target.value)
                            }
                            placeholder="Digite seu e-mail"
                            className="h-11 w-full rounded-[16px] bg-[#081126]/95 px-4 text-[13px] text-white outline-none placeholder:text-zinc-500"
                          />
                          {customerFormErrors.email && (
                            <p className="mt-1.5 text-[12px] text-red-300">
                              {customerFormErrors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-2 block text-[13px] font-semibold text-white">
                            Telefone: *
                          </label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={customerForm.phone}
                            onChange={(e) =>
                              updateCustomerForm('phone', e.target.value)
                            }
                            placeholder="Digite seu telefone com DDD"
                            className="h-11 w-full rounded-[16px] bg-[#081126]/95 px-4 text-[13px] text-white outline-none placeholder:text-zinc-500"
                          />
                          {customerFormErrors.phone && (
                            <p className="mt-1.5 text-[12px] text-red-300">
                              {customerFormErrors.phone}
                            </p>
                          )}
                        </div>
                        <div>
  <label className="mb-2 block text-[13px] font-semibold text-white">
    CPF ou CNPJ
  </label>
  <input
    type="text"
    value={customerForm.cpfCnpj}
    onChange={(e) => updateCustomerForm('cpfCnpj', e.target.value)}
    placeholder="Digite apenas números"
    className={`h-11 w-full rounded-[16px] px-4 text-[13px] text-white outline-none transition ${
      customerFormErrors.cpfCnpj
        ? 'bg-[#081126]/95 ring-1 ring-red-400/40'
        : 'bg-[#081126]/95 hover:bg-[#0b1731] focus:ring-1 focus:ring-blue-500/40'
    }`}
  />
  {customerFormErrors.cpfCnpj && (
    <p className="mt-1.5 text-[12px] text-red-300">
      {customerFormErrors.cpfCnpj}
    </p>
  )}
</div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-[24px] font-black tracking-[-0.03em] text-white">
                          Informações Adicionais
                        </h3>

                        <div className="mt-5 grid gap-4">
                          <div>
                            <label className="mb-2 block text-[13px] font-semibold text-white">
                              Nome do Char: *
                            </label>
                            <input
                              type="text"
                              value={customerForm.charName}
                              onChange={(e) =>
                                updateCustomerForm('charName', e.target.value)
                              }
                              placeholder="Digite o nome do personagem"
                              className="h-11 w-full rounded-[16px] bg-[#081126]/95 px-4 text-[13px] text-white outline-none placeholder:text-zinc-500"
                            />
                            {customerFormErrors.charName && (
                              <p className="mt-1.5 text-[12px] text-red-300">
                                {customerFormErrors.charName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="mb-2 block text-[13px] font-semibold text-white">
                              Qual o nível do seu personagem? *
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={customerForm.charLevel}
                              onChange={(e) =>
                                updateCustomerForm('charLevel', e.target.value)
                              }
                              placeholder="Digite somente números"
                              className="h-11 w-full rounded-[16px] bg-[#081126]/95 px-4 text-[13px] text-white outline-none placeholder:text-zinc-500"
                            />
                            {customerFormErrors.charLevel && (
                              <p className="mt-1.5 text-[12px] text-red-300">
                                {customerFormErrors.charLevel}
                              </p>
                            )}
                          </div>

                          <CustomerStyledDropdown
                            label="Vocação do personagem? *"
                            value={customerForm.vocation}
                            placeholder="Selecione a vocação"
                            isOpen={openCustomerDropdown === 'vocation'}
                            onToggle={() =>
                              setOpenCustomerDropdown((prev) =>
                                prev === 'vocation' ? null : 'vocation'
                              )
                            }
                            onSelect={(value) => {
                              updateCustomerForm('vocation', value);
                            }}
                            onClose={() => setOpenCustomerDropdown(null)}
                            options={vocationOptions}
                            error={customerFormErrors.vocation}
                          />

                          <CustomerStyledDropdown
                            label="Mundo: *"
                            value={customerForm.world}
                            placeholder="Selecione o servidor"
                            isOpen={openCustomerDropdown === 'world'}
                            onToggle={() =>
                              setOpenCustomerDropdown((prev) =>
                                prev === 'world' ? null : 'world'
                              )
                            }
                            onSelect={(value) => {
                              updateCustomerForm('world', value);
                            }}
                            onClose={() => setOpenCustomerDropdown(null)}
                            options={worldOptions}
                            error={customerFormErrors.world}
                          />
                        </div>
                      </div>

                      <div className="mt-8 rounded-[24px] bg-[linear-gradient(180deg,rgba(251,191,36,0.10),rgba(251,191,36,0.04))] p-5 shadow-[0_14px_30px_rgba(0,0,0,0.12)]">
                        <div className="text-[18px] font-black text-white">
                          Termos e Condições
                        </div>

                        <div className="mt-4 space-y-3">
                          <label className="flex items-start gap-3 text-[13px] text-zinc-200">
                            <input
                              type="checkbox"
                              checked={acceptedServiceTerms}
                              onChange={(e) => {
                                setAcceptedServiceTerms(e.target.checked);
                                setCustomerFormErrors((prev) => ({
                                  ...prev,
                                  terms: '',
                                }));
                              }}
                              className="mt-0.5 h-4 w-4"
                            />
                            <span>
                              Li e concordo com os{' '}
                              <span className="font-semibold text-amber-300">
                                Termos de Serviço
                              </span>
                            </span>
                          </label>

                          <label className="flex items-start gap-3 text-[13px] text-zinc-200">
                            <input
                              type="checkbox"
                              checked={acceptedPrivacyTerms}
                              onChange={(e) => {
                                setAcceptedPrivacyTerms(e.target.checked);
                                setCustomerFormErrors((prev) => ({
                                  ...prev,
                                  terms: '',
                                }));
                              }}
                              className="mt-0.5 h-4 w-4"
                            />
                            <span>
                              Li e concordo com os{' '}
                              <span className="font-semibold text-sky-300">
                                Termos de Uso e Política de Privacidade
                              </span>
                            </span>
                          </label>

                          {customerFormErrors.terms && (
                            <p className="text-[12px] text-amber-200">
                              {customerFormErrors.terms}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoToPaymentStep}
                        disabled={!isCustomerFormReady}
                        className={`mt-7 inline-flex h-12 w-full items-center justify-center rounded-[18px] px-4 text-[15px] font-black text-white transition ${
                          isCustomerFormReady
                            ? 'bg-[linear-gradient(180deg,#4b8cff,#377af0)] shadow-[0_14px_28px_rgba(59,130,246,0.22)] hover:brightness-105'
                            : 'cursor-not-allowed bg-white/10 text-zinc-400'
                        }`}
                      >
                        Ir para Pagamento
                      </button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {selectedService && checkoutStep === 4 && (
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-5 w-full max-w-5xl"
              >
                <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(9,17,40,0.97),rgba(6,12,28,0.95))] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
                  <div className="bg-black/20 px-5 py-4 md:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep(3)}
                        className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-300 transition hover:text-white"
                      >
                        ← Voltar
                      </button>

                      <h2 className="text-center text-[24px] font-black tracking-[-0.03em] text-white md:text-[30px]">
                        Dados de Pagamento
                      </h2>

                      <div className="w-[52px]" />
                    </div>
                  </div>

                  <div className="px-5 py-6 md:px-6">
                    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                      <div className="space-y-5">
                        <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-5 shadow-[0_16px_34px_rgba(0,0,0,0.14)]">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="text-[20px] font-black tracking-[-0.02em] text-white">
                                Escolha o método de pagamento
                              </h3>
                              <p className="mt-1 text-[13px] text-zinc-400">
                                Selecione a forma mais prática para concluir seu
                                pedido.
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${paymentTheme.badge}`}
                            >
                              {selectedPaymentMethod === 'pix'
                                ? 'PIX'
                                : selectedPaymentMethod === 'rubini'
                                ? 'Rubini Coins'
                                : 'Cartão'}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {[
                              {
                                id: 'pix' as PaymentMethod,
                                title: 'PIX',
                                subtitle: 'QR Code + copia e cola',
                                icon: QrCode,
                              },
                              {
                                id: 'rubini' as PaymentMethod,
                                title: 'Rubini Coins',
                                subtitle: 'Conversão automática em RC',
                                icon: Gem,
                              },
                              {
                                id: 'card' as PaymentMethod,
                                title: 'Cartão',
                                subtitle: 'Checkout externo seguro',
                                icon: CreditCard,
                              },
                            ].map((method) => {
                              const Icon = method.icon;
                              const active =
                                selectedPaymentMethod === method.id;

                              return (
                                <button
                                  key={method.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedPaymentMethod(method.id)
                                  }
                                  className={`group relative w-full rounded-[18px] p-4 text-left transition-all duration-200 ${
    selectedPaymentMethod === method.id
      ? 'bg-[linear-gradient(180deg,#1a1208,#120d05)] shadow-[0_16px_34px_rgba(0,0,0,0.24)]'
      : 'bg-[#0b1220] shadow-[0_12px_28px_rgba(0,0,0,0.16)] hover:bg-[#0f172a] hover:brightness-[1.03]'
  }`}
                                >
                                  {/* ÍCONE */}
                                  <div
                                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] transition
    ${
      selectedPaymentMethod === method.id
        ? 'bg-amber-400/15 text-amber-300'
        : 'bg-white/5 text-zinc-400 group-hover:bg-white/10'
    }`}
                                  >
                                    <method.icon className="h-5 w-5" />
                                  </div>

                                  {/* TÍTULO */}
                                  <div className="text-[15px] font-bold text-white">
                                    {method.title}
                                  </div>

                                  {/* SUBTÍTULO */}
                                  <div className="mt-1 text-[12px] text-zinc-400 leading-relaxed">
                                    {method.subtitle}
                                  </div>

                                  
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div
                          className={`rounded-[26px] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.18)] ${paymentTheme.panel}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-[21px] font-black tracking-[-0.02em] text-white">
                                {paymentTheme.title}
                              </h3>
                              <p className="mt-1 text-[13px] text-zinc-300/80">
                                {paymentTheme.subtitle}
                              </p>
                            </div>
                            <div
                              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${paymentTheme.badge}`}
                            >
                              
                            </div>
                          </div>

                          {selectedPaymentMethod === 'pix' && (
                            <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                              <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(5,45,31,0.94),rgba(4,27,20,0.95))] p-6 shadow-[0_22px_52px_rgba(0,0,0,0.22)]">
                                <div className="text-[13px] font-semibold text-zinc-300">
                                  PIX automático via Asaas
                                </div>
                                <div className="mt-4 rounded-[22px] bg-[linear-gradient(180deg,rgba(3,35,24,0.55),rgba(4,20,16,0.72))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                                  <div className="text-[12px] uppercase tracking-[0.18em] text-zinc-500">
                                    Valor total
                                  </div>
                                  <div className="mt-1 text-[30px] font-black text-emerald-300">
                                    {checkoutTotalValueLabel}
                                  </div>
                                  <div className="mt-3 text-[13px] text-zinc-300">
                                    Cobrança gerada com segurança.
QR Code dinâmico e
 PIX copia e cola automático.
Confirmação profissional.
                                    <span className="font-semibold text-white">
                                      
                                    </span>
                                  </div>
                                  <div className="mt-1 text-[13px] text-zinc-300">
                                    
                                    <span className="font-semibold text-white">
                                      
                                    </span>
                                  </div>
                                  <div className="mt-1 text-[13px] text-zinc-300">
                                    
                                    <span className="font-semibold text-white">
                                      
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(8,15,34,0.58),rgba(7,12,26,0.72))] p-5 shadow-[0_16px_38px_rgba(0,0,0,0.16)]">
                                <div className="text-[13px] font-semibold text-zinc-300">
                                  Como funciona:
                                </div>
                                <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-zinc-300">
                                  <p>
                                    Na próxima tela, o sistema vai gerar o QR Code e o PIX copia e cola direto pelo Asaas.
                                  </p>
                                  <p>
                                    Depois do pagamento, a confirmação poderá ser feita de forma automática no sistema.
                                  </p>
                                  <p>
                                    Esse fluxo deixa o checkout mais profissional, rápido e seguro para o cliente.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedPaymentMethod === 'rubini' && (
                            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.95fr]">
                              <div className="grid gap-4">
                                <div>
                                  <label className="mb-2 block text-[13px] font-semibold text-white">
                                    Personagem recebedor dos coins
                                  </label>

                                  <div className="rounded-[18px] bg-[linear-gradient(180deg,rgba(8,17,38,0.95),rgba(7,14,30,0.95))] p-3 shadow-[0_14px_30px_rgba(0,0,0,0.18)]">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="text-[12px] text-zinc-400"></div>

                                        <div className="mt-1 text-[16px] font-black text-white">
                                          Barreira Services Bank
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={handleCopyRcNickname}
                                        className={`inline-flex h-9 items-center justify-center rounded-[12px] px-3 text-[12px] font-bold transition ${
                                          rcNicknameCopied
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-amber-400 text-black hover:brightness-105'
                                        }`}
                                      >
                                        {rcNicknameCopied
                                          ? 'Copiado'
                                          : 'Copiar'}
                                      </button>
                                    </div>
                                  </div>

                                  <p className="mt-2 text-[12px] leading-5 text-amber-100/80">
                                    Copie esse nome exatamente como está e envie
                                    os Rubini Coins para esse personagem.
                                  </p>
                                </div>

                                <div>
                                  <label className="mb-2 block text-[13px] font-semibold text-white">
                                    Servidor do personagem
                                  </label>

                                  <div className="rounded-[18px] bg-[linear-gradient(180deg,rgba(8,17,38,0.95),rgba(7,14,30,0.95))] p-3 shadow-[0_14px_30px_rgba(0,0,0,0.16)]">
                                    <div className="text-[12px] text-zinc-400"></div>

                                    <div className="mt-1 text-[16px] font-bold text-white">
                                      Elysian
                                    </div>
                                  </div>

                                  <p className="mt-2 text-[12px] leading-5 text-zinc-400">
                                    A transferência dos Rubini Coins não depende
                                    de estar no mesmo servidor nesta etapa.
                                  </p>
                                </div>

                                <div className="grid gap-4">
                                  <div></div>
                                </div>
                              </div>

                              <div className="rounded-[24px] border border-amber-300/10 bg-[linear-gradient(180deg,rgba(45,28,8,0.60),rgba(20,13,6,0.78))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                                <div className="text-[13px] font-semibold text-zinc-300">
                                  Conversão automática em RC
                                </div>
                                <div className="mt-4 rounded-[22px] bg-[linear-gradient(180deg,rgba(37,22,6,0.48),rgba(18,12,5,0.68))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                                  <div className="text-[12px] uppercase tracking-[0.18em] text-zinc-500">
                                    Total em reais
                                  </div>
                                  <div className="mt-1 text-[28px] font-black text-amber-200">
                                    {checkoutTotalValueLabel}
                                  </div>
                                  <div className="mt-4 text-[13px] text-zinc-300">
                                    Cotação usada:{' '}
                                    <span className="font-semibold text-white">
                                      25 RC ={' '}
                                      {formatCurrencyBRL(rcBlockPrice)}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-[13px] text-zinc-300">
                                    Total convertido:{' '}
                                    <span className="font-semibold text-white">
                                      {rubiniCoinsTotal} RC
                                    </span>
                                  </div>
                                  <div className="mt-1 text-[13px] text-zinc-300">
                                    Blocos de 25 RC:{' '}
                                    <span className="font-semibold text-white">
                                      {rubiniBlocksTotal}
                                    </span>
                                  </div>
                                </div>
                                <p className="mt-4 text-[13px] leading-relaxed text-zinc-300">
                                  Após preencher os dados in-game e enviar os
                                  coins para o personagem informado, clique em{' '}
                                  <span className="font-semibold text-amber-200">
                                    Confirmar pagamento
                                  </span>{' '}
                                  para abrir a tela final com o resumo e
                                  instruções de conferência manual em até 2
                                  horas.
                                </p>
                              </div>
                            </div>
                          )}

                          {selectedPaymentMethod === 'card' && (
                            <div className="mt-5 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                              <div className="rounded-[22px] bg-black/15 p-4">
                                <div className="text-[13px] font-semibold text-zinc-300">
                                  Checkout com cartão
                                </div>
                                <div className="mt-3 text-[28px] font-black text-sky-200">
                                  {checkoutTotalValueLabel}
                                </div>
                                <p className="mt-3 text-[13px] leading-relaxed text-zinc-300">
                                  Ao continuar, você será redirecionado para a página segura do Asaas para concluir o pagamento com cartão.
                                </p>
                              </div>

                              <div className="rounded-[22px] bg-black/10 p-4">
                                <div className="text-[13px] font-semibold text-zinc-300">
                                  Pagamento seguro
                                </div>
                                <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-zinc-300">
                                  <p>
                                    O pagamento com cartão é feito em ambiente seguro do Asaas, garantindo proteção total dos dados do cliente.

Após a finalização, o pedido será confirmado automaticamente no sistema.

Não é necessário envio de comprovante via WhatsApp.
                                  </p>
                                  
                                </div>
                              </div>
                            </div>
                          )}

                          {paymentError && (
                            <p className="mt-4 rounded-[14px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
                              {paymentError}
                            </p>
                          )}

                          {paymentNotice && (
                            <p className="mt-4 rounded-[14px] bg-white/5 px-4 py-3 text-[13px] text-zinc-200">
                              {paymentNotice}
                            </p>
                          )}

                          <button
                            type="button"
                            onClick={handleConfirmPayment}
                            disabled={!paymentReady}
                            className={`mt-6 inline-flex h-12 w-full items-center justify-center rounded-[18px] px-4 text-[15px] font-black transition ${
                              paymentReady
                                ? paymentTheme.button
                                : 'cursor-not-allowed bg-white/10 text-zinc-400'
                            }`}
                          >
                            {selectedPaymentMethod === 'pix'
  ? 'Gerar cobrança PIX'
  : selectedPaymentMethod === 'rubini'
  ? 'Ir para instruções do envio'
  : 'Ir para checkout do cartão'}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-5 shadow-[0_16px_34px_rgba(0,0,0,0.14)]">
                          <h3 className="text-[18px] font-black tracking-[-0.02em] text-white">
                            Resumo do pedido
                          </h3>

                          <div className="mt-4 space-y-3 text-[13px] text-zinc-300">
                            <p>
                              <span className="font-semibold text-white">
                                Service:
                              </span>{' '}
                              {selectedServiceTitle}
                            </p>
                            <p>
                              <span className="font-semibold text-white">
                                Cliente:
                              </span>{' '}
                              {customerForm.fullName}
                            </p>
                            <p>
                              <span className="font-semibold text-white">
                                Char:
                              </span>{' '}
                              {customerForm.charName} • {customerForm.vocation}{' '}
                              • {customerForm.world}
                            </p>
                          </div>

                          <div className="mt-4 space-y-2">
                            {checkoutSummaryItems.map((item) => (
                              <div
                                key={`${item.label}-${item.hours}`}
                                className="rounded-[16px] bg-black/10 px-3.5 py-3 text-[12px] text-zinc-300"
                              >
                                <div className="font-semibold text-white">
                                  {item.label}
                                </div>
                                <div className="mt-1 text-zinc-400">
                                  {item.hours}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 border-t border-white/8 pt-4">
                            <div className="text-[12px] uppercase tracking-[0.18em] text-zinc-500">
                              Total
                            </div>
                            <div className="mt-1 text-[28px] font-black text-emerald-300">
                              {checkoutTotalValueLabel}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(8,15,36,0.95),rgba(6,12,28,0.94))] p-6 shadow-[0_20px_46px_rgba(0,0,0,0.20)]">
                          <h3 className="text-[17px] font-black text-white">
                            Informações importantes
                          </h3>
                          <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-zinc-300">
                            <p>
                              A reserva é vinculada ao seu pedido e ao método de
                              pagamento escolhido nesta etapa.
                            </p>
                            <p>
                              PIX e cartão terão confirmação automática na
                              integração final. Rubini Coins seguirá conferência
                              manual para sua segurança.
                            </p>
                            <p>
                              Após a confirmação, o próximo passo abrirá o
                              resumo final com ação de WhatsApp conforme o
                              método selecionado.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {selectedService && checkoutStep === 5 && (
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-5 w-full max-w-5xl"
              >
                <div className="overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(9,17,40,0.97),rgba(6,12,28,0.95))] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
                  <div className="bg-black/20 px-5 py-4 md:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep(4)}
                        className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-300 transition hover:text-white"
                      >
                        ← Voltar
                      </button>

                      <h2 className="text-center text-[24px] font-black tracking-[-0.03em] text-white md:text-[30px]">
                        Confirmação de Pagamento
                      </h2>

                      <div className="w-[52px]" />
                    </div>
                  </div>

                  <div className="px-5 py-6 md:px-6">
                    {selectedPaymentMethod === 'pix' && (
                      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                        <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(5,45,31,0.96),rgba(4,26,20,0.94))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)]">
                          <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10">
                              <QrCode className="h-5 w-5 text-emerald-200" />
                            </div>
                            <div>
                              <h3 className="text-[22px] font-black text-white">
                                Pagamento via PIX
                              </h3>
                              <p className="mt-1 text-[13px] text-zinc-300/80">
  Pague com o QR Code ou com o PIX copia e cola gerado automaticamente
  pelo Asaas.
</p>
                            </div>
                          </div>

                          <div className="mt-5 flex justify-center rounded-[24px] bg-[linear-gradient(180deg,rgba(3,39,28,0.88),rgba(2,24,18,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                            {asaasPixQrCodeImage ? (
  <img
    src={asaasPixQrCodeImage}
    alt="QR Code PIX"
    className="h-[240px] w-[240px] rounded-[18px] bg-white p-3"
  />
) : (
                              <div className="flex h-[240px] w-[240px] items-center justify-center rounded-[18px] bg-black/20 text-zinc-400">
                                QR Code indisponível
                              </div>
                            )}
                          </div>

                          <div className="mt-4 rounded-[20px] bg-[linear-gradient(180deg,rgba(4,40,28,0.72),rgba(3,24,18,0.84))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                            <div className="text-[12px] uppercase tracking-[0.18em] text-zinc-500">
                              PIX copia e cola
                            </div>
                            <p className="mt-2 break-all text-[12px] leading-relaxed text-zinc-300">
  {asaasPixCopyPaste || 'Código PIX indisponível.'}
</p>
                          </div>

                          <div className="mt-4">
  <button
    type="button"
    onClick={handleCopyPixCode}
    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[linear-gradient(180deg,#11d26b,#07b957)] px-4 text-[14px] font-black text-white transition hover:brightness-105"
  >
    <Copy className="h-4 w-4" />
    {copiedPixCode ? 'Código copiado' : 'Copiar código PIX'}
  </button>
</div>

<p className="mt-4 rounded-[14px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-100">
  O pagamento será confirmado automaticamente após a compensação. Não é
  necessário enviar comprovante.
</p>

                          
                        </div>

                        <div className="space-y-5">
                          <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(8,15,36,0.95),rgba(6,12,28,0.94))] p-6 shadow-[0_20px_46px_rgba(0,0,0,0.20)]">
                            <h3 className="text-[18px] font-black text-white">
                              Resumo do pedido
                            </h3>
                            <div className="mt-4 space-y-2 text-[13px] text-zinc-300">
                              <p>
                                <span className="font-semibold text-white">
                                  Service:
                                </span>{' '}
                                {selectedServiceTitle}
                              </p>
                              <p>
                                <span className="font-semibold text-white">
                                  Char:
                                </span>{' '}
                                {customerForm.charName}
                              </p>
                              <p>
                                <span className="font-semibold text-white">
                                  Mundo:
                                </span>{' '}
                                {customerForm.world}
                              </p>
                              <p>
                                <span className="font-semibold text-white">
                                  Vocação:
                                </span>{' '}
                                {customerForm.vocation}
                              </p>
                            </div>
                            <div className="mt-4 rounded-[18px] bg-black/15 p-4 text-[13px] text-zinc-300">
                              {checkoutSummaryItems.map((item) => (
                                <div
                                  key={`${item.label}-${item.hours}`}
                                  className="mb-2 last:mb-0"
                                >
                                  <span className="font-semibold text-white">
                                    {item.label}
                                  </span>
                                  : {item.hours}
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 text-[28px] font-black text-emerald-300">
                              {checkoutTotalValueLabel}
                            </div>
                          </div>

                          <div className="rounded-[26px] bg-[linear-gradient(180deg,rgba(8,15,36,0.95),rgba(6,12,28,0.94))] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
                            <p className="text-[13px] leading-relaxed text-zinc-300">
  Após o pagamento, a confirmação será feita automaticamente no sistema.
  Se preferir, você ainda pode abrir o WhatsApp para alinhar os dados do
  service.
</p>
                            <a
  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappServiceMessage}`}
  target="_blank"
  rel="noreferrer"
  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#1fbf75,#15975d)] px-4 text-[14px] font-black text-white transition hover:brightness-105"
>
  Enviar dados do service no WhatsApp
</a>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedPaymentMethod === 'rubini' && (
                      <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
                        <div className="space-y-5">
                          <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(49,28,6,0.96),rgba(26,15,4,0.95))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.26)]">
                            <h3 className="text-[22px] font-black text-white">
                              Envio via Rubini Coins
                            </h3>
                            <p className="mt-2 text-[13px] leading-relaxed text-zinc-300/80">
                              Envie exatamente{' '}
                              <span className="font-semibold text-amber-200">
                                {rubiniCoinsTotal} RC
                              </span>{' '}
                              para o personagem abaixo. A conferência é manual e
                              pode levar até{' '}
                              <span className="font-semibold text-white">
                                2 horas
                              </span>
                              .
                            </p>

                            <div className="mt-4 rounded-[22px] bg-black/15 p-4 shadow-[0_16px_38px_rgba(0,0,0,0.16)]">
                              <div className="text-[12px] uppercase tracking-[0.18em] text-zinc-500">
                                Recebedor
                              </div>
                              <div className="mt-2 text-[26px] font-black text-amber-200">
                                {RC_RECEIVER_CHARACTER}
                              </div>
                              <div className="mt-1 text-[13px] text-zinc-300">
                                Servidor:{' '}
                                <span className="font-semibold text-white">
                                  {RC_RECEIVER_WORLD}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 rounded-[18px] bg-black/15 p-4 text-[13px] leading-relaxed text-zinc-300">
                              Confira o nome do personagem recebedor antes da transferência e envie a
quantidade exata exibida no resumo. Depois, anexe o comprovante do envio
para conferência manual.
                            </div>

                            <div className="mt-4">
                              <label className="mb-2 block text-[13px] font-semibold text-white">
                                Print ou foto do envio dos coins: *
                              </label>
                              <label className="flex h-12 cursor-pointer items-center gap-3 rounded-[16px] bg-[#081126]/95 px-4 text-[13px] text-zinc-300 transition hover:bg-[#0b1731]">
                                <Upload className="h-4 w-4 text-amber-200" />
                                <span className="flex-1 truncate">
                                  {rcPaymentForm.transferProof?.name ||
                                    'Enviar comprovante do envio'}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*,.pdf"
                                  className="hidden"
                                  onChange={(e) =>
                                    updateRcPaymentForm(
                                      'transferProof',
                                      e.target.files?.[0] ?? null
                                    )
                                  }
                                />
                              </label>
                            </div>

                            <button
                              type="button"
                              onClick={async () => {
                                if (!currentOrderId) {
                                  setPaymentNotice(
                                    'Pedido ainda não encontrado. Gere as instruções novamente se necessário.'
                                  );
                                  return;
                                }

                                if (!rcPaymentForm.transferProof) {
                                  setPaymentNotice(
                                    'Envie a print ou foto do envio dos coins para liberar o WhatsApp.'
                                  );
                                  return;
                                }

                                try {
                                  setProofUploadLoading(true);
                                  await uploadProofAndAttach({
                                    file: rcPaymentForm.transferProof,
                                    bucket: 'rc-proofs',
                                    orderId: currentOrderId,
                                  });
                                  setRcReadyForWhatsapp(true);
                                  setPaymentNotice(
                                    'Perfeito. Agora você já pode avisar o envio no WhatsApp para conferência manual.'
                                  );
                                } catch (error: any) {
                                  console.error('Erro ao enviar comprovante RC:', error);
                                  setPaymentError(`Erro ao enviar comprovante RC: ${error?.message || 'sem detalhes'}`);
                                } finally {
                                  setProofUploadLoading(false);
                                }
                              }}
                              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#f4b63f,#d89216)] px-4 text-[14px] font-black text-black transition hover:brightness-105"
                            >
                              {proofUploadLoading ? 'Enviando...' : 'Confirmar envio'}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-5">
                        <div className="rounded-[26px] bg-[linear-gradient(180deg,rgba(8,15,36,0.95),rgba(6,12,28,0.94))] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
                            <h3 className="text-[18px] font-black text-white">
                              Detalhes da venda
                            </h3>
                            <div className="mt-4 space-y-2 text-[13px] text-zinc-300">
                              <p>
                                <span className="font-semibold text-white">
                                  Seu personagem:
                                </span>{' '}
                                {RC_RECEIVER_CHARACTER}
                              </p>
                              <p>
                                <span className="font-semibold text-white">
                                  Servidor:
                                </span>{' '}
                                {rcPaymentForm.world || '-'}
                              </p>
                              <p>
                                <span className="font-semibold text-white">
                                  Quantidade:
                                </span>{' '}
                                {rubiniCoinsTotal} RC
                              </p>
                              <p>
                                <span className="font-semibold text-white">
                                  Total em reais:
                                </span>{' '}
                                {checkoutTotalValueLabel}
                              </p>
                              <p>
                                <span className="font-semibold text-white">
                                  Char do service:
                                </span>{' '}
                                {customerForm.charName}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-[24px] bg-black/10 p-5">
                            <p className="text-[13px] leading-relaxed text-zinc-300">
                              Depois de enviar as Rubini Coins e anexar o comprovante, use o botão abaixo
para alinhar os dados do service e facilitar a conferência manual.
                            </p>
                            <a
                              href={
  rcReadyForWhatsapp
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappRcServiceMessage}`
    : undefined
}
                              target="_blank"
                              rel="noreferrer"
                              className={`mt-4 inline-flex h-12 w-full items-center justify-center rounded-[18px] px-4 text-[14px] font-black transition ${
                                rcReadyForWhatsapp
                                  ? 'bg-[linear-gradient(180deg,#f4b63f,#d89216)] text-black hover:brightness-105'
                                  : 'pointer-events-none bg-white/10 text-zinc-500'
                              }`}
                            >
                              Enviar dados do service no WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedPaymentMethod === 'card' && (
                      <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
                        <div className="rounded-[24px] bg-[linear-gradient(180deg,rgba(10,24,46,0.90),rgba(7,14,28,0.94))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
                          <h3 className="text-[22px] font-black text-white">
                            Cartão de crédito
                          </h3>
                          <p className="mt-2 text-[13px] leading-relaxed text-zinc-300/80">
                            Esta tela já deixa o visual e a estrutura preparados
                            para o checkout real. Na próxima fase, vamos
                            integrar um link de pagamento ou gateway seguro para
                            confirmar cartão automaticamente, sem exigir
                            comprovante manual.
                          </p>

                          <div className="mt-4 rounded-[22px] bg-black/15 p-4">
                            <div className="text-[12px] uppercase tracking-[0.18em] text-zinc-500">
                              Valor do pedido
                            </div>
                            <div className="mt-1 text-[28px] font-black text-sky-200">
                              {checkoutTotalValueLabel}
                            </div>
                            <div className="mt-3 text-[13px] text-zinc-300">
                              Recomendação futura: integração com checkout
                              externo seguro para o cliente inserir os dados do
                              cartão diretamente na plataforma de pagamento.
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setCardAcknowledged(true);
                              setPaymentNotice(
                                'Fluxo de cartão preparado. Quando integrarmos o gateway, este botão abrirá o checkout externo real.'
                              );
                            }}
                            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#5c8cff,#356df1)] px-4 text-[14px] font-black text-white transition hover:brightness-105"
                          >
                            Ir para checkout do cartão
                          </button>
                        </div>

                        <div className="space-y-5">
                          <div className="rounded-[24px] bg-black/10 p-5">
                            <h3 className="text-[18px] font-black text-white">
                              Resumo do pedido
                            </h3>
                            <div className="mt-4 space-y-2 text-[13px] text-zinc-300">
                              <p>
                                <span className="font-semibold text-white">
                                  Service:
                                </span>{' '}
                                {selectedServiceTitle}
                              </p>
                              <p>
                                <span className="font-semibold text-white">
                                  Char:
                                </span>{' '}
                                {customerForm.charName}
                              </p>
                              <p>
                                <span className="font-semibold text-white">
                                  Valor:
                                </span>{' '}
                                {checkoutTotalValueLabel}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-[24px] bg-black/10 p-5">
                            <div className="text-[13px] leading-relaxed text-zinc-300">
                              O botão abaixo fica reservado para a etapa em que
                              o checkout externo estiver integrado e liberado
                              com confirmação automática.
                            </div>
                            <button
                              type="button"
                              disabled={!cardAcknowledged}
                              className={`mt-4 inline-flex h-12 w-full items-center justify-center rounded-[18px] px-4 text-[14px] font-black transition ${
                                cardAcknowledged
                                  ? 'bg-white/10 text-zinc-300'
                                  : 'cursor-not-allowed bg-white/10 text-zinc-500'
                              }`}
                            >
                              Integração futura do cartão
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentNotice && (
                      <p className="mt-5 rounded-[14px] bg-white/5 px-4 py-3 text-[13px] text-zinc-200">
                        {paymentNotice}
                      </p>
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            {checkoutStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.25 }}
                className="mt-4 rounded-full bg-black/35 px-4 py-2.5 text-sm text-zinc-300 backdrop-blur-md"
              >
                {selectedService
                  ? 'Clique novamente no service selecionado para fechar e voltar à lista completa.'
                  : 'Clique em um dos services acima para continuar.'}
              </motion.div>
            )}
          </>
        )}

        {activePage === 'sobre' && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-16 w-full max-w-5xl"
          >
            <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(8,15,30,0.95),rgba(5,10,22,0.92))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.10),transparent_25%)]" />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-[0.45em] text-zinc-400 md:text-xs">
                  Sobre mim
                </div>
                <h2 className="mt-2 text-3xl font-black text-amber-400 md:text-4xl">
                  Profissionalismo, confiança e resultado
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <h3 className="text-lg font-black text-white">
                      Meu compromisso
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                      Trabalho com services focados em segurança, organização,
                      discrição e eficiência. Cada serviço é tratado com atenção
                      total para entregar uma experiência profissional e
                      confiável.
                    </p>
                  </div>

                  <div className="rounded-[22px] bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <h3 className="text-lg font-black text-white">
                      Como eu trabalho
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                      Antes de cada service, alinho todos os detalhes com o
                      cliente para garantir clareza, previsibilidade e o melhor
                      resultado possível dentro da necessidade de cada
                      personagem.
                    </p>
                  </div>

                  <div className="rounded-[22px] bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:col-span-2">
                    <h3 className="text-lg font-black text-white">
                      Atendimento personalizado
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                      Cada cliente possui uma necessidade diferente. Por isso,
                      adapto a execução do service com foco em transparência,
                      praticidade e boa comunicação do início ao fim.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {activePage === 'agenda' && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-16 w-full max-w-6xl"
          >
            <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(8,15,30,0.95),rgba(5,10,22,0.92))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_25%)]" />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-[0.45em] text-zinc-400 md:text-xs">
                  Agenda
                </div>
                <h2 className="mt-2 text-3xl font-black text-amber-400 md:text-4xl">
                  Visualize datas e horários disponíveis
                </h2>
                <p className="mt-3 max-w-3xl text-sm text-zinc-300 md:text-base">
                  Aqui você pode consultar uma visão maior e mais confortável da
                  agenda, com o mesmo padrão visual do restante do site.
                </p>

                <div className="mt-8">{renderAgendaCalendar(true)}</div>
              </div>
            </div>
          </motion.section>
        )}

        {activePage === 'regras' && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-16 w-full max-w-5xl"
          >
            <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(10,20,40,0.96),rgba(7,13,28,0.94))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.10),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_25%)]" />

              <div className="relative">
                <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">
                  Termos de Serviço
                </h2>

                <p className="mt-3 max-w-3xl text-sm text-zinc-300 md:text-base">
                  Ao contratar qualquer service, o cliente declara estar ciente
                  e de acordo com as condições abaixo.
                </p>

                <div className="mt-6 grid gap-4">
                  {[
                    {
                      title: 'CLÁUSULA 1: DO AGENDAMENTO E PAGAMENTO',
                      text: `1.1. A reserva de horário para execução do service possui caráter condicional, sendo considerada efetivamente confirmada apenas após a compensação integral do pagamento acordado.

1.2. O envio do comprovante deve ser realizado via canal oficial (WhatsApp). O envio isolado do comprovante não garante a reserva, sendo necessária a confirmação do recebimento do valor.`,
                    },
                    {
                      title:
                        'CLÁUSULA 2: DAS OBRIGAÇÕES DO CLIENTE (PREPARAÇÃO)',
                      text: `2.1. O cliente declara estar ciente de que o serviço prestado possui natureza de obrigação de meio, consistindo na disponibilização de tempo, conhecimento técnico e execução por parte da FB Services.

2.2. O personagem (char) deverá ser entregue devidamente preparado, contendo suprimentos, munições, equipamentos e acessos necessários para a execução do service.

2.3. Caso o personagem não esteja apto, o tempo necessário para preparação, organização ou logística (refill, depot, compra de itens) será descontado das horas contratadas, sem reposição posterior.`,
                    },
                    {
                      title:
                        'CLÁUSULA 3: DA LIMITAÇÃO DE RESPONSABILIDADE E RISCOS',
                      text: `3.1. O cliente reconhece que o ambiente do jogo está sujeito a instabilidades técnicas, como lag, quedas de servidor, kicks, rollback ou ataques externos, caracterizando eventos fora do controle da FB Services.

3.2. Mortes por instabilidade: A FB Services não se responsabiliza por morte do personagem ou perdas decorrentes de problemas de servidor ou conexão.

3.3. Mortes por erro de execução: Caso seja comprovado erro direto na execução do service, a situação poderá ser analisada e ajustada de forma justa, podendo haver reposição proporcional do serviço.`,
                    },
                    {
                      title:
                        'CLÁUSULA 4: DA CONFIDENCIALIDADE E PROTEÇÃO (ANTI-SNIPING)',
                      text: `4.1. A FB Services adotará medidas de proteção durante transmissões, incluindo ocultação de informações sensíveis, com o objetivo de preservar a identidade e localização do personagem.

4.2. O cliente reconhece que o ambiente online não garante anonimato absoluto, não havendo responsabilidade por ações de terceiros que venham a localizar o personagem.`,
                    },
                    {
                      title: 'CLÁUSULA 5: DO DIREITO DE IMAGEM E TRANSMISSÃO',
                      text: `5.1. O cliente autoriza, de forma gratuita, que a execução do service seja transmitida ao vivo (livestream) ou gravada para produção de conteúdo nas plataformas da FB Services.

5.2. As gravações também poderão ser utilizadas como forma de comprovação da execução do serviço e segurança para ambas as partes.`,
                    },
                    {
                      title:
                        'CLÁUSULA 6: DA POLÍTICA DE CANCELAMENTO E REAGENDAMENTO',
                      text: `6.1. O cliente poderá solicitar cancelamento com reembolso integral em até 7 dias após o pagamento, desde que respeite antecedência mínima de 24 horas antes do horário agendado.

6.2. Cancelamentos tardios: Solicitações com menos de 24 horas ou ausência (no-show) poderão resultar em retenção de até 50% do valor ou perda total das horas, conforme análise.

6.3. Imprevistos: Problemas como falta de energia, internet ou questões pessoais da FB Services garantem reposição das horas não executadas.`,
                    },
                    {
                      title: 'CLÁUSULA 7: DOS RISCOS DE PVP E INTERFERÊNCIAS',
                      text: `7.1. O cliente assume os riscos inerentes ao PvP. Situações como emboscadas, hunted, traps ou ações de outros jogadores são consideradas fatores externos.

7.2. A FB Services não se responsabiliza por perdas decorrentes dessas situações, desde que tenha atuado com diligência durante a execução.`,
                    },
                    {
                      title: 'CLÁUSULA 8: DA DECLARAÇÃO DE HUNTED OU WAR',
                      text: `8.1. É obrigação do cliente informar previamente se o personagem está hunted, em war ou sob perseguição.

8.2. A omissão dessas informações isenta a FB Services de responsabilidade por dificuldades, mortes recorrentes ou impossibilidade de execução.`,
                    },
                    {
                      title: 'CLÁUSULA 9: DA SEGURANÇA E ACESSO',
                      text: `9.1. O fornecimento de login, senha e token é de responsabilidade exclusiva do cliente.

9.2. Após a finalização do service, recomenda-se a alteração imediata da senha e revogação de acessos. A FB Services não se responsabiliza por acessos indevidos após a entrega.`,
                    },
                    {
                      title:
                        'CLÁUSULA 10: DA REMUNERAÇÃO ADICIONAL POR ÊXITO (LOOT)',
                      text: `10.1. O valor pago refere-se à execução técnica e ao tempo dedicado.

10.2. Em caso de obtenção de item raro (rare drop), poderá haver divisão previamente combinada entre as partes.

10.3. Essa cláusula reconhece a natureza aleatória do sistema de drops e mantém o equilíbrio econômico do acordo.`,
                    },
                    {
                      title:
                        'CLÁUSULA 11: DA REINICIALIZAÇÃO E MANUTENÇÃO DO SERVIDOR',
                      text: `11.1. Reinicializações Programadas: O cliente declara estar ciente de que o servidor do jogo pode realizar reinicializações periódicas para manutenção, podendo ocorrer dentro ou fora do horário previsto.

11.2. Impacto nos agendamentos: Em decorrência dessas reinicializações, os horários de execução podem sofrer alterações, podendo haver atraso ou antecipação no início ou término do service.

11.3. Quedas inesperadas: O servidor pode apresentar interrupções inesperadas decorrentes de instabilidades técnicas ou fatores externos.

11.3.1. Caso a interrupção seja temporária e o servidor retorne dentro do período contratado, o service continuará normalmente, sem prejuízo ao tempo restante.

11.3.2. Caso o servidor permaneça indisponível durante todo o período agendado, será realizada a remarcação integral do service, sem garantia de reembolso, sendo assegurado o direito de reagendamento.

11.3.3. Interrupções não garantem compensação financeira automática, exceto em casos prolongados, que poderão ser analisados individualmente.

11.4. Comunicação: A FB Services manterá o cliente informado sobre quaisquer alterações através dos canais oficiais (WhatsApp).`,
                    },
                    {
                      title: 'CLÁUSULA 12: DA ACEITAÇÃO DOS TERMOS',
                      text: `Ao contratar qualquer service, o cliente declara estar ciente e de acordo com todas as cláusulas acima, reconhecendo os riscos naturais do ambiente online e as condições da prestação do serviço.`,
                    },
                  ].map((item, index) => {
                    const lines = item.text
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean);

                    return (
                      <div
                        key={index}
                        className="group relative overflow-hidden rounded-[26px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(12,21,40,0.88),rgba(8,14,28,0.94))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_40px_rgba(0,0,0,0.22)]"
                      >
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.07),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.05),transparent_22%)]" />

                        <div className="relative">
                          <div className="mb-4 flex items-start gap-3">
                            <div className="mt-1 h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]" />
                            <h3 className="text-[22px] font-black uppercase tracking-[-0.03em] text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.10)] md:text-[24px]">
                              {item.title}
                            </h3>
                          </div>

                          <div className="space-y-3">
                            {lines.map((line, lineIndex) => {
                              const isSubSubItem = /^\d+\.\d+\.\d+\./.test(
                                line
                              );
                              const isSubItem =
                                /^\d+\.\d+\./.test(line) && !isSubSubItem;

                              let numberPart = '';
                              let contentPart = line;

                              const firstSpaceIndex = line.indexOf(' ');
                              if (firstSpaceIndex !== -1) {
                                numberPart = line.slice(0, firstSpaceIndex);
                                contentPart = line.slice(firstSpaceIndex + 1);
                              }

                              if (isSubSubItem) {
                                return (
                                  <div
                                    key={lineIndex}
                                    className="ml-4 rounded-[16px] border-l-2 border-cyan-400/40 bg-cyan-400/[0.03] px-4 py-3 text-[15px] leading-relaxed text-zinc-300"
                                  >
                                    <span className="font-black text-cyan-300">
                                      {numberPart}
                                    </span>{' '}
                                    <span>{contentPart}</span>
                                  </div>
                                );
                              }

                              if (isSubItem) {
                                const hasColon = contentPart.includes(':');
                                const label = hasColon
                                  ? contentPart.split(':')[0]
                                  : '';
                                const body = hasColon
                                  ? contentPart
                                      .split(':')
                                      .slice(1)
                                      .join(':')
                                      .trim()
                                  : contentPart;

                                return (
                                  <div
                                    key={lineIndex}
                                    className="rounded-[18px] bg-white/[0.03] px-4 py-3 text-[16px] leading-relaxed text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                                  >
                                    <span className="font-black text-yellow-300">
                                      {numberPart}
                                    </span>{' '}
                                    {hasColon ? (
                                      <>
                                        <span
                                          className={`font-bold ${
                                            label
                                              .toLowerCase()
                                              .includes('falha') ||
                                            label
                                              .toLowerCase()
                                              .includes('quedas') ||
                                            label
                                              .toLowerCase()
                                              .includes('cancelamentos')
                                              ? 'text-rose-400'
                                              : label
                                                  .toLowerCase()
                                                  .includes('erro') ||
                                                label
                                                  .toLowerCase()
                                                  .includes('imprevistos')
                                              ? 'text-emerald-400'
                                              : label
                                                  .toLowerCase()
                                                  .includes(
                                                    'reinicializações'
                                                  ) ||
                                                label
                                                  .toLowerCase()
                                                  .includes('impacto')
                                              ? 'text-amber-300'
                                              : label
                                                  .toLowerCase()
                                                  .includes('comunicação')
                                              ? 'text-cyan-300'
                                              : 'text-white'
                                          }`}
                                        >
                                          {label}:
                                        </span>{' '}
                                        <span>{body}</span>
                                      </>
                                    ) : (
                                      <span>{contentPart}</span>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={lineIndex}
                                  className="text-[15px] leading-relaxed text-zinc-300"
                                >
                                  {line}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {activePage === 'auth' && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-16 flex w-full max-w-5xl justify-center"
          >
            <div className="w-full max-w-[520px] overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(8,15,30,0.95),rgba(5,10,22,0.92))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-md md:p-8">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.45em] text-zinc-400 md:text-xs">
                  Área do cliente
                </div>
                <h2 className="mt-2 text-3xl font-black text-amber-400 md:text-4xl">
                  {authMode === 'login' ? 'Login' : 'Criar conta'}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-zinc-300 md:text-base">
                  Entre na sua conta para acompanhar seu perfil, histórico e
                  publicar avaliações verificadas.
                </p>
              </div>

              <div className="mt-6 flex rounded-full bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setLoginError('');
                  }}
                  className={`h-11 flex-1 rounded-full text-sm font-bold transition ${
                    authMode === 'login'
                      ? 'bg-amber-400 text-black'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  Entrar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setLoginError('');
                  }}
                  className={`h-11 flex-1 rounded-full text-sm font-bold transition ${
                    authMode === 'register'
                      ? 'bg-amber-400 text-black'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  Criar conta
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAuthSubmit();
                }}
                className="mt-6"
              >
                <div className="space-y-4">
                  {authMode === 'register' && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-zinc-200">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Digite seu nome"
                        className="h-12 w-full rounded-[16px] bg-[#0f1728] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-300/25"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-200">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Digite seu e-mail"
                      className="h-12 w-full rounded-[16px] bg-[#0f1728] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-300/25"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-zinc-200">
                      Senha
                    </label>
                    <input
                      type="password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="h-12 w-full rounded-[16px] bg-[#0f1728] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-300/25"
                    />
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-zinc-200">
                        Confirmar senha
                      </label>
                      <input
                        type="password"
                        value={userConfirmPassword}
                        onChange={(e) => setUserConfirmPassword(e.target.value)}
                        placeholder="Confirme sua senha"
                        className="h-12 w-full rounded-[16px] bg-[#0f1728] px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-300/25"
                      />
                    </div>
                  )}
                </div>

                {loginError && (
                  <div className="mt-4 rounded-[14px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="mt-6 h-[48px] w-full rounded-[16px] bg-[linear-gradient(180deg,#4b8cff,#377af0)] text-[15px] font-black text-white shadow-[0_10px_22px_rgba(59,130,246,0.18)] transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_14px_26px_rgba(59,130,246,0.22)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_10px_22px_rgba(59,130,246,0.18)]"
                >
                  {authLoading
                    ? 'Carregando...'
                    : authMode === 'login'
                    ? 'Entrar na conta'
                    : 'Criar conta'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setActivePage('home')}
                className="mt-3 h-[46px] w-full rounded-[16px] bg-white/[0.03] text-sm font-bold text-zinc-200 transition hover:bg-white/[0.06] hover:text-white"
              >
                Voltar para início
              </button>
            </div>
          </motion.section>
        )}

        {activePage === 'perfil' && (
          <section className="min-h-screen px-4 pb-16 pt-28">
            <div className="mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,rgba(9,17,40,0.96),rgba(6,12,28,0.94))] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
                <div className="px-8 py-8 md:px-10 md:py-10">
                  <div className="text-[11px] uppercase tracking-[0.34em] text-zinc-500">
                    Área do cliente
                  </div>

                  <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] text-white md:text-5xl">
                    Perfil
                  </h1>

                  <p className="mt-4 max-w-2xl text-[15px] leading-8 text-zinc-400">
                    Informações da conta e visualização do service ativo no
                    momento.
                  </p>

                  <div className="mt-10 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.14)]">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[24px] font-black tracking-[-0.03em] text-white">
                          Dados da conta
                        </h2>

                        <span className="rounded-full bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">
                          Conta
                        </span>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div className="rounded-[22px] bg-black/10 px-5 py-4">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                            Nome
                          </div>
                          <div className="mt-2 text-[18px] font-semibold text-white">
                            {userName || 'Não informado'}
                          </div>
                        </div>

                        <div className="rounded-[22px] bg-black/10 px-5 py-4">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                            E-mail
                          </div>
                          <div className="mt-2 break-all text-[18px] font-semibold text-white">
                            {userEmail || 'Não informado'}
                          </div>
                        </div>

                        <div className="rounded-[22px] bg-black/10 px-5 py-4">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                            Status
                          </div>
                          <div className="mt-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                currentService
                                  ? 'bg-emerald-400/10 text-emerald-200'
                                  : 'bg-white/[0.05] text-zinc-300'
                              }`}
                            >
                              {currentService
                                ? 'Cliente com service ativo'
                                : 'Sem service ativo'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.14)]">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[24px] font-black tracking-[-0.03em] text-white">
                          Service atual
                        </h2>

                        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                          Ativo
                        </span>
                      </div>

                      {currentService ? (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                          <div className="rounded-[22px] bg-black/10 px-5 py-4 sm:col-span-2">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                              Tipo de service
                            </div>
                            <div className="mt-2 text-[18px] font-semibold text-white">
                              {currentService.type}
                            </div>
                          </div>

                          <div className="rounded-[22px] bg-black/10 px-5 py-4">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                              Personagem
                            </div>
                            <div className="mt-2 text-base font-semibold text-white">
                              {currentService.character}
                            </div>
                          </div>

                          <div className="rounded-[22px] bg-black/10 px-5 py-4">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                              Data
                            </div>
                            <div className="mt-2 text-base font-semibold text-white">
                              {currentService.date}
                            </div>
                          </div>

                          <div className="rounded-[22px] bg-black/10 px-5 py-4">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                              Horas
                            </div>
                            <div className="mt-2 text-base font-semibold text-white">
                              {currentService.hours}
                            </div>
                          </div>

                          <div className="rounded-[22px] bg-black/10 px-5 py-4">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                              Valor total
                            </div>
                            <div className="mt-2 text-base font-semibold text-white">
                              {currentService.total}
                            </div>
                          </div>

                          <div className="rounded-[22px] bg-black/10 px-5 py-4 sm:col-span-2">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                              Status atual
                            </div>
                            <div className="mt-3">
                              <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                                {currentService.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-6 rounded-[24px] bg-black/10 px-5 py-8 text-center">
                          <p className="text-sm text-zinc-400">
                            Nenhum service ativo no momento.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activePage === 'historico' && (
          <section className="min-h-screen px-4 pb-16 pt-28">
            <div className="mx-auto max-w-6xl">
              <div className="overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,rgba(9,17,40,0.96),rgba(6,12,28,0.94))] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
                <div className="px-8 py-8 md:px-10 md:py-10">
                  <div className="text-[11px] uppercase tracking-[0.34em] text-zinc-500">
                    Área do cliente
                  </div>

                  <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] text-white md:text-5xl">
                    Histórico de services
                  </h1>

                  <p className="mt-4 max-w-2xl text-[15px] leading-8 text-zinc-400">
                    Visualize todos os pedidos já realizados nesta conta.
                  </p>

                  <div className="mt-10 grid gap-5 md:grid-cols-2">
                    {serviceHistory.length === 0 ? (
                      <div className="md:col-span-2 rounded-[24px] bg-black/10 px-5 py-10 text-center text-sm text-zinc-400">
                        Nenhum histórico encontrado.
                      </div>
                    ) : (
                      serviceHistory.map((item) => (
                        <article
                          key={item.id}
                          className="rounded-[28px] bg-[linear-gradient(180deg,rgba(8,18,42,0.94),rgba(4,10,25,0.98))] p-6 shadow-[0_18px_38px_rgba(0,0,0,0.16)]"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                                Pedido #{item.id}
                              </div>

                              <h2 className="mt-2 text-[24px] font-black tracking-[-0.03em] text-white">
                                {item.type}
                              </h2>

                              <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Service realizado para o personagem{' '}
                                {item.character}.
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.status.toLowerCase().includes('final')
                                  ? 'bg-emerald-400/10 text-emerald-200'
                                  : 'bg-amber-400/10 text-amber-200'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-[22px] bg-black/10 px-5 py-4">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                                Personagem
                              </div>
                              <div className="mt-2 text-base font-semibold text-white">
                                {item.character}
                              </div>
                            </div>

                            <div className="rounded-[22px] bg-black/10 px-5 py-4">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                                Data
                              </div>
                              <div className="mt-2 text-base font-semibold text-white">
                                {item.date}
                              </div>
                            </div>

                            <div className="rounded-[22px] bg-black/10 px-5 py-4">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                                Horas
                              </div>
                              <div className="mt-2 text-base font-semibold text-white">
                                {item.hours}
                              </div>
                            </div>

                            <div className="rounded-[22px] bg-black/10 px-5 py-4">
                              <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                                Valor total
                              </div>
                              <div className="mt-2 text-base font-semibold text-white">
                                {item.total}
                              </div>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activePage === 'feedbacks' && (
          <section className="min-h-screen w-full max-w-6xl px-4 pb-16 pt-20">
            <div className="overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,rgba(9,17,40,0.96),rgba(6,12,28,0.94))] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
              <div className="px-8 py-8 md:px-10 md:py-10">
                <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-3xl">
                    <div className="text-[11px] uppercase tracking-[0.34em] text-zinc-500">
                      Área pública
                    </div>

                    <h1 className="mt-3 text-4xl font-black tracking-[-0.03em] text-white md:text-5xl">
                      Feedbacks
                    </h1>

                    <p className="mt-4 max-w-2xl text-[15px] leading-8 text-zinc-400">
                      Veja avaliações reais de clientes. Para publicar uma
                      avaliação, é obrigatório estar logado e ter contratado ou
                      concluído um service nos últimos 7 dias.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:min-w-[360px]">
                    <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.015)]">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                        Média geral
                      </div>

                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-5xl font-black text-amber-300">
                          {averageRating}
                        </span>
                        <span className="pb-2 text-lg text-zinc-400">/5</span>
                      </div>
                    </div>

                    <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.008))] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.015)]">
                      <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                        Total de avaliações
                      </div>

                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-5xl font-black text-white">
                          {feedbacks.length}
                        </span>
                        <span className="pb-2 text-lg text-zinc-400">
                          publicadas
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
                  <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(7,16,40,0.98),rgba(4,10,25,0.98))] p-6 shadow-[0_22px_55px_rgba(0,0,0,0.18)]">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-[22px] font-black tracking-[-0.03em] text-white whitespace-nowrap">
                        Enviar avaliação
                      </h2>
                    </div>

                    {!isLoggedIn && (
                      <div className="mt-5 rounded-[20px] bg-amber-400/8 px-4 py-3 text-sm leading-6 text-amber-100 ring-1 ring-amber-300/10">
                        Você pode visualizar todos os feedbacks normalmente.
                        Para publicar, faça login e tenha um service concluído
                        ou contratado nos últimos 7 dias.
                      </div>
                    )}

                    {isLoggedIn && !hasRecentEligibleService() && (
                      <div className="mt-5 rounded-[20px] bg-red-500/8 px-4 py-3 text-sm leading-6 text-red-200 ring-1 ring-red-300/10">
                        Você está logado, mas ainda não pode publicar. Para
                        enviar sua avaliação, é obrigatório ter um service
                        contratado ou concluído nos últimos 7 dias.
                      </div>
                    )}

                    <div className="mt-6 space-y-4">
                      <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-5 py-4">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                          Sua nota
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => {
                                if (!canPublishFeedback) return;
                                setFeedbackRating(star);
                              }}
                              className={`rounded-xl px-1 text-[34px] leading-none transition-all duration-200 ${
                                star <= feedbackRating
                                  ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.28)]'
                                  : 'text-zinc-600'
                              } ${
                                canPublishFeedback
                                  ? 'hover:-translate-y-0.5 hover:scale-110'
                                  : 'cursor-not-allowed opacity-70'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-5 py-4">
                        <label className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                          Tipo de service
                        </label>

                        <div className="relative mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (!canPublishFeedback) return;
                              setIsFeedbackServiceOpen((prev) => !prev);
                              setIsFeedbackFilterOpen(false);
                            }}
                            disabled={!canPublishFeedback}
                            className="group inline-flex h-12 w-full items-center justify-between rounded-[18px] bg-[#081126]/95 px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.015)] transition hover:bg-[#0d1731] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span>{feedbackService}</span>
                            <ChevronDown
                              className={`h-4 w-4 transition ${
                                isFeedbackServiceOpen
                                  ? 'rotate-180 text-amber-200'
                                  : 'text-zinc-400 group-hover:text-amber-200'
                              }`}
                            />
                          </button>

                          <div
                            className={`absolute left-0 top-[calc(100%+10px)] z-30 w-full rounded-[20px] bg-black/70 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-md transition-all duration-200 ${
                              isFeedbackServiceOpen
                                ? 'pointer-events-auto translate-y-0 opacity-100'
                                : 'pointer-events-none -translate-y-2 opacity-0'
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              {feedbackServiceOptions.map((item, index) => (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => {
                                    setFeedbackService(item);
                                    setIsFeedbackServiceOpen(false);
                                  }}
                                  className={`group/item flex items-center justify-between rounded-[14px] px-3 py-2.5 text-left text-sm transition ${
                                    feedbackService === item
                                      ? 'bg-amber-400/10 text-amber-100 ring-1 ring-amber-300/15 shadow-[0_0_12px_rgba(251,191,36,0.08)]'
                                      : 'text-zinc-200 hover:bg-white/5 hover:shadow-[0_0_12px_rgba(251,191,36,0.08)]'
                                  }`}
                                  style={{
                                    transitionDelay: isFeedbackServiceOpen
                                      ? `${index * 24}ms`
                                      : '0ms',
                                  }}
                                >
                                  <span>{item}</span>
                                  <ChevronRight
                                    className={`h-4 w-4 transition ${
                                      feedbackService === item
                                        ? 'text-amber-200'
                                        : 'text-zinc-500 group-hover/item:translate-x-1 group-hover/item:text-amber-200'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-5 py-4">
                        <label className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                          Personagem atendido
                        </label>

                        <input
                          type="text"
                          value={feedbackCharacter}
                          onChange={(e) => setFeedbackCharacter(e.target.value)}
                          disabled={!canPublishFeedback}
                          placeholder="Nick do seu char"
                          className="mt-3 h-12 w-full rounded-[18px] bg-[#081126]/95 px-4 text-sm text-white outline-none transition placeholder:text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.015)] focus:bg-[#0c1730] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>

                      <div className="rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-5 py-4">
                        <label className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                          Sua experiência
                        </label>

                        <textarea
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          disabled={!canPublishFeedback}
                          placeholder="Conte como foi sua experiência com o service..."
                          rows={6}
                          className="mt-3 w-full rounded-[18px] bg-[#081126]/95 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.015)] focus:bg-[#0c1730] disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    </div>

                    {feedbackError && (
                      <div className="mt-4 rounded-[18px] bg-red-500/8 px-4 py-3 text-sm leading-6 text-red-200 ring-1 ring-red-300/10">
                        {feedbackError}
                      </div>
                    )}

                    {feedbackSuccess && (
                      <div className="mt-4 rounded-[18px] bg-emerald-500/8 px-4 py-3 text-sm leading-6 text-emerald-200">
                        {feedbackSuccess}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSubmitFeedback}
                      disabled={!canPublishFeedback}
                      className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(251,191,36,0.06))] px-4 text-sm font-semibold text-amber-100 shadow-[0_10px_22px_rgba(0,0,0,0.12)] transition hover:bg-[linear-gradient(180deg,rgba(251,191,36,0.16),rgba(251,191,36,0.08))] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Publicar avaliação
                    </button>
                  </div>

                  <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(7,16,40,0.98),rgba(4,10,25,0.98))] p-6 shadow-[0_22px_55px_rgba(0,0,0,0.18)]">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <h2 className="text-[24px] font-black tracking-[-0.03em] text-white md:text-[26px]">
                          Avaliações publicadas
                        </h2>
                        <p className="mt-2 text-[15px] leading-7 text-zinc-400">
                          Filtre por tipo de service ou navegue por todas as
                          avaliações.
                        </p>
                      </div>

                      <div className="w-full lg:w-[260px]">
                        <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                          Filtrar avaliações
                        </label>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setIsFeedbackFilterOpen((prev) => !prev);
                              setIsFeedbackServiceOpen(false);
                            }}
                            className="group flex h-12 w-full items-center justify-between rounded-[18px] bg-[#081126]/95 px-4 text-sm font-medium text-white transition hover:bg-[#0d1731]"
                          >
                            <span className="flex-1 text-center">
                              {selectedFeedbackFilter}
                            </span>

                            <ChevronDown
                              className={`h-4 w-4 shrink-0 transition ${
                                isFeedbackFilterOpen
                                  ? 'rotate-180 text-amber-200'
                                  : 'text-zinc-400 group-hover:text-amber-200'
                              }`}
                            />
                          </button>

                          <div
                            className={`absolute left-0 top-[calc(100%+10px)] z-30 w-full rounded-[20px] bg-black/70 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-md transition-all duration-200 ${
                              isFeedbackFilterOpen
                                ? 'pointer-events-auto translate-y-0 opacity-100'
                                : 'pointer-events-none -translate-y-2 opacity-0'
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              {feedbackFilters.map((filter, index) => (
                                <button
                                  key={filter}
                                  type="button"
                                  onClick={() => {
                                    setSelectedFeedbackFilter(filter);
                                    setIsFeedbackFilterOpen(false);
                                  }}
                                  className={`group/item flex items-center justify-between rounded-[14px] px-3 py-2.5 text-left text-sm transition ${
                                    selectedFeedbackFilter === filter
                                      ? 'bg-amber-400/10 text-amber-100 ring-1 ring-amber-300/15 shadow-[0_0_12px_rgba(251,191,36,0.08)]'
                                      : 'text-zinc-200 hover:bg-white/5 hover:shadow-[0_0_12px_rgba(251,191,36,0.08)]'
                                  }`}
                                  style={{
                                    transitionDelay: isFeedbackFilterOpen
                                      ? `${index * 24}ms`
                                      : '0ms',
                                  }}
                                >
                                  <span>{filter}</span>
                                  <ChevronRight
                                    className={`h-4 w-4 transition ${
                                      selectedFeedbackFilter === filter
                                        ? 'text-amber-200'
                                        : 'text-zinc-500 group-hover/item:translate-x-1 group-hover/item:text-amber-200'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 grid gap-5 md:grid-cols-2">
                      {filteredFeedbacks.length === 0 ? (
                        <div className="md:col-span-2 rounded-[24px] bg-black/10 px-5 py-10 text-center text-sm text-zinc-400 ring-1 ring-dashed ring-white/10">
                          Nenhum feedback encontrado para esse filtro.
                        </div>
                      ) : (
                        filteredFeedbacks.map((item) => (
                          <article
                            key={item.id}
                            className="group relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(8,18,42,0.94),rgba(4,10,25,0.98))] p-6 shadow-[0_18px_38px_rgba(0,0,0,0.16)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_44px_rgba(0,0,0,0.20),0_0_14px_rgba(251,191,36,0.04)]"
                          >
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.08),transparent_70%)] opacity-0 transition group-hover:opacity-100" />

                            <div className="relative flex items-start justify-between gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-[22px] font-black tracking-[-0.03em] text-white">
                                    {item.author}
                                  </h3>

                                  {item.verified && (
                                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                                      Cliente verificado
                                    </span>
                                  )}
                                </div>

                                <div className="mt-3 flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`text-lg ${
                                        star <= item.rating
                                          ? 'text-amber-300'
                                          : 'text-zinc-600'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-full bg-[#0d1730] px-3 py-1 text-xs font-medium text-zinc-300">
                                {item.date}
                              </div>
                            </div>

                            <div className="relative mt-5 flex flex-wrap gap-2">
                              <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                                {item.service}
                              </span>

                              <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-200">
                                Char: {item.character}
                              </span>
                            </div>

                            <p className="relative mt-5 text-[15px] leading-8 text-zinc-300">
                              {item.comment}
                            </p>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
      <style jsx global>{`
  .custom-scroll::-webkit-scrollbar,
  .boss-quest-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scroll::-webkit-scrollbar-track,
  .boss-quest-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scroll::-webkit-scrollbar-thumb,
  .boss-quest-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.14);
    border-radius: 999px;
  }

  .custom-scroll::-webkit-scrollbar-thumb:hover,
  .boss-quest-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.24);
  }
`}</style>
    </main>
  );
}
