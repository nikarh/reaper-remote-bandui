import { For, JSX } from "solid-js";

interface SelectProps<T> {
  options: T[];
  selected: number;

  nameRenderer(option: T): JSX.Element;

  onChange(index: number): void;
}

export function Select<T>(p: SelectProps<T>) {
  return (
    <select
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      onChange={(e) =>
        p.onChange(parseInt((e.target as HTMLSelectElement).value))
      }
    >
      <For each={p.options}>
        {(option, i) => (
          <option value={i()} selected={i() == p.selected}>
            {p.nameRenderer(option)}
          </option>
        )}
      </For>
    </select>
  );
}
