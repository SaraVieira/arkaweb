import { useEffect, useState } from "react";
import type { Object3D } from "three";

const registry = new Set<Object3D>();
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function registerOutline(obj: Object3D) {
  registry.add(obj);
  notify();
}

export function unregisterOutline(obj: Object3D) {
  registry.delete(obj);
  notify();
}

export function useOutlineSelection(): Object3D[] {
  const [snapshot, setSnapshot] = useState<Object3D[]>(() =>
    Array.from(registry),
  );
  useEffect(() => {
    const listener = () => setSnapshot(Array.from(registry));
    listeners.add(listener);
    listener();
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return snapshot;
}
