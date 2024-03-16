import type { JSX } from "solid-js";

interface SkeletonProps {
  navigation: JSX.Element;
  children: JSX.Element;
}

export function Skeleton(p: SkeletonProps) {
  return (
    <>
      <nav class="p-2 border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 w-full">
        {p.navigation}
      </nav>
      <div class="p-2 pt-4 w-full flex items-center flex-col">
        <div class="max-w-md w-full">{p.children}</div>
      </div>
    </>
  );
}
