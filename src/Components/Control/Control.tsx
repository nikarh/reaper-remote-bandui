import { MainControl, State } from "./MainControl";
import { Region, Regions } from "./Regions";

const regions: Region[] = [
  { name: "Song1" },
  { name: "SOng2" }
];

export function Control() {
  return (
    <div class="mt-2 flex flex-col items-center">
      <div class="p-4">
        <MainControl state={State.Playing} />
      </div>
      <Regions regions={regions} />
    </div>
  );
}
