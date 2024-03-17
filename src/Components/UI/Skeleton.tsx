import type { JSX } from "solid-js";

interface SkeletonProps {
  navigation: JSX.Element;
  children: JSX.Element;
}

export function Skeleton(p: SkeletonProps) {
  return (
    <>
      <nav class="w-full border-gray-700 bg-gray-800 p-2">{p.navigation}</nav>
      <div class="flex w-full flex-col items-center p-2 pt-4">
        <div class="w-full max-w-md">{p.children}</div>
      </div>
    </>
  );
}
