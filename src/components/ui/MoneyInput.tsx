type MoneyInputProps = {
  id: string;
  label: string;
  helper?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
};

export function MoneyInput({ id, label, helper, value, min = 0, max, step = 50000, onChange }: MoneyInputProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-semibold text-stone-900">{label}</span>
      {helper ? <span className="mt-1 block text-xs leading-5 text-stone-500">{helper}</span> : null}
      <div className="mt-3 flex items-center rounded-lg border border-stone-200 bg-white px-3 shadow-sm transition focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10">
        <span className="text-sm font-semibold text-stone-400">$</span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-h-12 w-full border-0 bg-transparent px-2 text-base font-semibold text-stone-950 outline-none"
        />
      </div>
    </label>
  );
}
