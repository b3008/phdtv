import type { ComponentType } from 'react';
import { hydrateRoot } from 'react-dom/client';

/** Hydrate every container that <Island name=…> rendered for this component, reading the props serialised after it. */
export function hydrateIslands<P extends object>(name: string, Component: ComponentType<P>): number {
  const containers = document.querySelectorAll<HTMLElement>(`[data-island="${name}"]`);
  for (const container of containers) {
    const script = container.nextElementSibling;
    if (!(script instanceof HTMLScriptElement) || script.dataset['islandProps'] !== name) {
      throw new Error(`island ${name} has no props script next to its container`);
    }
    const props = JSON.parse(script.textContent ?? '{}') as P;
    hydrateRoot(container, <Component {...props} />);
  }
  return containers.length;
}
