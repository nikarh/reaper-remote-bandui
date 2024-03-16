import { type Action, actionsToCommands, reduceActions } from "./Actions";

interface Subscription {
  subscribe(request: string, interval: number): () => void;
  run(action: Action, optimistic: boolean): void;
}

export function initializeClient(
  interval: number,
  onReply: (data: string) => void,
): [Subscription, () => void] {
  let unmount = false;
  let ignoreResults = false;
  let delaySubscriptions: number | undefined = undefined;

  const subscriptions: [string, number, number][] = [];
  let actionQueue: Action[] = [];
  let timer: number | undefined = undefined;

  let promises = Promise.resolve();

  async function runQueue() {
    const command = actionsToCommands(reduceActions(actionQueue));
    actionQueue = [];
    if (command !== "") {
      const result = await fetch(`/_/${command}`);
      const text = await result.text();
      if (!unmount) {
        onReply(text);
        delaySubscriptions = new Date().getTime() + 50;
      }
    }

    ignoreResults = false;
  }

  async function runSubscriptions() {
    let commands = "";
    const now = new Date().getTime();

    if (delaySubscriptions == null || now > delaySubscriptions) {
      delaySubscriptions = undefined;
      for (const sub of subscriptions) {
        if (now > sub[2]) {
          sub[2] = now + sub[1];
          commands += `;${sub[0]}`;
        }
      }
    }

    if (commands !== "") {
      const result = await fetch(`/_/${commands}`);
      const text = await result.text();
      if (!ignoreResults && !unmount) {
        onReply(text);
      }
    }

    if (!unmount) {
      timer = setTimeout(() => {
        promises = promises.then(() =>
          runSubscriptions().catch((e) => {
            console.log("Request failed", e);
          }),
        );
      }, interval);
    }
  }

  function subscribe(request: string, interval: number) {
    if (request === "") {
      return () => {};
    }

    const subscription: [string, number, number] = [
      request,
      interval,
      new Date().getTime(),
    ];
    subscriptions.push(subscription);
    return () => {
      subscriptions.splice(subscriptions.indexOf(subscription), 1);
    };
  }

  function run(action: Action, optimistic: boolean) {
    if (optimistic) {
      ignoreResults = true;
    }

    actionQueue.push(action);
    if (actionQueue.length === 1) {
      promises = promises.then(() =>
        runQueue().catch((e) => {
          console.log("Request failed", e);
        }),
      );
    }
  }

  promises = runSubscriptions().catch((e) => {
    console.log("Request failed", e);
  });

  return [
    {
      run,
      subscribe,
    },
    () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
      ignoreResults = true;
      unmount = true;
    },
  ];
}
