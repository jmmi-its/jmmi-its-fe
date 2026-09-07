'use client';

import {
  BarChart3,
  CalendarClock,
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';

import useAuthStore from '@/stores/useAuthStore';

import { useGetAllCalendarEvents } from './hook/useCalendar';
import { useGetFinanceReport } from './hook/useFinance';

import { CalendarEvent } from '@/types/entities/calendar';

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

  const horizontalLines = [0.25, 0.5, 0.75, 1];

  return (
    <div className='rounded-[25px] border border-gray-100 bg-white p-6 shadow-md space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div>
          <p className='font-sora text-xs font-semibold uppercase tracking-wider text-[#146637]'>Tren Keuangan</p>
          <h2 className='font-sora mt-1 text-xl sm:text-2xl font-bold text-slate-900'>12 Bulan Terakhir</h2>
        </div>
        <div className='flex items-center gap-4 text-xs font-sora font-semibold'>
          <span className='inline-flex items-center gap-1.5 text-emerald-700'>
            <span className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
            Pemasukan
          </span>
          <span className='inline-flex items-center gap-1.5 text-rose-700'>
            <span className='h-2.5 w-2.5 rounded-full bg-rose-500' />
            Pengeluaran
          </span>
        </div>
      </div>

      <div className='w-full overflow-x-auto'>
        <svg viewBox={`0 0 ${width} ${height}`} className='min-w-[620px] w-full h-[280px]'>
          {horizontalLines.map((ratio) => {
            const y = height - paddingY - ratio * innerHeight;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke='#E2E8F0'
                strokeDasharray='4 4'
              />
            );
          })}

          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke='#CBD5E1'
          />

          <path d={incomePath} fill='none' stroke='#10B981' strokeWidth='3' strokeLinecap='round' />
          <path d={expensePath} fill='none' stroke='#F43F5E' strokeWidth='3' strokeLinecap='round' />

          {incomePoints.map((pt, idx) => (
            <circle key={`inc-${idx}`} cx={pt.x} cy={pt.y} r='4' fill='#10B981' />
          ))}

          {expensePoints.map((pt, idx) => (
            <circle key={`exp-${idx}`} cx={pt.x} cy={pt.y} r='4' fill='#F43F5E' />
          ))}

          {data.map((item, idx) => {
            const x = paddingX + stepX * idx;
            return (
              <text
                key={item.key}
                x={x}
                y={height - 8}
                textAnchor='middle'
                className='fill-slate-400 font-sora text-[10px]'
              >
                {item.monthLabel}
              </text>
            );
          })}
        </svg>
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
  icon: typeof TrendingUp;
  tone: 'emerald' | 'rose' | 'amber' | 'slate';
}) {
  const toneClasses = {
    emerald: 'bg-[#146637]/10 text-[#146637]',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-700',
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

export default function AdminDashboard() {
  const user = useAuthStore.useUser();
  const { data: reportData } = useGetFinanceReport();
  const { data: calendarPagination } = useGetAllCalendarEvents(1, 50);

  const transactions = useMemo(
    () => reportData?.transactions ?? [],
    [reportData?.transactions]
  );
  const calendarEvents = useMemo(
    () => calendarPagination?.data ?? [],
    [calendarPagination?.data]
  );

  const totalIncome = reportData?.total_income || 0;
  const totalExpense = reportData?.total_expense || 0;
  const balance = reportData?.current_balance || 0;

  const monthlySeries = useMemo(() => buildMonthlySeries(transactions), [transactions]);

  const reminderEvents = useMemo(() => {
    const today = startOfDay(new Date());

    return calendarEvents
      .map((event: CalendarEvent) => {
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