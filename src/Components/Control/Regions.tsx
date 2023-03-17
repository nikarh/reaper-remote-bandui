import { For } from "solid-js";

export interface Region {
    name: string;
}

export function Regions(p: { regions: Region[] }) {
    return (
        <div class="max-w-md w-full">
            <h2>
                <button type="button" class="flex items-center justify-between w-full p-5 font-medium text-left text-gray-500 border border-b-0 border-gray-200 rounded-t-xl dark:border-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
                    <span>Move to region</span>
                </button>
            </h2>
            <div class="rounded-b-xl p-4 font-light border border-gray-200 dark:border-gray-700 dark:bg-gray-900 flex flex-col">
                <For each={p.regions}>
                    {(region) => (
                        <button type="button" class="m-1 py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                            {region.name}
                        </button>
                    )}
                </For>
            </div>
        </div>
    );
}