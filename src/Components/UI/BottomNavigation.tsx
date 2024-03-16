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
      <div class="max-w-lg mx-auto grow h-full">
        <div class="grid grid-flow-col auto-cols-auto h-full">
          <For each={p.items}>
            {(item) => (
              <button
                type="button"
                class={p.selected === item[0] ? "selected" : ""}
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
