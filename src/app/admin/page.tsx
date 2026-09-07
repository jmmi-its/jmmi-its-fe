'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  Check,
  CircleDollarSign,
  Copy,
  ExternalLink,
  Layers,
  Link2,
  MousePointerClick,
  Plus,
  Shield,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { useGetFinanceReport } from './hook/useFinance';
import { useGetAllCalendarEvents } from './hook/useCalendar';
import { useGetShortLinks } from '@/app/links/hook/useShortLink';
import { useGetCategories } from '@/app/links/hook/useCategory';
import useAuthStore from '@/stores/useAuthStore';
import { showToast, SUCCESS_TOAST } from '@/components/Toast';
import { cn } from '@/lib/utils';

type MonthlyPoint = {
  key: string;
  label: string;
  monthLabel: string;
  income: number;
  expenses: number;
  balance: number;
};

type ReminderEvent = {
  id?: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  note: string;
};

interface FinanceTransaction {
  transaction_id: string;
  type: 'income' | 'expenses';
  description: string;
  amount: number;
  transaction_date: string;
  timestamp: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID').format(value);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function buildMonthlySeries(transactions: FinanceTransaction[]) {
  const today = new Date();
  const months: { year: number; month: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const lookup = new Map<string, { income: number; expenses: number }>();

  transactions.forEach((transaction) => {
    const date = new Date(transaction.transaction_date);
    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = lookup.get(key) ?? { income: 0, expenses: 0 };

    if (transaction.type === 'income') {
      current.income += transaction.amount;
    } else {
      current.expenses += transaction.amount;
    }

    lookup.set(key, current);
  });

  return months.map(({ year, month }) => {
    const date = new Date(year, month, 1);
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    const current = lookup.get(key) ?? { income: 0, expenses: 0 };
    const monthLabel = date.toLocaleDateString('id-ID', { month: 'short' });
    const fullLabel = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    return {
      key,
      label: fullLabel,
      monthLabel,
      income: current.income,
      expenses: current.expenses,
      balance: current.income - current.expenses,
    };
  });
}

function buildPath(points: { x: number; y: number }[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

function FinanceLineChart({ data }: { data: MonthlyPoint[] }) {
  const width = 720;
  const height = 300;
  const paddingX = 44;
  const paddingY = 28;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.income, item.expenses]));
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;

  const seriesToPoints = (selector: (item: MonthlyPoint) => number) => {
    return data.map((item, index) => {
      const value = selector(item);
      const x = paddingX + stepX * index;
      const y = height - paddingY - (value / maxValue) * innerHeight;
      return { x, y };
    });
  };

