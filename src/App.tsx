import { BottomNav, Section } from "./Components/BottomNav";
import { createSignal } from "solid-js";
import { Control } from "./Components/Control/Control";
import { Mix } from "./Components/Mix/Mix";

function App() {
  const [section, setSection] = createSignal<Section>(Section.Control);

  return (
    <div>
      <div class="p-2 mb-16">
        {section() == Section.Control && <Control />}
        {section() == Section.Mix && <Mix />}
      </div>

      <BottomNav section={section()} onSelected={setSection} />
    </div>
  );
}

export default App;
