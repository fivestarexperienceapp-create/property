import { useSyncExternalStore } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
  tone?: 'default' | 'success' | 'warning';
}

let toasts: ToastMessage[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());

export function toast(text: string, tone: ToastMessage['tone'] = 'default') {
  const id = nextId++;
  toasts = [...toasts.slice(-2), { id, text, tone }];
  emit();
  window.setTimeout(() => dismissToast(id), 3800);
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function useToasts() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => toasts,
    () => toasts,
  );
}