  const incomePoints = seriesToPoints((item) => item.income);
  const expensePoints = seriesToPoints((item) => item.expenses);
  const incomePath = buildPath(incomePoints);
  const expensePath = buildPath(expensePoints);
  const incomeAreaPath = `${incomePath} L ${incomePoints[incomePoints.length - 1]?.x ?? paddingX} ${height - paddingY} L ${incomePoints[0]?.x ?? paddingX} ${height - paddingY} Z`;

  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const ratio = (index + 1) / 5;
    return height - paddingY - innerHeight * ratio;
  });

  return (
    <div className='rounded-[25px] border border-gray-100 bg-white p-6 shadow-md'>
      <div className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='font-sora text-xs font-semibold uppercase tracking-wider text-[#146637]'>
            Grafik Keuangan Bulanan
          </p>
          <h2 className='font-sora mt-1 text-xl sm:text-2xl font-bold text-slate-900'>Tren Pemasukan & Pengeluaran</h2>
        </div>
        <div className='flex flex-wrap gap-3 font-sora text-xs font-semibold'>
          <div className='inline-flex items-center gap-2 rounded-full bg-[#146637]/10 px-3.5 py-1.5 text-[#146637]'>
            <span className='h-2.5 w-2.5 rounded-full bg-[#146637]' />
            Pemasukan
          </div>
          <div className='inline-flex items-center gap-2 rounded-full bg-rose-50 px-3.5 py-1.5 text-rose-600'>
            <span className='h-2.5 w-2.5 rounded-full bg-rose-500' />
            Pengeluaran
          </div>
        </div>
      </div>

      <div className='mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50 p-2'>
        <svg viewBox={`0 0 ${width} ${height}`} className='h-auto w-full'>
          <defs>
            <linearGradient id='incomeFillAdmin' x1='0' x2='0' y1='0' y2='1'>
              <stop offset='0%' stopColor='rgba(20, 102, 55, 0.2)' />
              <stop offset='100%' stopColor='rgba(20, 102, 55, 0.01)' />
            </linearGradient>
          </defs>

          {gridLines.map((lineY) => (
            <line
              key={lineY}
              x1={paddingX}
              x2={width - paddingX}
              y1={lineY}
              y2={lineY}
              stroke='rgba(226, 232, 240, 0.8)'
              strokeDasharray='6 6'
            />
          ))}

          <path d={incomeAreaPath} fill='url(#incomeFillAdmin)' />
          <path d={incomePath} fill='none' stroke='#146637' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' />
          <path d={expensePath} fill='none' stroke='#E11D48' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' strokeDasharray='10 6' />

          {incomePoints.map((point, index) => (
            <g key={`income-${data[index]?.key ?? index}`}>
              <circle cx={point.x} cy={point.y} r='4.5' fill='white' stroke='#146637' strokeWidth='2.5' />
              <text x={point.x} y={height - 10} textAnchor='middle' fill='#64748b' fontSize='11' fontFamily='var(--font-hanken)'>
                {data[index]?.monthLabel}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className='mt-5 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'>
        {data.slice(-6).map((item) => (
          <div key={item.key} className='rounded-2xl border border-gray-100 bg-gray-50/50 p-3 shadow-sm'>
            <p className='font-sora text-xs font-bold text-slate-800 truncate'>{item.label}</p>
            <div className='mt-1 space-y-0.5 font-hanken text-xs font-semibold'>
              <p className='text-[#146637]'>+Rp {formatCurrency(item.income)}</p>
              <p className='text-rose-600'>-Rp {formatCurrency(item.expenses)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: any;
  tone: 'emerald' | 'rose' | 'amber' | 'slate' | 'sky';
}) {
  const toneClasses = {
    emerald: 'bg-[#146637]/10 text-[#146637]',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-700',
    sky: 'bg-sky-50 text-sky-600',
  };

  return (
    <div className='rounded-[25px] border border-gray-100 bg-white p-6 shadow-md hover:shadow-xl transition-all duration-300'>
      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-1'>
          <p className='font-sora text-xs font-semibold text-slate-500 uppercase tracking-wider'>{title}</p>
          <p className='font-sora text-2xl font-extrabold text-slate-900'>{value}</p>
          <p className='font-hanken text-xs text-slate-500 pt-1'>{description}</p>
        </div>
        <div className={`rounded-2xl p-3.5 shrink-0 ${toneClasses[tone]}`}>
          <Icon className='h-6 w-6' />
        </div>
      </div>
    </div>
  );
}

function UpcomingEventCard({ events }: { events: ReminderEvent[] }) {
  const nextEvent = events[0];

  if (!nextEvent) {
    return (
      <div className='rounded-[25px] border border-gray-100 bg-white p-6 shadow-md'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='font-sora text-xs font-semibold uppercase tracking-wider text-[#146637]'>Pengingat Event</p>
            <h2 className='font-sora mt-1 text-xl sm:text-2xl font-bold text-slate-900'>Agenda 7 Hari Ke Depan</h2>
          </div>
          <div className='rounded-2xl bg-[#146637]/10 p-3 text-[#146637]'>
            <CalendarClock className='h-5 w-5' />
          </div>
        </div>
        <div className='mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center font-hanken text-slate-500'>
          Belum ada agenda dalam 7 hari ke depan.
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-[25px] border border-gray-100 bg-white p-6 shadow-md space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='font-sora text-xs font-semibold uppercase tracking-wider text-[#146637]'>Pengingat Event</p>
          <h2 className='font-sora mt-1 text-xl sm:text-2xl font-bold text-slate-900'>Agenda 7 Hari Ke Depan</h2>
        </div>
        <div className='rounded-2xl bg-[#146637]/10 p-3 text-[#146637]'>
          <CalendarClock className='h-5 w-5' />
        </div>
      </div>

      <div className='rounded-2xl bg-[#146637] p-6 text-white shadow-lg space-y-3'>
        <p className='font-sora text-xs font-bold uppercase tracking-wider text-white/70'>Event Terdekat</p>
        <h3 className='font-sora text-xl font-bold'>{nextEvent.title}</h3>
        <div className='grid gap-3 font-hanken text-xs text-white/90 sm:grid-cols-2 pt-2 border-t border-white/15'>
          <div>
            <p className='text-white/60'>Tanggal</p>
            <p className='font-semibold'>{nextEvent.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div>
            <p className='text-white/60'>Waktu</p>
            <p className='font-semibold'>{nextEvent.time} WIB</p>
          </div>
          <div>
            <p className='text-white/60'>Lokasi</p>
            <p className='font-semibold'>{nextEvent.location}</p>
          </div>
          <div>
            <p className='text-white/60'>Catatan</p>
            <p className='font-semibold'>{nextEvent.note || '-'}</p>
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        {events.slice(1).map((event, i) => (
          <div key={event.id || `${event.title}-${i}`} className='rounded-2xl border border-gray-100 bg-gray-50/50 p-4'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='font-sora text-sm font-bold text-slate-900'>{event.title}</p>
                <p className='font-hanken mt-1 text-xs text-slate-500'>
                  {event.date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} • {event.time} WIB
                </p>
              </div>
              <span className='rounded-full bg-[#146637]/10 px-3 py-1 font-sora text-[10px] font-bold text-[#146637]'>
                Minggu ini
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function FungsioDashboardView({
  userName,
  reminderEvents,
}: {
  userName?: string;
  reminderEvents: ReminderEvent[];
}) {
  const { shortLinks = [], total: totalShortLinks = 0 } = useGetShortLinks(1, 100);
  const { data: categories = [] } = useGetCategories();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculate total clicks across all shortlinks
  const totalClicks = useMemo(() => {
    return shortLinks.reduce((acc, link) => acc + (link.click_count || 0), 0);
  }, [shortLinks]);

  // Sort shortlinks by click count descending (top 5)
  const topShortLinks = useMemo(() => {
    return [...shortLinks]
      .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
      .slice(0, 5);
  }, [shortLinks]);

  // Maximum clicks for percentage bar
  const maxClicks = Math.max(1, topShortLinks[0]?.click_count || 1);

  const handleCopy = (shortCode: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/s/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    showToast('Tautan pendek disalin ke clipboard!', SUCCESS_TOAST);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className='space-y-8'>
      {/* Welcome Banner */}
      <section className='overflow-hidden rounded-[25px] bg-[#146637] p-8 text-white shadow-xl relative'>
        <div className='max-w-3xl space-y-4 relative z-10'>
          <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-sora text-xs font-semibold uppercase tracking-wider text-white'>
            <Shield className='h-4 w-4 text-emerald-300' />
            <span>Dashboard Fungsionaris JMMI</span>
          </div>
          <h1 className='font-sora text-3xl sm:text-4xl font-extrabold tracking-tight'>
            Ahlan wa Sahlan{userName ? `, ${userName}` : ''}!
          </h1>
          <p className='font-hanken text-base text-white/85 leading-relaxed'>
            Pantau metrik performa tautan pendek (Shortlink), pengingat agenda terdekat, serta pengelolaan sumber daya links pengurus.
          </p>
        </div>
      </section>

      {/* Summary Metrics */}
      <section className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        <MetricCard
          title='Total Shortlink'
          value={String(totalShortLinks || shortLinks.length)}
          description='Tautan pendek aktif terdaftar.'
          icon={Link2}
          tone='emerald'
        />
        <MetricCard
          title='Total Kunjungan'
          value={new Intl.NumberFormat('id-ID').format(totalClicks)}
          description='Akumulasi klik seluruh tautan.'
          icon={MousePointerClick}
          tone='amber'
        />
        <MetricCard
          title='Agenda Mendatang'
          value={String(reminderEvents.length)}
          description='Kegiatan dalam 7 hari ke depan.'
          icon={CalendarDays}
          tone='sky'
        />
        <MetricCard
          title='Kategori Sumber Daya'
          value={String(categories.length)}
          description='Kategori & folder links aktif.'
          icon={Layers}
          tone='slate'
        />
      </section>

      {/* Quick Action Shortcuts */}
      <section className='rounded-[25px] border border-gray-100 bg-white p-6 shadow-md'>
        <p className='font-sora text-xs font-semibold uppercase tracking-wider text-[#146637]'>
          Akses Cepat Pengurus
        </p>
        <h2 className='font-sora mt-1 text-xl font-bold text-slate-900'>Navigasi Fitur Fungsionaris</h2>
        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <Link
            href='/admin/shortlinks'
            className='group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition-all hover:border-[#146637]/30 hover:bg-[#146637]/5 hover:shadow-sm'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-[#146637] group-hover:bg-[#146637] group-hover:text-white transition-colors'>
                <Link2 className='h-5 w-5' />
              </div>
              <div>
                <p className='font-sora text-sm font-bold text-slate-900'>Shortlink</p>
                <p className='font-hanken text-xs text-slate-500'>Buat & kelola short URL</p>
              </div>
            </div>
            <Plus className='h-4 w-4 text-gray-400 group-hover:text-[#146637] transition-colors' />
          </Link>

          <Link
            href='/admin/kalender'
            className='group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition-all hover:border-[#146637]/30 hover:bg-[#146637]/5 hover:shadow-sm'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors'>
                <CalendarDays className='h-5 w-5' />
              </div>
              <div>
                <p className='font-sora text-sm font-bold text-slate-900'>Kalender</p>
                <p className='font-hanken text-xs text-slate-500'>Tambah agenda kegiatan</p>
              </div>
            </div>
            <Plus className='h-4 w-4 text-gray-400 group-hover:text-sky-700 transition-colors' />
          </Link>

          <Link
            href='/admin/links'
            className='group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition-all hover:border-[#146637]/30 hover:bg-[#146637]/5 hover:shadow-sm'
          >
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors'>
                <Layers className='h-5 w-5' />
              </div>
              <div>
                <p className='font-sora text-sm font-bold text-slate-900'>Resource Links</p>
                <p className='font-hanken text-xs text-slate-500'>Kelola folder & tautan</p>
              </div>
            </div>
            <ExternalLink className='h-4 w-4 text-gray-400 group-hover:text-amber-700 transition-colors' />
          </Link>
        </div>
      </section>

      {/* Grid: Events & Top Shortlinks */}
      <div className='grid gap-6 xl:grid-cols-[1fr_1.4fr]'>
        <UpcomingEventCard events={reminderEvents} />

        {/* Top Shortlinks Card */}
        <div className='rounded-[25px] border border-gray-100 bg-white p-6 shadow-md'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-sora text-xs font-semibold uppercase tracking-wider text-[#146637]'>
                Performa Kunjungan
              </p>
              <h2 className='font-sora mt-1 text-xl sm:text-2xl font-bold text-slate-900'>
                Shortlink Terpopuler
              </h2>
            </div>
            <Link
              href='/admin/shortlinks'
              className='font-sora text-xs font-semibold text-[#146637] hover:underline'
            >
              Lihat Semua →
            </Link>
          </div>

          <div className='mt-6 space-y-3.5'>
            {topShortLinks.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center font-hanken text-slate-500'>
                Belum ada shortlink yang terdaftar.
              </div>
            ) : (
              topShortLinks.map((item) => {
                const percent = Math.round(((item.click_count || 0) / maxClicks) * 100);
                const isCopied = copiedId === item.short_link_id;

                return (
                  <div
                    key={item.short_link_id}
                    className='rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-gray-50'
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <span className='rounded-lg bg-[#146637]/10 px-2.5 py-0.5 font-sora text-xs font-bold text-[#146637]'>
                            /{item.short_code}
                          </span>
                          <span className='font-sora text-xs font-bold text-slate-700'>
                            {item.click_count || 0} klik
                          </span>
                        </div>
                        <p className='mt-1 font-hanken text-xs text-slate-500 truncate'>
                          {item.url}
                        </p>
                      </div>

                      <button
                        type='button'
                        onClick={() => handleCopy(item.short_code, item.short_link_id)}
                        className={cn(
                          'inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 font-sora text-xs font-semibold transition-all',
                          isCopied
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 bg-white text-slate-700 hover:bg-gray-50'
                        )}
                        title='Salin short URL'
                      >
                        {isCopied ? (
                          <>
                            <Check className='h-3.5 w-3.5 text-emerald-600' />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className='h-3.5 w-3.5' />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div className='mt-2.5 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden'>
                      <div
                        className='h-full rounded-full bg-[#146637] transition-all duration-500'
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const user = useAuthStore.useUser();
  const isFungsio = user?.role?.toLowerCase() === 'fungsio';

  const { data: reportData } = useGetFinanceReport();
  const { data: calendarPagination } = useGetAllCalendarEvents(1, 50);

  const transactions = reportData?.transactions || [];
  const calendarEvents = calendarPagination?.data || [];

  const totalIncome = reportData?.total_income || 0;
  const totalExpense = reportData?.total_expense || 0;
  const balance = reportData?.current_balance || 0;

  const monthlySeries = useMemo(() => buildMonthlySeries(transactions), [transactions]);

  const reminderEvents = useMemo(() => {
    const today = startOfDay(new Date());

    return calendarEvents
      .map((event: any) => {
        const baseDate = new Date(event.event_date);
        return {
          id: event.event_id,
          title: event.event_name,
          date: baseDate,
          time: event.event_time,
          location: event.location,
          note: event.notes ?? '',
        };
      })
      .filter((ev) => ev.date.getTime() >= today.getTime() && ev.date.getTime() <= addDays(today, 7).getTime())
      .sort((a, b) => {
         const dateDiff = a.date.getTime() - b.date.getTime();
         if (dateDiff !== 0) return dateDiff;
         return a.time.localeCompare(b.time);
      });
  }, [calendarEvents]);

  if (isFungsio) {
    return (
      <FungsioDashboardView
        userName={user?.name}
        reminderEvents={reminderEvents}
      />
    );
  }

  return (
    <div className='space-y-8'>
      {/* Welcome Banner */}
      <section className='overflow-hidden rounded-[25px] bg-[#146637] p-8 text-white shadow-xl relative'>
        <div className='max-w-3xl space-y-4 relative z-10'>
          <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-sora text-xs font-semibold uppercase tracking-wider text-white'>
            <CircleDollarSign className='h-4 w-4' />
            Admin Panel Dashboard
          </div>
          <h1 className='font-sora text-3xl sm:text-4xl font-extrabold tracking-tight'>
            Selamat datang{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className='font-hanken text-base text-white/85 leading-relaxed'>
            Pantau ringkasan tren keuangan, jadwal agenda mendatang, serta pengelolaan sistem JMMI ITS.
          </p>
        </div>
      </section>

      {/* Summary Metrics */}
      <section className='grid gap-6 md:grid-cols-2 xl:grid-cols-4'>
        <MetricCard
          title='Total Pemasukan'
          value={`Rp ${formatCurrency(totalIncome)}`}
          description='Akumulasi pemasukan terverifikasi.'
          icon={TrendingUp}
          tone='emerald'
        />
        <MetricCard
          title='Total Pengeluaran'
          value={`Rp ${formatCurrency(totalExpense)}`}
          description='Akumulasi pengeluaran terverifikasi.'
          icon={TrendingDown}
          tone='rose'
        />
        <MetricCard
          title='Saldo Berjalan'
          value={`Rp ${formatCurrency(balance)}`}
          description='Net kas bersih berjalan.'
          icon={CircleDollarSign}
          tone='amber'
        />
        <MetricCard
          title='Jumlah Transaksi'
          value={String(transactions.length)}
          description='Total pencatatan transaksi.'
          icon={BarChart3}
          tone='slate'
        />
      </section>

      {/* Grid: Events & Chart */}
      <div className='grid gap-6 xl:grid-cols-[1fr_1.55fr]'>
        <UpcomingEventCard events={reminderEvents} />
        <FinanceLineChart data={monthlySeries} />
      </div>
    </div>
  );
}