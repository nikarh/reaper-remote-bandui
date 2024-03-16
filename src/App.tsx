import { createSignal } from "solid-js";
import { Section } from "./Components/BottomNav";
import { Control } from "./Components/Control/Control";
import { Mix } from "./Components/Mix/Mix";
import { BottomNavigation } from "./Components/UI/BottomNavigation";
import { Icons } from "./Components/UI/Icons";
import { ReaperProvider } from "./Data/Context";

const SUBSCRIPTIONS = [
  { request: "TRANSPORT", interval: 100 },
  // Query every 100ms for peak levels
  { request: "TRACK", interval: 100 },
  { request: "REGION", interval: 4000 },
  { request: "GET/PROJEXTSTATE/BANDUI/regions", interval: 4000 },
];

function App() {
  const [section, setSection] = createSignal<Section>(Section.Mix);

  return (
    <ReaperProvider interval={50} subscriptions={SUBSCRIPTIONS}>
      <div class="flex flex-col h-full justify-between">
        <div class="grow overflow-y-scroll">
          {section() === Section.Control && <Control />}
          {section() === Section.Mix && <Mix />}
        </div>

        <BottomNavigation
          items={[
            [Section.Mix, <Icons.Mix />, "Mix"],
            [Section.Control, <Icons.Control />, "Control"],
          ]}
          selected={section()}
          onSelect={setSection}
        />
      </div>
    </ReaperProvider>
  );
}

export default App;
