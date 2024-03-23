import { For, type JSX } from "solid-js";

import "./BottomNavigation.css";

interface BottomNavigationProps<Item> {
  items: [Item, JSX.Element, string][];
  selected: Item;
  onSelect(item: Item): void;
}

export function BottomNavigation<Item>(p: BottomNavigationProps<Item>) {
  return (
    <div class="bottom-navigation">
      <div class="mx-auto h-full max-w-lg grow">
        <div class="grid h-full auto-cols-auto grid-flow-col text-xs">
          <For each={p.items}>
            {(item) => (
              <button
                type="button"
                classList={{ selected: p.selected === item[0] }}
                onClick={() => p.onSelect(item[0])}
              >
                {item[1]}
                <span>{item[2]}</span>
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
