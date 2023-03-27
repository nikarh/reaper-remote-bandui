import { BottomNav, Section } from "./Components/BottomNav";
import { createSignal } from "solid-js";
import { Control } from "./Components/Control/Control";
import { Mix } from "./Components/Mix/Mix";
import { ReaperProvider } from "./Data/Context";

const SUBSCRIPTIONS = [
  { request: "TRANSPORT", interval: 2000 },
  { request: "TRACK", interval: 50 },
  { request: "REGION", interval: 4000 },
];

function App() {
  const [section, setSection] = createSignal<Section>(Section.Control);

  return (
    <ReaperProvider interval={50} subscriptions={SUBSCRIPTIONS}>
      <div class="flex flex-col h-screen justify-between">
        <div class="grow overflow-y-scroll">
          {section() == Section.Control && <Control />}
          {section() == Section.Mix && <Mix />}
        </div>

        <BottomNav section={section()} onSelected={setSection} />
      </div>
    </ReaperProvider>
  );
}

export default App;
