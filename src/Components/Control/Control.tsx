import { Skeleton } from "../UI/Skeleton";
import { MainControl as Playback } from "./Playback";
import { Regions } from "./Regions";

export function Control() {
  return (
    <Skeleton navigation={<Playback />}>
      <Regions />
    </Skeleton>
  );
}
