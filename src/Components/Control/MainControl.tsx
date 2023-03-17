import { State } from "~/ReaperFetcher";

export function MainControl(p: { state: State }) {

    let selectableClasses =
        "text-gray-900 bg-white border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white";
    let selectedClasses =
        "bg-gray-200 text-blue-800 dark:text-white dark:bg-gray-500";

    return (
        <div>
            <div class="flex justify-center rounded-md shadow-sm" role="group">
                <button
                    type="button"
                    class={`px-4 py-2 text-sm font-medium rounded-l ${p.state == State.Playing ? selectedClasses : selectableClasses}`}
                >
                    <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    Play
                </button>
                <button
                    type="button"
                    class={`px-4 py-2 text-sm font-medium ${p.state == State.Paused ? selectedClasses : selectableClasses}`}
                >
                    <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.75 5.25v13.5m-7.5-13.5v13.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    Pause
                </button>
                <button
                    type="button"
                    class={`px-4 py-2 text-sm font-medium rounded-r ${p.state == State.Stopped ? selectedClasses : selectableClasses}`}
                >
                    <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    Stop
                </button>
            </div>
        </div>
    )
}