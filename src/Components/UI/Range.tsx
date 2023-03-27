import "./Range.css"
interface RangeProps {
    min: number,
    max: number,
    step: number
    value: number,
    onChange(value: number): void
}

export function Range(p: RangeProps) {
  return (
    <input
      type="range"
      min={p.min}
      max={p.max}
      value={p.value}
      onChange={(e) => {
        let value = parseFloat((e.target as HTMLInputElement).value);
        p.onChange(value);
      }}
      step={p.step}
      class="w-full h-5 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700"
    />
  );
}
