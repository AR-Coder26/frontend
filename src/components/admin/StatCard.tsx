import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'default' | 'warning' | 'success';
}

const TONE_CLASSES: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-neutral-900 text-white',
  warning: 'bg-amber-500 text-white',
  success: 'bg-emerald-600 text-white',
};

export function StatCard({ label, value, icon: Icon, tone = 'default' }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}
