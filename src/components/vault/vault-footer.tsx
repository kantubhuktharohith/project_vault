import { useEffect, useState } from "react";

export function VaultFooter({ count }: { count: number }) {
  const [time, setTime] = useState<string>("--:--:--");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour12: false }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer className="mt-16 border-t border-border pt-6 pb-10 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          <span className="text-primary-dim">$</span> {count} project{count === 1 ? "" : "s"} in vault
        </span>
        <span className="tabular-nums text-primary-dim">
          local_time :: {time}
          <span className="animate-blink ml-1 text-primary">_</span>
        </span>
      </div>
    </footer>
  );
}
