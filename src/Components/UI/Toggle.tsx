interface ToggleProps {
  label: string;
  value: boolean;
  onChange(value: boolean): void;
}

export function Toggle(p: ToggleProps) {
  return (
    <label class="inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={p.value}
        onChange={(e) => p.onChange(e.currentTarget.checked)}
        class="peer sr-only"
      />
      <span class="me-2 font-medium text-gray-300 text-sm">{p.label}</span>
      <div class="peer rtl:peer-checked:after:-translate-x-full relative h-6 w-11 rounded-full border-gray-600 bg-gray-700 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 peer-checked:after:translate-x-full after:rounded-full after:border after:border-gray-300 peer-checked:after:border-white after:bg-white peer-checked:bg-blue-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 after:transition-all after:content-['']" />
    </label>
  );
}
