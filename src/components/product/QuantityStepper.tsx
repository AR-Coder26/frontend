import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  max: number;
  min?: number;
  onChange: (value: number) => void;
  size?: 'default' | 'sm';
}

export function QuantityStepper({
  value,
  max,
  min = 1,
  onChange,
  size = 'default',
}: QuantityStepperProps) {
  const dimension = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className="flex items-center rounded-md border border-input">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={`flex ${dimension} items-center justify-center text-foreground disabled:opacity-30`}
      >
        <Minus className={iconSize} />
      </button>
      <span className="w-8 text-center text-sm">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={`flex ${dimension} items-center justify-center text-foreground disabled:opacity-30`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
}