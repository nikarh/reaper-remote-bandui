import { For } from "solid-js";
import { Track } from "../../Data/State";
import { Select } from "../UI/Select";

interface OutputSelectorProps {
  tracks: Track[];
  selected: number;
  onSelected: (id: number) => void;
}

export function OutputSelector(p: OutputSelectorProps) {
  return (
    <Select
      options={p.tracks}
      selected={p.selected}
      onChange={p.onSelected}
      nameRenderer={(t) => t.name}
    />
  );
}
