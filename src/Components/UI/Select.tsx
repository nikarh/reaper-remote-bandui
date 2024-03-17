import { For, type JSX } from "solid-js";

interface SelectProps<T> {
  options: T[];
  selected: number;

  nameRenderer(option: T): JSX.Element;

  onChange(index: number): void;
}

export function Select<T>(p: SelectProps<T>) {
  return (
    <select
      class="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
      onChange={(e) =>
        p.onChange(Number.parseInt((e.target as HTMLSelectElement).value))
      }
    >
      <For each={p.options}>
        {(option, i) => (
          <option value={i()} selected={i() === p.selected}>
            {p.nameRenderer(option)}
          </option>
        )}
      </For>
    </select>
  );
}
