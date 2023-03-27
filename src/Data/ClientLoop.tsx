interface Subscription {
  subscribe(request: string, interval: number): () => void;
  once(request: String, immediate: boolean): void;
  once(request: String): void;
}

export function initializeClient(
  interval: number,
  onReply: (data: string) => void
): [Subscription, () => void] {
  let subscriptions: [string, number, number][] = [];
  let nextCommands: string[] = [];
  let ignoreResult = true;

  async function run() {
    ignoreResult = false;
    let commands = nextCommands.join(";");
    let now = new Date().getTime();
    for (let sub of subscriptions) {
      if (sub[2] < now) {
        sub[2] = now + sub[1];
        commands += `;${sub[0]}`;
      }
    }

    if (commands == "") {
      return;
    }

    // Cleanup next commands to prevent race
    const nextCommandsBackup = nextCommands;
    nextCommands = [];
    try {
      let result = await fetch(`/_/${commands}`);
      let text = await result.text();
      if (!ignoreResult) {
        onReply(text);
      }
    } catch (e) {
      nextCommands = nextCommandsBackup;
      throw e;
    }
  }

  function subscribe(request: string, interval: number) {
    if (request == "") {
      return () => {};
    }

    let subscription: [string, number, number] = [
      request,
      interval,
      new Date().getTime(),
    ];
    subscriptions.push(subscription);
    return () => {
      subscriptions.splice(subscriptions.indexOf(subscription), 1);
    };
  }

  function once(request: string, immediate: boolean = false) {
    nextCommands.push(request);
    if (immediate) {
      ignoreResult = true;
      run().catch((e) => {
        console.log("Request failed", e);
      });
    }
  }

  let intervalRef = setInterval(() => {
    run().catch((e) => {
      console.log("Request failed", e);
    });
  }, interval);

  return [
    {
      once,
      subscribe,
    },
    () => {
      clearInterval(intervalRef);
      ignoreResult = true;
    },
  ];
}
