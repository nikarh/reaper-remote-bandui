import type { Setter } from "solid-js";
import { Icons } from "./UI/Icons";

export enum Section {
  Control = 0,
  Mix = 1,
}

export function BottomNav(p: {
  section: Section;
  onSelected: Setter<Section>;
}) {
  const selectableClass =
    "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 hover:bg-gray-700 group";
  const selectedClass =
    "inline-flex flex-col items-center justify-center px-5 bg-gray-50 bg-gray-800 group";

  const textSelectableClass =
    "text-gray-500 text-gray-400 group-hover:text-blue-600 group-hover:text-blue-500";
  const textSelectedClass = "text-blue-600 text-blue-500";

  return (
    <div class="h-16 w-full shrink-0 border-gray-600 border-t bg-gray-700">
      <div class="mx-auto grid h-full max-w-lg grid-cols-2">
        <button
          type="button"
          onClick={() => p.onSelected(Section.Mix)}
          class={p.section === Section.Mix ? selectedClass : selectableClass}
        >
          <Icons.Mix
            class={
              p.section === Section.Mix
                ? textSelectedClass
                : textSelectableClass
            }
          />
          <span
            class={`text-sm ${
              p.section === Section.Mix
                ? textSelectedClass
                : textSelectableClass
            }`}
          >
            Mix
          </span>
        </button>
        <button
          type="button"
          onClick={() => p.onSelected(Section.Control)}
          class={
            p.section === Section.Control ? selectedClass : selectableClass
          }
        >
          <Icons.Control
            class={
              p.section === Section.Control
                ? textSelectedClass
                : textSelectableClass
            }
          />
          <span
            class={`text-sm ${
              p.section === Section.Control
                ? textSelectedClass
                : textSelectableClass
            }`}
          >
            Control
          </span>
        </button>
      </div>
    </div>
  );
}
