// debounce.ts
// Utilitário de debounce para funções em TypeScript
/* eslint-disable no-unused-vars */

export function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof globalThis.setTimeout>;
  return (..._args: Parameters<T>) => {
    globalThis.clearTimeout?.(timeout as unknown as number);
    timeout = globalThis.setTimeout(() => func(..._args), wait);
  };
}
