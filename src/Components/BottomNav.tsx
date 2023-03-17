import { Setter } from "solid-js";

export enum Section {
  Control,
  Mix,
}

export function BottomNav(p: {
  section: Section;
  onSelected: Setter<Section>;
}) {
  const selectableClass =
    "inline-flex flex-col items-center justify-center px-5 hover:bg-gray-100 dark:hover:bg-gray-700 group";
  const selectedClass =
    "inline-flex flex-col items-center justify-center px-5 bg-gray-50 dark:bg-gray-800 group";

  const textSelectableClass =
    "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500";
  const textSelectedClass = "text-blue-600 text-blue-500";

  return (
    <div class="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
      <div class="grid h-full max-w-lg grid-cols-2 mx-auto">
        <button
          type="button"
          onClick={() => p.onSelected(Section.Control)}
          class={p.section == Section.Control ? selectedClass : selectableClass}
        >
          <svg
            class={`w-6 h-6 mb-1 ${
              p.section == Section.Control
                ? textSelectedClass
                : textSelectableClass
            }`}
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811z"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
          <span
            class={`text-sm  ${
              p.section == Section.Control
                ? textSelectedClass
                : textSelectableClass
            }`}
          >
            Control
          </span>
        </button>
        <button
          type="button"
          onClick={() => p.onSelected(Section.Mix)}
          class={p.section == Section.Mix ? selectedClass : selectableClass}
        >
          <svg
            class={`w-6 h-6 mb-1 ${
              p.section == Section.Mix
                ? textSelectedClass
                : textSelectableClass
            }`}
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>

          <span
            class={`text-sm  ${
              p.section == Section.Mix ? textSelectedClass : textSelectableClass
            }`}
          >
            Mix
          </span>
        </button>
      </div>
    </div>
  );
}
