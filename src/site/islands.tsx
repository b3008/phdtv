import type { ComponentType } from 'react';
import type { IslandName } from './assets.ts';

interface IslandProps<P extends object> {
  name: IslandName;
  component: ComponentType<P>;
  props: P;
}

/** JSON that is safe as the text of a <script> element: no `<`, so `</script>` cannot occur. */
export function serializeProps(props: object): string {
  return JSON.stringify(props).replace(/</g, '\\u003c');
}

/**
 * Server side of a hydrated component. The component renders inside a marked container (that markup is the
 * no-script fallback) and its props follow as JSON, where `hydrateIslands` in the client entry finds them.
 */
export function Island<P extends object>({ name, component: Component, props }: IslandProps<P>) {
  return (
    <>
      <div data-island={name}>
        <Component {...props} />
      </div>
      <script type="application/json" data-island-props={name} dangerouslySetInnerHTML={{ __html: serializeProps(props) }} />
    </>
  );
}
