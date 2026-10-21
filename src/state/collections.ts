import { useCallback } from 'react';
import { properties } from '../config';
import { useStoredState } from '../lib/storage';

export const COMPARE_LIMIT = 3;
const knownIds = new Set(properties.map((p) => p.id));

const sanitizeIds = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.filter((v): v is string => typeof v === 'string' && knownIds.has(v)))] : [];

export interface Note {
  text: string;
  updatedAt: string;
}

const sanitizeNotes = (value: unknown): Record<string, Note> => {
  if (!value || typeof value !== 'object') return {};
  const out: Record<string, Note> = {};
  for (const [id, note] of Object.entries(value as Record<string, unknown>)) {
    if (!knownIds.has(id) || !note || typeof note !== 'object') continue;
    const { text, updatedAt } = note as Partial<Note>;
    if (typeof text === 'string' && text.trim()) out[id] = { text: text.slice(0, NOTE_LIMIT), updatedAt: String(updatedAt ?? '') };
  }
  return out;
};

export const NOTE_LIMIT = 2000;
const EMPTY_IDS: string[] = [];
const EMPTY_NOTES: Record<string, Note> = {};

export function useFavorites() {
  const [ids, setIds] = useStoredState('favorites', EMPTY_IDS, sanitizeIds);
  const toggle = useCallback(
    (id: string) => {
      let added = false;
      setIds((prev) => {
        added = !prev.includes(id);
        return added ? [...prev, id] : prev.filter((x) => x !== id);
      });
      return added;
    },
    [setIds],
  );
  return { ids, has: (id: string) => ids.includes(id), toggle, clear: () => setIds([]) };
}

export function useCompare() {
  const [ids, setIds] = useStoredState('compare', EMPTY_IDS, sanitizeIds);
  const toggle = useCallback(
    (id: string): 'added' | 'removed' | 'full' => {
      let result: 'added' | 'removed' | 'full' = 'added';
      setIds((prev) => {
        if (prev.includes(id)) {
          result = 'removed';
          return prev.filter((x) => x !== id);
        }
        if (prev.length >= COMPARE_LIMIT) {
          result = 'full';
          return prev;
        }
        return [...prev, id];
      });
      return result;
    },
    [setIds],
  );
  const remove = useCallback((id: string) => setIds((prev) => prev.filter((x) => x !== id)), [setIds]);
  return { ids, has: (id: string) => ids.includes(id), toggle, remove, clear: () => setIds([]) };
}

export function useNotes() {
  const [notes, setNotes] = useStoredState('notes', EMPTY_NOTES, sanitizeNotes);
  const save = useCallback(
    (id: string, text: string) =>
      setNotes((prev) => {
        const next = { ...prev };
        if (text.trim()) next[id] = { text: text.slice(0, NOTE_LIMIT), updatedAt: new Date().toISOString() };
        else delete next[id];
        return next;
      }),
    [setNotes],
  );
  return { notes, save };
}
